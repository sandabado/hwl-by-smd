import "server-only"

import { requireAdmin } from "@/lib/admin-auth"
import { createAdminClient } from "@/lib/supabase/server"

const INQUIRY_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const ADMIN_INQUIRY_PAGE_SIZE = 50

export type AdminInquiry = {
  id: string
  source: string
  name: string
  email: string
  message: string
  booking_preference: string | null
  date_preference: string | null
  event_date: string | null
  format: string | null
  guest_count: string | null
  group_size: string | null
  interests: string | null
  location: string | null
  organization: string | null
  phone: string | null
  preferred_date: string | null
  preferred_window: string | null
  service: string | null
  services: string | null
  subject: string | null
  time_zone: string | null
  status: "received" | "in_review" | "responded" | "closed" | "spam"
  notification_status:
    | "accepted"
    | "attempting"
    | "audit_unknown"
    | "failed"
    | "not_configured"
    | "unattempted"
  created_at: string
}

export type AdminInquiryInbox =
  | { status: "local_preview" }
  | { status: "not_configured" }
  | { status: "unavailable" }
  | {
      status: "ready"
      inquiries: AdminInquiry[]
      inquiryId: string | null
      page: number
      pageSize: number
      total: number
    }

type AdminInquiryInboxOptions = {
  inquiryId?: string
  page?: number
  pageSize?: number
}

type AdminInquiryReadOptions = {
  firstRow: number
  inquiryId: string | null
  pageSize: number
}

type AdminInquiryReadResult =
  | { status: "not_configured" }
  | { status: "unavailable" }
  | {
      status: "ready"
      count: number
      rows: unknown[]
    }

export type AdminInquiryInboxDependencies = {
  readInquiries: (
    options: AdminInquiryReadOptions
  ) => Promise<AdminInquiryReadResult>
  requireAdmin: typeof requireAdmin
}

const INQUIRY_STATUSES = new Set<AdminInquiry["status"]>([
  "received",
  "in_review",
  "responded",
  "closed",
  "spam",
])
const NOTIFICATION_STATUSES = new Set<AdminInquiry["notification_status"]>([
  "accepted",
  "attempting",
  "audit_unknown",
  "failed",
  "not_configured",
  "unattempted",
])

function optionalString(value: unknown) {
  return typeof value === "string" ? value : null
}

function adminInquiryDto(value: unknown): AdminInquiry | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null

  const row = value as Record<string, unknown>
  if (
    typeof row.id !== "string" ||
    typeof row.source !== "string" ||
    typeof row.name !== "string" ||
    typeof row.email !== "string" ||
    typeof row.message !== "string" ||
    typeof row.created_at !== "string" ||
    typeof row.status !== "string" ||
    !INQUIRY_STATUSES.has(row.status as AdminInquiry["status"]) ||
    typeof row.notification_status !== "string" ||
    !NOTIFICATION_STATUSES.has(
      row.notification_status as AdminInquiry["notification_status"]
    )
  ) {
    return null
  }

  return {
    id: row.id,
    source: row.source,
    name: row.name,
    email: row.email,
    message: row.message,
    booking_preference: optionalString(row.booking_preference),
    date_preference: optionalString(row.date_preference),
    event_date: optionalString(row.event_date),
    format: optionalString(row.format),
    guest_count: optionalString(row.guest_count),
    group_size: optionalString(row.group_size),
    interests: optionalString(row.interests),
    location: optionalString(row.location),
    organization: optionalString(row.organization),
    phone: optionalString(row.phone),
    preferred_date: optionalString(row.preferred_date),
    preferred_window: optionalString(row.preferred_window),
    service: optionalString(row.service),
    services: optionalString(row.services),
    subject: optionalString(row.subject),
    time_zone: optionalString(row.time_zone),
    status: row.status as AdminInquiry["status"],
    notification_status:
      row.notification_status as AdminInquiry["notification_status"],
    created_at: row.created_at,
  }
}

async function readInquiries({
  firstRow,
  inquiryId,
  pageSize,
}: AdminInquiryReadOptions): Promise<AdminInquiryReadResult> {
  const admin = createAdminClient()
  if (!admin) return { status: "not_configured" }

  const baseQuery = admin
    .from("inquiries")
    .select(
      "id, source, name, email, message, booking_preference, date_preference, event_date, format, guest_count, group_size, interests, location, organization, phone, preferred_date, preferred_window, service, services, subject, time_zone, status, notification_status, created_at",
      { count: "exact" }
    )

  const { count, data, error } = inquiryId
    ? await baseQuery.eq("id", inquiryId).limit(1)
    : await baseQuery
        .order("created_at", { ascending: false })
        .range(firstRow, firstRow + pageSize - 1)

  if (error) {
    console.error("[admin/inquiries] Inquiry inbox query failed.", {
      code: error.code,
    })
    return { status: "unavailable" }
  }

  return {
    count: count ?? 0,
    rows: data ?? [],
    status: "ready",
  }
}

const runtimeDependencies: AdminInquiryInboxDependencies = {
  readInquiries,
  requireAdmin,
}

/**
 * Returns a minimal inquiry DTO only after re-establishing real Supabase admin
 * authorization. The development-only demo session never receives live PII.
 */
export async function getAdminInquiryInbox(
  options: AdminInquiryInboxOptions = {},
  dependencies: AdminInquiryInboxDependencies = runtimeDependencies
): Promise<AdminInquiryInbox> {
  const access = await dependencies.requireAdmin()
  if (access.source !== "supabase") return { status: "local_preview" }

  const requestedInquiryId = options.inquiryId?.trim() ?? ""
  const inquiryId = INQUIRY_ID_PATTERN.test(requestedInquiryId)
    ? requestedInquiryId
    : null
  const page =
    Number.isSafeInteger(options.page) && Number(options.page) > 0
      ? Number(options.page)
      : 1
  const pageSize =
    Number.isSafeInteger(options.pageSize) && Number(options.pageSize) > 0
      ? Math.min(Number(options.pageSize), 100)
      : ADMIN_INQUIRY_PAGE_SIZE
  const firstRow = (page - 1) * pageSize
  const result = await dependencies.readInquiries({
    firstRow,
    inquiryId,
    pageSize,
  })
  if (result.status !== "ready") return result

  const inquiries = result.rows.map(adminInquiryDto)
  if (
    !Number.isSafeInteger(result.count) ||
    result.count < 0 ||
    inquiries.some((inquiry) => inquiry === null)
  ) {
    console.error("[admin/inquiries] Inquiry inbox returned an invalid DTO.")
    return { status: "unavailable" }
  }

  return {
    inquiryId,
    inquiries: inquiries as AdminInquiry[],
    page: inquiryId ? 1 : page,
    pageSize,
    status: "ready",
    total: result.count,
  }
}
