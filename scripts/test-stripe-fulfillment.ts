import assert from "node:assert/strict"
import test from "node:test"

import {
  fulfillCompletedCheckout,
  markCheckoutExpired,
  reconcileFullRefund,
  revokeDisputedCharge,
} from "../lib/commerce/stripe-fulfillment.ts"

process.env.HWL_DEPLOYMENT_TARGET = "preview"
process.env.STRIPE_LIVEMODE = "false"
delete process.env.VERCEL
delete process.env.VERCEL_ENV

type CheckoutMetadata = {
  application: string
  catalog_version: string
  checkout_order_id: string
  commerce_flow?: string
  deployment_target: "development" | "preview" | "production"
  price_id: string
  product_type: "lift_guide"
  stripe_account_id: string
  stripe_mode: "live" | "test"
  stripe_product_id: string
  user_id: string
}

const identity: CheckoutMetadata = {
  application: "hwl-by-smd",
  catalog_version: "lift-complete-v2",
  checkout_order_id: "11111111-1111-4111-8111-111111111111",
  deployment_target: "preview",
  price_id: "price_fixture12345678",
  product_type: "lift_guide",
  stripe_account_id: "acct_fixture12345678",
  stripe_mode: "test",
  stripe_product_id: "prod_fixture12345678",
  user_id: "22222222-2222-4222-8222-222222222222",
}

const sessionId = `cs_test_${"s".repeat(24)}`
const paymentIntentId = `pi_${"p".repeat(24)}`
const chargeId = `ch_${"c".repeat(24)}`

type Row = Record<string, unknown>
type TableName =
  "checkout_orders" | "profiles" | "purchases" | "stripe_customers"

type FakeState = Record<TableName, Row[]>

type Filter =
  | { column: string; kind: "eq" | "is" | "neq"; value: unknown }
  | { column: string; kind: "in"; value: unknown[] }

class FakeQuery implements PromiseLike<{ data: unknown; error: Row | null }> {
  private readonly database: FakeDatabase
  private filters: Filter[] = []
  private operation: "insert" | "select" | "update" | "upsert" = "select"
  private options: { onConflict?: string } = {}
  private returnRows = false
  private readonly table: TableName
  private values: Row | Row[] | null = null

