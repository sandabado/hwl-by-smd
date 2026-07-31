import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

import type {
  ConversationMessageRecord,
  ConversationRecord,
  RelationshipAlertSeverity,
  RelationshipRecord,
} from "@/lib/connection-engine/types"
import { createAdminClient } from "@/lib/supabase/server"

const SUPPORT_KEYWORDS = [
  "busy",
  "struggle",
  "struggling",
  "not working",
  "pain",
  "emergency",
  "urgent",
  "help",
] as const

type AlertNotice = {
  alertId: string
  relationshipId: string
  severity: RelationshipAlertSeverity
}

export type RelationshipAlertNotifier = (notice: AlertNotice) => Promise<void>

export type RelationshipAlertScanResult = {
  configured: boolean
  created: number
  notificationsFailed: number
  scanned: number
}

function matchedKeyword(body: string) {
  const normalized = body.toLocaleLowerCase("en-US")
  return (
    SUPPORT_KEYWORDS.find((keyword) => normalized.includes(keyword)) ?? null
  )
}

function keywordSeverity(keyword: string): RelationshipAlertSeverity {
  return keyword === "emergency" || keyword === "urgent"
    ? "urgent"
    : "attention"
}

async function createAlert(
  supabase: SupabaseClient,
  alert: {
    alert_type: "support_keyword" | "struggling_sentiment" | "response_overdue"
    conversation_id: string
    matched_keyword: string | null
    message_id: string | null
    relationship_id: string
    severity: RelationshipAlertSeverity
  }
) {
  const { data, error } = await supabase
    .from("relationship_alerts")
    .insert(alert)
    .select("id")
    .single()

  if (error?.code === "23505") return null
  if (error || !data?.id)
    throw new Error("Relationship alert could not be saved.")
  return String(data.id)
}

async function notifySafely(
  notifier: RelationshipAlertNotifier | undefined,
  notice: AlertNotice
) {
  if (!notifier) return true
  try {
    await notifier(notice)
    return true
  } catch {
    return false
  }
}

/**
 * Nightly support scan. It stores only the matched keyword, never a private
 * message excerpt, and deliberately does not auto-reply to sensitive language.
 */
export async function scanRelationshipAlerts({
  lookbackHours = 24,
  now = new Date(),
  notify,
  responseTargetHours = 12,
}: {
  lookbackHours?: number
  now?: Date
  notify?: RelationshipAlertNotifier
  responseTargetHours?: number
} = {}): Promise<RelationshipAlertScanResult> {
  const supabase = createAdminClient()
  if (!supabase) {
    return { configured: false, created: 0, notificationsFailed: 0, scanned: 0 }
  }

  const since = new Date(
    now.getTime() - Math.max(1, lookbackHours) * 60 * 60 * 1000
  ).toISOString()
  const { data: messageData, error: messageError } = await supabase
    .from("conversation_messages")
    .select(
      "id, conversation_id, sender_id, body, body_format, sent_at, read_at, reply_to_id, sentiment, cta_label, cta_link"
    )
    .gte("sent_at", since)
    .order("sent_at", { ascending: true })

  if (messageError) {
    return { configured: true, created: 0, notificationsFailed: 0, scanned: 0 }
  }

  const messages = (messageData ?? []) as ConversationMessageRecord[]
  const conversationIds = [
    ...new Set(messages.map((message) => message.conversation_id)),
  ]
  const { data: conversationData } = conversationIds.length
    ? await supabase
        .from("conversations")
        .select(
          "id, relationship_id, journey_enrollment_id, type, subject, status, member_unread_count, practitioner_unread_count, last_message, last_message_at, created_at, updated_at"
        )
        .in("id", conversationIds)
    : { data: [] }
  const conversations = (conversationData ?? []) as ConversationRecord[]
  const relationshipIds = [
    ...new Set(
      conversations.map((conversation) => conversation.relationship_id)
    ),
  ]
  const { data: relationshipData } = relationshipIds.length
    ? await supabase
        .from("relationships")
        .select(
          "id, member_id, practitioner_id, status, created_at, last_interaction, intimacy_score"
        )
        .in("id", relationshipIds)
    : { data: [] }
  const relationshipById = new Map(
    ((relationshipData ?? []) as RelationshipRecord[]).map((relationship) => [
      relationship.id,
      relationship,
    ])
  )
  const conversationById = new Map(
    conversations.map((conversation) => [conversation.id, conversation])
  )

  let created = 0
  let notificationsFailed = 0
  for (const message of messages) {
    const conversation = conversationById.get(message.conversation_id)
    const relationship = conversation
      ? relationshipById.get(conversation.relationship_id)
      : null
    if (
      !conversation ||
      !relationship ||
      message.sender_id !== relationship.member_id
    ) {
      continue
    }

    const keyword = matchedKeyword(message.body)
    const alerts: Array<{
      alertType: "support_keyword" | "struggling_sentiment"
      keyword: string | null
      severity: RelationshipAlertSeverity
    }> = []
    if (keyword) {
      alerts.push({
        alertType: "support_keyword",
        keyword,
        severity: keywordSeverity(keyword),
      })
    }
    if (message.sentiment === "struggling") {
      alerts.push({
        alertType: "struggling_sentiment",
        keyword: null,
        severity: "urgent",
      })
    }

    for (const alert of alerts) {
      const alertId = await createAlert(supabase, {
        alert_type: alert.alertType,
        conversation_id: conversation.id,
        matched_keyword: alert.keyword,
        message_id: message.id,
        relationship_id: relationship.id,
        severity: alert.severity,
      })
      if (!alertId) continue
      created += 1
      const notified = await notifySafely(notify, {
        alertId,
        relationshipId: relationship.id,
        severity: alert.severity,
      })
      if (!notified) notificationsFailed += 1
    }
  }

  const overdueBefore = new Date(
    now.getTime() - Math.max(1, responseTargetHours) * 60 * 60 * 1000
  ).toISOString()
  const { data: overdueData } = await supabase
    .from("conversations")
    .select(
      "id, relationship_id, journey_enrollment_id, type, subject, status, member_unread_count, practitioner_unread_count, last_message, last_message_at, created_at, updated_at"
    )
    .eq("status", "awaiting_practitioner")
    .gt("practitioner_unread_count", 0)
    .lte("updated_at", overdueBefore)
    .limit(100)

  for (const conversation of (overdueData ?? []) as ConversationRecord[]) {
    const alertId = await createAlert(supabase, {
      alert_type: "response_overdue",
      conversation_id: conversation.id,
      matched_keyword: null,
      message_id: null,
      relationship_id: conversation.relationship_id,
      severity: "attention",
    })
    if (!alertId) continue
    created += 1
    const notified = await notifySafely(notify, {
      alertId,
      relationshipId: conversation.relationship_id,
      severity: "attention",
    })
    if (!notified) notificationsFailed += 1
  }

  return {
    configured: true,
    created,
    notificationsFailed,
    scanned: messages.length,
  }
}
