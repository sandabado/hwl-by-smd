import Link from "next/link"
import {
  AlertCircle,
  CalendarDays,
  CircleDollarSign,
  MessageCircle,
  UsersRound,
} from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  EmptyState,
  MetricCard,
  StatusPill,
} from "@/components/admin/admin-ui"
import { getAdminClientDirectory } from "@/lib/admin/client-directory"

export const dynamic = "force-dynamic"

const JOINED_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "America/Los_Angeles",
})
const MONEY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
})

function privateDirectoryUnavailable(
  status: "local_preview" | "not_configured" | "unavailable"
) {
  const copy = {
    local_preview: {
      description:
        "The signed local design preview cannot read client profiles, purchases, bookings, or conversations. Sign in as a confirmed Supabase administrator in a configured environment to open the private directory.",
      title: "Live client records stay private",
    },
    not_configured: {
      description:
        "The canonical Supabase administrator and Stripe account scope are not both configured in this environment, so no client records are shown.",
      title: "Private directory is not configured",
    },
    unavailable: {
      description:
        "The client directory could not be read safely. No cached or sample people are substituted; try again after the database connection is restored.",
      title: "Client directory is temporarily unavailable",
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

export default async function AdminClientsPage() {
  const directory = await getAdminClientDirectory()
  const totals =
    directory.status === "ready"
      ? directory.clients.reduce(
          (summary, client) => ({
            bookings:
              summary.bookings +
              (client.bookingCount === null ? 0 : client.bookingCount),
            conversations:
              summary.conversations +
              (client.conversationCount === null
                ? 0
                : client.conversationCount),
            purchases: summary.purchases + client.purchaseCount,
            revenue: summary.revenue + client.purchaseTotal,
          }),
          { bookings: 0, conversations: 0, purchases: 0, revenue: 0 }
        )
      : null

  return (
    <>
      <AdminPageHeader
        description="One verified relationship view for every HWL account: profile, canonically scoped LIFT commerce, booking ledger history, conversations, and progress. Inquiry emails remain separate until a person explicitly creates or confirms an account."
        eyebrow="People"
        title="Clients"
      />

      {directory.status !== "ready" ? (
        privateDirectoryUnavailable(directory.status)
      ) : directory.clients.length === 0 ? (
        <AdminPanel className="mt-8">
          <EmptyState
            description="Confirmed client accounts will appear here. Website inquiries remain in the Inbox and are not silently matched by email."
            icon={UsersRound}
            title="No client accounts yet"
          />
        </AdminPanel>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={UsersRound}
              label="Client accounts"
              note="Registered client profiles"
              value={String(directory.clients.length)}
            />
            <MetricCard
              icon={CircleDollarSign}
              label="LIFT purchases"
              note={MONEY_FORMATTER.format(totals?.revenue ?? 0)}
              tone="#688064"
              value={String(totals?.purchases ?? 0)}
            />
            <MetricCard
              icon={CalendarDays}
              label="Linked bookings"
              note={
                directory.bookingHistoryAvailable
                  ? "Cal.com ledger records"
                  : "Booking ledger unavailable"
              }
              tone="#8b6c79"
              value={
                directory.bookingHistoryAvailable
                  ? String(totals?.bookings ?? 0)
                  : "—"
              }
            />
            <MetricCard
              icon={MessageCircle}
              label="Conversations"
              note={
                directory.conversationHistoryAvailable
                  ? "Relationship threads"
                  : "Conversation schema unavailable"
              }
              tone="#6d7d85"
              value={
                directory.conversationHistoryAvailable
                  ? String(totals?.conversations ?? 0)
                  : "—"
              }
            />
          </div>

          <AdminPanel className="mt-5">
            <div className="flex flex-col gap-3 border-b border-[#d9d3c8] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-[#6f512f] uppercase">
                  Directory
                </p>
                <h2 className="mt-1 font-serif text-2xl font-medium text-[#273029]">
                  People Shannon serves
                </h2>
              </div>
              <StatusPill tone="positive">Live private records</StatusPill>
            </div>

            <div className="mt-2 divide-y divide-[#e0dbd1]">
              {directory.clients.map((client) => (
                <article
                  className="grid gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  key={client.id}
                >
                  <div className="min-w-0">
                    <h3 className="font-serif text-xl font-medium text-[#273029]">
                      {client.name}
                    </h3>
                    <p className="mt-1 text-xs break-all text-[#59645b]">
                      {client.email}
                    </p>
                    <p className="mt-2 text-xs text-[#59645b]">
                      Joined{" "}
                      {JOINED_FORMATTER.format(new Date(client.joinedAt))}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:justify-end">
                    <p className="text-xs text-[#59645b]">
                      <strong className="font-semibold text-[#273029]">
                        {client.purchaseCount}
                      </strong>{" "}
                      purchases
                    </p>
                    <p className="text-xs text-[#59645b]">
                      <strong className="font-semibold text-[#273029]">
                        {client.checkoutCount}
                      </strong>{" "}
                      checkouts
                    </p>
                    <p className="text-xs text-[#59645b]">
                      <strong className="font-semibold text-[#273029]">
                        {client.bookingCount ?? "—"}
                      </strong>{" "}
                      bookings
                    </p>
                    <p className="text-xs text-[#59645b]">
                      <strong className="font-semibold text-[#273029]">
                        {client.conversationCount ?? "—"}
                      </strong>{" "}
                      conversations
                    </p>
                    <Link
                      className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#273029] px-4 text-xs font-medium text-white transition hover:bg-[#354039] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#273029]"
                      href={`/admin/clients/${client.id}`}
                    >
                      View client
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </AdminPanel>
        </>
      )}
    </>
  )
}