  constructor(database: FakeDatabase, table: TableName) {
    this.database = database
    this.table = table
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, kind: "eq", value })
    return this
  }

  in(column: string, value: unknown[]) {
    this.filters.push({ column, kind: "in", value })
    return this
  }

  insert(values: Row | Row[]) {
    this.operation = "insert"
    this.values = values
    return this
  }

  is(column: string, value: unknown) {
    this.filters.push({ column, kind: "is", value })
    return this
  }

  async maybeSingle() {
    const result = this.execute()
    if (result.error) return result
    const rows = result.data as Row[]
    if (rows.length > 1) {
      return { data: null, error: { code: "PGRST116" } }
    }
    return { data: rows[0] ?? null, error: null }
  }

  neq(column: string, value: unknown) {
    this.filters.push({ column, kind: "neq", value })
    return this
  }

  select(columns?: string) {
    void columns
    this.returnRows = true
    return this
  }

  async single() {
    const result = await this.maybeSingle()
    if (result.error || !result.data) {
      return { data: null, error: result.error ?? { code: "PGRST116" } }
    }
    return result
  }

  then<TResult1 = { data: unknown; error: Row | null }, TResult2 = never>(
    onfulfilled?:
      | ((value: {
          data: unknown
          error: Row | null
        }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected)
  }

  update(values: Row) {
    this.operation = "update"
    this.values = values
    return this
  }

  upsert(values: Row, options: { onConflict?: string } = {}) {
    this.operation = "upsert"
    this.options = options
    this.values = values
    return this
  }

  private execute(): { data: Row[] | null; error: Row | null } {
    const rows = this.database.state[this.table]
    const matchingRows = rows.filter((row) =>
      this.filters.every((filter) => {
        if (filter.kind === "eq") return row[filter.column] === filter.value
        if (filter.kind === "neq") return row[filter.column] !== filter.value
        if (filter.kind === "in")
          return filter.value.includes(row[filter.column])
        return row[filter.column] === filter.value
      })
    )

    if (this.operation === "select") {
      return { data: matchingRows, error: null }
    }

    if (
      this.operation === "update" &&
      this.table === "checkout_orders" &&
      this.database.failNextPaidOrderUpdate &&
      !Array.isArray(this.values) &&
      this.values?.status === "paid"
    ) {
      this.database.failNextPaidOrderUpdate = false
      return { data: null, error: { code: "INJECTED_POST_PURCHASE_FAILURE" } }
    }

    if (
      this.operation === "update" &&
      this.table === "checkout_orders" &&
      this.database.skipNextPaidOrderUpdate &&
      !Array.isArray(this.values) &&
      this.values?.status === "paid"
    ) {
      this.database.skipNextPaidOrderUpdate = false
      return { data: this.returnRows ? [] : null, error: null }
    }

    if (
      this.operation === "insert" &&
      this.table === "purchases" &&
      this.database.failNextPurchaseInsert
    ) {
      this.database.failNextPurchaseInsert = false
      return { data: null, error: { code: "INJECTED_PURCHASE_INSERT_FAILURE" } }
    }

    if (this.operation === "upsert" && this.table === "stripe_customers") {
      this.database.stripeCustomerUpsertCount += 1
      if (this.database.failNextStripeCustomerUpsert) {
        this.database.failNextStripeCustomerUpsert = false
        return {
          data: null,
          error: { code: "INJECTED_STRIPE_CUSTOMER_FAILURE" },
        }
      }
    }

    if (
      this.operation === "update" &&
      this.table === "checkout_orders" &&
      this.database.skipNextProvenanceUpdate &&
      !Array.isArray(this.values) &&
      this.values?.fulfillment_source
    ) {
      this.database.skipNextProvenanceUpdate = false
      return { data: this.returnRows ? [] : null, error: null }
    }

    if (this.operation === "update") {
      assert.ok(this.values && !Array.isArray(this.values))
      for (const row of matchingRows) Object.assign(row, this.values)
      return { data: this.returnRows ? matchingRows : null, error: null }
    }

    const values = Array.isArray(this.values) ? this.values : [this.values]
    assert.ok(values.every(Boolean))

    if (this.operation === "upsert") {
      const conflictColumns = (this.options.onConflict ?? "")
        .split(",")
        .filter(Boolean)
      const changedRows: Row[] = []
      for (const value of values as Row[]) {
        const existing = rows.find((row) =>
          conflictColumns.every((column) => row[column] === value[column])
        )
        if (existing) {
          Object.assign(existing, value)
          changedRows.push(existing)
        } else {
          rows.push({ ...value })
          changedRows.push(rows.at(-1)!)
        }
      }
      return { data: this.returnRows ? changedRows : null, error: null }
    }

    for (const value of values as Row[]) {
      if (this.database.hasUniqueConflict(this.table, value)) {
        return { data: null, error: { code: "23505" } }
      }
    }
    const insertedRows = (values as Row[]).map((value) => ({ ...value }))
    rows.push(...insertedRows)
    return { data: this.returnRows ? insertedRows : null, error: null }
  }
}

class FakeDatabase {
  failNextPaidOrderUpdate = false
  failNextPurchaseInsert = false
  failNextStripeCustomerUpsert = false
  skipNextPaidOrderUpdate = false
  skipNextProvenanceUpdate = false
  stripeCustomerUpsertCount = 0
  readonly state: FakeState

  constructor(state: FakeState) {
    this.state = state
  }

  from(table: TableName) {
    return new FakeQuery(this, table)
  }

  hasUniqueConflict(table: TableName, candidate: Row) {
    const rows = this.state[table]
    if (table === "purchases") {
      return rows.some(
        (row) =>
          row.deployment_target === candidate.deployment_target &&
          row.stripe_account_id === candidate.stripe_account_id &&
          row.stripe_livemode === candidate.stripe_livemode &&
          (row.stripe_payment_intent_id ===
            candidate.stripe_payment_intent_id ||
            row.stripe_checkout_session_id ===
              candidate.stripe_checkout_session_id)
      )
    }
    if (table === "stripe_customers") {
      return rows.some(
        (row) =>
          row.user_id === candidate.user_id &&
          row.deployment_target === candidate.deployment_target &&
          row.stripe_account_id === candidate.stripe_account_id &&
          row.stripe_livemode === candidate.stripe_livemode
      )
    }
    return false
  }
}

