import Link from "next/link"
import type { Metadata } from "next"
import {
  ArrowRight,
  CalendarHeart,
  Download,
  HeartHandshake,
  MessageCircleHeart,
  Play,
  Sparkles,
} from "lucide-react"

import { CourseCard } from "@/components/member/course-card"
import { DenShortcuts } from "@/components/member/den-links"
import { Button } from "@/components/ui/button"
import { requireAccess } from "@/lib/access"
import {
  findNextMemberBooking,
  getMemberBookings,
} from "@/lib/bookings/member-bookings"
import { getPublishedCourses } from "@/lib/member-content"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "The Den | HWL by SMD",
  description: "Your private HWL sessions and ritual library.",
}

function readableSessionDate(value: string, timeZone: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone,
    }).format(new Date(value))
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "America/Los_Angeles",
    }).format(new Date(value))
  }
}

export default async function TheDenPage() {
  const { access, user } = await requireAccess("authenticated", "/the-den")
  const [courses, bookings] = await Promise.all([
    getPublishedCourses(),
    getMemberBookings(user.id),
  ])
  const visibleCourses = courses.filter(
    (course) =>
      access.isMember || (course.access_tier === "lift" && access.canAccessLift)
  )
  const firstName =
    String(user.user_metadata.full_name ?? "").split(" ")[0] || "love"
  const today = visibleCourses[0]
  const nextSession = findNextMemberBooking(bookings)
  const renewalDate = access.membership?.current_period_end
    ? new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(access.membership.current_period_end))
    : null

  return (
    <section className="member-atmosphere relative min-h-screen overflow-hidden px-6 py-12 md:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_12%_8%,rgba(196,168,130,0.25),transparent_34%),radial-gradient(circle_at_88%_68%,rgba(112,82,104,0.14),transparent_38%),repeating-linear-gradient(115deg,transparent_0,transparent_12px,rgba(43,39,36,0.015)_13px)] opacity-30"
      />
      <div className="mx-auto max-w-7xl">
        <div>
          <p className="text-xs tracking-[0.3em] text-[var(--accent)] uppercase">
            The Den
          </p>
          <h1 className="mt-3 text-5xl font-medium text-[var(--primary)] md:text-7xl">
            Welcome back, {firstName}.
          </h1>
        </div>

        <p className="mt-5 text-xl tracking-wide text-[var(--muted-foreground)]">
          Continue your ritual.
        </p>
        <p className="mt-4 max-w-3xl leading-relaxed text-[var(--muted-foreground)]">
          Your practices. Your courses. Nothing here is urgent. Everything here
          is yours.
        </p>

        <DenShortcuts />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <article className="relative overflow-hidden rounded-[2.25rem] bg-[var(--primary)] p-8 text-[var(--background)] shadow-[0_35px_90px_rgba(90,74,63,0.2)] md:p-12">
            <div className="absolute -top-20 -right-16 size-64 rounded-full border border-white/10" />
            <div className="absolute -top-8 -right-4 size-40 rounded-full border border-white/10" />
            <Sparkles
              className="size-5 text-[var(--accent-on-dark)]"
              aria-hidden="true"
            />
            <p className="mt-8 text-xs tracking-[0.28em] text-[var(--accent-on-dark)] uppercase">
              Today&apos;s ritual
            </p>
            <h2 className="mt-4 max-w-2xl text-5xl leading-none font-medium md:text-6xl">
              {today?.title ??
                (access.canDownloadLift
                  ? "Your LIFT guide is here."
                  : "Begin with LIFT.")}
            </h2>
            <p className="mt-6 max-w-xl leading-relaxed opacity-85">
              {today?.description ??
                (access.canDownloadLift
                  ? "Return to the printable ritual whenever you want a quiet, guided moment with your skin."
                  : "A complete facial massage ritual with Shannon, including the guided video and printable guide.")}
            </p>
            {today ? (
              <Button
                asChild
                className="mt-9 h-12 rounded-full bg-[var(--background)] px-7 text-[var(--primary)] hover:bg-[var(--accent)] hover:text-white"
              >
                <Link href={`/course/${today.slug}`}>
                  <Play aria-hidden="true" />
                  Continue Watching
                </Link>
              </Button>
            ) : access.canDownloadLift ? (
              <Button
                asChild
                className="mt-9 h-12 rounded-full bg-[var(--background)] px-7 text-[var(--primary)] hover:bg-[var(--accent)] hover:text-white"
              >
                <Link href="/api/download/lift">
                  <Download aria-hidden="true" />
                  Open Your Guide
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                className="mt-9 h-12 rounded-full bg-[var(--background)] px-7 text-[var(--primary)] hover:bg-[var(--accent)] hover:text-white"
              >
                <Link href="/beauty/lift">
                  <Sparkles aria-hidden="true" />
                  Discover LIFT
                </Link>
              </Button>
            )}
          </article>

          <div className="grid gap-6">
            <article className="den-card rounded-[2rem] p-7">
              <CalendarHeart
                className="size-5 text-[var(--accent)]"
                aria-hidden="true"
              />
              <p className="mt-5 text-xs tracking-[0.24em] text-[var(--muted-foreground)] uppercase">
                Your next session
              </p>
              <h2 className="mt-3 text-3xl text-[var(--primary)]">
                {nextSession?.serviceTitle ?? "Make space for yourself."}
              </h2>
              <p className="mt-3 text-sm leading-[1.8] text-[var(--muted-foreground)]">
                {nextSession
                  ? `${readableSessionDate(nextSession.startAt, nextSession.timeZone)} · ${nextSession.bookingStatus === "confirmed" ? "Confirmed" : "Awaiting Shannon’s confirmation"}`
                  : "Your private sessions and requests will rest here when one is scheduled."}
              </p>
              <Link
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)]"
                href={nextSession ? "/the-den/sessions" : "/book"}
              >
                {nextSession ? "View session" : "Book with Shannon"}{" "}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </article>

            <article className="den-card rounded-[2rem] p-7">
              <MessageCircleHeart
                className="size-5 text-[var(--accent)]"
                aria-hidden="true"
              />
              <p className="mt-5 text-xs tracking-[0.24em] text-[var(--muted-foreground)] uppercase">
                A note from Shannon
              </p>
              <p className="mt-3 font-serif text-2xl leading-relaxed text-[var(--primary)] italic">
                “Let consistency be an act of devotion, not pressure.”
              </p>
              <Link
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)]"
                href="/contact"
              >
                Contact Shannon <ArrowRight className="size-4" />
              </Link>
            </article>
          </div>
        </div>

        <div className="mt-8">
          <article className="den-card rounded-[2rem] p-7 md:p-9">
            <HeartHandshake
              className="size-5 text-[var(--accent)]"
              aria-hidden="true"
            />
            <p className="mt-6 text-xs tracking-[0.24em] text-[var(--muted-foreground)] uppercase">
              Access
            </p>
            <h2 className="mt-3 text-4xl text-[var(--primary)]">
              {access.isMember
                ? "The Den is active."
                : bookings.length
                  ? "Your session history is ready."
                  : "Your private access"}
            </h2>
            <p className="mt-4 text-sm leading-[1.8] text-[var(--muted-foreground)]">
              {access.isMember
                ? renewalDate
                  ? `Your current period continues through ${renewalDate}.`
                  : "Your private library is open."
                : access.hasAnyPurchase
                  ? "Your purchased practices remain available in your library."
                  : bookings.length
                    ? "Your confirmed and past session records stay together here in your account."
                    : "Your account is ready for sessions and practices whenever you are."}
            </p>
            <Link
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] underline-offset-4 hover:underline"
              href="/account"
            >
              Manage your access{" "}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </article>
        </div>

        <div className="mt-16 flex items-end justify-between gap-5">
          <div>
            <p className="text-xs tracking-[0.28em] text-[var(--accent)] uppercase">
              Your library
            </p>
            <h2 className="mt-3 text-5xl text-[var(--primary)]">
              Continue your practice
            </h2>
          </div>
          <Link
            className="hidden text-sm font-medium text-[var(--primary)] md:block"
            href="/library"
          >
            Browse all →
          </Link>
        </div>

        {visibleCourses.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleCourses.slice(0, 3).map((course) => (
              <CourseCard course={course} key={course.id} />
            ))}
          </div>
        ) : (
          <div className="den-card mt-8 rounded-[2rem] p-10 text-center">
            <p className="font-serif text-3xl text-[var(--primary)]">
              {access.canDownloadLift
                ? "Your LIFT guide is here."
                : "Your library is ready."}
            </p>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              {access.canDownloadLift
                ? "Keep the printable ritual close whenever you want to return to the practice."
                : "Your purchased practices will gather here."}
            </p>
            {!access.canDownloadLift ? (
              <Link
                className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-[var(--primary)] underline underline-offset-4"
                href="/beauty/lift"
              >
                Discover LIFT
              </Link>
            ) : null}
          </div>
        )}
        {access.canDownloadLift && !access.canAccessLift && (
          <Link
            className="den-card mt-6 flex items-center justify-between rounded-[2rem] p-7 text-[var(--primary)]"
            href="/api/download/lift"
          >
            <div>
              <p className="text-xs tracking-[0.24em] text-[var(--accent)] uppercase">
                Your purchase
              </p>
              <p className="mt-2 font-serif text-3xl">LIFT Printable Guide</p>
            </div>
            <Download className="size-5" aria-hidden="true" />
          </Link>
        )}
      </div>
    </section>
  )
}
