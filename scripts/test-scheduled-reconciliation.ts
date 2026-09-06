import assert from "node:assert/strict"
import test from "node:test"

import {
  cronSecretsMatch,
  handleCommerceReconciliationCron,
  hasAuthorizedCronBearer,
  runScheduledCommerceReconciliation,
} from "../lib/commerce/scheduled-reconciliation.ts"
import {
  commerceRecoveryAlertIdempotencyKey,
  sendCommerceRecoveryAlert,
  type CommerceRecoveryAlertInput,
  type CommerceRecoveryAlertResult,
} from "../lib/commerce/reconciliation-alert.ts"

const ORDER_ID = "11111111-1111-4111-8111-111111111111"
const CLAIM_TOKEN = "22222222-2222-4222-8222-222222222222"
const USER_ID = "33333333-3333-4333-8333-333333333333"
const RUN_ID = "44444444-4444-4444-8444-444444444444"
const ACCOUNT_ID = "acct_abcdefgh"
const PRODUCT_ID = "prod_abcdefgh"
const PRICE_ID = "price_abcdefgh"
const SESSION_ID = "cs_test_abcdefghijklmnop"
const PAYMENT_INTENT_ID = "pi_test_abcdefghijklmnop"
const EXPIRES_AT = "2026-08-30T00:00:00.000Z"
const CRON_SECRET = "0123456789abcdef0123456789abcdef"
const ALERT_CONFIGURATION = {
  apiKey: "re_fixture_commerce_alert_key",
  from: "HWL by SMD <hello@hwlbysmd.com>",
  to: "commerce-operator@example.com",
}
const PRIVATE_FAILURE_DETAIL =
  "provider secret should stay hidden for customer@example.com"

type ReconciliationRpcName =
  | "claim_due_checkout_reconciliations"
  | "finish_checkout_reconciliation_claim"
  | "report_due_checkout_reconciliations"

type ReconciliationRpcFailure = "error" | "throw"

function makeClaim(overrides: Record<string, unknown> = {}) {
  return {
    catalog_version: "lift-complete-v2",
    claim_number: 1,
    claim_token: CLAIM_TOKEN,
    deployment_target: "development",
    expires_at: EXPIRES_AT,
    order_id: ORDER_ID,
    order_status: "open",
    product_type: "lift_guide",
    stripe_account_id: ACCOUNT_ID,
    stripe_checkout_session_id: SESSION_ID,
    stripe_livemode: false,
    stripe_payment_intent_id: null,
    stripe_price_id: PRICE_ID,
    stripe_product_id: PRODUCT_ID,
    user_id: USER_ID,
    ...overrides,
  }
}

function makeSession({
  paymentIntentId = PAYMENT_INTENT_ID,
  status = "complete",
}: {
  paymentIntentId?: string | null
  status?: "complete" | "expired" | "open"
} = {}) {
  return {
    amount_total: 1111,
    client_reference_id: USER_ID,
    currency: "usd",
    expires_at: Math.floor(new Date(EXPIRES_AT).getTime() / 1_000),
    id: SESSION_ID,
    line_items: {
      data: [
        {
          amount_total: 1111,
          price: {
            currency: "usd",
            id: PRICE_ID,
            livemode: false,
            product: PRODUCT_ID,
            recurring: null,
            type: "one_time",
            unit_amount: 1111,
          },
          quantity: 1,
        },
      ],
    },
    livemode: false,
    metadata: {
      application: "hwl-by-smd",
      catalog_version: "lift-complete-v2",
      checkout_order_id: ORDER_ID,
      deployment_target: "development",
      price_id: PRICE_ID,
      product_type: "lift_guide",
      stripe_account_id: ACCOUNT_ID,
      stripe_mode: "test",
      stripe_product_id: PRODUCT_ID,
      user_id: USER_ID,
    },
    mode: "payment",
    payment_intent: paymentIntentId,
    status,
  }
}

function makeReportRow(overrides: Record<string, unknown> = {}) {
  return {
    alert_pending: false,
    catalog_version: "lift-complete-v2",
    claim_count: 0,
    consecutive_failure_count: 0,
    deployment_target: "development",
    job_state: "pending",
    lease_expires_at: null,
    manual_review_reason: null,
    next_attempt_at: EXPIRES_AT,
    order_id: ORDER_ID,
    order_status: "open",
    product_type: "lift_guide",
    stripe_account_id: ACCOUNT_ID,
    stripe_checkout_session_id: SESSION_ID,
    stripe_livemode: false,
    stripe_payment_intent_id: null,
    stripe_price_id: PRICE_ID,
    stripe_product_id: PRODUCT_ID,
    user_id: USER_ID,
    ...overrides,
  }
}

