import "server-only"

import { randomUUID, timingSafeEqual } from "node:crypto"

import type Stripe from "stripe"

import { isUuid } from "@/lib/relationships/request"
import {
  fulfillCompletedCheckout,
  markCheckoutExpired,
} from "@/lib/commerce/stripe-fulfillment"
import { isCheckoutSessionId } from "@/lib/commerce/checkout-reconciliation-policy"
import {
  COMMERCE_APPLICATION,
  getCheckoutCatalog,
  getCommerceDeploymentTarget,
  getExpectedStripeAccountId,
  getExpectedStripeLivemode,
  getStripe,
  isExpectedStripeAccount,
  isProductId,
  isStripeModeConfigured,
  type DeploymentTarget,
  type ProductId,
} from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/server"

export const SCHEDULED_RECONCILIATION_DEADLINE_MS = 45_000
export const SCHEDULED_RECONCILIATION_MAX_CLAIMS = 10
const SCHEDULED_RECONCILIATION_LEASE_SECONDS = 120

const CLAIM_RPC = "claim_due_checkout_reconciliations"
const FINISH_RPC = "finish_checkout_reconciliation_claim"
const REPORT_RPC = "report_due_checkout_reconciliations"
const SCHEDULED_RECONCILIATION_REPORT_BATCH_SIZE = 100
const STRIPE_ACCOUNT_ID_PATTERN = /^acct_[a-zA-Z0-9]{8,}$/
const STRIPE_PAYMENT_INTENT_ID_PATTERN = /^pi_[a-zA-Z0-9_]{8,}$/
const STRIPE_PRICE_ID_PATTERN = /^price_[a-zA-Z0-9]{8,}$/
const STRIPE_PRODUCT_ID_PATTERN = /^prod_[a-zA-Z0-9]{8,}$/

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>
type StripeClient = NonNullable<ReturnType<typeof getStripe>>

type CheckoutOrderStatus =
  "creating" | "disputed" | "expired" | "failed" | "open" | "paid" | "refunded"

type ReconciliationClaim = {
  catalogVersion: string
  claimNumber: number
  claimToken: string
  deploymentTarget: DeploymentTarget
  expiresAt: string
  orderId: string
  orderStatus: CheckoutOrderStatus
  productType: ProductId
  stripeAccountId: string
  stripeCheckoutSessionId: string
  stripeLivemode: boolean
  stripePaymentIntentId: string | null
  stripePriceId: string
  stripeProductId: string
  userId: string
}

type FinishOutcome =
  | "fulfilled"
  | "inconsistent"
  | "manual_review"
  | "not_ready"
  | "retryable_error"
  | "terminal"
  | "verified_active"

type FinishErrorCode =
  | "checkout_expiration_failed"
  | "checkout_fulfillment_failed"
  | "checkout_identity_inconsistent"
  | "checkout_session_retrieve_failed"
  | "claim_namespace_inconsistent"
  | "missing_checkout_session"
  | "worker_deadline"

type ReconciliationFailureStage =
  "account_verification" | "claim_rpc" | "finish_rpc" | "report_rpc" | "worker"

type ReconciliationFailureCategory =
  "invalid_response" | "provider_error" | "rpc_error" | "unexpected_error"

class ScheduledReconciliationFailure extends Error {
  readonly stage: ReconciliationFailureStage
  readonly category: ReconciliationFailureCategory

  constructor(
    stage: ReconciliationFailureStage,
    category: ReconciliationFailureCategory,
    message: string
  ) {
    super(message)
    this.name = "ScheduledReconciliationFailure"
    this.stage = stage
    this.category = category
  }
}

export type ScheduledReconciliationSummary = {
  alertsPending: number
  claimed: number
  deadlineReached: boolean
  fulfilled: number
  manualReview: number
  notReady: number
  reported: number
  retryScheduled: number
  runId: string
  terminal: number
  verifiedActive: number
}

export type ScheduledReconciliationResult =
  | { kind: "completed"; summary: ScheduledReconciliationSummary }
  | { kind: "unavailable" }

