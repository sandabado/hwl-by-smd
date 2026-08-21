import Link from "next/link"
import { BookOpenText } from "lucide-react"

import { BreathingSection } from "@/components/shared/breathing-section"
import { BreathingText } from "@/components/shared/breathing-text"
import { NewsletterForm } from "@/components/shared/newsletter-form"
import { ParallaxWindow } from "@/components/shared/parallax-window"
import { Reveal } from "@/components/shared/reveal"
import { Card } from "@/components/ui/card"
import { media } from "@/lib/media"
import { seoJournalArticles } from "@/lib/seo-journal-articles"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "The Journal | HWL by SMD",
  description:
    "Notes from Shannon Mary Dixon's practice across beauty, yoga, astrology, tarot, and retreat living.",
  path: "/journal",
})

type JournalCategory =
  "Astrology" | "Beauty" | "Yoga" | "Tarot" | "Retreat Living"

type Article = {
  category: JournalCategory
  excerpt: string
  href?: string
  title: string
}

const articles: Article[] = [
  {
    category: "Tarot",
    title: seoJournalArticles["tarot-palm-springs"].h1,
    excerpt: seoJournalArticles["tarot-palm-springs"].metadata.description,
    href: "/journal/tarot-palm-springs",
  },
  {
    category: "Yoga",
    title: seoJournalArticles["sound-bath-joshua-tree"].h1,
    excerpt: seoJournalArticles["sound-bath-joshua-tree"].metadata.description,
    href: "/journal/sound-bath-joshua-tree",
  },
  {
    category: "Beauty",
    title: seoJournalArticles["desert-skincare"].h1,
    excerpt: seoJournalArticles["desert-skincare"].metadata.description,
    href: "/journal/desert-skincare",
  },
  {
    category: "Beauty",
    title: "What Can I Do at Home?",
    excerpt:
      "The most-asked question in the treatment room has a simple answer, and it's not a product.",
  },
  {
    category: "Beauty",
    title: "Lymphatic Drainage Is Not What You Think",
    excerpt:
      "Most people misunderstand what lymphatic drainage actually does and why it matters for the face.",
  },
  {
    category: "Yoga",
    title: "Bad at Yoga",
    excerpt:
      "There's no such thing. The belief is a symptom of performance culture, not a statement about your body.",
  },
  {
    category: "Yoga",
    title: "Sound Before Words",
    excerpt:
      "The nervous system responds to vibration before the brain can interpret it, which is why sound can reach places words do not.",
  },
  {
    category: "Tarot",
    title: "The Cards Don't Predict",
    excerpt:
      "Tarot is a reflective practice, not a predictive one. Understanding this distinction changes how readings work.",
  },
  {
    category: "Astrology",
    title: "Twenty Years of Symbols",
    excerpt:
      "Two decades studying astrology changes how you see the world—not because the stars control anything, but because patterns become visible.",
  },
  {
    category: "Retreat Living",
    title: "What the Desert Teaches",
    excerpt:
      "The desert is not empty. It's clear. That clarity is why people come here to reset.",
  },
  {
    category: "Retreat Living",
    title: "Meeting People Where They Are",
    excerpt:
      "Guests arrive seeking different things. The practice is reading what each person needs, not imposing a program.",
  },
  {
    category: "Retreat Living",
    title: "Host Responsibilities",
    excerpt:
      "A great retreat partnership is built on clarity: what Shannon brings, what the host provides, and where the practice comes alive.",
  },
]

const publishedArticles = articles.filter((article) => article.href)
const upcomingArticles = articles.filter((article) => !article.href)

