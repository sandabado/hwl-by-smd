import Link from "next/link"
import type { Metadata } from "next"

import { InteriorHero, PageSection } from "@/components/shared/internal-page"
import { CtaBlock } from "@/components/shared/cta-block"
import { SectionHeading } from "@/components/shared/section-heading"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "The Journal | HWL by SMD",
  description:
    "Thoughtful writing on beauty, movement, ritual, and the art of living well. Essays, guides, and reflections from Shannon Mary Dixon.",
}

type Article = [string, string, string]

const articles: Record<string, Article[]> = {
  beauty: [
    [
      "Beauty",
      "Why your skin changes when your nervous system is tired",
      "A reflection on stress, facial tension, and the deeper language of glow.",
    ],
    [
      "Beauty",
      "The case for five minutes of facial massage",
      "How a simple daily ritual can support circulation, release, and care.",
    ],
    [
      "Beauty",
      "What makes a facial feel restorative",
      "The difference between treatment and true nervous system-informed care.",
    ],
  ],
  movement: [
    [
      "Movement",
      "Movement as a return, not a punishment",
      "Reframing yoga, mobility, and breath as invitations back into the body.",
    ],
    [
      "Movement",
      "Why sound helps the body soften",
      "Crystal singing bowls, vibration, and the quiet intelligence of rest.",
    ],
    [
      "Movement",
      "The body after performance",
      "Lessons from athletics, recovery, and the practice of gentle strength.",
    ],
  ],
  ritual: [
    [
      "Ritual",
      "How to mark a threshold",
      "Simple ways to honor beginnings, endings, and seasonal transitions.",
    ],
    [
      "Ritual",
      "Astrology as a reflective practice",
      "Using timing and symbolism without losing your grounded center.",
    ],
    [
      "Ritual",
      "The quiet power of intention",
      "Why naming what matters can change the way you move through a season.",
    ],
  ],
  retreats: [
    [
      "Retreat Living",
      "What makes a retreat unforgettable",
      "Atmosphere, pacing, care, and the invisible architecture of restoration.",
    ],
    [
      "Retreat Living",
      "Designing wellness for groups",
      "How to create programming that feels spacious, refined, and personal.",
    ],
    [
      "Retreat Living",
      "The beauty of destination rituals",
      "Why place, season, and ceremony belong together.",
    ],
  ],
}

function ArticleGrid({ items }: { items: Array<[string, string, string]> }) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {items.map(([category, title, excerpt]) => (
        <Card
          className="rounded-lg border-[var(--border)] bg-white/55 p-6"
          key={title}
        >
          <p className="text-xs font-medium tracking-[0.2em] text-[var(--accent)] uppercase">
            {category}
          </p>
          <h3 className="mt-4 text-2xl leading-tight font-medium text-[var(--primary)]">
            {title}
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
            {excerpt}
          </p>
          <Link
            className="mt-6 inline-flex text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline"
            href="/journal"
          >
            Read more
          </Link>
        </Card>
      ))}
    </div>
  )
}

export default function JournalPage() {
  return (
    <>
      <InteriorHero
        eyebrow="The Journal"
        title="Stories, rituals, and reflections"
        subtitle="Thoughtful writing on beauty, movement, ritual, and the art of living well."
        variant="desert"
      />

      <PageSection>
        <SectionHeading
          align="center"
          subtitle="Browse essays and practical guides by collection."
          title="Collections"
        />
        <nav className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-3">
          {[
            ["Beauty", "#beauty"],
            ["Movement", "#movement"],
            ["Ritual", "#ritual"],
            ["Retreat Living", "#retreats"],
          ].map(([label, href]) => (
            <Link
              className="rounded-full border border-[var(--border)] bg-white/60 px-4 py-2 text-sm text-[var(--primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              href={href}
              key={href}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-14 space-y-16">
          {[
            ["beauty", "Beauty", articles.beauty],
            ["movement", "Movement", articles.movement],
            ["ritual", "Ritual", articles.ritual],
            ["retreats", "Retreat Living", articles.retreats],
          ].map(([id, title, items]) => (
            <section id={id as string} key={id as string}>
              <h2 className="mb-6 text-3xl font-medium text-[var(--primary)]">
                {title as string}
              </h2>
              <ArticleGrid items={items as Article[]} />
            </section>
          ))}
        </div>
      </PageSection>

      <CtaBlock
        primaryHref="/contact"
        primaryLabel="Subscribe"
        subtitle="Join the journal for thoughtful notes on beauty, movement, and ritual."
        title="Never miss an insight."
      />
    </>
  )
}
