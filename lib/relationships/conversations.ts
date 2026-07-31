import "server-only"

import { createClient } from "@/lib/supabase/server"

type MemberClient = NonNullable<Awaited<ReturnType<typeof createClient>>>

type ConversationRow = {
  id: string
  member_unread_count: number | null
  practitioner_unread_count: number | null
  relationship_id: string
  status: string
}

type RelationshipRow = {
  member_id: string
  practitioner_id: string
}

export type OwnedConversation = {
  id: string
  memberUnreadCount: number
  practitionerId: string
  practitionerUnreadCount: number
  relationshipId: string
  status: string
}

export type ConversationLookup =
  | { conversation: OwnedConversation; kind: "found" }
  | { kind: "not-found" }
  | { kind: "unavailable" }
  | { kind: "error" }

const SCHEMA_ERROR_CODES = new Set([
  "42P01",
  "42703",
  "PGRST202",
  "PGRST204",
  "PGRST205",
])

export function isRelationshipSchemaUnavailable(error: {
  code?: string
  message?: string
}) {
  return (
    SCHEMA_ERROR_CODES.has(error.code ?? "") ||
    error.message?.includes("schema cache") === true
  )
}

export async function getOwnedConversation(
  supabase: MemberClient,
  conversationId: string,
  memberId: string
): Promise<ConversationLookup> {
  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select(
      "id, relationship_id, status, member_unread_count, practitioner_unread_count"
    )
    .eq("id", conversationId)
    .maybeSingle()

  if (conversationError) {
    return isRelationshipSchemaUnavailable(conversationError)
      ? { kind: "unavailable" }
      : { kind: "error" }
  }
  if (!conversation) return { kind: "not-found" }

  const row = conversation as ConversationRow
  const { data: relationship, error: relationshipError } = await supabase
    .from("relationships")
    .select("member_id, practitioner_id")
    .eq("id", row.relationship_id)
    .eq("member_id", memberId)
    .maybeSingle()

  if (relationshipError) {
    return isRelationshipSchemaUnavailable(relationshipError)
      ? { kind: "unavailable" }
      : { kind: "error" }
  }
  if (!relationship) return { kind: "not-found" }

  const relationshipRow = relationship as RelationshipRow
  return {
    conversation: {
      id: row.id,
      memberUnreadCount: Math.max(0, row.member_unread_count ?? 0),
      practitionerId: relationshipRow.practitioner_id,
      practitionerUnreadCount: Math.max(0, row.practitioner_unread_count ?? 0),
      relationshipId: row.relationship_id,
      status: row.status,
    },
    kind: "found",
  }
}
