import Link from "next/link"
import { notFound } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Mail,
  MessageCircle,
  ShieldCheck,
} from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  EmptyState,
  PanelHeading,
  StatusPill,
} from "@/components/admin/admin-ui"
import { getAdminConversationThread } from "@/lib/admin/conversation-inbox"

export const dynamic = "force-dynamic"

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Los_Angeles",
})

function statusLabel(status: string) {
  if (status === "awaiting_practitioner") return "Needs reply"
  if (status === "resolved") return "Resolved"
  return "Open"
}

function historyCountLabel(
  history: Readonly<{
    isPartial: boolean
    loadedCount: number
    totalCount: number | null
  }>
) {
  if (history.isPartial) {
    return history.totalCount === null
      ? `Newest ${history.loadedCount} messages`
      : `Newest ${history.loadedCount} of ${history.totalCount} messages`
  }

  return `${history.loadedCount} ${history.loadedCount === 1 ? "message" : "messages"}`
}

function unavailableThread(
  status: "local_preview" | "not_configured" | "unavailable"
) {
  const copy = {
    local_preview: {
      description:
        "The signed local design preview cannot open a real private conversation. Sign in as the assigned practitioner in a configured Supabase environment.",
      title: "Client messages stay private",
    },
    not_configured: {
      description:
        "The server-only Supabase administrator connection is not configured in this environment, so this conversation remains closed.",
      title: "Private messages are not configured",
    },
    unavailable: {
      description:
        "This conversation could not be read safely. No cached or fictional thread is substituted; try again after the database connection is restored.",
      title: "Conversation temporarily unavailable",
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

export default async function AdminMessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const thread = await getAdminConversationThread(id)

  if (thread.status === "invalid_id" || thread.status === "not_found") {
    notFound()
  }

  return (
    <>
      <Link
        className="mb-5 inline-flex min-h-10 items-center gap-2 text-xs font-medium text-[#6f573d] underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6f573d]"
        href="/admin/messages"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        All client messages
      </Link>

      {thread.status !== "ready" ? (
        <>
          <AdminPageHeader
            description="Private conversation details are shown only to the practitioner assigned to the relationship."
            eyebrow="Inbox"
            title="Client conversation"
          />
          {unavailableThread(thread.status)}
        </>
      ) : (
        <>
          <AdminPageHeader
            description={`A private relationship thread with ${thread.conversation.clientName}. Messages are stored in HWL and restricted to the assigned relationship.`}
            eyebrow="Client conversation"
            title={thread.conversation.subject}
          >
            <StatusPill
              tone={
                thread.conversation.status === "awaiting_practitioner"
                  ? "warning"
                  : thread.conversation.status === "resolved"
                    ? "positive"
                    : "neutral"
              }
            >
              {statusLabel(thread.conversation.status)}
            </StatusPill>
            {thread.conversation.practitionerUnreadCount > 0 ? (
              <StatusPill tone="quiet">
                {thread.conversation.practitionerUnreadCount} unread
              </StatusPill>
            ) : null}
          </AdminPageHeader>

          <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
            <AdminPanel className="flex min-h-[32rem] flex-col">
              <div className="flex flex-col gap-2 border-b border-[#ddd7cd] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-[#273029]">
                    {thread.conversation.clientName}
                  </p>
                  <p className="mt-1 text-xs text-[#59645b]">
                    {historyCountLabel(thread.history)} · Pacific time
                  </p>
                </div>
                <StatusPill tone="positive">Live private record</StatusPill>
              </div>

              {thread.history.isPartial ? (
                <div
                  className="mt-5 rounded-2xl border border-[#cdbb9e] bg-[#f6f0e7] px-4 py-3 text-[#594a38]"
                  role="status"
                >
                  <p className="text-xs font-semibold">
                    Partial conversation history
                  </p>
                  <p className="mt-1 text-xs leading-5">
                    {thread.history.totalCount === null
                      ? `Showing the newest ${thread.history.loadedCount} messages.`
                      : `Showing the newest ${thread.history.loadedCount} of ${thread.history.totalCount} messages.`}{" "}
                    Earlier messages are not loaded in this view.
                  </p>
                </div>
              ) : null}

              {thread.messages.length === 0 ? (
                <div className="grid flex-1 place-items-center py-8">
                  <EmptyState
                    description="This consent-based conversation exists, but no messages have been sent yet."
                    icon={MessageCircle}
                    title="No messages yet"
                  />
                </div>
              ) : (
                <ol className="flex-1 space-y-5 py-7">
                  {thread.messages.map((message) => (
                    <li
                      className={
                        message.sender === "practitioner"
                          ? "ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-[#9d8464]/15 px-4 py-3 sm:max-w-[78%]"
                          : "max-w-[88%] rounded-2xl rounded-tl-sm bg-[#273029]/7 px-4 py-3 sm:max-w-[78%]"
                      }
                      key={message.id}
                    >
                      <p className="text-[10px] font-semibold tracking-[0.12em] text-[#6f573d] uppercase">
                        {message.sender === "practitioner"
                          ? "You"
                          : thread.conversation.clientName}
                      </p>
                      <p className="mt-1 text-sm leading-6 whitespace-pre-wrap text-[#414c44]">
                        {message.body}
                      </p>
                      {message.ctaHref && message.ctaLabel ? (
                        <a
                          className="mt-3 inline-flex min-h-10 items-center rounded-full bg-[#273029] px-4 text-xs font-medium text-white"
                          href={message.ctaHref}
                        >
                          {message.ctaLabel}
                        </a>
                      ) : null}
                      <p className="mt-2 text-[10px] text-[#59645b]">
                        {DATE_TIME_FORMATTER.format(new Date(message.sentAt))}
                        {message.sender === "practitioner"
                          ? message.readAt
                            ? " · Read"
                            : " · Not yet read"
                          : ""}
                      </p>
                    </li>
                  ))}
                </ol>
              )}

              <div className="border-t border-[#ddd7cd] pt-5">
                <div className="rounded-2xl border border-[#d8cdbd] bg-[#f6f0e7] p-4">
                  <p className="text-sm font-medium text-[#273029]">
                    Replies remain read-only for this launch gate
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#59645b]">
                    The history is real and practitioner-scoped. Sending from
                    HWL stays disabled until one reply can be stored once,
                    notified to the client once, and audited without duplicate
                    delivery. Continue urgent replies from the approved email
                    channel for now.
                  </p>
                </div>
              </div>
            </AdminPanel>

            <div className="space-y-5">
              <AdminPanel>
                <PanelHeading
                  eyebrow="Client"
                  title={thread.conversation.clientName}
                />
                <div className="mt-5 space-y-3">
                  <p className="text-xs break-all text-[#59645b]">
                    {thread.conversation.clientEmail}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className="inline-flex min-h-10 items-center rounded-full bg-[#273029] px-4 text-xs font-medium text-white"
                      href={`/admin/clients/${thread.conversation.clientId}`}
                    >
                      View client history
                    </Link>
                    <a
                      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#cfc5b6] bg-white/60 px-4 text-xs font-medium text-[#6f573d]"
                      href={`mailto:${encodeURIComponent(thread.conversation.clientEmail)}`}
                    >
                      <Mail aria-hidden="true" className="size-3.5" />
                      Email client
                    </a>
                  </div>
                </div>
              </AdminPanel>

              <AdminPanel>
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#688064]/10 text-[#5b7058]">
                    <ShieldCheck className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#273029]">
                      Assigned-practitioner scope
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#59645b]">
                      This thread is visible here only because the signed-in
                      administrator is its assigned practitioner. Administrator
                      status alone does not expose another practitioner&apos;s
                      conversations.
                    </p>
                  </div>
                </div>
              </AdminPanel>

              <AdminPanel>
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#8b6c79]/10 text-[#765b67]">
                    <CalendarDays className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#273029]">
                      Booking history
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#59645b]">
                      Open the client record for linked Cal.com history and
                      canonically scoped purchases.
                    </p>
                  </div>
                </div>
              </AdminPanel>
            </div>
          </div>
        </>
      )}
    </>
  )
}
