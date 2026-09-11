import "server-only"

import { getCanonicalContactToEmail } from "@/lib/commerce/launch-authority"
import { getSiteUrl } from "@/lib/env"
import { createAdminClient } from "@/lib/supabase/server"

const SUPPORT_PATTERNS = [
  { keyword: "busy", pattern: /\bbusy\b/i },
  { keyword: "emergency", pattern: /\bemergenc(?:y|ies)\b/i },
  { keyword: "help", pattern: /\bhelp\b/i },
  { keyword: "not working", pattern: /\bnot working\b/i },
  { keyword: "pain", pattern: /\bpain(?:ful)?\b/i },
  { keyword: "struggle", pattern: /\bstruggl(?:e|ed|es|ing)\b/i },
  { keyword: "urgent", pattern: /\burgent\b/i },
] as const

type MessageRow = {
  body: string
  conversation_id: string
  id: string
  sender_id: string
}

type ConversationRow = {
  id: string
  journey_enrollment_id: string | null
  relationship_id: string
  subject: string | null
}

type RelationshipRow = {
  id: string
  member_id: string
}

type ProfileRow = {
  full_name: string | null
  id: string
}

function matchedKeywords(body: string) {
  return SUPPORT_PATTERNS.filter(({ pattern }) => pattern.test(body)).map(
    ({ keyword }) => keyword
  )
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

async function notifyShannon(
  alerts: Array<{
    conversationId: string
    memberName: string
    subject: string
  }>
) {
  const apiKey = process.env.RESEND_API_KEY
  const to = getCanonicalContactToEmail(process.env)
  if (!apiKey || !to || !alerts.length) return { skipped: true }

  const siteUrl = getSiteUrl()
  const items = alerts
    .map(
      (alert) =>
        `<li style="margin:0 0 14px"><strong>${escapeHtml(alert.memberName)}</strong> · ${escapeHtml(alert.subject)}<br><a href="${siteUrl}/admin/connection">Open the Connection queue</a></li>`
    )
    .join("")

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? "HWL by SMD <hello@hwlbysmd.com>",
      html: `<div style="font-family:Arial,sans-serif;color:#3f4a42;line-height:1.65"><h1 style="font-family:Georgia,serif">A gentle check-in is needed.</h1><p>${alerts.length === 1 ? "One relationship was" : `${alerts.length} relationships were`} flagged for human support. Automated journey messages have been paused where applicable.</p><ul>${items}</ul></div>`,
      subject:
        alerts.length === 1
          ? `Check on ${alerts[0].memberName} — flagged for support`
          : `${alerts.length} members were flagged for support`,
      to,
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  })

  if (!response.ok) throw new Error("Relationship alert email failed.")
  return { skipped: false }
}

