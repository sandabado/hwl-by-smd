import "server-only"

import { requireAdmin } from "@/lib/admin-auth"
import { createAdminClient } from "@/lib/supabase/server"

const CONVERSATION_PAGE_SIZE = 50
const MAXIMUM_THREAD_MESSAGES = 500
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type AdminConversationFilter = "all" | "needs-reply"

export type AdminConversationSummary = Readonly<{
  clientEmail: string
  clientId: string
  clientName: string
  createdAt: string
  id: string
  lastMessage: string | null
  lastMessageAt: string | null
  practitionerUnreadCount: number
  relationshipStatus: string
  status: string
  subject: string
  type: string
}>

export type AdminConversationMessage = Readonly<{
  body: string
  ctaHref: string | null
  ctaLabel: string | null
  id: string
  readAt: string | null
  sender: "client" | "practitioner"
  sentAt: string
}>

export type AdminConversationInbox =
  | { status: "local_preview" | "not_configured" | "unavailable" }
  | {
      conversations: readonly AdminConversationSummary[]
      filter: AdminConversationFilter
      page: number
      pageSize: number
      status: "ready"
      total: number
    }

export type AdminConversationThread =
  | {
      status:
        | "invalid_id"
        | "local_preview"
        | "not_configured"
        | "not_found"
        | "unavailable"
    }
  | {
      conversation: AdminConversationSummary
      history: Readonly<{
        isPartial: boolean
        loadedCount: number
        totalCount: number | null
      }>
      messages: readonly AdminConversationMessage[]
      status: "ready"
    }

type InboxReadOptions = Readonly<{
  filter: AdminConversationFilter
  firstRow: number
  pageSize: number
  practitionerId: string
}>

type ThreadReadOptions = Readonly<{
  conversationId: string
  practitionerId: string
}>

type InboxReadResult =
  | { status: "not_configured" | "unavailable" }
  | {
      conversationRows: unknown[]
      count: number
      profileRows: unknown[]
      relationshipRows: unknown[]
      status: "ready"
    }

type ThreadReadResult =
  | { status: "not_configured" | "not_found" | "unavailable" }
  | {
      conversationRow: unknown
      messageCount: number | null
      messageRows: unknown[]
      profileRow: unknown
      relationshipRow: unknown
      status: "ready"
    }

export type AdminConversationInboxDependencies = Readonly<{
  readInbox: (options: InboxReadOptions) => Promise<InboxReadResult>
  readThread: (options: ThreadReadOptions) => Promise<ThreadReadResult>
  requireAdmin: typeof requireAdmin
}>

type RelationshipRow = Readonly<{
  id: string
  memberId: string
  practitionerId: string
  status: string
}>

type ProfileRow = Readonly<{
  email: string
  fullName: string | null
  id: string
}>

type ConversationRow = Readonly<{
  createdAt: string
  id: string
  lastMessage: string | null
  lastMessageAt: string | null
  practitionerUnreadCount: number
  relationshipId: string
  status: string
  subject: string
  type: string
}>

type MessageRow = Readonly<{
  body: string
  conversationId: string
  ctaHref: string | null
  ctaLabel: string | null
  id: string
  readAt: string | null
  senderId: string
  sentAt: string
}>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function requiredString(value: unknown, maximumLength: number) {
  if (typeof value !== "string") return null
  const normalized = value.trim()
  return normalized && normalized.length <= maximumLength ? normalized : null
}

function optionalString(value: unknown, maximumLength: number) {
  if (value === null || value === undefined || value === "") return null
  return requiredString(value, maximumLength)
}

function isoDate(value: unknown) {
  const candidate = requiredString(value, 80)
  return candidate && Number.isFinite(Date.parse(candidate)) ? candidate : null
}

function optionalIsoDate(value: unknown) {
  if (value === null || value === undefined || value === "") return null
  return isoDate(value)
}

function safeCtaHref(value: unknown) {
  const href = optionalString(value, 2_000)
  if (!href) return null
  if (href.startsWith("/") && !href.startsWith("//")) return href

  try {
    return new URL(href).protocol === "https:" ? href : null
  } catch {
    return null
  }
}

function nonNegativeInteger(value: unknown) {
  return Number.isSafeInteger(value) && Number(value) >= 0
    ? Number(value)
    : null
}

