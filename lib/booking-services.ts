export type BookingPillarId = "beauty" | "movement" | "ritual"

export type CalendarBooking =
  | {
      durationMinutes: number
      kind: "exact-event"
    }
  | {
      kind: "inquiry-only"
      reason: "group-duration-unconfirmed"
    }

export type BookingService = {
  calendarBooking: CalendarBooking
  description: string
  duration: string
  format:
    | "In person"
    | "In person · HWL Beauty"
    | "Virtual"
    | "Virtual or in person"
  guestRange: {
    maximum?: number
    minimum: number
  }
  locationPolicy:
    | { kind: "attendee-address" }
    | { kind: "fixed"; label: "HWL Beauty" }
    | { kind: "virtual-or-attendee-address" }
  payment: {
    basis: "flat" | "per_guest"
    currency: "usd"
    unitAmountMinor: number
  }
  price: string
  slug: string
  title: string
}

export type BookingPillar = {
  description: string
  format: string
  id: BookingPillarId
  services: readonly BookingService[]
  title: string
}

export const bookingPillars: readonly BookingPillar[] = [
  {
    id: "beauty",
    title: "Beauty",
    description: "Skin as landscape.",
    format: "In-person care",
    services: [
      {
        calendarBooking: { durationMinutes: 20, kind: "exact-event" },
        slug: "wild-glow-express-facial",
        title: "Wild Glow Express Facial",
        duration: "20 min",
        price: "$111",
        format: "In person · HWL Beauty",
        guestRange: { maximum: 1, minimum: 1 },
        locationPolicy: { kind: "fixed", label: "HWL Beauty" },
        description:
          "A focused facial ritual for fresh, luminous skin when time is brief.",
        payment: {
          basis: "flat",
          currency: "usd",
          unitAmountMinor: 11100,
        },
      },
      {
        calendarBooking: { durationMinutes: 45, kind: "exact-event" },
        slug: "reiki-aromatherapy-healing",
        title: "Reiki Aromatherapy Healing",
        duration: "30–45 min",
        price: "$222",
        format: "In person · HWL Beauty",
        guestRange: { maximum: 1, minimum: 1 },
        locationPolicy: { kind: "fixed", label: "HWL Beauty" },
        description:
          "A quiet blend of aromatherapy and Reiki held at an unhurried pace.",
        payment: {
          basis: "flat",
          currency: "usd",
          unitAmountMinor: 22200,
        },
      },
      {
        calendarBooking: { durationMinutes: 60, kind: "exact-event" },
        slug: "signature-facial",
        title: "Signature Facial",
        duration: "60 min",
        price: "$277",
        format: "In person · HWL Beauty",
        guestRange: { maximum: 1, minimum: 1 },
        locationPolicy: { kind: "fixed", label: "HWL Beauty" },
        description:
          "Personalized professional skin care with massage and room to soften.",
        payment: {
          basis: "flat",
          currency: "usd",
          unitAmountMinor: 27700,
        },
      },
      {
        calendarBooking: { durationMinutes: 90, kind: "exact-event" },
        slug: "beauty-being-ritual",
        title: "Beauty & Being Ritual",
        duration: "90 min",
        price: "$333",
        format: "In person · HWL Beauty",
        guestRange: { maximum: 1, minimum: 1 },
        locationPolicy: { kind: "fixed", label: "HWL Beauty" },
        description:
          "An extended facial and restorative ritual for skin, senses, and stillness.",
        payment: {
          basis: "flat",
          currency: "usd",
          unitAmountMinor: 33300,
        },
      },
      {
        calendarBooking: { durationMinutes: 120, kind: "exact-event" },
        slug: "wild-glow-luxury-facial",
        title: "Wild Glow Luxury Facial",
        duration: "120 min",
        price: "$444",
        format: "In person · HWL Beauty",
        guestRange: { maximum: 1, minimum: 1 },
        locationPolicy: { kind: "fixed", label: "HWL Beauty" },
        description:
          "Shannon’s most spacious facial experience, shaped as a complete ceremony of care.",
        payment: {
          basis: "flat",
          currency: "usd",
          unitAmountMinor: 44400,
        },
      },
    ],
  },
  {
    id: "movement",
    title: "Movement",
    description: "Move at your own rhythm.",
    format: "Private, in-person sessions",
    services: [
      {
        calendarBooking: { durationMinutes: 60, kind: "exact-event" },
        slug: "private-yoga-and-sound",
        title: "Private Yoga + Sound",
        duration: "60 min · up to 4 guests",
        price: "$555",
        format: "In person",
        guestRange: { maximum: 4, minimum: 1 },
        locationPolicy: { kind: "attendee-address" },
        description:
          "Breath-led private movement followed by a restorative sound experience.",
        payment: {
          basis: "flat",
          currency: "usd",
          unitAmountMinor: 55500,
        },
      },
      {
        calendarBooking: { durationMinutes: 75, kind: "exact-event" },
        slug: "private-sound-healing",
        title: "Private Sound Healing",
        duration: "60–75 min · up to 8 guests",
        price: "$444",
        format: "In person",
        guestRange: { maximum: 8, minimum: 1 },
        locationPolicy: { kind: "attendee-address" },
        description:
          "A private sound practice designed for rest, reflection, and spacious attention.",
        payment: {
          basis: "flat",
          currency: "usd",
          unitAmountMinor: 44400,
        },
      },
      {
        calendarBooking: { durationMinutes: 90, kind: "exact-event" },
        slug: "private-yoga",
        title: "Private Yoga",
        duration: "75–90 min · 2–4 guests",
        price: "$666",
        format: "In person",
        guestRange: { maximum: 4, minimum: 2 },
        locationPolicy: { kind: "attendee-address" },
        description:
          "A private practice shaped around your body, breath, experience, and energy that day.",
        payment: {
          basis: "flat",
          currency: "usd",
          unitAmountMinor: 66600,
        },
      },
    ],
  },
  {
    id: "ritual",
    title: "Ritual",
    description: "A mirror, not a map.",
    format: "Virtual + in-person care",
    services: [
      {
        calendarBooking: { durationMinutes: 60, kind: "exact-event" },
        slug: "intuitive-tarot-reading",
        title: "Intuitive Tarot Reading",
        duration: "45–60 min",
        price: "$222",
        format: "Virtual or in person",
        guestRange: { maximum: 1, minimum: 1 },
        locationPolicy: { kind: "virtual-or-attendee-address" },
        description:
          "Reflective card work for transitions, choices, patterns, and the season you are in.",
        payment: {
          basis: "flat",
          currency: "usd",
          unitAmountMinor: 22200,
        },
      },
      {
        calendarBooking: { durationMinutes: 60, kind: "exact-event" },
        slug: "moon-oracle-reading",
        title: "Moon Oracle Reading",
        duration: "45–60 min",
        price: "$222",
        format: "Virtual or in person",
        guestRange: { maximum: 1, minimum: 1 },
        locationPolicy: { kind: "virtual-or-attendee-address" },
        description:
          "A lunar and astrological reading for reflection, timing, and present-season clarity.",
        payment: {
          basis: "flat",
          currency: "usd",
          unitAmountMinor: 22200,
        },
      },
      {
        calendarBooking: { durationMinutes: 75, kind: "exact-event" },
        slug: "tarot-and-reiki",
        title: "Tarot + Reiki Experience",
        duration: "60–75 min",
        price: "$444",
        format: "In person",
        guestRange: { maximum: 1, minimum: 1 },
        locationPolicy: { kind: "attendee-address" },
        description:
          "Intuitive guidance followed by restorative Reiki support in person.",
        payment: {
          basis: "flat",
          currency: "usd",
          unitAmountMinor: 44400,
        },
      },
    ],
  },
] as const

