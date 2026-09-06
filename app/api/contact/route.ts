import { NextResponse } from "next/server"

import {
  hasAcceptableBodySize,
  hasJsonContentType,
  isSameOriginMutation,
  readLimitedJson,
} from "@/lib/relationships/request"
import {
  createInquiryPayloadDigest,
  prepareInquirySubmissionClaim,
} from "@/lib/inquiries/rate-limit"
import { isInquiryCollectionReady } from "@/lib/inquiries/readiness"
import { createAdminClient } from "@/lib/supabase/server"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SUBMISSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const INQUIRY_SOURCES = new Set([
  "booking-request",
  "contact-page",
  "journal-newsletter",
  "retreat-partnership-inquiry",
  "website-inquiry",
])
const MAXIMUM_REQUEST_BYTES = 16_000
const MAXIMUM_MESSAGE_LENGTH = 5_000
const MAXIMUM_FIELD_LENGTH = 500
const DETAIL_COLUMNS = {
  bookingPreference: "booking_preference",
  datePreference: "date_preference",
  eventDate: "event_date",
  format: "format",
  guestCount: "guest_count",
  groupSize: "group_size",
  interests: "interests",
  location: "location",
  organization: "organization",
  phone: "phone",
  preferredDate: "preferred_date",
  preferredWindow: "preferred_window",
  service: "service",
  serviceSlug: "service_slug",
  services: "services",
  subject: "subject",
  timeZone: "time_zone",
} as const

type NotificationStatus =
  | "accepted"
  | "attempting"
  | "audit_unknown"
  | "failed"
  | "not_configured"
  | "unattempted"
type NotificationErrorCode =
  | "claim_outcome_unknown"
  | "configuration_missing"
  | "network_outcome_unknown"
  | "provider_receipt_missing"
  | "provider_rejected"

type InquiryRecord = {
  created: boolean
  inquiry_id: string | null
  notification_error_code: NotificationErrorCode | null
  notification_status: NotificationStatus | null
  payload_matches: boolean
  rate_limited: boolean
}

const NOTIFICATION_STATUSES = new Set<NotificationStatus>([
  "accepted",
  "attempting",
  "audit_unknown",
  "failed",
  "not_configured",
  "unattempted",
])

