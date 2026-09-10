import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Mail,
  MessagesSquare,
} from "lucide-react"
import Link from "next/link"

import {
  AdminPageHeader,
  AdminPanel,
  EmptyState,
  StatusPill,
} from "@/components/admin/admin-ui"
import {
  ADMIN_INQUIRY_PAGE_SIZE,
  type AdminInquiry,
  getAdminInquiryInbox,
} from "@/lib/inquiries/admin"

export const dynamic = "force-dynamic"

const DETAIL_LABELS: Array<[keyof AdminInquiry, string]> = [
  ["service", "Service"],
  ["services", "Services"],
  ["booking_preference", "Booking preference"],
  ["date_preference", "Date preference"],
  ["preferred_date", "Preferred date"],
  ["preferred_window", "Preferred window"],
  ["event_date", "Event date"],
  ["time_zone", "Time zone"],
  ["format", "Format"],
  ["location", "Location"],
  ["guest_count", "Guest count"],
  ["group_size", "Group size"],
  ["organization", "Organization"],
  ["phone", "Phone"],
  ["interests", "Interests"],
  ["subject", "Subject"],
]
const RECEIVED_AT_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Los_Angeles",
})
const INQUIRY_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type InquirySearchParams = Promise<{
  inquiry?: string | string[]
  page?: string | string[]
}>

function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function requestedPage(value: string | undefined) {
  if (!value || !/^\d+$/.test(value)) return 1

  const page = Number(value)
  return Number.isSafeInteger(page) && page > 0 ? page : 1
}

function pageHref(page: number) {
  return page === 1 ? "/admin/inquiries" : `/admin/inquiries?page=${page}`
}

function receivedAt(value: string) {
  return RECEIVED_AT_FORMATTER.format(new Date(value))
}

function notificationLabel(status: AdminInquiry["notification_status"]) {
  if (status === "accepted") return "Email accepted"
  if (status === "not_configured") return "Email not configured"
  if (status === "failed") return "Email failed"
  if (status === "audit_unknown") return "Email audit unknown"
  if (status === "attempting") return "Email being attempted"
  return "Email not attempted"
}

