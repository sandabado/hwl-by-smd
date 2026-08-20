import { NextResponse } from "next/server"

import { authenticateAdminApi } from "@/lib/relationships/admin-api"
import {
  hasAcceptableBodySize,
  hasJsonContentType,
  isSameOriginMutation,
  isUuid,
} from "@/lib/relationships/request"
import { findBookingService } from "@/lib/booking-services"
import { createClient } from "@/lib/supabase/server"

const allowedDurations = new Set([15, 30, 45, 60, 90, 120])
const bookingServiceByCategory = {
  beauty: "signature-facial",
  being: "intuitive-tarot-reading",
  body: "private-yoga-and-sound",
} as const

type ServiceCategory = keyof typeof bookingServiceByCategory

function isServiceCategory(value: unknown): value is ServiceCategory {
  return (
    typeof value === "string" && Object.hasOwn(bookingServiceByCategory, value)
  )
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: "Request not allowed." }, { status: 403 })
  }
  if (!hasJsonContentType(request) || !hasAcceptableBodySize(request, 8_000)) {
    return NextResponse.json(
      { error: "A valid JSON request is required." },
      { status: 400 }
    )
  }

  const authorization = await authenticateAdminApi(request)
  if (!authorization.ok) {
    const message =
      authorization.status === 401
        ? "Please sign in."
        : authorization.status === 403
          ? "Administrator access is required."
          : "Administrator access is not configured."
    return NextResponse.json(
      { error: message },
      { status: authorization.status }
    )
  }

  const payload = (await request.json().catch(() => null)) as {
    conversationId?: unknown
    durationMinutes?: unknown
    message?: unknown
    service?: unknown
  } | null
  const message =
    typeof payload?.message === "string"
      ? payload.message
          .replace(/\r\n?/g, "\n")
          .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
          .trim()
      : ""

  if (
    !isUuid(payload?.conversationId) ||
    !isServiceCategory(payload.service) ||
    typeof payload.durationMinutes !== "number" ||
    !Number.isInteger(payload.durationMinutes) ||
    !allowedDurations.has(payload.durationMinutes) ||
    !message ||
    message.length > 500
  ) {
    return NextResponse.json(
      { error: "Please choose a valid service and duration." },
      { status: 400 }
    )
  }

  if (authorization.access.source === "supabase") {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json(
        { error: "The Connection Hub is not configured." },
        { status: 503 }
      )
    }

    const { data: conversation, error } = await supabase
      .from("conversations")
      .select("id, relationship_id")
      .eq("id", payload.conversationId)
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { error: "The conversation could not be verified." },
        { status: 500 }
      )
    }
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found." },
        { status: 404 }
      )
    }

    const { data: relationship, error: relationshipError } = await supabase
      .from("relationships")
      .select("practitioner_id, status")
      .eq("id", conversation.relationship_id)
      .maybeSingle()
    if (
      relationshipError ||
      !relationship ||
      relationship.status !== "active" ||
      relationship.practitioner_id !== authorization.access.userId
    ) {
      return NextResponse.json(
        { error: "This conversation is not available." },
        { status: 403 }
      )
    }
  }

  const bookingSelection = findBookingService(
    bookingServiceByCategory[payload.service]
  )
  if (!bookingSelection) {
    return NextResponse.json(
      { error: "The selected booking service is not configured." },
      { status: 503 }
    )
  }

  const search = new URLSearchParams({
    service: bookingSelection.service.slug,
  })

  return NextResponse.json(
    {
      cta: {
        durationMinutes: payload.durationMinutes,
        href: `/book?${search.toString()}`,
        kind: "booking",
        label: `Book ${bookingSelection.service.title}`,
        message,
        service: bookingSelection.service.slug,
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}