function checkoutMetadata(overrides: Partial<CheckoutMetadata> = {}) {
  return { ...identity, ...overrides }
}

function paymentIntent(
  metadata = checkoutMetadata(),
  chargeOverrides: Row = {}
) {
  const charge = {
    amount: 1111,
    amount_refunded: 0,
    currency: "usd",
    disputed: false,
    id: chargeId,
    livemode: false,
    paid: true,
    payment_intent: paymentIntentId,
    refunded: false,
    status: "succeeded",
    ...chargeOverrides,
  }

  return {
    amount_received: 1111,
    currency: "usd",
    id: paymentIntentId,
    latest_charge: charge,
    livemode: false,
    metadata,
    status: "succeeded",
  }
}

function checkoutSession(overrides: Row = {}) {
  const metadata =
    (overrides.metadata as typeof identity | undefined) ?? checkoutMetadata()
  const intent =
    (overrides.payment_intent as
      ReturnType<typeof paymentIntent> | undefined) ?? paymentIntent(metadata)

  return {
    amount_total: 1111,
    client_reference_id: metadata.user_id,
    currency: "usd",
    customer: "cus_fixture12345678",
    id: sessionId,
    line_items: {
      data: [
        {
          amount_total: 1111,
          price: {
            currency: "usd",
            id: metadata.price_id,
            livemode: false,
            product: { id: metadata.stripe_product_id },
            recurring: null,
            type: "one_time",
            unit_amount: 1111,
          },
          quantity: 1,
        },
      ],
    },
    livemode: false,
    metadata,
    mode: "payment",
    payment_intent: intent,
    payment_status: "paid",
    status: "complete",
    ...overrides,
  }
}

function checkoutOrder(overrides: Row = {}) {
  return {
    catalog_version: identity.catalog_version,
    deployment_target: identity.deployment_target,
    fulfilled_at: null,
    fulfillment_source: null,
    id: identity.checkout_order_id,
    product_type: identity.product_type,
    status: "open",
    stripe_account_id: identity.stripe_account_id,
    stripe_checkout_session_id: sessionId,
    stripe_livemode: false,
    stripe_payment_intent_id: null,
    stripe_price_id: identity.price_id,
    stripe_product_id: identity.stripe_product_id,
    user_id: identity.user_id,
    ...overrides,
  }
}

function purchase(status: string, overrides: Row = {}) {
  return {
    amount_paid: 11.11,
    catalog_version: identity.catalog_version,
    currency: "usd",
    deployment_target: identity.deployment_target,
    id: "33333333-3333-4333-8333-333333333333",
    product_type: identity.product_type,
    status,
    stripe_account_id: identity.stripe_account_id,
    stripe_checkout_session_id: sessionId,
    stripe_livemode: false,
    stripe_payment_intent_id: paymentIntentId,
    stripe_price_id: identity.price_id,
    stripe_product_id: identity.stripe_product_id,
    user_id: identity.user_id,
    ...overrides,
  }
}

function database(overrides: Partial<FakeState> = {}) {
  return new FakeDatabase({
    checkout_orders: overrides.checkout_orders ?? [checkoutOrder()],
    profiles: overrides.profiles ?? [{ id: identity.user_id }],
    purchases: overrides.purchases ?? [],
    stripe_customers: overrides.stripe_customers ?? [],
  })
}

function stripe(session = checkoutSession(), intent = paymentIntent()) {
  return {
    checkout: {
      sessions: {
        retrieve: async () => session,
      },
    },
    paymentIntents: {
      retrieve: async () => intent,
    },
  }
}

const exactExpectation = {
  catalogVersion: identity.catalog_version,
  deploymentTarget: "preview" as const,
  orderId: identity.checkout_order_id,
  priceId: identity.price_id,
  productType: "lift_guide" as const,
  stripeProductId: identity.stripe_product_id,
  userId: identity.user_id,
}