export async function runRelationshipHealthScan() {
  const supabase = createAdminClient()
  if (!supabase) {
    return { kind: "unavailable" as const }
  }

  const scanWindowStart = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString()
  const { data, error } = await supabase
    .from("conversation_messages")
    .select("id, conversation_id, sender_id, body")
    .gte("sent_at", scanWindowStart)
    .or("sentiment.is.null,sentiment.neq.struggling")
    .order("sent_at", { ascending: true })
    .limit(500)

  if (error) {
    return { kind: "error" as const }
  }

  const candidates = ((data ?? []) as MessageRow[])
    .map((message) => ({
      ...message,
      keywords: matchedKeywords(message.body),
    }))
    .filter((message) => message.keywords.length > 0)

  if (!candidates.length) {
    return {
      alertsCreated: 0,
      emailSkipped: true,
      kind: "complete" as const,
      messagesScanned: data?.length ?? 0,
    }
  }

  const conversationIds = [
    ...new Set(candidates.map((message) => message.conversation_id)),
  ]

  const { data: conversationData, error: conversationError } = await supabase
    .from("conversations")
    .select("id, relationship_id, journey_enrollment_id, subject")
    .in("id", conversationIds)
  if (conversationError) return { kind: "error" as const }

  const conversations = (conversationData ?? []) as ConversationRow[]
  const conversationById = new Map(
    conversations.map((conversation) => [conversation.id, conversation])
  )
  const relationshipIds = [
    ...new Set(
      conversations.map((conversation) => conversation.relationship_id)
    ),
  ]
  const { data: relationshipData, error: relationshipError } =
    relationshipIds.length
      ? await supabase
          .from("relationships")
          .select("id, member_id")
          .in("id", relationshipIds)
      : { data: [], error: null }
  if (relationshipError) return { kind: "error" as const }

  const relationships = (relationshipData ?? []) as RelationshipRow[]
  const relationshipById = new Map(
    relationships.map((relationship) => [relationship.id, relationship])
  )
  const flagged = candidates.filter((message) => {
    const conversation = conversationById.get(message.conversation_id)
    const relationship = conversation
      ? relationshipById.get(conversation.relationship_id)
      : undefined
    return relationship?.member_id === message.sender_id
  })

  if (!flagged.length) {
    return {
      alertsCreated: 0,
      emailSkipped: true,
      kind: "complete" as const,
      messagesScanned: data?.length ?? 0,
    }
  }

  const messageIds = flagged.map((message) => message.id)
  const flaggedConversationIds = [
    ...new Set(flagged.map((message) => message.conversation_id)),
  ]
  const { data: existingAlertData, error: existingAlertError } = await supabase
    .from("relationship_alerts")
    .select("message_id")
    .eq("alert_type", "support_keyword")
    .in("message_id", messageIds)
  if (existingAlertError) return { kind: "error" as const }

  const existingAlertMessageIds = new Set(
    (existingAlertData ?? []).map((alert) => String(alert.message_id))
  )
  const newAlerts = flagged.filter(
    (message) => !existingAlertMessageIds.has(message.id)
  )
  if (newAlerts.length) {
    const { error: alertError } = await supabase
      .from("relationship_alerts")
      .insert(
        newAlerts.map((message) => {
          const conversation = conversationById.get(message.conversation_id)!
          const urgent = message.keywords.some((keyword) =>
            ["emergency", "help", "urgent"].includes(keyword)
          )

          return {
            alert_type: "support_keyword",
            conversation_id: conversation.id,
            matched_keyword: message.keywords[0],
            message_id: message.id,
            relationship_id: conversation.relationship_id,
            severity: urgent ? "urgent" : "attention",
            status: "open",
          }
        })
      )
    if (alertError) return { kind: "error" as const }
  }

  const { error: sentimentError } = await supabase
    .from("conversation_messages")
    .update({ sentiment: "struggling" })
    .in("id", messageIds)
  if (sentimentError) return { kind: "error" as const }

  const now = new Date().toISOString()
  const { error: statusError } = await supabase
    .from("conversations")
    .update({ status: "awaiting_practitioner", updated_at: now })
    .in("id", flaggedConversationIds)
  if (statusError) return { kind: "error" as const }

  const enrollmentIds = conversations
    .filter((conversation) => flaggedConversationIds.includes(conversation.id))
    .map((conversation) => conversation.journey_enrollment_id)
    .filter((id): id is string => Boolean(id))
  if (enrollmentIds.length) {
    const { error: pauseError } = await supabase
      .from("journey_enrollments")
      .update({
        pause_until: null,
        paused_at: now,
        status: "paused",
        updated_at: now,
      })
      .in("id", enrollmentIds)
      .in("status", ["pending", "active"])
    if (pauseError) return { kind: "error" as const }
  }

  const memberIds = [
    ...new Set(relationships.map((relationship) => relationship.member_id)),
  ]
  const { data: profileData, error: profileError } = memberIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", memberIds)
    : { data: [], error: null }
  if (profileError) return { kind: "error" as const }
  const profiles = (profileData ?? []) as ProfileRow[]

  const profileById = new Map(profiles.map((profile) => [profile.id, profile]))
  const newAlertConversationIds = new Set(
    newAlerts.map((message) => message.conversation_id)
  )
  const alerts = conversations
    .filter((conversation) => newAlertConversationIds.has(conversation.id))
    .map((conversation) => {
      const relationship = relationshipById.get(conversation.relationship_id)
      const profile = relationship
        ? profileById.get(relationship.member_id)
        : undefined

      return {
        conversationId: conversation.id,
        memberName: profile?.full_name?.trim() || "a member",
        subject: conversation.subject || "Private conversation",
      }
    })

  let emailSkipped = true
  try {
    const email = await notifyShannon(alerts)
    emailSkipped = email.skipped
  } catch {
    // The support state is already persisted. A temporary email delivery
    // failure must not roll back or repeatedly re-flag private messages.
    emailSkipped = true
  }

  return {
    alertsCreated: newAlerts.length,
    emailSkipped,
    kind: "complete" as const,
    messagesScanned: data?.length ?? 0,
  }
}
