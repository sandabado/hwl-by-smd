import "server-only"

import { getCommerceDeploymentTarget } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/server"

const CALCOM_USERNAME = "hwlbysmd"

const BOOKING_STATUSES = new Set([
  "requested",
  "confirmed",
  "cancelled",
  "rejected",
])
export type MemberBooking = Readonly<{
  bookingStatus: "requested" | "confirmed" | "cancelled" | "rejected"
  endAt: string
  id: string
  requiresConfirmation: boolean | null
  serviceSlug: string
  serviceTitle: string
  startAt: string
  timeZone: string
}>

export function isCalcomBookingLedgerReady() {
  return process.env.CALCOM_BOOKING_LEDGER_READY === "true"
}

export function findNextMemberBooking(
  bookings: readonly MemberBooking[],
  currentTime = Date.now()
) {
  return bookings
    .filter(
      (booking) =>
        !["cancelled", "rejected"].includes(booking.bookingStatus) &&
        Date.parse(booking.endAt) >= currentTime
    )
    .toSorted(
      (left, right) => Date.parse(left.startAt) - Date.parse(right.startAt)
    )[0]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value))
}

function parseMemberBooking(value: unknown): MemberBooking | null {
  if (!isRecord(value)) return null

  const bookingStatus = value.booking_status
  if (
    typeof value.id !== "string" ||
    typeof value.service_slug !== "string" ||
    typeof value.service_title !== "string" ||
    typeof value.attendee_timezone !== "string" ||
    !isIsoDate(value.start_at) ||
    !isIsoDate(value.end_at) ||
    typeof bookingStatus !== "string" ||
    !BOOKING_STATUSES.has(bookingStatus) ||
    (value.requires_confirmation !== null &&
      typeof value.requires_confirmation !== "boolean")
  ) {
    return null
  }

  return {
    bookingStatus: bookingStatus as MemberBooking["bookingStatus"],
    endAt: value.end_at,
    id: value.id,
    requiresConfirmation: value.requires_confirmation,
    serviceSlug: value.service_slug,
    serviceTitle: value.service_title,
    startAt: value.start_at,
    timeZone: value.attendee_timezone,
  }
}

export async function getMemberBookings(
  userId: string
): Promise<readonly MemberBooking[]> {
  if (!isCalcomBookingLedgerReady()) return []

  const deploymentTarget = getCommerceDeploymentTarget()
  const supabase = createAdminClient()
  if (!deploymentTarget || !supabase) return []

  const { error: claimError } = await supabase.rpc(
    "claim_calcom_bookings_for_member",
    {
      p_calcom_username: CALCOM_USERNAME,
      p_deployment_target: deploymentTarget,
      p_user_id: userId,
    }
  )

  if (claimError) {
    console.error("Member booking claim failed", { code: claimError.code })
    return []
  }

  const { data, error } = await supabase
    .from("booking_records")
    .select(
      "attendee_timezone, booking_status, end_at, id, requires_confirmation, service_slug, service_title, start_at"
    )
    .eq("user_id", userId)
    .eq("deployment_target", deploymentTarget)
    .eq("calcom_username", CALCOM_USERNAME)
    .order("start_at", { ascending: false })
    .limit(100)

  if (error || !Array.isArray(data)) {
    console.error("Member booking history failed", { code: error?.code })
    return []
  }

  return data.flatMap((row) => {
    const booking = parseMemberBooking(row)
    return booking ? [booking] : []
  })
}
