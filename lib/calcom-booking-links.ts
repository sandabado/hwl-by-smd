import "server-only"

import {
  bookingPillars,
  findBookingService,
  isExactCalEventForBookingService,
} from "@/lib/booking-services"
import {
  buildCalcomEventUrl,
  type CalcomPublicEventTypesResult,
} from "@/lib/calcom"

export function resolveCalcomBookingLinks(
  calcomResult: CalcomPublicEventTypesResult
): Readonly<Record<string, string>> {
  const linksByServiceSlug: Record<string, string> = {}

  if (calcomResult.status === "available") {
    for (const eventType of calcomResult.eventTypes) {
      const bookingService = findBookingService(eventType.slug)?.service

      if (
        bookingService &&
        isExactCalEventForBookingService(bookingService, eventType)
      ) {
        linksByServiceSlug[bookingService.slug] = eventType.url
      }
    }

    return linksByServiceSlug
  }

  for (const pillar of bookingPillars) {
    for (const service of pillar.services) {
      if (service.calendarBooking.kind !== "exact-event") continue

      const fallbackUrl = buildCalcomEventUrl(service.slug)
      if (fallbackUrl) linksByServiceSlug[service.slug] = fallbackUrl
    }
  }

  return linksByServiceSlug
}
