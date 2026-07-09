import type { Metadata } from "next"

import {
  BenefitGrid,
  InteriorHero,
  OfferingCard,
  PageSection,
} from "@/components/shared/internal-page"
import { CtaBlock } from "@/components/shared/cta-block"
import { SectionHeading } from "@/components/shared/section-heading"
import { TestimonialQuote } from "@/components/shared/testimonial-quote"

export const metadata: Metadata = {
  title: "Beauty Experiences | HWL by SMD",
  description:
    "Luxury facial rituals that restore healthy skin while creating space to slow down. Advanced skincare, therapeutic massage, energy balancing, and personalized care.",
}

const experiences = [
  {
    title: "Wild Glow Express Facial",
    details: ["15-20 minutes", "$111 per guest", "Minimum 4 guests"],
    description:
      "A refreshing facial experience designed to restore radiance in moments. Combines cleansing, hydration, sculpting massage, and finishing touches to leave guests feeling refreshed, lifted, and glowing.",
  },
  {
    title: "Reiki Aromatherapy Healing",
    details: ["30-45 minutes", "$222 per guest"],
    description:
      "A deeply restorative blend of Reiki, crystal healing, and aromatherapy touch designed to soothe the nervous system, clear energetic stagnation, and renew vitality.",
  },
  {
    title: "Signature Retreat Facial",
    details: ["60 minutes", "$277 per guest"],
    description:
      "A customized facial designed to restore glow, hydration, balance, and relaxation while creating a meaningful moment of pause within the retreat experience.",
  },
  {
    title: "HWL Beauty & Being Ritual",
    details: ["90 minutes", "$333 per guest"],
    description:
      "A luxe facial ritual blending customized skincare, aromatherapy, therapeutic and lymphatic facial massage, Reiki healing, and intentional restoration.",
  },
  {
    title: "Wild Glow Luxury Facial Ritual",
    details: ["120 minutes", "$444 per guest"],
    description:
      "A fully immersive beauty and wellbeing experience combining advanced skincare, extended massage, energy balancing, aromatherapy, and personalized ritual.",
  },
]

const benefits = [
  "Radiant Skin",
  "Reduced Puffiness",
  "Released Tension",
  "Nervous System Regulation",
  "Enhanced Absorption",
  "Deep Restoration",
]

export default function BeautyPage() {
  return (
    <>
      <InteriorHero
        eyebrow="Experiences"
        title="Beauty that goes beneath the surface"
        subtitle="Luxury facial rituals that restore healthy skin while creating space to slow down, breathe, and reconnect with yourself."
        variant="flow"
      />

      <PageSection>
        <SectionHeading align="center" title="More than skin deep" />
        <div className="mx-auto mt-8 max-w-3xl space-y-5 text-center text-lg leading-relaxed text-[var(--muted-foreground)]">
          <p>
            Beauty is not surface-level. The way your skin looks is intimately
            connected to how your nervous system feels. Stress, tension, and
            fatigue show up in your face long before they show up anywhere else.
          </p>
          <p>
            My facial experiences are designed to work on both levels
            simultaneously — restoring your skin&apos;s natural radiance through
            advanced skincare, therapeutic massage, and targeted treatments,
            while regulating your nervous system through intentional touch,
            aromatherapy, and energetic care. You don&apos;t just leave with
            glowing skin. You leave feeling restored.
          </p>
        </div>
      </PageSection>

      <PageSection className="bg-white/35">
        <SectionHeading
          align="center"
          eyebrow="Signature Beauty Experiences"
          title="Choose your ritual"
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {experiences.map((experience) => (
            <OfferingCard {...experience} key={experience.title} />
          ))}
        </div>
      </PageSection>

      <PageSection>
        <SectionHeading align="center" title="What this creates" />
        <div className="mt-10">
          <BenefitGrid items={benefits} />
        </div>
      </PageSection>

      <PageSection className="bg-white/35">
        <SectionHeading align="center" title="Investment" />
        <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-lg border border-[var(--border)] bg-white/60">
          {experiences.map((experience) => (
            <div
              className="grid gap-3 border-b border-[var(--border)] p-5 last:border-b-0 md:grid-cols-[1fr_auto_auto]"
              key={experience.title}
            >
              <span className="font-medium text-[var(--primary)]">
                {experience.title}
              </span>
              <span className="text-sm text-[var(--muted-foreground)]">
                {experience.details[0]}
              </span>
              <span className="text-sm font-medium text-[var(--accent)]">
                {experience.details[1]}
              </span>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-5 max-w-2xl text-center text-sm leading-relaxed text-[var(--muted-foreground)]">
          Group pricing and travel fees are confirmed during booking. No travel
          fee applies within the Coachella Valley.
        </p>
      </PageSection>

      <TestimonialQuote
        attribution="Zara K."
        context="Beauty experience guest"
        quote="My skin was glowing, but what surprised me most was how calm I felt afterward. It was beauty, care, and deep nervous system rest all at once."
      />

      <CtaBlock
        primaryHref="/book"
        primaryLabel="Book an Experience"
        secondaryHref="/contact"
        secondaryLabel="Contact Shannon"
        title="Ready to glow?"
      />
    </>
  )
}
