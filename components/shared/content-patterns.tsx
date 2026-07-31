import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"

import { Card } from "@/components/ui/card"

export function ProcessGrid({
  items,
}: {
  items: { title: string; description: string }[]
}) {
  return (
    <ol className="relative grid gap-5 md:grid-cols-5">
      <span
        aria-hidden="true"
        className="absolute top-8 right-[8%] left-[8%] hidden h-px bg-[var(--border)] md:block"
      />
      {items.map((item, index) => (
        <li className="relative" key={item.title}>
          <Card className="h-full rounded-lg border-[var(--border)] bg-white/55 p-5 transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/45 hover:shadow-[0_18px_50px_rgba(90,74,63,0.1)]">
            <span className="relative z-10 inline-grid size-8 place-items-center rounded-full border border-[var(--border)] bg-[var(--background)] text-xs font-medium tracking-[0.08em] text-[var(--accent)]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 text-xl font-medium text-[var(--primary)]">
              {item.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
              {item.description}
            </p>
          </Card>
        </li>
      ))}
    </ol>
  )
}

export function AudienceGrid({ items }: { items: string[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card
          className="flex items-start gap-3 rounded-lg border-[var(--border)] bg-white/55 p-5 transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/45 hover:shadow-[0_18px_50px_rgba(90,74,63,0.1)]"
          key={item}
        >
          <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[var(--muted)] text-[var(--accent)]">
            <Check className="size-3.5" aria-hidden="true" />
          </span>
          <p className="text-sm leading-relaxed text-[var(--primary)]">
            {item}
          </p>
        </Card>
      ))}
    </div>
  )
}

export function InvestmentTable({
  items,
}: {
  items: { name: string; detail: string; price: string }[]
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white/60">
      {items.map((item) => (
        <div
          className="grid gap-2 border-b border-[var(--border)] p-5 transition last:border-b-0 hover:bg-white/70 md:grid-cols-[1fr_auto_auto] md:items-center md:gap-8"
          key={item.name}
        >
          <span className="font-medium text-[var(--primary)]">{item.name}</span>
          <span className="text-sm text-[var(--muted-foreground)]">
            {item.detail}
          </span>
          <span className="text-sm font-medium text-[var(--accent)]">
            {item.price}
          </span>
        </div>
      ))}
    </div>
  )
}

export function RelatedJournal({
  items,
}: {
  items: { category: string; title: string; excerpt: string; href?: string }[]
}) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {items.map((item) => (
        <article key={item.title}>
          <Card className="group flex h-full flex-col rounded-lg border-[var(--border)] bg-white/55 p-6 transition duration-300 hover:-translate-y-2 hover:border-[var(--accent)]/45 hover:shadow-[0_24px_60px_rgba(90,74,63,0.12)]">
            <p className="text-xs font-medium tracking-[0.2em] text-[var(--accent)] uppercase">
              {item.category}
            </p>
            <h3 className="mt-4 text-2xl leading-tight font-medium text-[var(--primary)]">
              {item.title}
            </h3>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
              {item.excerpt}
            </p>
            <Link
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline"
              href={item.href ?? "/journal"}
            >
              Read the reflection
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </Card>
        </article>
      ))}
    </div>
  )
}
