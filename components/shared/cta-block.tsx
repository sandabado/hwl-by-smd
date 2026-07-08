import Link from "next/link";

import { Button } from "@/components/ui/button";

interface CtaBlockProps {
  title: string;
  subtitle?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function CtaBlock({
  title,
  subtitle,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: CtaBlockProps) {
  return (
    <section className="px-6 py-20 md:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-medium leading-tight text-[var(--primary)] md:text-4xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-4 text-base leading-relaxed text-[var(--muted-foreground)]">
            {subtitle}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button
            asChild
            className="rounded-full bg-[var(--primary)] px-6 text-white hover:bg-[var(--accent)]"
          >
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>
          {secondaryLabel && secondaryHref ? (
            <Button
              asChild
              variant="outline"
              className="rounded-full border-[var(--border)] bg-transparent px-6 text-[var(--primary)] hover:bg-[var(--muted)]"
            >
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