type ScheduledReconciliationDependencies = {
  createAdminClient: () => AdminClient | null
  fulfillCompletedCheckout: typeof fulfillCompletedCheckout
  getCommerceDeploymentTarget: typeof getCommerceDeploymentTarget
  getExpectedStripeAccountId: typeof getExpectedStripeAccountId
  getExpectedStripeLivemode: typeof getExpectedStripeLivemode
  getStripe: typeof getStripe
  isExpectedStripeAccount: typeof isExpectedStripeAccount
  isStripeModeConfigured: typeof isStripeModeConfigured
  markCheckoutExpired: typeof markCheckoutExpired
  now: () => number
  randomUUID: () => string
}

const DEFAULT_DEPENDENCIES: ScheduledReconciliationDependencies = {
  createAdminClient,
  fulfillCompletedCheckout,
  getCommerceDeploymentTarget,
  getExpectedStripeAccountId,
  getExpectedStripeLivemode,
  getStripe,
  isExpectedStripeAccount,
  isStripeModeConfigured,
  markCheckoutExpired,
  now: Date.now,
  randomUUID,
}

function logScheduledReconciliationFailure(error: unknown) {
  const failure = error instanceof ScheduledReconciliationFailure ? error : null

  // Keep runtime diagnostics operationally useful without serializing the
  // exception, RPC payloads, provider identifiers, or customer information.
  console.error(
    JSON.stringify({
      category: failure?.category ?? "unexpected_error",
      event: "scheduled_commerce_reconciliation_failed",
      level: "error",
      stage: failure?.stage ?? "worker",
    })
  )
}

export function cronSecretsMatch(value: string, expected: string) {
  const valueBuffer = Buffer.from(value)
  const expectedBuffer = Buffer.from(expected)

  return (
    valueBuffer.length === expectedBuffer.length &&
    timingSafeEqual(valueBuffer, expectedBuffer)
  )
}

export function hasAuthorizedCronBearer(
  authorization: string | null,
  expectedSecret: string
) {
  const suppliedSecret = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : ""

  return Boolean(
    suppliedSecret && cronSecretsMatch(suppliedSecret, expectedSecret)
  )
}

function isCheckoutOrderStatus(value: unknown): value is CheckoutOrderStatus {
  return (
    value === "creating" ||
    value === "open" ||
    value === "paid" ||
    value === "refunded" ||
    value === "disputed" ||
    value === "expired" ||
    value === "failed"
  )
}

function isReconciliationJobState(value: unknown) {
  return (
    value === "pending" ||
    value === "leased" ||
    value === "retry_wait" ||
    value === "monitoring" ||
    value === "complete" ||
    value === "manual_review"
  )
}

function isNullableDate(value: unknown) {
  return (
    value === null ||
    (typeof value === "string" && Number.isFinite(new Date(value).getTime()))
  )
}

function isValidReportRow(
  value: unknown,
  deploymentTarget: DeploymentTarget,
  stripeAccountId: string,
  stripeLivemode: boolean
) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false

  const row = value as Record<string, unknown>

  return Boolean(
    isUuid(row.order_id) &&
    isUuid(row.user_id) &&
    isProductId(row.product_type) &&
    typeof row.catalog_version === "string" &&
    row.catalog_version &&
    isCheckoutSessionId(row.stripe_checkout_session_id) &&
    (row.stripe_payment_intent_id === null ||
      (typeof row.stripe_payment_intent_id === "string" &&
        STRIPE_PAYMENT_INTENT_ID_PATTERN.test(row.stripe_payment_intent_id))) &&
    typeof row.stripe_product_id === "string" &&
    STRIPE_PRODUCT_ID_PATTERN.test(row.stripe_product_id) &&
    typeof row.stripe_price_id === "string" &&
    STRIPE_PRICE_ID_PATTERN.test(row.stripe_price_id) &&
    row.deployment_target === deploymentTarget &&
    typeof row.stripe_account_id === "string" &&
    STRIPE_ACCOUNT_ID_PATTERN.test(row.stripe_account_id) &&
    row.stripe_account_id === stripeAccountId &&
    row.stripe_livemode === stripeLivemode &&
    isCheckoutOrderStatus(row.order_status) &&
    isReconciliationJobState(row.job_state) &&
    Number.isSafeInteger(row.claim_count) &&
    Number(row.claim_count) >= 0 &&
    Number.isSafeInteger(row.consecutive_failure_count) &&
    Number(row.consecutive_failure_count) >= 0 &&
    Number(row.consecutive_failure_count) <= 8 &&
    isNullableDate(row.next_attempt_at) &&
    isNullableDate(row.lease_expires_at) &&
    typeof row.alert_pending === "boolean" &&
    (row.manual_review_reason === null ||
      typeof row.manual_review_reason === "string")
  )
}

