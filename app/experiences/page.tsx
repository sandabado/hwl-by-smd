import { InteriorHero, PageSection } from "@/components/shared/internal-page"
import { PillarCard } from "@/components/shared/pillar-card"
import { SectionHeading } from "@/components/shared/section-heading"
import { media } from "@/lib/media"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Experiences | HWL by SMD",
  description:
    "Explore Beauty, Body, and Being experiences from HWL by SMD, plus custom retreat partnerships.",
  path: "/experiences",
})

const pillars = [
  {
    title: "Beauty",
    description:
      "Luxury facial rituals that restore skin while creating space to slow down.",
    href: "/beauty",
    imageSrc: media.experiences.beauty.src,
    imageAlt: media.experiences.beauty.alt,
  },
  {
    title: "Yoga",
    description:
      "Private yoga, restorative movement, and sound healing to reconnect with your body.",
    href: "/yoga",
    imageSrc: media.experiences.movementBoat.src,
    imageAlt: media.experiences.movementBoat.alt,
  },
  {
    title: "Tarot",
    description:
      "Seasonal astrology, intuitive guidance, Reiki, and intentional ceremony.",
    href: "/tarot",
    imageSrc: media.experiences.ritualWolf.src,
    imageAlt: media.experiences.ritualWolf.alt,
  },
]

export default function ExperiencesPage() {
  return (
    <>
      <InteriorHero
        eyebrow="Experiences"
        title="Beauty · Body · Being"
        subtitle="Three doors into one whole self, with custom retreat partnerships that weave them into a complete experience."
        variant="desert"
      />
      <PageSection>
        <SectionHeading
          align="center"
          subtitle="Every experience is designed to restore the nervous system, awaken the senses, and create a moment of genuine return."
          title="Explore the work"
        />
        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <PillarCard {...pillar} key={pillar.href} />
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-5xl rounded-[2rem] border border-[var(--border)] bg-[var(--primary)] p-8 text-[var(--background)] md:flex md:items-center md:justify-between md:gap-10">
          <div>
            <p className="text-xs tracking-[0.2em] text-[var(--accent-on-dark)] uppercase">
              Retreat partnerships
            </p>
            <h2 className="mt-3 text-3xl">
              Bring the whole arc to your gathering.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75">
              Custom Beauty, Body, and Being programming for boutique retreats,
              hospitality, private groups, and destination events.
            </p>
          </div>
          <Link
            className="mt-6 inline-flex shrink-0 rounded-full bg-[var(--background)] px-5 py-2.5 text-sm font-medium text-[var(--primary)] transition hover:bg-[var(--accent)] hover:text-white md:mt-0"
            href="/retreats"
          >
            Explore Retreats
          </Link>
        </div>
      </PageSection>
    </>
  )
}
import Link from "next/link"
