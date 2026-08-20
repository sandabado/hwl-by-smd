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
import { JourneyPauseControl } from "@/components/member/journey-pause-control"
import { MemberNavigation } from "@/components/member/member-navigation"
import { Button } from "@/components/ui/button"
import { requireAccess } from "@/lib/access"
import { getMemberConnectionSnapshot } from "@/lib/connection-engine"
import { getPublishedCourses } from "@/lib/member-content"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "The Den | HWL by SMD",
  description: "Your private HWL ritual library.",
}

export default async function TheDenPage() {
  const { access, user } = await requireAccess("any_purchase", "/the-den")
  const [courses, connection] = await Promise.all([
    getPublishedCourses(),
    getMemberConnectionSnapshot(),
  ])
  const visibleCourses = courses.filter(
    (course) =>
      access.isMember || (course.access_tier === "lift" && access.canAccessLift)
  )
  const firstName =
    String(user.user_metadata.full_name ?? "").split(" ")[0] || "love"
  const today = visibleCourses[0]
  const activeJourneys = connection.data.enrollments.filter((enrollment) =>
    ["active", "paused", "pending"].includes(enrollment.status)
  )
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
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs tracking-[0.3em] text-[var(--accent)] uppercase">
              The Den
            </p>
            <h1 className="mt-3 text-5xl font-medium text-[var(--primary)] md:text-7xl">
              Welcome back, {firstName}.
            </h1>
          </div>
          <MemberNavigation hasMembership={access.isMember} />
        </div>

        <p className="mt-5 text-xl tracking-wide text-[var(--muted-foreground)]">
          Continue your ritual.
        </p>
        <p className="mt-4 max-w-3xl leading-relaxed text-[var(--muted-foreground)]">
          Your practices. Your courses. Your private line to Shannon. Nothing
          here is urgent. Everything here is yours.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
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
              {today?.title ?? "Your next practice is taking shape."}
            </h2>
            <p className="mt-6 max-w-xl leading-relaxed opacity-85">
              {today?.description ??
                "Shannon is preparing the first private practice for your library."}
            </p>
            {today && (
              <Button
                asChild
                className="mt-9 h-12 rounded-full bg-[var(--background)] px-7 text-[var(--primary)] hover:bg-[var(--accent)] hover:text-white"
              >
                <Link href={`/course/${today.slug}`}>
                  <Play aria-hidden="true" />
                  Continue Watching
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
                Make space for yourself.
              </h2>
              <p className="mt-3 text-sm leading-[1.8] text-[var(--muted-foreground)]">
                Your private sessions and requests will rest here when one is
                scheduled.
              </p>
              <Link
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)]"
                href="/book"
              >
                Book with Shannon <ArrowRight className="size-4" />
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
              {access.isMember ? (
                <Link
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)]"
                  href="/the-den/connection"
                >
                  Open Connection Hub <ArrowRight className="size-4" />
                </Link>
              ) : (
                <Link
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)]"
                  href="/store#the-den"
                >
                  Explore Den membership <ArrowRight className="size-4" />
                </Link>
              )}
            </article>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="relative overflow-hidden rounded-[2rem] bg-[var(--primary)] p-7 text-white md:p-9">
            <div
              aria-hidden="true"
              className="absolute inset-0 [background-image:radial-gradient(circle_at_85%_15%,rgba(220,197,165,0.35),transparent_35%)] opacity-20"
            />
            <div className="relative">
              <p className="text-xs tracking-[0.24em] text-[var(--accent-on-dark)] uppercase">
                Your journeys
              </p>
              <h2 className="mt-3 text-4xl text-white">Move at your pace.</h2>
              {activeJourneys.length ? (
                <div className="mt-7 divide-y divide-white/10">
                  {activeJourneys.slice(0, 3).map((enrollment) => {
                    const completed = Math.max(
                      0,
                      Math.min(
                        enrollment.milestone_count,
                        enrollment.next_milestone_position - 1
                      )
                    )
                    const progress = enrollment.milestone_count
                      ? (completed / enrollment.milestone_count) * 100
                      : 0

                    return (
                      <div
                        className="grid gap-4 py-5 sm:grid-cols-[1fr_auto] sm:items-center"
                        key={enrollment.id}
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-white">
                              {enrollment.journey.name}
                            </p>
                            <span className="rounded-full border border-white/15 px-2 py-0.5 text-[9px] tracking-wide text-white/55 uppercase">
                              {enrollment.status}
                            </span>
                          </div>
                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-[var(--accent-on-dark)] transition-[width] duration-700"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="mt-2 text-[10px] text-white/45">
                            {completed} of {enrollment.milestone_count} moments
                          </p>
                        </div>
                        <JourneyPauseControl
                          initialStatus={
                            enrollment.status as "active" | "paused" | "pending"
                          }
                          journeyId={enrollment.journey_id}
                        />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="mt-5 max-w-lg text-sm leading-[1.8] text-white/55">
                  No guided journey is asking for your attention. The quiet is
                  part of the practice.
                </p>
              )}
            </div>
          </article>

          <article className="den-card rounded-[2rem] p-7 md:p-9">
            <HeartHandshake
              className="size-5 text-[var(--accent)]"
              aria-hidden="true"
            />
            <p className="mt-6 text-xs tracking-[0.24em] text-[var(--muted-foreground)] uppercase">
              Membership
            </p>
            <h2 className="mt-3 text-4xl text-[var(--primary)]">
              {access.isMember ? "The Den is active." : "Your private access"}
            </h2>
            <p className="mt-4 text-sm leading-[1.8] text-[var(--muted-foreground)]">
              {access.isMember
                ? renewalDate
                  ? `Your current period continues through ${renewalDate}.`
                  : "Your library and Connection Hub are open."
                : "Your purchased practices remain available in your library."}
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
              Shannon is filming now.
            </p>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              Your first guided ritual will appear here as soon as it is ready.
            </p>
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
