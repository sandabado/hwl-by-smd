import type {
  ConnectionQueueItem,
  MemberConnectionSnapshot,
} from "@/lib/connection-engine/types"

const DEMO_MEMBER_ID = "00000000-0000-4000-8000-000000000101"
const DEMO_PRACTITIONER_ID = "00000000-0000-4000-8000-000000000102"
const DEMO_RELATIONSHIP_ID = "00000000-0000-4000-8000-000000000103"
const DEMO_JOURNEY_ID = "00000000-0000-4000-8000-000000000104"
const DEMO_ENROLLMENT_ID = "00000000-0000-4000-8000-000000000105"
const DEMO_CONVERSATION_ID = "00000000-0000-4000-8000-000000000106"

const relationship = {
  id: DEMO_RELATIONSHIP_ID,
  member_id: DEMO_MEMBER_ID,
  practitioner_id: DEMO_PRACTITIONER_ID,
  status: "active",
  created_at: "2026-07-15T16:00:00.000Z",
  last_interaction: "2026-07-18T17:42:00.000Z",
  intimacy_score: 0,
} as const

const messages = [
  {
    id: "00000000-0000-4000-8000-000000000107",
    conversation_id: DEMO_CONVERSATION_ID,
    sender_id: DEMO_PRACTITIONER_ID,
    body: "Welcome in. For today, notice how your skin feels before you change anything. What are you noticing?",
    body_format: "plain_text",
    sent_at: "2026-07-15T16:00:00.000Z",
    read_at: "2026-07-15T16:12:00.000Z",
    reply_to_id: null,
    sentiment: null,
    cta_label: null,
    cta_link: null,
  },
  {
    id: "00000000-0000-4000-8000-000000000108",
    conversation_id: DEMO_CONVERSATION_ID,
    sender_id: DEMO_MEMBER_ID,
    body: "The slower pace helped. My jaw felt softer after the first pass.",
    body_format: "plain_text",
    sent_at: "2026-07-18T17:42:00.000Z",
    read_at: null,
    reply_to_id: "00000000-0000-4000-8000-000000000107",
    sentiment: "positive",
    cta_label: null,
    cta_link: null,
  },
] as const

const conversation = {
  id: DEMO_CONVERSATION_ID,
  relationship_id: DEMO_RELATIONSHIP_ID,
  journey_enrollment_id: DEMO_ENROLLMENT_ID,
  type: "journey",
  subject: "7 Days to Radiance",
  status: "awaiting_practitioner",
  member_unread_count: 0,
  practitioner_unread_count: 1,
  last_message: messages[1].body,
  last_message_at: messages[1].sent_at,
  created_at: messages[0].sent_at,
  updated_at: messages[1].sent_at,
} as const

export const demoMemberConnectionSnapshot: MemberConnectionSnapshot = {
  relationships: [relationship],
  conversations: [{ ...conversation, messages: [...messages] }],
  enrollments: [
    {
      id: DEMO_ENROLLMENT_ID,
      journey_id: DEMO_JOURNEY_ID,
      member_id: DEMO_MEMBER_ID,
      status: "active",
      enrolled_at: "2026-07-15T16:00:00.000Z",
      started_at: "2026-07-15T16:00:00.000Z",
      paused_at: null,
      pause_until: null,
      completed_at: null,
      next_milestone_position: 3,
      reply_count: 1,
      booking_count: 0,
      created_at: "2026-07-15T16:00:00.000Z",
      updated_at: "2026-07-18T17:42:00.000Z",
      journey: {
        id: DEMO_JOURNEY_ID,
        name: "7 Days to Radiance",
        kind: "education",
        status: "active",
        start_at: "2026-07-15T16:00:00.000Z",
        end_at: "2026-07-22T16:00:00.000Z",
      },
      milestone_count: 5,
    },
  ],
  upcoming_journeys: [
    {
      id: "00000000-0000-4000-8000-000000000109",
      name: "A Softer Sunday",
      kind: "sequence",
      status: "scheduled",
      start_at: "2026-08-09T16:00:00.000Z",
      end_at: "2026-08-16T16:00:00.000Z",
    },
  ],
  preferences: {
    user_id: DEMO_MEMBER_ID,
    guidance_cadence: "relevant",
    booking_invites: false,
    share_progress: false,
    updated_at: "2026-07-15T16:00:00.000Z",
  },
}

export const demoConnectionQueue: ConnectionQueueItem[] = [
  {
    ...conversation,
    relationship: {
      ...relationship,
      notes: "Illustrative local-preview note. Never production member data.",
    },
    latest_messages: [...messages],
    open_alerts: [],
  },
]
