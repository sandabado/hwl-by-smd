import "server-only"

import type { AdminAccess } from "@/lib/admin-auth"

const CALCOM_BOOKINGS_ENDPOINT = "https://api.cal.com/v2/bookings"
const CALCOM_PROFILE_ENDPOINT = "https://api.cal.com/v2/me"
const CALCOM_BOOKINGS_API_VERSION = "2026-05-01"
const CALCOM_USER_AGENT = "HWLbySMD/1.0 (+https://www.hwlbysmd.com)"
const CALCOM_EXPECTED_USERNAME = "hwlbysmd"
const CALCOM_EXPECTED_EMAIL = "shannon@hwlbysmd.com"
const CALCOM_BOOKING_LIMIT = 50
const CALCOM_REQUEST_TIMEOUT_MS = 5_000

export const CALCOM_ADMIN_BOOKING_QUEUES = [
  "unconfirmed",
  "upcoming",
  "past",
  "cancelled",
] as const

export type CalcomAdminBookingQueue =
  (typeof CALCOM_ADMIN_BOOKING_QUEUES)[number]

export type CalcomAdminBooking = Readonly<{
  attendeeEmail: string
  attendeeName: string
  attendeeTimeZone: string
  endAt: string
  locationSummary: string | null
  providerStatus: string
  queue: CalcomAdminBookingQueue
  serviceSlug: string | null
  serviceTitle: string
  startAt: string
  uid: string
}>

export type CalcomAdminBookingQueues = Readonly<
  Record<CalcomAdminBookingQueue, readonly CalcomAdminBooking[]>
>

export type CalcomAdminBookingsResult =
  | Readonly<{
      queues: CalcomAdminBookingQueues
      status: "local-preview"
    }>
  | Readonly<{
      hasMore: Readonly<Record<CalcomAdminBookingQueue, boolean>>
      queues: CalcomAdminBookingQueues
      status: "available"
    }>
  | Readonly<{
      queues: CalcomAdminBookingQueues
      status: "not-configured"
    }>
  | Readonly<{
      queues: CalcomAdminBookingQueues
      reason:
        "account-mismatch" | "http-error" | "invalid-response" | "request-error"
      status: "unavailable"
    }>

type CalcomQueuePage = Readonly<{
  bookings: readonly CalcomAdminBooking[]
  hasMore: boolean
}>

function emptyQueues(): Record<
  CalcomAdminBookingQueue,
  readonly CalcomAdminBooking[]
