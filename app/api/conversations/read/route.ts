import { NextResponse } from "next/server"

import { getAuthenticatedUser, getMemberAccess } from "@/lib/access"
import {
  getOwnedConversation,
  isRelationshipSchemaUnavailable,
} from "@/lib/relationships/conversations"
import {
  hasJsonContentType,
  isSameOriginMutation,
  isUuid,
  readLimitedJson,
} from "@/lib/relationships/request"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  if (!isSameOriginMutation(request, { requireOrigin: true })) {
    return NextResponse.json({ error: "Request not allowed." }, { status: 403 })
  }
  if (!hasJsonContentType(request)) {
    return NextResponse.json(
      { error: "A valid JSON request is required." },
      { status: 400 }
    )
  }

  const parsedJson = await readLimitedJson<unknown>(request, 2_000)
  if (!parsedJson.ok) {
    return NextResponse.json(
      {
        error:
          parsedJson.reason === "too_large"
            ? "The read request is too large."
            : "A valid JSON request is required.",
      },
      { status: parsedJson.reason === "too_large" ? 413 : 400 }
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

  const payload = parsedJson.value as {
    conversationId?: unknown
  } | null
  if (!isUuid(payload?.conversationId)) {
    return NextResponse.json(
      { error: "Invalid conversation." },
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
      { error: "The conversation could not be updated." },
      { status: 500 }
    )
  }
  if (lookup.kind === "not-found") {
    return NextResponse.json(
      { error: "Conversation not found." },
      { status: 404 }
    )
  }

  const { data: markedCount, error } = await supabase.rpc(
    "mark_conversation_read",
    { p_conversation_id: lookup.conversation.id }
  )
  if (error) {
    return NextResponse.json(
      {
        error: isRelationshipSchemaUnavailable(error)
          ? "The Connection Hub is being prepared."
          : "The conversation could not be updated.",
      },
      { status: isRelationshipSchemaUnavailable(error) ? 503 : 500 }
    )
  }

  return NextResponse.json(
    {
      markedCount:
        typeof markedCount === "number" ? Math.max(0, markedCount) : 0,
      success: true,
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}
