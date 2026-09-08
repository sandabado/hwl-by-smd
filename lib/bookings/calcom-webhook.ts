import "server-only"

import { createHash, createHmac, timingSafeEqual } from "node:crypto"

import {
  findBookingService,
  isExactCalEventForBookingService,
} from "@/lib/booking-services"

export const CALCOM_WEBHOOK_VERSIONS = ["2021-10-20", "2026-07-27"] as const

export const CALCOM_BOOKING_TRIGGERS = [
  "BOOKING_REQUESTED",
  "BOOKING_CREATED",
  "BOOKING_RESCHEDULED",
  "BOOKING_CANCELLED",
  "BOOKING_REJECTED",
] as const

export type CalcomBookingTrigger = (typeof CALCOM_BOOKING_TRIGGERS)[number]
export type BookingRecordStatus =
  "requested" | "confirmed" | "cancelled" | "rejected"

export type CalcomBookingEvent = Readonly<{
  attendeeEmail: string
  attendeeName: string
  attendeeTimeZone: string
  bookingStatus: BookingRecordStatus
  calBookingId: number | null
  calBookingUid: string
  calEventTypeId: number
  calIcalSequence: number
  calIcalUid: string | null
  calStatus: string
  currency: string
  durationMinutes: number
  eventDigest: string
  providerCreatedAt: string
  requiresConfirmation: boolean | null
  rescheduleUid: string | null
  serviceSlug: string
  serviceTitle: string
  startAt: string
  endAt: string
  trigger: CalcomBookingTrigger
  webhookVersion: (typeof CALCOM_WEBHOOK_VERSIONS)[number]
}>

export type CalcomWebhookParseResult =
  | Readonly<{ event: CalcomBookingEvent; ok: true }>
  | Readonly<{
      ok: false
      reason:
        | "invalid_json"
        | "invalid_payload"
        | "unsupported_trigger"
        | "unsupported_version"
        | "foreign_organizer"
        | "unknown_service"
        | "payment_mismatch"
    }>

const CALCOM_USERNAME = "hwlbysmd"
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readString(value: unknown, maximumLength = 500) {
  if (typeof value !== "string") return null
  const normalized = value.trim()
  if (!normalized || normalized.length > maximumLength) return null
  return normalized
}

function readOptionalString(value: unknown, maximumLength = 500) {
  if (value === null || value === undefined || value === "") return null
  return readString(value, maximumLength)
}

function readInteger(value: unknown, options: { allowZero?: boolean } = {}) {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) return null
  if (options.allowZero ? value < 0 : value <= 0) return null
  return value
}

function readIsoDate(value: unknown) {
  const candidate = readString(value, 80)
  if (!candidate) return null

  const timestamp = Date.parse(candidate)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null
}

function isWebhookVersion(
  value: string | null
): value is (typeof CALCOM_WEBHOOK_VERSIONS)[number] {
  return CALCOM_WEBHOOK_VERSIONS.includes(
    value as (typeof CALCOM_WEBHOOK_VERSIONS)[number]
  )
}

function isBookingTrigger(value: unknown): value is CalcomBookingTrigger {
  return CALCOM_BOOKING_TRIGGERS.includes(value as CalcomBookingTrigger)
}

function bookingStatusFor(
  trigger: CalcomBookingTrigger,
  providerStatus: string
): BookingRecordStatus {
  if (trigger === "BOOKING_CANCELLED" || providerStatus === "CANCELLED") {
    return "cancelled"
  }
  if (trigger === "BOOKING_REJECTED" || providerStatus === "REJECTED") {
    return "rejected"
  }
  if (trigger === "BOOKING_REQUESTED") {
    return "requested"
  }
  if (providerStatus === "ACCEPTED") return "confirmed"
  return "requested"
}

function signatureBytes(value: string | null) {
  const normalized = value?.trim().replace(/^sha256=/i, "")
  if (!normalized || !/^[a-f0-9]{64}$/i.test(normalized)) return null
  return Buffer.from(normalized, "hex")
}

export function verifyCalcomWebhookSignature(
  rawBody: Uint8Array,
  signature: string | null,
  secret: string
) {
  const received = signatureBytes(signature)
  if (!received || secret.length < 32) return false

  const expected = createHmac("sha256", secret).update(rawBody).digest()
  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  )
}

