import type { Metadata } from "next"

import {
  FaqAccordion,
  InfoListCard,
  InteriorHero,
  LinkCard,
  OfferingCard,
  PageSection,
} from "@/components/shared/internal-page"
import { CtaBlock } from "@/components/shared/cta-block"
import { SectionHeading } from "@/components/shared/section-heading"
import { TestimonialQuote } from "@/components/shared/testimonial-quote"

export const metadata: Metadata = {
  title: "Retreat Partnerships | HWL by SMD",
  description:
    "Custom beauty, movement, and ritual programming for boutique retreats, luxury hospitality, private groups, and destination events.",
}

const process = [
  {
    title: "Step 1 — Consultation",
    description:
      "We discuss the retreat, intention, setting, guest profile, timing, and the feeling you want the experience to create.",
  },
  {
    title: "Step 2 — Custom Programming",
    description:
      "Shannon creates a tailored wellness arc across beauty, movement, ritual, intuitive guidance, and restoration.",
  },
  {
    title: "Step 3 — Facilitation",
    description:
      "Shannon arrives prepared, the space is held with care, and guests are guided through a seamless experience.",
  },
]

const faqs = [
  {
    question: "How far in advance should we book?",
    answer:
      "Ten to fourteen days is preferred for local experiences. Destination retreats and larger groups should reach out earlier when possible.",
  },
  {
    question: "Can programming be customized?",
    answer:
      "Yes. Retreat partnerships are designed around the host's intention, guest needs, location, and schedule.",
  },
  {
    question: "Can guests choose different experiences?",
    answer:
      "Yes. A retreat can include group experiences, one-on-one sessions, or a blend of both.",
  },
  {
    question: "What equipment is needed?",
    answer:
      "Shannon provides core facilitation materials. Host needs are discussed during planning and depend on the final program.",
  },
  {
    question: "Do you travel?",
    answer:
      "Yes. There is no travel fee in the Coachella Valley. Travel outside the area is quoted based on distance, lodging, and event scope.",
  },
]

export default function RetreatsPage() {
  return (
    <>
      <InteriorHero
        eyebrow="Experiences"
        title="Curated wellness for unforgettable gatherings"
        subtitle="Custom beauty, movement, and ritual programming for boutique retreats, luxury hospitality, private groups, and destination events."
        variant="retreat"
      />

      <PageSection>
        <SectionHeading align="center" title="Create the atmosphere" />
        <div className="mx-auto mt-8 max-w-3xl space-y-5 text-center text-lg leading-relaxed text-[var(--muted-foreground)]">
          <p>
            A memorable retreat is not only about the schedule. It is about the
            atmosphere guests enter, the care they receive, and the way each
            moment helps them soften, connect, and remember themselves.
          </p>
          <p>
            With experience across beauty, movement, ritual, sound, Reiki,
            aromatherapy, and intuitive guidance, Shannon designs full-spectrum
            wellness programming that feels refined, grounded, and deeply
            personal.
          </p>
        </div>
      </PageSection>

      <PageSection className="bg-white/35">
        <SectionHeading
          align="center"
          eyebrow="The Process"
          title="How retreat partnerships work"
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {process.map((step) => (
            <OfferingCard {...step} key={step.title} />
          ))}
        </div>
      </PageSection>

      <PageSection>
        <SectionHeading align="center" title="What's Available" />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <LinkCard
            description="Express facials, signature retreat facials, beauty rituals, and Reiki aromatherapy healing."
            href="/experiences/beauty"
            label="Explore beauty"
            title="Beauty Experiences"
          />
          <LinkCard
            description="Private yoga, restorative movement, mobility, sound healing, breathwork, and meditation."
            href="/experiences/movement"
            label="Explore movement"
            title="Movement & Restoration"
          />
          <LinkCard
            description="Seasonal ceremonies, astrology workshops, solstice and equinox rituals, and intention setting."
            href="/experiences/ritual"
            label="Explore ritual"
            title="Ritual & Seasonal"
          />
          <LinkCard
            description="Tarot, moon oracle readings, Reiki integration, and private intuitive support."
            href="/experiences/ritual"
            label="Explore guidance"
            title="Intuitive Guidance"
          />
        </div>
      </PageSection>

      <PageSection className="bg-white/35">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <SectionHeading title="Capacity & Daily Limits" />
            <div className="mt-8 overflow-hidden rounded-lg border border-[var(--border)] bg-white/60">
              {[
                [
                  "Movement, sound healing, ritual, workshops",
                  "Up to 40+ guests",
                ],
                ["Private facials or one-on-one sessions", "Up to 5 per day"],
                ["Express facials", "Up to 15 guests"],
              ].map(([type, capacity]) => (
                <div
                  className="grid gap-2 border-b border-[var(--border)] p-5 last:border-b-0 sm:grid-cols-[1fr_auto]"
                  key={type}
                >
                  <span className="font-medium text-[var(--primary)]">
                    {type}
                  </span>
                  <span className="text-sm text-[var(--accent)]">
                    {capacity}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionHeading title="Investment by Group Size" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ["Small Group", "Up to 8", "Starting at $1,555/day"],
                ["Medium Group", "9-15", "Starting at $2,222/day"],
                ["Large Group", "16-24", "Starting at $3,333/day"],
                ["Extra Large", "25-40+", "Custom Proposal"],
              ].map(([title, size, price]) => (
                <OfferingCard
                  description={size}
                  details={[price]}
                  key={title}
                  title={title}
                />
              ))}
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection>
        <SectionHeading align="center" title="Logistics" />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <InfoListCard
            items={[
              "Custom wellness program design",
              "Beauty, movement, sound, ritual, and guidance facilitation",
              "Core treatment and ritual materials",
              "Guest-centered flow and energetic care",
            ]}
            title="Shannon Provides"
          />
          <InfoListCard
            items={[
              "A quiet, clean, intentional space",
              "Access to power and water when treatments require it",
              "Guest schedule and point of contact",
              "Lodging and travel coordination when outside the region",
            ]}
            title="Host Provides"
          />
        </div>
        <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-relaxed text-[var(--muted-foreground)]">
          No travel fee applies within the Coachella Valley. Additional travel
          fees apply outside the region. Booking 10-14 days in advance is
          preferred.
        </p>
      </PageSection>

      <TestimonialQuote
        attribution="Retreat host"
        context="Private destination gathering"
        quote="Shannon created the kind of care guests remember. Every detail felt intentional, luxurious, and deeply calming."
      />

      <PageSection className="bg-white/35">
        <SectionHeading align="center" title="Questions" />
        <div className="mt-8">
          <FaqAccordion items={faqs} />
        </div>
      </PageSection>

      <CtaBlock
        primaryHref="/contact"
        primaryLabel="Request a Retreat Proposal"
        title="Let's create something extraordinary."
      />
    </>
  )
}
