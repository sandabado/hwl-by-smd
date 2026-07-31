import { cn } from "@/lib/utils"

interface PullQuoteProps {
  attribution?: string
  className?: string
  quote: string
}

export function PullQuote({ attribution, className, quote }: PullQuoteProps) {
  return (
    <figure
      className={cn(
        "mx-auto my-12 max-w-5xl border-l-2 border-[var(--accent)] py-3 pl-6 md:my-16 md:py-5 md:pl-10",
        className
      )}
    >
      <blockquote>
        <p className="max-w-4xl font-serif text-3xl leading-tight font-medium text-[var(--primary)] md:text-5xl md:leading-[1.08]">
          <span aria-hidden="true">“</span>
          {quote}
          <span aria-hidden="true">”</span>
        </p>
      </blockquote>
      {attribution ? (
        <figcaption className="mt-5 text-xs font-medium tracking-[0.2em] text-[var(--muted-foreground)] uppercase">
          — {attribution}
        </figcaption>
      ) : null}
    </figure>
  )
}
