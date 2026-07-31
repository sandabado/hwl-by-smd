import Link from "next/link"
import { ArrowRight, ChevronDown } from "lucide-react"

import { AmbientLight } from "@/components/shared/ambient-light"
import { BreathingSection } from "@/components/shared/breathing-section"
import { BreathingText } from "@/components/shared/breathing-text"
import { ParallaxWindow } from "@/components/shared/parallax-window"
import { Reveal } from "@/components/shared/reveal"
import { TextureOverlay } from "@/components/shared/texture-overlay"
import { Button } from "@/components/ui/button"
import { media } from "@/lib/media"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "HWL by SMD | Beauty · Body · Being",
  description:
    "A space for your whole self—skin, movement, and ritual with Shannon Mary Dixon.",
  path: "/",
})

export default function Page() {
  return (
    <>
      <section className="living-room-hero relative -mt-16 flex min-h-[80svh] items-center overflow-hidden px-6 pt-28 pb-24 md:-mt-20 md:pt-32">
        <AmbientLight className="opacity-70" position="top-left" tone="warm" />
        <AmbientLight
          className="opacity-80"
          position="bottom-right"
          tone="clay"
        />
        <TextureOverlay intensity="soft" variant="grain" />

        <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
          <Reveal>
            <BreathingText
              as="h1"
              className="text-[var(--room-charcoal)] md:text-7xl lg:text-8xl"
              size="hero"
            >
              Beauty · Body · Being
            </BreathingText>
            <BreathingText
              className="mt-7 text-[var(--primary)]"
              size="subheading"
            >
              A space for your whole self.
            </BreathingText>
            <BreathingText
              className="mx-auto mt-8 max-w-3xl text-[var(--muted-foreground)]"
              size="body"
            >
              Shannon Mary Dixon brings skin, movement, and ritual into one
              thoughtful experience. Not a menu of services. A way of being.
              Each experience meets you where you are — in your skin, in your
              body, in your inner life — and walks with you toward what&apos;s
              next.
            </BreathingText>

            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                asChild
                className="h-12 rounded-full bg-[var(--room-charcoal)] px-7 text-[var(--room-cream)] hover:bg-[var(--accent)]"
              >
                <Link href="/book">
                  Book an Experience
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full border-[var(--room-charcoal)]/20 bg-white/25 px-7 text-[var(--room-charcoal)] backdrop-blur-sm hover:bg-white/55"
              >
                <Link href="/store#the-den">Join The Den</Link>
              </Button>
            </div>
          </Reveal>
        </div>

        <a
          aria-label="Continue to Beauty"
          className="living-room-hero__scroll absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-[10px] font-medium tracking-[0.22em] text-[var(--room-charcoal)] uppercase"
          href="#beauty-room"
        >
          Enter
          <ChevronDown aria-hidden="true" className="size-4" />
        </a>
      </section>

      <BreathingSection
        className="flex min-h-[88svh] items-center"
        contentClassName="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 md:grid-cols-[0.9fr_1.1fr] md:gap-20"
        id="beauty-room"
        padding="expansive"
        variant="living-room"
      >
        <div className="max-w-xl">
          <BreathingText
            className="text-[var(--accent)] uppercase"
            size="caption"
          >
            Beauty
          </BreathingText>
          <BreathingText
            as="h2"
            className="mt-6 text-[var(--primary)]"
            size="heading"
          >
            Skin holds memory.
          </BreathingText>
          <BreathingText
            className="mt-7 text-[var(--muted-foreground)]"
            size="body"
          >
            Facial ritual, lymphatic touch, and intentional care create space
            for your skin — and the person inside it — to soften.
          </BreathingText>
          <Link
            className="mt-9 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline"
            href="/beauty"
          >
            Enter Beauty
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <ParallaxWindow
          alt={media.experiences.beauty.alt}
          aspectRatio="4 / 5"
          className="w-full"
          imageClassName="object-cover"
          sizes="(max-width: 767px) 100vw, 52vw"
          speed={0.15}
          src={media.experiences.beauty.src}
          texture="paper"
        />
      </BreathingSection>

      <BreathingSection
        background="cool"
        className="movement-room-traces flex min-h-[78svh] items-center"
        contentClassName="mx-auto w-full max-w-4xl px-6 text-center"
        padding="expansive"
        variant="studio"
      >
        <BreathingText
          className="text-[var(--accent)] uppercase"
          size="caption"
        >
          Body
        </BreathingText>
        <BreathingText
          as="h2"
          className="mt-6 text-[var(--primary)] md:text-6xl"
          size="heading"
        >
          Movement as medicine.
        </BreathingText>
        <BreathingText
          className="mx-auto mt-8 max-w-2xl text-[var(--muted-foreground)]"
          size="body"
        >
          Yoga, restorative movement, sound, and breath help the body release
          effort and recognize its own steadier rhythm.
        </BreathingText>
        <Link
          className="mt-9 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline"
          href="/body"
        >
          Enter Body
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
        <BreathingText
          as="blockquote"
          className="mx-auto mt-20 max-w-3xl border-t border-[var(--primary)]/10 pt-12 font-serif text-3xl text-[var(--primary)] italic md:text-4xl"
          size="subheading"
        >
          “You don&apos;t visit wellness. You live it.”
        </BreathingText>
      </BreathingSection>

      <BreathingSection
        background="gradient"
        className="flex min-h-[88svh] items-center"
        contentClassName="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 md:grid-cols-[1.1fr_0.9fr] md:gap-20"
        padding="expansive"
        variant="living-room"
      >
        <ParallaxWindow
          alt={media.experiences.ritualMoon.alt}
          aspectRatio="4 / 5"
          className="w-full"
          frame="dark"
          sizes="(max-width: 767px) 100vw, 52vw"
          speed={0.12}
          src={media.experiences.ritualMoon.src}
        />

        <div className="max-w-xl md:ml-auto md:text-right">
          <BreathingText
            className="text-[var(--accent)] uppercase"
            size="caption"
          >
            Being
          </BreathingText>
          <BreathingText
            as="h2"
            className="mt-6 text-[var(--primary)]"
            size="heading"
          >
            Ancient wisdom for modern life.
          </BreathingText>
          <BreathingText
            className="mt-7 text-[var(--muted-foreground)]"
            size="body"
          >
            Tarot, astrology, and ritual offer a quiet place to ask meaningful
            questions, listen inward, and honor what is changing.
          </BreathingText>
          <Link
            className="mt-9 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline"
            href="/being"
          >
            Enter Being
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </BreathingSection>

      <BreathingSection
        contentClassName="mx-auto w-full max-w-7xl px-6"
        padding="expansive"
        variant="dressing-room"
      >
        <article className="relative grid overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-[#f2e9dc] shadow-[0_34px_100px_rgba(72,55,43,0.13)] md:grid-cols-[0.8fr_1.2fr]">
          <TextureOverlay intensity="soft" variant="paper" />
          <ParallaxWindow
            alt={media.editorial.liftBotanicals.alt}
            aspectRatio="4 / 5"
            className="z-10 min-h-[24rem] rounded-none md:min-h-[34rem]"
            frame="none"
            sizes="(max-width: 767px) 100vw, 40vw"
            speed={0.12}
            src={media.editorial.liftBotanicals.src}
            texture="none"
          />
          <div className="relative z-10 flex flex-col justify-center p-9 md:p-14 lg:p-20">
            <BreathingText
              className="text-[var(--accent)] uppercase"
              size="caption"
            >
              LIFT
            </BreathingText>
            <BreathingText
              as="h2"
              className="mt-5 text-[var(--primary)]"
              size="heading"
            >
              A Daily Ritual.
            </BreathingText>
            <BreathingText
              className="mt-6 text-[var(--primary)]"
              size="subheading"
            >
              Seven movements. Five minutes a day.
            </BreathingText>
            <BreathingText
              className="mt-5 max-w-xl text-[var(--muted-foreground)]"
              size="body"
            >
              Practice alongside Shannon, then keep the printable guide close
              for the mornings you want to move at your own pace.
            </BreathingText>
            <p className="mt-8 font-serif text-3xl text-[var(--primary)]">
              $5.55
            </p>
            <Button
              asChild
              className="mt-8 h-12 self-start rounded-full bg-[var(--primary)] px-7 text-[var(--background)] hover:bg-[var(--accent)]"
            >
              <Link href="/beauty/lift">
                Get the Guide
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </div>
        </article>
      </BreathingSection>

      <BreathingSection
        background="dark"
        contentClassName="mx-auto max-w-4xl px-6 text-center"
        padding="expansive"
        variant="living-room"
      >
        <figure>
          <BreathingText
            as="blockquote"
            className="font-serif text-3xl text-[var(--background)] italic md:text-4xl"
            size="heading"
          >
            “The celestial and aromatherapy elements are so fascinating and
            comforting. Such an empowering and healing space — Shannon is so
            wonderful and knowledgeable.”
          </BreathingText>
          <figcaption className="mt-9 text-sm tracking-[0.2em] text-[var(--accent-on-dark)] uppercase">
            Grace R. · Astrology + Yoga Client
          </figcaption>
        </figure>
      </BreathingSection>
    </>
  )
}