function makeHarness({
  alertResult = { kind: "accepted" as const },
  alertThrows = false,
  claims = [],
  finishResult = true,
  fulfillmentResult = {
    purchaseStatus: "active" as const,
    state: "fulfilled" as const,
  },
  now = () => 1_000,
  reports = [],
  reportsByCall,
  rpcFailures = {},
  session = makeSession(),
  sessionError = false,
  stripeAccountError = false,
  stripeAccountMatches = true,
}: {
  alertResult?: CommerceRecoveryAlertResult
  alertThrows?: boolean
  claims?: Array<Record<string, unknown>>
  finishResult?: boolean
  fulfillmentResult?:
    | { purchaseStatus: "active"; state: "already_active" | "fulfilled" }
    | {
        purchaseStatus: "cancelled" | "disputed" | "refunded"
        state: "terminal"
      }
    | { purchaseStatus: null; state: "ignored" }
  now?: () => number
  reports?: Array<Record<string, unknown>>
  reportsByCall?: Array<Array<Record<string, unknown>>>
  rpcFailures?: Partial<Record<ReconciliationRpcName, ReconciliationRpcFailure>>
  session?: ReturnType<typeof makeSession>
  sessionError?: boolean
  stripeAccountError?: boolean
  stripeAccountMatches?: boolean
} = {}) {
  const alertCalls: CommerceRecoveryAlertInput[] = []
  const rpcCalls: Array<{ args: Record<string, unknown>; name: string }> = []
  const finishCalls: Array<Record<string, unknown>> = []
  const fulfillmentCalls: Array<Record<string, unknown>> = []
  const expirationCalls: Array<Record<string, unknown>> = []
  let sessionRetrieveCount = 0
  let stripeAccountCheckCount = 0
  let reportCallCount = 0

  const admin = {
    async rpc(name: string, args: Record<string, unknown>) {
      rpcCalls.push({ args, name })
      const failure = rpcFailures[name as ReconciliationRpcName]
      if (failure === "throw") throw new Error(PRIVATE_FAILURE_DETAIL)
      if (failure === "error") {
        return {
          data: null,
          error: { code: PRIVATE_FAILURE_DETAIL },
        }
      }
      if (name === "report_due_checkout_reconciliations") {
        const data = reportsByCall?.[reportCallCount] ?? reports
        reportCallCount += 1
        return { data, error: null }
      }
      if (name === "claim_due_checkout_reconciliations") {
        return { data: claims, error: null }
      }
      if (name === "finish_checkout_reconciliation_claim") {
        finishCalls.push(args)
        return { data: finishResult, error: null }
      }
      throw new Error(`Unexpected RPC: ${name}`)
    },
  }
  const stripe = {
    checkout: {
      sessions: {
        async retrieve() {
          sessionRetrieveCount += 1
          if (sessionError)
            throw new Error("provider secret should stay hidden")
          return session
        },
      },
    },
  }

  const dependencies = {
    createAdminClient: () => admin as never,
    async fulfillCompletedCheckout(args: Record<string, unknown>) {
      fulfillmentCalls.push(args)
      return fulfillmentResult
    },
    getCommerceDeploymentTarget: () => "development" as const,
    getExpectedStripeAccountId: () => ACCOUNT_ID,
    getExpectedStripeLivemode: () => false,
    getStripe: () => stripe as never,
    async isExpectedStripeAccount() {
      stripeAccountCheckCount += 1
      if (stripeAccountError) throw new Error(PRIVATE_FAILURE_DETAIL)
      return stripeAccountMatches
    },
    isStripeModeConfigured: () => true,
    async markCheckoutExpired(...args: unknown[]) {
      expirationCalls.push({ args })
      return "processed" as const
    },
    now,
    randomUUID: () => RUN_ID,
    async sendCommerceRecoveryAlert(input: CommerceRecoveryAlertInput) {
      alertCalls.push(input)
      if (alertThrows) throw new Error(PRIVATE_FAILURE_DETAIL)
      return alertResult
    },
  }

  return {
    alertCalls,
    dependencies,
    expirationCalls,
    finishCalls,
    fulfillmentCalls,
    get sessionRetrieveCount() {
      return sessionRetrieveCount
    },
    get stripeAccountCheckCount() {
      return stripeAccountCheckCount
    },
    rpcCalls,
  }
}

async function captureConsoleErrors<T>(run: () => Promise<T>) {
  const originalConsoleError = console.error
  const calls: unknown[][] = []
  console.error = (...args: unknown[]) => {
    calls.push(args)
  }

  try {
    return { calls, result: await run() }
  } finally {
    console.error = originalConsoleError
  }
}

async function captureConsoleWarnings<T>(run: () => Promise<T>) {
  const originalConsoleWarn = console.warn
  const calls: unknown[][] = []
  console.warn = (...args: unknown[]) => {
    calls.push(args)
  }

  try {
    return { calls, result: await run() }
  } finally {
    console.warn = originalConsoleWarn
  }
}

function assertSanitizedFailureLog(
  calls: unknown[][],
  expected: { category: string; stage: string }
) {
  assert.equal(calls.length, 1)
  assert.equal(calls[0]?.length, 1)
  const serialized = calls[0]?.[0]
  assert.equal(typeof serialized, "string")
  if (typeof serialized !== "string") return

  assert.deepEqual(JSON.parse(serialized), {
    category: expected.category,
    event: "scheduled_commerce_reconciliation_failed",
    level: "error",
    stage: expected.stage,
  })
  assert.doesNotMatch(
    serialized,
    /provider secret|customer@example\.com|cs_test_|pi_test_|price_|prod_|acct_/
  )
}

function assertSanitizedAlertFailureLog(
  calls: unknown[][],
  category: string,
  environment = "development"
) {
  assert.equal(calls.length, 1)
  assert.equal(calls[0]?.length, 1)
  const serialized = calls[0]?.[0]
  assert.equal(typeof serialized, "string")
  if (typeof serialized !== "string") return

  assert.deepEqual(JSON.parse(serialized), {
    category,
    environment,
    event: "scheduled_commerce_reconciliation_alert_not_delivered",
    level: "warn",
  })
  assert.doesNotMatch(
    serialized,
    /provider secret|customer@example\.com|cs_test_|pi_test_|price_|prod_|acct_/
  )
}

