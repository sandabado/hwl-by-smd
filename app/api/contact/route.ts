import { NextResponse } from "next/server"

import {
  hasAcceptableBodySize,
  hasJsonContentType,
  isSameOriginMutation,
  readLimitedJson,
} from "@/lib/relationships/request"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAXIMUM_REQUEST_BYTES = 16_000
const MAXIMUM_MESSAGE_LENGTH = 5_000
const MAXIMUM_FIELD_LENGTH = 500
const ALLOWED_DETAIL_FIELDS = new Set([
  "bookingPreference",
  "datePreference",
  "email",
  "eventDate",
  "format",
  "guestCount",
  "groupSize",
  "interests",
  "location",
  "message",
  "name",
  "organization",
  "phone",
  "preferredDate",
  "preferredWindow",
  "service",
  "serviceSlug",
  "services",
  "subject",
  "timeZone",
])

function cleanSingleLine(value: string, maximum = MAXIMUM_FIELD_LENGTH) {
  return value
    .replace(/[\r\n\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maximum)
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
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
  const body = parsedBody.value
  const email = typeof body.email === "string" ? body.email.trim() : ""
  const name =
    typeof body.name === "string" && body.name.trim()
      ? cleanSingleLine(body.name, 120)
      : "Website guest"
  const message = typeof body.message === "string" ? body.message.trim() : ""
  const source =
    typeof body.source === "string"
      ? cleanSingleLine(body.source.toLowerCase(), 80).replace(
          /[^a-z0-9-]/g,
          "-"
        )
      : "website-inquiry"

  if (body.website) {
    return NextResponse.json({ ok: true })
  }

  if (
    email.length > 320 ||
    !EMAIL_PATTERN.test(email) ||
    !message ||
    message.length > MAXIMUM_MESSAGE_LENGTH
  ) {
    return NextResponse.json(
      { message: "Please enter a valid email and message." },
      { status: 400 }
    )
  }

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL
  const from = process.env.CONTACT_FROM_EMAIL

  if (!apiKey || !to || !from) {
    return NextResponse.json(
      {
        message:
          "Online notes are being prepared. Please email Shannon directly for now.",
      },
      { status: 503 }
    )
  }

  const details = Object.entries(body)
    .filter(
      ([key, value]) =>
        ALLOWED_DETAIL_FIELDS.has(key) &&
        typeof value === "string" &&
        value.trim() &&
        value.length <=
          (key === "message" ? MAXIMUM_MESSAGE_LENGTH : MAXIMUM_FIELD_LENGTH)
    )
    .map(
      ([key, value]) =>
        `${key}: ${key === "message" ? String(value).trim() : cleanSingleLine(String(value))}`
    )
    .join("\n\n")

  let response: Response
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `HWL by SMD · ${source} · ${name}`,
        text: details,
      }),
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    return NextResponse.json(
      { message: "Your note could not be sent. Please try again shortly." },
      { status: 502 }
    )
  }

  if (!response.ok) {
    return NextResponse.json(
      { message: "Your note could not be sent. Please try again shortly." },
      { status: 502 }
    )
  }

  return NextResponse.json({ ok: true })
}
