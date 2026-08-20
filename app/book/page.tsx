import Link from "next/link"

import { BookingRequestFlow } from "@/components/booking/booking-request-flow"
import { CtaBlock } from "@/components/shared/cta-block"
import { findBookingService } from "@/lib/booking-services"
import { getCalcomPublicEventTypes } from "@/lib/calcom"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Book with Shannon | HWL by SMD",
  description:
    "Request virtual tarot and oracle readings or in-person beauty, yoga, sound, Reiki, and ritual sessions with Shannon Mary Dixon.",
  path: "/book",
})

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>
}) {
  const [params, calcomResult] = await Promise.all([
    searchParams,
    getCalcomPublicEventTypes(),
  ])
  const liveCalEventTypes = calcomResult.eventTypes.filter((eventType) =>
    Boolean(findBookingService(eventType.slug))
  )
  const palmSpringsDateParts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Los_Angeles",
    year: "numeric",
  })
    .formatToParts(new Date())
    .reduce<Record<string, string>>((parts, part) => {
      if (part.type !== "literal") parts[part.type] = part.value
      return parts
    }, {})
  const minimumDate = `${palmSpringsDateParts.year}-${palmSpringsDateParts.month}-${palmSpringsDateParts.day}`

  return (
    <>
      <section className="relative -mt-16 overflow-hidden px-5 pt-24 pb-6 sm:px-6 md:-mt-20 md:pt-28 md:pb-7">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(157,187,148,0.18),transparent_34%),radial-gradient(circle_at_85%_75%,rgba(225,191,149,0.16),transparent_36%)]"
        />
        <div className="relative mx-auto flex max-w-7xl flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-medium tracking-[0.28em] text-[var(--accent)] uppercase">
              Book
            </p>
            <h1 className="mt-2 text-4xl leading-tight font-medium text-[var(--primary)] md:text-5xl">
              Book with Shannon
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)] md:text-base">
              Choose your experience, then select a live opening when it is
              available—or ask Shannon for the next one.
            </p>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-[var(--muted-foreground)] md:text-right md:text-sm">
            Virtual readings are available from anywhere. In-person sessions are
            offered in the Coachella Valley. Group experiences live under{" "}
            <Link className="underline underline-offset-4" href="/retreats">
              Retreats
            </Link>
            .
          </p>
        </div>
      </section>

      <BookingRequestFlow
        initialServiceSlug={params.service}
        liveCalEventTypes={liveCalEventTypes}
        minimumDate={minimumDate}
      />

      <CtaBlock
        primaryHref="/contact"
        primaryLabel="Contact Shannon"
        secondaryHref="/beauty"
        secondaryLabel="Explore Beauty"
        subtitle="Share what you want to feel when the experience is complete, and Shannon can help you choose."
        title="Not sure which service fits?"
      />
    </>
  )
}