function assertSanitizedStatusRefreshLog(
  calls: unknown[][],
  environment = "development"
) {
  assert.equal(calls.length, 1)
  assert.equal(calls[0]?.length, 1)
  const serialized = calls[0]?.[0]
  assert.equal(typeof serialized, "string")
  if (typeof serialized !== "string") return

  assert.deepEqual(JSON.parse(serialized), {
    category: "status_unavailable",
    environment,
    event: "scheduled_commerce_reconciliation_status_refresh_unavailable",
    level: "warn",
  })
  assert.doesNotMatch(
    serialized,
    /provider secret|customer@example\.com|cs_test_|pi_test_|price_|prod_|acct_/
  )
}

test("commerce recovery alert idempotency is deterministic by payload, UTC day, and environment", () => {
  const morning = new Date("2026-09-06T00:00:01.000Z")
  const evening = new Date("2026-09-06T23:59:59.000Z")
  const nextDay = new Date("2026-09-07T00:00:00.000Z")
  const payload = JSON.stringify({ from: "sender", text: "state one" })
  const changedPayload = JSON.stringify({ from: "sender", text: "state two" })
  const morningKey = commerceRecoveryAlertIdempotencyKey(
    "production",
    morning,
    payload
  )

  assert.match(
    morningKey,
    /^hwl-commerce-recovery-production-2026-09-06-[a-f0-9]{24}$/
  )
  assert.equal(
    commerceRecoveryAlertIdempotencyKey("production", evening, payload),
    morningKey
  )
  assert.notEqual(
    commerceRecoveryAlertIdempotencyKey("preview", morning, payload),
    morningKey
  )
  assert.notEqual(
    commerceRecoveryAlertIdempotencyKey("production", nextDay, payload),
    morningKey
  )
  assert.notEqual(
    commerceRecoveryAlertIdempotencyKey("production", morning, changedPayload),
    morningKey
  )
  assert.doesNotMatch(morningKey, /sender|state/)
})

test("no recovery alert performs no provider request", async () => {
  let fetchCount = 0
  const result = await sendCommerceRecoveryAlert(
    {
      alertsPending: 0,
      deploymentTarget: "production",
      manualReview: 0,
      occurredAt: new Date("2026-09-06T12:00:00.000Z"),
    },
    {
      configuration: ALERT_CONFIGURATION,
      fetchImpl: async () => {
        fetchCount += 1
        return new Response(null, { status: 202 })
      },
    }
  )

  assert.deepEqual(result, { kind: "not_required" })
  assert.equal(fetchCount, 0)
})

test("commerce recovery email contains only aggregate state and the canonical protected link", async () => {
  const requests: Array<{ init: RequestInit | undefined; input: unknown }> = []
  const occurredAt = new Date("2026-09-06T12:00:00.000Z")
  const result = await sendCommerceRecoveryAlert(
    {
      alertsPending: 3,
      deploymentTarget: "production",
      manualReview: 2,
      occurredAt,
    },
    {
      configuration: ALERT_CONFIGURATION,
      fetchImpl: async (input, init) => {
        requests.push({ init, input })
        return new Response(null, { status: 202 })
      },
    }
  )

  assert.deepEqual(result, { kind: "accepted" })
  assert.equal(requests.length, 1)
  assert.equal(requests[0]?.input, "https://api.resend.com/emails")
  const headers = new Headers(requests[0]?.init?.headers)
  assert.equal(
    headers.get("idempotency-key"),
    commerceRecoveryAlertIdempotencyKey(
      "production",
      occurredAt,
      String(requests[0]?.init?.body)
    )
  )
  const payload = JSON.parse(String(requests[0]?.init?.body)) as {
    from: string
    subject: string
    text: string
    to: string[]
  }
  assert.deepEqual(payload.to, [ALERT_CONFIGURATION.to])
  assert.equal(payload.from, ALERT_CONFIGURATION.from)
  assert.match(payload.subject, /production commerce recovery needs attention/)
  assert.match(payload.text, /Environment: production/)
  assert.match(payload.text, /Recovery alerts pending now: 3/)
  assert.match(
    payload.text,
    /Worker-classified manual-review outcomes this run: 2/
  )
  assert.match(payload.text, /Recovery status refresh: current\./)
  assert.match(
    payload.text,
    /https:\/\/www\.hwlbysmd\.com\/login\?redirectTo=%2Fadmin%2Fstore/
  )
  assert.doesNotMatch(
    `${payload.subject}\n${payload.text}`,
    /customer@example|cs_(?:test|live)_|pi_|price_|prod_|acct_|evt_|ch_/
  )
})

test("a full report batch is described as a lower bound", async () => {
  const requests: RequestInit[] = []
  const result = await sendCommerceRecoveryAlert(
    {
      alertsPending: 100,
      deploymentTarget: "production",
      manualReview: 0,
      occurredAt: new Date("2026-09-06T12:00:00.000Z"),
    },
    {
      configuration: ALERT_CONFIGURATION,
      fetchImpl: async (_input, init) => {
        requests.push(init ?? {})
        return new Response(null, { status: 202 })
      },
    }
  )

  assert.deepEqual(result, { kind: "accepted" })
  const payload = JSON.parse(String(requests[0]?.body)) as { text: string }
  assert.match(payload.text, /Recovery alerts pending now: at least 100/)
  assert.doesNotMatch(payload.text, /Recovery alerts pending now: 100(?:\n|$)/)
})

test("an uncertain recovery status sends a generic aggregate alert", async () => {
  const requests: RequestInit[] = []
  const result = await sendCommerceRecoveryAlert(
    {
      alertsPending: 0,
      deploymentTarget: "production",
      manualReview: 0,
      occurredAt: new Date("2026-09-06T12:00:00.000Z"),
      statusUncertain: true,
    },
    {
      configuration: ALERT_CONFIGURATION,
      fetchImpl: async (_input, init) => {
        requests.push(init ?? {})
        return new Response(null, { status: 202 })
      },
    }
  )

  assert.deepEqual(result, { kind: "accepted" })
  const payload = JSON.parse(String(requests[0]?.body)) as { text: string }
  assert.match(
    payload.text,
    /Recovery status refresh: unavailable; inspect the durable queue\./
  )
})