async function reconcile(
  fakeDatabase: FakeDatabase,
  fakeStripe = stripe(),
  source:
    | "authenticated_reconciliation"
    | "scheduled_reconciliation"
    | "webhook" = "authenticated_reconciliation"
) {
  return fulfillCompletedCheckout({
    deploymentTarget: "preview",
    expectation: source === "webhook" ? {} : exactExpectation,
    sessionId,
    source,
    stripe: fakeStripe as never,
    stripeAccountId: identity.stripe_account_id,
    stripeLivemode: false,
    supabase: fakeDatabase as never,
  })
}

test("the shared verifier fulfills once and duplicate replay only repairs", async () => {
  const fakeDatabase = database()
  const first = await reconcile(fakeDatabase, stripe(), "webhook")
  const second = await reconcile(fakeDatabase)

  assert.deepEqual(first, { purchaseStatus: "active", state: "fulfilled" })
  assert.deepEqual(second, {
    purchaseStatus: "active",
    state: "already_active",
  })
  assert.equal(fakeDatabase.state.purchases.length, 1)
  assert.equal(fakeDatabase.state.checkout_orders[0].status, "paid")
  assert.equal(
    fakeDatabase.state.checkout_orders[0].stripe_payment_intent_id,
    paymentIntentId
  )
  assert.equal(
    fakeDatabase.state.checkout_orders[0].fulfillment_source,
    "webhook"
  )
  assert.equal(
    typeof fakeDatabase.state.checkout_orders[0].fulfilled_at,
    "string"
  )
})

test("the explicit LIFT flow marker fulfills while legacy metadata stays valid", async () => {
  const markedMetadata = checkoutMetadata({
    commerce_flow: "lift_checkout_v2",
  })
  const markedIntent = paymentIntent(markedMetadata)
  const markedSession = checkoutSession({
    metadata: markedMetadata,
    payment_intent: markedIntent,
  })
  const fakeDatabase = database()

  const result = await reconcile(
    fakeDatabase,
    stripe(markedSession, markedIntent),
    "webhook"
  )

  assert.deepEqual(result, { purchaseStatus: "active", state: "fulfilled" })
  assert.equal(fakeDatabase.state.purchases.length, 1)
})

test("scheduled reconciliation is recorded as its own first-writer source", async () => {
  const fakeDatabase = database()
  const result = await reconcile(
    fakeDatabase,
    stripe(),
    "scheduled_reconciliation"
  )

  assert.deepEqual(result, { purchaseStatus: "active", state: "fulfilled" })
  assert.equal(fakeDatabase.state.purchases.length, 1)
  assert.equal(
    fakeDatabase.state.checkout_orders[0].fulfillment_source,
    "scheduled_reconciliation"
  )
})

test("scheduled monitoring revokes provider-refunded and disputed purchases", async () => {
  for (const fixture of [
    {
      charge: { disputed: true },
      expectedStatus: "disputed" as const,
    },
    {
      charge: { amount_refunded: 1111, disputed: true, refunded: true },
      expectedStatus: "refunded" as const,
    },
  ]) {
    const terminalIntent = paymentIntent(checkoutMetadata(), fixture.charge)
    const terminalSession = checkoutSession({
      payment_intent: terminalIntent,
    })
    const fakeDatabase = database({
      checkout_orders: [
        checkoutOrder({
          fulfilled_at: "2026-08-29T12:00:00.000Z",
          fulfillment_source: "webhook",
          status: "paid",
          stripe_payment_intent_id: paymentIntentId,
        }),
      ],
      purchases: [purchase("active")],
    })

    const result = await reconcile(
      fakeDatabase,
      stripe(terminalSession, terminalIntent),
      "scheduled_reconciliation"
    )

    assert.deepEqual(result, {
      purchaseStatus: fixture.expectedStatus,
      state: "terminal",
    })
    assert.equal(fakeDatabase.state.purchases[0].status, fixture.expectedStatus)
    assert.equal(
      fakeDatabase.state.checkout_orders[0].status,
      fixture.expectedStatus
    )
    assert.equal(
      fakeDatabase.state.checkout_orders[0].fulfillment_source,
      "webhook"
    )
  }
})

