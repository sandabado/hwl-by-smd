import { NextResponse } from "next/server"

import { authenticateAdminApi } from "@/lib/relationships/admin-api"
import { isAdminConversationReplyReady } from "@/lib/relationships/messaging-readiness"
import {
  hasJsonContentType,
  isSameOriginMutation,
  isUuid,
  readLimitedJson,
} from "@/lib/relationships/request"
import { createAdminClient, createClient } from "@/lib/supabase/server"

const MAXIMUM_REQUEST_BYTES = 16_000
const MAXIMUM_MESSAGE_LENGTH = 10_000

function normalizeMessage(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
}

function isSafeCtaLink(value: string) {
  if (!value || value.length > 2_000) return false
  if (value.startsWith("/") && !value.startsWith("//")) return true

  try {
    return new URL(value).protocol === "https:"
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request, { requireOrigin: true })) {
    return NextResponse.json({ error: "Request not allowed." }, { status: 403 })
  }
  if (!hasJsonContentType(request)) {
    return NextResponse.json(
      { error: "A JSON request is required." },
      { status: 415 }
    )
  }

  const parsedJson = await readLimitedJson<unknown>(
    request,
    MAXIMUM_REQUEST_BYTES
  )
  if (!parsedJson.ok) {
    return NextResponse.json(
      {
        error:
          parsedJson.reason === "too_large"
            ? "Message is too large."
            : "A JSON request is required.",
      },
      { status: parsedJson.reason === "too_large" ? 413 : 400 }
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
  if (authorization.access.source === "local-preview") {
    return NextResponse.json(
      {
        error:
          "Live replies require the production relationship database and a verified assigned-practitioner account.",
      },
      { status: 503 }
    )
  }
  if (!isAdminConversationReplyReady()) {
    return NextResponse.json(
      {
        error:
          "Client replies remain read only until delivery notifications and the audit trail are verified.",
      },
      { headers: { "Cache-Control": "no-store" }, status: 503 }
    )
  }

  const payload = parsedJson.value as {
    body?: unknown
    conversationId?: unknown
    ctaLabel?: unknown
    ctaLink?: unknown
    replyToId?: unknown
  } | null
  const body =
    typeof payload?.body === "string" ? normalizeMessage(payload.body) : ""
  const ctaLabel =
    typeof payload?.ctaLabel === "string" ? payload.ctaLabel.trim() : null
  const ctaLink =
    typeof payload?.ctaLink === "string" ? payload.ctaLink.trim() : null
  const hasCta = ctaLabel !== null || ctaLink !== null

  if (
    !isUuid(payload?.conversationId) ||
    !body ||
    body.length > MAXIMUM_MESSAGE_LENGTH ||
    (payload?.replyToId !== undefined && !isUuid(payload.replyToId)) ||
    (hasCta &&
      (!ctaLabel ||
        ctaLabel.length > 80 ||
        !ctaLink ||
        !isSafeCtaLink(ctaLink)))
  ) {
    return NextResponse.json(
      { error: "Please enter a valid reply." },
      { status: 400 }
    )
  }

  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json(
      { error: "The production relationship database is not configured." },
      { status: 503 }
    )
  }

  const { data: conversation, error: conversationError } = await admin
    .from("conversations")
    .select("id, relationship_id")
    .eq("id", payload.conversationId)
    .maybeSingle()
  if (conversationError) {
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

  const { data: relationship, error: relationshipError } = await admin
    .from("relationships")
    .select("practitioner_id, status")
    .eq("id", conversation.relationship_id)
    .maybeSingle()
  if (relationshipError) {
    return NextResponse.json(
      { error: "The relationship could not be verified." },
      { status: 500 }
    )
  }
  if (
    !relationship ||
    relationship.status !== "active" ||
    relationship.practitioner_id !== authorization.access.userId
  ) {
    return NextResponse.json(
      { error: "This conversation is not available for replies." },
      { status: 403 }
    )
  }

  if (payload.replyToId) {
    const { data: replyTarget, error: replyTargetError } = await admin
      .from("conversation_messages")
      .select("id")
      .eq("id", payload.replyToId)
      .eq("conversation_id", conversation.id)
      .maybeSingle()
    if (replyTargetError || !replyTarget) {
      return NextResponse.json(
        { error: "The message you are replying to was not found." },
        { status: 400 }
      )
    }
  }

  const memberClient = await createClient()
  const { error: readError } =
    (await memberClient?.rpc("mark_conversation_read", {
      p_conversation_id: conversation.id,
    })) ?? {}
  if (readError) {
    return NextResponse.json(
      { error: "The conversation could not be marked as read." },
      { status: 500 }
    )
  }

  const { data: message, error: messageError } = await admin
    .from("conversation_messages")
    .insert({
      body,
      body_format: "plain_text",
      conversation_id: conversation.id,
      cta_label: hasCta ? ctaLabel : null,
      cta_link: hasCta ? ctaLink : null,
      read_at: null,
      reply_to_id: payload.replyToId ?? null,
      sender_id: relationship.practitioner_id,
      sentiment: null,
    })
    .select("id, body, sent_at, read_at, cta_label, cta_link")
    .single()

  if (messageError || !message) {
    return NextResponse.json(
      { error: "The reply could not be sent." },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      message: {
        body: message.body,
        ctaHref: message.cta_link ?? undefined,
        ctaLabel: message.cta_label ?? undefined,
        id: message.id,
        readAt: message.read_at,
        sender: "practitioner" as const,
        sentAt: message.sent_at,
      },
    },
    {
      headers: { "Cache-Control": "no-store" },
      status: 201,
    }
  )
}