function parseClaim(value: unknown): ReconciliationClaim | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null

  const claim = value as Record<string, unknown>
  const expiresAt = claim.expires_at
  const expiresAtMs =
    typeof expiresAt === "string" ? new Date(expiresAt).getTime() : Number.NaN

  if (
    !isUuid(claim.order_id) ||
    !isUuid(claim.claim_token) ||
    !Number.isSafeInteger(claim.claim_number) ||
    Number(claim.claim_number) < 1 ||
    !isUuid(claim.user_id) ||
    !isProductId(claim.product_type) ||
    typeof claim.catalog_version !== "string" ||
    !claim.catalog_version ||
    !isCheckoutSessionId(claim.stripe_checkout_session_id) ||
    (claim.stripe_payment_intent_id !== null &&
      (typeof claim.stripe_payment_intent_id !== "string" ||
        !STRIPE_PAYMENT_INTENT_ID_PATTERN.test(
          claim.stripe_payment_intent_id
        ))) ||
    typeof claim.stripe_product_id !== "string" ||
    !STRIPE_PRODUCT_ID_PATTERN.test(claim.stripe_product_id) ||
    typeof claim.stripe_price_id !== "string" ||
    !STRIPE_PRICE_ID_PATTERN.test(claim.stripe_price_id) ||
    (claim.deployment_target !== "development" &&
      claim.deployment_target !== "preview" &&
      claim.deployment_target !== "production") ||
    typeof claim.stripe_account_id !== "string" ||
    !STRIPE_ACCOUNT_ID_PATTERN.test(claim.stripe_account_id) ||
    typeof claim.stripe_livemode !== "boolean" ||
    !isCheckoutOrderStatus(claim.order_status) ||
    !Number.isFinite(expiresAtMs)
  ) {
    return null
  }

  return {
    catalogVersion: claim.catalog_version,
    claimNumber: Number(claim.claim_number),
    claimToken: claim.claim_token,
    deploymentTarget: claim.deployment_target,
    expiresAt: expiresAt as string,
    orderId: claim.order_id,
    orderStatus: claim.order_status,
    productType: claim.product_type,
    stripeAccountId: claim.stripe_account_id,
    stripeCheckoutSessionId: claim.stripe_checkout_session_id,
    stripeLivemode: claim.stripe_livemode,
    stripePaymentIntentId: claim.stripe_payment_intent_id,
    stripePriceId: claim.stripe_price_id,
    stripeProductId: claim.stripe_product_id,
    userId: claim.user_id,
  }
}

function getPaymentIntentId(
  paymentIntent: string | Stripe.PaymentIntent | null
) {
  return typeof paymentIntent === "string"
    ? paymentIntent
    : (paymentIntent?.id ?? null)
}

function getProductId(product: Stripe.Price["product"]) {
  return typeof product === "string" ? product : product.id
}

