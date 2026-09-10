import Link from "next/link"
import {
  CalendarClock,
  CircleDollarSign,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
} from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  EmptyState,
  PanelHeading,
  StatusPill,
} from "@/components/admin/admin-ui"
import { requireAdmin } from "@/lib/admin-auth"
import {
  type CalcomAdminBooking,
  type CalcomAdminBookingQueue,
  getCalcomAdminBookings,
} from "@/lib/bookings/calcom-admin"
import { isCalcomBookingLedgerReady } from "@/lib/bookings/member-bookings"
import { getCalcomPublicEventTypes } from "@/lib/calcom"
import { getStripeDashboardBaseUrl } from "@/lib/commerce/stripe-admin"
import {
  getExpectedStripeAccountId,
  getExpectedStripeLivemode,
} from "@/lib/stripe"

export const dynamic = "force-dynamic"

const CALCOM_BOOKINGS_URL = "https://app.cal.com/bookings/upcoming"

const queuePresentation: Readonly<
  Record<
    CalcomAdminBookingQueue,
    Readonly<{ empty: string; label: string; tone: "positive" | "warning" }>
  >
> = {
  cancelled: {
    empty: "No cancelled bookings in this queue.",
    label: "Cancelled",
    tone: "warning",
  },
  past: {
    empty: "No completed dates in this queue.",
    label: "Past",
    tone: "positive",
  },
  unconfirmed: {
    empty: "No requests need confirmation.",
    label: "Needs confirmation",
    tone: "warning",
  },
  upcoming: {
    empty: "No upcoming bookings are scheduled.",
    label: "Upcoming",
    tone: "positive",
  },
}

const bookingDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Los_Angeles",
})

const bookingEndFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Los_Angeles",
})

