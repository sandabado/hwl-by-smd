import "server-only"

import { isDemoAdminEnabled } from "@/lib/demo-admin"
import {
  demoConnectionQueue,
  demoMemberConnectionSnapshot,
} from "@/lib/connection-engine/demo-data"
import {
  DEFAULT_CONNECTION_PREFERENCES,
  type ConnectionDataResult,
  type ConnectionPreferences,
  type ConnectionQueueItem,
  type ConversationMessageRecord,
  type ConversationRecord,
  type JourneyEnrollmentRecord,
  type JourneyEnrollmentWithJourney,
  type JourneyMilestoneRecord,
  type JourneyRecord,
  type MemberConnectionSnapshot,
  type PrivateRelationshipRecord,
  type RelationshipAlertRecord,
  type RelationshipRecord,
} from "@/lib/connection-engine/types"
import { createAdminClient, createClient } from "@/lib/supabase/server"

type DemoOptions = {
  allowDemo?: boolean
}

function canUseDemo(allowDemo?: boolean) {
  return Boolean(allowDemo && isDemoAdminEnabled())
}

function unavailable<T>(
  data: T,
  reason: NonNullable<ConnectionDataResult<T>["reason"]>
): ConnectionDataResult<T> {
  return { data, reason, source: "unavailable" }
}

function emptyPreferences(userId: string): ConnectionPreferences {
  return {
    user_id: userId,
    ...DEFAULT_CONNECTION_PREFERENCES,
    updated_at: new Date(0).toISOString(),
  }
}

function emptyMemberSnapshot(userId = ""): MemberConnectionSnapshot {
  return {
    relationships: [],
    conversations: [],
    enrollments: [],
    upcoming_journeys: [],
    preferences: emptyPreferences(userId),
  }
}

function demoMemberResult(): ConnectionDataResult<MemberConnectionSnapshot> {
  return {
    data: structuredClone(demoMemberConnectionSnapshot),
    source: "demo",
  }
}

/**
 * Reads only the signed-in member's relationship data. The explicit demo
 * fallback is development-only and opt-in so fictional threads can never be
 * mistaken for production member history.
 */
