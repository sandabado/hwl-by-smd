import type { Metadata } from "next"

import { InteriorHero, PageSection } from "@/components/shared/internal-page"
import { PillarCard } from "@/components/shared/pillar-card"
import { SectionHeading } from "@/components/shared/section-heading"

export const metadata: Metadata = {
  title: "Experiences | HWL by SMD",
  description:
    "Explore beauty, movement, ritual, and retreat experiences from HWL by SMD.",
}

const pillars = [
  {
    title: "Beauty",
    description:
      "Luxury facial rituals that restore skin while creating space to slow down.",
    href: "/experiences/beauty",
  },
  {
    title: "Movement",
    description:
      "Private yoga, restorative movement, and sound healing to reconnect with your body.",
    href: "/experiences/movement",
  },
  {
    title: "Ritual",
    description:
      "Seasonal astrology, intuitive guidance, Reiki, and intentional ceremony.",
    href: "/experiences/ritual",
  },
  {
    title: "Retreats",
    description:
      "Custom wellness programming for boutique retreats and destination gatherings.",
    href: "/experiences/retreats",
  },
]

export default function ExperiencesPage() {
  return (
    <>
      <InteriorHero
        eyebrow="Experiences"
        title="Four pillars. One philosophy."
        subtitle="Choose the doorway that meets you where you are: beauty, movement, ritual, or a custom retreat partnership."
        variant="desert"
      />
      <PageSection>
        <SectionHeading
          align="center"
          subtitle="Every experience is designed to restore the nervous system, awaken the senses, and create a moment of genuine return."
          title="Explore the work"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <PillarCard {...pillar} key={pillar.href} />
          ))}
        </div>
      </PageSection>
    </>
  )
}
