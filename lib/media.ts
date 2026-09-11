const shannon = {
  beautyLift: {
    src: "/images/shannon/shannon-beauty-lift.webp",
    alt: "Shannon practicing her LIFT facial massage with both hands",
  },
  beautyPortrait: {
    src: "/images/shannon/shannon-beauty-portrait.webp",
    alt: "A luminous close portrait of Shannon Mary Dixon",
  },
  ritualSpace: {
    src: "/images/shannon/shannon-ritual-space.webp",
    alt: "Shannon preparing flowers, sound bowls, and cards for a private ritual",
  },
  retreatYoga: {
    src: "/images/shannon/shannon-retreat-yoga.webp",
    alt: "Shannon seated in a grounding yoga practice in the high desert",
  },
  desertGuide: {
    src: "/images/shannon/shannon-desert-guide.webp",
    alt: "Shannon walking a sunlit high-desert path in a flowing white dress",
  },
  desertEditorial: {
    src: "/images/shannon/shannon-desert-editorial.webp",
    alt: "Shannon moving with a woven textile in the high desert",
  },
  homeRitual: {
    src: "/images/shannon/shannon-home-ritual.webp",
    alt: "Shannon pausing with a warm cup beside a sunlit bath",
  },
  botanicalPortrait: {
    src: "/images/shannon/shannon-botanical-portrait.webp",
    alt: "Shannon surrounded by sculptural botanicals and eucalyptus",
  },
} as const

export const media = {
  shannon,
  brand: {
    sanctuaryHero: shannon.ritualSpace,
    standingStretch: {
      src: "/images/brand/shannon-standing-stretch.webp",
      alt: "Shannon standing in a soft neutral movement pose",
    },
    windowPortrait: {
      src: "/images/brand/shannon-window-portrait.webp",
      alt: "Shannon smiling beside a sunlit studio window",
    },
    smilingPortrait: {
      src: "/images/brand/shannon-smiling-portrait.webp",
      alt: "A warm portrait of Shannon Mary Dixon",
    },
    destinationPortrait: shannon.desertGuide,
  },
  experiences: {
    beauty: shannon.beautyPortrait,
    movementBoat: {
      src: "/images/experiences/movement-boat-pose.webp",
      alt: "Shannon practicing a strong seated balance",
    },
    movementEagle: {
      src: "/images/experiences/movement-seated-eagle.webp",
      alt: "Shannon seated in an expressive restorative yoga pose",
    },
    movementStretch: {
      src: "/images/experiences/movement-seated-stretch.webp",
      alt: "Shannon reaching through a seated side stretch",
    },
    tarotSpread: shannon.ritualSpace,
    ritualWolf: {
      src: "/images/home/hwl-home-being-celestial-v3.webp",
      alt: "Shannon in luminous white fabric with celestial details across her cheek",
    },
    ritualMoon: {
      src: "/images/experiences/ritual-moon-forest.webp",
      alt: "A full moon rising over a quiet forest and golden field",
    },
  },
  editorial: {
    beautyOfferings: {
      src: "/images/editorial/hwl-beauty-offerings-v1.webp",
      alt: "Facial oil, ceramic skincare jar, sculpting stone, and apricot flower in desert light",
    },
    bodyOfferings: {
      src: "/images/editorial/hwl-body-offerings-v1.webp",
      alt: "Yoga mat, linen bolster, sage cloth, and singing bowl in a sunlit desert studio",
    },
    beingOfferings: {
      src: "/images/editorial/hwl-being-offerings-v1.webp",
      alt: "Ritual cards, brass moon, candle, flower, and stone arranged in plum twilight",
    },
    aboutSkatingConcept: {
      src: "/images/home/hwl-home-body-studio-lunge-v2.webp",
      alt: "Shannon reaching through a grounded studio movement practice",
      kind: "original-photography",
      label: "Shannon in movement",
      disclosure: "Original photography from Shannon's archive.",
    },
    aboutMotorcycleConcept: {
      ...shannon.desertEditorial,
      kind: "original-photography",
      label: "Shannon in the high desert",
      disclosure: "Original photography from Shannon's archive.",
    },
    liftBotanicals: {
      src: "/images/editorial/lift-dried-botanicals.webp",
      alt: "Dried botanicals casting soft shadows across warm plaster",
    },
    liftVideoPreview: {
      src: "/images/editorial/lift-video-preview.jpg",
      alt: "Shannon demonstrating a facial massage movement with her hands",
    },
  },
  home: {
    hero: {
      src: "/images/home/hwl-home-hero-studio-movement.webp",
      alt: "Shannon moving through a sculptural backbend in a pale studio",
    },
    beauty: shannon.beautyLift,
    body: {
      src: "/images/hero/hwl-palm-springs-yoga-v1.webp",
      alt: "Shannon moving through a sunlit yoga practice in Palm Springs",
    },
    being: {
      src: "/images/home/hwl-home-being-celestial-v3.webp",
      alt: "Shannon in luminous white fabric with celestial details across her cheek",
    },
    shannonPortrait: {
      src: "/images/brand/shannon-smiling-portrait.webp",
      alt: "Shannon Mary Dixon smiling warmly at the camera",
    },
    proofFacial: {
      src: "/images/editorial/lift-video-preview.jpg",
      alt: "Shannon demonstrating facial massage with both hands",
    },
    proofPrivateYoga: shannon.retreatYoga,
    proofReadings: shannon.ritualSpace,
    proofRetreat: shannon.desertEditorial,
  },
  retreats: {
    palmSpringsHero: shannon.desertGuide,
    highDesertPath: {
      src: "/images/retreats/retreats-high-desert-path-v1.webp",
      alt: "A path winding through Joshua trees and sunlit high-desert boulders",
    },
    groupPractice: {
      src: "/images/retreats/retreats-group-practice-v1.webp",
      alt: "Shannon guiding a small outdoor yoga practice in Palm Springs",
    },
    fanPalmOasis: {
      src: "/images/retreats/retreats-fan-palm-oasis-v1.webp",
      alt: "California fan palms glowing along a quiet desert canyon path",
    },
    facialRitual: shannon.beautyLift,
    outdoorYoga: shannon.retreatYoga,
    soundRitual: shannon.ritualSpace,
  },
  motion: {
    liftPreview: {
      src: "/video/lift/facial-lift-preview.mp4",
    },
    liftPrepPreview: {
      poster: "/images/editorial/lift-prep-preview-poster.webp",
      src: "/video/lift/prep-the-skin-preview.mp4",
    },
    liftJawlinePreview: {
      poster: "/images/editorial/lift-jawline-preview-poster.webp",
      src: "/video/lift/jawline-lift-preview.mp4",
    },
  },
} as const
