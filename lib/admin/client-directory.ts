import "server-only"

import { requireAdmin } from "@/lib/admin-auth"
import {
  getCanonicalStripeAccountId,
  getCanonicalStripeLivemode,
  getCommerceDeploymentTarget,
} from "@/lib/commerce/launch-authority"
import { createAdminClient } from "@/lib/supabase/server"

const CLIENT_PAGE_SIZE = 200
const CALCOM_USERNAME = "hwlbysmd"
const OPERATOR_EMAILS = new Set([
  "admin@ghosthand.studio",
  "shannon@hwlbysmd.com",
])
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SCHEMA_UNAVAILABLE_CODES = new Set([
  "42P01",
  "42703",
  "PGRST202",
  "PGRST204",
  "PGRST205",
])
const PURCHASE_STATUSES = new Set([
  "active",
  "cancelled",
  "disputed",
  "refunded",
])
const CHECKOUT_STATUSES = new Set([
  "creating",
  "disputed",
  "expired",
  "failed",
  "open",
  "paid",
  "refunded",
])
const BOOKING_STATUSES = new Set([
  "cancelled",
  "confirmed",
  "rejected",
  "requested",
])
const CONVERSATION_STATUSES = new Set([
  "awaiting_practitioner",
  "open",
  "resolved",
])

type OptionalRows =
  { rows: unknown[]; status: "ready" } | { status: "unavailable" }

export type AdminClientRawRows = {
  bookings: OptionalRows
  checkouts: unknown[]
  conversations: OptionalRows
  profiles: unknown[]
  progress: OptionalRows
  purchases: unknown[]
  relationships: OptionalRows
}

type AdminClientRowsResult =
  | { status: "not_configured" | "unavailable" }
  | ({ status: "ready" } & AdminClientRawRows)

type AdminClientReadOptions = {
  clientId: string | null
  practitionerId: string
}

export type AdminClientDirectoryDependencies = {
  readRows: (options: AdminClientReadOptions) => Promise<AdminClientRowsResult>
  requireAdmin: typeof requireAdmin
}

export type AdminClientDirectoryItem = Readonly<{
  bookingCount: number | null
  checkoutCount: number
  conversationCount: number | null
  email: string
  id: string
  joinedAt: string
  name: string
  paidCheckoutCount: number
  purchaseCount: number
  purchaseTotal: number
}>

export type AdminClientPurchase = Readonly<{
  amountPaid: number
  currency: string
  id: string
  productType: string
  purchasedAt: string
  status: string
}>

export type AdminClientCheckout = Readonly<{
  createdAt: string
  fulfilledAt: string | null
  id: string
  productType: string
  status: string
}>

export type AdminClientBooking = Readonly<{
  bookingStatus: string
  endAt: string
  id: string
  serviceTitle: string
  startAt: string
  timeZone: string
}>

export type AdminClientConversation = Readonly<{
  id: string
  lastMessage: string | null
  lastMessageAt: string | null
  practitionerUnreadCount: number
  status: string
  subject: string
}>

export type AdminClientProgress = Readonly<{
  completedCount: number
  lastActivityAt: string | null
  startedCount: number
}>

export type AdminClientTimelineEvent = Readonly<{
  at: string
  description: string
  id: string
  kind:
    | "booking"
    | "checkout"
    | "conversation"
    | "learning"
    | "profile"
    | "purchase"
  status: string | null
  title: string
}>

export type AdminClientDetail = Readonly<{
  bookings: readonly AdminClientBooking[] | null
  checkouts: readonly AdminClientCheckout[]
  client: AdminClientDirectoryItem
  conversations: readonly AdminClientConversation[] | null
  progress: AdminClientProgress | null
  purchases: readonly AdminClientPurchase[]
}>

export type AdminClientDirectoryResult =
  | { status: "local_preview" | "not_configured" | "unavailable" }
  | {
      bookingHistoryAvailable: boolean
      clients: readonly AdminClientDirectoryItem[]
      conversationHistoryAvailable: boolean
      status: "ready"
    }

export type AdminClientDetailResult =
  | {
      status:
        | "invalid_id"
        | "local_preview"
        | "not_configured"
        | "not_found"
        | "unavailable"
    }
  | { detail: AdminClientDetail; status: "ready" }