export type BookingHref = `/book?service=${string}#choose-time`

export type BookingServiceAction =
  | Readonly<{
      href: BookingHref
      kind: "book"
      label: "Choose a time"
    }>
  | Readonly<{
      href: BookingHref
      kind: "inquire"
      label: "Request this group ritual"
    }>

export function getBookingPillar(id: BookingPillarId): BookingPillar {
  const pillar = bookingPillars.find((item) => item.id === id)

  if (!pillar) {
    throw new Error(`Unknown booking pillar: ${id}`)
  }

  return pillar
}

export function getBookingHref(slug: BookingService["slug"]): BookingHref {
  return `/book?service=${slug}#choose-time`
}

export function getBookingServiceAction(
  service: BookingService
): BookingServiceAction {
  const href = getBookingHref(service.slug)

  if (service.calendarBooking.kind === "inquiry-only") {
    return {
      href,
      kind: "inquire",
      label: "Request this group ritual",
    }
  }

  return {
    href,
    kind: "book",
    label: "Choose a time",
  }
}

export function findBookingService(serviceSlug?: string) {
  if (!serviceSlug) return null

  for (const pillar of bookingPillars) {
    const service = pillar.services.find((item) => item.slug === serviceSlug)
    if (service) return { pillar, service }
  }

  return null
}

export function normalizeBookingServiceSlug(
  service: string | string[] | undefined
) {
  const candidate = Array.isArray(service) ? service[0] : service
  const normalized = candidate?.trim()

  return normalized || undefined
}

export function getInitialBookingStep(serviceSlug?: string) {
  return findBookingService(serviceSlug) ? "schedule" : "experience"
}

export function isExactCalEventForBookingService(
  service: BookingService,
  eventType: {
    lengthInMinutes: number
    slug: string
    title: string
  }
) {
  if (service.calendarBooking.kind !== "exact-event") return false

  return (
    eventType.slug === service.slug &&
    eventType.lengthInMinutes === service.calendarBooking.durationMinutes &&
    eventType.title.trim() === service.title
  )
}
