import "server-only"

import type Stripe from "stripe"

import { getCheckoutIdentityRuntimeDisposition } from "@/lib/commerce/checkout-reconciliation-policy"
import { isUuid } from "@/lib/relationships/request"
import {
  getCheckoutCatalog,
  getStripe,
  isExpectedCatalogPrice,
  isLiftCheckoutCommerceMetadata,
  isProductId,
  isServiceInvoiceCommerceMetadata,
  LIFT_CHECKOUT_COMMERCE_FLOW,
  type DeploymentTarget,
  type ProductId,
} from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/server"

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>
type StripeClient = NonNullable<ReturnType<typeof getStripe>>

type CheckoutIdentity = {
  catalogVersion: string
  commerceFlow: typeof LIFT_CHECKOUT_COMMERCE_FLOW | null
  deploymentTarget: DeploymentTarget
  orderId: string
  priceId: string
  productType: ProductId
  stripeAccountId: string
  stripeMode: "live" | "test"
  stripeProductId: string
  userId: string
}

type CheckoutOrder = {
  catalog_version: string
  deployment_target: DeploymentTarget
  fulfilled_at: string | null
  fulfillment_source: FulfillmentSource | null
  id: string
  product_type: ProductId
  status: string
  stripe_account_id: string
  stripe_checkout_session_id: string | null
  stripe_livemode: boolean
  stripe_payment_intent_id: string | null
  stripe_price_id: string
  stripe_product_id: string
  user_id: string
}

type PurchaseStatus = "active" | "cancelled" | "disputed" | "refunded"

type PurchaseRecord = {
  catalog_version: string
  deployment_target: DeploymentTarget
  id: string
  product_type: ProductId
  status: PurchaseStatus
  stripe_account_id: string
  stripe_checkout_session_id: string | null
  stripe_livemode: boolean
  stripe_payment_intent_id: string
  stripe_price_id: string
  stripe_product_id: string
  user_id: string
}

export type FulfillmentSource =
  "authenticated_reconciliation" | "scheduled_reconciliation" | "webhook"

export type CompletedCheckoutExpectation = {
  catalogVersion?: string
  deploymentTarget?: DeploymentTarget
  orderId?: string
  priceId?: string
  productType?: ProductId
  stripeProductId?: string
  userId?: string
}

function hasCompleteReconciliationExpectation(
  expectation: CompletedCheckoutExpectation
) {
  return Boolean(
    typeof expectation.catalogVersion === "string" &&
    expectation.catalogVersion &&
    (expectation.deploymentTarget === "development" ||
      expectation.deploymentTarget === "preview" ||
      expectation.deploymentTarget === "production") &&
    isUuid(expectation.orderId) &&
    typeof expectation.priceId === "string" &&
    expectation.priceId &&
    isProductId(expectation.productType) &&
    typeof expectation.stripeProductId === "string" &&
    expectation.stripeProductId &&
    isUuid(expectation.userId)
  )
}

export type CompletedCheckoutResult =
  | { purchaseStatus: "active"; state: "already_active" | "fulfilled" }
  | { purchaseStatus: null; state: "ignored" }
  | {
      purchaseStatus: "cancelled" | "disputed" | "refunded"
      state: "terminal"
    }

function customerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
) {
  return typeof customer === "string" ? customer : (customer?.id ?? null)
}

function paymentIntentId(paymentIntent: string | Stripe.PaymentIntent | null) {
  return typeof paymentIntent === "string"
    ? paymentIntent
    : (paymentIntent?.id ?? null)
}

function chargeId(charge: string | Stripe.Charge) {
  return typeof charge === "string" ? charge : charge.id
}

function expandedPaymentIntent(
  paymentIntent: string | Stripe.PaymentIntent | null
) {
  return typeof paymentIntent === "object" && paymentIntent
    ? paymentIntent
    : null
}

function expandedCharge(charge: string | Stripe.Charge | null) {
  return typeof charge === "object" && charge ? charge : null
}

function getCheckoutIdentity(
  metadata: Stripe.Metadata | null
): CheckoutIdentity {
  const catalogVersion = metadata?.catalog_version
  const commerceFlow = metadata?.commerce_flow
  const deploymentTarget = metadata?.deployment_target
  const orderId = metadata?.checkout_order_id
  const priceId = metadata?.price_id
  const productType = metadata?.product_type
  const stripeAccountId = metadata?.stripe_account_id
  const stripeMode = metadata?.stripe_mode
  const stripeProductId = metadata?.stripe_product_id
  const userId = metadata?.user_id

  if (
    !isLiftCheckoutCommerceMetadata(metadata) ||
    typeof catalogVersion !== "string" ||
    (deploymentTarget !== "development" &&
      deploymentTarget !== "preview" &&
      deploymentTarget !== "production") ||
    !isUuid(orderId) ||
    typeof priceId !== "string" ||
    !isProductId(productType) ||
    typeof stripeAccountId !== "string" ||
    (stripeMode !== "live" && stripeMode !== "test") ||
    typeof stripeProductId !== "string" ||
    !isUuid(userId)
  ) {
    throw new Error("Checkout metadata is incomplete.")
  }

  return {
    catalogVersion,
    commerceFlow:
      commerceFlow === LIFT_CHECKOUT_COMMERCE_FLOW
        ? LIFT_CHECKOUT_COMMERCE_FLOW
        : null,
    deploymentTarget,
    orderId,
    priceId,
    productType,
    stripeAccountId,
    stripeMode,
    stripeProductId,
    userId,
  }
}

