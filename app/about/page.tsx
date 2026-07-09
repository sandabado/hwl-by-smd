import type { Metadata } from "next"

import {
  InfoListCard,
  InteriorHero,
  PageSection,
} from "@/components/shared/internal-page"
import { CtaBlock } from "@/components/shared/cta-block"
import { SectionHeading } from "@/components/shared/section-heading"

export const metadata: Metadata = {
  title: "Meet Shannon | HWL by SMD",
  description:
    "Licensed aesthetician, yoga instructor, and wellness facilitator guiding transformation through beauty, movement, ritual, and restoration.",
}

const journey = [
  {
    title: "The Ice Rink",
    body: "Long before the treatment room or the yoga studio, there was the ice rink. As an elite figure skater, I learned what it means to inhabit your body fully. Discipline. Resilience. Presence under pressure. The ability to perform when every nerve is firing and every muscle is engaged. Figure skating taught me the language of the body — how it communicates, how it compensates, how it heals, and how it holds. That foundation shaped everything that followed.",
  },
  {
    title: "Beauty",
    body: "My work in beauty opened a different door. In the treatment room, I discovered the power of care and touch — how skilled, intentional hands can communicate safety to the nervous system. How a facial isn't just about skin — it's about creating a moment where someone feels deeply cared for. I became a licensed aesthetician and developed my own daily facial massage ritual — the LIFT guide — because I saw, again and again, how transformative consistent, intentional touch could be.",
  },
  {
    title: "Movement",
    body: "Yoga came next. Not as a fitness pursuit, but as a counterpoint to the intensity of competitive athletics. I trained as a 500-hour yoga instructor and found that movement — when guided with intention — could teach embodiment. But this time, the goal wasn't performance. It was reconnection. I added sound healing to my practice — crystal singing bowls, guided meditation, breathwork. The first time I witnessed what sound could do to a nervous system — the visible downshift from tension to rest — I knew it would become part of everything I offer.",
  },
  {
    title: "Ritual",
    body: "Alongside beauty and movement, I spent more than two decades studying astrology, symbolism, ritual, tarot, energetics, and personal transformation. These weren't hobbies — they were disciplines. Frameworks for understanding the human experience from angles that logic and willpower alone can't reach. I trained as a Reiki practitioner and aromatherapy specialist. I began facilitating seasonal ceremonies — solstice and equinox rituals, astrology workshops, intention-setting gatherings. I learned that ritual creates containers. It gives people permission to feel, reflect, and mark the thresholds of their lives with intention rather than letting them pass unnoticed.",
  },
]

const credentials = [
  {
    title: "Professional Licenses",
    items: [
      "Licensed Aesthetician",
      "500-Hour Registered Yoga Instructor (RYT-500)",
      "Certified Reiki Practitioner",
      "Aromatherapy Specialist",
      "Wellness Facilitator",
    ],
  },
  {
    title: "Advanced Modalities",
    items: [
      "LED light therapy",
      "Microcurrent facial toning",
      "Oxygen therapy",
      "High frequency treatment",
      "Lymphatic drainage massage",
      "Therapeutic and sculpting facial massage",
    ],
  },
  {
    title: "Areas of Study",
    items: [
      "Astrology (20+ years)",
      "Tarot and intuitive guidance",
      "Symbolism and archetypal psychology",
      "Seasonal ritual and ceremonial practice",
      "Energetics and energy healing",
      "Crystal singing bowl sound healing",
      "Breathwork and guided meditation",
    ],
  },
]

export default function AboutPage() {
  return (
    <>
      <InteriorHero
        eyebrow="About"
        title="Meet Shannon"
        subtitle="Licensed Aesthetician · 500hr Yoga Instructor · Reiki Practitioner · Aromatherapy Specialist · Wellness Facilitator"
        variant="desert"
      />

      <PageSection>
        <SectionHeading
          align="center"
          eyebrow="The Philosophy"
          title="Why this work matters"
        />
        <div className="mx-auto mt-8 max-w-2xl space-y-5 text-center text-lg leading-relaxed text-[var(--muted-foreground)]">
          <p>
            I feel most alive creating experiences that blend beauty, movement,
            ritual, touch, and transformation.
          </p>
          <p>
            Some guests arrive seeking restoration. Others arrive seeking
            clarity, inspiration, connection, confidence, healing, or simply
            space to breathe. My role is to meet people where they are and
            create experiences that support both outer well-being and inner
            renewal.
          </p>
          <p className="text-[var(--primary)]">
            My goal is always the same: to help people remember what it feels
            like to be fully alive.
          </p>
        </div>
      </PageSection>

      <PageSection className="bg-white/35">
        <SectionHeading align="center" title="The Journey" />
        <div className="mt-12 grid gap-10">
          {journey.map((item, index) => (
            <article
              className="grid items-center gap-8 md:grid-cols-2"
              key={item.title}
            >
              <div className={index % 2 === 1 ? "md:order-2" : ""}>
                <h3 className="text-2xl font-medium text-[var(--primary)]">
                  {item.title}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)]">
                  {item.body}
                </p>
              </div>
              <div className="aspect-[4/3] rounded-lg bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.65),transparent_32%),linear-gradient(135deg,var(--muted),rgba(196,168,130,0.28))]" />
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection>
        <SectionHeading
          align="center"
          eyebrow="Integration"
          title="One method. One philosophy."
        />
        <div className="mx-auto mt-8 max-w-3xl space-y-5 text-center text-lg leading-relaxed text-[var(--muted-foreground)]">
          <p>
            Eventually, I stopped seeing these as separate practices and started
            seeing them as one. Beauty, movement, ritual, and nervous system
            restoration — they&apos;re not a menu of services. They&apos;re a
            continuum. A method. A way of caring for the whole person — skin,
            body, energy, and spirit.
          </p>
          <p>
            I call it the Beauty · Movement · Ritual Method. It&apos;s the
            framework behind everything I create — from a 20-minute express
            facial to a multi-day destination retreat.
          </p>
        </div>
      </PageSection>

      <PageSection className="bg-white/35">
        <SectionHeading align="center" title="Training & Certifications" />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {credentials.map((column) => (
            <InfoListCard
              items={column.items}
              key={column.title}
              title={column.title}
            />
          ))}
        </div>
        <p className="mt-8 text-center text-sm font-medium tracking-[0.18em] text-[var(--accent)] uppercase">
          Former elite figure skater · Actress
        </p>
      </PageSection>

      <CtaBlock
        primaryHref="/book"
        primaryLabel="Book an Experience"
        secondaryHref="/lift"
        secondaryLabel="Explore the LIFT Guide"
        subtitle="Whether you're booking a single experience, planning a retreat, or simply curious about the work — I'd love to hear from you."
        title="Let's begin"
      />
    </>
  )
}
