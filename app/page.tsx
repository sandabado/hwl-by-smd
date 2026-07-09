import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { CtaBlock } from "@/components/shared/cta-block"
import { FadeIn } from "@/components/shared/fade-in"
import { PillarCard } from "@/components/shared/pillar-card"
import { SectionHeading } from "@/components/shared/section-heading"
import { TestimonialQuote } from "@/components/shared/testimonial-quote"
import { WaveHero } from "@/components/shared/wave-hero"
import { Button } from "@/components/ui/button"

const journalCards = [
  {
    category: "Beauty",
    title: "Why Facial Massage Belongs in Your Morning Routine",
  },
  {
    category: "Ritual",
    title: "Honoring the New Moon: A Simple Practice for Intention Setting",
  },
  {
    category: "Movement",
    title: "Breathwork for Nervous System Regulation — Where to Begin",
  },
]

export default function Page() {
  return (
    <>
      <section className="relative -mt-16 flex min-h-screen items-center overflow-hidden px-6 pt-16 md:-mt-20 md:pt-20">
        <WaveHero variant="desert" />
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <p className="mb-5 hidden text-xs font-medium tracking-[0.28em] text-[var(--accent)] uppercase sm:block">
            HWL by SMD
          </p>
          <h1 className="gentle-breath mx-auto max-w-4xl text-4xl leading-tight font-medium text-[var(--primary)] md:text-6xl lg:text-7xl">
            Beauty begins where restoration meets ritual.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted-foreground)] md:text-lg">
            Luxury facial rituals, movement, and intentional wellness
            experiences designed to restore your glow from the inside out.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button
              asChild
              className="h-10 rounded-full bg-[var(--primary)] px-6 text-white hover:bg-[var(--accent)]"
            >
              <Link href="/book">Book an Experience</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-full border-[var(--border)] bg-transparent px-6 text-[var(--primary)] hover:bg-[var(--background)]"
            >
              <Link href="/about">Explore the Philosophy</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center md:py-32">
        <FadeIn>
          <SectionHeading
            eyebrow="The Philosophy"
            title="Beauty is more than skin deep."
            align="center"
          />
          <div className="mt-8 space-y-6 text-base leading-relaxed text-[var(--foreground)] md:text-lg">
            <p>
              True well-being doesn&apos;t live in one lane. It emerges when
              body, beauty, and being are nourished together — when skincare
              becomes ritual, movement becomes medicine, and stillness becomes a
              practice rather than an accident.
            </p>
            <p>
              My work lives at the intersection of beauty, movement, ritual, and
              nervous system restoration. Whether I&apos;m guiding a private
              yoga session, facilitating a seasonal ceremony, offering sound
              healing, or creating a luxury facial experience, my intention is
              always the same: to help you reconnect with yourself, restore
              balance, and leave feeling more grounded, radiant, embodied, and
              alive.
            </p>
          </div>
          <p className="mt-8 font-serif text-sm text-[var(--accent)] italic">
            — Shannon Mary Dixon, Founder of HWL by SMD
          </p>
          <Link
            href="/about"
            className="mt-6 inline-block text-sm font-medium text-[var(--accent)] underline underline-offset-4"
          >
            Read Shannon&apos;s Story
          </Link>
        </FadeIn>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:py-32">
        <SectionHeading
          eyebrow="Experiences"
          title="Four pillars. One philosophy."
          align="center"
        />
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <PillarCard
            title="Beauty"
            description="Luxury facial rituals that restore healthy skin while creating space to slow down."
            href="/experiences/beauty"
          />
          <PillarCard
            title="Movement"
            description="Private yoga, restorative movement, and sound healing to reconnect with your body."
            href="/experiences/movement"
          />
          <PillarCard
            title="Ritual"
            description="Seasonal gatherings, astrology, Reiki, meditation, and intentional ceremony."
            href="/experiences/ritual"
          />
          <PillarCard
            title="Retreats"
            description="Custom wellness programming for boutique retreats, luxury hospitality, and private groups."
            href="/experiences/retreats"
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-32">
        <div className="aspect-[4/5] rounded-lg bg-[var(--muted)]" />
        <div>
          <p className="mb-4 text-xs font-medium tracking-[0.24em] text-[var(--accent)] uppercase">
            Meet Shannon
          </p>
          <h2 className="text-3xl leading-tight font-medium text-[var(--primary)] md:text-4xl">
            Meet Shannon
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-[var(--foreground)]">
            <p>
              I&apos;m a licensed aesthetician, 500-hour yoga instructor, Reiki
              practitioner, aromatherapy specialist, and wellness facilitator.
              But long before the certifications, there was the ice rink.
            </p>
            <p>
              As a former elite figure skater, I learned discipline, embodiment,
              and presence — what it means to inhabit your body fully. That
              foundation shaped everything that followed. My work in beauty
              taught me the power of care and touch. My years in yoga, energy
              work, astrology, and ritual taught me how to create spaces where
              meaningful transformation can occur.
            </p>
            <p>
              Whether through movement, beauty, sound, astrology, or ritual, my
              goal is always the same: to help you remember what it feels like
              to be fully alive.
            </p>
          </div>
          <Link
            href="/about"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] underline underline-offset-4"
          >
            Read the Full Story
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <section className="lift-gradient-shift px-6 py-20 text-[var(--background)] md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs font-medium tracking-[0.24em] text-[var(--accent)] uppercase">
            The Facial Massage Guide
          </p>
          <h2 className="text-4xl leading-tight font-medium md:text-5xl">
            LIFT — A Daily Ritual
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed opacity-85">
            <p>
              One of the questions I hear most often in the treatment room is,
              &apos;What can I do at home to lift, sculpt, and support my skin
              as I age?&apos; My answer is almost always the same: facial
              massage.
            </p>
            <p>
              This isn&apos;t about adding another twenty-minute ritual to your
              day. It&apos;s about making the few minutes you&apos;re already
              spending on your skincare more intentional. Even five minutes a
              day can make a meaningful difference.
            </p>
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-[var(--accent)]">
            7 guided movements · 5-minute daily sequence · Step-by-step
            technique · Printable version included
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              asChild
              className="h-10 rounded-full bg-[var(--background)] px-6 text-[var(--primary)] hover:bg-[var(--accent)] hover:text-white"
            >
              <Link href="/lift">Explore the Guide</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-full border-[var(--background)] bg-transparent px-6 text-[var(--background)] hover:bg-white/10"
            >
              <Link href="/lift">Download the Printable PDF</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:py-32">
        <SectionHeading
          eyebrow="Kind Words"
          title="What guests are saying"
          align="center"
        />
        <TestimonialQuote
          quote="The celestial and aromatherapy elements of the class are so fascinating and comforting. The flow is just challenging enough to be a great workout, while still offering lots of modifications free of judgment. Such an empowering and healing space — Shannon is so wonderful and knowledgeable!"
          attribution="Grace R."
          context="Astrology + Yoga Client"
        />
        <TestimonialQuote
          quote="What a wonderful experience! I went in for a facial before my wedding feeling quite stressed, but felt immediately soothed once Shannon started working her magic. My skin is still showing the happy effects. Honestly, I would pay again just to have that meditative experience!"
          attribution="Zara K."
          context="Beauty + Facial Client"
        />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:py-32">
        <SectionHeading
          eyebrow="The Journal"
          title="Stories, rituals, and reflections"
          align="center"
        />
        <p className="mx-auto mt-4 max-w-xl text-center text-base leading-relaxed text-[var(--muted-foreground)]">
          Thoughtful writing on beauty, movement, ritual, and the art of living
          well.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {journalCards.map((card) => (
            <article
              key={card.title}
              className="rounded-lg border border-[var(--border)] bg-white/50 p-6"
            >
              <p className="text-xs font-medium tracking-[0.22em] text-[var(--accent)] uppercase">
                {card.category}
              </p>
              <h3 className="mt-5 text-2xl leading-tight font-medium text-[var(--primary)]">
                {card.title}
              </h3>
              <p className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
                Read more
                <ArrowRight className="size-4" />
              </p>
            </article>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/journal"
            className="text-sm font-medium text-[var(--accent)] underline underline-offset-4"
          >
            Read the Journal
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 py-20 text-center md:py-32">
        <h2 className="text-3xl font-medium text-[var(--primary)]">
          Stay connected
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)]">
          Receive seasonal rituals, wellness inspiration, facial massage tips,
          and early access to retreats and gatherings — straight to your inbox.
          No noise, no spam, just thoughtful notes from time to time.
        </p>
        <form className="mx-auto mt-8 flex max-w-md flex-col gap-4 sm:flex-row">
          <input
            type="email"
            placeholder="Your email address"
            aria-label="Email address"
            className="min-h-10 flex-1 rounded-full border border-[var(--border)] bg-white/60 px-4 py-2 text-sm transition outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)]"
          />
          <Button className="h-10 rounded-full bg-[var(--primary)] px-6 text-white hover:bg-[var(--accent)]">
            Join
          </Button>
        </form>
        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          No spam, ever. Unsubscribe anytime.
        </p>
      </section>

      <CtaBlock
        title="Let's create something extraordinary."
        subtitle="Beauty experiences, private sessions, seasonal rituals, and custom retreat programming — available in the Coachella Valley and for destination events."
        primaryLabel="Book an Experience"
        primaryHref="/book"
        secondaryLabel="Contact Shannon"
        secondaryHref="/contact"
      />
    </>
  )
}
