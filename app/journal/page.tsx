import Link from "next/link"
import { BookOpenText } from "lucide-react"

import { BreathingSection } from "@/components/shared/breathing-section"
import { BreathingText } from "@/components/shared/breathing-text"
import { NewsletterForm } from "@/components/shared/newsletter-form"
import { ParallaxWindow } from "@/components/shared/parallax-window"
import { Reveal } from "@/components/shared/reveal"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { media } from "@/lib/media"
import { seoJournalArticles } from "@/lib/seo-journal-articles"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "The Journal | HWL by SMD",
  description: "Stories, rituals, and reflections from Shannon Mary Dixon.",
  path: "/journal",
})

type JournalCategory = "Beauty" | "Being" | "Body" | "Retreat Living"

type Article = {
  category: JournalCategory
  excerpt: string
  href?: string
  title: string
}

const articles: Article[] = [
  {
    category: "Being",
    title: seoJournalArticles["tarot-palm-springs"].h1,
    excerpt: seoJournalArticles["tarot-palm-springs"].metadata.description,
    href: "/journal/tarot-palm-springs",
  },
  {
    category: "Body",
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
    title: "What Your Jaw Is Trying to Tell You",
    excerpt:
      "A draft reflection on jaw tension as information, with space for Shannon's story and a gentle two-minute practice.",
  },
  {
    category: "Beauty",
    title: "The Lymphatic System Is Not a Buzzword",
    excerpt:
      "A plain-language look at what the lymphatic system does, why the face and neck matter, and why light touch leads.",
  },
  {
    category: "Beauty",
    title: "Why I Don't Sell 'Anti-Aging'",
    excerpt:
      "A reframing of aging language around healthy skin, thoughtful maintenance, and care without promises of reversal.",
  },
  {
    category: "Body",
    title: "The Body Keeps Score — Here's How to Listen",
    excerpt:
      "A draft on reading tension as information and beginning a simple body scan, awaiting Shannon's lived perspective.",
  },
  {
    category: "Body",
    title: "Sound Baths Aren't Woo — They're Physiology",
    excerpt:
      "A grounded introduction to sound, the nervous system, and what someone can honestly expect from a session.",
  },
  {
    category: "Being",
    title: "What Tarot Actually Is (And Isn't)",
    excerpt:
      "Tarot as a mirror for self-inquiry rather than prediction, with Shannon's own path into the practice still to come.",
  },
  {
    category: "Being",
    title: "Living by the Moon Without Losing Your Mind",
    excerpt:
      "A simple lunar rhythm for intention-setting that keeps attention on practice instead of complicated rules.",
  },
  {
    category: "Retreat Living",
    title: "How to Design a Retreat People Actually Remember",
    excerpt:
      "A draft brief on creating a spacious container rather than packing every hour with programming.",
  },
  {
    category: "Retreat Living",
    title: "What I Bring to a Retreat (And What I Don't)",
    excerpt:
      "A reflection on the essentials, the things intentionally left behind, and how each place shapes the practice.",
  },
]

const filters: Array<{ label: string; value: string }> = [
  { label: "All", value: "all" },
  { label: "Beauty", value: "beauty" },
  { label: "Body", value: "body" },
  { label: "Being", value: "being" },
  { label: "Retreat Living", value: "retreat-living" },
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
            {href ? (
              <Link
                className="mt-8 inline-flex items-center justify-between gap-3 border-t border-[var(--border)] pt-5 text-xs font-medium tracking-[0.12em] text-[var(--accent)] uppercase hover:text-[var(--primary)]"
                href={href}
              >
                Read article <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <p className="mt-8 border-t border-[var(--border)] pt-5 text-[10px] font-medium tracking-[0.18em] text-[var(--muted-foreground)] uppercase">
                Draft brief · Coming soon
              </p>
            )}
          </Card>
        </Reveal>
      ))}
    </div>
  )
}

function articlesIn(category: JournalCategory) {
  return articles.filter((article) => article.category === category)
}

export default function JournalPage() {
  return (
    <>
      <BreathingSection
        background="warm"
        className="flex min-h-[70svh] items-center"
        contentClassName="mx-auto w-full max-w-7xl px-6 text-center"
        padding="expansive"
        reveal={false}
        variant="library"
      >
        <Reveal>
          <BreathingText
            as="h1"
            className="font-medium text-[var(--primary)]"
            size="hero"
          >
            The Journal
          </BreathingText>
          <BreathingText
            className="mx-auto mt-7 max-w-2xl text-[var(--muted-foreground)]"
            size="subheading"
          >
            Stories, rituals, and reflections.
          </BreathingText>
          <Button
            asChild
            className="mt-10 min-h-12 rounded-full bg-[var(--primary)] px-7 text-white hover:bg-[var(--accent)]"
          >
            <Link href="#journal-notes">Subscribe</Link>
          </Button>
        </Reveal>
      </BreathingSection>

      <BreathingSection
        background="gradient"
        contentClassName="mx-auto max-w-7xl px-6"
        id="journal-library"
        variant="library"
      >
        <Tabs defaultValue="all">
          <TabsList
            aria-label="Filter journal drafts by category"
            className="mx-auto flex h-auto max-w-full flex-wrap gap-2 rounded-full border border-[var(--border)] bg-white/55 p-2"
          >
            {filters.map(({ label, value }) => (
              <TabsTrigger
                className="min-h-10 rounded-full px-5 data-active:bg-[var(--primary)] data-active:text-white"
                key={value}
                value={value}
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent className="mt-12" value="all">
            <ArticleGrid items={articles} />
          </TabsContent>
          <TabsContent className="mt-12" value="beauty">
            <ArticleGrid items={articlesIn("Beauty")} />
          </TabsContent>
          <TabsContent className="mt-12" value="body">
            <ArticleGrid items={articlesIn("Body")} />
          </TabsContent>
          <TabsContent className="mt-12" value="being">
            <ArticleGrid items={articlesIn("Being")} />
          </TabsContent>
          <TabsContent className="mt-12" value="retreat-living">
            <ArticleGrid items={articlesIn("Retreat Living")} />
          </TabsContent>
        </Tabs>

        <p className="mx-auto mt-14 max-w-xl text-center font-serif text-2xl text-[var(--primary)]">
          Shannon is writing. Check back soon.
        </p>
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
            Join the journal for new reflections on beauty, body, being, and the
            spaces that hold us.
          </BreathingText>
          <NewsletterForm />
        </div>
      </BreathingSection>
    </>
  )
}
