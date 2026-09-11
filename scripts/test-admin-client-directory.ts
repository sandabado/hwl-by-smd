import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

import {
  type AdminClientDirectoryDependencies,
  type AdminClientRawRows,
  buildAdminClientTimeline,
  getAdminClientDetail,
  getAdminClientDirectory,
} from "../lib/admin/client-directory.ts"

const CLIENT_ID = "4f3d86c6-4da6-4ef6-8929-d66d11a9443c"
const RELATIONSHIP_ID = "2db86e10-4c97-45c3-a8b6-0ef074881091"
const PRACTITIONER_ID = "3e218daf-e254-43c6-93cc-20fe50a9f829"

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
}

const rows: AdminClientRawRows = {
  bookings: {
    rows: [
      {
        attendee_timezone: "America/Los_Angeles",
        booking_status: "confirmed",
        end_at: "2026-09-08T19:00:00.000Z",
        id: "booking-record",
        service_title: "Signature Facial",
        start_at: "2026-09-08T18:00:00.000Z",
        user_id: CLIENT_ID,
        intake_answers: "must-not-leave-the-dal",
      },
    ],
    status: "ready",
  },
  checkouts: [
    {
      created_at: "2026-09-06T19:00:00.000Z",
      fulfilled_at: "2026-09-06T19:05:00.000Z",
      id: "checkout-order",
      product_type: "lift_guide",
      status: "paid",
      stripe_checkout_session_id: "must-not-leave-the-dal",
      user_id: CLIENT_ID,
    },
  ],
  conversations: {
    rows: [
      {
        id: "conversation-record",
        last_message: "Thank you, Shannon.",
        last_message_at: "2026-09-08T20:00:00.000Z",
        practitioner_unread_count: 1,
        relationship_id: RELATIONSHIP_ID,
        status: "awaiting_practitioner",
        subject: "Aftercare",
        private_metadata: "must-not-leave-the-dal",
      },
    ],
    status: "ready",
  },
  profiles: [
    {
      created_at: "2026-09-01T17:00:00.000Z",
      email: "client@example.com",
      full_name: "Client Person",
      id: CLIENT_ID,
      stripe_customer_id: "must-not-leave-the-dal",
    },
    {
      created_at: "2026-09-01T16:00:00.000Z",
      email: "admin@ghosthand.studio",
      full_name: "Operations",
      id: "9b620fc9-30a3-4493-a25f-aa2a08c3fe34",
    },
  ],
  progress: {
    rows: [
      {
        completed: true,
        updated_at: "2026-09-08T21:00:00.000Z",
        user_id: CLIENT_ID,
        watched_until_second: 240,
      },
    ],
    status: "ready",
  },
  purchases: [
    {
      amount_paid: "11.11",
      currency: "usd",
      id: "purchase-record",
      product_type: "lift_guide",
      purchased_at: "2026-09-06T19:05:00.000Z",
      status: "active",
      stripe_payment_intent_id: "must-not-leave-the-dal",
      user_id: CLIENT_ID,
    },
  ],
  relationships: {
    rows: [{ id: RELATIONSHIP_ID, member_id: CLIENT_ID }],
    status: "ready",
  },
}

function dependencies(
  overrides: Partial<AdminClientDirectoryDependencies> = {}
): AdminClientDirectoryDependencies {
  return {
    readRows: async () => ({ ...rows, status: "ready" }),
    requireAdmin: async () => ({
      email: "admin@ghosthand.studio",
      role: "administrator",
      source: "supabase",
      userId: PRACTITIONER_ID,
    }),
    ...overrides,
  }
}

test("denied and local demo sessions never read private client rows", async (t) => {
  await t.test("authorization denial", async () => {
    let reads = 0
    const denied = new Error("denied")
    await assert.rejects(
      getAdminClientDirectory(
        dependencies({
          readRows: async () => {
            reads += 1
            return { ...rows, status: "ready" }
          },
          requireAdmin: async () => {
            throw denied
          },
        })
      ),
      denied
    )
    assert.equal(reads, 0)
  })

  await t.test("signed local preview", async () => {
    let reads = 0
    const result = await getAdminClientDirectory(
      dependencies({
        readRows: async () => {
          reads += 1
          return { ...rows, status: "ready" }
        },
        requireAdmin: async () => ({
          email: "local-preview",
          role: "administrator",
          source: "local-preview",
          userId: null,
        }),
      })
    )

    assert.deepEqual(result, { status: "local_preview" })
    assert.equal(reads, 0)
  })
})

