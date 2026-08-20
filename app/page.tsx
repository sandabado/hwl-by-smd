import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Droplets, Leaf, Sparkles } from "lucide-react"

import { HeroFilm } from "@/components/home/hero-film"
import { BreathingSection } from "@/components/shared/breathing-section"
import { BreathingText } from "@/components/shared/breathing-text"
import { BreathPause } from "@/components/shared/breath-pause"
import { BreathingButton } from "@/components/shared/breathing-button"
import { NewsletterForm } from "@/components/shared/newsletter-form"
import { ParallaxWindow } from "@/components/shared/parallax-window"
import { Reveal } from "@/components/shared/reveal"
import ScrollIndicator from "@/components/shared/scroll-indicator"
import { TextureOverlay } from "@/components/shared/texture-overlay"
import { Button } from "@/components/ui/button"
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
      <section
        aria-labelledby="hero-heading"
        className="desert-oasis-hero relative -mt-[72px] min-h-[100svh] overflow-hidden bg-[#102a20]"
      >
        <div aria-hidden="true" className="absolute inset-0">
          <Image
            alt=""
            className="desert-oasis-hero__image object-cover"
            fill
            preload
            quality={88}
            sizes="100vw"
            src="/images/homero-desert-oasis.jpg"
          />
        </div>
        <HeroFilm source={media.motion.desertHero.src} />
        <div className="hero-overlay absolute inset-0" />

        <div className="hero-content relative z-10 mx-auto flex w-full max-w-7xl items-end px-6 pt-40 pb-24 md:pt-44 md:pb-28 lg:px-8 lg:pb-32">
          <div className="hero-content-fade flex max-w-2xl flex-col items-start text-left">
            <p className="mb-5 text-[11px] font-medium tracking-[0.3em] text-white/75 uppercase sm:text-xs">
              Private experiences · Palm Springs
            </p>
            <h1
              className="max-w-[12ch] text-5xl leading-[0.98] font-light tracking-[-0.035em] text-white sm:text-6xl md:text-7xl lg:text-[5.5rem]"
              id="hero-heading"
            >
              Come back to your whole body.
            </h1>
            <p className="mt-6 text-sm font-medium tracking-[0.2em] text-white/80 uppercase md:text-base">
              Facial rituals · Yoga + Sound · Tarot
            </p>
            <p className="mt-5 max-w-xl text-base leading-7 font-light text-white/82 md:text-lg">
              Skin care, movement, sound, and intuitive readings with Shannon,
              held in the quiet of the desert.
            </p>

            <div className="mt-9 flex w-full flex-col items-start gap-5 sm:w-auto sm:flex-row sm:items-center">
              <Button
                asChild
                className="btn-primary-hover h-14 w-full gap-3 rounded-full bg-white py-1.5 pr-7 pl-2 text-[#102a20] shadow-[0_12px_40px_rgba(4,20,13,0.18)] hover:bg-white sm:w-auto"
                size="lg"
              >
                <Link href="/book">
                  <Image
                    alt=""
                    className="size-11 rounded-full border border-[#dbe6de] object-cover object-[center_32%]"
                    height={44}
                    src={media.brand.windowPortrait.src}
                    width={44}
                  />
                  <span>Book with Shannon</span>
                </Link>
              </Button>
              <Link
                className="group inline-flex min-h-11 items-center gap-2 py-2 text-sm font-medium text-white/88 underline decoration-white/35 underline-offset-8 transition hover:text-white"
                href="#experiences"
              >
                Explore experiences
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none"
                />
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
          <ScrollIndicator />
        </div>
      </section>

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
            alt={media.brand.smilingPortrait.alt}
            aspectRatio="4 / 5.35"
            className="relative w-full rounded-t-[12rem] rounded-b-[2rem]"
            imageClassName="object-cover object-[center_34%]"
            sizes="(max-width: 767px) 90vw, 38vw"
            speed={0.1}
            src={media.brand.smilingPortrait.src}
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
        id="experiences"
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
            The most powerful experiences don&apos;t ask us to become someone
            new. They help us remember who we already are.
          </BreathingText>
          <p className="mt-6 text-xs tracking-[0.22em] text-[var(--sanctuary-sage)] uppercase">
            Shannon Mary Dixon
          </p>
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
            <BreathingButton
              asChild
              breathVariant="primary"
              className="mt-8 h-12 self-start rounded-full bg-[var(--sanctuary-fern)] px-7 text-[var(--sanctuary-ivory)] hover:bg-[var(--sanctuary-ink)]"
            >
              <Link href="/beauty/lift">
                Explore LIFT
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
