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
  service_slug: string | null
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
  notification_error_code: string | null
  notification_attempted_at: string | null
  notification_accepted_at: string | null
  notification_provider_id: string | null
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

/**
 * Returns a minimal inquiry DTO only after re-establishing real Supabase admin
 * authorization. The development-only demo session never receives live PII.
 */
export async function getAdminInquiryInbox(
  options: AdminInquiryInboxOptions = {}
): Promise<AdminInquiryInbox> {
  const access = await requireAdmin()
  if (access.source !== "supabase") return { status: "local_preview" }

  const admin = createAdminClient()
  if (!admin) return { status: "not_configured" }

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
  const baseQuery = admin
    .from("inquiries")
    .select(
      "id, source, name, email, message, booking_preference, date_preference, event_date, format, guest_count, group_size, interests, location, organization, phone, preferred_date, preferred_window, service, service_slug, services, subject, time_zone, status, notification_status, notification_error_code, notification_attempted_at, notification_accepted_at, notification_provider_id, created_at",
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
    inquiryId,
    inquiries: (data ?? []) as AdminInquiry[],
    page: inquiryId ? 1 : page,
    pageSize,
    status: "ready",
    total: count ?? 0,
  }
}