test("missing commerce alert configuration performs no provider request", async () => {
  let fetchCount = 0
  for (const missing of ["apiKey", "from", "to"] as const) {
    const result = await sendCommerceRecoveryAlert(
      {
        alertsPending: 1,
        deploymentTarget: "production",
        manualReview: 0,
        occurredAt: new Date("2026-09-06T12:00:00.000Z"),
      },
      {
        configuration: {
          ...ALERT_CONFIGURATION,
          [missing]: undefined,
        },
        fetchImpl: async () => {
          fetchCount += 1
          return new Response(null, { status: 202 })
        },
      }
    )

    assert.deepEqual(result, { kind: "not_configured" })
  }
  assert.equal(fetchCount, 0)
})

test("malformed or multi-recipient alert addresses perform no provider request", async () => {
  let fetchCount = 0
  for (const configuration of [
    { ...ALERT_CONFIGURATION, to: "operator@example.com,broken" },
    { ...ALERT_CONFIGURATION, to: "one@example.com;two@example.com" },
    { ...ALERT_CONFIGURATION, to: "Operator <operator@example.com>" },
    { ...ALERT_CONFIGURATION, to: "operator@example.com:bad" },
    { ...ALERT_CONFIGURATION, from: "HWL <hello@hwlbysmd.com>,broken" },
  ]) {
    const result = await sendCommerceRecoveryAlert(
      {
        alertsPending: 1,
        deploymentTarget: "production",
        manualReview: 0,
        occurredAt: new Date("2026-09-06T12:00:00.000Z"),
      },
      {
        configuration,
        fetchImpl: async () => {
          fetchCount += 1
          return new Response(null, { status: 202 })
        },
      }
    )

    assert.deepEqual(result, { kind: "not_configured" })
  }
  assert.equal(fetchCount, 0)
})

test("provider rejection is reduced to a sanitized alert result", async () => {
  const result = await sendCommerceRecoveryAlert(
    {
      alertsPending: 1,
      deploymentTarget: "preview",
      manualReview: 0,
      occurredAt: new Date("2026-09-06T12:00:00.000Z"),
    },
    {
      configuration: ALERT_CONFIGURATION,
      fetchImpl: async () =>
        new Response(PRIVATE_FAILURE_DETAIL, { status: 403 }),
    }
  )

  assert.deepEqual(result, { kind: "provider_rejected" })
  assert.doesNotMatch(
    JSON.stringify(result),
    /provider secret|customer@example/
  )
})

test("network ambiguity is reduced to a sanitized alert result", async () => {
  const result = await sendCommerceRecoveryAlert(
    {
      alertsPending: 1,
      deploymentTarget: "preview",
      manualReview: 0,
      occurredAt: new Date("2026-09-06T12:00:00.000Z"),
    },
    {
      configuration: ALERT_CONFIGURATION,
      fetchImpl: async () => {
        throw new Error(PRIVATE_FAILURE_DETAIL)
      },
    }
  )

  assert.deepEqual(result, { kind: "network_outcome_unknown" })
  assert.doesNotMatch(
    JSON.stringify(result),
    /provider secret|customer@example/
  )
})

test("cron bearer comparison is exact and length-safe", () => {
  assert.equal(cronSecretsMatch("shared-secret", "shared-secret"), true)
  assert.equal(cronSecretsMatch("shared-secret-x", "shared-secret"), false)
  assert.equal(cronSecretsMatch("🔒", "shared-secret"), false)
  assert.equal(
    hasAuthorizedCronBearer("Bearer shared-secret", "shared-secret"),
    true
  )
  assert.equal(
    hasAuthorizedCronBearer("bearer shared-secret", "shared-secret"),
    false
  )
  assert.equal(
    hasAuthorizedCronBearer("Bearer shared-secret extra", "shared-secret"),
    false
  )
  assert.equal(hasAuthorizedCronBearer(null, "shared-secret"), false)
})

test("the route authenticates before invoking any reconciliation dependency", async () => {
  const originalSecret = process.env.CRON_SECRET
  process.env.CRON_SECRET = CRON_SECRET
  let runCount = 0

  try {
    const response = await handleCommerceReconciliationCron(
      new Request("http://localhost/api/cron/commerce-reconciliation", {
        headers: { authorization: `Bearer ${"x".repeat(32)}` },
      }),
      async () => {
        runCount += 1
        return { kind: "unavailable" }
      }
    )

    assert.equal(response.status, 401)
    assert.equal(response.headers.get("cache-control"), "no-store")
    assert.equal(runCount, 0)
  } finally {
    if (originalSecret === undefined) delete process.env.CRON_SECRET
    else process.env.CRON_SECRET = originalSecret
  }
})

test("the route rejects a short configured secret before invoking work", async () => {
  const originalSecret = process.env.CRON_SECRET
  process.env.CRON_SECRET = "too-short"
  let runCount = 0

  try {
    const response = await handleCommerceReconciliationCron(
      new Request("http://localhost/api/cron/commerce-reconciliation", {
        headers: { authorization: "Bearer too-short" },
      }),
      async () => {
        runCount += 1
        return { kind: "unavailable" }
      }
    )

    assert.equal(response.status, 503)
    assert.equal(runCount, 0)
  } finally {
    if (originalSecret === undefined) delete process.env.CRON_SECRET
    else process.env.CRON_SECRET = originalSecret
  }
})

