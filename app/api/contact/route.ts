import { NextResponse } from "next/server"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>
  const email = typeof body.email === "string" ? body.email.trim() : ""
  const name =
    typeof body.name === "string" && body.name.trim()
      ? body.name.trim()
      : "Website guest"
  const message = typeof body.message === "string" ? body.message.trim() : ""
  const source =
    typeof body.source === "string" ? body.source : "website-inquiry"

  if (body.website) {
    return NextResponse.json({ ok: true })
  }

  if (!EMAIL_PATTERN.test(email) || !message || message.length > 5000) {
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
        !["website", "source"].includes(key) &&
        typeof value === "string" &&
        value.trim()
    )
    .map(([key, value]) => `${key}: ${String(value).trim()}`)
    .join("\n\n")

  const response = await fetch("https://api.resend.com/emails", {
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
  })

  if (!response.ok) {
    return NextResponse.json(
      { message: "Your note could not be sent. Please try again shortly." },
      { status: 502 }
    )
  }

  return NextResponse.json({ ok: true })
}
