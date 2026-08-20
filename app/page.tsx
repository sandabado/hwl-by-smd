import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronDown, Droplets, Leaf, Sparkles } from "lucide-react"

import { BreathingSection } from "@/components/shared/breathing-section"
import { BreathingText } from "@/components/shared/breathing-text"
import { BreathPause } from "@/components/shared/breath-pause"
import { BreathingButton } from "@/components/shared/breathing-button"
import { NewsletterForm } from "@/components/shared/newsletter-form"
import { ParallaxWindow } from "@/components/shared/parallax-window"
import { Reveal } from "@/components/shared/reveal"
import { TextureOverlay } from "@/components/shared/texture-overlay"
import { media } from "@/lib/media"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "HWL by SMD — Skincare, Yoga, Tarot & Retreats in Palm Springs",
  description:
    "Shannon Mary Dixon offers facial rituals, private yoga, tarot readings, and retreat facilitation in Palm Springs, Joshua Tree, Yucca Valley, Desert Hot Springs, and Morongo Valley.",
  path: "/",
})

const pathways = [
  {
    eyebrow: "Beauty",
    title: "Let your skin soften.",
    description:
      "Facial ritual, lymphatic touch, and intentional care for the skin—and the person inside it.",
    href: "/beauty",
    linkLabel: "Enter Beauty",
    image: media.experiences.beauty,
    position: "object-center",
  },
  {
    eyebrow: "Yoga",
    title: "Move at your own rhythm.",
    description:
      "Yoga, restorative movement, sound, and breath that make room for ease, strength, and release.",
    href: "/yoga",
    linkLabel: "Explore Yoga",
    image: media.experiences.movementStretch,
    position: "object-[center_30%]",
  },
  {
    eyebrow: "Tarot",
    title: "Listen a little deeper.",
    description:
      "Tarot, astrology, and ritual offer a quiet place to honor what is changing and hear what is true.",
    href: "/tarot",
    linkLabel: "Explore Tarot",
    image: media.experiences.ritualMoon,
    position: "object-center",
  },
] as const

