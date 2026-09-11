import Link from "next/link"
import { ArrowRight, BookOpenText } from "lucide-react"

import { JsonLd } from "@/components/seo/json-ld"
import { BreathingSection } from "@/components/shared/breathing-section"
import { Reveal } from "@/components/shared/reveal"
import { Button } from "@/components/ui/button"
import type { SeoJournalArticle } from "@/lib/seo-journal-articles"
import {
  createArticleJsonLd,
  createFaqPageJsonLd,
  type JsonLdNode,
} from "@/lib/seo"

function articleSchema(article: SeoJournalArticle): JsonLdNode {
  return createArticleJsonLd({
    headline: article.h1,
    description: article.metadata.description,
    path: `/journal/${article.slug}`,
    datePublished: "2026-08-19",
    articleSection: article.eyebrow,
  })
}

export function SeoArticlePage({ article }: { article: SeoJournalArticle }) {
  const bookingLink = article.serviceLinks.find((link) =>
    link.href.startsWith("/book?service=")
  )

  return (
    <>
      <JsonLd
        data={[
          articleSchema(article),
          createFaqPageJsonLd(article.faqs, `/journal/${article.slug}`),
        ]}
        id={`${article.slug}-article-schema`}
      />

      <BreathingSection
        background="gradient"
        className="flex min-h-[72svh] items-center"
        contentClassName="mx-auto w-full max-w-5xl px-6 text-center"
        padding="expansive"
        reveal={false}
        variant="library"
      >
        <Reveal>
          <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-[var(--border)] bg-white/50 text-[var(--accent)]">
            <BookOpenText aria-hidden="true" className="size-5" />
          </div>
          <p className="mt-7 text-xs font-medium tracking-[0.28em] text-[var(--accent)] uppercase">
            {article.eyebrow}
          </p>
          <h1 className="mx-auto mt-6 max-w-4xl text-5xl leading-[1.05] font-medium text-[var(--primary)] md:text-7xl">
            {article.h1}
          </h1>
          <p className="mx-auto mt-8 max-w-3xl text-lg leading-[1.9] text-[var(--muted-foreground)] md:text-xl">
            {article.dek}
          </p>
        </Reveal>
      </BreathingSection>

      <article className="bg-[var(--background)] px-6 py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="mx-auto w-full max-w-3xl">
            {article.sections.map((section, index) => (
              <Reveal
                as="section"
                className="border-b border-[var(--border)] py-11 first:pt-0 last:border-0 last:pb-0"
                key={section.heading}
              >
                <p className="text-xs font-medium tracking-[0.24em] text-[var(--accent)] uppercase">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-4 text-4xl leading-tight font-medium text-[var(--primary)] md:text-5xl">
                  {section.heading}
                </h2>
                <div className="mt-7 space-y-5 text-base leading-[1.95] text-[var(--muted-foreground)] md:text-lg">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>

          <aside className="h-fit rounded-[1.75rem] border border-[var(--border)] bg-white/55 p-7 lg:sticky lg:top-24">
            <p className="text-xs font-medium tracking-[0.24em] text-[var(--accent)] uppercase">
              Continue exploring
            </p>
            <nav
              aria-label="Related HWL services"
              className="mt-5 flex flex-col gap-4"
            >
              {article.serviceLinks.map((link) => (
                <Link
                  className="inline-flex items-center justify-between gap-3 border-b border-[var(--border)] pb-4 text-sm font-medium text-[var(--primary)] last:border-0 last:pb-0 hover:text-[var(--accent)]"
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      </article>

      <BreathingSection
        background="cool"
        contentClassName="mx-auto max-w-4xl px-6"
        variant="library"
      >
        <div className="text-center">
          <p className="text-xs font-medium tracking-[0.26em] text-[var(--accent)] uppercase">
            Frequently asked
          </p>
          <h2 className="mt-5 text-4xl font-medium text-[var(--primary)] md:text-5xl">
            A little clarity before you begin.
          </h2>
        </div>
        <div className="mt-12 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {article.faqs.map((faq) => (
            <details className="group py-6" key={faq.question}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium text-[var(--primary)] marker:hidden">
                <span>{faq.question}</span>
                <span
                  aria-hidden="true"
                  className="text-2xl font-light text-[var(--accent)] transition-transform duration-300 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-3xl text-base leading-[1.9] text-[var(--muted-foreground)]">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button
            asChild
            className="min-h-12 rounded-full bg-[var(--primary)] px-7 text-white hover:bg-[var(--accent)]"
          >
            <Link href={bookingLink?.href ?? "/book"}>
              See live availability <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </BreathingSection>
    </>
  )
}