function relationshipDto(value: unknown): RelationshipRow | null {
  if (!isRecord(value)) return null
  const id = requiredString(value.id, 80)
  const memberId = requiredString(value.member_id, 80)
  const practitionerId = requiredString(value.practitioner_id, 80)
  const status = requiredString(value.status, 40)
  return id && memberId && practitionerId && status
    ? { id, memberId, practitionerId, status }
    : null
}

function profileDto(value: unknown): ProfileRow | null {
  if (!isRecord(value)) return null
  const id = requiredString(value.id, 80)
  const email = requiredString(value.email, 320)?.toLowerCase()
  const fullName = optionalString(value.full_name, 200)
  return id && email ? { email, fullName, id } : null
}

function conversationDto(value: unknown): ConversationRow | null {
  if (!isRecord(value)) return null
  const id = requiredString(value.id, 80)
  const relationshipId = requiredString(value.relationship_id, 80)
  const subject = requiredString(value.subject, 180)
  const type = requiredString(value.type, 40)
  const status = requiredString(value.status, 40)
  const createdAt = isoDate(value.created_at)
  const lastMessage = optionalString(value.last_message, 300)
  const lastMessageAt = optionalIsoDate(value.last_message_at)
  const practitionerUnreadCount = nonNegativeInteger(
    value.practitioner_unread_count
  )

  if (
    !id ||
    !relationshipId ||
    !subject ||
    !type ||
    !status ||
    !createdAt ||
    practitionerUnreadCount === null
  ) {
    return null
  }

  return {
    createdAt,
    id,
    lastMessage,
    lastMessageAt,
    practitionerUnreadCount,
    relationshipId,
    status,
    subject,
    type,
  }
}

function messageDto(value: unknown): MessageRow | null {
  if (!isRecord(value)) return null
  const id = requiredString(value.id, 80)
  const conversationId = requiredString(value.conversation_id, 80)
  const senderId = requiredString(value.sender_id, 80)
  const body = requiredString(value.body, 20_000)
  const sentAt = isoDate(value.sent_at)
  const readAt = optionalIsoDate(value.read_at)
  const ctaLabel = optionalString(value.cta_label, 80)
  const ctaHref = safeCtaHref(value.cta_link)

  if (!id || !conversationId || !senderId || !body || !sentAt) return null
  if ((value.cta_link === null) !== (ctaHref === null)) return null
  if ((ctaLabel === null) !== (ctaHref === null)) return null

  return {
    body,
    conversationId,
    ctaHref,
    ctaLabel,
    id,
    readAt,
    senderId,
    sentAt,
  }
}

function parseRows<T>(rows: unknown[], mapper: (value: unknown) => T | null) {
  const parsed = rows.map(mapper)
  return parsed.some((row) => row === null) ? null : (parsed as T[])
}

function clientName(profile: ProfileRow) {
  return profile.fullName ?? profile.email.split("@")[0] ?? "Client"
}

function summary(
  conversation: ConversationRow,
  relationship: RelationshipRow,
  profile: ProfileRow
): AdminConversationSummary {
  return {
    clientEmail: profile.email,
    clientId: profile.id,
    clientName: clientName(profile),
    createdAt: conversation.createdAt,
    id: conversation.id,
    lastMessage: conversation.lastMessage,
    lastMessageAt: conversation.lastMessageAt,
    practitionerUnreadCount: conversation.practitionerUnreadCount,
    relationshipStatus: relationship.status,
    status: conversation.status,
    subject: conversation.subject,
    type: conversation.type,
  }
}

