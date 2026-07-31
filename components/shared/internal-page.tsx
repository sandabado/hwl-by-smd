import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"

import { FadeIn } from "@/components/shared/fade-in"
import { Particles } from "@/components/shared/particles"
import { WaveHero, type WaveHeroVariant } from "@/components/shared/wave-hero"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function InteriorHero({
  eyebrow,
  title,
  subtitle,
  actions,
  className,
  image,
  imageAlt,
  imagePosition = "center",
  particles = false,
  variant = "desert",
}: {
  eyebrow: string
  title: string
  subtitle: string
  actions?: ReactNode
  className?: string
  image?: string
  imageAlt?: string
  imagePosition?: string
  particles?: boolean
  variant?: WaveHeroVariant
}) {
  return (
    <section
      className={cn(
        "relative isolate flex min-h-[70svh] items-center overflow-hidden px-6 py-24",
        className
      )}
    >
      <WaveHero variant={variant} />
      {particles ? <Particles /> : null}
      <div
        className={cn(
          "relative z-10 mx-auto w-full",
          image
            ? "grid max-w-7xl items-center gap-10 text-center md:grid-cols-[minmax(0,1fr)_minmax(320px,0.82fr)] md:gap-14 md:text-left"
            : "max-w-4xl text-center"
        )}
      >
        <div>
          <p className="hero-reveal hero-reveal--1 text-xs font-medium tracking-[0.28em] text-[var(--accent)] uppercase">
            {eyebrow}
          </p>
          <h1 className="hero-reveal hero-reveal--2 mt-5 text-4xl leading-tight font-medium text-[var(--primary)] md:text-6xl">
            {title}
          </h1>
          <p
            className={cn(
              "hero-reveal hero-reveal--3 mt-6 max-w-3xl text-base leading-relaxed text-[var(--muted-foreground)] md:text-lg",
              image ? "mx-auto md:mx-0" : "mx-auto"
            )}
          >
            {subtitle}
          </p>
          {actions ? (
            <div
              className={cn(
                "hero-reveal hero-reveal--4 mt-8 flex flex-wrap gap-4",
                image ? "justify-center md:justify-start" : "justify-center"
              )}
            >
              {actions}
            </div>
          ) : null}
        </div>
        {image ? (
          <div className="hero-image-reveal relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border border-white/60 bg-[var(--muted)] shadow-[0_24px_70px_rgba(90,74,63,0.16)] md:max-w-none">
            <Image
              alt={imageAlt ?? ""}
              className="object-cover"
              fill
              loading="eager"
              sizes="(max-width: 767px) 88vw, 40vw"
              src={image}
              style={{ objectPosition: imagePosition }}
            />
          </div>
        ) : null}
      </div>
      <a
        aria-label="Scroll to page content"
        className="hero-scroll-indicator absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-[10px] font-medium tracking-[0.2em] text-[var(--muted-foreground)] uppercase md:flex"
        href="#after-hero"
      >
        Scroll
        <ChevronDown className="size-4" aria-hidden="true" />
      </a>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0"
        id="after-hero"
      />
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
    <section
      className={cn("px-6 py-16 md:py-24", className)}
      id={id}
      {...(!id ? { "data-page-section": true } : {})}
    >
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
    <Card className="group flex h-full flex-col rounded-lg border-[var(--border)] bg-white/55 p-6 transition duration-300 hover:-translate-y-2 hover:border-[var(--accent)]/45 hover:shadow-[0_24px_60px_rgba(90,74,63,0.12)]">
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
          className="rounded-lg border-[var(--border)] bg-white/50 p-5 text-center transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/45 hover:bg-white/75 hover:shadow-[0_18px_50px_rgba(90,74,63,0.1)]"
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
    <Card className="rounded-lg border-[var(--border)] bg-white/55 p-6 transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/45 hover:shadow-[0_18px_50px_rgba(90,74,63,0.1)]">
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
