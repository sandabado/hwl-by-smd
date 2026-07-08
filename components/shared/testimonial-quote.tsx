interface TestimonialQuoteProps {
  quote: string;
  attribution: string;
  context?: string;
}

export function TestimonialQuote({
  quote,
  attribution,
  context,
}: TestimonialQuoteProps) {
  return (
    <figure className="mx-auto max-w-3xl py-16 text-center">
      <blockquote className="text-xl italic leading-relaxed text-[var(--foreground)] md:text-2xl">
        “{quote}”
      </blockquote>
      <figcaption className="mt-6">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
          {attribution}
        </p>
        {context ? (
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            {context}
          </p>
        ) : null}
      </figcaption>
    </figure>
  );
}