function sessionMatchesClaim(
  session: Stripe.Checkout.Session,
  claim: ReconciliationClaim
) {
  const catalog = getCheckoutCatalog(claim.catalogVersion)
  const metadata = session.metadata
  const lineItems = session.line_items?.data ?? []
  const lineItem = lineItems[0]
  const linePrice = lineItem?.price
  const paymentIntentId = getPaymentIntentId(session.payment_intent)
  const expectedExpiresAt = Math.floor(
    new Date(claim.expiresAt).getTime() / 1_000
  )

  return Boolean(
    catalog &&
    catalog.productId === claim.productType &&
    session.id === claim.stripeCheckoutSessionId &&
    session.client_reference_id === claim.userId &&
    session.livemode === claim.stripeLivemode &&
    session.mode === catalog.mode &&
    session.expires_at === expectedExpiresAt &&
    metadata?.application === COMMERCE_APPLICATION &&
    metadata.checkout_order_id === claim.orderId &&
    metadata.user_id === claim.userId &&
    metadata.product_type === claim.productType &&
    metadata.catalog_version === claim.catalogVersion &&
    metadata.deployment_target === claim.deploymentTarget &&
    metadata.stripe_account_id === claim.stripeAccountId &&
    metadata.stripe_mode === (claim.stripeLivemode ? "live" : "test") &&
    metadata.stripe_product_id === claim.stripeProductId &&
    metadata.price_id === claim.stripePriceId &&
    (claim.stripePaymentIntentId === null ||
      claim.stripePaymentIntentId === paymentIntentId) &&
    lineItems.length === 1 &&
    lineItem.quantity === 1 &&
    lineItem.amount_total === catalog.expectedUnitAmount &&
    linePrice &&
    linePrice.id === claim.stripePriceId &&
    linePrice.livemode === claim.stripeLivemode &&
    getProductId(linePrice.product) === claim.stripeProductId &&
    linePrice.currency === catalog.expectedCurrency &&
    linePrice.unit_amount === catalog.expectedUnitAmount &&
    linePrice.type === catalog.expectedPriceType &&
    linePrice.recurring === null &&
    session.amount_total === catalog.expectedUnitAmount &&
    session.currency === catalog.expectedCurrency
  )
}

function claimMatchesNamespace(
  claim: ReconciliationClaim,
  deploymentTarget: DeploymentTarget,
  stripeAccountId: string,
  stripeLivemode: boolean
) {
  return (
    claim.deploymentTarget === deploymentTarget &&
    claim.stripeAccountId === stripeAccountId &&
    claim.stripeLivemode === stripeLivemode
  )
}

async function claimDueOrders(
  supabase: AdminClient,
  deploymentTarget: DeploymentTarget,
  stripeAccountId: string,
  stripeLivemode: boolean,
  runId: string,
  batchSize: number
) {
  let data: unknown = null
  let error: unknown = null
  try {
    ;({ data, error } = await supabase.rpc(CLAIM_RPC, {
      p_batch_size: batchSize,
      p_deployment_target: deploymentTarget,
      p_lease_seconds: SCHEDULED_RECONCILIATION_LEASE_SECONDS,
      p_run_id: runId,
      p_stripe_account_id: stripeAccountId,
      p_stripe_livemode: stripeLivemode,
    }))
  } catch {
    throw new ScheduledReconciliationFailure(
      "claim_rpc",
      "rpc_error",
      "Scheduled reconciliation claims could not be leased."
    )
  }
  if (error) {
    throw new ScheduledReconciliationFailure(
      "claim_rpc",
      "rpc_error",
      "Scheduled reconciliation claims could not be leased."
    )
  }
  if (!Array.isArray(data)) {
    throw new ScheduledReconciliationFailure(
      "claim_rpc",
      "invalid_response",
      "Scheduled reconciliation claims could not be leased."
    )
  }

  const claims = data.map(parseClaim)
  if (claims.some((claim) => !claim)) {
    throw new ScheduledReconciliationFailure(
      "claim_rpc",
      "invalid_response",
      "Scheduled reconciliation returned an invalid claim."
    )
  }

  return claims as ReconciliationClaim[]
}

