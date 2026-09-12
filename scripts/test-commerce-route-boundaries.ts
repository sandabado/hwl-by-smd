import assert from "node:assert/strict"
import { after, test } from "node:test"

import { POST as createCheckout } from "../app/api/checkout/route.ts"
import { POST as receiveStripeWebhook } from "../app/api/stripe/webhook/route.ts"

const HARNESS_KEY = "__hwlCommerceRouteHarness"
const ACCOUNT_ID = "acct_route_fixture"
const PRICE_ID = "price_route_fixture"
const PRODUCT_ID = "prod_route_fixture"
const SESSION_ID = "cs_test_route_fixture"
const SITE_URL = "https://preview.hwlbysmd.com"
const USER_ID = "10000000-0000-4000-8000-000000000001"
const USER_EMAIL = "member@example.com"
const STRIPE_CUSTOMER_ID = "cus_route_fixture"
const LEGACY_LIFT_METADATA = {
  application: "hwl-by-smd",
  catalog_version: "lift-complete-v2",
  product_type: "lift_guide",
} as const

const ENVIRONMENT_KEYS = [
  "LIFT_PDF_STORAGE_PATH",
  "LIFT_VIDEO_STORAGE_PATH",
  "STRIPE_WEBHOOK_SECRET",
] as const

const originalEnvironment = Object.fromEntries(
  ENVIRONMENT_KEYS.map((key) => [key, process.env[key]])
)

type CommerceRouteHarness = {
  createAdminClient: () => unknown
  fulfillCompletedCheckout: (args: unknown) => Promise<unknown>
  getAuthenticatedUser: () => Promise<unknown>
  getCommerceDeploymentTarget: () =>
    "development" | "preview" | "production" | null
  getExpectedStripeAccountId: () => string | null
  getExpectedStripeLivemode: () => boolean | null
  getPriceId: (productId: string) => string | undefined
  getProductId: (productId: string) => string | undefined
  getSiteUrl: (requestUrl?: string) => string
  getStripe: () => unknown
  isExpectedStripeAccount: (stripe: unknown) => Promise<boolean>
  isExpectedStripePrice: (productId: string, price: unknown) => boolean
  isProductCheckoutReady: (productId: string) => boolean
  isStripeModeConfigured: () => boolean
  markCheckoutExpired: (...args: unknown[]) => Promise<unknown>
  reconcileFullRefund: (...args: unknown[]) => Promise<unknown>
  revokeDisputedCharge: (...args: unknown[]) => Promise<unknown>
}

type CheckoutCalls = {
  events: string[]
  orderInserts: Record<string, unknown>[]
  orderUpdates: Record<string, unknown>[]
  sessionCreateOptions: Record<string, unknown> | null
  sessionCreateParams: Record<string, unknown> | null
  storage: Array<{ bucket: string; path: string; seconds: number }>
}

type WebhookCalls = {
  accountChecks: number
  dispatches: Array<{ args: unknown[]; kind: string }>
  eventInserts: Record<string, unknown>[]
  paymentIntentRetrievals: string[]
  rawBody: string | null
  signature: string | null
  webhookSecret: string | null
}

after(() => {
  for (const key of ENVIRONMENT_KEYS) {
    const value = originalEnvironment[key]
    if (value === undefined) Reflect.deleteProperty(process.env, key)
    else Reflect.set(process.env, key, value)
  }
  Reflect.deleteProperty(globalThis, HARNESS_KEY)
})

function setHarness(harness: CommerceRouteHarness) {
  Reflect.set(globalThis, HARNESS_KEY, harness)
}

function baseHarness(
  overrides: Partial<CommerceRouteHarness> = {}
): CommerceRouteHarness {
  return {
    createAdminClient: () => null,
    fulfillCompletedCheckout: async () => ({ state: "fulfilled" }),
    getAuthenticatedUser: async () => null,
    getCommerceDeploymentTarget: () => "preview",
    getExpectedStripeAccountId: () => ACCOUNT_ID,
    getExpectedStripeLivemode: () => false,
    getPriceId: () => PRICE_ID,
    getProductId: () => PRODUCT_ID,
    getSiteUrl: () => SITE_URL,
    getStripe: () => null,
    isExpectedStripeAccount: async () => true,
    isExpectedStripePrice: () => true,
    isProductCheckoutReady: () => false,
    isStripeModeConfigured: () => true,
    markCheckoutExpired: async () => "processed",
    reconcileFullRefund: async () => "processed",
    revokeDisputedCharge: async () => "processed",
    ...overrides,
  }
}

