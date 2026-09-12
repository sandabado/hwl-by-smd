import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ArrowRight, CalendarHeart, CalendarPlus, Clock3 } from "lucide-react"

import { BackToDenLink } from "@/components/member/den-links"
import { Button } from "@/components/ui/button"
import { requireAccess } from "@/lib/access"
import {
  getMemberBookings,
  isCalcomBookingLedgerReady,
  type MemberBooking,
} from "@/lib/bookings/member-bookings"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Your Sessions | HWL by SMD",
  description: "Your private HWL session history.",
}

function safeTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date())
    return timeZone
  } catch {
    return "America/Los_Angeles"
  }
}

function readableSessionDate(booking: MemberBooking) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: safeTimeZone(booking.timeZone),
  }).format(new Date(booking.startAt))
}

function bookingStatusLabel(booking: MemberBooking) {
  if (booking.bookingStatus === "cancelled") return "Cancelled"
  if (booking.bookingStatus === "rejected") return "Not confirmed"
  if (booking.bookingStatus === "requested") return "Awaiting confirmation"
  return "Confirmed"
}

function SessionCard({ booking }: { booking: MemberBooking }) {
  return (
    <article className="den-card rounded-[2rem] p-6 md:p-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-[var(--accent)] uppercase">
            {bookingStatusLabel(booking)}
          </p>
          <h2 className="mt-2 font-serif text-3xl leading-tight text-[var(--primary)]">
            {booking.serviceTitle}
          </h2>
        </div>
      </div>

      <div className="mt-6 grid gap-3 text-sm text-[var(--muted-foreground)] sm:grid-cols-2">
        <p className="flex items-start gap-2">
          <CalendarHeart
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[var(--accent)]"
          />
          {readableSessionDate(booking)}
        </p>
        <p className="flex items-start gap-2">
          <Clock3
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[var(--accent)]"
          />
          Times shown in {safeTimeZone(booking.timeZone)}
        </p>
      </div>

      {booking.bookingStatus === "requested" ? (
        <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">
          Shannon will confirm this request. Cal.com will email every status
          change to the address used at booking.
        </p>
      ) : null}
    </article>
  )
}

export default async function SessionsPage() {
  if (!isCalcomBookingLedgerReady()) notFound()

  const { user } = await requireAccess("authenticated", "/the-den/sessions")
  const bookings = await getMemberBookings(user.id)

  return (
    <section className="member-atmosphere min-h-screen px-6 py-12 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs tracking-[0.3em] text-[var(--accent)] uppercase">
              The Den
            </p>
            <h1 className="mt-3 text-5xl font-medium text-[var(--primary)] md:text-7xl">
              Your Sessions
            </h1>
          </div>
          <BackToDenLink />
        </div>

        <div className="mt-10 flex flex-col justify-between gap-5 rounded-[2rem] border border-white/65 bg-white/42 p-6 backdrop-blur md:flex-row md:items-center md:p-8">
          <div>
            <p className="font-serif text-2xl text-[var(--primary)]">
              Your time with Shannon, in one calm place.
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
              Appointments booked with this account email appear here after the
              secure Cal.com update is received.
            </p>
          </div>
          <Button asChild className="h-11 shrink-0 rounded-full px-5">
            <Link href="/book">
              <CalendarPlus aria-hidden="true" className="size-4" />
              Book a session
            </Link>
          </Button>
        </div>

        <div className="mt-12">
          <p className="text-xs tracking-[0.26em] text-[var(--accent)] uppercase">
            Appointments
          </p>
          {bookings.length ? (
            <div className="mt-5 grid gap-5">
              {bookings.map((booking) => (
                <SessionCard booking={booking} key={booking.id} />
              ))}
            </div>
          ) : (
            <div className="den-card mt-5 rounded-[2rem] p-8 md:p-10">
              <h2 className="font-serif text-3xl text-[var(--primary)]">
                No sessions here yet.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                Explore Shannon&apos;s live openings whenever you&apos;re ready.
              </p>
              <Link
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)]"
                href="/book"
              >
                See available sessions
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          )}
        </div>

        <p className="mt-10 text-xs leading-5 text-[var(--muted-foreground)]">
          Need to change a booking? Use the manage-booking link in your Cal.com
          confirmation email so the calendar remains accurate.
        </p>
      </div>
    </section>
  )
}