function cleanSingleLine(value: string, maximum = MAXIMUM_FIELD_LENGTH) {
  return value
    .replace(/[\r\n\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maximum)
}

function validProviderReceiptId(value: string) {
  if (value.length < 1 || value.length > 255) return null
  return cleanSingleLine(value, 255) === value ? value : null
}

function cleanMessage(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
}

function cleanSource(value: unknown) {
  if (typeof value !== "string") return "website-inquiry"

  const source = cleanSingleLine(value.toLowerCase(), 80)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return INQUIRY_SOURCES.has(source) ? source : "website-inquiry"
}

function optionalDetail(body: Record<string, unknown>, field: string) {
  const value = body[field]
  if (typeof value !== "string" || !value.trim()) return null
  return cleanSingleLine(value)
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request, { requireOrigin: true })) {
    return NextResponse.json(
      { message: "Request not allowed." },
      { status: 403 }
    )
  }
  if (!hasJsonContentType(request)) {
    return NextResponse.json(
      { message: "A JSON request is required." },
      { status: 415 }
    )
  }
  if (!hasAcceptableBodySize(request, MAXIMUM_REQUEST_BYTES)) {
    return NextResponse.json(
      { message: "Your note is too large." },
      { status: 413 }
    )
  }

  if (!isInquiryCollectionReady()) {
    return NextResponse.json(
      {
        message:
          "Online inquiry collection is not open yet. Please return when inquiries are available.",
        received: false,
      },
      { headers: { "Cache-Control": "no-store" }, status: 503 }
    )
  }

  const parsedBody = await readLimitedJson<Record<string, unknown>>(
    request,
    MAXIMUM_REQUEST_BYTES
  )
  if (!parsedBody.ok) {
    return NextResponse.json(
      {
        message:
          parsedBody.reason === "too_large"
            ? "Your note is too large."
            : "Please enter a valid email and message.",
      },
      { status: parsedBody.reason === "too_large" ? 413 : 400 }
    )
  }
  if (
    typeof parsedBody.value !== "object" ||
    parsedBody.value === null ||
    Array.isArray(parsedBody.value)
  ) {
    return NextResponse.json(
      { message: "Please enter a valid email and message." },
      { status: 400 }
    )
  }
  const body = parsedBody.value
  const email = typeof body.email === "string" ? body.email.trim() : ""
  const submittedName =
    typeof body.name === "string" && body.name.trim()
      ? cleanSingleLine(body.name, 120)
      : ""
  const name = submittedName || "Website guest"
  const rawMessage = typeof body.message === "string" ? body.message : ""
  const message = cleanMessage(rawMessage)
  const source = cleanSource(body.source)
  const submissionId =
    typeof body.submissionId === "string" ? body.submissionId.trim() : ""

  if (body.website) {
    return NextResponse.json({ ok: true, received: false })
  }

  if (
    !SUBMISSION_ID_PATTERN.test(submissionId) ||
    email.length > 320 ||
    !EMAIL_PATTERN.test(email) ||
    !message ||
    rawMessage.length > MAXIMUM_MESSAGE_LENGTH
  ) {
    return NextResponse.json(
      { message: "Please enter a valid email and message, then try again." },
      { status: 400 }
    )
  }

  const details = Object.fromEntries(
    Object.entries(DETAIL_COLUMNS).map(([field, column]) => [
      column,
      optionalDetail(body, field),
    ])
  )
  const admin = createAdminClient()

  if (!admin) {
    return NextResponse.json(
      {
        message:
          "Online notes are being prepared. Please email Shannon directly for now.",
      },
      { status: 503 }
    )
  }
  const inquiryAdmin = admin

  const rateLimit = prepareInquirySubmissionClaim(request)
  if (rateLimit.status === "unavailable") {
    console.error("[contact] Inquiry rate limiting is unavailable.", {
      reason: rateLimit.reason,
    })
    return NextResponse.json(
      {
        message:
          "Online notes are being prepared. Please email Shannon directly for now.",
      },
      { status: 503 }
    )
  }

  const payloadDigest = createInquiryPayloadDigest(
    JSON.stringify({ ...details, email, message, name, source })
  )
  if (!payloadDigest) {
    return NextResponse.json(
      {
        message:
          "Online notes are being prepared. Please email Shannon directly for now.",
      },
      { status: 503 }
    )
  }

  const { data: recordData, error: recordError } = await inquiryAdmin.rpc(
    "record_inquiry_submission",
    {
      p_booking_preference: details.booking_preference,
      p_date_preference: details.date_preference,
      p_email: email,
      p_event_date: details.event_date,
      p_fingerprint: rateLimit.fingerprint,
      p_format: details.format,
      p_group_size: details.group_size,
      p_guest_count: details.guest_count,
      p_interests: details.interests,
      p_limit: rateLimit.limit,
      p_location: details.location,
      p_message: message,
      p_name: name,
      p_organization: details.organization,
      p_phone: details.phone,
      p_payload_digest: payloadDigest,
      p_preferred_date: details.preferred_date,
      p_preferred_window: details.preferred_window,
      p_service: details.service,
      p_service_slug: details.service_slug,
      p_services: details.services,
      p_source: source,
      p_subject: details.subject,
      p_submission_id: submissionId,
      p_time_zone: details.time_zone,
    }
  )

  if (recordError) {
    console.error("[contact] Inquiry persistence failed.", {
      code: recordError.code,
    })
    return NextResponse.json(
      {
        message:
          "Online notes are being prepared. Please email Shannon directly for now.",
      },
      { status: 503 }
    )
  }

  const record = Array.isArray(recordData)
    ? (recordData[0] as InquiryRecord | undefined)
    : undefined

  if (record?.rate_limited === true) {
    return NextResponse.json(
      {
        message:
          "We have received several notes from this connection. Please wait before sending another.",
      },
      { headers: { "Retry-After": "3600" }, status: 429 }
    )
  }

  if (record?.payload_matches === false) {
    return NextResponse.json(
      {
        message:
          "This submission receipt belongs to a different note. Please review the form and try again.",
        received: false,
      },
      { status: 409 }
    )
  }

  if (
    !record ||
    record.rate_limited !== false ||
    record.payload_matches !== true ||
    typeof record.inquiry_id !== "string" ||
    !record.notification_status ||
    !NOTIFICATION_STATUSES.has(record.notification_status)
  ) {
    console.error("[contact] Inquiry persistence returned an invalid receipt.")
    return NextResponse.json(
      {
        message:
          "Online notes are being prepared. Please email Shannon directly for now.",
      },
      { status: 503 }
    )
  }

  const inquiryId = record.inquiry_id

  function receipt(
    notification: NotificationStatus,
    message?: string,
    status = 202
  ) {
    return NextResponse.json(
      { message, notification, ok: true, received: true },
      { status }
    )
  }

  function terminalReceipt(notification: NotificationStatus) {
    if (notification === "accepted") {
      return receipt("accepted", undefined, 200)
    }
    if (notification === "not_configured") {
      return receipt(
        "not_configured",
        "Your inquiry is safely received. Email alerts are not configured, so the private inbox remains the record."
      )
    }
    if (notification === "failed") {
      return receipt(
        "failed",
        "Your inquiry is safely received. Its optional email alert failed, so the private inbox remains the record."
      )
    }
    if (notification === "audit_unknown") {
      return receipt(
        "audit_unknown",
        "Your inquiry is safely received. The email alert outcome could not be confirmed; the private inbox remains the record."
      )
    }
    return null
  }

  const recordedTerminalReceipt = terminalReceipt(record.notification_status)
  if (recordedTerminalReceipt) return recordedTerminalReceipt

  if (record.notification_status === "attempting") {
    const { data: staleClaimMarked, error: staleClaimError } =
      await inquiryAdmin.rpc("mark_stale_inquiry_notification_unknown", {
        p_inquiry_id: inquiryId,
        p_submission_id: submissionId,
      })

    if (staleClaimError || typeof staleClaimMarked !== "boolean") {
      console.error("[contact] Stale inquiry notification audit failed.", {
        code: staleClaimError?.code ?? "invalid_response",
      })
      return receipt(
        "audit_unknown",
        "Your inquiry is safely received. Its earlier email attempt could not be reconciled; the private inbox remains the record."
      )
    }

    if (staleClaimMarked) {
      return receipt(
        "audit_unknown",
        "Your inquiry is safely received. Its earlier email attempt did not complete its audit and will not be sent again automatically; the private inbox remains the record."
      )
    }

    const { data: currentNotification, error: currentNotificationError } =
      await inquiryAdmin
        .from("inquiries")
        .select("notification_status")
        .eq("id", inquiryId)
        .eq("submission_id", submissionId)
        .maybeSingle()

    const currentStatus = currentNotification?.notification_status
    if (
      currentNotificationError ||
      typeof currentStatus !== "string" ||
      !NOTIFICATION_STATUSES.has(currentStatus as NotificationStatus)
    ) {
      console.error("[contact] Inquiry notification re-read failed.", {
        code: currentNotificationError?.code ?? "invalid_response",
      })
      return receipt(
        "audit_unknown",
        "Your inquiry is safely received. Its earlier email attempt could not be re-read; the private inbox remains the record."
      )
    }

    const currentTerminalReceipt = terminalReceipt(
      currentStatus as NotificationStatus
    )
    if (currentTerminalReceipt) return currentTerminalReceipt
    if (currentStatus !== "attempting") {
      return receipt(
        "audit_unknown",
        "Your inquiry is safely received. Its notification state changed unexpectedly; the private inbox remains the record."
      )
    }

    return receipt(
      "attempting",
      "Your inquiry is safely received. An optional email attempt has started, but its outcome is not yet confirmed by this request; the private inbox remains the record."
    )
  }

  const { data: notificationClaim, error: notificationClaimError } =
    await inquiryAdmin.rpc("claim_inquiry_notification", {
      p_inquiry_id: inquiryId,
      p_submission_id: submissionId,
    })

  if (notificationClaimError || typeof notificationClaim !== "boolean") {
    console.error("[contact] Inquiry notification claim failed.", {
      code: notificationClaimError?.code ?? "invalid_response",
    })
    return receipt(
      "audit_unknown",
      "Your inquiry is safely received. Its notification audit could not be started; the private inbox remains the record."
    )
  }

  if (!notificationClaim) {
    return receipt(
      "attempting",
      "Your inquiry is safely received. Another request already claimed its optional email alert, but its outcome is not yet confirmed by this request; the private inbox remains the record."
    )
  }

  async function markNotification(
    notificationStatus: Exclude<
      NotificationStatus,
      "attempting" | "unattempted"
    >,
    errorCode: NotificationErrorCode | null,
    providerId: string | null = null
  ) {
    const { data, error } = await inquiryAdmin.rpc(
      "complete_inquiry_notification",
      {
        p_error_code: errorCode,
        p_inquiry_id: inquiryId,
        p_provider_id: providerId,
        p_status: notificationStatus,
        p_submission_id: submissionId,
      }
    )

    if (error || data !== true) {
      console.error("[contact] Inquiry notification audit update failed.", {
        code: error?.code ?? "missing_record",
      })
      return false
    }

    return true
  }

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL
  const from = process.env.CONTACT_FROM_EMAIL

  if (!apiKey || !to || !from) {
    const audited = await markNotification(
      "not_configured",
      "configuration_missing"
    )
    return audited
      ? receipt(
          "not_configured",
          "Your inquiry is safely received. Email alerts are not configured, so the private inbox remains the record."
        )
      : receipt(
          "audit_unknown",
          "Your inquiry is safely received. Its notification audit could not be updated; the private inbox remains the record."
        )
  }

  const adminInboxPath = `/admin/inquiries?inquiry=${encodeURIComponent(inquiryId)}#inquiry-${encodeURIComponent(inquiryId)}`
  let adminInboxUrl: string
  try {
    const loginUrl = new URL(
      "/login",
      process.env.NEXT_PUBLIC_SITE_URL?.trim() || request.url
    )
    loginUrl.searchParams.set("redirectTo", adminInboxPath)
    adminInboxUrl = loginUrl.toString()
  } catch {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirectTo", adminInboxPath)
    adminInboxUrl = loginUrl.toString()
  }

  let response: Response
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `hwl-inquiry-${submissionId}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "HWL by SMD · New private inquiry",
        text: [
          "A new website inquiry is stored in the private HWL inbox.",
          `Inquiry ID: ${inquiryId}`,
          `Source: ${source}`,
          `Review securely: ${adminInboxUrl}`,
          "Submitted contact details and message content are intentionally omitted from this email.",
        ].join("\n\n"),
      }),
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    const audited = await markNotification(
      "audit_unknown",
      "network_outcome_unknown"
    )
    return audited
      ? receipt(
          "audit_unknown",
          "Your inquiry is safely received. The email alert’s network outcome could not be confirmed; the private inbox remains the record."
        )
      : receipt(
          "audit_unknown",
          "Your inquiry is safely received. Its notification audit could not be updated; the private inbox remains the record."
        )
  }

  if (!response.ok) {
    const audited = await markNotification("failed", "provider_rejected")
    return audited
      ? receipt(
          "failed",
          "Your inquiry is safely received. Its optional email alert failed, so the private inbox remains the record."
        )
      : receipt(
          "audit_unknown",
          "Your inquiry is safely received. Its notification audit could not be updated; the private inbox remains the record."
        )
  }

  let providerId: string | null = null
  try {
    const providerReceipt: unknown = await response.json()
    if (
      typeof providerReceipt === "object" &&
      providerReceipt !== null &&
      "id" in providerReceipt &&
      typeof providerReceipt.id === "string"
    ) {
      providerId = validProviderReceiptId(providerReceipt.id)
    }
  } catch {
    // A provider body is optional evidence; it is never logged or persisted.
  }

  if (!providerId) {
    const audited = await markNotification(
      "audit_unknown",
      "provider_receipt_missing"
    )
    return audited
      ? receipt(
          "audit_unknown",
          "Your inquiry is safely received. The email provider accepted the request without a usable receipt; the private inbox remains the record."
        )
      : receipt(
          "audit_unknown",
          "Your inquiry is safely received. The email provider accepted the request, but its notification audit could not be updated; the private inbox remains the record."
        )
  }

  const audited = await markNotification("accepted", null, providerId)
  return audited
    ? receipt("accepted", undefined, 200)
    : receipt(
        "audit_unknown",
        "Your inquiry is safely received. The email provider accepted the alert, but its audit record could not be updated."
      )
}