function inboxUnavailable(
  status: "local_preview" | "not_configured" | "unavailable"
) {
  const copy = {
    local_preview: {
      description:
        "The signed local design preview cannot read real inquiry records. Sign in as a verified Supabase administrator to open the operational inbox.",
      title: "Live inquiries stay private",
    },
    not_configured: {
      description:
        "The server-only Supabase administrator connection is not configured in this environment, so inquiry records remain closed.",
      title: "Private inbox is not configured",
    },
    unavailable: {
      description:
        "The inquiry ledger could not be read safely. No cached or sample substitute is shown; try again after the database connection is restored.",
      title: "Private inbox is temporarily unavailable",
    },
  }[status]

  return (
    <AdminPanel className="mt-8">
      <EmptyState
        description={copy.description}
        icon={AlertCircle}
        title={copy.title}
      />
    </AdminPanel>
  )
}

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: InquirySearchParams
}) {
  const query = await searchParams
  const rawInquiryId = firstSearchValue(query.inquiry)?.trim() ?? ""
  const inquiryId = INQUIRY_ID_PATTERN.test(rawInquiryId)
    ? rawInquiryId
    : undefined
  const page = requestedPage(firstSearchValue(query.page))
  const inbox = await getAdminInquiryInbox({
    inquiryId,
    page,
    pageSize: ADMIN_INQUIRY_PAGE_SIZE,
  })
  const notificationsNeedingAttention =
    inbox.status === "ready"
      ? inbox.inquiries.reduce(
          (count, inquiry) =>
            inquiry.notification_status === "accepted" ? count : count + 1,
          0
        )
      : 0
  const totalPages =
    inbox.status === "ready"
      ? Math.max(1, Math.ceil(inbox.total / inbox.pageSize))
      : 1

  return (
    <>
      <AdminPageHeader
        description="Website notes and booking requests arrive here as durable private records. A record remains available even when its optional email notification is delayed or unavailable."
        eyebrow="Inbox"
        title="Inquiries"
      />

      <nav aria-label="Inbox views" className="mt-6 flex flex-wrap gap-2">
        <Link
          aria-current="page"
          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#273029] px-4 text-xs font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#273029]"
          href="/admin/inquiries"
        >
          <Inbox aria-hidden="true" className="size-3.5" />
          Inquiries
        </Link>
        <Link
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#cfc5b6] bg-white/60 px-4 text-xs font-medium text-[#6f573d] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6f573d]"
          href="/admin/messages"
        >
          <MessagesSquare aria-hidden="true" className="size-3.5" />
          Client messages
        </Link>
      </nav>

      <AdminPanel className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-serif text-xl font-medium text-[#273029]">
            Two distinct kinds of contact
          </h2>
          <p className="mt-1 text-xs leading-5 text-[#59645b]">
            Inquiries are unverified website submissions and stay here. Client
            messages are consent-based relationship threads and have their own
            read-only history. Email replies to inquiries are not synchronized
            back into HWL.
          </p>
        </div>
        <StatusPill tone="quiet">Identity kept separate</StatusPill>
      </AdminPanel>

      {inbox.status !== "ready" ? (
        inboxUnavailable(inbox.status)
      ) : inbox.inquiries.length === 0 ? (
        <AdminPanel className="mt-8">
          <EmptyState
            description={
              inbox.inquiryId
                ? "No private inquiry matched that exact receipt ID. Confirm the alert link and review the full inbox if needed."
                : inbox.total > 0
                  ? "This page is beyond the current inquiry list. Return to the newest records or the last available page."
                  : "New website notes will appear here after the inquiry migration and server connection are active."
            }
            icon={Inbox}
            title={
              inbox.inquiryId
                ? "Inquiry not found"
                : inbox.total > 0
                  ? "No inquiries on this page"
                  : "No inquiries received"
            }
          />
          {inbox.inquiryId || inbox.total > 0 ? (
            <div className="mt-5 flex justify-center">
              <Link
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#cfc5b6] bg-white/60 px-4 text-xs font-medium text-[#6f573d] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6f573d]"
                href={
                  inbox.inquiryId ? "/admin/inquiries" : pageHref(totalPages)
                }
              >
                {inbox.inquiryId ? "View all inquiries" : "Go to last page"}
              </Link>
            </div>
          ) : null}
        </AdminPanel>
      ) : (
        <AdminPanel className="mt-8 overflow-hidden p-0">
          <div className="flex flex-col gap-2 border-b border-[#d9d3c8] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-sm font-medium">Latest private records</p>
              <p className="mt-1 text-xs text-[#7d847c]">
                {inbox.inquiryId
                  ? "Showing the exact inquiry from a private alert · Pacific time"
                  : `Showing ${(inbox.page - 1) * inbox.pageSize + 1}–${(inbox.page - 1) * inbox.pageSize + inbox.inquiries.length} of ${inbox.total} inquiries · Pacific time`}
              </p>
              {inbox.inquiryId ? (
                <Link
                  className="mt-2 inline-flex text-xs font-medium text-[#6f573d] underline underline-offset-4 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6f573d]"
                  href="/admin/inquiries"
                >
                  View all inquiries
                </Link>
              ) : null}
            </div>
            <StatusPill
              tone={notificationsNeedingAttention ? "warning" : "positive"}
            >
              {notificationsNeedingAttention} email alerts need attention
              {!inbox.inquiryId ? " on this page" : ""}
            </StatusPill>
          </div>

          <div className="divide-y divide-[#ded8cd]">
            {inbox.inquiries.map((inquiry) => {
              const details = DETAIL_LABELS.flatMap(([key, label]) => {
                const value = inquiry[key]
                return typeof value === "string" && value
                  ? [{ label, value }]
                  : []
              })
              const notificationNeedsAttention =
                inquiry.notification_status !== "accepted"

              return (
                <article
                  className="scroll-mt-24 p-5 sm:p-6"
                  id={`inquiry-${inquiry.id}`}
                  key={inquiry.id}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-serif text-2xl font-medium text-[#273029]">
                          {inquiry.name}
                        </h2>
                        <StatusPill
                          tone={
                            notificationNeedsAttention ? "warning" : "positive"
                          }
                        >
                          {notificationLabel(inquiry.notification_status)}
                        </StatusPill>
                        <StatusPill tone="quiet">
                          {inquiry.status.replace("_", " ")}
                        </StatusPill>
                      </div>
                      <p className="mt-2 text-xs text-[#737c74]">
                        {receivedAt(inquiry.created_at)} ·{" "}
                        {inquiry.source.replaceAll("-", " ")}
                      </p>
                      <p className="mt-1 text-sm break-all text-[#59645a]">
                        {inquiry.email}
                      </p>
                      <p className="mt-1 font-mono text-[10px] break-all text-[#858b84]">
                        Inquiry ID: {inquiry.id}
                      </p>
                    </div>

                    <a
                      className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[#cfc5b6] bg-white/60 px-4 text-xs font-medium text-[#6f573d] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6f573d]"
                      href={`mailto:${encodeURIComponent(inquiry.email)}?subject=${encodeURIComponent(
                        `Re: HWL by SMD inquiry from ${inquiry.name}`
                      )}`}
                    >
                      <Mail className="size-3.5" aria-hidden="true" />
                      Reply by email
                    </a>
                  </div>

                  {notificationNeedsAttention && (
                    <p className="mt-4 rounded-xl border border-[#cba97f]/45 bg-[#d9b47e]/10 px-4 py-3 text-xs leading-5 text-[#765b38]">
                      The optional email alert was not confirmed. This inquiry
                      is safely stored here for direct review.
                    </p>
                  )}

                  {details.length > 0 && (
                    <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {details.map((detail) => (
                        <div
                          className="rounded-xl bg-[#f4efe7]/75 px-4 py-3"
                          key={`${inquiry.id}-${detail.label}`}
                        >
                          <dt className="text-[9px] font-semibold tracking-[0.15em] text-[#858b84] uppercase">
                            {detail.label}
                          </dt>
                          <dd className="mt-1 text-sm leading-5 text-[#596359]">
                            {detail.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  <div className="mt-5 rounded-2xl border border-[#ddd6ca] bg-white/38 px-4 py-4 sm:px-5">
                    <p className="text-[9px] font-semibold tracking-[0.15em] text-[#858b84] uppercase">
                      Message
                    </p>
                    <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-[#4f5a51]">
                      {inquiry.message}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
          {!inbox.inquiryId && totalPages > 1 ? (
            <nav
              aria-label="Inquiry pages"
              className="flex items-center justify-between gap-4 border-t border-[#d9d3c8] p-5 sm:p-6"
            >
              {inbox.page > 1 ? (
                <Link
                  className="inline-flex min-h-10 items-center gap-1 rounded-full border border-[#cfc5b6] bg-white/60 px-4 text-xs font-medium text-[#6f573d] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6f573d]"
                  href={pageHref(inbox.page - 1)}
                  rel="prev"
                >
                  <ChevronLeft aria-hidden="true" className="size-3.5" />
                  Newer
                </Link>
              ) : (
                <span aria-hidden="true" />
              )}
              <p className="text-xs text-[#7d847c]">
                Page {inbox.page} of {totalPages}
              </p>
              {inbox.page < totalPages ? (
                <Link
                  className="inline-flex min-h-10 items-center gap-1 rounded-full border border-[#cfc5b6] bg-white/60 px-4 text-xs font-medium text-[#6f573d] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6f573d]"
                  href={pageHref(inbox.page + 1)}
                  rel="next"
                >
                  Older
                  <ChevronRight aria-hidden="true" className="size-3.5" />
                </Link>
              ) : (
                <span aria-hidden="true" />
              )}
            </nav>
          ) : null}
        </AdminPanel>
      )}
    </>
  )
}