function checkoutRequest({
  body = JSON.stringify({
    attemptId: "checkout-attempt-0001",
    productId: "lift_guide",
  }),
  contentType = "application/json",
  origin = SITE_URL,
}: {
  body?: string
  contentType?: string | null
  origin?: string | null
} = {}) {
  const headers = new Headers()
  if (contentType !== null) headers.set("content-type", contentType)
  if (origin !== null) headers.set("origin", origin)

  return new Request(`${SITE_URL}/api/checkout`, {
    body,
    headers,
    method: "POST",
  })
}

function createCheckoutCalls(): CheckoutCalls {
  return {
    events: [],
    orderInserts: [],
    orderUpdates: [],
    sessionCreateOptions: null,
    sessionCreateParams: null,
    storage: [],
  }
}

function createCheckoutAdminClient(
  calls: CheckoutCalls,
  { stripeCustomerId = null }: { stripeCustomerId?: string | null } = {}
) {
  return {
    from(table: string) {
      let inserted: Record<string, unknown> | null = null
      let operation: "insert" | "select" | "update" = "select"

      const query = {
        error: null,
        eq() {
          return query
        },
        in() {
          return query
        },
        insert(values: Record<string, unknown>) {
          operation = "insert"
          inserted = values
          if (table === "checkout_orders") {
            calls.events.push("order_insert")
            calls.orderInserts.push(values)
          }
          return query
        },
        limit() {
          return query
        },
        async maybeSingle() {
          if (table === "profiles") {
            calls.events.push("profile_lookup")
            return { data: { id: USER_ID }, error: null }
          }
          if (table === "stripe_customers") {
            calls.events.push("customer_lookup")
            return {
              data: stripeCustomerId
                ? { stripe_customer_id: stripeCustomerId }
                : null,
              error: null,
            }
          }
          if (table === "purchases") {
            calls.events.push("purchase_lookup")
            return { data: null, error: null }
          }
          if (table === "checkout_orders" && operation === "select") {
            calls.events.push("order_lookup")
            return { data: null, error: null }
          }
          throw new Error(`Unexpected maybeSingle call for ${table}`)
        },
        order() {
          return query
        },
        select() {
          return query
        },
        async single() {
          if (
            table !== "checkout_orders" ||
            operation !== "insert" ||
            !inserted
          ) {
            throw new Error(`Unexpected single call for ${table}`)
          }
          return { data: inserted, error: null }
        },
        update(values: Record<string, unknown>) {
          operation = "update"
          if (table === "checkout_orders") {
            calls.events.push("order_update")
            calls.orderUpdates.push(values)
          }
          return query
        },
      }

      return query
    },
    storage: {
      from(bucket: string) {
        return {
          async createSignedUrl(path: string, seconds: number) {
            calls.events.push(`asset:${path}`)
            calls.storage.push({ bucket, path, seconds })
            return {
              data: { signedUrl: `https://storage.example/${path}` },
              error: null,
            }
          },
        }
      },
    },
  }
}

function createCheckoutStripe(calls: CheckoutCalls) {
  return {
    checkout: {
      sessions: {
        async create(
          params: Record<string, unknown>,
          options: Record<string, unknown>
        ) {
          calls.events.push("session_create")
          calls.sessionCreateParams = params
          calls.sessionCreateOptions = options
          return { id: SESSION_ID }
        },
        async retrieve(id: string) {
          calls.events.push("session_retrieve")
          assert.equal(id, SESSION_ID)
          const params = calls.sessionCreateParams
          assert.ok(params)
          return {
            client_reference_id: params.client_reference_id,
            expires_at: params.expires_at,
            id,
            livemode: false,
            metadata: params.metadata,
            payment_intent: null,
            status: "open",
            url: "https://checkout.stripe.test/session",
          }
        },
      },
    },
    prices: {
      async retrieve(id: string) {
        calls.events.push("price_retrieve")
        assert.equal(id, PRICE_ID)
        return { id }
      },
    },
  }
}

