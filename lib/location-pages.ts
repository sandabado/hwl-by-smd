export type LocationPageSlug =
  "palm-springs" | "joshua-tree" | "yucca-valley" | "desert-hot-springs"

type LocationServiceEntry =
  | { title: "Beauty"; href: "/beauty"; description: string }
  | { title: "Yoga"; href: "/yoga"; description: string }
  | { title: "Astrology"; href: "/astrology"; description: string }
  | { title: "Book"; href: "/book"; description: string }

export type LocationPageData = {
  city: string
  path: `/${LocationPageSlug}`
  metadata: {
    title: string
    description: string
  }
  heroTitle: string
  introParagraphs: readonly [string, string]
  placeHeading: string
  placeParagraphs: readonly [string, string]
  services: readonly [
    LocationServiceEntry,
    LocationServiceEntry,
    LocationServiceEntry,
    LocationServiceEntry,
  ]
  map: {
    lat: number
    lng: number
    zoom: number
    radius: number
  }
  closing: {
    heading: string
    body: string
  }
}

export const LOCATION_PAGES: Record<LocationPageSlug, LocationPageData> = {
  "palm-springs": {
    city: "Palm Springs",
    path: "/palm-springs",
    metadata: {
      title: "Facial Rituals, Yoga & Astrology in Palm Springs | HWL by SMD",
      description:
        "Explore facial rituals, private yoga, sound, astrology consultations, tarot readings, and retreat support with Shannon Mary Dixon in Palm Springs, California.",
    },
    heroTitle: "Wellness experiences with room to exhale in Palm Springs.",
    introParagraphs: [
      "HWL by SMD brings beauty, movement, and reflective ritual into one considered practice for Palm Springs. Shannon Mary Dixon offers facial rituals, private yoga, sound-centered sessions, astrology, tarot, and custom retreat support with a calm, personal approach. Each experience begins with a conversation so the format can reflect the occasion, the available setting, and the people who will be present.",
      "You might be looking for quiet one-to-one care, a grounded session to share with a small group, or a thoughtful addition to a longer gathering. There is no standard itinerary to fit yourself around. An inquiry is simply a place to describe what you need, ask practical questions, and confirm whether an offering, time, and location are a good match.",
    ],
    placeHeading: "Care shaped for the pace of Palm Springs.",
    placeParagraphs: [
      "Palm Springs holds striking contrasts: bright desert light and deep shade, lively weekends and unhurried mornings, close conversation and broad mountain views. HWL meets that character with experiences that feel attentive rather than crowded. The emphasis stays on clear preparation, generous pacing, and practices that can stand on their own without spectacle or exaggerated promises.",
      "Shannon serves Palm Springs by request. Sessions may take different forms depending on the service and the setting available, so details are confirmed before a booking is finalized. That keeps expectations clear for local clients, visiting guests, retreat hosts, and hospitality partners while leaving enough flexibility to create an experience that feels appropriate to the moment.",
    ],
    services: [
      {
        title: "Beauty",
        href: "/beauty",
        description:
          "Explore facial rituals, lymphatic-focused touch, and skin consultation offered as non-medical beauty and wellness care.",
      },
      {
        title: "Yoga",
        href: "/yoga",
        description:
          "Consider private yoga, restorative movement, breath, or sound in a format shaped around your experience level and intention.",
      },
      {
        title: "Astrology",
        href: "/astrology",
        description:
          "Choose astrology, tarot, or ritual as a reflective practice for a question, transition, gathering, or season of change.",
      },
      {
        title: "Book",
        href: "/book",
        description:
          "Share your preferred service, date, group size, and setting so Shannon can respond with availability and next steps.",
      },
    ],
    map: {
      lat: 33.8303,
      lng: -116.5453,
      zoom: 11,
      radius: 12000,
    },
    closing: {
      heading: "Begin with a simple conversation.",
      body: "Tell Shannon what is bringing you to HWL, which offering you are considering, and what you already know about timing and setting. She will help clarify the available format before you make a commitment.",
    },
  },
  "joshua-tree": {
    city: "Joshua Tree",
    path: "/joshua-tree",
    metadata: {
      title:
        "Yoga, Sound, Astrology & Facial Rituals in Joshua Tree | HWL by SMD",
      description:
        "Discover private yoga, sound, astrology consultations, tarot readings, facial rituals, and retreat wellness support with Shannon Mary Dixon in Joshua Tree, California.",
    },
    heroTitle: "Quiet, grounded wellness experiences in Joshua Tree.",
    introParagraphs: [
      "Joshua Tree invites attention without demanding it. HWL by SMD serves the area with private and small-group experiences that make space for care, movement, listening, and reflection. Shannon Mary Dixon brings facial ritual, yoga, sound, astrology, tarot, and retreat facilitation together through an approach that is personal, practical, and responsive to the people in the room.",
      "A session can support time set aside for yourself, a shared weekend, or a gathering with a wider intention. Rather than promising a fixed atmosphere or outcome, Shannon starts with useful details: the service you are drawn to, the size of the group, the setting you have in mind, and the time available. From there, she can confirm what is realistic and appropriate.",
    ],
    placeHeading: "An offering that respects the high desert.",
    placeParagraphs: [
      "The open horizons, sculptural rock, strong light, and quick shifts in temperature around Joshua Tree create a setting with its own presence. HWL does not try to compete with that landscape. Sessions are designed with restraint, using clear guidance and simple materials so the experience can feel connected to its surroundings without turning the desert into a theme or making claims about what it should make you feel.",
      "Joshua Tree service is arranged by request, with timing and location discussed before confirmation. This matters in a region where distance, weather, group plans, and the suitability of a space can change the shape of a session. The booking conversation creates room to address those details carefully and to choose an offering that fits the actual gathering rather than an imagined version of it.",
    ],
    services: [
      {
        title: "Beauty",
        href: "/beauty",
        description:
          "Discover a slow facial ritual or skin consultation centered on attentive, non-clinical care and a clearly discussed format.",
      },
      {
        title: "Yoga",
        href: "/yoga",
        description:
          "Request private yoga, restorative movement, breath, or a sound-centered session for an individual or small group.",
      },
      {
        title: "Astrology",
        href: "/astrology",
        description:
          "Use astrology, tarot, or ritual as a non-predictive framework for reflection, conversation, and marking a meaningful threshold.",
      },
      {
        title: "Book",
        href: "/book",
        description:
          "Send the service, date, group size, and proposed setting to begin a practical conversation about availability and fit.",
      },
    ],
    map: {
      lat: 34.1347,
      lng: -116.319,
      zoom: 11,
      radius: 12000,
    },
    closing: {
      heading: "Make space for what fits the gathering.",
      body: "If Joshua Tree is part of your plans, share the details you know and the feeling you want to create. Shannon will respond with grounded options, clear questions, and the next step if the request is a fit.",
    },
  },
  "yucca-valley": {
    city: "Yucca Valley",
    path: "/yucca-valley",
    metadata: {
      title:
        "Facial Rituals, Private Yoga & Astrology in Yucca Valley | HWL by SMD",
      description:
        "Explore facial rituals, private yoga, sound, astrology, tarot, and thoughtful group wellness experiences with Shannon Mary Dixon in Yucca Valley, California.",
    },
    heroTitle: "Personal wellness care for Yucca Valley and the high desert.",
    introParagraphs: [
      "HWL by SMD serves Yucca Valley with a grounded mix of beauty, movement, sound, and reflective ritual. Shannon Mary Dixon works with individuals, small groups, and retreat hosts who want an experience that feels considered without becoming complicated. Facial rituals, private yoga, astrology, tarot, and custom wellness programming are approached with clear boundaries, warm attention, and respect for each guest's preferences.",
      "The first step is not choosing from a rigid package. It is sharing what you are planning and what kind of support would be useful. Shannon can then discuss the possible format, the amount of time needed, and any practical considerations for the proposed setting. Nothing is confirmed until those details are understood, giving both sides a clear foundation for the experience.",
    ],
    placeHeading: "A steady rhythm for a lived-in desert town.",
    placeParagraphs: [
      "Yucca Valley sits within the everyday life of the high desert: errands and creative work, family time and visiting friends, expansive views and practical routines. HWL's approach belongs comfortably in that mix. The work does not require a special occasion or a dramatic reset. It can simply offer a well-held interval for care, movement, or reflection within the life already happening around it.",
      "Service in Yucca Valley is available by request and planned around the specific offering, timing, group size, and appropriate setting. That planning keeps the experience professional and unhurried while acknowledging the realities of desert distance and changing conditions. Shannon will confirm the details she can support rather than assume that every request, space, or schedule works in the same way.",
    ],
    services: [
      {
        title: "Beauty",
        href: "/beauty",
        description:
          "Learn about facial rituals and skin consultation that favor thoughtful touch, realistic language, and non-medical care.",
      },
      {
        title: "Yoga",
        href: "/yoga",
        description:
          "Explore private yoga, restorative movement, breath, and sound with options discussed for your pace and group.",
      },
      {
        title: "Astrology",
        href: "/astrology",
        description:
          "Consider astrology, tarot, or ritual for reflection and self-inquiry, without predictive claims or pressure to believe.",
      },
      {
        title: "Book",
        href: "/book",
        description:
          "Begin an inquiry with the service, possible dates, number of guests, and location details you currently have.",
      },
    ],
    map: {
      lat: 34.1142,
      lng: -116.4322,
      zoom: 11,
      radius: 12000,
    },
    closing: {
      heading: "Choose a beginning that feels manageable.",
      body: "You do not need every detail settled before reaching out. Share the outline of your Yucca Valley request, and Shannon can help identify what still needs to be decided before an experience is booked.",
    },
  },
  "desert-hot-springs": {
    city: "Desert Hot Springs",
    path: "/desert-hot-springs",
    metadata: {
      title:
        "Yoga, Astrology & Facial Rituals in Desert Hot Springs | HWL by SMD",
      description:
        "Explore private yoga, sound, astrology consultations, tarot readings, facial rituals, and retreat wellness support with Shannon Mary Dixon in Desert Hot Springs, California.",
    },
    heroTitle: "Restorative time, thoughtfully held in Desert Hot Springs.",
    introParagraphs: [
      "Desert Hot Springs has a long association with rest and mineral water, but every visit and gathering carries its own purpose. HWL by SMD adds a personal layer of beauty, movement, sound, and ritual without assuming what restoration should look like. Shannon Mary Dixon offers facial rituals, private yoga, astrology, tarot, and custom group experiences through a calm, collaborative process.",
      "Some inquiries begin with a specific service; others begin with a schedule, a group, or a desire to create one meaningful pause. Shannon listens for the practical shape of the request before recommending a format. Timing, group size, location, access, and expectations are discussed in advance, and an offering is confirmed only when those pieces can be brought together responsibly.",
    ],
    placeHeading: "A measured approach in a place known for rest.",
    placeParagraphs: [
      "Wide valley views, moving wind, warm days, and the area's mineral-water tradition give Desert Hot Springs a distinct identity. HWL acknowledges that context without borrowing promises from it. The offerings do not depend on water access, a particular property, or a prescribed idea of wellness. They focus instead on attentive facilitation, clear consent, and enough time for guests to participate at their own pace.",
      "Desert Hot Springs service is coordinated by request. Because properties, schedules, and group needs vary, the exact location and format are discussed before booking. This is especially useful for retreat organizers and visiting groups who are fitting wellness into a larger itinerary. It also protects the quiet quality of a private session by making practical expectations visible from the beginning.",
    ],
    services: [
      {
        title: "Beauty",
        href: "/beauty",
        description:
          "Explore facial ritual and skin consultation offered with gentle pacing, transparent scope, and no medical treatment claims.",
      },
      {
        title: "Yoga",
        href: "/yoga",
        description:
          "Request private yoga, restorative movement, breath, or sound as a focused session or part of a gathering.",
      },
      {
        title: "Astrology",
        href: "/astrology",
        description:
          "Invite astrology, tarot, or ritual into a reflective conversation held without prediction, certainty, or prescribed meaning.",
      },
      {
        title: "Book",
        href: "/book",
        description:
          "Provide your preferred offering, timing, group size, and setting so feasibility and availability can be confirmed.",
      },
    ],
    map: {
      lat: 33.9611,
      lng: -116.5017,
      zoom: 11,
      radius: 12000,
    },
    closing: {
      heading: "Plan the pause with care.",
      body: "Share how HWL might fit into your time in Desert Hot Springs. Shannon will help define a suitable format, confirm the practical details, and make sure the experience is described clearly before you book.",
    },
  },
}
