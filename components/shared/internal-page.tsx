import Link from "next/link"
import type { ReactNode } from "react"

import { FadeIn } from "@/components/shared/fade-in"
import { Particles } from "@/components/shared/particles"
import { WaveHero, type WaveHeroVariant } from "@/components/shared/wave-hero"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function InteriorHero({
  eyebrow,
  title,
  subtitle,
  actions,
  className,
  particles = false,
  variant = "desert",
}: {
  eyebrow: string
  title: string
  subtitle: string
  actions?: ReactNode
  className?: string
  particles?: boolean
  variant?: WaveHeroVariant
}) {
  return (
    <section
      className={cn(
        "relative isolate flex min-h-[70svh] items-center overflow-hidden px-6 py-24 text-center",
        className
      )}
    >
      <WaveHero variant={variant} />
      {particles ? <Particles /> : null}
      <div className="relative z-10 mx-auto max-w-4xl">
        <p className="text-xs font-medium tracking-[0.28em] text-[var(--accent)] uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-5 text-4xl leading-tight font-medium text-[var(--primary)] md:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-[var(--muted-foreground)] md:text-lg">
          {subtitle}
        </p>
        {actions ? (
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export function PageSection({
  children,
  className,
  delay = 0,
  id,
}: {
  children: ReactNode
  className?: string
  delay?: number
  id?: string
}) {
  return (
    <section className={cn("px-6 py-16 md:py-24", className)} id={id}>
      <FadeIn className="mx-auto max-w-7xl" delay={delay}>
        {children}
      </FadeIn>
    </section>
  )
}

export function OfferingCard({
  description,
  details,
  title,
}: {
  description: string
  details?: string[]
  title: string
}) {
  return (
    <Card className="flex h-full flex-col rounded-lg border-[var(--border)] bg-white/55 p-6">
      <h3 className="text-2xl font-medium text-[var(--primary)]">{title}</h3>
      {details?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {details.map((detail) => (
            <span
              className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-medium tracking-[0.14em] text-[var(--muted-foreground)] uppercase"
              key={detail}
            >
              {detail}
            </span>
          ))}
        </div>
      ) : null}
      <p className="mt-5 flex-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
        {description}
      </p>
    </Card>
  )
}

export function BenefitGrid({ items }: { items: string[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card
          className="rounded-lg border-[var(--border)] bg-white/50 p-5 text-center"
          key={item}
        >
          <h3 className="text-lg font-medium text-[var(--primary)]">{item}</h3>
        </Card>
      ))}
    </div>
  )
}

export function InfoListCard({
  items,
  title,
}: {
  items: string[]
  title: string
}) {
  return (
    <Card className="rounded-lg border-[var(--border)] bg-white/55 p-6">
      <h3 className="text-2xl font-medium text-[var(--primary)]">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
        {items.map((item) => (
          <li
            className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0"
            key={item}
          >
            {item}
          </li>
        ))}
      </ul>
    </Card>
  )
}

export function FaqAccordion({
  items,
}: {
  items: { answer: string; question: string }[]
}) {
  return (
    <Accordion className="mx-auto max-w-3xl" collapsible type="single">
      {items.map((item, index) => (
        <AccordionItem
          className="border-[var(--border)]"
          key={item.question}
          value={`item-${index}`}
        >
          <AccordionTrigger className="py-5 text-left text-[var(--primary)] hover:no-underline">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-[var(--muted-foreground)]">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export function LinkCard({
  description,
  href,
  label,
  title,
}: {
  description: string
  href: string
  label: string
  title: string
}) {
  return (
    <Link
      className="group block h-full rounded-lg border border-[var(--border)] bg-white/55 p-6 transition hover:-translate-y-1 hover:shadow-lg"
      href={href}
    >
      <h3 className="text-2xl font-medium text-[var(--primary)]">{title}</h3>
      <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
        {description}
      </p>
      <span className="mt-6 inline-flex text-sm font-medium text-[var(--accent)] underline-offset-4 group-hover:underline">
        {label}
      </span>
    </Link>
  )
}

export function ContactForm({
  fields,
  messageLabel = "Message",
}: {
  fields: { label: string; name: string; type?: string }[]
  messageLabel?: string
}) {
  return (
    <form className="grid gap-4 rounded-lg border border-[var(--border)] bg-white/55 p-6">
      {fields.map((field) => (
        <label
          className="grid gap-2 text-sm text-[var(--primary)]"
          key={field.name}
        >
          {field.label}
          <input
            className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
            name={field.name}
            type={field.type ?? "text"}
          />
        </label>
      ))}
      <label className="grid gap-2 text-sm text-[var(--primary)]">
        {messageLabel}
        <textarea
          className="min-h-36 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          name="message"
        />
      </label>
      <Button className="mt-2 rounded-full bg-[var(--primary)] text-white hover:bg-[var(--accent)]">
        Send Inquiry
      </Button>
    </form>
  )
}