test("the route rejects a missing configured secret before invoking work", async () => {
  const originalSecret = process.env.CRON_SECRET
  delete process.env.CRON_SECRET
  let runCount = 0

  try {
    const response = await handleCommerceReconciliationCron(
      new Request("http://localhost/api/cron/commerce-reconciliation"),
      async () => {
        runCount += 1
        return { kind: "unavailable" }
      }
    )

    assert.equal(response.status, 503)
    assert.equal(runCount, 0)
  } finally {
    if (originalSecret === undefined) delete process.env.CRON_SECRET
    else process.env.CRON_SECRET = originalSecret
  }
})

test("provider account mismatch fails before leasing database work", async () => {
  const harness = makeHarness({ stripeAccountMatches: false })
  const result = await runScheduledCommerceReconciliation({
    dependencies: harness.dependencies,
  })

  assert.deepEqual(result, { kind: "unavailable" })
  assert.equal(harness.stripeAccountCheckCount, 1)
  assert.equal(harness.rpcCalls.length, 0)
})

test("provider account verification errors log only a sanitized category", async () => {
  const harness = makeHarness({ stripeAccountError: true })
  const { calls, result } = await captureConsoleErrors(() =>
    runScheduledCommerceReconciliation({
      dependencies: harness.dependencies,
    })
  )

  assert.deepEqual(result, { kind: "unavailable" })
  assertSanitizedFailureLog(calls, {
    category: "provider_error",
    stage: "account_verification",
  })
  assert.equal(harness.stripeAccountCheckCount, 1)
  assert.equal(harness.rpcCalls.length, 0)
})

test("claims use the exact namespace, fixed lease, and maximum batch size", async () => {
  const harness = makeHarness()
  const result = await runScheduledCommerceReconciliation({
    dependencies: harness.dependencies,
    maximumClaims: 99,
  })

  assert.equal(result.kind, "completed")
  assert.deepEqual(harness.rpcCalls, [
    {
      args: {
        p_batch_size: 100,
        p_deployment_target: "development",
        p_run_id: RUN_ID,
        p_stripe_account_id: ACCOUNT_ID,
        p_stripe_livemode: false,
      },
      name: "report_due_checkout_reconciliations",
    },
    {
      args: {
        p_batch_size: 10,
        p_deployment_target: "development",
        p_lease_seconds: 120,
        p_run_id: RUN_ID,
        p_stripe_account_id: ACCOUNT_ID,
        p_stripe_livemode: false,
      },
      name: "claim_due_checkout_reconciliations",
    },
    {
      args: {
        p_batch_size: 100,
        p_deployment_target: "development",
        p_run_id: RUN_ID,
        p_stripe_account_id: ACCOUNT_ID,
        p_stripe_livemode: false,
      },
      name: "report_due_checkout_reconciliations",
    },
  ])
  assert.equal(
    harness.rpcCalls.some(({ name }) => name.includes("stripe_events")),
    false
  )
  assert.equal(harness.alertCalls.length, 0)
})

test("a completed checkout uses the shared verifier and exact claim identity", async () => {
  const harness = makeHarness({ claims: [makeClaim()] })
  const result = await runScheduledCommerceReconciliation({
    dependencies: harness.dependencies,
  })

  assert.equal(result.kind, "completed")
  if (result.kind !== "completed") return
  assert.equal(result.summary.fulfilled, 1)
  assert.equal(harness.fulfillmentCalls.length, 1)
  assert.equal(harness.sessionRetrieveCount, 1)
  assert.deepEqual(harness.fulfillmentCalls[0]?.expectation, {
    catalogVersion: "lift-complete-v2",
    deploymentTarget: "development",
    orderId: ORDER_ID,
    priceId: PRICE_ID,
    productType: "lift_guide",
    stripeProductId: PRODUCT_ID,
    userId: USER_ID,
  })
  assert.equal(harness.fulfillmentCalls[0]?.source, "scheduled_reconciliation")
  assert.deepEqual(harness.finishCalls, [
    {
      p_claim_token: CLAIM_TOKEN,
      p_error_code: null,
      p_order_id: ORDER_ID,
      p_outcome: "fulfilled",
    },
  ])
})

test("an idempotent active replay remains monitored", async () => {
  const harness = makeHarness({
    claims: [makeClaim()],
    fulfillmentResult: {
      purchaseStatus: "active",
      state: "already_active",
    },
  })
  const result = await runScheduledCommerceReconciliation({
    dependencies: harness.dependencies,
  })

  assert.equal(result.kind, "completed")
  assert.equal(harness.finishCalls[0]?.p_outcome, "verified_active")
})

test("a coherent cancelled purchase is finished as terminal", async () => {
  const harness = makeHarness({
    claims: [makeClaim()],
    fulfillmentResult: {
      purchaseStatus: "cancelled",
      state: "terminal",
    },
  })
  const result = await runScheduledCommerceReconciliation({
    dependencies: harness.dependencies,
  })

  assert.equal(result.kind, "completed")
  if (result.kind !== "completed") return
  assert.equal(result.summary.terminal, 1)
  assert.equal(harness.finishCalls[0]?.p_outcome, "terminal")
  assert.equal(harness.finishCalls[0]?.p_error_code, null)
})

