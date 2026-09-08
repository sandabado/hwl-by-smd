import assert from "node:assert/strict"
import { createHash, createHmac } from "node:crypto"
import { test } from "node:test"

import { findBookingService } from "../lib/booking-services.ts"
import {
  CALCOM_BOOKING_TRIGGERS,
  CALCOM_WEBHOOK_VERSIONS,
  parseCalcomBookingWebhook,
  verifyCalcomWebhookSignature,
  type CalcomBookingTrigger,
} from "../lib/bookings/calcom-webhook.ts"

const encoder = new TextEncoder()
const webhookSecret = "cal_test_webhook_secret_0123456789abcdef"
const signatureFacialMatch = findBookingService("signature-facial")

assert.ok(signatureFacialMatch)
const signatureFacial = signatureFacialMatch.service
assert.equal(signatureFacial.calendarBooking.kind, "exact-event")
if (signatureFacial.calendarBooking.kind !== "exact-event") {
  throw new Error("Signature Facial must remain an exact Cal.com event")
}
const signatureFacialDuration = signatureFacial.calendarBooking.durationMinutes

type WebhookFixtureOptions = Readonly<{
  payload?: Readonly<Record<string, unknown>>
  topLevel?: Readonly<Record<string, unknown>>
  trigger?: CalcomBookingTrigger | string
}>

function webhookFixture(options: WebhookFixtureOptions = {}) {
  const trigger = options.trigger ?? "BOOKING_CREATED"

  return {
    createdAt: "2026-09-07T20:00:00.000Z",
    triggerEvent: trigger,
    payload: {
      attendees: [
        {
          email: "Client@Example.com",
          name: "Client Name",
          timeZone: "America/Los_Angeles",
        },
      ],
      bookingId: 4301,
      currency: signatureFacial.payment.currency,
      endTime: "2026-09-20T19:00:00.000Z",
      eventTitle: signatureFacial.title,
      eventTypeId: 901,
      iCalSequence: trigger === "BOOKING_RESCHEDULED" ? 1 : 0,
      iCalUID: "stable-ical-identity@example.com",
      length: signatureFacialDuration,
      metadata: {},
      organizer: { username: "hwlbysmd" },
      price: 0,
      requiresConfirmation: true,
      rescheduleUid:
        trigger === "BOOKING_RESCHEDULED" ? "booking-prior-uid" : undefined,
      startTime: "2026-09-20T18:00:00.000Z",
      status: "ACCEPTED",
      type: signatureFacial.slug,
      uid: "booking-current-uid",
      ...options.payload,
    },
    ...options.topLevel,
  }
}

function rawBody(value: unknown) {
  return encoder.encode(JSON.stringify(value))
}

function parseFixture(
  options: WebhookFixtureOptions = {},
  version: string | null = "2026-07-27"
) {
  return parseCalcomBookingWebhook(rawBody(webhookFixture(options)), version)
}

test("Cal.com webhook HMAC verification is raw-body exact and fail closed", () => {
  const raw = rawBody(webhookFixture())
  const signature = createHmac("sha256", webhookSecret)
    .update(raw)
    .digest("hex")

  assert.equal(
    verifyCalcomWebhookSignature(raw, signature, webhookSecret),
    true
  )
  assert.equal(
    verifyCalcomWebhookSignature(raw, `sha256=${signature}`, webhookSecret),
    true
  )
  assert.equal(
    verifyCalcomWebhookSignature(
      rawBody({ ...webhookFixture(), createdAt: "2026-09-07T20:00:01.000Z" }),
      signature,
      webhookSecret
    ),
    false
  )
  assert.equal(verifyCalcomWebhookSignature(raw, signature, "too-short"), false)
  assert.equal(
    verifyCalcomWebhookSignature(raw, "not-a-hex-signature", webhookSecret),
    false
  )
  assert.equal(verifyCalcomWebhookSignature(raw, null, webhookSecret), false)
})