function assertLaunchIdentity(identity: CheckoutIdentity) {
  const catalog = getCheckoutCatalog(identity.catalogVersion)
  if (!catalog || catalog.productId !== identity.productType) {
    throw new Error("Checkout metadata is not enabled for this launch.")
  }
}

function assertExpectedIdentity(
  identity: CheckoutIdentity,
  expectation: CompletedCheckoutExpectation
) {
  if (
    (expectation.catalogVersion !== undefined &&
      identity.catalogVersion !== expectation.catalogVersion) ||
    (expectation.deploymentTarget !== undefined &&
      identity.deploymentTarget !== expectation.deploymentTarget) ||
    (expectation.orderId !== undefined &&
      identity.orderId !== expectation.orderId) ||
    (expectation.priceId !== undefined &&
      identity.priceId !== expectation.priceId) ||
    (expectation.productType !== undefined &&
      identity.productType !== expectation.productType) ||
    (expectation.stripeProductId !== undefined &&
      identity.stripeProductId !== expectation.stripeProductId) ||
    (expectation.userId !== undefined && identity.userId !== expectation.userId)
  ) {
    throw new Error("Checkout identity did not match the required authority.")
  }
}

async function getAuthorizedOrder(
  supabase: AdminClient,
  identity: CheckoutIdentity,
  stripeLivemode: boolean
) {
  const { data, error } = await supabase
    .from("checkout_orders")
    .select(
      "catalog_version, deployment_target, fulfilled_at, fulfillment_source, id, product_type, status, stripe_account_id, stripe_checkout_session_id, stripe_livemode, stripe_payment_intent_id, stripe_price_id, stripe_product_id, user_id"
    )
    .eq("id", identity.orderId)
    .eq("user_id", identity.userId)
    .eq("product_type", identity.productType)
    .eq("catalog_version", identity.catalogVersion)
    .eq("deployment_target", identity.deploymentTarget)
    .eq("stripe_price_id", identity.priceId)
    .eq("stripe_product_id", identity.stripeProductId)
    .eq("stripe_account_id", identity.stripeAccountId)
    .eq("stripe_livemode", stripeLivemode)
    .maybeSingle<CheckoutOrder>()

  if (error || !data) {
    throw new Error("Checkout order authority is missing.")
  }

  return data
}

async function requireProfile(supabase: AdminClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle()

  if (error || !data) {
    throw new Error("Checkout member profile is missing.")
  }
}

async function saveStripeCustomer(
  supabase: AdminClient,
  identity: CheckoutIdentity,
  stripeLivemode: boolean,
  stripeCustomerId: string | null
) {
  if (!stripeCustomerId) return

  const { error } = await supabase.from("stripe_customers").upsert(
    {
      deployment_target: identity.deploymentTarget,
      stripe_account_id: identity.stripeAccountId,
      stripe_customer_id: stripeCustomerId,
      stripe_livemode: stripeLivemode,
      user_id: identity.userId,
    },
    {
      onConflict: "user_id,deployment_target,stripe_account_id,stripe_livemode",
    }
  )
  if (error) throw error
}

function assertMatchingPaymentIntent(
  paymentIntent: Stripe.PaymentIntent,
  identity: CheckoutIdentity,
  stripeLivemode: boolean
) {
  const paymentIdentity = getCheckoutIdentity(paymentIntent.metadata)

  if (
    paymentIntent.livemode !== stripeLivemode ||
    paymentIntent.status !== "succeeded" ||
    paymentIdentity.catalogVersion !== identity.catalogVersion ||
    paymentIdentity.commerceFlow !== identity.commerceFlow ||
    paymentIdentity.deploymentTarget !== identity.deploymentTarget ||
    paymentIdentity.orderId !== identity.orderId ||
    paymentIdentity.priceId !== identity.priceId ||
    paymentIdentity.productType !== identity.productType ||
    paymentIdentity.stripeAccountId !== identity.stripeAccountId ||
    paymentIdentity.stripeMode !== identity.stripeMode ||
    paymentIdentity.stripeProductId !== identity.stripeProductId ||
    paymentIdentity.userId !== identity.userId
  ) {
    throw new Error("Checkout payment identity did not match the order.")
  }
}