async function reportDueOrders(
  supabase: AdminClient,
  deploymentTarget: DeploymentTarget,
  stripeAccountId: string,
  stripeLivemode: boolean,
  runId: string
) {
  let data: unknown = null
  let error: unknown = null
  try {
    ;({ data, error } = await supabase.rpc(REPORT_RPC, {
      p_batch_size: SCHEDULED_RECONCILIATION_REPORT_BATCH_SIZE,
      p_deployment_target: deploymentTarget,
      p_run_id: runId,
      p_stripe_account_id: stripeAccountId,
      p_stripe_livemode: stripeLivemode,
    }))
  } catch {
    throw new ScheduledReconciliationFailure(
      "report_rpc",
      "rpc_error",
      "Scheduled reconciliation report could not be recorded."
    )
  }
  if (error) {
    throw new ScheduledReconciliationFailure(
      "report_rpc",
      "rpc_error",
      "Scheduled reconciliation report could not be recorded."
    )
  }
  if (!Array.isArray(data)) {
    throw new ScheduledReconciliationFailure(
      "report_rpc",
      "invalid_response",
      "Scheduled reconciliation report could not be recorded."
    )
  }
  if (
    data.some(
      (row) =>
        !isValidReportRow(
          row,
          deploymentTarget,
          stripeAccountId,
          stripeLivemode
        )
    )
  ) {
    throw new ScheduledReconciliationFailure(
      "report_rpc",
      "invalid_response",
      "Scheduled reconciliation returned an invalid report."
    )
  }

  return {
    alertsPending: data.filter(
      (row) => (row as Record<string, unknown>).alert_pending === true
    ).length,
    reported: data.length,
  }
}

async function finishClaim(
  supabase: AdminClient,
  claim: ReconciliationClaim,
  outcome: FinishOutcome,
  errorCode: FinishErrorCode | null = null
) {
  let data: unknown = null
  let error: unknown = null
  try {
    ;({ data, error } = await supabase.rpc(FINISH_RPC, {
      p_claim_token: claim.claimToken,
      p_error_code: errorCode,
      p_order_id: claim.orderId,
      p_outcome: outcome,
    }))
  } catch {
    throw new ScheduledReconciliationFailure(
      "finish_rpc",
      "rpc_error",
      "Scheduled reconciliation claim could not be finished."
    )
  }

  if (error) {
    throw new ScheduledReconciliationFailure(
      "finish_rpc",
      "rpc_error",
      "Scheduled reconciliation claim could not be finished."
    )
  }
  if (data !== true) {
    throw new ScheduledReconciliationFailure(
      "finish_rpc",
      "invalid_response",
      "Scheduled reconciliation claim could not be finished."
    )
  }
}

function countOutcome(
  summary: ScheduledReconciliationSummary,
  outcome: FinishOutcome
) {
  if (outcome === "fulfilled") summary.fulfilled += 1
  else if (outcome === "verified_active") summary.verifiedActive += 1
  else if (outcome === "terminal") summary.terminal += 1
  else if (outcome === "not_ready") summary.notReady += 1
  else if (outcome === "retryable_error") summary.retryScheduled += 1
  else summary.manualReview += 1
}

async function finishAndCount(
  supabase: AdminClient,
  claim: ReconciliationClaim,
  summary: ScheduledReconciliationSummary,
  outcome: FinishOutcome,
  errorCode: FinishErrorCode | null = null
) {
  await finishClaim(supabase, claim, outcome, errorCode)
  countOutcome(summary, outcome)
}

