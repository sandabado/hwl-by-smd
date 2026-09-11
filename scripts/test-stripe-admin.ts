import assert from "node:assert/strict"
import test from "node:test"

import {
  getAdminStripeOverview,
  getStripeDashboardBaseUrl,
  type AdminStripeDependencies,
} from "../lib/commerce/stripe-admin.ts"

const ACCOUNT_ID = "acct_1U9cEIPTLuM8Maxa"

function dependencies(
  overrides: Partial<AdminStripeDependencies> = {}
): AdminStripeDependencies {
  return {
    authorizeAdmin: async () => ({
      email: "admin@ghosthand.studio",
      role: "administrator",
      source: "supabase",
      userId: "admin-user",
    }),
    createStripeClient: () =>
      ({
        accounts: {
          retrieveCurrent: async () => ({ id: ACCOUNT_ID }),
        },
        invoices: {
          list: async () => ({
            data: [
              {
                amount_due: 1111,
                amount_paid: 1111,
                created: 1_789_000_200,
                currency: "usd",
                customer_email: "must-not-leak@example.com",
                id: "in_live_recent",
                livemode: true,
                status: "paid",
              },
            ],
          }),
        },
        paymentIntents: {
          list: async () => ({
            data: [
              {
                amount: 1111,
                amount_received: 1111,
                created: 1_789_000_100,
                currency: "usd",
                id: "pi_live_recent",
                livemode: true,
                payment_method: "pm_must_not_leak",
                receipt_email: "must-not-leak@example.com",
                status: "succeeded",
              },
              {
                amount: 9999,
                amount_received: 9999,
                created: 1_789_000_000,
                currency: "usd",
                id: "pi_test_wrong_mode",
                livemode: false,
                status: "succeeded",
              },
            ],
          }),
        },
        prices: {
          list: async () => ({
            data: [
              {
                active: true,
                currency: "usd",
                id: "price_live_lift",
                livemode: true,
                product: "prod_live_lift",
                recurring: null,
                type: "one_time",
                unit_amount: 1111,
              },
              {
                active: true,
                currency: "usd",
                id: "price_test_wrong_mode",
                livemode: false,
                product: "prod_live_lift",
                recurring: null,
                type: "one_time",
                unit_amount: 9999,
              },
            ],
          }),
        },
        products: {
          list: async () => ({
            data: [
              {
                active: true,
                description: "Description is not part of the admin DTO.",
                id: "prod_live_lift",
                livemode: true,
                metadata: { secret_note: "must-not-leak" },
                name: "LIFT — Video + PDF",
              },
            ],
          }),
        },
      }) as never,
    getExpectedAccountId: () => ACCOUNT_ID,
    getExpectedLivemode: () => true,
    isModeConfigured: () => true,
    ...overrides,
  }
}

test("local preview never creates a Stripe client", async () => {
  let clientCreated = false
  const result = await getAdminStripeOverview(
    dependencies({
      authorizeAdmin: async () => ({
        email: "local-preview",
        role: "administrator",
        source: "local-preview",
        userId: null,
      }),
      createStripeClient: () => {
        clientCreated = true
        return null
      },
    })
  )

  assert.deepEqual(result, { status: "local_preview" })
  assert.equal(clientCreated, false)
})

test("incomplete or mode-drifted configuration fails closed", async () => {
  assert.deepEqual(
    await getAdminStripeOverview(
      dependencies({ getExpectedAccountId: () => null })
    ),
    { status: "not_configured" }
  )
  assert.deepEqual(
    await getAdminStripeOverview(
      dependencies({ isModeConfigured: () => false })
    ),
    { status: "not_configured" }
  )
})

test("account mismatch stops before catalog and payment reads", async () => {
  let dataRead = false
  const result = await getAdminStripeOverview(
    dependencies({
      createStripeClient: () =>
        ({
          accounts: {
            retrieveCurrent: async () => ({ id: "acct_wrong" }),
          },
          invoices: { list: async () => ((dataRead = true), { data: [] }) },
          paymentIntents: {
            list: async () => ((dataRead = true), { data: [] }),
          },
          prices: { list: async () => ((dataRead = true), { data: [] }) },
          products: { list: async () => ((dataRead = true), { data: [] }) },
        }) as never,
    })
  )

  assert.equal(result.status, "account_mismatch")
  assert.equal(dataRead, false)
})

test("ready overview returns only bounded sanitized account-mode data", async () => {
  const result = await getAdminStripeOverview(dependencies())
  assert.equal(result.status, "ready")
  if (result.status !== "ready") return

  assert.equal(result.accountId, ACCOUNT_ID)
  assert.equal(result.livemode, true)
  assert.equal(
    result.dashboardBaseUrl,
    `https://dashboard.stripe.com/${ACCOUNT_ID}`
  )
  assert.deepEqual(result.catalog, {
    items: [
      {
        id: "prod_live_lift",
        name: "LIFT — Video + PDF",
        prices: [
          {
            cadence: "One-time",
            currency: "usd",
            id: "price_live_lift",
            unitAmount: 1111,
          },
        ],
      },
    ],
    status: "ready",
  })
  assert.deepEqual(result.payments, {
    items: [
      {
        amount: 1111,
        created: 1_789_000_100,
        currency: "usd",
        id: "pi_live_recent",
        status: "succeeded",
      },
    ],
    status: "ready",
  })
  assert.deepEqual(result.invoices, {
    items: [
      {
        amount: 1111,
        created: 1_789_000_200,
        currency: "usd",
        id: "in_live_recent",
        status: "paid",
      },
    ],
    status: "ready",
  })
  assert.equal(JSON.stringify(result).includes("must-not-leak"), false)
  assert.equal(JSON.stringify(result).includes("pm_"), false)
})

test("one denied Stripe permission does not hide independent safe sections", async () => {
  const base = dependencies()
  const client = base.createStripeClient()
  assert.ok(client)
  const result = await getAdminStripeOverview(
    dependencies({
      createStripeClient: () =>
        ({
          ...client,
          invoices: {
            list: async () => {
              throw new Error("permission denied")
            },
          },
        }) as never,
    })
  )

  assert.equal(result.status, "ready")
  if (result.status !== "ready") return
  assert.equal(result.catalog.status, "ready")
  assert.equal(result.payments.status, "ready")
  assert.deepEqual(result.invoices, { items: [], status: "unavailable" })
})

test("dashboard URLs are account-qualified and mode-specific", () => {
  assert.equal(
    getStripeDashboardBaseUrl(ACCOUNT_ID, false),
    `https://dashboard.stripe.com/${ACCOUNT_ID}/test`
  )
  assert.equal(getStripeDashboardBaseUrl("acct_bad/path", true), null)
})