test("verified terminal revocation bypasses auxiliary customer bookkeeping", async () => {
  const refundedIntent = paymentIntent(checkoutMetadata(), {
    amount_refunded: 1111,
    refunded: true,
  })
  const refundedSession = checkoutSession({ payment_intent: refundedIntent })
  const fakeDatabase = database({
    checkout_orders: [
      checkoutOrder({
        fulfilled_at: "2026-08-29T12:00:00.000Z",
        fulfillment_source: "webhook",
        status: "paid",
        stripe_payment_intent_id: paymentIntentId,
      }),
    ],
    purchases: [purchase("active")],
  })
  fakeDatabase.failNextStripeCustomerUpsert = true

  const result = await reconcile(
    fakeDatabase,
    stripe(refundedSession, refundedIntent),
    "scheduled_reconciliation"
  )

  assert.deepEqual(result, {
    purchaseStatus: "refunded",
    state: "terminal",
  })
  assert.equal(fakeDatabase.state.purchases[0].status, "refunded")
  assert.equal(fakeDatabase.state.checkout_orders[0].status, "refunded")
  assert.equal(fakeDatabase.stripeCustomerUpsertCount, 0)
})

test("active fulfillment still fails closed when customer mapping fails", async () => {
  const fakeDatabase = database()
  fakeDatabase.failNextStripeCustomerUpsert = true

  await assert.rejects(reconcile(fakeDatabase), {
    code: "INJECTED_STRIPE_CUSTOMER_FAILURE",
  })
  assert.equal(fakeDatabase.stripeCustomerUpsertCount, 1)
  assert.equal(fakeDatabase.state.purchases.length, 0)
  assert.equal(fakeDatabase.state.checkout_orders[0].status, "open")
})

test("non-webhook reconciliation requires an exact expected identity", async () => {
  const fakeDatabase = database()
  let retrieveCount = 0
  const fakeStripe = {
    checkout: {
      sessions: {
        retrieve: async () => {
          retrieveCount += 1
          return checkoutSession()
        },
      },
    },
  }

  await assert.rejects(
    fulfillCompletedCheckout({
      deploymentTarget: "preview",
      sessionId,
      source: "scheduled_reconciliation",
      stripe: fakeStripe as never,
      stripeAccountId: identity.stripe_account_id,
      stripeLivemode: false,
      supabase: fakeDatabase as never,
    }),
    /complete expected identity/
  )
  assert.equal(retrieveCount, 0)
  assert.equal(fakeDatabase.state.purchases.length, 0)
})

test("an order transition failure grants no access and replay repairs it", async () => {
  const fakeDatabase = database()
  fakeDatabase.failNextPaidOrderUpdate = true

  await assert.rejects(reconcile(fakeDatabase))
  assert.equal(fakeDatabase.state.purchases.length, 0)
  assert.equal(fakeDatabase.state.checkout_orders[0].status, "open")
  assert.equal(fakeDatabase.state.checkout_orders[0].fulfillment_source, null)

  const replay = await reconcile(fakeDatabase)
  assert.deepEqual(replay, {
    purchaseStatus: "active",
    state: "fulfilled",
  })
  assert.equal(fakeDatabase.state.purchases.length, 1)
  assert.equal(fakeDatabase.state.checkout_orders[0].status, "paid")
  assert.equal(
    fakeDatabase.state.checkout_orders[0].stripe_payment_intent_id,
    paymentIntentId
  )
  assert.equal(
    fakeDatabase.state.checkout_orders[0].fulfillment_source,
    "authenticated_reconciliation"
  )
})

test("a zero-row order transition fails closed and replay repairs it", async () => {
  const fakeDatabase = database()
  fakeDatabase.skipNextPaidOrderUpdate = true

  await assert.rejects(
    reconcile(fakeDatabase),
    /did not reach its verified final state/
  )
  assert.equal(fakeDatabase.state.purchases.length, 0)
  assert.equal(fakeDatabase.state.checkout_orders[0].status, "open")
  assert.equal(fakeDatabase.state.checkout_orders[0].fulfillment_source, null)

  const replay = await reconcile(fakeDatabase)
  assert.deepEqual(replay, {
    purchaseStatus: "active",
    state: "fulfilled",
  })
  assert.equal(fakeDatabase.state.checkout_orders[0].status, "paid")
  assert.equal(
    fakeDatabase.state.checkout_orders[0].fulfillment_source,
    "authenticated_reconciliation"
  )
})

