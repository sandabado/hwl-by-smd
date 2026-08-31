import assert from "node:assert/strict"
import test from "node:test"

import {
  CHECKOUT_RECONCILIATION_COOLDOWN_MS,
  CHECKOUT_RECONCILIATION_MAXIMUM_ATTEMPTS,
  CHECKOUT_RECONCILIATION_MAXIMUM_BYTES,
  getCheckoutIdentityRuntimeDisposition,
  getCheckoutReconciliationAvailability,
  isCheckoutSessionId,
  parseCheckoutReconciliationBody,
} from "../lib/commerce/checkout-reconciliation-policy.ts"

const testSessionId = `cs_test_${"a".repeat(24)}`
const liveSessionId = `cs_live_${"B".repeat(24)}`

test("reconciliation limits remain narrowly bounded", () => {
  assert.equal(CHECKOUT_RECONCILIATION_MAXIMUM_BYTES, 512)
  assert.equal(CHECKOUT_RECONCILIATION_MAXIMUM_ATTEMPTS, 3)
  assert.equal(CHECKOUT_RECONCILIATION_COOLDOWN_MS, 60_000)
})

test("only Stripe Checkout Session identifiers are admitted", () => {
  assert.equal(isCheckoutSessionId(testSessionId), true)
  assert.equal(isCheckoutSessionId(liveSessionId), true)
  assert.equal(isCheckoutSessionId("cs_test_short"), false)
  assert.equal(isCheckoutSessionId(`pi_${"a".repeat(24)}`), false)
  assert.equal(isCheckoutSessionId(`${testSessionId} `), false)
  assert.equal(isCheckoutSessionId(null), false)
})

test("the request body accepts exactly one sessionId field", () => {
  assert.deepEqual(
    parseCheckoutReconciliationBody({ sessionId: testSessionId }),
    {
      ok: true,
      sessionId: testSessionId,
    }
  )
  assert.deepEqual(
    parseCheckoutReconciliationBody({ extra: true, sessionId: testSessionId }),
    { ok: false }
  )
  assert.deepEqual(parseCheckoutReconciliationBody({}), { ok: false })
  assert.deepEqual(parseCheckoutReconciliationBody([testSessionId]), {
    ok: false,
  })
  assert.deepEqual(parseCheckoutReconciliationBody(null), { ok: false })
})

test("a new order is available for one reconciliation attempt", () => {
  assert.deepEqual(
    getCheckoutReconciliationAvailability({
      attemptCount: 0,
      lastAttemptAt: null,
      now: Date.parse("2026-08-29T12:00:00.000Z"),
    }),
    { available: true }
  )
})

test("cooldown blocks a remount but opens at the exact boundary", () => {
  const lastAttemptAt = "2026-08-29T12:00:00.000Z"
  const start = Date.parse(lastAttemptAt)

  assert.deepEqual(
    getCheckoutReconciliationAvailability({
      attemptCount: 1,
      lastAttemptAt,
      now: start + CHECKOUT_RECONCILIATION_COOLDOWN_MS - 1,
    }),
    { available: false, reason: "cooldown" }
  )
  assert.deepEqual(
    getCheckoutReconciliationAvailability({
      attemptCount: 1,
      lastAttemptAt,
      now: start + CHECKOUT_RECONCILIATION_COOLDOWN_MS,
    }),
    { available: true }
  )
})

test("the maximum attempt count is terminal for automatic reconciliation", () => {
  assert.deepEqual(
    getCheckoutReconciliationAvailability({
      attemptCount: CHECKOUT_RECONCILIATION_MAXIMUM_ATTEMPTS,
      lastAttemptAt: null,
      now: Date.now(),
    }),
    { available: false, reason: "exhausted" }
  )
})

test("invalid persisted attempt state fails closed", () => {
  assert.deepEqual(
    getCheckoutReconciliationAvailability({
      attemptCount: -1,
      lastAttemptAt: null,
      now: Date.now(),
    }),
    { available: false, reason: "invalid" }
  )
  assert.deepEqual(
    getCheckoutReconciliationAvailability({
      attemptCount: 1,
      lastAttemptAt: "not-a-timestamp",
      now: Date.now(),
    }),
    { available: false, reason: "invalid" }
  )
})

const previewNamespace = {
  deploymentTarget: "preview",
  stripeAccountId: "acct_sharedSandbox123",
  stripeLivemode: false,
} as const

test("the exact runtime namespace is current", () => {
  assert.equal(
    getCheckoutIdentityRuntimeDisposition(
      {
        deploymentTarget: "preview",
        stripeAccountId: "acct_sharedSandbox123",
        stripeMode: "test",
      },
      previewNamespace
    ),
    "current"
  )
})

test("a valid shared-account development event is a foreign target", () => {
  assert.equal(
    getCheckoutIdentityRuntimeDisposition(
      {
        deploymentTarget: "development",
        stripeAccountId: "acct_sharedSandbox123",
        stripeMode: "test",
      },
      previewNamespace
    ),
    "foreign_target"
  )
})

test("account or mode mismatches are invalid, not foreign targets", () => {
  assert.equal(
    getCheckoutIdentityRuntimeDisposition(
      {
        deploymentTarget: "development",
        stripeAccountId: "acct_unexpected456",
        stripeMode: "test",
      },
      previewNamespace
    ),
    "invalid"
  )
  assert.equal(
    getCheckoutIdentityRuntimeDisposition(
      {
        deploymentTarget: "development",
        stripeAccountId: "acct_sharedSandbox123",
        stripeMode: "live",
      },
      previewNamespace
    ),
    "invalid"
  )
})
