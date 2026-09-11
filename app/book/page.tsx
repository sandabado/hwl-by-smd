import Link from "next/link"

import { BookingRequestFlow } from "@/components/booking/booking-request-flow"
import { getAuthenticatedUser } from "@/lib/access"
import { resolveCalcomBookingOptions } from "@/lib/calcom-booking-links"
import { getCalcomPublicEventTypes } from "@/lib/calcom"
import { normalizeBookingServiceSlug } from "@/lib/booking-services"
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
  const [params, calcomResult, user] = await Promise.all([
    searchParams,
    getCalcomPublicEventTypes(),
    getAuthenticatedUser(),
  ])
  const calBookingOptionsByServiceSlug =
    resolveCalcomBookingOptions(calcomResult)
  const initialServiceSlug = normalizeBookingServiceSlug(params.service)
  const attendee =
    user?.email && user.email_confirmed_at
      ? {
          email: user.email,
          ...(typeof user.user_metadata.full_name === "string" &&
          user.user_metadata.full_name.trim()
            ? {
                name: user.user_metadata.full_name.trim().slice(0, 120),
              }
            : {}),
        }
      : undefined

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
      <BookingRequestFlow
        attendee={attendee}
        calBookingOptionsByServiceSlug={calBookingOptionsByServiceSlug}
        initialServiceSlug={initialServiceSlug}
        minimumDate={minimumDate}
      />

      <aside className="bg-[#f7f3ec] px-6 py-10 text-center">
        <p className="text-sm text-[var(--muted-foreground)]">
          Not sure what to choose?{" "}
          <Link
            className="font-medium text-[var(--primary)] underline underline-offset-4 hover:text-[var(--accent)] focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:outline-none"
            href="/contact"
          >
            Ask Shannon.
          </Link>
        </p>
      </aside>
    </>
  )
}
