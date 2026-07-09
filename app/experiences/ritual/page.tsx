import type { Metadata } from "next"

import {
  BenefitGrid,
  FaqAccordion,
  InteriorHero,
  OfferingCard,
  PageSection,
} from "@/components/shared/internal-page"
import { CtaBlock } from "@/components/shared/cta-block"
import { SectionHeading } from "@/components/shared/section-heading"
import { TestimonialQuote } from "@/components/shared/testimonial-quote"

export const metadata: Metadata = {
  title: "Ritual Experiences | HWL by SMD",
  description:
    "Seasonal astrology, ritual, intuitive guidance, and intentional ceremony. Ancient wisdom for modern life with grounded, practical application.",
}

const seasonal = [
  {
    title: "Seasonal Astrology Workshop",
    details: ["60-90 minutes", "Starting at $555"],
    description:
      "A grounded astrology workshop designed around the current season, moon cycle, or planetary moment, with reflection prompts and practical integration.",
  },
  {
    title: "Seasonal Astrology + Ritual Experience",
    details: ["90-120 minutes", "Starting at $777"],
    description:
      "A guided seasonal experience combining astrology, intention setting, simple ritual, meditation, and group reflection.",
  },
  {
    title: "Signature Solstice & Equinox Ceremonies",
    details: ["120+ minutes", "Starting at $888"],
    description:
      "A ceremonial container for marking thresholds with astrology, ritual, guided meditation, sound, intention, and integration.",
  },
]

const intuitive = [
  {
    title: "Intuitive Tarot Reading",
    details: ["45-60 minutes", "$222"],
    description:
      "A reflective reading for clarity, perspective, and self-understanding, held with practical guidance and grounded care.",
  },
  {
    title: "Moon Oracle Reading",
    details: ["45-60 minutes", "$222"],
    description:
      "A lunar-focused reading for emotional insight, timing, cycles, and inner alignment.",
  },
  {
    title: "Tarot + Reiki Experience",
    details: ["60-75 minutes", "$444"],
    description:
      "A combined intuitive and energetic session blending tarot guidance with Reiki, aromatherapy, and restorative integration.",
  },
]

const faqs = [
  {
    question: "What if I'm skeptical?",
    answer:
      "The work is grounded and invitational. Astrology, tarot, and ritual are used as reflective frameworks, not rigid predictions.",
  },
  {
    question: "What's the difference between tarot and moon oracle?",
    answer:
      "Tarot is broad and archetypal. Moon oracle work is more cyclical, emotional, and connected to timing, seasonality, and inner rhythm.",
  },
  {
    question: "Can readings be offered to a private group?",
    answer:
      "Yes. Private readings, mini-readings, and group ritual formats can be adapted for retreats, celebrations, and gatherings.",
  },
  {
    question: "What happens in Tarot + Reiki?",
    answer:
      "The session begins with intuitive guidance and moves into energetic clearing, aromatherapy, and quiet integration.",
  },
  {
    question: "Are remote sessions available?",
    answer:
      "Yes. Many ritual and intuitive guidance sessions can be offered remotely when travel or timing calls for it.",
  },
]

export default function RitualPage() {
  return (
    <>
      <InteriorHero
        eyebrow="Experiences"
        particles
        title="Ancient wisdom for modern life"
        subtitle="Seasonal astrology, ritual, intuitive guidance, and intentional ceremony — experiences that help you navigate life with more clarity, meaning, and connection."
        variant="ritual"
      />

      <PageSection>
        <SectionHeading align="center" title="Ritual creates a container" />
        <div className="mx-auto mt-8 max-w-3xl space-y-5 text-center text-lg leading-relaxed text-[var(--muted-foreground)]">
          <p>
            Human beings need ritual. We need moments that ask us to pause,
            reflect, release, choose, and begin again with intention.
          </p>
          <p>
            After more than twenty years of studying astrology, tarot,
            symbolism, energetics, and personal transformation, Shannon offers
            these practices as grounded frameworks for awareness — ancient
            wisdom translated into modern life.
          </p>
        </div>
      </PageSection>

      <PageSection className="bg-white/35">
        <SectionHeading
          align="center"
          eyebrow="Seasonal & Group Ritual"
          title="Gather with intention"
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {seasonal.map((offering) => (
            <OfferingCard {...offering} key={offering.title} />
          ))}
        </div>
      </PageSection>

      <PageSection>
        <SectionHeading
          align="center"
          eyebrow="Intuitive Guidance (Private)"
          title="For clarity and integration"
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {intuitive.map((offering) => (
            <OfferingCard {...offering} key={offering.title} />
          ))}
        </div>
      </PageSection>

      <PageSection className="bg-white/35">
        <SectionHeading align="center" title="What this supports" />
        <div className="mt-10">
          <BenefitGrid
            items={[
              "Clarity & Perspective",
              "Timing & Alignment",
              "Self-Awareness",
              "Energetic Clearing",
              "Meaning & Connection",
              "Integration",
            ]}
          />
        </div>
      </PageSection>

      <TestimonialQuote
        attribution="Grace R."
        context="Ritual guest"
        quote="The experience felt sacred without being intimidating. I left with language for what I was moving through and a simple ritual I could actually carry into my life."
      />

      <PageSection className="bg-white/35">
        <SectionHeading align="center" title="Questions" />
        <div className="mt-8">
          <FaqAccordion items={faqs} />
        </div>
      </PageSection>

      <CtaBlock
        primaryHref="/book"
        primaryLabel="Book an Experience"
        title="Remember who you already are."
      />
    </>
  )
}