export function parseCalcomBookingWebhook(
  rawBody: Uint8Array,
  webhookVersion: string | null
): CalcomWebhookParseResult {
  if (!isWebhookVersion(webhookVersion)) {
    return { ok: false, reason: "unsupported_version" }
  }

  let body: unknown
  try {
    body = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(rawBody)
    ) as unknown
  } catch {
    return { ok: false, reason: "invalid_json" }
  }

  if (!isRecord(body) || !isBookingTrigger(body.triggerEvent)) {
    return {
      ok: false,
      reason:
        isRecord(body) && typeof body.triggerEvent === "string"
          ? "unsupported_trigger"
          : "invalid_payload",
    }
  }

  const payload = body.payload
  if (!isRecord(payload)) return { ok: false, reason: "invalid_payload" }

  const organizer = payload.organizer
  if (!isRecord(organizer)) return { ok: false, reason: "invalid_payload" }

  // Treat the canonical profile slug as an exact provider boundary. A team
  // alias, case-folded lookalike, or whitespace-normalized variant is not the
  // HWLbySMD organizer configured for this integration.
  const organizerUsername = readString(organizer.username, 160)
  if (
    organizerUsername !== CALCOM_USERNAME ||
    organizer.username !== organizerUsername
  ) {
    return { ok: false, reason: "foreign_organizer" }
  }

  const trigger = body.triggerEvent
  const providerCreatedAt = readIsoDate(body.createdAt)
  const calBookingUid = readString(payload.uid, 255)
  const serviceSlug = readString(payload.type, 160)
  const serviceTitle = readString(payload.eventTitle, 240)
  const durationMinutes = readInteger(payload.length)
  const calEventTypeId = readInteger(payload.eventTypeId)
  const startAt = readIsoDate(payload.startTime)
  const endAt = readIsoDate(payload.endTime)
  const calStatus = readString(payload.status, 80)?.toUpperCase()
  const priceMinor = readInteger(payload.price, { allowZero: true })
  const currency = readString(payload.currency, 12)?.toLowerCase()
  const attendees = Array.isArray(payload.attendees) ? payload.attendees : null
  const requiresConfirmation =
    typeof payload.requiresConfirmation === "boolean"
      ? payload.requiresConfirmation
      : null
  const calIcalSequence =
    payload.iCalSequence === null || payload.iCalSequence === undefined
      ? null
      : readInteger(payload.iCalSequence, { allowZero: true })

  if (
    !providerCreatedAt ||
    !calBookingUid ||
    !serviceSlug ||
    !serviceTitle ||
    !durationMinutes ||
    !calEventTypeId ||
    !startAt ||
    !endAt ||
    !calStatus ||
    priceMinor === null ||
    !currency ||
    !/^[a-z]{3}$/.test(currency) ||
    !attendees ||
    attendees.length !== 1 ||
    (payload.requiresConfirmation !== null &&
      payload.requiresConfirmation !== undefined &&
      requiresConfirmation === null) ||
    calIcalSequence === null ||
    Date.parse(endAt) <= Date.parse(startAt)
  ) {
    return { ok: false, reason: "invalid_payload" }
  }

  const attendee = attendees[0]
  if (!isRecord(attendee)) return { ok: false, reason: "invalid_payload" }

  const attendeeEmail = readString(attendee.email, 320)?.toLowerCase()
  const attendeeName = readString(attendee.name, 200)
  const attendeeTimeZone = readString(attendee.timeZone, 100)
  if (
    !attendeeEmail ||
    !EMAIL_PATTERN.test(attendeeEmail) ||
    !attendeeName ||
    !attendeeTimeZone
  ) {
    return { ok: false, reason: "invalid_payload" }
  }

  const service = findBookingService(serviceSlug)?.service
  if (
    !service ||
    !isExactCalEventForBookingService(service, {
      lengthInMinutes: durationMinutes,
      slug: serviceSlug,
      title: serviceTitle,
    })
  ) {
    return { ok: false, reason: "unknown_service" }
  }

  // Cal.com is scheduling authority only. Every website booking must remain
  // free at booking time; post-service payment is a separate Stripe workflow.
  if (priceMinor !== 0 || currency !== service.payment.currency) {
    return { ok: false, reason: "payment_mismatch" }
  }

  const calBookingId = readInteger(payload.bookingId)
  const rescheduleUidProvided =
    payload.rescheduleUid !== null && payload.rescheduleUid !== undefined
  const rescheduleUid = readOptionalString(payload.rescheduleUid, 255)

  if (
    (trigger === "BOOKING_RESCHEDULED" &&
      (!rescheduleUid ||
        payload.rescheduleUid !== rescheduleUid ||
        rescheduleUid === calBookingUid)) ||
    (trigger !== "BOOKING_RESCHEDULED" && rescheduleUidProvided)
  ) {
    return { ok: false, reason: "invalid_payload" }
  }

  return {
    event: {
      attendeeEmail,
      attendeeName,
      attendeeTimeZone,
      bookingStatus: bookingStatusFor(trigger, calStatus),
      calBookingId,
      calBookingUid,
      calEventTypeId,
      calIcalSequence,
      calIcalUid: readOptionalString(payload.iCalUID, 500),
      calStatus,
      currency,
      durationMinutes,
      endAt,
      eventDigest: createHash("sha256").update(rawBody).digest("hex"),
      providerCreatedAt,
      requiresConfirmation,
      rescheduleUid,
      serviceSlug,
      serviceTitle,
      startAt,
      trigger,
      webhookVersion,
    },
    ok: true,
  }
}