async function readInbox({
  filter,
  firstRow,
  pageSize,
  practitionerId,
}: InboxReadOptions): Promise<InboxReadResult> {
  const admin = createAdminClient()
  if (!admin) return { status: "not_configured" }

  const { data: relationships, error: relationshipError } = await admin
    .from("relationships")
    .select("id, member_id, practitioner_id, status")
    .eq("practitioner_id", practitionerId)

  if (relationshipError || !Array.isArray(relationships)) {
    console.error("[admin/messages] Relationship inbox read failed.", {
      code: relationshipError?.code,
    })
    return { status: "unavailable" }
  }

  const relationshipIds = relationships.flatMap((relationship) =>
    isRecord(relationship) && typeof relationship.id === "string"
      ? [relationship.id]
      : []
  )
  const memberIds = relationships.flatMap((relationship) =>
    isRecord(relationship) && typeof relationship.member_id === "string"
      ? [relationship.member_id]
      : []
  )
  if (
    relationshipIds.length !== relationships.length ||
    memberIds.length !== relationships.length
  ) {
    return { status: "unavailable" }
  }

  if (relationshipIds.length === 0) {
    return {
      conversationRows: [],
      count: 0,
      profileRows: [],
      relationshipRows: [],
      status: "ready",
    }
  }

  let conversationQuery = admin
    .from("conversations")
    .select(
      "id, relationship_id, subject, type, status, practitioner_unread_count, last_message, last_message_at, created_at",
      { count: "exact" }
    )
    .in("relationship_id", relationshipIds)

  if (filter === "needs-reply") {
    conversationQuery = conversationQuery.eq("status", "awaiting_practitioner")
  }

  const [
    { count, data: conversations, error: conversationError },
    profileResult,
  ] = await Promise.all([
    conversationQuery
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .range(firstRow, firstRow + pageSize - 1),
    admin.from("profiles").select("id, email, full_name").in("id", memberIds),
  ])

  if (
    conversationError ||
    profileResult.error ||
    !Array.isArray(conversations) ||
    !Array.isArray(profileResult.data)
  ) {
    console.error("[admin/messages] Conversation inbox read failed.", {
      conversationCode: conversationError?.code,
      profileCode: profileResult.error?.code,
    })
    return { status: "unavailable" }
  }

  return {
    conversationRows: conversations,
    count: count ?? 0,
    profileRows: profileResult.data,
    relationshipRows: relationships,
    status: "ready",
  }
}