test("a zero-row provenance write fails closed and replay repairs it", async () => {
  const fakeDatabase = database()
  fakeDatabase.skipNextProvenanceUpdate = true

  await assert.rejects(
    reconcile(fakeDatabase),
    /did not reach its verified final state/
  )
  assert.equal(fakeDatabase.state.purchases.length, 0)
  assert.equal(fakeDatabase.state.checkout_orders[0].status, "paid")
  assert.equal(fakeDatabase.state.checkout_orders[0].fulfillment_source, null)

  const replay = await reconcile(fakeDatabase)
  assert.deepEqual(replay, {
    purchaseStatus: "active",
    state: "fulfilled",
  })
  assert.equal(
    fakeDatabase.state.checkout_orders[0].fulfillment_source,
    "authenticated_reconciliation"
  )
})

test("a purchase insert failure grants no access and replay repairs it", async () => {
  const fakeDatabase = database()
  fakeDatabase.failNextPurchaseInsert = true

  await assert.rejects(reconcile(fakeDatabase), {
    code: "INJECTED_PURCHASE_INSERT_FAILURE",
  })
  assert.equal(fakeDatabase.state.purchases.length, 0)
  assert.equal(fakeDatabase.state.checkout_orders[0].status, "paid")
  assert.equal(
    fakeDatabase.state.checkout_orders[0].fulfillment_source,
    "authenticated_reconciliation"
  )

  const replay = await reconcile(fakeDatabase)
  assert.deepEqual(replay, {
    purchaseStatus: "active",
    state: "fulfilled",
  })
  assert.equal(fakeDatabase.state.purchases.length, 1)
})

test("the exact prebound order id cannot be replaced by Session metadata", async () => {
  const mismatchedSession = checkoutSession({
    metadata: checkoutMetadata({
      checkout_order_id: "44444444-4444-4444-8444-444444444444",
    }),
  })
  const fakeDatabase = database()

  await assert.rejects(reconcile(fakeDatabase, stripe(mismatchedSession)))
  assert.equal(fakeDatabase.state.purchases.length, 0)
})

test("an existing order PaymentIntent cannot be replaced", async () => {
  const fakeDatabase = database({
    checkout_orders: [
      checkoutOrder({ stripe_payment_intent_id: `pi_${"x".repeat(24)}` }),
    ],
  })

  await assert.rejects(reconcile(fakeDatabase), /reserved order/)
  assert.equal(fakeDatabase.state.purchases.length, 0)
  assert.equal(
    fakeDatabase.state.checkout_orders[0].stripe_payment_intent_id,
    `pi_${"x".repeat(24)}`
  )
})

test("expired and failed orders reject before entitlement writes", async () => {
  for (const status of ["expired", "failed"]) {
    const fakeDatabase = database({
      checkout_orders: [checkoutOrder({ status })],
    })

    await assert.rejects(reconcile(fakeDatabase), /terminally closed/)
    assert.equal(fakeDatabase.state.purchases.length, 0)
    assert.equal(fakeDatabase.state.stripe_customers.length, 0)
    assert.equal(fakeDatabase.state.checkout_orders[0].status, status)
  }
})

test("a terminal order creates only a matching tombstone", async () => {
  for (const status of ["refunded", "disputed"] as const) {
    const fakeDatabase = database({
      checkout_orders: [checkoutOrder({ status })],
    })

    const result = await reconcile(fakeDatabase)
    assert.deepEqual(result, { purchaseStatus: status, state: "terminal" })
    assert.equal(fakeDatabase.state.purchases.length, 1)
    assert.equal(fakeDatabase.state.purchases[0].status, status)
    assert.equal(fakeDatabase.state.checkout_orders[0].status, status)
  }
})

