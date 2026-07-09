import type { Metadata } from "next"

import {
  ContactForm,
  InteriorHero,
  LinkCard,
  PageSection,
} from "@/components/shared/internal-page"
import { SectionHeading } from "@/components/shared/section-heading"

export const metadata: Metadata = {
  title: "Book an Experience | HWL by SMD",
  description:
    "Book a beauty experience, movement session, ritual, or retreat partnership. Concierge-style flow to find the perfect match.",
}

const concierge = [
  [
    "Restore my skin",
    "Luxury facial rituals, sculpting massage, glow, and nervous system care.",
    "/experiences/beauty",
  ],
  [
    "Reduce stress",
    "Private yoga, restorative movement, breath, and sound healing.",
    "/experiences/movement",
  ],
  [
    "Deep relaxation",
    "Begin with the five-minute LIFT ritual or book a guided beauty experience.",
    "/lift",
  ],
  [
    "Retreat wellness",
    "Custom programming for retreats, hospitality, and destination gatherings.",
    "/experiences/retreats",
  ],
  [
    "Group experience",
    "Plan a private group ritual, beauty activation, movement session, or ceremony.",
    "/contact",
  ],
]

const direct = [
  [
    "Beauty",
    "Facial rituals, Reiki aromatherapy healing, and skin-nervous system restoration.",
    "/experiences/beauty",
  ],
  [
    "Movement",
    "Private yoga, restorative movement, and sound healing.",
    "/experiences/movement",
  ],
  [
    "Ritual",
    "Astrology, tarot, Reiki, seasonal ceremonies, and intentional guidance.",
    "/experiences/ritual",
  ],
  [
    "Retreats",
    "Custom wellness programming for groups and destination events.",
    "/experiences/retreats",
  ],
]

export default function BookPage() {
  return (
    <>
      <InteriorHero
        eyebrow="Book"
        title="Book an Experience"
        subtitle="Let's find what you need. Answer a few questions and I'll recommend the best experience for you."
        variant="flow"
      />

      <PageSection>
        <SectionHeading align="center" title="What are you looking for?" />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {concierge.map(([title, description, href]) => (
            <LinkCard
              description={description}
              href={href}
              key={title}
              label="Start here"
              title={title}
            />
          ))}
        </div>
      </PageSection>

      <PageSection className="bg-white/35">
        <SectionHeading align="center" title="Or choose directly" />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {direct.map(([title, description, href]) => (
            <LinkCard
              description={description}
              href={href}
              key={title}
              label="Explore"
              title={title}
            />
          ))}
        </div>
      </PageSection>

      <PageSection>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1fr] lg:items-start">
          <SectionHeading
            eyebrow="Inquiry"
            subtitle="Share what you're drawn to, the date or location if you have one, and anything you'd like Shannon to know."
            title="Tell me what you're planning"
          />
          <ContactForm
            fields={[
              { label: "Name", name: "name" },
              { label: "Email", name: "email", type: "email" },
              { label: "Inquiry Type", name: "inquiryType" },
            ]}
          />
        </div>
      </PageSection>
    </>
  )
}