export async function getMemberConnectionSnapshot(
  options: DemoOptions = {}
): Promise<ConnectionDataResult<MemberConnectionSnapshot>> {
  const supabase = await createClient()
  if (!supabase) {
    return canUseDemo(options.allowDemo)
      ? demoMemberResult()
      : unavailable(emptyMemberSnapshot(), "not_configured")
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return canUseDemo(options.allowDemo)
      ? demoMemberResult()
      : unavailable(emptyMemberSnapshot(), "not_authenticated")
  }

  const now = new Date().toISOString()
  const [
    relationshipsResult,
    preferencesResult,
    enrollmentsResult,
    upcomingResult,
  ] = await Promise.all([
    supabase
      .from("relationships")
      .select(
        "id, member_id, practitioner_id, status, created_at, last_interaction, intimacy_score"
      )
      .eq("member_id", user.id)
      .neq("status", "archived")
      .order("last_interaction", { ascending: false, nullsFirst: false }),
    supabase
      .from("connection_preferences")
      .select(
        "user_id, guidance_cadence, booking_invites, share_progress, updated_at"
      )
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("journey_enrollments")
      .select(
        "id, journey_id, member_id, status, enrolled_at, started_at, paused_at, pause_until, completed_at, next_milestone_position, reply_count, booking_count, created_at, updated_at"
      )
      .eq("member_id", user.id)
      .order("enrolled_at", { ascending: false }),
    supabase
      .from("journeys")
      .select("id, name, kind, status, start_at, end_at")
      .eq("enrollment_mode", "opt_in")
      .in("status", ["scheduled", "active"])
      .or(`start_at.gt.${now},status.eq.active`)
      .order("start_at", { ascending: true, nullsFirst: false })
      .limit(8),
  ])

  if (
    relationshipsResult.error ||
    preferencesResult.error ||
    enrollmentsResult.error ||
    upcomingResult.error
  ) {
    return canUseDemo(options.allowDemo)
      ? demoMemberResult()
      : unavailable(emptyMemberSnapshot(user.id), "query_failed")
  }

  const relationships = (relationshipsResult.data ?? []) as RelationshipRecord[]
  const enrollments = (enrollmentsResult.data ??
    []) as JourneyEnrollmentRecord[]
  const relationshipIds = relationships.map((relationship) => relationship.id)
  const journeyIds = [...new Set(enrollments.map((item) => item.journey_id))]

  const [conversationsResult, journeysResult, milestonesResult] =
    await Promise.all([
      relationshipIds.length
        ? supabase
            .from("conversations")
            .select(
              "id, relationship_id, journey_enrollment_id, type, subject, status, member_unread_count, practitioner_unread_count, last_message, last_message_at, created_at, updated_at"
            )
            .in("relationship_id", relationshipIds)
            .order("updated_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
      journeyIds.length
        ? supabase
            .from("journeys")
            .select(
              "id, name, kind, entry_point, frequency, enrollment_mode, status, start_at, end_at, allow_milestone_override, pause_after_hours, created_by, created_at, updated_at"
            )
            .in("id", journeyIds)
        : Promise.resolve({ data: [], error: null }),
      journeyIds.length
        ? supabase
            .from("journey_milestones")
            .select("id, journey_id")
            .in("journey_id", journeyIds)
        : Promise.resolve({ data: [], error: null }),
    ])

  if (
    conversationsResult.error ||
    journeysResult.error ||
    milestonesResult.error
  ) {
    return canUseDemo(options.allowDemo)
      ? demoMemberResult()
      : unavailable(emptyMemberSnapshot(user.id), "query_failed")
  }

  const conversations = (conversationsResult.data ?? []) as ConversationRecord[]
  const conversationIds = conversations.map((conversation) => conversation.id)
  const messagesResult = conversationIds.length
    ? await supabase
        .from("conversation_messages")
        .select(
          "id, conversation_id, sender_id, body, body_format, sent_at, read_at, reply_to_id, sentiment, cta_label, cta_link"
        )
        .in("conversation_id", conversationIds)
        .order("sent_at", { ascending: true })
    : { data: [], error: null }

  if (messagesResult.error) {
    return canUseDemo(options.allowDemo)
      ? demoMemberResult()
      : unavailable(emptyMemberSnapshot(user.id), "query_failed")
  }

  const messagesByConversation = new Map<string, ConversationMessageRecord[]>()
  for (const message of (messagesResult.data ??
    []) as ConversationMessageRecord[]) {
    const messages = messagesByConversation.get(message.conversation_id) ?? []
    messages.push(message)
    messagesByConversation.set(message.conversation_id, messages)
  }

  const journeyById = new Map(
    ((journeysResult.data ?? []) as JourneyRecord[]).map((journey) => [
      journey.id,
      journey,
    ])
  )
  const milestoneCountByJourney = new Map<string, number>()
  for (const milestone of (milestonesResult.data ?? []) as Array<
    Pick<JourneyMilestoneRecord, "id" | "journey_id">
  >) {
    milestoneCountByJourney.set(
      milestone.journey_id,
      (milestoneCountByJourney.get(milestone.journey_id) ?? 0) + 1
    )
  }

  const enrollmentView = enrollments.flatMap((enrollment) => {
    const journey = journeyById.get(enrollment.journey_id)
    if (!journey) return []

    return [
      {
        ...enrollment,
        journey: {
          id: journey.id,
          name: journey.name,
          kind: journey.kind,
          status: journey.status,
          start_at: journey.start_at,
          end_at: journey.end_at,
        },
        milestone_count: milestoneCountByJourney.get(journey.id) ?? 0,
      } satisfies JourneyEnrollmentWithJourney,
    ]
  })

  const enrolledJourneyIds = new Set(journeyIds)
  const upcomingJourneys = (upcomingResult.data ?? [])
    .filter((journey) => !enrolledJourneyIds.has(String(journey.id)))
    .map((journey) => ({
      id: String(journey.id),
      name: String(journey.name),
      kind: journey.kind as JourneyRecord["kind"],
      status: journey.status as JourneyRecord["status"],
      start_at: journey.start_at ? String(journey.start_at) : null,
      end_at: journey.end_at ? String(journey.end_at) : null,
    }))

  return {
    data: {
      relationships,
      conversations: conversations.map((conversation) => ({
        ...conversation,
        messages: messagesByConversation.get(conversation.id) ?? [],
      })),
      enrollments: enrollmentView,
      upcoming_journeys: upcomingJourneys,
      preferences:
        (preferencesResult.data as ConnectionPreferences | null) ??
        emptyPreferences(user.id),
    },
    source: "supabase",
  }
}

export async function saveConnectionPreferences(
  preferences: Pick<
    ConnectionPreferences,
    "guidance_cadence" | "booking_invites" | "share_progress"
  >
): Promise<ConnectionDataResult<ConnectionPreferences | null>> {
  const supabase = await createClient()
  if (!supabase) return unavailable(null, "not_configured")

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) return unavailable(null, "not_authenticated")

  const { data, error } = await supabase
    .from("connection_preferences")
    .upsert(
      {
        user_id: user.id,
        guidance_cadence: preferences.guidance_cadence,
        booking_invites: preferences.booking_invites,
        share_progress: preferences.share_progress,
      },
      { onConflict: "user_id" }
    )
    .select(
      "user_id, guidance_cadence, booking_invites, share_progress, updated_at"
    )
    .single()

  return error
    ? unavailable(null, "query_failed")
    : { data: data as ConnectionPreferences, source: "supabase" }
}