test("amount and PaymentIntent-to-Charge chain mismatches fail before writes", async () => {
  const wrongAmountDatabase = database()
  await assert.rejects(
    reconcile(
      wrongAmountDatabase,
      stripe(checkoutSession({ amount_total: 1112 }))
    )
  )
  assert.equal(wrongAmountDatabase.state.purchases.length, 0)

  const wrongChainIntent = paymentIntent(checkoutMetadata(), {
    payment_intent: `pi_${"x".repeat(24)}`,
  })
  const wrongChainDatabase = database()
  await assert.rejects(
    reconcile(
      wrongChainDatabase,
      stripe(checkoutSession({ payment_intent: wrongChainIntent }))
    )
  )
  assert.equal(wrongChainDatabase.state.purchases.length, 0)
})

test("a foreign deployment webhook is ignored without a database write", async () => {
  const foreignMetadata = checkoutMetadata({ deployment_target: "development" })
  const foreignSession = checkoutSession({
    metadata: foreignMetadata,
    payment_intent: paymentIntent(foreignMetadata),
  })
  const fakeDatabase = database()
  const before = structuredClone(fakeDatabase.state)

  const result = await reconcile(
    fakeDatabase,
    stripe(foreignSession),
    "webhook"
  )
  assert.deepEqual(result, { purchaseStatus: null, state: "ignored" })
  assert.deepEqual(fakeDatabase.state, before)
})

test("an expired Session cannot replace an order's stored Session", async () => {
  const fakeDatabase = database()
  const otherSessionId = `cs_test_${"x".repeat(24)}`

  await assert.rejects(
    markCheckoutExpired(
      fakeDatabase as never,
      checkoutSession({ id: otherSessionId, status: "expired" }) as never,
      "preview",
      identity.stripe_account_id,
      false
    ),
    /did not match its reserved order/
  )
  assert.equal(
    fakeDatabase.state.checkout_orders[0].stripe_checkout_session_id,
    sessionId
  )
  assert.equal(fakeDatabase.state.checkout_orders[0].status, "open")
})

test("an exact expired Session closes only its bound open order", async () => {
  const fakeDatabase = database()
  const result = await markCheckoutExpired(
    fakeDatabase as never,
    checkoutSession({ status: "expired" }) as never,
    "preview",
    identity.stripe_account_id,
    false
  )

  assert.equal(result, "processed")
  assert.equal(fakeDatabase.state.checkout_orders[0].status, "expired")
  assert.equal(
    fakeDatabase.state.checkout_orders[0].stripe_checkout_session_id,
    sessionId
  )
})

test("account corruption is rejected rather than ignored as a foreign target", async () => {
  const corruptMetadata = checkoutMetadata({
    stripe_account_id: "acct_unexpected123456",
  })
  const corruptSession = checkoutSession({
    metadata: corruptMetadata,
    payment_intent: paymentIntent(corruptMetadata),
  })
  const fakeDatabase = database()

  await assert.rejects(
    reconcile(fakeDatabase, stripe(corruptSession), "webhook")
  )
  assert.equal(fakeDatabase.state.purchases.length, 0)
})

test("an existing refunded entitlement cannot be resurrected", async () => {
  const fakeDatabase = database({ purchases: [purchase("refunded")] })
  const result = await reconcile(fakeDatabase)

  assert.deepEqual(result, { purchaseStatus: "refunded", state: "terminal" })
  assert.equal(fakeDatabase.state.purchases[0].status, "refunded")
  assert.equal(fakeDatabase.state.checkout_orders[0].status, "refunded")
})

test("partial-refund replay retains active LIFT access without provider calls", async () => {
  const partialRefundCharge = paymentIntent(checkoutMetadata(), {
    amount_refunded: 555,
    refunded: false,
  }).latest_charge
  let providerRetrieveCount = 0
  const fakeStripe = {
    paymentIntents: {
      retrieve: async () => {
        providerRetrieveCount += 1
        throw new Error(
          "A partial refund must not enter terminal reconciliation."
        )
      },
    },
  }
  const fakeDatabase = database({
    checkout_orders: [
      checkoutOrder({
        fulfilled_at: "2026-08-29T12:00:00.000Z",
        fulfillment_source: "webhook",
        status: "paid",
        stripe_payment_intent_id: paymentIntentId,
      }),
    ],
    purchases: [purchase("active")],
  })
  const before = structuredClone(fakeDatabase.state)

  for (let replay = 0; replay < 2; replay += 1) {
    const result = await reconcileFullRefund(
      fakeStripe as never,
      fakeDatabase as never,
      partialRefundCharge as never,
      "preview",
      identity.stripe_account_id,
      false
    )
    assert.equal(result, "processed")
  }

  assert.equal(providerRetrieveCount, 0)
  assert.deepEqual(fakeDatabase.state, before)
  assert.equal(fakeDatabase.state.purchases.length, 1)
  assert.equal(fakeDatabase.state.purchases[0].status, "active")
  assert.equal(fakeDatabase.state.checkout_orders[0].status, "paid")
})

