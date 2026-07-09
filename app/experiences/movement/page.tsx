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
  title: "Movement Experiences | HWL by SMD",
  description:
    "Private yoga, restorative movement, and sound healing to reconnect with your body. Nervous system regulation, embodiment, and deep restoration.",
}

const offerings = [
  {
    title: "Private Yoga",
    details: ["60 minutes", "$555", "Up to 4 guests"],
    description:
      "A personalized session shaped around your body's needs, from restorative and vinyasa to sculpt, barre, mobility, and athletic recovery. Additional guests are $55 each.",
  },
  {
    title: "Private Sound Healing",
    details: ["60-75 minutes", "$444", "Up to 8 guests"],
    description:
      "An immersive sound bath with crystal singing bowls, breath, and guided rest to invite a visible downshift from tension into calm. Additional guests are $44 each.",
  },
  {
    title: "Private Yoga + Sound",
    details: ["75-90 minutes", "$666", "2-4 guests"],
    description:
      "A complete movement and integration experience pairing intentional practice with sound healing, breath, and restorative closure. Additional guests are $66 each.",
  },
]

const faqs = [
  {
    question: "What if I've never done yoga before?",
    answer:
      "You are welcome exactly as you are. Sessions are private and adaptive, so the practice meets your body rather than asking your body to meet a preset sequence.",
  },
  {
    question: "What should I bring?",
    answer:
      "Comfortable clothing and water are enough. Shannon can coordinate mats, props, music, and sound healing materials when needed.",
  },
  {
    question: "Do I need to be flexible?",
    answer:
      "No. Flexibility is not the goal. The work is about breath, awareness, nervous system regulation, and reconnection.",
  },
  {
    question: "How is sound healing different from meditation?",
    answer:
      "Sound gives the mind something gentle to follow. The vibration and tone can help the body settle even when silent meditation feels difficult.",
  },
  {
    question: "Can this be booked for a group?",
    answer:
      "Yes. Movement and sound are ideal for private groups, retreats, celebrations, and wellness-focused gatherings.",
  },
]

export default function MovementPage() {
  return (
    <>
      <InteriorHero
        eyebrow="Experiences"
        title="Movement as medicine"
        subtitle="Private yoga, restorative movement, and sound healing designed to reconnect you with your body — not push it into submission."
        variant="earth"
      />

      <PageSection>
        <SectionHeading align="center" title="Return to the body" />
        <div className="mx-auto mt-8 max-w-3xl space-y-5 text-center text-lg leading-relaxed text-[var(--muted-foreground)]">
          <p>
            Stress accumulates in the body as tension, shallow breath,
            restlessness, fatigue, and disconnection. Movement becomes medicine
            when it creates safety instead of pressure.
          </p>
          <p>
            These experiences combine intelligent sequencing, breath,
            restorative pacing, and sound to help the nervous system soften. The
            goal is not performance. The goal is embodiment — feeling present,
            grounded, and at home in yourself.
          </p>
        </div>
      </PageSection>

      <PageSection className="bg-white/35">
        <SectionHeading
          align="center"
          eyebrow="Private Sessions"
          title="Choose your practice"
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {offerings.map((offering) => (
            <OfferingCard {...offering} key={offering.title} />
          ))}
        </div>
      </PageSection>

      <PageSection>
        <SectionHeading align="center" title="What this supports" />
        <div className="mt-10">
          <BenefitGrid
            items={[
              "Nervous System Regulation",
              "Tension Release",
              "Embodiment",
              "Mental Clarity",
              "Emotional Processing",
              "Restorative Sleep",
            ]}
          />
        </div>
      </PageSection>

      <TestimonialQuote
        attribution="Grace R."
        context="Private yoga and sound guest"
        quote="I came in feeling scattered and left feeling like I had returned to myself. The movement was gentle, the sound was beautiful, and the whole session felt deeply intentional."
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
        title="Come back to your body."
      />
    </>
  )
}