test("report rows are validated and reduced to sanitized operational counts", async () => {
  const harness = makeHarness({
    reports: [makeReportRow({ alert_pending: true })],
  })
  const result = await runScheduledCommerceReconciliation({
    dependencies: harness.dependencies,
  })

  assert.equal(result.kind, "completed")
  if (result.kind !== "completed") return
  assert.equal(result.summary.reported, 1)
  assert.equal(result.summary.alertsPending, 1)
  assert.equal(harness.alertCalls.length, 1)
  assert.deepEqual(
    {
      alertsPending: harness.alertCalls[0]?.alertsPending,
      deploymentTarget: harness.alertCalls[0]?.deploymentTarget,
      manualReview: harness.alertCalls[0]?.manualReview,
    },
    {
      alertsPending: 1,
      deploymentTarget: "development",
      manualReview: 0,
    }
  )
  assert.doesNotMatch(
    JSON.stringify(result),
    /cs_test_|pi_test_|price_|prod_|acct_/
  )
})

test("a same-run manual-review transition triggers one aggregate alert", async () => {
  const harness = makeHarness({
    claims: [makeClaim({ deployment_target: "preview" })],
  })
  const result = await runScheduledCommerceReconciliation({
    dependencies: harness.dependencies,
  })

  assert.equal(result.kind, "completed")
  if (result.kind !== "completed") return
  assert.equal(result.summary.manualReview, 1)
  assert.equal(harness.alertCalls.length, 1)
  assert.deepEqual(
    {
      alertsPending: harness.alertCalls[0]?.alertsPending,
      deploymentTarget: harness.alertCalls[0]?.deploymentTarget,
      manualReview: harness.alertCalls[0]?.manualReview,
    },
    {
      alertsPending: 0,
      deploymentTarget: "development",
      manualReview: 1,
    }
  )
  assert.equal(harness.sessionRetrieveCount, 0)
})

test("the post-repair report catches a same-run database-only manual-review transition", async () => {
  const manualReviewReport = makeReportRow({
    alert_pending: true,
    job_state: "manual_review",
    manual_review_reason: "retry_exhausted",
    next_attempt_at: null,
  })
  const harness = makeHarness({
    reportsByCall: [[], [manualReviewReport]],
  })
  const result = await runScheduledCommerceReconciliation({
    dependencies: harness.dependencies,
  })

  assert.equal(result.kind, "completed")
  if (result.kind !== "completed") return
  assert.equal(result.summary.manualReview, 0)
  assert.equal(result.summary.alertsPending, 1)
  assert.equal(result.summary.reported, 0)
  assert.equal(harness.alertCalls.length, 1)
  assert.equal(harness.alertCalls[0]?.alertsPending, 1)
  const reportCalls = harness.rpcCalls.filter(
    ({ name }) => name === "report_due_checkout_reconciliations"
  )
  assert.deepEqual(
    reportCalls.map(({ args }) => args.p_run_id),
    [RUN_ID, RUN_ID]
  )
  assert.deepEqual(
    harness.rpcCalls.map(({ name }) => name),
    [
      "report_due_checkout_reconciliations",
      "claim_due_checkout_reconciliations",
      "report_due_checkout_reconciliations",
    ]
  )
})

test("crossing the internal deadline surfaces uncertain database-created state", async () => {
  const timestamps = [1_000, 1_000, 47_000, 47_000]
  const harness = makeHarness({
    now: () => timestamps.shift() ?? 47_000,
  })
  const result = await runScheduledCommerceReconciliation({
    dependencies: harness.dependencies,
  })

  assert.equal(result.kind, "completed")
  if (result.kind !== "completed") return
  assert.equal(result.summary.deadlineReached, true)
  assert.equal(result.summary.alertsPending, 0)
  assert.equal(result.summary.manualReview, 0)
  assert.equal(harness.alertCalls.length, 1)
  assert.equal(harness.alertCalls[0]?.statusUncertain, true)
  assert.deepEqual(
    harness.rpcCalls.map(({ name }) => name),
    [
      "report_due_checkout_reconciliations",
      "claim_due_checkout_reconciliations",
    ]
  )
})

test("a failed status refresh is distinct from alert delivery status", async () => {
  const harness = makeHarness({
    reportsByCall: [[], [makeReportRow({ user_id: "not-a-uuid" })]],
  })
  const { calls, result } = await captureConsoleWarnings(() =>
    runScheduledCommerceReconciliation({ dependencies: harness.dependencies })
  )

  assert.equal(result.kind, "completed")
  assert.equal(harness.alertCalls.length, 1)
  assert.equal(harness.alertCalls[0]?.statusUncertain, true)
  assertSanitizedStatusRefreshLog(calls)
})

test("missing alert configuration is logged safely without changing recovery authority", async () => {
  const harness = makeHarness({
    alertResult: { kind: "not_configured" },
    reports: [makeReportRow({ alert_pending: true })],
  })
  const { calls, result } = await captureConsoleWarnings(() =>
    runScheduledCommerceReconciliation({ dependencies: harness.dependencies })
  )

  assert.equal(result.kind, "completed")
  if (result.kind !== "completed") return
  assert.equal(result.summary.alertsPending, 1)
  assert.equal(result.summary.reported, 1)
  assertSanitizedAlertFailureLog(calls, "not_configured")
})

test("provider alert failure states cannot change the completed recovery result", async () => {
  for (const kind of [
    "provider_rejected",
    "network_outcome_unknown",
  ] as const) {
    const harness = makeHarness({
      alertResult: { kind },
      reports: [makeReportRow({ alert_pending: true })],
    })
    const { calls, result } = await captureConsoleWarnings(() =>
      runScheduledCommerceReconciliation({ dependencies: harness.dependencies })
    )

    assert.equal(result.kind, "completed")
    if (result.kind !== "completed") continue
    assert.equal(result.summary.alertsPending, 1)
    assert.equal(result.summary.reported, 1)
    assertSanitizedAlertFailureLog(calls, kind)
  }
})