const PURCHASE_FIELDS =
  "catalog_version, deployment_target, id, product_type, status, stripe_account_id, stripe_checkout_session_id, stripe_livemode, stripe_payment_intent_id, stripe_price_id, stripe_product_id, user_id"

async function findPurchase(
  supabase: AdminClient,
  identity: CheckoutIdentity,
  stripeLivemode: boolean,
  sessionId: string,
  paymentIntentIdValue: string
) {
  for (const [column, value] of [
    ["stripe_payment_intent_id", paymentIntentIdValue],
    ["stripe_checkout_session_id", sessionId],
  ] as const) {
    const { data, error } = await supabase
      .from("purchases")
      .select(PURCHASE_FIELDS)
      .eq(column, value)
      .eq("deployment_target", identity.deploymentTarget)
      .eq("stripe_account_id", identity.stripeAccountId)
      .eq("stripe_livemode", stripeLivemode)
      .maybeSingle<PurchaseRecord>()
    if (error) throw error
    if (data) return data
  }

  return null
}

function assertMatchingPurchase(
  purchase: PurchaseRecord,
  identity: CheckoutIdentity,
  stripeLivemode: boolean,
  sessionId: string,
  paymentIntentIdValue: string
) {
  if (
    purchase.user_id !== identity.userId ||
    purchase.product_type !== identity.productType ||
    purchase.catalog_version !== identity.catalogVersion ||
    purchase.deployment_target !== identity.deploymentTarget ||
    purchase.stripe_account_id !== identity.stripeAccountId ||
    purchase.stripe_livemode !== stripeLivemode ||
    purchase.stripe_product_id !== identity.stripeProductId ||
    purchase.stripe_price_id !== identity.priceId ||
    (purchase.stripe_checkout_session_id !== null &&
      purchase.stripe_checkout_session_id !== sessionId) ||
    purchase.stripe_payment_intent_id !== paymentIntentIdValue
  ) {
    throw new Error("Existing purchase authority is inconsistent.")
  }
}

async function setOrderPaymentState(
  supabase: AdminClient,
  order: CheckoutOrder,
  identity: CheckoutIdentity,
  stripeLivemode: boolean,
  sessionId: string,
  paymentIntentIdValue: string,
  purchaseStatus: PurchaseStatus
) {
  const orderStatus =
    purchaseStatus === "active" || purchaseStatus === "cancelled"
      ? "paid"
      : purchaseStatus === "refunded"
        ? "refunded"
        : "disputed"

  let update = supabase
    .from("checkout_orders")
    .update({
      status: orderStatus,
      stripe_checkout_session_id: sessionId,
      stripe_payment_intent_id: paymentIntentIdValue,
    })
    .eq("id", order.id)
    .eq("user_id", identity.userId)
    .eq("deployment_target", identity.deploymentTarget)
    .eq("stripe_account_id", identity.stripeAccountId)
    .eq("stripe_livemode", stripeLivemode)

  if (purchaseStatus === "active") {
    update = update.in("status", ["creating", "open", "paid"])
  } else if (purchaseStatus === "cancelled") {
    update = update.in("status", ["creating", "open", "paid"])
  } else if (purchaseStatus === "disputed") {
    update = update.neq("status", "refunded")
  }

  const { error } = await update.select("id").maybeSingle()
  if (error) throw error
}

function expectedOrderStatus(purchaseStatus: PurchaseStatus) {
  if (purchaseStatus === "active" || purchaseStatus === "cancelled") {
    return "paid"
  }
  return purchaseStatus
}

async function recordFulfillmentProvenance(
  supabase: AdminClient,
  order: CheckoutOrder,
  identity: CheckoutIdentity,
  stripeLivemode: boolean,
  source: FulfillmentSource,
  sessionId: string,
  paymentIntentIdValue: string,
  purchaseStatus: PurchaseStatus
) {
  const { error } = await supabase
    .from("checkout_orders")
    .update({
      fulfilled_at: new Date().toISOString(),
      fulfillment_source: source,
    })
    .eq("id", order.id)
    .eq("user_id", identity.userId)
    .eq("deployment_target", identity.deploymentTarget)
    .eq("stripe_account_id", identity.stripeAccountId)
    .eq("stripe_livemode", stripeLivemode)
    .eq("status", expectedOrderStatus(purchaseStatus))
    .eq("stripe_checkout_session_id", sessionId)
    .eq("stripe_payment_intent_id", paymentIntentIdValue)
    .is("fulfillment_source", null)
    .select("id")
    .maybeSingle()
  if (error) throw error
}