async function processClaim({
  claim,
  deploymentTarget,
  stripe,
  stripeAccountId,
  stripeLivemode,
  summary,
  supabase,
  dependencies,
}: {
  claim: ReconciliationClaim
  deploymentTarget: DeploymentTarget
  stripe: StripeClient
  stripeAccountId: string
  stripeLivemode: boolean
  summary: ScheduledReconciliationSummary
  supabase: AdminClient
  dependencies: ScheduledReconciliationDependencies
}) {
  if (
    !claimMatchesNamespace(
      claim,
      deploymentTarget,
      stripeAccountId,
      stripeLivemode
    )
  ) {
    await finishAndCount(
      supabase,
      claim,
      summary,
      "inconsistent",
      "claim_namespace_inconsistent"
    )
    return
  }

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(
      claim.stripeCheckoutSessionId,
      {
        expand: [
          "line_items.data.price.product",
          "payment_intent.latest_charge",
        ],
      }
    )
  } catch {
    await finishAndCount(
      supabase,
      claim,
      summary,
      "retryable_error",
      "checkout_session_retrieve_failed"
    )
    return
  }

  if (!sessionMatchesClaim(session, claim)) {
    await finishAndCount(
      supabase,
      claim,
      summary,
      "inconsistent",
      "checkout_identity_inconsistent"
    )
    return
  }

  if (session.status === "open") {
    await finishAndCount(
      supabase,
      claim,
      summary,
      claim.orderStatus === "creating" || claim.orderStatus === "open"
        ? "not_ready"
        : "inconsistent",
      claim.orderStatus === "creating" || claim.orderStatus === "open"
        ? null
        : "checkout_identity_inconsistent"
    )
    return
  }

  if (session.status === "expired") {
    if (claim.orderStatus === "expired") {
      await finishAndCount(supabase, claim, summary, "terminal")
      return
    }
    if (claim.orderStatus !== "creating" && claim.orderStatus !== "open") {
      await finishAndCount(
        supabase,
        claim,
        summary,
        "inconsistent",
        "checkout_identity_inconsistent"
      )
      return
    }
    try {
      await dependencies.markCheckoutExpired(
        supabase,
        session,
        deploymentTarget,
        stripeAccountId,
        stripeLivemode
      )
    } catch {
      await finishAndCount(
        supabase,
        claim,
        summary,
        "retryable_error",
        "checkout_expiration_failed"
      )
      return
    }
    await finishAndCount(supabase, claim, summary, "terminal")
    return
  }

  if (session.status !== "complete") {
    await finishAndCount(
      supabase,
      claim,
      summary,
      "inconsistent",
      "checkout_identity_inconsistent"
    )
    return
  }

  if (claim.orderStatus === "expired" || claim.orderStatus === "failed") {
    await finishAndCount(
      supabase,
      claim,
      summary,
      "inconsistent",
      "checkout_identity_inconsistent"
    )
    return
  }

  let result: Awaited<ReturnType<typeof fulfillCompletedCheckout>>
  try {
    result = await dependencies.fulfillCompletedCheckout({
      deploymentTarget,
      expectation: {
        catalogVersion: claim.catalogVersion,
        deploymentTarget: claim.deploymentTarget,
        orderId: claim.orderId,
        priceId: claim.stripePriceId,
        productType: claim.productType,
        stripeProductId: claim.stripeProductId,
        userId: claim.userId,
      },
      sessionId: claim.stripeCheckoutSessionId,
      source: "scheduled_reconciliation",
      stripe,
      stripeAccountId,
      stripeLivemode,
      supabase,
    })
  } catch {
    await finishAndCount(
      supabase,
      claim,
      summary,
      "retryable_error",
      "checkout_fulfillment_failed"
    )
    return
  }

  if (result.state === "fulfilled") {
    await finishAndCount(supabase, claim, summary, "fulfilled")
  } else if (result.state === "already_active") {
    await finishAndCount(supabase, claim, summary, "verified_active")
  } else if (result.state === "terminal") {
    await finishAndCount(supabase, claim, summary, "terminal")
  } else {
    await finishAndCount(
      supabase,
      claim,
      summary,
      "inconsistent",
      "checkout_identity_inconsistent"
    )
  }
}