> {
  return {
    cancelled: [],
    past: [],
    unconfirmed: [],
    upcoming: [],
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readString(value: unknown, maximumLength: number) {
  if (typeof value !== "string") return null

  const normalized = value.trim()
  if (!normalized || normalized.length > maximumLength) return null
  return normalized
}

function readOptionalString(value: unknown, maximumLength: number) {
  if (value === undefined || value === null || value === "") return null
  return readString(value, maximumLength)
}

function readIsoDate(value: unknown) {
  const candidate = readString(value, 80)
  if (!candidate) return null

  const timestamp = Date.parse(candidate)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null
}

function readLocationSummary(value: unknown) {
  const location = readOptionalString(value, 500)
  if (!location) return null

  if (
    /^https?:\/\//i.test(location) ||
    /(?:cal video|integrations?:|zoom|google meet)/i.test(location)
  ) {
    return "Online"
  }

  return location.length <= 120 ? location : `${location.slice(0, 117)}…`
}

function readAttendee(value: unknown) {
  if (!Array.isArray(value) || value.length === 0 || !isRecord(value[0])) {
    return null
  }

  const attendeeName = readString(value[0].name, 200)
  const attendeeEmail = readString(value[0].email, 320)?.toLowerCase()
  const attendeeTimeZone = readString(value[0].timeZone, 100)

  if (
    !attendeeName ||
    !attendeeEmail ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendeeEmail) ||
    !attendeeTimeZone
  ) {
    return null
  }

  return { attendeeEmail, attendeeName, attendeeTimeZone }
}

export function parseCalcomAdminBooking(
  value: unknown,
  queue: CalcomAdminBookingQueue
): CalcomAdminBooking | null {
  if (!isRecord(value)) return null

  const uid = readString(value.uid, 255)
  const serviceTitle = readString(value.title, 240)
  const providerStatus = readString(value.status, 80)?.toLowerCase()
  const startAt = readIsoDate(value.start)
  const endAt = readIsoDate(value.end)
  const attendee = readAttendee(value.attendees)
  const eventType = isRecord(value.eventType) ? value.eventType : null
  const serviceSlug = eventType ? readOptionalString(eventType.slug, 160) : null

  if (
    !uid ||
    !serviceTitle ||
    !providerStatus ||
    !startAt ||
    !endAt ||
    !attendee ||
    Date.parse(endAt) <= Date.parse(startAt)
  ) {
    return null
  }

  return {
    ...attendee,
    endAt,
    locationSummary: readLocationSummary(value.location),
    providerStatus,
    queue,
    serviceSlug,
    serviceTitle,
    startAt,
    uid,
  }
}

function parseQueuePage(
  payload: unknown,
  queue: CalcomAdminBookingQueue
): CalcomQueuePage | null {
  if (
    !isRecord(payload) ||
    payload.status !== "success" ||
    !Array.isArray(payload.data) ||
    !isRecord(payload.pagination) ||
    typeof payload.pagination.hasMore !== "boolean" ||
    (payload.pagination.nextCursor !== null &&
      typeof payload.pagination.nextCursor !== "string")
  ) {
    return null
  }

  const bookings: CalcomAdminBooking[] = []
  for (const value of payload.data) {
    const booking = parseCalcomAdminBooking(value, queue)
    if (!booking) return null
    bookings.push(booking)
  }

  return {
    bookings,
    hasMore: payload.pagination.hasMore,
  }
}

function getCalcomApiKey() {
  const key = process.env.CALCOM_API_KEY?.trim()
  if (!key || !key.startsWith("cal_") || key.startsWith("cal_your_")) {
    return null
  }
  return key
}

export function isCalcomAdminBookingsConfigured() {
  return getCalcomApiKey() !== null
}

async function verifyCalcomAccount(apiKey: string): Promise<
  | Readonly<{ ok: true }>
  | Readonly<{
      ok: false
      reason:
        "account-mismatch" | "http-error" | "invalid-response" | "request-error"
    }>
> {
  try {
    const response = await fetch(CALCOM_PROFILE_ENDPOINT, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
        "User-Agent": CALCOM_USER_AGENT,
      },
      signal: AbortSignal.timeout(CALCOM_REQUEST_TIMEOUT_MS),
    })
    if (!response.ok) return { ok: false, reason: "http-error" }

    const payload = (await response.json()) as unknown
    if (
      !isRecord(payload) ||
      payload.status !== "success" ||
      !isRecord(payload.data)
    ) {
      return { ok: false, reason: "invalid-response" }
    }

    const username = readString(payload.data.username, 160)?.toLowerCase()
    const email = readString(payload.data.email, 320)?.toLowerCase()
    return username === CALCOM_EXPECTED_USERNAME &&
      email === CALCOM_EXPECTED_EMAIL
      ? { ok: true }
      : { ok: false, reason: "account-mismatch" }
  } catch {
    return { ok: false, reason: "request-error" }
  }
}

async function getQueuePage(
  queue: CalcomAdminBookingQueue,
  apiKey: string
): Promise<
  | Readonly<{ ok: true; page: CalcomQueuePage }>
  | Readonly<{
      ok: false
      reason: "http-error" | "invalid-response" | "request-error"
    }>
> {
  try {
    const url = new URL(CALCOM_BOOKINGS_ENDPOINT)
    url.searchParams.set("status", queue)
    url.searchParams.set("limit", String(CALCOM_BOOKING_LIMIT))

    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
        "cal-api-version": CALCOM_BOOKINGS_API_VERSION,
        "User-Agent": CALCOM_USER_AGENT,
      },
      signal: AbortSignal.timeout(CALCOM_REQUEST_TIMEOUT_MS),
    })

    if (!response.ok) return { ok: false, reason: "http-error" }

    const page = parseQueuePage((await response.json()) as unknown, queue)
    return page ? { ok: true, page } : { ok: false, reason: "invalid-response" }
  } catch {
    return { ok: false, reason: "request-error" }
  }
}

export async function getCalcomAdminBookings(
  access: AdminAccess
): Promise<CalcomAdminBookingsResult> {
  if (access.source !== "supabase") {
    return { queues: emptyQueues(), status: "local-preview" }
  }

  const apiKey = getCalcomApiKey()
  if (!apiKey) return { queues: emptyQueues(), status: "not-configured" }

  const account = await verifyCalcomAccount(apiKey)
  if (!account.ok) {
    return {
      queues: emptyQueues(),
      reason: account.reason,
      status: "unavailable",
    }
  }

  const results = await Promise.all(
    CALCOM_ADMIN_BOOKING_QUEUES.map(async (queue) => ({
      queue,
      result: await getQueuePage(queue, apiKey),
    }))
  )

  const failure = results.find(({ result }) => !result.ok)
  if (failure && !failure.result.ok) {
    return {
      queues: emptyQueues(),
      reason: failure.result.reason,
      status: "unavailable",
    }
  }

  const queues = emptyQueues()
  const hasMore: Record<CalcomAdminBookingQueue, boolean> = {
    cancelled: false,
    past: false,
    unconfirmed: false,
    upcoming: false,
  }

  for (const { queue, result } of results) {
    if (!result.ok) continue
    queues[queue] = result.page.bookings
    hasMore[queue] = result.page.hasMore
  }

  return { hasMore, queues, status: "available" }
}