async function requireFinalFulfillmentState(
  supabase: AdminClient,
  identity: CheckoutIdentity,
  stripeLivemode: boolean,
  sessionId: string,
  paymentIntentIdValue: string,
  purchaseStatus: PurchaseStatus
) {
  const finalOrder = await getAuthorizedOrder(
    supabase,
    identity,
    stripeLivemode
  )
  const fulfilledAt = finalOrder.fulfilled_at

  if (
    finalOrder.status !== expectedOrderStatus(purchaseStatus) ||
    finalOrder.stripe_checkout_session_id !== sessionId ||
    finalOrder.stripe_payment_intent_id !== paymentIntentIdValue ||
    (finalOrder.fulfillment_source !== "webhook" &&
      finalOrder.fulfillment_source !== "authenticated_reconciliation" &&
      finalOrder.fulfillment_source !== "scheduled_reconciliation") ||
    typeof fulfilledAt !== "string" ||
    !Number.isFinite(new Date(fulfilledAt).getTime())
  ) {
    throw new Error("Checkout order did not reach its verified final state.")
  }
}

export async function fulfillCompletedCheckout({
  deploymentTarget,
  expectation = {},
  sessionId,
  source,
  stripe,
  stripeAccountId,
  stripeLivemode,
  supabase,
}: {
  deploymentTarget: DeploymentTarget
  expectation?: CompletedCheckoutExpectation
  sessionId: string
  source: FulfillmentSource
  stripe: StripeClient
  stripeAccountId: string
  stripeLivemode: boolean
  supabase: AdminClient
}): Promise<CompletedCheckoutResult> {
  if (
    source !== "webhook" &&
    !hasCompleteReconciliationExpectation(expectation)
  ) {
    throw new Error(
      "Checkout reconciliation requires a complete expected identity."
    )
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price.product", "payment_intent.latest_charge"],
  })
  if (isServiceInvoiceCommerceMetadata(session.metadata)) {
    if (source === "webhook") {
      return { purchaseStatus: null, state: "ignored" }
    }
    throw new Error("Checkout Session belongs to a different commerce flow.")
  }
  const identity = getCheckoutIdentity(session.metadata)
  assertExpectedIdentity(identity, expectation)

  const namespaceDisposition = getCheckoutIdentityRuntimeDisposition(identity, {
    deploymentTarget,
    stripeAccountId,
    stripeLivemode,
  })
  if (namespaceDisposition === "invalid") {
    throw new Error("Checkout Session account or mode was inconsistent.")
  }
  if (namespaceDisposition === "foreign_target") {
    if (source === "webhook") {
      return { purchaseStatus: null, state: "ignored" }
    }
    throw new Error("Checkout Session did not match this runtime namespace.")
  }
  assertLaunchIdentity(identity)

  if (
    session.client_reference_id !== identity.userId ||
    identity.stripeMode !== (stripeLivemode ? "live" : "test")
  ) {
    throw new Error("Checkout Session ownership or mode did not match.")
  }

  const order = await getAuthorizedOrder(supabase, identity, stripeLivemode)
  if (order.status === "expired" || order.status === "failed") {
    throw new Error("Checkout order is terminally closed for fulfillment.")
  }
  if (
    order.status !== "creating" &&
    order.status !== "open" &&
    order.status !== "paid" &&
    order.status !== "refunded" &&
    order.status !== "disputed"
  ) {
    throw new Error("Checkout order state is invalid for fulfillment.")
  }
  const catalog = getCheckoutCatalog(identity.catalogVersion)
  const lineItems = session.line_items?.data ?? []
  const lineItem = lineItems[0]
  const linePrice = lineItem?.price
  const paymentIntent = expandedPaymentIntent(session.payment_intent)

  if (
    !catalog ||
    catalog.productId !== identity.productType ||
    identity.stripeAccountId !== stripeAccountId ||
    session.livemode !== stripeLivemode ||
    session.mode !== catalog.mode ||
    session.status !== "complete" ||
    session.payment_status !== "paid" ||
    lineItems.length !== 1 ||
    lineItem.quantity !== 1 ||
    !linePrice ||
    linePrice.id !== identity.priceId ||
    !isExpectedCatalogPrice(
      identity.catalogVersion,
      linePrice,
      identity.priceId,
      identity.stripeProductId
    ) ||
    lineItem.amount_total !== catalog.expectedUnitAmount ||
    session.amount_total !== catalog.expectedUnitAmount ||
    session.currency !== catalog.expectedCurrency ||
    !paymentIntent
  ) {
    throw new Error("Checkout fulfillment verification failed.")
  }

  assertMatchingPaymentIntent(paymentIntent, identity, stripeLivemode)
  if (
    paymentIntent.amount_received !== catalog.expectedUnitAmount ||
    paymentIntent.currency !== catalog.expectedCurrency
  ) {
    throw new Error("Checkout payment amount did not match the catalog.")
  }

  const charge = expandedCharge(paymentIntent.latest_charge)
  const chargePaymentIntentId = charge
    ? paymentIntentId(charge.payment_intent)
    : null
  if (
    !charge ||
    charge.livemode !== stripeLivemode ||
    chargePaymentIntentId !== paymentIntent.id ||
    !charge.paid ||
    charge.status !== "succeeded" ||
    charge.amount !== catalog.expectedUnitAmount ||
    charge.currency !== catalog.expectedCurrency
  ) {
    throw new Error("Checkout charge could not be verified.")
  }

  if (
    order.stripe_checkout_session_id &&
    order.stripe_checkout_session_id !== session.id
  ) {
    throw new Error("Checkout Session did not match its reserved order.")
  }
  if (
    order.stripe_payment_intent_id &&
    order.stripe_payment_intent_id !== paymentIntent.id
  ) {
    throw new Error("PaymentIntent did not match its reserved order.")
  }

  const existingPurchase = await findPurchase(
    supabase,
    identity,
    stripeLivemode,
    session.id,
    paymentIntent.id
  )
  if (existingPurchase) {
    assertMatchingPurchase(
      existingPurchase,
      identity,
      stripeLivemode,
      session.id,
      paymentIntent.id
    )
  }

  const fullyRefunded =
    charge.refunded || charge.amount_refunded >= charge.amount
  const providerTerminalStatus: "disputed" | "refunded" | null = fullyRefunded
    ? "refunded"
    : charge.disputed
      ? "disputed"
      : null
  const terminalStatus =
    order.status === "refunded" ||
    existingPurchase?.status === "refunded" ||
    providerTerminalStatus === "refunded"
      ? "refunded"
      : order.status === "disputed" ||
          existingPurchase?.status === "disputed" ||
          providerTerminalStatus === "disputed"
        ? "disputed"
        : null
  const purchaseValues = {
    amount_paid: (session.amount_total ?? 0) / 100,
    catalog_version: identity.catalogVersion,
    currency: session.currency,
    deployment_target: identity.deploymentTarget,
    product_type: identity.productType,
    status: terminalStatus ?? "active",
    stripe_account_id: identity.stripeAccountId,
    stripe_checkout_session_id: session.id,
    stripe_livemode: stripeLivemode,
    stripe_payment_intent_id: paymentIntent.id,
    stripe_price_id: identity.priceId,
    stripe_product_id: identity.stripeProductId,
    user_id: identity.userId,
  }
  let insertedActivePurchase = false
  const preparedNonTerminalStatus: PurchaseStatus =
    existingPurchase?.status === "cancelled" ? "cancelled" : "active"

  // Customer mapping is useful bookkeeping for active payments, but it must
  // never stand between a verified provider terminal state and entitlement
  // revocation. Existing checkout orders already carry a profile foreign key;
  // terminal tombstones can therefore be written safely without this auxiliary
  // upsert. A cancelled tombstone is likewise already fail-closed.
  if (!terminalStatus && existingPurchase?.status !== "cancelled") {
    await requireProfile(supabase, identity.userId)
    await saveStripeCustomer(
      supabase,
      identity,
      stripeLivemode,
      customerId(session.customer)
    )
  }

  // Active entitlement is the final write. First bind the paid order and its
  // first-writer provenance, then re-read that exact state. A failed/zero-row
  // order transition therefore leaves no active purchase for protected routes
  // to trust. Terminal tombstones remain safe to materialize first because
  // they revoke rather than grant access.
  if (!terminalStatus) {
    await setOrderPaymentState(
      supabase,
      order,
      identity,
      stripeLivemode,
      session.id,
      paymentIntent.id,
      preparedNonTerminalStatus
    )
    await recordFulfillmentProvenance(
      supabase,
      order,
      identity,
      stripeLivemode,
      source,
      session.id,
      paymentIntent.id,
      preparedNonTerminalStatus
    )
    await requireFinalFulfillmentState(
      supabase,
      identity,
      stripeLivemode,
      session.id,
      paymentIntent.id,
      preparedNonTerminalStatus
    )
  }

  if (terminalStatus === "refunded") {
    const { error } = await supabase.from("purchases").upsert(purchaseValues, {
      onConflict:
        "stripe_payment_intent_id,deployment_target,stripe_account_id,stripe_livemode",
    })
    if (error) throw error
  } else if (terminalStatus === "disputed") {
    const markDisputedUnlessRefunded = () =>
      supabase
        .from("purchases")
        .update(purchaseValues)
        .eq("stripe_payment_intent_id", paymentIntent.id)
        .eq("deployment_target", identity.deploymentTarget)
        .eq("stripe_account_id", identity.stripeAccountId)
        .eq("stripe_livemode", stripeLivemode)
        .neq("status", "refunded")
        .select("id")

    const existingDispute = await markDisputedUnlessRefunded()
    if (existingDispute.error) throw existingDispute.error
    if (!existingDispute.data?.length) {
      const { error: insertError } = await supabase
        .from("purchases")
        .insert(purchaseValues)
      if (insertError?.code === "23505") {
        const racedDispute = await markDisputedUnlessRefunded()
        if (racedDispute.error) throw racedDispute.error
      } else if (insertError) {
        throw insertError
      }
    }
  } else if (!existingPurchase) {
    // Refunds, disputes, and cancellations are terminal for fulfillment. An
    // ordinary completion creates entitlement only after the order and
    // provenance are verified, and never overwrites a tombstone written by an
    // earlier or concurrently processed revocation.
    const { error } = await supabase.from("purchases").insert(purchaseValues)
    if (error && error.code !== "23505") throw error
    insertedActivePurchase = !error
  } else if (existingPurchase.status === "cancelled") {
    const { error } = await supabase
      .from("purchases")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", existingPurchase.id)
      .eq("deployment_target", identity.deploymentTarget)
      .eq("stripe_account_id", identity.stripeAccountId)
      .eq("stripe_livemode", stripeLivemode)
      .eq("status", "cancelled")
    if (error) throw error
  }

  const finalPurchase = await findPurchase(
    supabase,
    identity,
    stripeLivemode,
    session.id,
    paymentIntent.id
  )
  if (!finalPurchase) {
    throw new Error("Checkout purchase could not be materialized.")
  }
  assertMatchingPurchase(
    finalPurchase,
    identity,
    stripeLivemode,
    session.id,
    paymentIntent.id
  )

  if (terminalStatus || finalPurchase.status !== preparedNonTerminalStatus) {
    await setOrderPaymentState(
      supabase,
      order,
      identity,
      stripeLivemode,
      session.id,
      paymentIntent.id,
      finalPurchase.status
    )
    await recordFulfillmentProvenance(
      supabase,
      order,
      identity,
      stripeLivemode,
      source,
      session.id,
      paymentIntent.id,
      finalPurchase.status
    )
    await requireFinalFulfillmentState(
      supabase,
      identity,
      stripeLivemode,
      session.id,
      paymentIntent.id,
      finalPurchase.status
    )
  }

  if (finalPurchase.status !== "active") {
    return { purchaseStatus: finalPurchase.status, state: "terminal" }
  }

  return {
    purchaseStatus: "active",
    state: insertedActivePurchase ? "fulfilled" : "already_active",
  }
}