export default function Page() {
  return (
    <>
      <section className="sanctuary-hero relative -mt-16 flex min-h-[calc(100svh+4rem)] items-end overflow-hidden md:-mt-20 md:min-h-[calc(100svh+5rem)]">
        <Image
          alt="A tranquil mineral pool surrounded by lush green plants and luminous morning mist"
          className="sanctuary-hero__image object-cover"
          fill
          preload
          quality={88}
          sizes="100vw"
          src={media.brand.sanctuaryHero.src}
        />
        <div className="sanctuary-hero__veil absolute inset-0" />
        <TextureOverlay intensity="soft" variant="grain" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-end gap-12 px-6 pt-40 pb-24 md:grid-cols-[minmax(0,1fr)_auto] md:pt-52 md:pb-28 lg:pb-32">
          <Reveal className="max-w-3xl text-[var(--sanctuary-ivory)]">
            <p className="mb-6 flex items-center gap-3 text-[11px] font-medium tracking-[0.28em] text-white/75 uppercase">
              <span className="h-px w-9 bg-white/50" aria-hidden="true" />
              Shannon Mary Dixon · Palm Springs
            </p>
            <BreathingText
              as="h1"
              className="max-w-3xl text-[clamp(3.65rem,8vw,7.5rem)] leading-[0.88] font-medium tracking-[-0.025em] text-[var(--sanctuary-ivory)]"
              size="hero"
            >
              Beauty · Body · Being
            </BreathingText>
            <BreathingText
              className="mt-7 max-w-xl text-white"
              size="subheading"
            >
              Come back to yourself.
            </BreathingText>
            <BreathingText
              className="mt-5 max-w-xl text-base leading-8 text-white/82 md:text-lg"
              size="body"
            >
              A space for skin, movement, and ritual—held with warmth by Shannon
              Mary Dixon.
            </BreathingText>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <BreathingButton
                asChild
                breathVariant="primary"
                className="h-12 rounded-full bg-[var(--sanctuary-ivory)] px-7 text-[var(--sanctuary-ink)] shadow-[0_12px_40px_rgba(4,20,13,0.18)] hover:bg-white"
              >
                <Link href="/book">
                  Book an Experience
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </BreathingButton>
              <BreathingButton
                asChild
                breathVariant="secondary"
                className="h-12 rounded-full border-white/35 bg-white/8 px-7 text-white backdrop-blur-md hover:bg-white/16 hover:text-white"
              >
                <Link href="/beauty/lift">Get the LIFT Guide — $5.55</Link>
              </BreathingButton>
            </div>
          </Reveal>

          <div className="hidden items-center gap-4 rounded-full border border-white/20 bg-[#0b2118]/30 p-2 pr-5 text-white shadow-[0_20px_70px_rgba(2,18,11,0.25)] backdrop-blur-xl md:flex">
            <div className="relative size-14 overflow-hidden rounded-full border border-white/35">
              <Image
                alt="Shannon Mary Dixon smiling"
                className="object-cover object-[center_30%]"
                fill
                sizes="56px"
                src={media.brand.smilingPortrait.src}
              />
            </div>
            <div>
              <p className="font-serif text-lg leading-none">Shannon</p>
              <p className="mt-1 text-[10px] tracking-[0.2em] text-white/65 uppercase">
                Your guide inward
              </p>
            </div>
          </div>
        </div>

        <a
          aria-label="Continue to meet Shannon"
          className="sanctuary-hero__scroll absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-[9px] font-medium tracking-[0.26em] text-white/65 uppercase lg:flex"
          href="#meet-shannon"
        >
          Exhale
          <ChevronDown aria-hidden="true" className="size-4" />
        </a>
      </section>

      <BreathPause text="Breathe here." />

      <BreathingSection
        className="sanctuary-introduction"
        contentClassName="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 md:grid-cols-[0.82fr_1.18fr] md:gap-20 lg:gap-28"
        id="meet-shannon"
        padding="expansive"
        texture="paper"
        variant="sunroom"
      >
        <div className="relative mx-auto w-full max-w-md md:mx-0">
          <div className="sanctuary-portrait-glow absolute -inset-10" />
          <ParallaxWindow
            alt={media.brand.windowPortrait.alt}
            aspectRatio="4 / 5.35"
            className="relative w-full rounded-t-[12rem] rounded-b-[2rem]"
            imageClassName="object-cover object-[center_34%]"
            sizes="(max-width: 767px) 90vw, 38vw"
            speed={0.1}
            src={media.brand.windowPortrait.src}
            texture="none"
          />
          <div className="absolute -right-4 -bottom-6 rounded-full border border-white/70 bg-white/60 p-4 shadow-[0_16px_50px_rgba(23,66,48,0.14)] backdrop-blur-lg md:-right-8 md:p-5">
            <Leaf
              aria-hidden="true"
              className="size-6 text-[var(--sanctuary-fern)]"
            />
          </div>
        </div>

        <div className="max-w-2xl">
          <BreathingText
            className="text-[var(--sanctuary-moss)] uppercase"
            size="caption"
          >
            Welcome, I&apos;m Shannon
          </BreathingText>
          <BreathingText
            as="h2"
            className="mt-6 text-[var(--sanctuary-ink)] md:text-6xl"
            size="heading"
          >
            I made this space for your whole self.
          </BreathingText>
          <BreathingText
            className="mt-7 text-[var(--sanctuary-copy)]"
            size="body"
          >
            The part of you that wants to glow. The part that needs to move. The
            part that is ready to become quiet enough to hear itself again.
            There is no perfect place to begin—only the place your body asks you
            to enter.
          </BreathingText>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Leaf, label: "Living care" },
              { icon: Droplets, label: "Gentle flow" },
              { icon: Sparkles, label: "Inner glow" },
            ].map(({ icon: Icon, label }) => (
              <div
                className="rounded-2xl border border-[var(--sanctuary-fern)]/12 bg-white/45 px-5 py-5 backdrop-blur-sm"
                key={label}
              >
                <Icon
                  aria-hidden="true"
                  className="size-5 text-[var(--sanctuary-moss)]"
                  strokeWidth={1.5}
                />
                <p className="mt-3 text-xs tracking-[0.14em] text-[var(--sanctuary-copy)] uppercase">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <Link
            className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-[var(--sanctuary-fern)] underline-offset-4 hover:underline"
            href="/about"
          >
            My approach
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </BreathingSection>

      <BreathingSection
        background="cool"
        className="pathways-section"
        contentClassName="mx-auto w-full max-w-7xl px-6"
        padding="expansive"
        texture="grain"
        variant="studio"
      >
        <div className="mx-auto max-w-3xl text-center">
          <BreathingText
            className="text-[var(--sanctuary-moss)] uppercase"
            size="caption"
          >
            Choose what is calling
          </BreathingText>
          <BreathingText
            as="h2"
            className="mt-6 text-[var(--sanctuary-ink)] md:text-6xl"
            size="heading"
          >
            Three ways into the same water.
          </BreathingText>
          <BreathingText
            className="mx-auto mt-7 max-w-2xl text-[var(--sanctuary-copy)]"
            size="body"
          >
            Begin with the surface, the body, or the unseen. Each path leads you
            back to the same place: here.
          </BreathingText>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {pathways.map((pathway, index) => (
            <Reveal as="article" delay={index * 110} key={pathway.eyebrow}>
              <Link
                className="pathway-card gentle-hover group block h-full overflow-hidden rounded-[2rem] border border-white/55 bg-[var(--sanctuary-ivory)]/78 shadow-[0_22px_70px_rgba(17,57,41,0.09)]"
                href={pathway.href}
              >
                <div className="relative aspect-[4/4.7] overflow-hidden">
                  <Image
                    alt={pathway.image.alt}
                    className={`${pathway.position} object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]`}
                    fill
                    sizes="(max-width: 1023px) 100vw, 33vw"
                    src={pathway.image.src}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--sanctuary-ink)]/35 via-transparent to-transparent" />
                  <span className="absolute right-5 bottom-5 flex size-11 items-center justify-center rounded-full border border-white/45 bg-white/20 text-white backdrop-blur-md transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </span>
                </div>
                <div className="p-7 md:p-8">
                  <p className="text-xs font-medium tracking-[0.2em] text-[var(--sanctuary-moss)] uppercase">
                    {pathway.eyebrow}
                  </p>
                  <h3 className="mt-4 text-3xl leading-tight text-[var(--sanctuary-ink)]">
                    {pathway.title}
                  </h3>
                  <p className="mt-4 leading-7 text-[var(--sanctuary-copy)]">
                    {pathway.description}
                  </p>
                  <p className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[var(--sanctuary-fern)]">
                    {pathway.linkLabel}
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </BreathingSection>

      <BreathingSection
        className="water-pause"
        contentClassName="mx-auto w-full max-w-5xl px-6 text-center"
        padding="expansive"
        reveal={false}
        texture="none"
        variant="sanctuary"
      >
        <Reveal>
          <Droplets
            aria-hidden="true"
            className="mx-auto size-6 text-[var(--sanctuary-sage)]"
            strokeWidth={1.25}
          />
          <BreathingText
            as="blockquote"
            className="mx-auto mt-8 max-w-4xl text-[var(--sanctuary-ivory)] md:text-6xl"
            size="heading"
          >
            You don&apos;t have to become someone new. You can return to what is
            already alive in you.
          </BreathingText>
        </Reveal>
      </BreathingSection>

      <BreathingSection
        className="lift-sanctuary"
        contentClassName="mx-auto w-full max-w-7xl px-6"
        padding="expansive"
        variant="sunroom"
      >
        <article className="relative grid overflow-hidden rounded-[2.5rem] border border-[var(--sanctuary-fern)]/10 bg-[#eaf0e7] shadow-[0_34px_100px_rgba(17,57,41,0.12)] md:grid-cols-[0.85fr_1.15fr]">
          <TextureOverlay intensity="soft" variant="paper" />
          <ParallaxWindow
            alt={media.editorial.liftBotanicals.alt}
            aspectRatio="4 / 5"
            className="z-10 min-h-[25rem] rounded-none md:min-h-[36rem]"
            frame="none"
            imageClassName="object-cover saturate-[0.82]"
            sizes="(max-width: 767px) 100vw, 43vw"
            speed={0.12}
            src={media.editorial.liftBotanicals.src}
            texture="none"
          />
          <div className="relative z-10 flex flex-col justify-center p-9 md:p-14 lg:p-20">
            <BreathingText
              className="text-[var(--sanctuary-moss)] uppercase"
              size="caption"
            >
              LIFT · A daily ritual
            </BreathingText>
            <BreathingText
              as="h2"
              className="mt-5 text-[var(--sanctuary-ink)]"
              size="heading"
            >
              Five quiet minutes to meet your face again.
            </BreathingText>
            <BreathingText
              className="mt-6 text-[var(--sanctuary-copy)]"
              size="body"
            >
              Seven movements guided by Shannon, with a printable ritual to keep
              close for the mornings you want to move at your own pace.
            </BreathingText>
            <p className="mt-7 font-serif text-3xl text-[var(--sanctuary-ink)]">
              $5.55
            </p>
            <BreathingButton
              asChild
              breathVariant="primary"
              className="mt-8 h-12 self-start rounded-full bg-[var(--sanctuary-fern)] px-7 text-[var(--sanctuary-ivory)] hover:bg-[var(--sanctuary-ink)]"
            >
              <Link href="/beauty/lift">
                Get the Guide
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </BreathingButton>
          </div>
        </article>
      </BreathingSection>

      <BreathPause text="You’re here." />

      <BreathingSection
        className="sanctuary-newsletter"
        contentClassName="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 md:grid-cols-[0.9fr_1.1fr] md:gap-20"
        padding="expansive"
        texture="paper"
        variant="sunroom"
      >
        <div>
          <BreathingText
            className="text-[var(--sanctuary-moss)] uppercase"
            size="caption"
          >
            Notes from Shannon
          </BreathingText>
          <BreathingText
            as="h2"
            className="mt-5 text-[var(--sanctuary-ink)] md:text-6xl"
            size="heading"
          >
            A little more quiet in your inbox.
          </BreathingText>
        </div>
        <div>
          <BreathingText className="text-[var(--sanctuary-copy)]" size="body">
            Occasional reflections on beauty, movement, ritual, and returning to
            yourself—sent with care, never urgency.
          </BreathingText>
          <NewsletterForm />
        </div>
      </BreathingSection>

      <BreathingSection
        background="dark"
        className="sanctuary-testimonial"
        contentClassName="mx-auto max-w-4xl px-6 text-center"
        padding="expansive"
        texture="grain"
        variant="living-room"
      >
        <figure>
          <BreathingText
            as="blockquote"
            className="font-serif text-3xl text-[var(--sanctuary-ivory)] italic md:text-5xl"
            size="heading"
          >
            “Such an empowering and healing space—Shannon is so wonderful and
            knowledgeable.”
          </BreathingText>
          <figcaption className="mt-9 text-xs tracking-[0.22em] text-[var(--sanctuary-sage)] uppercase">
            Grace R. · Astrology + Yoga Client
          </figcaption>
          <BreathingButton
            asChild
            breathVariant="primary"
            className="mt-12 h-12 rounded-full bg-[var(--sanctuary-ivory)] px-7 text-[var(--sanctuary-ink)] hover:bg-white"
          >
            <Link href="/book">
              Begin where you are
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </BreathingButton>
        </figure>
      </BreathingSection>
    </>
  )
}
