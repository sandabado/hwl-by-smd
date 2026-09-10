import Link from "next/link"
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Inbox,
  MailQuestion,
  MessageCircle,
} from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  EmptyState,
  StatusPill,
} from "@/components/admin/admin-ui"
import {
  type AdminConversationFilter,
  getAdminConversationInbox,
} from "@/lib/admin/conversation-inbox"

export const dynamic = "force-dynamic"

type MessageSearchParams = Promise<{
  filter?: string | string[]
  page?: string | string[]
}>

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Los_Angeles",
})

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function requestedPage(value: string | undefined) {
  if (!value || !/^\d+$/.test(value)) return 1
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1
}

function filterHref(filter: AdminConversationFilter) {
  return filter === "all" ? "/admin/messages?filter=all" : "/admin/messages"
}

function pageHref(filter: AdminConversationFilter, page: number) {
  const search = new URLSearchParams()
  if (filter === "all") search.set("filter", "all")
  if (page > 1) search.set("page", String(page))
  const query = search.toString()
  return query ? `/admin/messages?${query}` : "/admin/messages"
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function statusLabel(status: string) {
  if (status === "awaiting_practitioner") return "Needs reply"
  if (status === "resolved") return "Resolved"
  return "Open"
}

function unavailableInbox(
  status: "local_preview" | "not_configured" | "unavailable"
) {
  const copy = {
    local_preview: {
      description:
        "The signed local design preview cannot read private client conversations. Sign in as Shannon in a configured Supabase environment to open her real message queue.",
      title: "Client messages stay private",
    },
    not_configured: {
      description:
        "The server-only Supabase administrator connection is not configured in this environment, so the message queue remains closed.",
      title: "Private messages are not configured",
    },
    unavailable: {
      description:
        "Shannon's relationship message queue could not be read safely. No cached or fictional conversations are shown; try again after the database connection is restored.",
      title: "Messages are temporarily unavailable",
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

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: MessageSearchParams
}) {
  const query = await searchParams
  const requestedFilter = firstValue(query.filter)
  const page = requestedPage(firstValue(query.page))
  const inbox = await getAdminConversationInbox({
    filter: requestedFilter,
    page,
  })
  const totalPages =
    inbox.status === "ready"
      ? Math.max(1, Math.ceil(inbox.total / inbox.pageSize))
      : 1

  return (
    <>
      <AdminPageHeader
        description="Private client conversations scoped to relationships assigned to the signed-in practitioner. Website inquiries stay separate until a client account and consent-based relationship exist."
        eyebrow="Inbox"
        title="Client messages"
      />

      <nav aria-label="Inbox views" className="mt-6 flex flex-wrap gap-2">
        <Link
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#cfc5b6] bg-white/60 px-4 text-xs font-medium text-[#6f573d] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6f573d]"
          href="/admin/inquiries"
        >
          <MailQuestion aria-hidden="true" className="size-3.5" />
          Inquiries
        </Link>
        <Link
          aria-current="page"
          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#273029] px-4 text-xs font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#273029]"
          href="/admin/messages"
        >
          <MessageCircle aria-hidden="true" className="size-3.5" />
          Client messages
        </Link>
      </nav>

      {inbox.status !== "ready" ? (
        unavailableInbox(inbox.status)
      ) : (
        <AdminPanel className="mt-5 overflow-hidden p-0">
          <div className="flex flex-col gap-4 border-b border-[#d9d3c8] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-[#6d7d85]/10 text-[#60717a]">
                <Inbox className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-medium text-[#273029]">
                  Assigned conversation queue
                </h2>
                <p className="mt-1 text-xs text-[#59645b]">
                  {inbox.total} {inbox.total === 1 ? "thread" : "threads"}
                  {inbox.filter === "needs-reply" ? " awaiting her reply" : ""}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["needs-reply", "all"] as const).map((filter) => (
                <Link
                  aria-current={inbox.filter === filter ? "page" : undefined}
                  className={
                    inbox.filter === filter
                      ? "inline-flex min-h-9 items-center rounded-full bg-[#273029] px-4 text-xs font-medium text-white"
                      : "inline-flex min-h-9 items-center rounded-full border border-[#cfc5b6] bg-white/60 px-4 text-xs font-medium text-[#6f573d] hover:bg-white"
                  }
                  href={filterHref(filter)}
                  key={filter}
                >
                  {filter === "needs-reply" ? "Needs reply" : "All messages"}
                </Link>
              ))}
            </div>
          </div>

          {inbox.conversations.length === 0 ? (
            <div className="p-5 sm:p-6">
              <EmptyState
                description={
                  inbox.filter === "needs-reply"
                    ? "No client conversation is waiting for Shannon right now. Open All messages to review previous threads."
                    : "No consent-based client conversation has been created yet. Website inquiry records remain in Inquiries."
                }
                icon={MessageCircle}
                title={
                  inbox.filter === "needs-reply"
                    ? "Nothing needs a reply"
                    : "No client messages yet"
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-[#ded8cd]">
              {inbox.conversations.map((conversation) => (
                <Link
                  className="grid gap-3 p-5 transition hover:bg-white/35 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#6f573d] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:px-6"
                  href={`/admin/messages/${conversation.id}`}
                  key={conversation.id}
                >
                  <span className="grid size-10 place-items-center rounded-full bg-[#9d8464]/12 font-serif text-sm text-[#806443]">
                    {initials(conversation.clientName)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-medium text-[#273029]">
                        {conversation.clientName}
                      </h3>
                      <StatusPill
                        tone={
                          conversation.status === "awaiting_practitioner"
                            ? "warning"
                            : conversation.status === "resolved"
                              ? "positive"
                              : "neutral"
                        }
                      >
                        {statusLabel(conversation.status)}
                      </StatusPill>
                      {conversation.practitionerUnreadCount > 0 ? (
                        <StatusPill tone="quiet">
                          {conversation.practitionerUnreadCount} unread
                        </StatusPill>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-xs font-medium text-[#4b554d]">
                      {conversation.subject}
                    </p>
                    {conversation.lastMessage ? (
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#59645b]">
                        {conversation.lastMessage}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-[#59645b]">
                        Conversation created; no messages yet.
                      </p>
                    )}
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] text-[#59645b]">
                      {DATE_TIME_FORMATTER.format(
                        new Date(
                          conversation.lastMessageAt ?? conversation.createdAt
                        )
                      )}
                    </p>
                    <p className="mt-1 text-[10px] break-all text-[#59645b]">
                      {conversation.clientEmail}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {inbox.total > inbox.pageSize ? (
            <nav
              aria-label="Message pages"
              className="flex items-center justify-between border-t border-[#d9d3c8] p-5 sm:px-6"
            >
              {inbox.page > 1 ? (
                <Link
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#cfc5b6] bg-white/60 px-4 text-xs font-medium text-[#6f573d] hover:bg-white"
                  href={pageHref(inbox.filter, inbox.page - 1)}
                >
                  <ChevronLeft aria-hidden="true" className="size-3.5" />
                  Newer
                </Link>
              ) : (
                <span />
              )}
              <p className="text-xs text-[#59645b]">
                Page {inbox.page} of {totalPages}
              </p>
              {inbox.page < totalPages ? (
                <Link
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#cfc5b6] bg-white/60 px-4 text-xs font-medium text-[#6f573d] hover:bg-white"
                  href={pageHref(inbox.filter, inbox.page + 1)}
                >
                  Older
                  <ChevronRight aria-hidden="true" className="size-3.5" />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </AdminPanel>
      )}
    </>
  )
}