export async function reconcileFullRefund(
  stripe: StripeClient,
  supabase: AdminClient,
  eventCharge: Stripe.Charge,
  deploymentTarget: DeploymentTarget,
  stripeAccountId: string,
  stripeLivemode: boolean,
  retrievedPaymentIntent?: Stripe.PaymentIntent
) {
  if (!eventCharge.refunded) return "processed" as const

  const id = paymentIntentId(eventCharge.payment_intent)
  if (!id) throw new Error("Refunded charge is missing its payment identity.")

  // Always retrieve the PaymentIntent before a write. Development and Preview
  // can share one Stripe sandbox account, so each endpoint receives the other
  // target's account-level events and must acknowledge them without mutating
  // its own ledger.
  const paymentIntent =
    retrievedPaymentIntent ??
    (await stripe.paymentIntents.retrieve(id, {
      expand: ["latest_charge"],
    }))
  if (paymentIntent.id !== id) {
    throw new Error("Refunded charge payment identity was inconsistent.")
  }
  if (isServiceInvoiceCommerceMetadata(paymentIntent.metadata)) {
    return "ignored_foreign" as const
  }
  if (!isLiftCheckoutCommerceMetadata(paymentIntent.metadata)) {
    return "processed" as const
  }

  const identity = getCheckoutIdentity(paymentIntent.metadata)
  const namespaceDisposition = getCheckoutIdentityRuntimeDisposition(identity, {
    deploymentTarget,
    stripeAccountId,
    stripeLivemode,
  })
  if (namespaceDisposition === "invalid") {
    throw new Error("Refunded charge account or mode was inconsistent.")
  }
  if (namespaceDisposition === "foreign_target") {
    return "ignored_foreign" as const
  }
  assertLaunchIdentity(identity)
  const order = await getAuthorizedOrder(supabase, identity, stripeLivemode)
  assertMatchingPaymentIntent(paymentIntent, identity, stripeLivemode)

  const catalog = getCheckoutCatalog(identity.catalogVersion)
  const charge = expandedCharge(paymentIntent.latest_charge)
  if (
    !catalog ||
    !charge ||
    charge.id !== eventCharge.id ||
    charge.livemode !== stripeLivemode ||
    !charge.refunded ||
    charge.amount_refunded < charge.amount ||
    charge.amount !== catalog.expectedUnitAmount ||
    charge.currency !== catalog.expectedCurrency
  ) {
    throw new Error("Refunded charge could not be reconciled.")
  }

  await requireProfile(supabase, identity.userId)
  // Stripe doesn't guarantee event order. Upserting the verified tombstone
  // both revokes an existing entitlement and creates a terminal record when a
  // refund arrives before checkout.session.completed. Refunded always wins.
  const { error: purchaseError } = await supabase.from("purchases").upsert(
    {
      amount_paid: charge.amount / 100,
      catalog_version: identity.catalogVersion,
      currency: charge.currency,
      deployment_target: identity.deploymentTarget,
      product_type: identity.productType,
      status: "refunded",
      stripe_account_id: identity.stripeAccountId,
      stripe_checkout_session_id: order.stripe_checkout_session_id,
      stripe_livemode: stripeLivemode,
      stripe_payment_intent_id: paymentIntent.id,
      stripe_price_id: identity.priceId,
      stripe_product_id: identity.stripeProductId,
      user_id: identity.userId,
    },
    {
      onConflict:
        "stripe_payment_intent_id,deployment_target,stripe_account_id,stripe_livemode",
    }
  )
  if (purchaseError) throw purchaseError

  const { error: orderError } = await supabase
    .from("checkout_orders")
    .update({
      status: "refunded",
      stripe_payment_intent_id: paymentIntent.id,
    })
    .eq("id", order.id)
    .eq("user_id", identity.userId)
    .eq("deployment_target", identity.deploymentTarget)
    .eq("stripe_account_id", identity.stripeAccountId)
    .eq("stripe_livemode", stripeLivemode)
  if (orderError) throw orderError

  return "processed" as const
}