type CommerceScope = Readonly<{
  accountId: string
  deploymentTarget: "development" | "preview" | "production"
  livemode: boolean
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

function nonNegativeInteger(value: unknown) {
  return Number.isSafeInteger(value) && Number(value) >= 0
    ? Number(value)
    : null
}

function amount(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

function isSchemaUnavailable(
  error: { code?: string; message?: string } | null
) {
  return Boolean(
    error &&
    (SCHEMA_UNAVAILABLE_CODES.has(error.code ?? "") ||
      error.message?.includes("schema cache") === true)
  )
}

function getCommerceScope(): CommerceScope | null {
  const deploymentTarget = getCommerceDeploymentTarget(process.env)
  const accountId = getCanonicalStripeAccountId(process.env)
  const livemode = getCanonicalStripeLivemode(process.env)

  return deploymentTarget && accountId && livemode !== null
    ? { accountId, deploymentTarget, livemode }
    : null
}

async function readRows({
  clientId,
  practitionerId,
}: AdminClientReadOptions): Promise<AdminClientRowsResult> {
  const scope = getCommerceScope()
  const admin = createAdminClient()
  if (!scope || !admin) return { status: "not_configured" }

  let profileQuery = admin
    .from("profiles")
    .select("id, email, full_name, created_at")
    .eq("is_admin", false)

  profileQuery = clientId
    ? profileQuery.eq("id", clientId).limit(1)
    : profileQuery
        .order("created_at", { ascending: false })
        .limit(CLIENT_PAGE_SIZE)

  const { data: profileRows, error: profileError } = await profileQuery
  if (profileError || !Array.isArray(profileRows)) {
    console.error("[admin/clients] Profile read failed.", {
      code: profileError?.code,
    })
    return { status: "unavailable" }
  }

  // Approved operator identities are operational accounts, even if an
  // incomplete provisioning step has not yet elevated their profile row.
  const profiles = profileRows.filter(
    (profile) =>
      !isRecord(profile) ||
      typeof profile.email !== "string" ||
      !OPERATOR_EMAILS.has(profile.email.trim().toLowerCase())
  )
  const userIds = profiles.flatMap((profile) => {
    if (!isRecord(profile) || typeof profile.id !== "string") return []
    return [profile.id]
  })
  if (userIds.length !== profiles.length) return { status: "unavailable" }

  if (userIds.length === 0) {
    return {
      bookings: { rows: [], status: "ready" },
      checkouts: [],
      conversations: { rows: [], status: "ready" },
      profiles,
      progress: { rows: [], status: "ready" },
      purchases: [],
      relationships: { rows: [], status: "ready" },
      status: "ready",
    }
  }

  const [
    purchaseResult,
    checkoutResult,
    bookingResult,
    relationshipResult,
    progressResult,
  ] = await Promise.all([
    admin
      .from("purchases")
      .select(
        "id, user_id, product_type, amount_paid, currency, status, purchased_at"
      )
      .in("user_id", userIds)
      .eq("deployment_target", scope.deploymentTarget)
      .eq("stripe_account_id", scope.accountId)
      .eq("stripe_livemode", scope.livemode)
      .order("purchased_at", { ascending: false }),
    admin
      .from("checkout_orders")
      .select("id, user_id, product_type, status, created_at, fulfilled_at")
      .in("user_id", userIds)
      .eq("deployment_target", scope.deploymentTarget)
      .eq("stripe_account_id", scope.accountId)
      .eq("stripe_livemode", scope.livemode)
      .order("created_at", { ascending: false }),
    admin
      .from("booking_records")
      .select(
        "id, user_id, service_title, attendee_timezone, start_at, end_at, booking_status"
      )
      .in("user_id", userIds)
      .eq("deployment_target", scope.deploymentTarget)
      .eq("calcom_username", CALCOM_USERNAME)
      .order("start_at", { ascending: false }),
    admin
      .from("relationships")
      .select("id, member_id")
      .in("member_id", userIds)
      .eq("practitioner_id", practitionerId),
    admin
      .from("user_progress")
      .select("user_id, completed, watched_until_second, updated_at")
      .in("user_id", userIds)
      .order("updated_at", { ascending: false }),
  ])

  if (
    purchaseResult.error ||
    checkoutResult.error ||
    !Array.isArray(purchaseResult.data) ||
    !Array.isArray(checkoutResult.data)
  ) {
    console.error("[admin/clients] Scoped commerce read failed.", {
      checkoutCode: checkoutResult.error?.code,
      purchaseCode: purchaseResult.error?.code,
    })
    return { status: "unavailable" }
  }

  const bookings: OptionalRows = bookingResult.error
    ? { status: "unavailable" }
    : Array.isArray(bookingResult.data)
      ? { rows: bookingResult.data, status: "ready" }
      : { status: "unavailable" }
  if (bookingResult.error && !isSchemaUnavailable(bookingResult.error)) {
    console.error("[admin/clients] Booking history read failed.", {
      code: bookingResult.error.code,
    })
  }

  const progress: OptionalRows = progressResult.error
    ? { status: "unavailable" }
    : Array.isArray(progressResult.data)
      ? { rows: progressResult.data, status: "ready" }
      : { status: "unavailable" }

  let conversations: OptionalRows = { status: "unavailable" }
  let relationships: OptionalRows = { status: "unavailable" }
  if (!relationshipResult.error && Array.isArray(relationshipResult.data)) {
    const relationshipIds = relationshipResult.data.flatMap((relationship) =>
      isRecord(relationship) && typeof relationship.id === "string"
        ? [relationship.id]
        : []
    )
    if (relationshipIds.length === relationshipResult.data.length) {
      relationships = { rows: relationshipResult.data, status: "ready" }
      if (relationshipIds.length === 0) {
        conversations = { rows: [], status: "ready" }
      } else {
        const conversationResult = await admin
          .from("conversations")
          .select(
            "id, relationship_id, subject, status, practitioner_unread_count, last_message, last_message_at"
          )
          .in("relationship_id", relationshipIds)
          .order("last_message_at", { ascending: false })
        conversations = conversationResult.error
          ? { status: "unavailable" }
          : Array.isArray(conversationResult.data)
            ? { rows: conversationResult.data, status: "ready" }
            : { status: "unavailable" }
        if (
          conversationResult.error &&
          !isSchemaUnavailable(conversationResult.error)
        ) {
          console.error("[admin/clients] Conversation history read failed.", {
            code: conversationResult.error.code,
          })
        }
      }
    }
  } else if (
    relationshipResult.error &&
    !isSchemaUnavailable(relationshipResult.error)
  ) {
    console.error("[admin/clients] Relationship history read failed.", {
      code: relationshipResult.error.code,
    })
  }

  return {
    bookings,
    checkouts: checkoutResult.data,
    conversations,
    profiles,
    progress,
    purchases: purchaseResult.data,
    relationships,
    status: "ready",
  }
}

const runtimeDependencies: AdminClientDirectoryDependencies = {
  readRows,
  requireAdmin,
}

type ProfileRow = {
  createdAt: string
  email: string
  fullName: string | null
  id: string
}

type PurchaseRow = AdminClientPurchase & { userId: string }
type CheckoutRow = AdminClientCheckout & { userId: string }
type BookingRow = AdminClientBooking & { userId: string }
type ConversationRow = AdminClientConversation & { relationshipId: string }
type ProgressRow = {
  completed: boolean
  updatedAt: string
  userId: string
  watchedUntilSecond: number
}
type RelationshipRow = { id: string; memberId: string }

function profileDto(value: unknown): ProfileRow | null {
  if (!isRecord(value)) return null
  const id = requiredString(value.id, 80)
  const email = requiredString(value.email, 320)?.toLowerCase()
  const createdAt = isoDate(value.created_at)
  const fullName = optionalString(value.full_name, 200)
  if (
    !id ||
    !UUID_PATTERN.test(id) ||
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !createdAt
  ) {
    return null
  }
  return { createdAt, email, fullName, id }
}

function purchaseDto(value: unknown): PurchaseRow | null {
  if (!isRecord(value)) return null
  const id = requiredString(value.id, 80)
  const userId = requiredString(value.user_id, 80)
  const productType = requiredString(value.product_type, 80)
  const currency = requiredString(value.currency, 3)?.toLowerCase()
  const status = requiredString(value.status, 40)
  const purchasedAt = isoDate(value.purchased_at)
  const amountPaid = amount(value.amount_paid)
  if (
    !id ||
    !userId ||
    !productType ||
    !currency ||
    !/^[a-z]{3}$/.test(currency) ||
    !status ||
    !PURCHASE_STATUSES.has(status) ||
    !purchasedAt ||
    amountPaid === null
  ) {
    return null
  }
  return {
    amountPaid,
    currency,
    id,
    productType,
    purchasedAt,
    status,
    userId,
  }
}

function checkoutDto(value: unknown): CheckoutRow | null {
  if (!isRecord(value)) return null
  const id = requiredString(value.id, 80)
  const userId = requiredString(value.user_id, 80)
  const productType = requiredString(value.product_type, 80)
  const status = requiredString(value.status, 40)
  const createdAt = isoDate(value.created_at)
  const fulfilledAt = optionalIsoDate(value.fulfilled_at)
  if (
    !id ||
    !userId ||
    !productType ||
    !status ||
    !CHECKOUT_STATUSES.has(status) ||
    !createdAt
  ) {
    return null
  }
  return { createdAt, fulfilledAt, id, productType, status, userId }
}

function bookingDto(value: unknown): BookingRow | null {
  if (!isRecord(value)) return null
  const id = requiredString(value.id, 80)
  const userId = requiredString(value.user_id, 80)
  const serviceTitle = requiredString(value.service_title, 240)
  const timeZone = requiredString(value.attendee_timezone, 100)
  const startAt = isoDate(value.start_at)
  const endAt = isoDate(value.end_at)
  const bookingStatus = requiredString(value.booking_status, 40)
  if (
    !id ||
    !userId ||
    !serviceTitle ||
    !timeZone ||
    !startAt ||
    !endAt ||
    !bookingStatus ||
    !BOOKING_STATUSES.has(bookingStatus) ||
    Date.parse(endAt) <= Date.parse(startAt)
  ) {
    return null
  }
  return {
    bookingStatus,
    endAt,
    id,
    serviceTitle,
    startAt,
    timeZone,
    userId,
  }
}

function relationshipDto(value: unknown): RelationshipRow | null {
  if (!isRecord(value)) return null
  const id = requiredString(value.id, 80)
  const memberId = requiredString(value.member_id, 80)
  return id && memberId ? { id, memberId } : null
}

function conversationDto(value: unknown): ConversationRow | null {
  if (!isRecord(value)) return null
  const id = requiredString(value.id, 80)
  const relationshipId = requiredString(value.relationship_id, 80)
  const subject = requiredString(value.subject, 180)
  const status = requiredString(value.status, 40)
  const practitionerUnreadCount = nonNegativeInteger(
    value.practitioner_unread_count
  )
  const lastMessage = optionalString(value.last_message, 300)
  const lastMessageAt = optionalIsoDate(value.last_message_at)
  if (
    !id ||
    !relationshipId ||
    !subject ||
    !status ||
    !CONVERSATION_STATUSES.has(status) ||
    practitionerUnreadCount === null
  ) {
    return null
  }
  return {
    id,
    lastMessage,
    lastMessageAt,
    practitionerUnreadCount,
    relationshipId,
    status,
    subject,
  }
}

function progressDto(value: unknown): ProgressRow | null {
  if (!isRecord(value)) return null
  const userId = requiredString(value.user_id, 80)
  const watchedUntilSecond = nonNegativeInteger(value.watched_until_second)
  const updatedAt = isoDate(value.updated_at)
  if (
    !userId ||
    typeof value.completed !== "boolean" ||
    watchedUntilSecond === null ||
    !updatedAt
  ) {
    return null
  }
  return {
    completed: value.completed,
    updatedAt,
    userId,
    watchedUntilSecond,
  }
}

function clientName(profile: ProfileRow) {
  return profile.fullName ?? profile.email.split("@")[0] ?? "Client"
}

function parseRequiredRows<T>(
  rows: unknown[],
  mapper: (value: unknown) => T | null
) {
  const parsed = rows.map(mapper)
  return parsed.some((row) => row === null) ? null : (parsed as T[])
}

function parseOptionalRows<T>(
  result: OptionalRows,
  mapper: (value: unknown) => T | null
) {
  if (result.status === "unavailable") return null
  return parseRequiredRows(result.rows, mapper)
}

function assemble(rows: AdminClientRawRows) {
  const parsedProfiles = parseRequiredRows(rows.profiles, profileDto)
  const purchases = parseRequiredRows(rows.purchases, purchaseDto)
  const checkouts = parseRequiredRows(rows.checkouts, checkoutDto)
  const bookings = parseOptionalRows(rows.bookings, bookingDto)
  const relationships = parseOptionalRows(rows.relationships, relationshipDto)
  const conversations = parseOptionalRows(rows.conversations, conversationDto)
  const progress = parseOptionalRows(rows.progress, progressDto)

  if (!parsedProfiles || !purchases || !checkouts) return null
  if (
    (rows.bookings.status === "ready" && !bookings) ||
    (rows.conversations.status === "ready" && !conversations) ||
    (rows.relationships.status === "ready" && !relationships) ||
    (rows.progress.status === "ready" && !progress)
  ) {
    return null
  }
  const profiles = parsedProfiles.filter(
    (profile) => !OPERATOR_EMAILS.has(profile.email)
  )

  return {
    bookings,
    checkouts,
    conversations,
    profiles,
    progress,
    purchases,
    relationships,
  }
}

function clientItem(
  profile: ProfileRow,
  data: NonNullable<ReturnType<typeof assemble>>
): AdminClientDirectoryItem {
  const purchases = data.purchases.filter((row) => row.userId === profile.id)
  const checkouts = data.checkouts.filter((row) => row.userId === profile.id)
  const relationshipIds = new Set(
    data.relationships
      ?.filter((row) => row.memberId === profile.id)
      .map((row) => row.id) ?? []
  )

  return {
    bookingCount:
      data.bookings?.filter((row) => row.userId === profile.id).length ?? null,
    checkoutCount: checkouts.length,
    conversationCount: data.conversations
      ? data.conversations.filter((row) =>
          relationshipIds.has(row.relationshipId)
        ).length
      : null,
    email: profile.email,
    id: profile.id,
    joinedAt: profile.createdAt,
    name: clientName(profile),
    paidCheckoutCount: checkouts.filter((row) => row.status === "paid").length,
    purchaseCount: purchases.length,
    purchaseTotal: purchases.reduce((total, row) => total + row.amountPaid, 0),
  }
}

function publicBooking(row: BookingRow): AdminClientBooking {
  return {
    bookingStatus: row.bookingStatus,
    endAt: row.endAt,
    id: row.id,
    serviceTitle: row.serviceTitle,
    startAt: row.startAt,
    timeZone: row.timeZone,
  }
}

function publicCheckout(row: CheckoutRow): AdminClientCheckout {
  return {
    createdAt: row.createdAt,
    fulfilledAt: row.fulfilledAt,
    id: row.id,
    productType: row.productType,
    status: row.status,
  }
}

function publicConversation(row: ConversationRow): AdminClientConversation {
  return {
    id: row.id,
    lastMessage: row.lastMessage,
    lastMessageAt: row.lastMessageAt,
    practitionerUnreadCount: row.practitionerUnreadCount,
    status: row.status,
    subject: row.subject,
  }
}

function publicPurchase(row: PurchaseRow): AdminClientPurchase {
  return {
    amountPaid: row.amountPaid,
    currency: row.currency,
    id: row.id,
    productType: row.productType,
    purchasedAt: row.purchasedAt,
    status: row.status,
  }
}

function productName(productType: string) {
  if (productType === "lift_guide") return "LIFT"
  return productType
    .split("_")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ")
}

export function buildAdminClientTimeline(
  detail: AdminClientDetail
): readonly AdminClientTimelineEvent[] {
  const activity: AdminClientTimelineEvent[] = [
    {
      at: detail.client.joinedAt,
      description: "Registered HWL account",
      id: `profile:${detail.client.id}`,
      kind: "profile",
      status: null,
      title: "Joined HWL",
    },
    ...detail.purchases.map((purchase) => ({
      at: purchase.purchasedAt,
      description: `${purchase.currency.toUpperCase()} ${purchase.amountPaid.toFixed(2)}`,
      id: `purchase:${purchase.id}`,
      kind: "purchase" as const,
      status: purchase.status,
      title: `${productName(purchase.productType)} purchase`,
    })),
    ...detail.checkouts
      .filter((checkout) => checkout.status !== "paid")
      .map((checkout) => ({
        at: checkout.createdAt,
        description: "Checkout attempt",
        id: `checkout:${checkout.id}`,
        kind: "checkout" as const,
        status: checkout.status,
        title: `${productName(checkout.productType)} checkout`,
      })),
    ...(detail.bookings ?? []).map((booking) => ({
      at: booking.startAt,
      description: booking.timeZone,
      id: `booking:${booking.id}`,
      kind: "booking" as const,
      status: booking.bookingStatus,
      title: booking.serviceTitle,
    })),
    ...(detail.conversations ?? []).flatMap((conversation) =>
      conversation.lastMessageAt
        ? [
            {
              at: conversation.lastMessageAt,
              description:
                conversation.practitionerUnreadCount > 0
                  ? `${conversation.practitionerUnreadCount} unread`
                  : "Client conversation",
              id: `conversation:${conversation.id}`,
              kind: "conversation" as const,
              status: conversation.status,
              title: conversation.subject,
            },
          ]
        : []
    ),
    ...(detail.progress?.lastActivityAt
      ? [
          {
            at: detail.progress.lastActivityAt,
            description: `${detail.progress.completedCount} of ${detail.progress.startedCount} started lessons complete`,
            id: `learning:${detail.client.id}`,
            kind: "learning" as const,
            status: null,
            title: "LIFT learning activity",
          },
        ]
      : []),
  ]

  return activity.sort((left, right) => {
    const byTime = Date.parse(right.at) - Date.parse(left.at)
    return byTime || left.id.localeCompare(right.id)
  })
}

export async function getAdminClientDirectory(
  dependencies: AdminClientDirectoryDependencies = runtimeDependencies
): Promise<AdminClientDirectoryResult> {
  const access = await dependencies.requireAdmin()
  if (access.source !== "supabase" || !access.userId) {
    return { status: "local_preview" }
  }

  const result = await dependencies.readRows({
    clientId: null,
    practitionerId: access.userId,
  })
  if (result.status !== "ready") return result
  const data = assemble(result)
  if (!data) return { status: "unavailable" }

  return {
    bookingHistoryAvailable: data.bookings !== null,
    clients: data.profiles.map((profile) => clientItem(profile, data)),
    conversationHistoryAvailable: data.conversations !== null,
    status: "ready",
  }
}

export async function getAdminClientDetail(
  clientId: string,
  dependencies: AdminClientDirectoryDependencies = runtimeDependencies
): Promise<AdminClientDetailResult> {
  if (!UUID_PATTERN.test(clientId)) return { status: "invalid_id" }

  const access = await dependencies.requireAdmin()
  if (access.source !== "supabase" || !access.userId) {
    return { status: "local_preview" }
  }

  const result = await dependencies.readRows({
    clientId,
    practitionerId: access.userId,
  })
  if (result.status !== "ready") return result
  const data = assemble(result)
  if (!data) return { status: "unavailable" }
  const profile = data.profiles[0]
  if (!profile) return { status: "not_found" }

  const client = clientItem(profile, data)
  const relationshipIds = new Set(
    data.relationships
      ?.filter((row) => row.memberId === profile.id)
      .map((row) => row.id) ?? []
  )
  const progressRows = data.progress?.filter((row) => row.userId === profile.id)
  const progress = progressRows
    ? {
        completedCount: progressRows.filter((row) => row.completed).length,
        lastActivityAt: progressRows[0]?.updatedAt ?? null,
        startedCount: progressRows.filter(
          (row) => row.completed || row.watchedUntilSecond > 0
        ).length,
      }
    : null

  return {
    detail: {
      bookings:
        data.bookings
          ?.filter((row) => row.userId === profile.id)
          .map(publicBooking) ?? null,
      checkouts: data.checkouts
        .filter((row) => row.userId === profile.id)
        .map(publicCheckout),
      client,
      conversations:
        data.conversations
          ?.filter((row) => relationshipIds.has(row.relationshipId))
          .map(publicConversation) ?? null,
      progress,
      purchases: data.purchases
        .filter((row) => row.userId === profile.id)
        .map(publicPurchase),
    },
    status: "ready",
  }
}
