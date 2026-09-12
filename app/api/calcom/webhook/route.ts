import {
  parseCalcomBookingWebhook,
  verifyCalcomWebhookSignature,
} from "@/lib/bookings/calcom-webhook"
import {
  hasJsonContentType,
  readLimitedBytes,
} from "@/lib/relationships/request"
import { getCommerceDeploymentTarget } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/server"

const MAXIMUM_CALCOM_WEBHOOK_BYTES = 256_000
const CALCOM_USERNAME = "hwlbysmd"
const CALCOM_LEDGER_OUTCOMES = new Set([
  "applied",
  "ignored_stale",
  "manual_review",
])

export async function POST(request: Request) {
  const secret = process.env.CALCOM_WEBHOOK_SECRET?.trim()
  const deploymentTarget = getCommerceDeploymentTarget()
  const supabase = createAdminClient()

  if (
    process.env.CALCOM_BOOKING_LEDGER_READY !== "true" ||
    !secret ||
    secret.length < 32 ||
    !deploymentTarget ||
    !supabase
  ) {
    return new Response("Booking history is not configured.", { status: 503 })
  }

  if (!hasJsonContentType(request)) {
    return new Response("Expected a JSON webhook.", { status: 415 })
  }

  const rawBody = await readLimitedBytes(request, MAXIMUM_CALCOM_WEBHOOK_BYTES)
  if (!rawBody.ok) {
    return new Response(
      rawBody.reason === "too_large"
        ? "Cal.com webhook payload is too large."
        : "Cal.com webhook payload could not be read.",
      { status: rawBody.reason === "too_large" ? 413 : 400 }
    )
  }

  if (
    !verifyCalcomWebhookSignature(
      rawBody.value,
      request.headers.get("x-cal-signature-256"),
      secret
    )
  ) {
    return new Response("Invalid Cal.com signature.", { status: 400 })
  }

  const parsed = parseCalcomBookingWebhook(
    rawBody.value,
    request.headers.get("x-cal-webhook-version")
  )

  if (!parsed.ok) {
    if (parsed.reason === "unsupported_trigger") {
      return new Response("Ignored unsupported Cal.com event.", { status: 200 })
    }

    return new Response("Cal.com booking event was not accepted.", {
      status: 422,
    })
  }

  const event = parsed.event
  const { data, error } = await supabase.rpc("ingest_calcom_booking_event", {
    p_attendee_email: event.attendeeEmail,
    p_attendee_name: event.attendeeName,
    p_attendee_timezone: event.attendeeTimeZone,
    p_booking_status: event.bookingStatus,
    p_cal_booking_id: event.calBookingId,
    p_cal_booking_uid: event.calBookingUid,
    p_cal_event_type_id: event.calEventTypeId,
    p_cal_ical_uid: event.calIcalUid,
    p_cal_ical_sequence: event.calIcalSequence,
    p_cal_status: event.calStatus,
    p_calcom_username: CALCOM_USERNAME,
    p_currency: event.currency,
    p_deployment_target: deploymentTarget,
    p_end_at: event.endAt,
    p_event_created_at: event.providerCreatedAt,
    p_payload_digest: event.eventDigest,
    p_previous_cal_booking_uid: event.rescheduleUid,
    p_provider_price_was_null: event.providerPriceWasNull,
    p_requires_confirmation: event.requiresConfirmation,
    p_service_duration_minutes: event.durationMinutes,
    p_service_slug: event.serviceSlug,
    p_service_title: event.serviceTitle,
    p_start_at: event.startAt,
    p_trigger_event: event.trigger,
    p_webhook_version: event.webhookVersion,
  })

  if (error) {
    console.error("Cal.com webhook persistence failed", { code: error.code })
    return new Response("Cal.com webhook could not be recorded.", {
      status: 500,
    })
  }

  const outcome =
    Array.isArray(data) && data.length === 1 ? data[0]?.outcome : null
  if (typeof outcome !== "string" || !CALCOM_LEDGER_OUTCOMES.has(outcome)) {
    console.error("Cal.com webhook persistence returned an invalid receipt")
    return new Response("Cal.com webhook could not be recorded.", {
      status: 500,
    })
  }

  if (outcome === "manual_review") {
    console.error("Cal.com booking event requires manual review")
  }

  return Response.json({ received: true }, { status: 200 })
}