function BookingQueue({
  bookings,
  hasMore,
  queue,
}: Readonly<{
  bookings: readonly CalcomAdminBooking[]
  hasMore: boolean
  queue: CalcomAdminBookingQueue
}>) {
  const presentation = queuePresentation[queue]

  return (
    <section
      aria-labelledby={`calcom-${queue}-heading`}
      className="rounded-2xl border border-[#d9d3c8] bg-white/35 p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h3
          className="text-sm font-medium text-[#344038]"
          id={`calcom-${queue}-heading`}
        >
          {presentation.label}
        </h3>
        <StatusPill tone={presentation.tone}>{bookings.length}</StatusPill>
      </div>

      {bookings.length > 0 ? (
        <ul className="mt-4 divide-y divide-[#ddd7cd]">
          {bookings.map((booking) => (
            <li className="py-3 first:pt-0 last:pb-0" key={booking.uid}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#344038]">
                    {booking.serviceTitle}
                  </p>
                  <p className="mt-1 truncate text-xs text-[#59645b]">
                    {booking.attendeeName} · {booking.attendeeEmail}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-semibold tracking-[0.12em] text-[#765b3b] uppercase">
                  {booking.providerStatus}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#59645b]">
                <time dateTime={booking.startAt}>
                  {bookingDateFormatter.format(new Date(booking.startAt))}
                </time>
                {" – "}
                <time dateTime={booking.endAt}>
                  {bookingEndFormatter.format(new Date(booking.endAt))} PT
                </time>
              </p>
              <p className="mt-0.5 text-[11px] leading-5 text-[#687168]">
                Client timezone: {booking.attendeeTimeZone}
                {booking.locationSummary ? ` · ${booking.locationSummary}` : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-xs leading-5 text-[#687168]">
          {presentation.empty}
        </p>
      )}

      {hasMore ? (
        <p className="mt-4 border-t border-[#ddd7cd] pt-3 text-[11px] leading-5 text-[#687168]">
          Showing the first 50. Open Cal.com to review the remaining bookings.
        </p>
      ) : null}
    </section>
  )
}

export default async function AdminBookingsPage() {
  const access = await requireAdmin()

  const [calcom, adminBookings] = await Promise.all([
    getCalcomPublicEventTypes(),
    getCalcomAdminBookings(access),
  ])
  const catalogReady =
    calcom.status === "available" && calcom.eventTypes.length > 0
  const publishedCount = calcom.eventTypes.length
  const confirmationCount = calcom.eventTypes.filter(
    ({ confirmationRequired }) => confirmationRequired
  ).length
  const bookingLedgerReady = isCalcomBookingLedgerReady()
  const stripeAccountId = getExpectedStripeAccountId()
  const stripeLivemode = getExpectedStripeLivemode()
  const stripeDashboardUrl =
    stripeAccountId && stripeLivemode !== null
      ? getStripeDashboardBaseUrl(stripeAccountId, stripeLivemode)
      : null
  const stripeInvoicesUrl = stripeDashboardUrl
    ? `${stripeDashboardUrl}/invoices`
    : null

  return (
    <>
      <AdminPageHeader
        description="One calm place to begin, with Cal.com remaining the authority for availability, confirmations, rescheduling, and cancellations."
        eyebrow="Daily operations"
        title="Bookings"
      >
        <a
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#273029] px-4 text-xs font-medium text-white transition hover:bg-[#48544b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#273029]"
          href={CALCOM_BOOKINGS_URL}
          rel="noreferrer"
          target="_blank"
        >
          Open Cal.com bookings
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      </AdminPageHeader>

      <AdminPanel className="mt-8">
        <div className="flex flex-col gap-4 border-b border-[#d9d3c8] pb-5 sm:flex-row sm:items-start sm:justify-between">
          <PanelHeading
            detail="Private attendee details remain server-side and are shown only to an authenticated HWL admin. Scheduling changes still happen in Cal.com."
            eyebrow="Live provider view"
            title="Cal.com booking queues"
          />
          <StatusPill
            tone={adminBookings.status === "available" ? "positive" : "warning"}
          >
            {adminBookings.status === "available"
              ? "Live"
              : adminBookings.status === "not-configured"
                ? "Setup needed"
                : "Unavailable"}
          </StatusPill>
        </div>

        {adminBookings.status === "available" ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {(["unconfirmed", "upcoming", "past", "cancelled"] as const).map(
              (queue) => (
                <BookingQueue
                  bookings={adminBookings.queues[queue]}
                  hasMore={adminBookings.hasMore[queue]}
                  key={queue}
                  queue={queue}
                />
              )
            )}
          </div>
        ) : adminBookings.status === "local-preview" ? (
          <div className="mt-5">
            <EmptyState
              description="The signed local design preview never reads private attendee records. Sign in to the deployed HWL admin to see Shannon’s verified Cal.com queues."
              icon={CalendarClock}
              title="Private bookings stay locked"
            />
          </div>
        ) : adminBookings.status === "not-configured" ? (
          <div className="mt-5">
            <EmptyState
              description="Add a private CALCOM_API_KEY to this server environment to show Shannon’s real unconfirmed, upcoming, past, and cancelled queues here. Until then, Cal.com remains the safe management path."
              icon={CalendarClock}
              title="Live booking access is not connected"
            />
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              description={
                adminBookings.reason === "account-mismatch"
                  ? "The configured API key does not belong to Shannon’s canonical HWLbySMD Cal.com account, so no attendee data is shown. Replace it with the correct account key in the server environment."
                  : "The private Cal.com booking request failed closed, so no partial or guessed appointment data is shown. Use Cal.com directly and retry this page later."
              }
              icon={RefreshCw}
              title="Live bookings could not be verified"
            />
          </div>
        )}
      </AdminPanel>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminPanel>
          <div className="flex flex-col gap-4 border-b border-[#d9d3c8] pb-5 sm:flex-row sm:items-start sm:justify-between">
            <PanelHeading
              detail="No sample client names or appointments are shown here."
              eyebrow="Authoritative schedule"
              title="Today in Cal.com"
            />
            <StatusPill tone={catalogReady ? "positive" : "warning"}>
              {catalogReady
                ? `${publishedCount} services published`
                : "Catalog check needed"}
            </StatusPill>
          </div>

          <ol className="mt-5 space-y-4">
            {[
              {
                detail:
                  "Review the live unconfirmed and upcoming queues above, or open Cal.com for the complete provider view.",
                title: "Review requests",
              },
              {
                detail:
                  "Confirm, reschedule, cancel, or update an attendee only in Cal.com.",
                title: "Manage the appointment",
              },
              {
                detail:
                  "After the session, send the appropriate Stripe invoice or payment link. This handoff is manual for launch.",
                title: "Collect payment afterward",
              },
            ].map(({ detail, title }, index) => (
              <li className="flex gap-4" key={title}>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#273029] text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-[#344038]">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-[#59645b]">
                    {detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-wrap gap-2">
            <a
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#cfc5b6] bg-white/55 px-4 text-xs font-medium text-[#5f503f] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5f503f]"
              href={CALCOM_BOOKINGS_URL}
              rel="noreferrer"
              target="_blank"
            >
              Manage schedule
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
            {stripeInvoicesUrl ? (
              <a
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#cfc5b6] bg-white/55 px-4 text-xs font-medium text-[#5f503f] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5f503f]"
                href={stripeInvoicesUrl}
                rel="noreferrer"
                target="_blank"
              >
                Create invoice
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            ) : (
              <Link
                className="inline-flex min-h-10 items-center rounded-full border border-[#cfc5b6] bg-white/55 px-4 text-xs font-medium text-[#5f503f] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5f503f]"
                href="/admin/store"
              >
                Review Money setup
              </Link>
            )}
            <Link
              className="inline-flex min-h-10 items-center rounded-full border border-[#cfc5b6] bg-white/55 px-4 text-xs font-medium text-[#5f503f] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5f503f]"
              href="/book"
            >
              Preview client booking
            </Link>
          </div>
        </AdminPanel>

        <AdminPanel>
          <PanelHeading
            detail="The website should never imply that a sync exists when it does not."
            eyebrow="HWL history"
            title="Client booking records"
          />
          <div className="mt-5">
            {bookingLedgerReady ? (
              <div className="rounded-2xl border border-[#bfcbbd] bg-[#eef3eb] p-5">
                <div className="flex gap-3">
                  <ShieldCheck
                    className="mt-0.5 size-4 shrink-0 text-[#526b4f]"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium text-[#344038]">
                      Booking-history sync is enabled
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#667066]">
                      HWL can retain the minimal booking history needed for a
                      client account. Cal.com still owns every scheduling
                      change.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                description="The Cal.com booking-history webhook and Production ledger are not active in this environment. Manage appointments in Cal.com; no substitute records are invented here."
                icon={RefreshCw}
                title="History sync is not active"
              />
            )}
          </div>
        </AdminPanel>
      </div>

      <AdminPanel className="mt-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <PanelHeading
            detail="A public catalog check confirms only what clients can see; it does not read private appointments."
            eyebrow="Service catalog"
            title="Bookable experiences"
          />
          <StatusPill tone={confirmationCount ? "positive" : "warning"}>
            {confirmationCount
              ? `${confirmationCount} require Shannon’s confirmation`
              : "Confirmation policy needs review"}
          </StatusPill>
        </div>

        {catalogReady ? (
          <details className="mt-5 rounded-2xl border border-[#ddd7cd] bg-white/25 px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium text-[#455047] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#455047]">
              Review {publishedCount} published services
            </summary>
            <ul className="mt-4 grid gap-2 border-t border-[#ddd7cd] pt-4 sm:grid-cols-2">
              {calcom.eventTypes.map((service) => (
                <li
                  className="flex items-center justify-between gap-3 rounded-xl bg-[#f5f0e8]/75 px-3 py-2.5"
                  key={service.id}
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-[#455047]">
                      {service.title}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#757e76]">
                      {service.lengthInMinutes} minutes
                    </p>
                  </div>
                  <StatusPill
                    tone={service.confirmationRequired ? "positive" : "warning"}
                  >
                    {service.confirmationRequired ? "Confirm" : "Automatic"}
                  </StatusPill>
                </li>
              ))}
            </ul>
          </details>
        ) : (
          <div className="mt-5 rounded-2xl border border-[#dfcdb9] bg-[#f6eee4] p-5 text-sm text-[#725c44]">
            The Cal.com public catalog could not be read. Open Cal.com before
            relying on new availability.
          </div>
        )}
      </AdminPanel>

      <AdminPanel className="mt-5 border-[#d6c6b3] bg-[#f1e8dc]/75">
        <div className="flex gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#9d8464]/12 text-[#806443]">
            <CircleDollarSign className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium text-[#455047]">
              Payment after the appointment is the launch policy
            </p>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-[#59645b]">
              A booking can be confirmed without payment. Shannon completes the
              session, then sends a Stripe invoice or payment link. Automatic
              post-session billing and a unified client payment history are not
              active yet.
            </p>
          </div>
        </div>
      </AdminPanel>
    </>
  )
}
