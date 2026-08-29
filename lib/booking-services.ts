import { media } from "@/lib/media"

export type BookingPillarId = "beauty" | "movement" | "ritual"

export type BookingService = {
  description: string
  duration: string
  format: "In person" | "Virtual" | "Virtual or in person"
  image: { alt: string; src: string }
  price: string
  slug: string
  title: string
}

export type BookingPillar = {
  description: string
  format: string
  id: BookingPillarId
  image: { alt: string; src: string }
  services: readonly BookingService[]
  title: string
}

export const bookingPillars: readonly BookingPillar[] = [
  {
    id: "beauty",
    title: "Beauty",
    description: "Skin as landscape.",
    format: "In-person care",
    image: media.shannon.beautyPortrait,
    services: [
      {
        slug: "wild-glow-express-facial",
        title: "Wild Glow Express Facial",
        duration: "15–20 min · minimum 4 guests",
        price: "$111/guest",
        format: "In person",
        description:
          "A focused facial ritual for fresh, luminous skin when time is brief.",
        image: media.shannon.beautyLift,
      },
      {
        slug: "reiki-aromatherapy-healing",
        title: "Reiki Aromatherapy Healing",
        duration: "30–45 min",
        price: "$222/guest",
        format: "In person",
        description:
          "A quiet blend of aromatherapy and Reiki held at an unhurried pace.",
        image: media.shannon.botanicalPortrait,
      },
      {
        slug: "signature-facial",
        title: "Signature Facial",
        duration: "60 min",
        price: "$277/guest",
        format: "In person",
        description:
          "Personalized professional skin care with massage and room to soften.",
        image: media.shannon.beautyLift,
      },
      {
        slug: "beauty-being-ritual",
        title: "Beauty & Being Ritual",
        duration: "90 min",
        price: "$333/guest",
        format: "In person",
        description:
          "An extended facial and restorative ritual for skin, senses, and stillness.",
        image: media.shannon.beautyPortrait,
      },
      {
        slug: "wild-glow-luxury-facial",
        title: "Wild Glow Luxury Facial",
        duration: "120 min",
        price: "$444/guest",
        format: "In person",
        description:
          "Shannon’s most spacious facial experience, shaped as a complete ceremony of care.",
        image: media.shannon.beautyLift,
      },
    ],
  },
  {
    id: "movement",
    title: "Movement",
    description: "Move at your own rhythm.",
    format: "Private, in-person sessions",
    image: media.experiences.movementStretch,
    services: [
      {
        slug: "private-yoga-and-sound",
        title: "Private Yoga + Sound",
        duration: "60 min · up to 4 guests · +$55 each",
        price: "$555",
        format: "In person",
        description:
          "Breath-led private movement followed by a restorative sound experience.",
        image: media.experiences.movementEagle,
      },
      {
        slug: "private-sound-healing",
        title: "Private Sound Healing",
        duration: "60–75 min · up to 8 guests · +$44 each",
        price: "$444",
        format: "In person",
        description:
          "A private sound practice designed for rest, reflection, and spacious attention.",
        image: media.brand.sanctuaryHero,
      },
      {
        slug: "private-yoga",
        title: "Private Yoga",
        duration: "75–90 min · 2–4 guests · +$66 each",
        price: "$666",
        format: "In person",
        description:
          "A private practice shaped around your body, breath, experience, and energy that day.",
        image: media.brand.standingStretch,
      },
    ],
  },
  {
    id: "ritual",
    title: "Ritual",
    description: "A mirror, not a map.",
    format: "Virtual + in-person care",
    image: media.experiences.ritualWolf,
    services: [
      {
        slug: "intuitive-tarot-reading",
        title: "Intuitive Tarot Reading",
        duration: "45–60 min",
        price: "$222",
        format: "Virtual or in person",
        description:
          "Reflective card work for transitions, choices, patterns, and the season you are in.",
        image: media.shannon.ritualSpace,
      },
      {
        slug: "moon-oracle-reading",
        title: "Moon Oracle Reading",
        duration: "45–60 min",
        price: "$222",
        format: "Virtual or in person",
        description:
          "A lunar and astrological reading for reflection, timing, and present-season clarity.",
        image: media.experiences.ritualWolf,
      },
      {
        slug: "tarot-and-reiki",
        title: "Tarot + Reiki Experience",
        duration: "60–75 min",
        price: "$444",
        format: "In person",
        description:
          "Intuitive guidance followed by restorative Reiki support in person.",
        image: media.shannon.ritualSpace,
      },
    ],
  },
] as const

export function findBookingService(serviceSlug?: string) {
  if (!serviceSlug) return null

  for (const pillar of bookingPillars) {
    const service = pillar.services.find((item) => item.slug === serviceSlug)
    if (service) return { pillar, service }
  }

  return null
}
