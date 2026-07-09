import Link from "next/link"
import type { Metadata } from "next"

import {
  BenefitGrid,
  FaqAccordion,
  InfoListCard,
  InteriorHero,
  OfferingCard,
  PageSection,
} from "@/components/shared/internal-page"
import { CtaBlock } from "@/components/shared/cta-block"
import { SectionHeading } from "@/components/shared/section-heading"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "LIFT — Daily Facial Massage Guide | HWL by SMD",
  description:
    "A simple facial massage practice with lasting results. Seven movements. Five minutes a day. Developed by aesthetician Shannon Mary Dixon.",
}

const sequence = [
  [
    "Prep the Skin",
    "Cleanse + nourish",
    "Begin with clean hands, cleansed skin, and a facial oil or balm with enough slip.",
    "Supports ease, glide, and intentional touch.",
  ],
  [
    "Jawline Lift",
    "Lift + Release",
    "Use gentle upward strokes from chin toward ear, pausing to soften tension at the jaw.",
    "Supports sculpting, tension release, and facial relaxation.",
  ],
  [
    "Mid-Face Sculpt",
    "Lift + Define",
    "Sweep from the center of the face outward beneath cheekbones with steady pressure.",
    "Supports circulation, contour, and healthy glow.",
  ],
  [
    "Brow Lift",
    "Lift + Open",
    "Glide from the inner brow outward, then press gently along the brow bone.",
    "Supports openness around the eyes and forehead.",
  ],
  [
    "Forehead Release",
    "Release + Smooth",
    "Move upward and outward across the forehead, softening expression lines and tension.",
    "Supports relaxation and smoothing.",
  ],
  [
    "Lymphatic Sweep",
    "Drain + De-Puff",
    "Sweep from the center of the face toward the ears with feather-light pressure.",
    "Supports lymphatic flow and reduced puffiness.",
  ],
  [
    "Neck Drainage",
    "Drain + Release",
    "Finish with downward sweeps from behind the ears along the neck toward the collarbones.",
    "Supports drainage, softness, and completion.",
  ],
]

const faqs = [
  {
    question: "How long does LIFT take?",
    answer:
      "The full sequence is designed to take about five minutes once you learn the rhythm.",
  },
  {
    question: "What product should I use?",
    answer:
      "Use a facial oil, balm, or moisturizer with enough slip so your hands glide without pulling the skin.",
  },
  {
    question: "When will I see results?",
    answer:
      "Many people feel calmer immediately. Visible changes are usually most noticeable with consistent daily practice.",
  },
  {
    question: "Can I do this with sensitive skin?",
    answer:
      "Yes, but use very light pressure and skip any area that feels irritated or inflamed.",
  },
  {
    question: "Morning or night?",
    answer:
      "Either works. Morning supports de-puffing and glow; evening supports release and relaxation.",
  },
  {
    question: "Do I need tools?",
    answer:
      "No. Your hands are enough. Tools can be added later, but they are not required.",
  },
]

export default function LiftPage() {
  return (
    <>
      <InteriorHero
        actions={
          <>
            <Button
              asChild
              className="rounded-full bg-[var(--primary)] px-6 text-white hover:bg-[var(--accent)]"
            >
              <Link href="#sequence">Begin the Ritual</Link>
            </Button>
            <Button
              asChild
              className="rounded-full border-[var(--border)] bg-transparent px-6 text-[var(--primary)] hover:bg-[var(--muted)]"
              variant="outline"
            >
              <Link href="#download">Download the Printable Guide</Link>
            </Button>
          </>
        }
        eyebrow="The Facial Massage Guide"
        particles
        title="LIFT — A Daily Ritual"
        subtitle="A simple facial massage practice with lasting results. Seven movements. Five minutes a day."
        variant="guidance"
      />

      <PageSection>
        <SectionHeading
          align="center"
          eyebrow="Welcome"
          title="I'm so glad you're here."
        />
        <div className="mx-auto mt-8 max-w-3xl space-y-5 text-center text-lg leading-relaxed text-[var(--muted-foreground)]">
          <p>
            LIFT was created as a simple daily practice you can return to again
            and again. It is not about fixing your face. It is about caring for
            it with consistency, reverence, and touch that tells the nervous
            system it is safe to soften.
          </p>
          <p>
            These seven movements are designed to support circulation, lymphatic
            flow, sculpting, release, and glow. More than anything, they invite
            you to slow down and spend five intentional minutes with yourself.
          </p>
        </div>
      </PageSection>

      <PageSection className="bg-white/35">
        <SectionHeading align="center" title="The Benefits" />
        <div className="mt-10">
          <BenefitGrid
            items={[
              "Supports Circulation",
              "Reduces Puffiness",
              "Releases Facial Tension",
              "Encourages Lymphatic Flow",
              "Improves Product Absorption",
              "Creates Daily Ritual",
            ]}
          />
        </div>
        <p className="mx-auto mt-8 max-w-3xl text-center text-lg leading-relaxed text-[var(--muted-foreground)]">
          Beyond skin deep, facial massage becomes a moment of nervous system
          restoration. Your face holds stress, expression, emotion, and effort.
          LIFT gives you a way to meet that holding with care.
        </p>
      </PageSection>

      <PageSection>
        <SectionHeading align="center" title="Before You Begin" />
        <div className="mt-10 grid gap-5 md:grid-cols-5">
          {[
            "Clean Hands/Cleansed Skin",
            "Work Into Routine",
            "Gentle Pressure",
            "Don't Skip Neck",
            "Consistency Is Key",
          ].map((item) => (
            <InfoListCard items={[item]} key={item} title={item} />
          ))}
        </div>
      </PageSection>

      <PageSection className="bg-white/35" id="sequence">
        <SectionHeading
          align="center"
          eyebrow="The Ritual"
          title="The 5-Minute Sequence"
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {sequence.map(([title, focus, instructions, supports], index) => (
            <OfferingCard
              description={`${instructions} ${supports}`}
              details={[`${index + 1}`, focus]}
              key={title}
              title={title}
            />
          ))}
          <OfferingCard
            description="Press your hands gently over your heart, take one full breath, and notice the glow you created."
            details={["Optional"]}
            title="Glow Finish"
          />
        </div>
      </PageSection>

      <PageSection id="download">
        <SectionHeading align="center" title="Download the Printable Guide" />
        <form className="mx-auto mt-8 grid max-w-xl gap-4 rounded-lg border border-[var(--border)] bg-white/55 p-6">
          <label className="grid gap-2 text-sm text-[var(--primary)]">
            Email address
            <input
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--accent)]"
              name="email"
              type="email"
            />
          </label>
          <Button className="rounded-full bg-[var(--primary)] text-white hover:bg-[var(--accent)]">
            Send the Guide
          </Button>
          <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
            Your email is used only to send the guide and occasional thoughtful
            notes from HWL by SMD.
          </p>
        </form>
      </PageSection>

      <PageSection className="bg-white/35">
        <SectionHeading align="center" title="Questions" />
        <div className="mt-8">
          <FaqAccordion items={faqs} />
        </div>
      </PageSection>

      <CtaBlock
        primaryHref="/experiences/beauty"
        primaryLabel="Book a Beauty Experience"
        title="Ready to experience this in person?"
      />
    </>
  )
}