test("an unexpected notifier failure cannot change the completed recovery result", async () => {
  const harness = makeHarness({
    alertThrows: true,
    reports: [makeReportRow({ alert_pending: true })],
  })
  const { calls, result } = await captureConsoleWarnings(() =>
    runScheduledCommerceReconciliation({ dependencies: harness.dependencies })
  )

  assert.equal(result.kind, "completed")
  if (result.kind !== "completed") return
  assert.deepEqual(
    {
      alertsPending: result.summary.alertsPending,
      claimed: result.summary.claimed,
      manualReview: result.summary.manualReview,
      reported: result.summary.reported,
    },
    { alertsPending: 1, claimed: 0, manualReview: 0, reported: 1 }
  )
  assertSanitizedAlertFailureLog(calls, "unexpected_error")
})

test("a malformed report fails closed with a sanitized report-RPC category", async () => {
  const harness = makeHarness({
    claims: [makeClaim()],
    reports: [makeReportRow({ user_id: "not-a-uuid" })],
  })
  const { calls, result } = await captureConsoleErrors(() =>
    runScheduledCommerceReconciliation({
      dependencies: harness.dependencies,
    })
  )

  assert.deepEqual(result, { kind: "unavailable" })
  assertSanitizedFailureLog(calls, {
    category: "invalid_response",
    stage: "report_rpc",
  })
  assert.deepEqual(
    harness.rpcCalls.map(({ name }) => name),
    ["report_due_checkout_reconciliations"]
  )
  assert.equal(harness.sessionRetrieveCount, 0)
})

test("a report RPC error logs only its sanitized stage and category", async () => {
  const harness = makeHarness({
    rpcFailures: { report_due_checkout_reconciliations: "error" },
  })
  const { calls, result } = await captureConsoleErrors(() =>
    runScheduledCommerceReconciliation({
      dependencies: harness.dependencies,
    })
  )

  assert.deepEqual(result, { kind: "unavailable" })
  assertSanitizedFailureLog(calls, {
    category: "rpc_error",
    stage: "report_rpc",
  })
  assert.deepEqual(
    harness.rpcCalls.map(({ name }) => name),
    ["report_due_checkout_reconciliations"]
  )
})

test("a thrown claim RPC error logs only its sanitized stage and category", async () => {
  const harness = makeHarness({
    rpcFailures: { claim_due_checkout_reconciliations: "throw" },
  })
  const { calls, result } = await captureConsoleErrors(() =>
    runScheduledCommerceReconciliation({
      dependencies: harness.dependencies,
    })
  )

  assert.deepEqual(result, { kind: "unavailable" })
  assertSanitizedFailureLog(calls, {
    category: "rpc_error",
    stage: "claim_rpc",
  })
  assert.deepEqual(
    harness.rpcCalls.map(({ name }) => name),
    [
      "report_due_checkout_reconciliations",
      "claim_due_checkout_reconciliations",
    ]
  )
})

test("known durable alerts still notify when later claim work fails", async () => {
  const harness = makeHarness({
    reports: [makeReportRow({ alert_pending: true })],
    rpcFailures: { claim_due_checkout_reconciliations: "throw" },
  })
  const { calls, result } = await captureConsoleErrors(() =>
    runScheduledCommerceReconciliation({ dependencies: harness.dependencies })
  )

  assert.deepEqual(result, { kind: "unavailable" })
  assertSanitizedFailureLog(calls, {
    category: "rpc_error",
    stage: "claim_rpc",
  })
  assert.equal(harness.alertCalls.length, 1)
  assert.equal(harness.alertCalls[0]?.alertsPending, 1)
  assert.equal(harness.alertCalls[0]?.manualReview, 0)
  assert.equal(harness.alertCalls[0]?.statusUncertain, true)
})

test("recovery alert timeout is bounded by the outer function budget", async () => {
  const timestamps = [1_000, 1_000, 55_500]
  const harness = makeHarness({
    now: () => timestamps.shift() ?? 55_500,
    reports: [makeReportRow({ alert_pending: true })],
  })
  const result = await runScheduledCommerceReconciliation({
    dependencies: harness.dependencies,
    timeBudgetMs: 0,
  })

  assert.equal(result.kind, "completed")
  assert.equal(harness.alertCalls.length, 1)
  assert.equal(harness.alertCalls[0]?.timeoutMs, 4_500)
})

test("recovery alert skips provider work after the safe function budget", async () => {
  const timestamps = [1_000, 61_000, 61_000]
  const harness = makeHarness({
    now: () => timestamps.shift() ?? 61_000,
    reports: [makeReportRow({ alert_pending: true })],
  })
  const { calls, result } = await captureConsoleWarnings(() =>
    runScheduledCommerceReconciliation({
      dependencies: harness.dependencies,
      timeBudgetMs: 0,
    })
  )

  assert.equal(result.kind, "completed")
  assert.equal(harness.alertCalls.length, 0)
  assertSanitizedAlertFailureLog(calls, "time_budget_exhausted")
})

test("an open Session is rescheduled without calling fulfillment", async () => {
  const harness = makeHarness({
    claims: [makeClaim({ order_status: "open" })],
    session: makeSession({ paymentIntentId: null, status: "open" }),
  })
  const result = await runScheduledCommerceReconciliation({
    dependencies: harness.dependencies,
  })

  assert.equal(result.kind, "completed")
  assert.equal(harness.fulfillmentCalls.length, 0)
  assert.equal(harness.finishCalls[0]?.p_outcome, "not_ready")
  assert.equal(harness.finishCalls[0]?.p_error_code, null)
})