test("Cal.com webhook versions and booking triggers are explicit", async (t) => {
  for (const version of CALCOM_WEBHOOK_VERSIONS) {
    await t.test(`accepts webhook version ${version}`, () => {
      const result = parseFixture({}, version)

      assert.equal(result.ok, true)
      if (result.ok) assert.equal(result.event.webhookVersion, version)
    })
  }

  await t.test("rejects missing and unknown versions before ingestion", () => {
    assert.deepEqual(parseFixture({}, null), {
      ok: false,
      reason: "unsupported_version",
    })
    assert.deepEqual(parseFixture({}, "2024-06-14"), {
      ok: false,
      reason: "unsupported_version",
    })
  })

  const expectedBookingStatus: Record<CalcomBookingTrigger, string> = {
    BOOKING_CANCELLED: "cancelled",
    BOOKING_CREATED: "confirmed",
    BOOKING_REJECTED: "rejected",
    BOOKING_REQUESTED: "requested",
    BOOKING_RESCHEDULED: "confirmed",
  }

  for (const trigger of CALCOM_BOOKING_TRIGGERS) {
    await t.test(`normalizes ${trigger}`, () => {
      const result = parseFixture({ trigger })

      assert.equal(result.ok, true)
      if (!result.ok) return

      assert.equal(result.event.trigger, trigger)
      assert.equal(result.event.bookingStatus, expectedBookingStatus[trigger])
    })
  }

  for (const trigger of [
    "BOOKING_PAYMENT_INITIATED",
    "BOOKING_PAID",
    "MEETING_STARTED",
  ]) {
    await t.test(`ignores unsupported ${trigger}`, () => {
      assert.deepEqual(parseFixture({ trigger }), {
        ok: false,
        reason: "unsupported_trigger",
      })
    })
  }
})

test("Cal.com webhook accepts only the canonical organizer and exact service", async (t) => {
  await t.test(
    "normalizes the exact service without retaining extra fields",
    () => {
      const body = webhookFixture({
        payload: {
          extraProviderField: "must not be copied",
          notes: "private client notes must not be copied",
        },
      })
      const raw = rawBody(body)
      const result = parseCalcomBookingWebhook(raw, "2026-07-27")

      assert.equal(result.ok, true)
      if (!result.ok) return

      assert.equal(result.event.attendeeEmail, "client@example.com")
      assert.equal(result.event.serviceSlug, signatureFacial.slug)
      assert.equal(result.event.serviceTitle, signatureFacial.title)
      assert.equal(result.event.durationMinutes, signatureFacialDuration)
      assert.equal(
        result.event.eventDigest,
        createHash("sha256").update(raw).digest("hex")
      )
      assert.equal("notes" in result.event, false)
      assert.equal("extraProviderField" in result.event, false)
    }
  )

  await t.test("rejects a foreign organizer", () => {
    assert.deepEqual(
      parseFixture({
        payload: {
          organizer: {
            username: "another-practice",
            usernameInOrg: "another-team",
          },
        },
      }),
      { ok: false, reason: "foreign_organizer" }
    )
  })

  for (const [name, organizer] of [
    ["case-folded profile", { username: "HWLBYSMD" }],
    ["space-padded profile", { username: " hwlbysmd " }],
    [
      "team alias fallback",
      { username: "another-practice", usernameInOrg: "hwlbysmd" },
    ],
  ] as const) {
    await t.test(
      `rejects ${name} instead of weakening the canonical slug`,
      () => {
        assert.deepEqual(parseFixture({ payload: { organizer } }), {
          ok: false,
          reason: "foreign_organizer",
        })
      }
    )
  }

  for (const [name, payload] of [
    ["slug", { type: `${signatureFacial.slug}-copy` }],
    ["title", { eventTitle: `${signatureFacial.title} Session` }],
    ["duration", { length: signatureFacialDuration + 1 }],
  ] as const) {
    await t.test(`rejects a mismatched service ${name}`, () => {
      assert.deepEqual(parseFixture({ payload }), {
        ok: false,
        reason: "unknown_service",
      })
    })
  }
})