function ArticleGrid({ items }: { items: Article[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {items.map(({ category, excerpt, href, title }, index) => (
        <Reveal as="article" delay={(index % 3) * 70} key={title}>
          <Card className="flex h-full min-h-80 flex-col rounded-[1.75rem] border-[var(--border)] bg-white/48 p-7 shadow-none transition-colors duration-500 hover:bg-white/68">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-medium tracking-[0.2em] text-[var(--accent)] uppercase">
                {category}
              </p>
              <BookOpenText
                className="size-4 text-[var(--accent)]"
                aria-hidden="true"
              />
            </div>
            <h3 className="mt-9 text-3xl leading-tight font-medium text-[var(--primary)]">
              {title}
            </h3>
            <p className="mt-6 flex-1 text-sm leading-[1.85] text-[var(--muted-foreground)]">
              {excerpt}
            </p>
            <Link
              className="mt-8 inline-flex items-center justify-between gap-3 border-t border-[var(--border)] pt-5 text-xs font-medium tracking-[0.12em] text-[var(--accent)] uppercase hover:text-[var(--primary)]"
              href={href ?? "/journal"}
            >
              Read article <span aria-hidden="true">→</span>
            </Link>
          </Card>
        </Reveal>
      ))}
    </div>
  )
}

export default function JournalPage() {
  return (
    <>
      <BreathingSection
        background="warm"
        className="flex min-h-[58svh] items-center"
        contentClassName="mx-auto w-full max-w-7xl px-6 text-center"
        padding="standard"
        reveal={false}
        variant="library"
      >
        <Reveal>
          <BreathingText
            as="h1"
            className="font-medium text-[var(--primary)]"
            size="hero"
          >
            Notes from the practice.
          </BreathingText>
          <BreathingText
            className="mx-auto mt-7 max-w-2xl text-[var(--muted-foreground)]"
            size="subheading"
          >
            Observations from Shannon&apos;s work — the patterns, the questions,
            the moments when something shifts. Take what&apos;s useful.
          </BreathingText>
        </Reveal>
      </BreathingSection>

      <BreathingSection
        background="gradient"
        contentClassName="mx-auto max-w-7xl px-6"
        id="journal-library"
        variant="library"
      >
        <div className="mb-12 text-center">
          <p className="text-xs font-medium tracking-[0.26em] text-[var(--accent)] uppercase">
            Published notes
          </p>
          <h2 className="mt-4 font-serif text-4xl text-[var(--primary)] md:text-5xl">
            Read from the practice.
          </h2>
        </div>
        <ArticleGrid items={publishedArticles} />

        <section
          aria-labelledby="coming-next-heading"
          className="mt-16 rounded-[2rem] border border-[var(--border)] bg-white/42 p-7 md:p-10"
        >
          <h2
            className="font-serif text-3xl text-[var(--primary)]"
            id="coming-next-heading"
          >
            Coming next
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
            Shannon is developing these notes from her practice. They will be
            published here when they are ready.
          </p>
          <ul className="mt-8 grid gap-x-10 gap-y-4 md:grid-cols-2">
            {upcomingArticles.map((article) => (
              <li
                className="flex items-start justify-between gap-4 border-t border-[var(--border)] pt-4"
                key={article.title}
              >
                <span className="font-serif text-lg text-[var(--primary)]">
                  {article.title}
                </span>
                <span className="shrink-0 text-[10px] tracking-[0.16em] text-[var(--accent)] uppercase">
                  {article.category}
                </span>
              </li>
            ))}
          </ul>
          <Link
            className="mt-8 inline-flex min-h-11 items-center rounded-full border border-[var(--primary)] px-6 text-sm font-medium text-[var(--primary)] transition hover:bg-[var(--primary)] hover:text-white"
            href="/store#the-den"
          >
            Explore The Den
          </Link>
        </section>
      </BreathingSection>

      <BreathingSection
        background="cool"
        contentClassName="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[0.82fr_1.18fr]"
        id="journal-notes"
        variant="library"
      >
        <ParallaxWindow
          alt={media.editorial.liftBotanicals.alt}
          aspectRatio="4 / 5"
          imageClassName="object-cover"
          sizes="(max-width: 1023px) 92vw, 36vw"
          speed={0.08}
          src={media.editorial.liftBotanicals.src}
          texture="paper"
        />
        <div>
          <p className="text-xs font-medium tracking-[0.28em] text-[var(--accent)] uppercase">
            Notes from Shannon
          </p>
          <BreathingText
            as="h2"
            className="mt-5 font-medium text-[var(--primary)]"
            size="heading"
          >
            Let the first stories find you.
          </BreathingText>
          <BreathingText
            className="mt-7 text-[var(--muted-foreground)]"
            size="body"
          >
            Request new reflections on beauty, body, being, and the spaces that
            hold us.
          </BreathingText>
          <NewsletterForm />
        </div>
      </BreathingSection>
    </>
  )
}
