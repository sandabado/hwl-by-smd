import Link from "next/link"
import { notFound } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CircleDollarSign,
  MessageCircle,
  ShoppingBag,
  UserRound,
} from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  EmptyState,
  FieldPreview,
  PanelHeading,
  StatusPill,
} from "@/components/admin/admin-ui"
import {
  type AdminClientDetail,
  getAdminClientDetail,
} from "@/lib/admin/client-directory"

export const dynamic = "force-dynamic"

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "America/Los_Angeles",
})
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Los_Angeles",
})

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      currency: currency.toUpperCase(),
      style: "currency",
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`
  }
}

function label(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ")
}

function historyUnavailable(
  icon: typeof CalendarDays,
  title: string,
  description: string
) {
  return <EmptyState description={description} icon={icon} title={title} />
}

function ClientRecord({ detail }: { detail: AdminClientDetail }) {
  const { client } = detail

  return (
    <>
      <div className="mt-8 grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
        <AdminPanel>
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[#9d8464]/12 text-[#806443]">
              <UserRound className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-medium text-[#273029]">{client.name}</p>
              <p className="mt-1 text-xs break-all text-[#59645b]">
                {client.email}
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4">
            <FieldPreview
              label="Joined"
              value={DATE_FORMATTER.format(new Date(client.joinedAt))}
            />
            <FieldPreview
              label="Purchase value"
              value={money(client.purchaseTotal, "usd")}
            />
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-[#f6f2ea]/70 p-3">
                <p className="font-serif text-2xl text-[#273029]">
                  {client.purchaseCount}
                </p>
                <p className="mt-1 text-[10px] text-[#59645b]">Purchases</p>
              </div>
              <div className="rounded-xl bg-[#f6f2ea]/70 p-3">
                <p className="font-serif text-2xl text-[#273029]">
                  {client.bookingCount ?? "—"}
                </p>
                <p className="mt-1 text-[10px] text-[#59645b]">Bookings</p>
              </div>
              <div className="rounded-xl bg-[#f6f2ea]/70 p-3">
                <p className="font-serif text-2xl text-[#273029]">
                  {client.conversationCount ?? "—"}
                </p>
                <p className="mt-1 text-[10px] text-[#59645b]">Threads</p>
              </div>
            </div>
          </div>
        </AdminPanel>

        <div className="grid gap-5 sm:grid-cols-2">
          <AdminPanel>
            <PanelHeading eyebrow="Care" title="Booking history" />
            <div className="mt-5">
              {detail.bookings === null ? (
                historyUnavailable(
                  CalendarDays,
                  "Booking ledger unavailable",
                  "Migration 016 and the canonical Cal.com webhook must be active before linked booking history can appear here."
                )
              ) : detail.bookings.length === 0 ? (
                <EmptyState
                  description="No Cal.com booking has been explicitly linked to this confirmed account."
                  icon={CalendarDays}
                  title="No linked bookings"
                />
              ) : (
                <div className="divide-y divide-[#e0dbd1]">
                  {detail.bookings.map((booking) => (
                    <article className="py-4 first:pt-0" key={booking.id}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="text-sm font-medium text-[#273029]">
                          {booking.serviceTitle}
                        </h3>
                        <StatusPill
                          tone={
                            booking.bookingStatus === "confirmed"
                              ? "positive"
                              : booking.bookingStatus === "requested"
                                ? "warning"
                                : "neutral"
                          }
                        >
                          {label(booking.bookingStatus)}
                        </StatusPill>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-[#59645b]">
                        {DATE_TIME_FORMATTER.format(new Date(booking.startAt))}
                        {" · "}
                        {booking.timeZone}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </AdminPanel>

          <AdminPanel>
            <PanelHeading eyebrow="Learning" title="LIFT progress" />
            <div className="mt-5">
              {detail.progress === null ? (
                historyUnavailable(
                  BookOpen,
                  "Progress unavailable",
                  "Course progress could not be read safely in this environment."
                )
              ) : detail.progress.startedCount === 0 ? (
                <EmptyState
                  description="No LIFT lesson has been started from this account."
                  icon={BookOpen}
                  title="No learning activity"
                />
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FieldPreview
                      label="Lessons started"
                      value={String(detail.progress.startedCount)}
                    />
                    <FieldPreview
                      label="Completed"
                      value={String(detail.progress.completedCount)}
                    />
                  </div>
                  <p className="text-xs leading-5 text-[#59645b]">
                    Last activity{" "}
                    {detail.progress.lastActivityAt
                      ? DATE_TIME_FORMATTER.format(
                          new Date(detail.progress.lastActivityAt)
                        )
                      : "not recorded"}
                  </p>
                </div>
              )}
            </div>
          </AdminPanel>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <AdminPanel>
          <PanelHeading
            detail="Only fulfilled purchase evidence grants access."
            eyebrow="Commerce"
            title="Purchases"
          />
          <div className="mt-5">
            {detail.purchases.length === 0 ? (
              <EmptyState
                description="No fulfilled purchase exists for this client in the canonical Stripe account and deployment mode."
                icon={CircleDollarSign}
                title="No purchases"
              />
            ) : (
              <div className="divide-y divide-[#e0dbd1]">
                {detail.purchases.map((purchase) => (
                  <article className="py-4 first:pt-0" key={purchase.id}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-medium text-[#273029]">
                          {label(purchase.productType)}
                        </h3>
                        <p className="mt-1 text-xs text-[#59645b]">
                          {DATE_TIME_FORMATTER.format(
                            new Date(purchase.purchasedAt)
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[#273029]">
                          {money(purchase.amountPaid, purchase.currency)}
                        </p>
                        <StatusPill
                          tone={
                            purchase.status === "active"
                              ? "positive"
                              : purchase.status === "disputed"
                                ? "warning"
                                : "neutral"
                          }
                        >
                          {label(purchase.status)}
                        </StatusPill>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </AdminPanel>

        <AdminPanel>
          <PanelHeading
            detail="Attempts are retained separately from fulfilled access."
            eyebrow="Checkout"
            title="Payment activity"
          />
          <div className="mt-5">
            {detail.checkouts.length === 0 ? (
              <EmptyState
                description="No checkout attempt exists for this client in the canonical Stripe account and deployment mode."
                icon={ShoppingBag}
                title="No checkout activity"
              />
            ) : (
              <div className="divide-y divide-[#e0dbd1]">
                {detail.checkouts.map((checkout) => (
                  <article className="py-4 first:pt-0" key={checkout.id}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-medium text-[#273029]">
                          {label(checkout.productType)}
                        </h3>
                        <p className="mt-1 text-xs text-[#59645b]">
                          {DATE_TIME_FORMATTER.format(
                            new Date(checkout.createdAt)
                          )}
                        </p>
                      </div>
                      <StatusPill
                        tone={
                          checkout.status === "paid"
                            ? "positive"
                            : checkout.status === "open"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        {label(checkout.status)}
                      </StatusPill>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </AdminPanel>
      </div>

      <AdminPanel className="mt-5">
        <PanelHeading
          detail="Website inquiries are not auto-matched by email and remain in the Inbox."
          eyebrow="Relationship"
          title="Conversation history"
        />
        <div className="mt-5">
          {detail.conversations === null ? (
            historyUnavailable(
              MessageCircle,
              "Conversations unavailable",
              "The relationship conversation schema could not be read safely in this environment."
            )
          ) : detail.conversations.length === 0 ? (
            <EmptyState
              description="No consent-based conversation is linked to this client account."
              icon={MessageCircle}
              title="No conversations"
            />
          ) : (
            <div className="divide-y divide-[#e0dbd1]">
              {detail.conversations.map((conversation) => (
                <article
                  className="grid gap-3 py-4 first:pt-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  key={conversation.id}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-medium text-[#273029]">
                        {conversation.subject}
                      </h3>
                      {conversation.practitionerUnreadCount > 0 ? (
                        <StatusPill tone="warning">
                          {conversation.practitionerUnreadCount} unread
                        </StatusPill>
                      ) : (
                        <StatusPill>{label(conversation.status)}</StatusPill>
                      )}
                    </div>
                    {conversation.lastMessage ? (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#59645b]">
                        {conversation.lastMessage}
                      </p>
                    ) : null}
                    {conversation.lastMessageAt ? (
                      <p className="mt-1 text-[10px] text-[#59645b]">
                        {DATE_TIME_FORMATTER.format(
                          new Date(conversation.lastMessageAt)
                        )}
                      </p>
                    ) : null}
                  </div>
                  <Link
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#cfc5b6] bg-white/60 px-4 text-xs font-medium text-[#6f573d] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6f573d]"
                    href={`/admin/messages/${conversation.id}`}
                  >
                    Open thread
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </AdminPanel>
    </>
  )
}

function unavailableDetail(
  status: "local_preview" | "not_configured" | "unavailable"
) {
  const copy = {
    local_preview: {
      description:
        "The signed local design preview cannot open real client records. Sign in as a confirmed Supabase administrator in a configured environment.",
      title: "Live client records stay private",
    },
    not_configured: {
      description:
        "The canonical Supabase administrator and Stripe account scope are not both configured in this environment.",
      title: "Private client view is not configured",
    },
    unavailable: {
      description:
        "This client record could not be read safely. No cached or sample history is shown.",
      title: "Client record is temporarily unavailable",
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

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getAdminClientDetail(id)
  if (result.status === "invalid_id" || result.status === "not_found")
    notFound()

  return (
    <>
      <Link
        className="mb-5 inline-flex min-h-10 items-center gap-2 text-xs font-medium text-[#6f573d] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6f573d]"
        href="/admin/clients"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        All clients
      </Link>
      <AdminPageHeader
        description="A private, read-only timeline built only from this confirmed account and its explicitly linked records."
        eyebrow="Client relationship"
        title={result.status === "ready" ? result.detail.client.name : "Client"}
      />

      {result.status === "ready" ? (
        <ClientRecord detail={result.detail} />
      ) : (
        unavailableDetail(result.status)
      )}
    </>
  )
}