test("service invoice refunds and disputes never mutate the LIFT ledger", async () => {
  const serviceMetadata = checkoutMetadata({
    commerce_flow: "service_invoice_v1",
  })
  const serviceRefundIntent = paymentIntent(serviceMetadata, {
    amount_refunded: 1111,
    refunded: true,
  })
  const serviceDisputeIntent = paymentIntent(serviceMetadata, {
    disputed: true,
  })

  for (const fixture of [
    {
      event: serviceRefundIntent.latest_charge,
      intent: serviceRefundIntent,
      kind: "refund" as const,
    },
    {
      event: {
        amount: 1111,
        charge: chargeId,
        currency: "usd",
        livemode: false,
        payment_intent: paymentIntentId,
      },
      intent: serviceDisputeIntent,
      kind: "dispute" as const,
    },
  ]) {
    const fakeDatabase = database({ purchases: [purchase("active")] })
    const before = structuredClone(fakeDatabase.state)
    const result =
      fixture.kind === "refund"
        ? await reconcileFullRefund(
            stripe(checkoutSession(), fixture.intent) as never,
            fakeDatabase as never,
            fixture.event as never,
            "preview",
            identity.stripe_account_id,
            false
          )
        : await revokeDisputedCharge(
            stripe(checkoutSession(), fixture.intent) as never,
            fakeDatabase as never,
            fixture.event as never,
            "preview",
            identity.stripe_account_id,
            false
          )

    assert.equal(result, "ignored_foreign")
    assert.deepEqual(fakeDatabase.state, before)
  }
})

test("full-refund replay repairs an incomplete order and remains idempotent", async () => {
  const refundedCharge = paymentIntent(checkoutMetadata(), {
    amount_refunded: 1111,
    refunded: true,
  }).latest_charge
  const refundedIntent = paymentIntent(checkoutMetadata(), {
    amount_refunded: 1111,
    refunded: true,
  })
  const fakeDatabase = database({ purchases: [purchase("active")] })

  for (let replay = 0; replay < 2; replay += 1) {
    const result = await reconcileFullRefund(
      stripe(checkoutSession(), refundedIntent) as never,
      fakeDatabase as never,
      refundedCharge as never,
      "preview",
      identity.stripe_account_id,
      false
    )
    assert.equal(result, "processed")
  }

  assert.equal(fakeDatabase.state.purchases.length, 1)
  assert.equal(fakeDatabase.state.purchases[0].status, "refunded")
  assert.equal(fakeDatabase.state.checkout_orders[0].status, "refunded")
  assert.equal(
    fakeDatabase.state.checkout_orders[0].stripe_payment_intent_id,
    paymentIntentId
  )
})

test("refunded wins when a dispute follows and the order is repaired", async () => {
  const disputedIntent = paymentIntent(checkoutMetadata(), { disputed: true })
  const fakeDatabase = database({ purchases: [purchase("refunded")] })
  const result = await revokeDisputedCharge(
    stripe(checkoutSession(), disputedIntent) as never,
    fakeDatabase as never,
    {
      amount: 1111,
      charge: chargeId,
      currency: "usd",
      livemode: false,
      payment_intent: paymentIntentId,
    } as never,
    "preview",
    identity.stripe_account_id,
    false
  )

  assert.equal(result, "processed")
  assert.equal(fakeDatabase.state.purchases[0].status, "refunded")
  assert.equal(fakeDatabase.state.checkout_orders[0].status, "refunded")
  assert.equal(
    fakeDatabase.state.checkout_orders[0].stripe_payment_intent_id,
    paymentIntentId
  )
})
