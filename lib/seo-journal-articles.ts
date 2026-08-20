export const SEO_JOURNAL_ARTICLE_SLUGS = [
  "tarot-palm-springs",
  "sound-bath-joshua-tree",
  "desert-skincare",
] as const

export type SeoJournalArticleSlug = (typeof SEO_JOURNAL_ARTICLE_SLUGS)[number]

export type SeoJournalSection = {
  readonly heading: string
  readonly paragraphs: readonly string[]
}

export type SeoJournalFaq = {
  readonly answer: string
  readonly question: string
}

export type SeoJournalServiceLink = {
  readonly href: string
  readonly label: string
}

export type SeoJournalArticle = {
  readonly dek: string
  readonly eyebrow: string
  readonly faqs: readonly [SeoJournalFaq, SeoJournalFaq, SeoJournalFaq]
  readonly h1: string
  readonly metadata: {
    readonly description: string
    readonly title: string
  }
  readonly sections: readonly [
    SeoJournalSection,
    SeoJournalSection,
    SeoJournalSection,
    SeoJournalSection,
  ]
  readonly serviceLinks: readonly SeoJournalServiceLink[]
  readonly slug: SeoJournalArticleSlug
  readonly targetKeyword: string
}

export const seoJournalArticles = {
  "tarot-palm-springs": {
    slug: "tarot-palm-springs",
    targetKeyword: "tarot reading Palm Springs",
    metadata: {
      title: "Tarot Reading in Palm Springs | HWL by SMD",
      description:
        "Explore tarot reading in Palm Springs as a grounded, reflective practice for meeting a question with clarity, curiosity, and your own inner authority.",
    },
    eyebrow: "Desert Notes · Tarot",
    h1: "Tarot in Palm Springs: a quieter way to meet a question",
    dek: "A private reading can make room for the truth already taking shape—not by predicting what comes next, but by helping you notice what is here now.",
    sections: [
      {
        heading: "A mirror, not a forecast",
        paragraphs: [
          "Tarot is sometimes presented as a way to receive fixed answers about the future. Shannon's approach is different. The cards are visual prompts—images, symbols, and relationships that can help you see a familiar situation from another angle. No card has more authority than you do over your own life.",
          "A reading can help when a question feels crowded by competing thoughts. You might arrive with a transition, creative decision, relationship pattern, or simply the feeling that something deserves attention. The cards give the conversation shape while your observations, boundaries, and lived experience remain at the center.",
        ],
      },
      {
        heading: "Why the desert changes the pace",
        paragraphs: [
          "Palm Springs makes contrast visible: bright sky and long shadow, open distance and sheltered courtyards, movement and stillness. A tarot reading here can become part of that wider pause—an interval between what you have been carrying and how you want to return to your day.",
          "You do not need a particular belief system to participate. Curiosity is enough. Some guests connect immediately with an image; others begin with what they do not see. Both can open an honest conversation. The point is not to perform intuition correctly, but to listen without rushing toward a polished answer.",
        ],
      },
      {
        heading: "What happens in a private reading",
        paragraphs: [
          "A session begins with a conversation about what brings you in. You may offer a clear question, name an area of life, or leave the opening broad. Shannon chooses a spread that gives the inquiry structure without turning it into a verdict. The pace leaves room for silence and changes in direction.",
          "As the cards are turned, Shannon reflects on the imagery and patterns in front of you. You are invited to notice what feels relevant, incomplete, or outside your situation. The reading is collaborative rather than declarative. There is no pressure to reveal more than you wish, and uncertainty is welcome.",
        ],
      },
      {
        heading: "Leaving with your own next step",
        paragraphs: [
          "The most useful closing is often modest: a sentence to remember, a question to keep nearby, or one action that feels possible. You may write afterward, take a walk, or let the reading settle without immediately explaining it. Integration does not have to be dramatic to matter.",
          "If you are considering a tarot reading in Palm Springs, choose a moment when you can arrive without squeezing it between obligations. Bring your question if you have one and your uncertainty if you do not. The practice begins with attention, not certainty.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do I need to arrive with a specific question?",
        answer:
          "No. A question can help, but a theme, transition, or general curiosity is enough. Shannon can help shape an opening that feels relevant.",
      },
      {
        question: "Will a tarot reading tell me what will happen?",
        answer:
          "No. Shannon offers tarot as reflection, not fortune-telling or a guaranteed forecast. Your choices and discernment remain your own.",
      },
      {
        question: "Can I book a reading while visiting Palm Springs?",
        answer:
          "Yes. Visitors and local residents are welcome. Share your preferred date and timing needs through the booking page, and Shannon will confirm availability.",
      },
    ],
    serviceLinks: [
      { href: "/tarot", label: "Explore tarot readings" },
      { href: "/book", label: "Request a private session" },
      { href: "/about", label: "Meet Shannon" },
    ],
  },
  "sound-bath-joshua-tree": {
    slug: "sound-bath-joshua-tree",
    targetKeyword: "sound bath Joshua Tree",
    metadata: {
      title: "Sound Bath in Joshua Tree | HWL by SMD",
      description:
        "Discover what to expect from a private sound bath in Joshua Tree: a calm, professionally held listening experience for individuals, groups, and retreats.",
    },
    eyebrow: "Desert Notes · Sound",
    h1: "A sound bath in Joshua Tree, held with room to listen",
    dek: "Layered tones, desert quiet, and an unhurried setting can create a simple threshold between the pace you arrived with and the moment you are in.",
    sections: [
      {
        heading: "Listening as a form of arrival",
        paragraphs: [
          "A sound bath is a guided listening experience. Guests rest on mats or sit comfortably while instruments create changing layers of tone, resonance, and silence. There is nothing to memorize or perform. The invitation is to notice the sound moving through the space and let your attention return when it wanders.",
          "The word bath describes immersion, not water or a promised outcome. Everyone experiences sound differently. One guest may feel absorbed in the textures; another may notice the quiet between them; someone else may remain alert. None is more correct. A well-held session allows individual experience without assigning it a meaning.",
        ],
      },
      {
        heading: "How a private session is held",
        paragraphs: [
          "Before the instruments begin, Shannon offers an orientation and checks volume, seating, temperature, and comfort. Guests may lie down or remain seated, keep their eyes open or closed, and adjust whenever needed. Taking a break is always an available choice.",
          "The session moves gradually rather than chasing constant intensity, and quiet is part of the composition. Shannon leaves time to reorient before the next activity. For a private group, length and setup can respond to the setting, schedule, number of guests, and tone of the gathering.",
        ],
      },
      {
        heading: "What the high desert adds",
        paragraphs: [
          "Joshua Tree carries a distinctive acoustic character. Open land, stone, wind, and sparse vegetation can make small sounds feel clear and close. A session need not compete with that environment. It can respond through restraint: fewer elements, thoughtful volume, and pauses that leave the surrounding quiet present.",
          "Outdoor plans require flexibility. Wind, heat, cold, neighbors, wildlife, and access can change what is comfortable. An indoor or sheltered setting is often more dependable. The goal is not a desert spectacle, but a respectful listening environment where guests can settle without avoidable distraction.",
        ],
      },
      {
        heading: "Choosing whether it fits your gathering",
        paragraphs: [
          "A sound bath can stand alone or become one quiet element within a retreat, celebration, or day of shared practice. It works best when the schedule gives people time to arrive and does not force an immediate transition into a loud activity. It should support the gathering's rhythm, not become another item to rush through.",
          "Sound sessions are wellness and listening experiences, not medical care, diagnosis, or treatment. A guest with a health, hearing, sensory, or accessibility concern should make the choice that is right for them and share any practical accommodation request for Shannon to consider.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do I need experience with meditation or sound baths?",
        answer:
          "No. There is no technique to master. You may listen while seated or lying down and adjust your position at any time.",
      },
      {
        question: "Can a sound bath be arranged for a Joshua Tree retreat?",
        answer:
          "Yes. Shannon can discuss timing, group size, space, access, and the atmosphere you are creating before confirming a private-group plan.",
      },
      {
        question: "Are particular results guaranteed?",
        answer:
          "No. People respond to sound differently. The offering is a professionally held listening experience and promises no physical, emotional, or medical result.",
      },
    ],
    serviceLinks: [
      { href: "/yoga", label: "Explore movement and sound" },
      { href: "/retreats", label: "Plan retreat wellness" },
      { href: "/book", label: "Request a sound bath" },
    ],
  },
  "desert-skincare": {
    slug: "desert-skincare",
    targetKeyword: "facial Palm Springs",
    metadata: {
      title: "Desert Skincare & Facials in Palm Springs | HWL by SMD",
      description:
        "A thoughtful guide to desert skincare and choosing a facial in Palm Springs, with gentle routines shaped around comfort, consistency, and attentive care.",
    },
    eyebrow: "Desert Notes · Beauty",
    h1: "Desert skincare: a gentler rhythm for Palm Springs",
    dek: "Strong sun, dry air, wind, and temperature shifts can make an elaborate routine feel like too much. Thoughtful care begins by noticing what your skin is asking for today.",
    sections: [
      {
        heading: "What desert living asks of a routine",
        paragraphs: [
          "Palm Springs is beautiful because the climate is so distinct. The brightness and dryness that shape the landscape can change how skin feels from day to day. Travel, air conditioning, time outdoors, swimming, and wind add more variables. A product that felt comfortable elsewhere may suddenly feel heavy, light, or unnecessary.",
          "The answer is not automatically a longer routine, but often a more observant one. Notice comfort after cleansing, how products layer, and how your skin feels by afternoon. Change one element at a time when possible. A calm baseline makes it easier to understand what is useful.",
        ],
      },
      {
        heading: "Build a calm, consistent foundation",
        paragraphs: [
          "A simple rhythm can begin with gentle cleansing, comfortable moisture, and daily sun protection suited to your preferences. Consistency matters more than an impressive shelf. When introducing something new, observe it rather than combining several unfamiliar formulas at once. More intensity does not always feel more caring.",
          "Texture and timing matter as much as the number of steps. You may prefer lighter layers by day and a more cushioning finish at night. During a windy week or after travel, familiar products may feel reassuring. Desert skincare can remain responsive while keeping its basic structure clear.",
        ],
      },
      {
        heading: "What a facial ritual can offer",
        paragraphs: [
          "A facial with Shannon begins with conversation rather than a predetermined sequence. Share how your skin feels, what you use, what you avoid, and whether you prefer quiet or more explanation. The ritual is shaped around comfort, pace, and the information available that day.",
          "Cleansing, hydration-focused layers, touch, and facial massage may be included when appropriate. The experience is personal care, not a medical procedure, and does not diagnose or promise to correct a condition. A licensed medical provider should guide persistent concerns and treatment decisions.",
        ],
      },
      {
        heading: "Carry the ritual home without overcomplicating it",
        paragraphs: [
          "The hours after a facial need not become a project. Follow the guidance for your session, keep the day gentle, and resist adding every product at once. The most useful takeaway may be a better sense of pressure, pace, or order rather than a completely new routine.",
          "For home practice, the LIFT guide offers a focused facial massage ritual beside your existing skincare. Move slowly, use comfortable pressure, and skip any step that does not feel right. Sustainable care is care you can return to without strain.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I book a facial while visiting Palm Springs?",
        answer:
          "Yes. Visitors and local residents may inquire through the booking page. Share your preferred date, timing, and facial ritual so Shannon can confirm availability.",
      },
      {
        question: "What should I share before a facial?",
        answer:
          "Mention current products, sensitivities, recent professional services, anything you avoid, and practical comfort needs. This helps Shannon shape an appropriate personal-care experience.",
      },
      {
        question: "Is the LIFT guide a replacement for a professional facial?",
        answer:
          "No. LIFT is an optional home facial massage practice. It does not replace professional skincare or medical care, and every movement can be adjusted or skipped.",
      },
    ],
    serviceLinks: [
      { href: "/beauty", label: "Explore facial rituals" },
      { href: "/beauty/lift", label: "Discover the LIFT guide" },
      { href: "/book", label: "Request a facial" },
    ],
  },
} as const satisfies Record<SeoJournalArticleSlug, SeoJournalArticle>

export const seoJournalArticleList = SEO_JOURNAL_ARTICLE_SLUGS.map(
  (slug) => seoJournalArticles[slug]
)