export async function runScheduledCommerceReconciliation({
  dependencies: injectedDependencies = {},
  maximumClaims = SCHEDULED_RECONCILIATION_MAX_CLAIMS,
  timeBudgetMs = SCHEDULED_RECONCILIATION_DEADLINE_MS,
}: {
  dependencies?: Partial<ScheduledReconciliationDependencies>
  maximumClaims?: number
  timeBudgetMs?: number
} = {}): Promise<ScheduledReconciliationResult> {
  const dependencies = {
    ...DEFAULT_DEPENDENCIES,
    ...injectedDependencies,
  }
  const requestedBudget = Number.isFinite(timeBudgetMs)
    ? timeBudgetMs
    : SCHEDULED_RECONCILIATION_DEADLINE_MS
  const deadlineAt =
    dependencies.now() +
    Math.max(0, Math.min(SCHEDULED_RECONCILIATION_DEADLINE_MS, requestedBudget))
  const deploymentTarget = dependencies.getCommerceDeploymentTarget()
  const stripeAccountId = dependencies.getExpectedStripeAccountId()
  const stripeLivemode = dependencies.getExpectedStripeLivemode()
  const stripe = dependencies.getStripe()
  const supabase = dependencies.createAdminClient()

  if (
    !dependencies.isStripeModeConfigured() ||
    !deploymentTarget ||
    !stripeAccountId ||
    stripeLivemode === null ||
    !stripe ||
    !supabase
  ) {
    return { kind: "unavailable" }
  }

  try {
    if (!(await dependencies.isExpectedStripeAccount(stripe))) {
      return { kind: "unavailable" }
    }
  } catch (error) {
    logScheduledReconciliationFailure(
      error instanceof ScheduledReconciliationFailure
        ? error
        : new ScheduledReconciliationFailure(
            "account_verification",
            "provider_error",
            "Scheduled reconciliation account verification failed."
          )
    )
    return { kind: "unavailable" }
  }

  const requestedMaximum = Number.isSafeInteger(maximumClaims)
    ? maximumClaims
    : SCHEDULED_RECONCILIATION_MAX_CLAIMS
  const batchSize = Math.max(
    1,
    Math.min(SCHEDULED_RECONCILIATION_MAX_CLAIMS, requestedMaximum)
  )
  const runId = dependencies.randomUUID()
  const summary: ScheduledReconciliationSummary = {
    alertsPending: 0,
    claimed: 0,
    deadlineReached: false,
    fulfilled: 0,
    manualReview: 0,
    notReady: 0,
    reported: 0,
    retryScheduled: 0,
    runId,
    terminal: 0,
    verifiedActive: 0,
  }

  try {
    const report = await reportDueOrders(
      supabase,
      deploymentTarget,
      stripeAccountId,
      stripeLivemode,
      runId
    )
    summary.alertsPending = report.alertsPending
    summary.reported = report.reported

    if (dependencies.now() >= deadlineAt) {
      summary.deadlineReached = true
      return { kind: "completed", summary }
    }

    const claims = await claimDueOrders(
      supabase,
      deploymentTarget,
      stripeAccountId,
      stripeLivemode,
      runId,
      batchSize
    )
    summary.claimed = claims.length

    for (const claim of claims) {
      if (dependencies.now() >= deadlineAt) {
        summary.deadlineReached = true
        await finishAndCount(
          supabase,
          claim,
          summary,
          "retryable_error",
          "worker_deadline"
        )
        continue
      }

      await processClaim({
        claim,
        dependencies,
        deploymentTarget,
        stripe,
        stripeAccountId,
        stripeLivemode,
        summary,
        supabase,
      })
    }

    return { kind: "completed", summary }
  } catch (error) {
    logScheduledReconciliationFailure(error)
    return { kind: "unavailable" }
  }
}

type ReconciliationRunner = () => Promise<ScheduledReconciliationResult>

function scheduledJsonResponse(body: object, status = 200) {
  return Response.json(body, {
    headers: { "Cache-Control": "no-store" },
    status,
  })
}

export async function handleCommerceReconciliationCron(
  request: Request,
  run: ReconciliationRunner = runScheduledCommerceReconciliation
) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || cronSecret.length < 32) {
    return scheduledJsonResponse(
      { error: "Scheduled commerce reconciliation is not configured." },
      503
    )
  }

  if (
    !hasAuthorizedCronBearer(request.headers.get("authorization"), cronSecret)
  ) {
    return scheduledJsonResponse({ error: "Unauthorized." }, 401)
  }

  const result = await run()
  if (result.kind === "unavailable") {
    return scheduledJsonResponse(
      { error: "Scheduled commerce reconciliation is unavailable." },
      503
    )
  }

  return scheduledJsonResponse(result.summary)
}
