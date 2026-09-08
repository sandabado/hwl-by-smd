import Link from "next/link"

import { BookingRequestFlow } from "@/components/booking/booking-request-flow"
import { CtaBlock } from "@/components/shared/cta-block"
import { resolveCalcomBookingOptions } from "@/lib/calcom-booking-links"
import { getCalcomPublicEventTypes } from "@/lib/calcom"
import { normalizeBookingServiceSlug } from "@/lib/booking-services"
import { isInquiryCollectionReady } from "@/lib/inquiries/readiness"
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
  searchParams: Promise<{ service?: string | string[] }>
}) {
  const [params, calcomResult] = await Promise.all([
    searchParams,
    getCalcomPublicEventTypes(),
  ])
  const inquiryCollectionReady = isInquiryCollectionReady()
  const calBookingOptionsByServiceSlug =
    resolveCalcomBookingOptions(calcomResult)
  const initialServiceSlug = normalizeBookingServiceSlug(params.service)

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
      <section className="relative -mt-16 overflow-hidden border-b border-[var(--border)] px-5 pt-20 pb-3 sm:px-6 sm:pb-4 md:-mt-20 md:pt-24 md:pb-5">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(157,187,148,0.18),transparent_34%),radial-gradient(circle_at_85%_75%,rgba(225,191,149,0.16),transparent_36%)]"
        />
        <div className="relative mx-auto max-w-7xl">
          <div>
            <p className="hidden text-xs font-medium tracking-[0.28em] text-[var(--accent)] uppercase sm:block">
              Book
            </p>
            <h1 className="text-2xl leading-tight font-medium text-[var(--primary)] sm:mt-1 sm:text-3xl md:text-4xl">
              Book with Shannon
            </h1>
            <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-[var(--muted-foreground)]">
              <span className="sm:hidden">
                Choose a session and see Shannon&apos;s live availability.
              </span>
              <span className="hidden sm:inline">
                {inquiryCollectionReady
                  ? "Choose a session, see Shannon’s live availability, and complete the details in one clear flow."
                  : "Choose a session and see Shannon’s live availability. Custom arrangements include a direct way to email her."}
              </span>
            </p>
          </div>
          <p className="mt-2 hidden text-xs leading-relaxed text-[var(--muted-foreground)] sm:block">
            Virtual readings · In-person desert care · Larger gatherings under{" "}
            <Link className="underline underline-offset-4" href="/retreats">
              Retreats
            </Link>
            .
          </p>
        </div>
      </section>

      <BookingRequestFlow
        calBookingOptionsByServiceSlug={calBookingOptionsByServiceSlug}
        initialServiceSlug={initialServiceSlug}
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