test("an expired Session is closed through the shared expiration verifier", async () => {
  const harness = makeHarness({
    claims: [makeClaim({ order_status: "open" })],
    session: makeSession({ paymentIntentId: null, status: "expired" }),
  })
  const result = await runScheduledCommerceReconciliation({
    dependencies: harness.dependencies,
  })

  assert.equal(result.kind, "completed")
  assert.equal(harness.expirationCalls.length, 1)
  assert.equal(harness.finishCalls[0]?.p_outcome, "terminal")
})

test("claim namespace drift is quarantined without a provider call", async () => {
  const harness = makeHarness({
    claims: [makeClaim({ deployment_target: "preview" })],
  })
  const result = await runScheduledCommerceReconciliation({
    dependencies: harness.dependencies,
  })

  assert.equal(result.kind, "completed")
  assert.equal(harness.sessionRetrieveCount, 0)
  assert.equal(harness.fulfillmentCalls.length, 0)
  assert.equal(harness.finishCalls[0]?.p_outcome, "inconsistent")
  assert.equal(
    harness.finishCalls[0]?.p_error_code,
    "claim_namespace_inconsistent"
  )
})

test("provider retrieval failures become durable retry outcomes", async () => {
  const harness = makeHarness({
    claims: [makeClaim()],
    sessionError: true,
  })
  const result = await runScheduledCommerceReconciliation({
    dependencies: harness.dependencies,
  })

  assert.equal(result.kind, "completed")
  assert.equal(harness.finishCalls[0]?.p_outcome, "retryable_error")
  assert.equal(
    harness.finishCalls[0]?.p_error_code,
    "checkout_session_retrieve_failed"
  )
  assert.doesNotMatch(
    JSON.stringify(result),
    /provider secret|cs_test_|pi_test_/
  )
})

test("the internal deadline releases every remaining lease without provider work", async () => {
  let nowCalls = 0
  const harness = makeHarness({
    claims: [
      makeClaim(),
      makeClaim({
        claim_number: 2,
        claim_token: "55555555-5555-4555-8555-555555555555",
        order_id: "66666666-6666-4666-8666-666666666666",
      }),
    ],
    now: () => {
      nowCalls += 1
      return nowCalls <= 2 ? 1_000 : 2_000
    },
  })
  const result = await runScheduledCommerceReconciliation({
    dependencies: harness.dependencies,
    timeBudgetMs: 1,
  })

  assert.equal(result.kind, "completed")
  if (result.kind !== "completed") return
  assert.equal(result.summary.deadlineReached, true)
  assert.equal(result.summary.retryScheduled, 2)
  assert.equal(harness.sessionRetrieveCount, 0)
  assert.deepEqual(
    harness.finishCalls.map((call) => call.p_error_code),
    ["worker_deadline", "worker_deadline"]
  )
})

test("a stale completion token logs a sanitized finish-RPC category", async () => {
  const harness = makeHarness({
    claims: [makeClaim()],
    finishResult: false,
  })
  const { calls, result } = await captureConsoleErrors(() =>
    runScheduledCommerceReconciliation({
      dependencies: harness.dependencies,
    })
  )

  assert.deepEqual(result, { kind: "unavailable" })
  assertSanitizedFailureLog(calls, {
    category: "invalid_response",
    stage: "finish_rpc",
  })
  assert.doesNotMatch(JSON.stringify(result), new RegExp(ORDER_ID))
  assert.doesNotMatch(JSON.stringify(result), /cs_test_|pi_test_|price_|prod_/)
})

test("an unexpected top-level failure logs no exception detail", async () => {
  let nowCalls = 0
  const harness = makeHarness({
    now: () => {
      nowCalls += 1
      if (nowCalls === 2) throw new Error(PRIVATE_FAILURE_DETAIL)
      return 1_000
    },
  })
  const { calls, result } = await captureConsoleErrors(() =>
    runScheduledCommerceReconciliation({
      dependencies: harness.dependencies,
    })
  )

  assert.deepEqual(result, { kind: "unavailable" })
  assertSanitizedFailureLog(calls, {
    category: "unexpected_error",
    stage: "worker",
  })
  assert.deepEqual(
    harness.rpcCalls.map(({ name }) => name),
    ["report_due_checkout_reconciliations"]
  )
})

test("the authorized route returns only the sanitized aggregate", async () => {
  const originalSecret = process.env.CRON_SECRET
  process.env.CRON_SECRET = CRON_SECRET

  try {
    const response = await handleCommerceReconciliationCron(
      new Request("http://localhost/api/cron/commerce-reconciliation", {
        headers: { authorization: `Bearer ${CRON_SECRET}` },
      }),
      async () => ({
        kind: "completed",
        summary: {
          alertsPending: 0,
          claimed: 1,
          deadlineReached: false,
          fulfilled: 1,
          manualReview: 0,
          notReady: 0,
          reported: 1,
          retryScheduled: 0,
          runId: RUN_ID,
          terminal: 0,
          verifiedActive: 0,
        },
      })
    )
    const body = await response.text()

    assert.equal(response.status, 200)
    assert.equal(response.headers.get("cache-control"), "no-store")
    assert.doesNotMatch(body, /cs_test_|pi_test_|price_|prod_|@/)
    assert.deepEqual(JSON.parse(body), {
      alertsPending: 0,
      claimed: 1,
      deadlineReached: false,
      fulfilled: 1,
      manualReview: 0,
      notReady: 0,
      reported: 1,
      retryScheduled: 0,
      runId: RUN_ID,
      terminal: 0,
      verifiedActive: 0,
    })
  } finally {
    if (originalSecret === undefined) delete process.env.CRON_SECRET
    else process.env.CRON_SECRET = originalSecret
  }
})
