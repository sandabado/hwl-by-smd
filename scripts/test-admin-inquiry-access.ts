import assert from "node:assert/strict"
import { test } from "node:test"

import {
  getAdminInquiryInbox,
  type AdminInquiryInboxDependencies,
} from "../lib/inquiries/admin.ts"

const INQUIRY_ID = "4f3d86c6-4da6-4ef6-8929-d66d11a9443c"

function inboxDependencies(
  overrides: Partial<AdminInquiryInboxDependencies> = {}
): AdminInquiryInboxDependencies {
  return {
    readInquiries: async () => ({ count: 0, rows: [], status: "ready" }),
    requireAdmin: async () => ({
      email: "admin@ghosthand.studio",
      source: "supabase",
      userId: "2db86e10-4c97-45c3-a8b6-0ef074881091",
    }),
    ...overrides,
  }
}

test("denied and demo sessions stop before any service-role inquiry read", async (t) => {
  await t.test("authorization denial", async () => {
    let reads = 0
    const denied = new Error("denied")
    await assert.rejects(
      getAdminInquiryInbox(
        {},
        inboxDependencies({
          readInquiries: async () => {
            reads += 1
            return { count: 0, rows: [], status: "ready" }
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

  await t.test("local demo administrator", async () => {
    let reads = 0
    const result = await getAdminInquiryInbox(
      {},
      inboxDependencies({
        readInquiries: async () => {
          reads += 1
          return { count: 0, rows: [], status: "ready" }
        },
        requireAdmin: async () => ({
          email: "local-preview",
          source: "local-preview",
          userId: null,
        }),
      })
    )

    assert.deepEqual(result, { status: "local_preview" })
    assert.equal(reads, 0)
  })
})

test("a verified administrator receives only the explicit inquiry DTO", async () => {
  const result = await getAdminInquiryInbox(
    { inquiryId: INQUIRY_ID, page: 2, pageSize: 500 },
    inboxDependencies({
      readInquiries: async (options) => {
        assert.deepEqual(options, {
          firstRow: 100,
          inquiryId: INQUIRY_ID,
          pageSize: 100,
        })
        return {
          count: 1,
          rows: [
            {
              id: INQUIRY_ID,
              source: "contact-page",
              name: "Website guest",
              email: "guest@example.com",
              message: "A private inquiry.",
              status: "received",
              notification_status: "accepted",
              notification_provider_id: "provider-receipt",
              notification_error_code: "must-not-leave-the-dal",
              notification_attempted_at: "must-not-leave-the-dal",
              notification_accepted_at: "must-not-leave-the-dal",
              service_slug: "must-not-leave-the-dal",
              created_at: "2026-09-06T20:00:00.000Z",
              payload_digest: "must-not-leave-the-dal",
              submission_id: "must-not-leave-the-dal",
              client_fingerprint: "must-not-leave-the-dal",
            },
          ],
          status: "ready",
        }
      },
    })
  )

  assert.equal(result.status, "ready")
  if (result.status !== "ready") return

  assert.equal(result.page, 1)
  assert.equal(result.pageSize, 100)
  assert.equal(result.total, 1)
  assert.deepEqual(Object.keys(result.inquiries[0]).sort(), [
    "booking_preference",
    "created_at",
    "date_preference",
    "email",
    "event_date",
    "format",
    "group_size",
    "guest_count",
    "id",
    "interests",
    "location",
    "message",
    "name",
    "notification_status",
    "organization",
    "phone",
    "preferred_date",
    "preferred_window",
    "service",
    "services",
    "source",
    "status",
    "subject",
    "time_zone",
  ])
  assert.equal("payload_digest" in result.inquiries[0], false)
  assert.equal("submission_id" in result.inquiries[0], false)
  assert.equal("client_fingerprint" in result.inquiries[0], false)
  assert.equal("notification_provider_id" in result.inquiries[0], false)
  assert.equal("service_slug" in result.inquiries[0], false)
})

test("malformed service-role rows fail closed instead of crossing the DAL", async () => {
  const result = await getAdminInquiryInbox(
    {},
    inboxDependencies({
      readInquiries: async () => ({
        count: 1,
        rows: [{ id: INQUIRY_ID, message: "incomplete" }],
        status: "ready",
      }),
    })
  )

  assert.deepEqual(result, { status: "unavailable" })
})