test("runtime relationship history is scoped to the signed-in practitioner", () => {
  const clientDirectory = source("lib/admin/client-directory.ts")

  assert.match(
    clientDirectory,
    /\.from\("relationships"\)[\s\S]*?\.in\("member_id", userIds\)[\s\S]*?\.eq\("practitioner_id", practitionerId\)/
  )
  assert.match(
    clientDirectory,
    /dependencies\.readRows\(\{[\s\S]*?practitionerId: access\.userId/
  )
})

test("directory exposes a narrow aggregate DTO and honest optional availability", async () => {
  let readOptions: unknown
  const result = await getAdminClientDirectory(
    dependencies({
      readRows: async (options) => {
        readOptions = options
        return {
          ...rows,
          bookings: { status: "unavailable" },
          status: "ready",
        }
      },
    })
  )

  assert.deepEqual(readOptions, {
    clientId: null,
    practitionerId: PRACTITIONER_ID,
  })
  assert.equal(result.status, "ready")
  if (result.status !== "ready") return
  assert.equal(result.bookingHistoryAvailable, false)
  assert.equal(result.conversationHistoryAvailable, true)
  assert.deepEqual(result.clients, [
    {
      bookingCount: null,
      checkoutCount: 1,
      conversationCount: 1,
      email: "client@example.com",
      id: CLIENT_ID,
      joinedAt: "2026-09-01T17:00:00.000Z",
      name: "Client Person",
      paidCheckoutCount: 1,
      purchaseCount: 1,
      purchaseTotal: 11.11,
    },
  ])
  assert.equal("stripe_customer_id" in result.clients[0], false)
})

test("client detail keeps only linked histories and strips provider identifiers", async () => {
  let readOptions: unknown
  const result = await getAdminClientDetail(
    CLIENT_ID,
    dependencies({
      readRows: async (options) => {
        readOptions = options
        return { ...rows, status: "ready" }
      },
    })
  )

  assert.deepEqual(readOptions, {
    clientId: CLIENT_ID,
    practitionerId: PRACTITIONER_ID,
  })
  assert.equal(result.status, "ready")
  if (result.status !== "ready") return
  assert.deepEqual(Object.keys(result.detail.purchases[0]).sort(), [
    "amountPaid",
    "currency",
    "id",
    "productType",
    "purchasedAt",
    "status",
  ])
  assert.deepEqual(Object.keys(result.detail.bookings?.[0] ?? {}).sort(), [
    "bookingStatus",
    "endAt",
    "id",
    "serviceTitle",
    "startAt",
    "timeZone",
  ])
  assert.deepEqual(result.detail.progress, {
    completedCount: 1,
    lastActivityAt: "2026-09-08T21:00:00.000Z",
    startedCount: 1,
  })
  assert.equal("stripe_payment_intent_id" in result.detail.purchases[0], false)
  assert.equal("intake_answers" in (result.detail.bookings?.[0] ?? {}), false)
})

test("client timeline is newest-first, sanitized, and does not duplicate a paid checkout", async () => {
  const result = await getAdminClientDetail(CLIENT_ID, dependencies())

  assert.equal(result.status, "ready")
  if (result.status !== "ready") return

  const timeline = buildAdminClientTimeline(result.detail)
  assert.deepEqual(
    timeline.map(({ at, kind, title }) => ({ at, kind, title })),
    [
      {
        at: "2026-09-08T21:00:00.000Z",
        kind: "learning",
        title: "LIFT learning activity",
      },
      {
        at: "2026-09-08T20:00:00.000Z",
        kind: "conversation",
        title: "Aftercare",
      },
      {
        at: "2026-09-08T18:00:00.000Z",
        kind: "booking",
        title: "Signature Facial",
      },
      {
        at: "2026-09-06T19:05:00.000Z",
        kind: "purchase",
        title: "LIFT purchase",
      },
      {
        at: "2026-09-01T17:00:00.000Z",
        kind: "profile",
        title: "Joined HWL",
      },
    ]
  )
  assert.equal(
    timeline.some(({ kind }) => kind === "checkout"),
    false
  )
  assert.equal(
    JSON.stringify(timeline).includes("must-not-leave-the-dal"),
    false
  )

  const withOpenCheckout = buildAdminClientTimeline({
    ...result.detail,
    bookings: [],
    checkouts: [
      {
        createdAt: "2026-09-09T16:00:00.000Z",
        fulfilledAt: null,
        id: "open-checkout",
        productType: "lift_guide",
        status: "open",
      },
    ],
    conversations: [],
    progress: null,
    purchases: [],
  })
  assert.deepEqual(withOpenCheckout[0], {
    at: "2026-09-09T16:00:00.000Z",
    description: "Checkout attempt",
    id: "checkout:open-checkout",
    kind: "checkout",
    status: "open",
    title: "LIFT checkout",
  })
})

test("invalid routes and malformed database rows fail closed", async (t) => {
  await t.test("invalid client ID", async () => {
    let authorizations = 0
    const result = await getAdminClientDetail(
      "not-a-client",
      dependencies({
        requireAdmin: async () => {
          authorizations += 1
          return {
            email: "admin@ghosthand.studio",
            role: "administrator",
            source: "supabase",
            userId: PRACTITIONER_ID,
          }
        },
      })
    )
    assert.deepEqual(result, { status: "invalid_id" })
    assert.equal(authorizations, 0)
  })

  await t.test("invalid scoped commerce row", async () => {
    const result = await getAdminClientDirectory(
      dependencies({
        readRows: async () => ({
          ...rows,
          purchases: [{ amount_paid: "not-money" }],
          status: "ready",
        }),
      })
    )
    assert.deepEqual(result, { status: "unavailable" })
  })
})
