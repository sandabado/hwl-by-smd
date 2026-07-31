export type RelationshipStatus = "active" | "inactive" | "archived"

export type ConversationType =
  "journey" | "direct" | "booking_support" | "feedback"

export type ConversationStatus = "open" | "resolved" | "awaiting_practitioner"

export type MessageBodyFormat = "plain_text" | "sanitized_html"
export type MessageSentiment = "positive" | "neutral" | "struggling"

export type JourneyKind = "sequence" | "announcement" | "education"
export type JourneyEntryPoint = "signup" | "purchase" | "manual" | "opt_in"
export type JourneyFrequency = "daily" | "every_other_day" | "weekly" | "manual"
export type JourneyEnrollmentMode = "auto" | "opt_in" | "manual"
export type JourneyStatus =
  "draft" | "scheduled" | "active" | "paused" | "completed" | "archived"
export type JourneyEnrollmentStatus =
  "pending" | "active" | "paused" | "completed" | "opted_out"

export type JourneyIntent =
  "guidance" | "check_in" | "resource" | "booking_invite" | "product_invite"
export type JourneyCtaKind = "none" | "resource" | "booking" | "product"
export type JourneyDeliveryStatus =
  "pending" | "processing" | "sent" | "failed" | "cancelled"

export type GuidanceCadence = "daily" | "weekly" | "relevant"

export type RelationshipAlertType =
  "support_keyword" | "struggling_sentiment" | "response_overdue"
export type RelationshipAlertSeverity = "info" | "attention" | "urgent"
export type RelationshipAlertStatus = "open" | "acknowledged" | "resolved"

export type RelationshipRecord = {
  id: string
  member_id: string
  practitioner_id: string
  status: RelationshipStatus
  created_at: string
  last_interaction: string | null
  intimacy_score: number
}

export type PrivateRelationshipRecord = RelationshipRecord & {
  notes: string | null
}

export type ConnectionPreferences = {
  user_id: string
  guidance_cadence: GuidanceCadence
  booking_invites: boolean
  share_progress: boolean
  updated_at: string
}

export type JourneyRecord = {
  id: string
  name: string
  kind: JourneyKind
  entry_point: JourneyEntryPoint
  frequency: JourneyFrequency
  enrollment_mode: JourneyEnrollmentMode
  status: JourneyStatus
  start_at: string | null
  end_at: string | null
  allow_milestone_override: boolean
  pause_after_hours: number
  created_by: string
  created_at: string
  updated_at: string
}

export type JourneyMilestoneRecord = {
  id: string
  journey_id: string
  position: number
  delay_hours: number
  subject: string
  body: string
  body_format: MessageBodyFormat
  human_touchpoint: boolean
  intent: JourneyIntent
  cta_kind: JourneyCtaKind
  cta_label: string | null
  cta_link: string | null
  opt_out_text: string
  created_at: string
  updated_at: string
}

export type JourneyEnrollmentRecord = {
  id: string
  journey_id: string
  member_id: string
  status: JourneyEnrollmentStatus
  enrolled_at: string
  started_at: string | null
  paused_at: string | null
  pause_until: string | null
  completed_at: string | null
  next_milestone_position: number
  reply_count: number
  booking_count: number
  created_at: string
  updated_at: string
}

export type ConversationRecord = {
  id: string
  relationship_id: string
  journey_enrollment_id: string | null
  type: ConversationType
  subject: string
  status: ConversationStatus
  member_unread_count: number
  practitioner_unread_count: number
  last_message: string | null
  last_message_at: string | null
  created_at: string
  updated_at: string
}

export type ConversationMessageRecord = {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  body_format: MessageBodyFormat
  sent_at: string
  read_at: string | null
  reply_to_id: string | null
  sentiment: MessageSentiment | null
  cta_label: string | null
  cta_link: string | null
}

export type JourneyDeliveryRecord = {
  id: string
  enrollment_id: string
  milestone_id: string
  scheduled_for: string
  status: JourneyDeliveryStatus
  attempts: number
  last_attempt_at: string | null
  sent_at: string | null
  provider_message_id: string | null
  conversation_message_id: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export type RelationshipAlertRecord = {
  id: string
  relationship_id: string
  conversation_id: string | null
  message_id: string | null
  alert_type: RelationshipAlertType
  matched_keyword: string | null
  severity: RelationshipAlertSeverity
  status: RelationshipAlertStatus
  created_at: string
  acknowledged_at: string | null
  resolved_at: string | null
  resolved_by: string | null
}

export type ConversationWithMessages = ConversationRecord & {
  messages: ConversationMessageRecord[]
}

export type JourneyEnrollmentWithJourney = JourneyEnrollmentRecord & {
  journey: Pick<
    JourneyRecord,
    "id" | "name" | "kind" | "status" | "start_at" | "end_at"
  >
  milestone_count: number
}

export type MemberConnectionSnapshot = {
  relationships: RelationshipRecord[]
  conversations: ConversationWithMessages[]
  enrollments: JourneyEnrollmentWithJourney[]
  upcoming_journeys: Array<
    Pick<
      JourneyRecord,
      "id" | "name" | "kind" | "start_at" | "end_at" | "status"
    >
  >
  preferences: ConnectionPreferences
}

export type ConnectionQueueItem = ConversationRecord & {
  relationship: PrivateRelationshipRecord
  latest_messages: ConversationMessageRecord[]
  open_alerts: RelationshipAlertRecord[]
}

export type ConnectionDataSource = "supabase" | "demo" | "unavailable"

export type ConnectionDataResult<T> = {
  data: T
  source: ConnectionDataSource
  reason?: "not_configured" | "not_authenticated" | "forbidden" | "query_failed"
}

export const DEFAULT_CONNECTION_PREFERENCES = {
  guidance_cadence: "relevant",
  booking_invites: false,
  share_progress: false,
} as const satisfies Omit<ConnectionPreferences, "user_id" | "updated_at">