export async function revokeDisputedCharge(
  stripe: StripeClient,
  supabase: AdminClient,
  eventDispute: Stripe.Dispute,
  deploymentTarget: DeploymentTarget,
  stripeAccountId: string,
  stripeLivemode: boolean,
  retrievedPaymentIntent?: Stripe.PaymentIntent
) {
  const id = paymentIntentId(eventDispute.payment_intent)
  const disputedChargeId = chargeId(eventDispute.charge)
  if (!id || !disputedChargeId) {
    throw new Error("Dispute is missing its payment identity.")
  }

  const paymentIntent =
    retrievedPaymentIntent ??
    (await stripe.paymentIntents.retrieve(id, {
      expand: ["latest_charge"],
    }))
  if (paymentIntent.id !== id) {
    throw new Error("Dispute payment identity was inconsistent.")
  }
  if (isServiceInvoiceCommerceMetadata(paymentIntent.metadata)) {
    return "ignored_foreign" as const
  }
  if (!isLiftCheckoutCommerceMetadata(paymentIntent.metadata)) {
    return "processed" as const
  }

  const identity = getCheckoutIdentity(paymentIntent.metadata)
  const namespaceDisposition = getCheckoutIdentityRuntimeDisposition(identity, {
    deploymentTarget,
    stripeAccountId,
    stripeLivemode,
  })
  if (namespaceDisposition === "invalid") {
    throw new Error("Dispute account or mode was inconsistent.")
  }
  if (namespaceDisposition === "foreign_target") {
    return "ignored_foreign" as const
  }
  assertLaunchIdentity(identity)
  const order = await getAuthorizedOrder(supabase, identity, stripeLivemode)
  assertMatchingPaymentIntent(paymentIntent, identity, stripeLivemode)

  const catalog = getCheckoutCatalog(identity.catalogVersion)
  const charge = expandedCharge(paymentIntent.latest_charge)
  if (
    !catalog ||
    eventDispute.livemode !== stripeLivemode ||
    eventDispute.amount <= 0 ||
    eventDispute.amount > catalog.expectedUnitAmount ||
    eventDispute.currency !== catalog.expectedCurrency ||
    !charge ||
    charge.id !== disputedChargeId ||
    charge.livemode !== stripeLivemode ||
    paymentIntentId(charge.payment_intent) !== paymentIntent.id ||
    !charge.disputed ||
    !charge.paid ||
    charge.status !== "succeeded" ||
    charge.amount !== catalog.expectedUnitAmount ||
    charge.currency !== catalog.expectedCurrency
  ) {
    throw new Error("Disputed charge could not be verified.")
  }

  await requireProfile(supabase, identity.userId)
  const purchaseValues = {
    amount_paid: charge.amount / 100,
    catalog_version: identity.catalogVersion,
    currency: charge.currency,
    deployment_target: identity.deploymentTarget,
    product_type: identity.productType,
    status: "disputed",
    stripe_account_id: identity.stripeAccountId,
    stripe_checkout_session_id: order.stripe_checkout_session_id,
    stripe_livemode: stripeLivemode,
    stripe_payment_intent_id: paymentIntent.id,
    stripe_price_id: identity.priceId,
    stripe_product_id: identity.stripeProductId,
    user_id: identity.userId,
  }

  const revokeExistingPurchase = () =>
    supabase
      .from("purchases")
      .update({ status: "disputed" })
      .eq("stripe_payment_intent_id", paymentIntent.id)
      .eq("deployment_target", identity.deploymentTarget)
      .eq("stripe_account_id", identity.stripeAccountId)
      .eq("stripe_livemode", stripeLivemode)
      .neq("status", "refunded")
      .select("id")

  const existingPurchase = await revokeExistingPurchase()
  if (existingPurchase.error) throw existingPurchase.error

  if (!existingPurchase.data?.length) {
    const { error: insertError } = await supabase
      .from("purchases")
      .insert(purchaseValues)
    if (insertError?.code === "23505") {
      const racedPurchase = await revokeExistingPurchase()
      if (racedPurchase.error) throw racedPurchase.error
    } else if (insertError) {
      throw insertError
    }
  }

  const { data: finalPurchase, error: finalPurchaseError } = await supabase
    .from("purchases")
    .select("status")
    .eq("stripe_payment_intent_id", paymentIntent.id)
    .eq("deployment_target", identity.deploymentTarget)
    .eq("stripe_account_id", identity.stripeAccountId)
    .eq("stripe_livemode", stripeLivemode)
    .single<{ status: PurchaseStatus }>()
  if (finalPurchaseError) throw finalPurchaseError

  let orderUpdate = supabase
    .from("checkout_orders")
    .update({
      status: finalPurchase.status === "refunded" ? "refunded" : "disputed",
      stripe_payment_intent_id: paymentIntent.id,
    })
    .eq("id", order.id)
    .eq("user_id", identity.userId)
    .eq("deployment_target", identity.deploymentTarget)
    .eq("stripe_account_id", identity.stripeAccountId)
    .eq("stripe_livemode", stripeLivemode)

  if (finalPurchase.status !== "refunded") {
    orderUpdate = orderUpdate.neq("status", "refunded")
  }

  const { error: orderError } = await orderUpdate
  if (orderError) throw orderError

  return "processed" as const
}

