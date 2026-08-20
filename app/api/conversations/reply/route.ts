import { NextResponse } from "next/server"

import { getAuthenticatedUser, getMemberAccess } from "@/lib/access"
import {
  getOwnedConversation,
  isRelationshipSchemaUnavailable,
} from "@/lib/relationships/conversations"
import {
  hasAcceptableBodySize,
  hasJsonContentType,
  isSameOriginMutation,
  isUuid,
} from "@/lib/relationships/request"
import { createClient } from "@/lib/supabase/server"

const MAXIMUM_REQUEST_BYTES = 12_000
const MAXIMUM_MESSAGE_LENGTH = 4_000

function normalizeMessage(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: "Request not allowed." }, { status: 403 })
  }
  if (!hasJsonContentType(request)) {
    return NextResponse.json(
      { error: "A JSON request is required." },
      { status: 415 }
    )
  }
  if (!hasAcceptableBodySize(request, MAXIMUM_REQUEST_BYTES)) {
    return NextResponse.json(
      { error: "Message is too large." },
      { status: 413 }
    )
  }

  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 })
  }
  const access = await getMemberAccess(user.id)
  if (!access.isMember) {
    return NextResponse.json(
      { error: "An active Den membership is required." },
      { status: 403 }
    )
  }

  const payload = (await request.json().catch(() => null)) as {
    body?: unknown
    conversationId?: unknown
    replyToId?: unknown
  } | null
  const body =
    typeof payload?.body === "string" ? normalizeMessage(payload.body) : ""

  if (
    !isUuid(payload?.conversationId) ||
    !body ||
    body.length > MAXIMUM_MESSAGE_LENGTH ||
    (payload?.replyToId !== undefined && !isUuid(payload.replyToId))
  ) {
    return NextResponse.json(
      { error: "Please enter a valid reply." },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json(
      { error: "The Connection Hub is not configured yet." },
      { status: 503 }
    )
  }

  const lookup = await getOwnedConversation(
    supabase,
    payload.conversationId,
    user.id
  )
  if (lookup.kind === "unavailable") {
    return NextResponse.json(
      { error: "The Connection Hub is being prepared." },
      { status: 503 }
    )
  }
  if (lookup.kind === "error") {
    return NextResponse.json(
      { error: "Your reply could not be sent." },
      { status: 500 }
    )
  }
  if (lookup.kind === "not-found") {
    return NextResponse.json(
      { error: "Conversation not found." },
      { status: 404 }
    )
  }

  const { data: messageId, error: sendError } = await supabase.rpc(
    "send_conversation_message",
    {
      p_body: body,
      p_conversation_id: lookup.conversation.id,
      p_reply_to_id: payload.replyToId ?? null,
    }
  )

  if (sendError || !isUuid(messageId)) {
    return NextResponse.json(
      {
        error:
          sendError && isRelationshipSchemaUnavailable(sendError)
            ? "The Connection Hub is being prepared."
            : "Your reply could not be sent.",
      },
      {
        status:
          sendError && isRelationshipSchemaUnavailable(sendError) ? 503 : 500,
      }
    )
  }

  const { data: message, error: messageError } = await supabase
    .from("conversation_messages")
    .select("id, body, sent_at, read_at")
    .eq("id", messageId)
    .eq("conversation_id", lookup.conversation.id)
    .single()

  if (messageError || !message) {
    return NextResponse.json(
      { error: "Your reply was sent but could not be reloaded." },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      message: {
        body: message.body,
        id: message.id,
        readAt: message.read_at,
        sender: "member" as const,
        sentAt: message.sent_at,
      },
    },
    {
      headers: { "Cache-Control": "no-store" },
      status: 201,
    }
  )
}
