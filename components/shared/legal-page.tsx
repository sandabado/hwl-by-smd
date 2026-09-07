import Link from "next/link"

import { InteriorHero, PageSection } from "@/components/shared/internal-page"
import { SITE_CONFIG } from "@/lib/constants"

export type LegalSection = {
  body: string[]
  id?: string
  items?: string[]
  title: string
}

export function LegalPage({
  effectiveDate,
  eyebrow,
  introduction,
  sections,
  title,
}: {
  effectiveDate: string
  eyebrow: string
  introduction: string
  sections: LegalSection[]
  title: string
}) {
  return (
    <>
      <InteriorHero
        eyebrow={eyebrow}
        subtitle={introduction}
        title={title}
        variant="desert"
      />
      <PageSection>
        <article className="mx-auto max-w-3xl">
          <p className="text-xs tracking-[0.2em] text-[var(--accent)] uppercase">
            Effective {effectiveDate}
          </p>
          <div className="mt-10 space-y-12">
            {sections.map((section) => (
              <section id={section.id} key={section.title}>
                <h2 className="text-3xl font-medium text-[var(--primary)]">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-base leading-relaxed text-[var(--muted-foreground)]">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.items?.length ? (
                    <ul className="list-disc space-y-2 pl-5">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            ))}
          </div>
          <div className="mt-14 rounded-[2rem] border border-[var(--border)] bg-white/45 p-7">
            <h2 className="text-2xl text-[var(--primary)]">Questions</h2>
            <p className="mt-3 leading-relaxed text-[var(--muted-foreground)]">
              For policy or purchase questions, email{" "}
              <a
                className="text-[var(--accent)] underline underline-offset-4"
                href={`mailto:${SITE_CONFIG.email}`}
              >
                {SITE_CONFIG.email}
              </a>{" "}
              or use the{" "}
              <Link
                className="text-[var(--accent)] underline underline-offset-4"
                href="/contact"
              >
                contact form
              </Link>
              .
            </p>
          </div>
        </article>
      </PageSection>
    </>
  )
}