test("Cal.com webhook accepts free scheduling only", async (t) => {
  const result = parseFixture()

  assert.equal(result.ok, true)
  if (result.ok) {
    assert.equal(result.event.currency, "usd")
    assert.equal("paymentStatus" in result.event, false)
    assert.equal("stripePaymentIntentId" in result.event, false)
  }

  for (const [name, payload] of [
    [
      "listed service price",
      { price: signatureFacial.payment.unitAmountMinor },
    ],
    ["other positive price", { price: 1 }],
    ["wrong currency", { currency: "eur" }],
  ] as const) {
    await t.test(`${name} is a payment mismatch`, () => {
      assert.deepEqual(parseFixture({ payload }), {
        ok: false,
        reason: "payment_mismatch",
      })
    })
  }

  for (const [name, payload] of [
    ["string price", { price: "0" }],
    ["fractional price", { price: 0.5 }],
    ["negative price", { price: -1 }],
    ["malformed currency", { currency: "US dollars" }],
  ] as const) {
    await t.test(`${name} is an invalid payload`, () => {
      assert.deepEqual(parseFixture({ payload }), {
        ok: false,
        reason: "invalid_payload",
      })
    })
  }
})

test("Cal.com reschedule identity and delivery semantics are strict", async (t) => {
  await t.test(
    "preserves distinct old/new identities and a valid iCal sequence",
    () => {
      const result = parseFixture({
        payload: {
          iCalSequence: 3,
          iCalUID: "stable-series-uid@example.com",
          rescheduleUid: "booking-prior-uid",
          uid: "booking-new-uid",
        },
        trigger: "BOOKING_RESCHEDULED",
      })

      assert.equal(result.ok, true)
      if (!result.ok) return

      assert.equal(result.event.calBookingUid, "booking-new-uid")
      assert.equal(result.event.rescheduleUid, "booking-prior-uid")
      assert.equal(result.event.calIcalUid, "stable-series-uid@example.com")
      assert.equal(result.event.calIcalSequence, 3)
      assert.equal(result.event.trigger, "BOOKING_RESCHEDULED")
    }
  )

  for (const [name, rescheduleUid] of [
    ["missing prior UID", undefined],
    ["empty prior UID", ""],
    ["whitespace-only prior UID", "   "],
    ["space-padded prior UID", " booking-prior-uid "],
    ["current UID reused as prior UID", "booking-current-uid"],
  ] as const) {
    await t.test(`rejects a reschedule with ${name}`, () => {
      assert.deepEqual(
        parseFixture({
          payload: { rescheduleUid },
          trigger: "BOOKING_RESCHEDULED",
        }),
        { ok: false, reason: "invalid_payload" }
      )
    })
  }

  await t.test("rejects reschedule identity on a non-reschedule event", () => {
    assert.deepEqual(
      parseFixture({ payload: { rescheduleUid: "booking-prior-uid" } }),
      { ok: false, reason: "invalid_payload" }
    )
  })

  for (const [name, iCalSequence] of [
    ["missing", undefined],
    ["null", null],
    ["negative", -1],
    ["fractional", 1.5],
    ["string", "1"],
  ] as const) {
    await t.test(`rejects a ${name} iCal sequence`, () => {
      assert.deepEqual(parseFixture({ payload: { iCalSequence } }), {
        ok: false,
        reason: "invalid_payload",
      })
    })
  }
})

test("Cal.com online bookings permit exactly one attendee", async (t) => {
  await t.test("rejects an empty attendee list", () => {
    assert.deepEqual(parseFixture({ payload: { attendees: [] } }), {
      ok: false,
      reason: "invalid_payload",
    })
  })

  await t.test(
    "rejects extra guests rather than silently dropping them",
    () => {
      assert.deepEqual(
        parseFixture({
          payload: {
            attendees: [
              {
                email: "client@example.com",
                name: "Client Name",
                timeZone: "America/Los_Angeles",
              },
              {
                email: "guest@example.com",
                name: "Extra Guest",
                timeZone: "America/Los_Angeles",
              },
            ],
          },
        }),
        { ok: false, reason: "invalid_payload" }
      )
    }
  )
})

test("Cal.com webhook JSON parsing is strict", () => {
  assert.deepEqual(
    parseCalcomBookingWebhook(encoder.encode("{not-json"), "2026-07-27"),
    { ok: false, reason: "invalid_json" }
  )
  assert.deepEqual(
    parseCalcomBookingWebhook(encoder.encode("[]"), "2026-07-27"),
    { ok: false, reason: "invalid_payload" }
  )
})