function webhookRequest(
  body = '{"fixture":"stripe-event"}',
  signature: string | null = "t=1,v1=fixture"
) {
  const headers = new Headers()
  if (signature !== null) headers.set("stripe-signature", signature)
  return new Request(`${SITE_URL}/api/stripe/webhook`, {
    body,
    headers,
    method: "POST",
  })
}

function stripeEvent(
  type: string,
  object: Record<string, unknown>,
  livemode = false
) {
  return {
    data: { object },
    id: `evt_${type.replaceAll(".", "_")}`,
    livemode,
    type,
  }
}

function createWebhookCalls(): WebhookCalls {
  return {
    accountChecks: 0,
    dispatches: [],
    eventInserts: [],
    paymentIntentRetrievals: [],
    rawBody: null,
    signature: null,
    webhookSecret: null,
  }
}

function createWebhookAdminClient(
  calls: WebhookCalls,
  options: {
    existing?: boolean
    insertError?: { code?: string } | null
    lookupError?: { code?: string } | null
  } = {}
) {
  return {
    from(table: string) {
      assert.equal(table, "stripe_events")
      const query = {
        eq() {
          return query
        },
        async insert(values: Record<string, unknown>) {
          calls.eventInserts.push(values)
          return { error: options.insertError ?? null }
        },
        async maybeSingle() {
          return {
            data: options.existing ? { id: "evt_existing" } : null,
            error: options.lookupError ?? null,
          }
        },
        select() {
          return query
        },
      }
      return query
    },
  }
}

function createWebhookStripe(
  calls: WebhookCalls,
  event: Record<string, unknown>,
  options: {
    invalidSignature?: boolean
    paymentIntentMetadata?: Record<string, string>
  } = {}
) {
  return {
    paymentIntents: {
      async retrieve(id: string) {
        calls.paymentIntentRetrievals.push(id)
        return {
          id,
          metadata: options.paymentIntentMetadata ?? {
            application: "hwl-by-smd",
            commerce_flow: "lift_checkout_v2",
          },
        }
      },
    },
    webhooks: {
      constructEvent(
        body: Uint8Array,
        signature: string,
        webhookSecret: string
      ) {
        calls.rawBody = Buffer.from(body).toString("utf8")
        calls.signature = signature
        calls.webhookSecret = webhookSecret
        if (options.invalidSignature)
          throw new Error("invalid fixture signature")
        return event
      },
    },
  }
}

function webhookHarness(
  calls: WebhookCalls,
  event: Record<string, unknown>,
  options: {
    accountMatches?: boolean
    existing?: boolean
    insertError?: { code?: string } | null
    invalidSignature?: boolean
    lookupError?: { code?: string } | null
    paymentIntentMetadata?: Record<string, string>
  } = {}
) {
  const database = createWebhookAdminClient(calls, options)
  const stripe = createWebhookStripe(calls, event, options)

  return baseHarness({
    createAdminClient: () => database,
    fulfillCompletedCheckout: async (args) => {
      calls.dispatches.push({ args: [args], kind: "completed" })
      return { state: "fulfilled" }
    },
    getStripe: () => stripe,
    isExpectedStripeAccount: async () => {
      calls.accountChecks += 1
      return options.accountMatches ?? true
    },
    markCheckoutExpired: async (...args) => {
      calls.dispatches.push({ args, kind: "expired" })
      return "processed"
    },
    reconcileFullRefund: async (...args) => {
      calls.dispatches.push({ args, kind: "refunded" })
      return "processed"
    },
    revokeDisputedCharge: async (...args) => {
      calls.dispatches.push({ args, kind: "disputed" })
      return "processed"
    },
  })
}

