import "server-only"

import { createClient } from "@/lib/supabase/server"

export type ConversationMessage = {
  body: string
  ctaHref?: string
  ctaLabel?: string
  id: string
  readAt: string | null
  sentAt: string
  sender: "member" | "shannon"
}

export type ConnectionConversation = {
  journeyId: string | null
  subject: string
  id: string
  lastMessage: string
  messages: ConversationMessage[]
  progressLabel: string
  unreadCount: number
}

export type UpcomingJourney = {
  id: string
  startDate: string
  title: string
}

export type ConnectionHubData = {
  conversations: ConnectionConversation[]
  upcoming: UpcomingJourney[]
}

type ConversationRow = {
  conversation_messages:
    | {
        body: string
        cta_label?: string | null
        cta_link?: string | null
        id: string
        read_at: string | null
        sender_id: string
        sent_at: string
      }[]
    | null
  id: string
  journey_enrollment:
    | {
        journey: { name?: string | null } | { name?: string | null }[] | null
        next_milestone_position?: number | null
      }
    | {
        journey: { name?: string | null } | { name?: string | null }[] | null
        next_milestone_position?: number | null
      }[]
    | null
  journey_enrollment_id: string | null
  last_message: string | null
  member_unread_count: number | null
  subject: string
}

function getJourneyEnrollment(
  enrollment: ConversationRow["journey_enrollment"]
) {
  return Array.isArray(enrollment) ? (enrollment[0] ?? null) : enrollment
}

function getJourneyName(
  journey:
    { name?: string | null } | { name?: string | null }[] | null | undefined
) {
  return (Array.isArray(journey) ? journey[0]?.name : journey?.name) ?? null
}

export async function getConnectionHubData(
  userId: string
): Promise<ConnectionHubData> {
  const supabase = await createClient()
  if (!supabase) {
    return { conversations: [], upcoming: [] }
  }

  const [{ data: conversationData }, { data: upcomingData }] =
    await Promise.all([
      supabase
        .from("conversations")
        .select(
          "id, subject, journey_enrollment_id, last_message, member_unread_count, relationships!inner(member_id), journey_enrollment:journey_enrollments(next_milestone_position, journey:journeys(name)), conversation_messages(id, sender_id, body, sent_at, read_at, cta_label, cta_link)"
        )
        .eq("relationships.member_id", userId)
        .order("last_message_at", { ascending: false }),
      supabase
        .from("journeys")
        .select("id, name, start_at")
        .in("status", ["scheduled", "active"])
        .gt("start_at", new Date().toISOString())
        .order("start_at", { ascending: true })
        .limit(4),
    ])

  const rows = (conversationData ?? []) as unknown as ConversationRow[]
  const conversations = rows.map((row) => {
    const enrollment = getJourneyEnrollment(row.journey_enrollment)
    const journeyName = getJourneyName(enrollment?.journey)
    const messages = [...(row.conversation_messages ?? [])]
      .sort(
        (left, right) =>
          new Date(left.sent_at).getTime() - new Date(right.sent_at).getTime()
      )
      .map((message): ConversationMessage => ({
        body: message.body,
        ctaHref: message.cta_link ?? undefined,
        ctaLabel: message.cta_label ?? undefined,
        id: message.id,
        readAt: message.read_at,
        sentAt: message.sent_at,
        sender: message.sender_id === userId ? "member" : "shannon",
      }))
    const delivered = messages.filter(
      (message) => message.sender === "shannon"
    ).length
    const nextMilestone = Number(enrollment?.next_milestone_position ?? 0)

    return {
      journeyId: row.journey_enrollment_id,
      subject: row.subject || journeyName || "A note from Shannon",
      id: row.id,
      lastMessage:
        row.last_message ??
        messages.at(-1)?.body ??
        "Your conversation is ready.",
      messages,
      progressLabel: nextMilestone
        ? `Milestone ${Math.max(1, nextMilestone - 1)} complete`
        : `${delivered} ${delivered === 1 ? "message" : "messages"}`,
      unreadCount: row.member_unread_count ?? 0,
    }
  })

  const upcoming = (upcomingData ?? []).map((journey) => ({
    id: String(journey.id),
    startDate: String(journey.start_at),
    title: String(journey.name),
  }))

  return { conversations, upcoming }
}