async function readThread({
  conversationId,
  practitionerId,
}: ThreadReadOptions): Promise<ThreadReadResult> {
  const admin = createAdminClient()
  if (!admin) return { status: "not_configured" }

  const { data: conversation, error: conversationError } = await admin
    .from("conversations")
    .select(
      "id, relationship_id, subject, type, status, practitioner_unread_count, last_message, last_message_at, created_at"
    )
    .eq("id", conversationId)
    .maybeSingle()

  if (conversationError) {
    console.error("[admin/messages] Conversation thread read failed.", {
      code: conversationError.code,
    })
    return { status: "unavailable" }
  }
  if (!conversation || !isRecord(conversation)) return { status: "not_found" }

  const relationshipId = requiredString(conversation.relationship_id, 80)
  if (!relationshipId) return { status: "unavailable" }

  const { data: relationship, error: relationshipError } = await admin
    .from("relationships")
    .select("id, member_id, practitioner_id, status")
    .eq("id", relationshipId)
    .eq("practitioner_id", practitionerId)
    .maybeSingle()

  if (relationshipError) {
    console.error("[admin/messages] Conversation relationship read failed.", {
      code: relationshipError.code,
    })
    return { status: "unavailable" }
  }
  if (!relationship || !isRecord(relationship)) return { status: "not_found" }

  const memberId = requiredString(relationship.member_id, 80)
  if (!memberId) return { status: "unavailable" }

  const [profileResult, messageResult] = await Promise.all([
    admin
      .from("profiles")
      .select("id, email, full_name")
      .eq("id", memberId)
      .maybeSingle(),
    admin
      .from("conversation_messages")
      .select(
        "id, conversation_id, sender_id, body, sent_at, read_at, cta_label, cta_link",
        { count: "exact" }
      )
      .eq("conversation_id", conversationId)
      .order("sent_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(MAXIMUM_THREAD_MESSAGES),
  ])

  if (
    profileResult.error ||
    messageResult.error ||
    !profileResult.data ||
    !Array.isArray(messageResult.data)
  ) {
    console.error("[admin/messages] Conversation detail read failed.", {
      messageCode: messageResult.error?.code,
      profileCode: profileResult.error?.code,
    })
    return { status: "unavailable" }
  }

  return {
    conversationRow: conversation,
    messageCount: messageResult.count,
    messageRows: messageResult.data,
    profileRow: profileResult.data,
    relationshipRow: relationship,
    status: "ready",
  }
}

const runtimeDependencies: AdminConversationInboxDependencies = {
  readInbox,
  readThread,
  requireAdmin,
}

export async function getAdminConversationInbox(
  options: { filter?: string; page?: number } = {},
  dependencies: AdminConversationInboxDependencies = runtimeDependencies
): Promise<AdminConversationInbox> {
  const access = await dependencies.requireAdmin()
  if (access.source !== "supabase" || !access.userId) {
    return { status: "local_preview" }
  }

  const filter: AdminConversationFilter =
    options.filter === "all" ? "all" : "needs-reply"
  const page =
    Number.isSafeInteger(options.page) && Number(options.page) > 0
      ? Number(options.page)
      : 1
  const firstRow = (page - 1) * CONVERSATION_PAGE_SIZE
  const result = await dependencies.readInbox({
    filter,
    firstRow,
    pageSize: CONVERSATION_PAGE_SIZE,
    practitionerId: access.userId,
  })
  if (result.status !== "ready") return result

  const relationships = parseRows(result.relationshipRows, relationshipDto)
  const profiles = parseRows(result.profileRows, profileDto)
  const conversations = parseRows(result.conversationRows, conversationDto)
  if (
    !relationships ||
    !profiles ||
    !conversations ||
    !Number.isSafeInteger(result.count) ||
    result.count < 0
  ) {
    return { status: "unavailable" }
  }

  const relationshipById = new Map(relationships.map((row) => [row.id, row]))
  const profileById = new Map(profiles.map((row) => [row.id, row]))
  const summaries = conversations.flatMap((conversation) => {
    const relationship = relationshipById.get(conversation.relationshipId)
    const profile = relationship
      ? profileById.get(relationship.memberId)
      : undefined
    return relationship && profile
      ? [summary(conversation, relationship, profile)]
      : []
  })
  if (summaries.length !== conversations.length) {
    return { status: "unavailable" }
  }

  return {
    conversations: summaries,
    filter,
    page,
    pageSize: CONVERSATION_PAGE_SIZE,
    status: "ready",
    total: result.count,
  }
}

export async function getAdminConversationThread(
  conversationId: string,
  dependencies: AdminConversationInboxDependencies = runtimeDependencies
): Promise<AdminConversationThread> {
  if (!UUID_PATTERN.test(conversationId)) return { status: "invalid_id" }

  const access = await dependencies.requireAdmin()
  if (access.source !== "supabase" || !access.userId) {
    return { status: "local_preview" }
  }

  const result = await dependencies.readThread({
    conversationId,
    practitionerId: access.userId,
  })
  if (result.status !== "ready") return result

  const relationship = relationshipDto(result.relationshipRow)
  const profile = profileDto(result.profileRow)
  const conversation = conversationDto(result.conversationRow)
  const messages = parseRows(result.messageRows, messageDto)
  const messageCount = result.messageCount
  if (
    !relationship ||
    !profile ||
    !conversation ||
    !messages ||
    messages.length > MAXIMUM_THREAD_MESSAGES ||
    (messageCount !== null &&
      (!Number.isSafeInteger(messageCount) || messageCount < messages.length))
  ) {
    return { status: "unavailable" }
  }
  if (
    conversation.id !== conversationId ||
    conversation.relationshipId !== relationship.id ||
    relationship.memberId !== profile.id ||
    relationship.practitionerId !== access.userId ||
    messages.some(
      (message) =>
        message.conversationId !== conversation.id ||
        (message.senderId !== relationship.memberId &&
          message.senderId !== relationship.practitionerId)
    )
  ) {
    return { status: "unavailable" }
  }

  return {
    conversation: summary(conversation, relationship, profile),
    history: {
      isPartial:
        messageCount === null
          ? messages.length === MAXIMUM_THREAD_MESSAGES
          : messageCount > messages.length,
      loadedCount: messages.length,
      totalCount: messageCount,
    },
    messages: [...messages].reverse().map((message) => ({
      body: message.body,
      ctaHref: message.ctaHref,
      ctaLabel: message.ctaLabel,
      id: message.id,
      readAt: message.readAt,
      sender:
        message.senderId === relationship.memberId ? "client" : "practitioner",
      sentAt: message.sentAt,
    })),
    status: "ready",
  }
}