export async function markCheckoutExpired(
  supabase: AdminClient,
  session: Stripe.Checkout.Session,
  deploymentTarget: DeploymentTarget,
  stripeAccountId: string,
  stripeLivemode: boolean
) {
  if (isServiceInvoiceCommerceMetadata(session.metadata)) {
    return "ignored_foreign" as const
  }
  if (!isLiftCheckoutCommerceMetadata(session.metadata)) {
    return "processed" as const
  }

  const identity = getCheckoutIdentity(session.metadata)
  const namespaceDisposition = getCheckoutIdentityRuntimeDisposition(identity, {
    deploymentTarget,
    stripeAccountId,
    stripeLivemode,
  })
  if (namespaceDisposition === "invalid") {
    throw new Error("Expired Session account or mode was inconsistent.")
  }
  if (namespaceDisposition === "foreign_target") {
    return "ignored_foreign" as const
  }
  assertLaunchIdentity(identity)
  const catalog = getCheckoutCatalog(identity.catalogVersion)
  if (
    !catalog ||
    session.client_reference_id !== identity.userId ||
    session.livemode !== stripeLivemode ||
    session.mode !== catalog.mode ||
    session.status !== "expired"
  ) {
    throw new Error("Expired Session did not match its verified identity.")
  }
  const order = await getAuthorizedOrder(supabase, identity, stripeLivemode)
  if (
    order.stripe_checkout_session_id !== null &&
    order.stripe_checkout_session_id !== session.id
  ) {
    throw new Error("Expired Session did not match its reserved order.")
  }

  let update = supabase
    .from("checkout_orders")
    .update({ status: "expired", stripe_checkout_session_id: session.id })
    .eq("id", identity.orderId)
    .eq("user_id", identity.userId)
    .eq("deployment_target", identity.deploymentTarget)
    .eq("stripe_account_id", identity.stripeAccountId)
    .eq("stripe_livemode", stripeLivemode)
    .in("status", ["creating", "open"])

  update = order.stripe_checkout_session_id
    ? update.eq("stripe_checkout_session_id", session.id)
    : update.is("stripe_checkout_session_id", null)

  const { error } = await update.select("id").maybeSingle()
  if (error) throw error

  const finalOrder = await getAuthorizedOrder(
    supabase,
    identity,
    stripeLivemode
  )
  if (finalOrder.stripe_checkout_session_id !== session.id) {
    throw new Error("Expired Session did not remain bound to its order.")
  }
  if (
    finalOrder.status !== "expired" &&
    finalOrder.status !== "paid" &&
    finalOrder.status !== "refunded" &&
    finalOrder.status !== "disputed"
  ) {
    throw new Error("Expired Session did not reach a safe final order state.")
  }

  return "processed" as const
}