/**
 * Service-role read for Shannon's server-rendered connection queue. Callers
 * must authorize the admin request before invoking this function.
 */
export async function getPractitionerConnectionQueue(
  options: DemoOptions & { limit?: number } = {}
): Promise<ConnectionDataResult<ConnectionQueueItem[]>> {
  const supabase = createAdminClient()
  const demoResult = (): ConnectionDataResult<ConnectionQueueItem[]> => ({
    data: structuredClone(demoConnectionQueue),
    source: "demo",
  })

  if (!supabase) {
    return canUseDemo(options.allowDemo)
      ? demoResult()
      : unavailable([], "not_configured")
  }

  const limit = Math.min(Math.max(options.limit ?? 50, 1), 100)
  const { data: conversationData, error: conversationError } = await supabase
    .from("conversations")
    .select(
      "id, relationship_id, journey_enrollment_id, type, subject, status, member_unread_count, practitioner_unread_count, last_message, last_message_at, created_at, updated_at"
    )
    .order("practitioner_unread_count", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(limit)

  if (conversationError) {
    return canUseDemo(options.allowDemo)
      ? demoResult()
      : unavailable([], "query_failed")
  }

  const conversations = (conversationData ?? []) as ConversationRecord[]
  if (!conversations.length) return { data: [], source: "supabase" }

  const relationshipIds = [
    ...new Set(
      conversations.map((conversation) => conversation.relationship_id)
    ),
  ]
  const conversationIds = conversations.map((conversation) => conversation.id)
  const [relationshipsResult, messagesResult, alertsResult] = await Promise.all(
    [
      supabase
        .from("relationships")
        .select(
          "id, member_id, practitioner_id, status, created_at, last_interaction, intimacy_score, notes"
        )
        .in("id", relationshipIds),
      supabase
        .from("conversation_messages")
        .select(
          "id, conversation_id, sender_id, body, body_format, sent_at, read_at, reply_to_id, sentiment, cta_label, cta_link"
        )
        .in("conversation_id", conversationIds)
        .order("sent_at", { ascending: false })
        .limit(limit * 8),
      supabase
        .from("relationship_alerts")
        .select(
          "id, relationship_id, conversation_id, message_id, alert_type, matched_keyword, severity, status, created_at, acknowledged_at, resolved_at, resolved_by"
        )
        .in("conversation_id", conversationIds)
        .in("status", ["open", "acknowledged"])
        .order("created_at", { ascending: false }),
    ]
  )

  if (relationshipsResult.error || messagesResult.error || alertsResult.error) {
    return canUseDemo(options.allowDemo)
      ? demoResult()
      : unavailable([], "query_failed")
  }

  const relationshipById = new Map(
    ((relationshipsResult.data ?? []) as PrivateRelationshipRecord[]).map(
      (relationship) => [relationship.id, relationship]
    )
  )
  const messagesByConversation = new Map<string, ConversationMessageRecord[]>()
  for (const message of (messagesResult.data ??
    []) as ConversationMessageRecord[]) {
    const messages = messagesByConversation.get(message.conversation_id) ?? []
    if (messages.length < 8) messages.push(message)
    messagesByConversation.set(message.conversation_id, messages)
  }
  const alertsByConversation = new Map<string, RelationshipAlertRecord[]>()
  for (const alert of (alertsResult.data ?? []) as RelationshipAlertRecord[]) {
    if (!alert.conversation_id) continue
    const alerts = alertsByConversation.get(alert.conversation_id) ?? []
    alerts.push(alert)
    alertsByConversation.set(alert.conversation_id, alerts)
  }

  const queue = conversations.flatMap((conversation) => {
    const relationship = relationshipById.get(conversation.relationship_id)
    if (!relationship) return []
    return [
      {
        ...conversation,
        relationship,
        latest_messages:
          messagesByConversation.get(conversation.id)?.reverse() ?? [],
        open_alerts: alertsByConversation.get(conversation.id) ?? [],
      },
    ]
  })

  return { data: queue, source: "supabase" }
}
