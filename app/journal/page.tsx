import Link from "next/link"
import { BookOpenText } from "lucide-react"

import { BreathingSection } from "@/components/shared/breathing-section"
import { BreathingText } from "@/components/shared/breathing-text"
import { Reveal } from "@/components/shared/reveal"
import { Card } from "@/components/ui/card"
import { seoJournalArticles } from "@/lib/seo-journal-articles"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "The Journal | HWL by SMD",
  description:
    "Notes from Shannon Mary Dixon's practice across beauty, yoga, astrology, tarot, and retreat living.",
  path: "/journal",
})

type JournalCategory = "Beauty" | "Sound" | "Tarot"

type Article = {
  category: JournalCategory
  excerpt: string
  href: string
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
    category: "Sound",
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
]

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
              aria-label={`Read ${title}`}
              className="mt-8 inline-flex items-center justify-between gap-3 border-t border-[var(--border)] pt-5 text-xs font-medium tracking-[0.12em] text-[var(--accent)] uppercase hover:text-[var(--primary)]"
              href={href}
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
        className="flex min-h-[46svh] items-center"
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
        <ArticleGrid items={articles} />
      </BreathingSection>
    </>
  )
}
