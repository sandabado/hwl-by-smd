import Link from "next/link"

import { WaveHero } from "@/components/shared/wave-hero"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <section className="relative isolate grid min-h-[70svh] place-items-center overflow-hidden px-6 py-24 text-center">
      <WaveHero variant="desert" />
      <div className="relative z-10 mx-auto max-w-2xl">
        <p
          aria-hidden="true"
          className="font-serif text-[clamp(7rem,24vw,15rem)] leading-[0.72] font-medium text-[var(--primary)]/12"
        >
          404
        </p>
        <p className="mt-8 text-xs font-medium tracking-[0.3em] text-[var(--accent)] uppercase">
          Page not found
        </p>
        <h1 className="mt-4 text-4xl font-medium text-[var(--primary)] md:text-6xl">
          This page wandered off.
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-[var(--muted-foreground)] md:text-lg">
          Let&apos;s get you back to the ritual.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="h-11 rounded-full px-7" size="lg">
            <Link href="/">Return Home</Link>
          </Button>
          <Button
            asChild
            className="h-11 rounded-full px-7"
            size="lg"
            variant="outline"
          >
            <Link href="/beauty">Explore Experiences</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
