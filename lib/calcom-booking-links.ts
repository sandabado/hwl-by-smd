import "server-only"

import {
  findBookingService,
  isExactCalEventForBookingService,
} from "@/lib/booking-services"
import { type CalcomPublicEventTypesResult } from "@/lib/calcom"

export type CalcomBookingOption = Readonly<{
  currency: string | null
  paymentState: "not_required"
  priceMinor: 0
  url: string
}>

export function resolveCalcomBookingOptions(
  calcomResult: CalcomPublicEventTypesResult
): Readonly<Record<string, CalcomBookingOption>> {
  const optionsByServiceSlug: Record<string, CalcomBookingOption> = {}

  // Appointments are requests, not purchases: Shannon confirms the time and
  // sends payment after the completed session. Provider discovery must still
  // be exact; an outage never falls back to a guessed booking URL.
  if (calcomResult.status !== "available") {
    return optionsByServiceSlug
  }

  for (const eventType of calcomResult.eventTypes) {
    const bookingService = findBookingService(eventType.slug)?.service

    if (
      bookingService &&
      eventType.confirmationRequired &&
      eventType.price === 0 &&
      eventType.currency === bookingService.payment.currency &&
      isExactCalEventForBookingService(bookingService, eventType) &&
      bookingService.calendarBooking.kind === "exact-event"
    ) {
      optionsByServiceSlug[bookingService.slug] = {
        currency: eventType.currency,
        paymentState: "not_required",
        priceMinor: eventType.price,
        url: eventType.url,
      }
    }
  }

  return optionsByServiceSlug
}

export function resolveCalcomBookingLinks(
  calcomResult: CalcomPublicEventTypesResult
): Readonly<Record<string, string>> {
  return Object.fromEntries(
    Object.entries(resolveCalcomBookingOptions(calcomResult)).map(
      ([serviceSlug, option]) => [serviceSlug, option.url]
    )
  )
}