test("commerce HTTP route boundaries are fail-closed and provider-free", async (t) => {
  await t.test(
    "checkout rejects origin, content, and body drift before readiness",
    async () => {
      let readinessChecks = 0
      setHarness(
        baseHarness({
          isProductCheckoutReady: () => {
            readinessChecks += 1
            return false
          },
        })
      )

      assert.equal(
        (await createCheckout(checkoutRequest({ origin: null }))).status,
        403
      )
      assert.equal(
        (
          await createCheckout(
            checkoutRequest({ contentType: "text/plain;charset=UTF-8" })
          )
        ).status,
        400
      )
      assert.equal(
        (await createCheckout(checkoutRequest({ body: "not-json" }))).status,
        400
      )
      assert.equal(
        (await createCheckout(checkoutRequest({ body: "x".repeat(2_001) })))
          .status,
        413
      )
      assert.equal(
        (
          await createCheckout(
            checkoutRequest({
              body: JSON.stringify({
                attemptId: "checkout-attempt-0001",
                productId: "unknown",
              }),
            })
          )
        ).status,
        400
      )
      assert.equal(readinessChecks, 0)
    }
  )

  await t.test(
    "closed sales stop before identity, database, or Stripe",
    async () => {
      const calls: string[] = []
      setHarness(
        baseHarness({
          createAdminClient: () => {
            calls.push("database")
            return null
          },
          getAuthenticatedUser: async () => {
            calls.push("identity")
            return null
          },
          getStripe: () => {
            calls.push("stripe")
            return null
          },
          isProductCheckoutReady: () => false,
        })
      )

      const response = await createCheckout(checkoutRequest())
      assert.equal(response.status, 503)
      assert.deepEqual(calls, [])
    }
  )

  await t.test(
    "open readiness still requires the signed-in owner before providers",
    async () => {
      const calls: string[] = []
      setHarness(
        baseHarness({
          createAdminClient: () => {
            calls.push("database")
            return null
          },
          getAuthenticatedUser: async () => {
            calls.push("identity")
            return null
          },
          getStripe: () => {
            calls.push("stripe")
            return null
          },
          isProductCheckoutReady: () => true,
        })
      )

      const response = await createCheckout(checkoutRequest())
      assert.equal(response.status, 401)
      assert.deepEqual(calls, ["identity"])
      assert.deepEqual(await response.json(), {
        loginUrl: "/login?redirectTo=%2Fbeauty%2Flift%3Fcart%3Dopen",
      })
    }
  )

  await t.test(
    "one verified request creates one exact LIFT Checkout Session",
    async () => {
      Reflect.set(process.env, "LIFT_PDF_STORAGE_PATH", "lift/lift-guide.pdf")
      Reflect.set(
        process.env,
        "LIFT_VIDEO_STORAGE_PATH",
        "lift/complete-lift-v1.mp4"
      )
      const calls = createCheckoutCalls()
      const database = createCheckoutAdminClient(calls)
      const stripe = createCheckoutStripe(calls)

      setHarness(
        baseHarness({
          createAdminClient: () => database,
          getAuthenticatedUser: async () => ({
            id: USER_ID,
            email: USER_EMAIL,
          }),
          getStripe: () => stripe,
          isExpectedStripeAccount: async () => {
            calls.events.push("account_check")
            return true
          },
          isExpectedStripePrice: (productId, price) => {
            calls.events.push("price_check")
            assert.equal(productId, "lift_guide")
            assert.deepEqual(price, { id: PRICE_ID })
            return true
          },
          isProductCheckoutReady: () => true,
        })
      )

      const response = await createCheckout(checkoutRequest())
      assert.equal(response.status, 200)
      assert.deepEqual(await response.json(), {
        url: "https://checkout.stripe.test/session",
      })
      assert.deepEqual(calls.storage, [
        {
          bucket: "member-content",
          path: "lift/lift-guide.pdf",
          seconds: 60,
        },
        {
          bucket: "member-content",
          path: "lift/complete-lift-v1.mp4",
          seconds: 60,
        },
      ])
      assert.deepEqual(calls.events, [
        "account_check",
        "profile_lookup",
        "customer_lookup",
        "purchase_lookup",
        "asset:lift/lift-guide.pdf",
        "asset:lift/complete-lift-v1.mp4",
        "price_retrieve",
        "price_check",
        "order_lookup",
        "order_insert",
        "session_create",
        "session_retrieve",
        "order_update",
      ])
      assert.equal(calls.orderInserts.length, 1)
      assert.equal(calls.orderUpdates.length, 1)

      const order = calls.orderInserts[0]
      const params = calls.sessionCreateParams
      const options = calls.sessionCreateOptions
      assert.ok(order)
      assert.ok(params)
      assert.ok(options)
      assert.deepEqual(params.line_items, [{ price: PRICE_ID, quantity: 1 }])
      assert.deepEqual(params.payment_method_types, ["card"])
      assert.equal(params.mode, "payment")
      assert.equal(params.customer_email, USER_EMAIL)
      assert.equal(params.client_reference_id, USER_ID)
      assert.equal(
        params.success_url,
        `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
      )
      assert.equal(
        params.cancel_url,
        `${SITE_URL}/beauty/lift?cart=open&checkout=cancelled`
      )
      assert.deepEqual(params.metadata, {
        application: "hwl-by-smd",
        catalog_version: "lift-complete-v2",
        checkout_attempt_id: "checkout-attempt-0001",
        checkout_order_id: order.id,
        deployment_target: "preview",
        price_id: PRICE_ID,
        product_type: "lift_guide",
        stripe_account_id: ACCOUNT_ID,
        stripe_mode: "test",
        stripe_product_id: PRODUCT_ID,
        user_id: USER_ID,
      })
      assert.deepEqual(params.payment_intent_data, {
        metadata: params.metadata,
        receipt_email: USER_EMAIL,
      })
      assert.equal(
        options.idempotencyKey,
        `hwl:checkout:preview:${ACCOUNT_ID}:test:${String(order.id)}`
      )
    }
  )

  await t.test(
    "an existing Stripe customer still receives the signed-in account receipt",
    async () => {
      Reflect.set(process.env, "LIFT_PDF_STORAGE_PATH", "lift/lift-guide.pdf")
      Reflect.set(
        process.env,
        "LIFT_VIDEO_STORAGE_PATH",
        "lift/complete-lift-v1.mp4"
      )
      const calls = createCheckoutCalls()
      const database = createCheckoutAdminClient(calls, {
        stripeCustomerId: STRIPE_CUSTOMER_ID,
      })
      const stripe = createCheckoutStripe(calls)

      setHarness(
        baseHarness({
          createAdminClient: () => database,
          getAuthenticatedUser: async () => ({
            id: USER_ID,
            email: USER_EMAIL,
          }),
          getStripe: () => stripe,
          isExpectedStripeAccount: async () => true,
          isExpectedStripePrice: () => true,
          isProductCheckoutReady: () => true,
        })
      )

      const response = await createCheckout(checkoutRequest())
      assert.equal(response.status, 200)

      const order = calls.orderInserts[0]
      const params = calls.sessionCreateParams
      const options = calls.sessionCreateOptions
      assert.ok(order)
      assert.ok(params)
      assert.ok(options)
      assert.equal(order.customer_email, USER_EMAIL)
      assert.equal(order.stripe_customer_id, STRIPE_CUSTOMER_ID)
      assert.equal(params.customer, STRIPE_CUSTOMER_ID)
      assert.equal(params.customer_creation, undefined)
      assert.equal(params.customer_email, undefined)
      assert.deepEqual(params.payment_intent_data, {
        metadata: params.metadata,
        receipt_email: USER_EMAIL,
      })
      assert.equal(
        options.idempotencyKey,
        `hwl:checkout:preview:${ACCOUNT_ID}:test:${String(order.id)}`
      )
    }
  )

  await t.test(
    "webhook configuration and signature boundaries fail before reads",
    async () => {
      Reflect.set(process.env, "STRIPE_WEBHOOK_SECRET", "whsec_route_fixture")
      const event = stripeEvent("checkout.session.completed", {
        id: SESSION_ID,
        metadata: LEGACY_LIFT_METADATA,
      })

      setHarness(baseHarness())
      assert.equal((await receiveStripeWebhook(webhookRequest())).status, 503)

      const missingSignatureCalls = createWebhookCalls()
      setHarness(webhookHarness(missingSignatureCalls, event))
      assert.equal(
        (await receiveStripeWebhook(webhookRequest("{}", null))).status,
        400
      )
      assert.equal(missingSignatureCalls.rawBody, null)
      assert.equal(missingSignatureCalls.accountChecks, 0)

      const oversizedCalls = createWebhookCalls()
      setHarness(webhookHarness(oversizedCalls, event))
      assert.equal(
        (
          await receiveStripeWebhook(
            webhookRequest("x".repeat(1_000_001), "fixture-signature")
          )
        ).status,
        413
      )
      assert.equal(oversizedCalls.rawBody, null)
      assert.equal(oversizedCalls.accountChecks, 0)

      const invalidCalls = createWebhookCalls()
      setHarness(
        webhookHarness(invalidCalls, event, { invalidSignature: true })
      )
      const invalid = await receiveStripeWebhook(
        webhookRequest('{"exact":"raw-body"}', "fixture-signature")
      )
      assert.equal(invalid.status, 400)
      assert.equal(invalidCalls.rawBody, '{"exact":"raw-body"}')
      assert.equal(invalidCalls.signature, "fixture-signature")
      assert.equal(invalidCalls.webhookSecret, "whsec_route_fixture")
      assert.equal(invalidCalls.accountChecks, 0)
    }
  )

  await t.test(
    "webhook mode and account drift reject before persistence",
    async () => {
      Reflect.set(process.env, "STRIPE_WEBHOOK_SECRET", "whsec_route_fixture")

      const wrongModeCalls = createWebhookCalls()
      setHarness(
        webhookHarness(
          wrongModeCalls,
          stripeEvent(
            "checkout.session.completed",
            { id: SESSION_ID, metadata: LEGACY_LIFT_METADATA },
            true
          )
        )
      )
      assert.equal((await receiveStripeWebhook(webhookRequest())).status, 400)
      assert.equal(wrongModeCalls.accountChecks, 0)
      assert.deepEqual(wrongModeCalls.eventInserts, [])

      const wrongAccountCalls = createWebhookCalls()
      setHarness(
        webhookHarness(
          wrongAccountCalls,
          stripeEvent("checkout.session.completed", {
            id: SESSION_ID,
            metadata: LEGACY_LIFT_METADATA,
          }),
          { accountMatches: false }
        )
      )
      assert.equal((await receiveStripeWebhook(webhookRequest())).status, 503)
      assert.equal(wrongAccountCalls.accountChecks, 1)
      assert.deepEqual(wrongAccountCalls.dispatches, [])
      assert.deepEqual(wrongAccountCalls.eventInserts, [])
    }
  )

  await t.test(
    "webhook dispatch is exact for all four launch events",
    async (t) => {
      Reflect.set(process.env, "STRIPE_WEBHOOK_SECRET", "whsec_route_fixture")
      const cases = [
        {
          kind: "completed",
          object: { id: SESSION_ID, metadata: LEGACY_LIFT_METADATA },
          type: "checkout.session.completed",
        },
        {
          kind: "expired",
          object: { id: SESSION_ID, metadata: LEGACY_LIFT_METADATA },
          type: "checkout.session.expired",
        },
        {
          kind: "refunded",
          object: {
            id: "ch_route_fixture",
            payment_intent: "pi_route_fixture",
            refunded: true,
          },
          type: "charge.refunded",
        },
        {
          kind: "disputed",
          object: {
            id: "dp_route_fixture",
            payment_intent: "pi_route_fixture",
          },
          type: "charge.dispute.created",
        },
      ] as const

      for (const fixture of cases) {
        await t.test(fixture.type, async () => {
          const calls = createWebhookCalls()
          const event = stripeEvent(fixture.type, fixture.object)
          setHarness(webhookHarness(calls, event))

          const response = await receiveStripeWebhook(webhookRequest())
          assert.equal(response.status, 200)
          assert.equal(await response.text(), "ok")
          assert.equal(calls.accountChecks, 1)
          assert.deepEqual(
            calls.dispatches.map(({ kind }) => kind),
            [fixture.kind]
          )
          assert.deepEqual(calls.eventInserts, [
            {
              deployment_target: "preview",
              event_type: fixture.type,
              id: event.id,
              stripe_account_id: ACCOUNT_ID,
              stripe_livemode: false,
            },
          ])
        })
      }

      await t.test(
        "an unrelated event dispatches nothing but is receipted",
        async () => {
          const calls = createWebhookCalls()
          const event = stripeEvent("customer.updated", { id: "cus_fixture" })
          setHarness(webhookHarness(calls, event))

          const response = await receiveStripeWebhook(webhookRequest())
          assert.equal(response.status, 200)
          assert.deepEqual(calls.dispatches, [])
          assert.equal(calls.eventInserts.length, 1)
        }
      )

      for (const fixture of [
        {
          object: {
            id: "cs_service_completed_fixture",
            metadata: {
              application: "hwl-by-smd",
              commerce_flow: "service_invoice_v1",
            },
          },
          type: "checkout.session.completed",
        },
        {
          object: {
            id: "cs_service_expired_fixture",
            metadata: {
              application: "hwl-by-smd",
              commerce_flow: "service_invoice_v1",
            },
          },
          type: "checkout.session.expired",
        },
      ] as const) {
        await t.test(
          `${fixture.type} fails closed while service payments are inactive`,
          async () => {
            const calls = createWebhookCalls()
            setHarness(webhookHarness(calls, stripeEvent(fixture.type, fixture.object)))

            const response = await receiveStripeWebhook(webhookRequest())
            assert.equal(response.status, 503)
            assert.equal(
              await response.text(),
              "Service commerce flow is not active."
            )
            assert.deepEqual(calls.dispatches, [])
            assert.deepEqual(calls.eventInserts, [])
          }
        )
      }

      for (const type of [
        "checkout.session.completed",
        "checkout.session.expired",
      ] as const) {
        await t.test(
          `${type} rejects an unknown HWL commerce flow without a receipt`,
          async () => {
            const calls = createWebhookCalls()
            setHarness(
              webhookHarness(
                calls,
                stripeEvent(type, {
                  id: "cs_unknown_flow_fixture",
                  metadata: {
                    application: "hwl-by-smd",
                    commerce_flow: "lift_checkout_v3_typo",
                  },
                })
              )
            )

            const response = await receiveStripeWebhook(webhookRequest())
            assert.equal(response.status, 500)
            assert.equal(
              await response.text(),
              "Stripe commerce flow metadata did not match."
            )
            assert.deepEqual(calls.dispatches, [])
            assert.deepEqual(calls.eventInserts, [])
          }
        )
      }

      for (const fixture of [
        {
          object: {
            id: "ch_service_fixture",
            payment_intent: "pi_service_fixture",
            refunded: true,
          },
          type: "charge.refunded",
        },
        {
          object: {
            id: "dp_service_fixture",
            payment_intent: "pi_service_fixture",
          },
          type: "charge.dispute.created",
        },
      ] as const) {
        await t.test(
          `${fixture.type} for service invoices never enters LIFT`,
          async () => {
            const calls = createWebhookCalls()
            const event = stripeEvent(fixture.type, fixture.object)
            setHarness(
              webhookHarness(calls, event, {
                paymentIntentMetadata: {
                  application: "hwl-by-smd",
                  commerce_flow: "service_invoice_v1",
                },
              })
            )

            const response = await receiveStripeWebhook(webhookRequest())
            assert.equal(response.status, 503)
            assert.equal(
              await response.text(),
              "Service commerce flow is not active."
            )
            assert.deepEqual(calls.paymentIntentRetrievals, [
              "pi_service_fixture",
            ])
            assert.deepEqual(calls.dispatches, [])
            assert.deepEqual(calls.eventInserts, [])
          }
        )
      }

      for (const fixture of [
        {
          object: {
            id: "ch_mismatch_fixture",
            metadata: {
              application: "hwl-by-smd",
              commerce_flow: "service_invoice_v1",
            },
            payment_intent: "pi_mismatch_fixture",
            refunded: true,
          },
          type: "charge.refunded",
        },
        {
          object: {
            id: "dp_mismatch_fixture",
            metadata: {
              application: "hwl-by-smd",
              commerce_flow: "service_invoice_v1",
            },
            payment_intent: "pi_mismatch_fixture",
          },
          type: "charge.dispute.created",
        },
      ] as const) {
        await t.test(
          `${fixture.type} rejects contradictory event and PaymentIntent flows`,
          async () => {
            const calls = createWebhookCalls()
            const event = stripeEvent(fixture.type, fixture.object)
            setHarness(webhookHarness(calls, event))

            const response = await receiveStripeWebhook(webhookRequest())
            assert.equal(response.status, 500)
            assert.equal(
              await response.text(),
              "Stripe commerce flow metadata did not match."
            )
            assert.deepEqual(calls.paymentIntentRetrievals, [
              "pi_mismatch_fixture",
            ])
            assert.deepEqual(calls.dispatches, [])
            assert.deepEqual(calls.eventInserts, [])
          }
        )
      }

      for (const fixture of [
        {
          object: {
            id: "ch_unknown_flow_fixture",
            payment_intent: "pi_unknown_flow_fixture",
            refunded: true,
          },
          type: "charge.refunded",
        },
        {
          object: {
            id: "dp_unknown_flow_fixture",
            payment_intent: "pi_unknown_flow_fixture",
          },
          type: "charge.dispute.created",
        },
      ] as const) {
        await t.test(
          `${fixture.type} rejects an unknown authoritative HWL flow`,
          async () => {
            const calls = createWebhookCalls()
            setHarness(
              webhookHarness(calls, stripeEvent(fixture.type, fixture.object), {
                paymentIntentMetadata: {
                  application: "hwl-by-smd",
                  commerce_flow: "service_invoice_v1_typo",
                },
              })
            )

            const response = await receiveStripeWebhook(webhookRequest())
            assert.equal(response.status, 500)
            assert.equal(
              await response.text(),
              "Stripe commerce flow metadata did not match."
            )
            assert.deepEqual(calls.paymentIntentRetrievals, [
              "pi_unknown_flow_fixture",
            ])
            assert.deepEqual(calls.dispatches, [])
            assert.deepEqual(calls.eventInserts, [])
          }
        )
      }
    }
  )

  await t.test(
    "foreign and duplicate webhook delivery never double-writes",
    async () => {
      Reflect.set(process.env, "STRIPE_WEBHOOK_SECRET", "whsec_route_fixture")
      const event = stripeEvent("checkout.session.completed", {
        id: SESSION_ID,
        metadata: LEGACY_LIFT_METADATA,
      })

      const foreignCalls = createWebhookCalls()
      const foreign = webhookHarness(foreignCalls, event)
      foreign.fulfillCompletedCheckout = async (args) => {
        foreignCalls.dispatches.push({ args: [args], kind: "completed" })
        return { state: "ignored" }
      }
      setHarness(foreign)
      const foreignResponse = await receiveStripeWebhook(webhookRequest())
      assert.equal(foreignResponse.status, 200)
      assert.equal(
        await foreignResponse.text(),
        "Ignored foreign commerce namespace."
      )
      assert.deepEqual(
        foreignCalls.dispatches.map(({ kind }) => kind),
        ["completed"]
      )
      assert.deepEqual(foreignCalls.eventInserts, [])

      const duplicateCalls = createWebhookCalls()
      setHarness(webhookHarness(duplicateCalls, event, { existing: true }))
      const duplicateResponse = await receiveStripeWebhook(webhookRequest())
      assert.equal(duplicateResponse.status, 200)
      assert.equal(await duplicateResponse.text(), "Already processed.")
      assert.deepEqual(duplicateCalls.dispatches, [])
      assert.deepEqual(duplicateCalls.eventInserts, [])

      const insertRaceCalls = createWebhookCalls()
      setHarness(
        webhookHarness(insertRaceCalls, event, {
          insertError: { code: "23505" },
        })
      )
      const insertRaceResponse = await receiveStripeWebhook(webhookRequest())
      assert.equal(insertRaceResponse.status, 200)
      assert.equal(insertRaceCalls.dispatches.length, 1)
      assert.equal(insertRaceCalls.eventInserts.length, 1)
    }
  )
})
