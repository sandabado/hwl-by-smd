import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { JsonLd } from "@/components/seo/json-ld"
import { AmbientLight } from "@/components/shared/ambient-light"
import { BreathingSection } from "@/components/shared/breathing-section"
import { BreathingText } from "@/components/shared/breathing-text"
import { Reveal } from "@/components/shared/reveal"
import { TextureOverlay } from "@/components/shared/texture-overlay"
import { Button } from "@/components/ui/button"
import { media } from "@/lib/media"
import { absoluteUrl, createPageMetadata, SITE_URL } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Shannon Mary Dixon | About HWL by SMD",
  description:
    "Meet Shannon Mary Dixon and explore the movement, beauty, and reflective practices behind HWL by SMD in Palm Springs.",
  path: "/about",
})

const shannonJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/about#shannon`,
  name: "Shannon Mary Dixon",
  url: absoluteUrl("/about"),
  image: absoluteUrl(media.brand.windowPortrait.src),
}

const eyebrowClass =
  "text-xs font-semibold tracking-[0.24em] text-[var(--accent)] uppercase"

export default function AboutPage() {
  return (
    <>
      <JsonLd data={shannonJsonLd} id="shannon-person-schema" />

      <section className="relative isolate -mt-16 overflow-hidden bg-[var(--room-cream)] px-6 pt-28 pb-20 md:-mt-20 md:pt-36 md:pb-28">
        <AmbientLight position="top-left" tone="warm" />
        <AmbientLight position="bottom-right" tone="clay" />
        <TextureOverlay intensity="soft" variant="paper" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
          <Reveal className="max-w-xl lg:pb-14">
            <p className={eyebrowClass}>Meet Shannon Mary Dixon</p>
            <BreathingText
              as="h1"
              className="mt-6 max-w-[9ch] text-[var(--primary)]"
              size="hero"
            >
              A life lived in motion.
            </BreathingText>
            <BreathingText
              className="mt-7 max-w-lg text-[var(--muted-foreground)]"
              size="subheading"
            >
              Shannon brings beauty, movement, reflection, and a lifetime of
              attention to what the body is saying.
            </BreathingText>
            <p className="mt-8 max-w-md text-base leading-[1.85] text-[var(--muted-foreground)]">
              HWL is where Shannon&apos;s worlds meet: beauty, movement, and
              reflective practice, held with warmth and without performance.
            </p>
            <Link
              className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full border border-[var(--border)] bg-white/55 px-6 py-3 text-sm font-semibold text-[var(--primary)] transition hover:bg-white focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-4 focus-visible:outline-none"
              href="#ice"
            >
              Read her story
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Reveal>

          <Reveal className="lg:pt-8" delay={100}>
            <figure>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[var(--muted)] shadow-[0_38px_100px_rgba(72,55,43,0.16)] sm:aspect-[5/6]">
                <Image
                  alt={media.brand.windowPortrait.alt}
                  className="object-cover object-[center_38%]"
                  fill
                  preload
                  quality={88}
                  sizes="(max-width: 1023px) 100vw, 58vw"
                  src={media.brand.windowPortrait.src}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_64%,rgba(35,30,27,0.34)_100%)]"
                />
              </div>
              <figcaption className="mt-4 flex items-center justify-between gap-5 text-xs tracking-[0.14em] text-[var(--muted-foreground)] uppercase">
                <span>Shannon Mary Dixon</span>
                <span>Palm Springs, California</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <BreathingSection
        background="cool"
        contentClassName="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.16fr_0.84fr] lg:gap-20"
        id="ice"
        padding="expansive"
        variant="kitchen"
      >
        <figure data-media-kind={media.editorial.aboutSkatingConcept.kind}>
          <div className="relative aspect-[3/2] overflow-hidden rounded-[2rem] bg-[var(--muted)] shadow-[0_30px_90px_rgba(72,55,43,0.12)]">
            <Image
              alt={media.editorial.aboutSkatingConcept.alt}
              className="object-cover object-center"
              fill
              quality={88}
              sizes="(max-width: 1023px) 100vw, 58vw"
              src={media.editorial.aboutSkatingConcept.src}
            />
          </div>
          <figcaption className="mt-4 max-w-2xl text-xs leading-[1.7] tracking-[0.1em] text-[var(--muted-foreground)] uppercase">
            <span className="font-semibold text-[var(--accent)]">
              {media.editorial.aboutSkatingConcept.label}
            </span>{" "}
            · A visual echo of Shannon&apos;s skating chapter.{" "}
            {media.editorial.aboutSkatingConcept.disclosure}
          </figcaption>
        </figure>

        <article className="max-w-xl">
          <p className={eyebrowClass}>01 · The ice</p>
          <BreathingText
            as="h2"
            className="mt-5 text-[var(--primary)]"
            size="heading"
          >
            The body knew first.
          </BreathingText>
          <BreathingText
            className="mt-7 text-[var(--muted-foreground)]"
            size="body"
          >
            Shannon&apos;s story begins with figure skating: repetition,
            balance, precision, and learning how to return after a fall.
          </BreathingText>
          <p className="mt-6 text-base leading-[1.85] text-[var(--muted-foreground)]">
            She describes the ice as her earliest education in presence. Long
            before wellness became her work, she understood that the body
            notices everything—and that attention changes how we move through an
            experience.
          </p>
        </article>
      </BreathingSection>

      <BreathingSection
        contentClassName="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24"
        id="movement"
        padding="expansive"
        variant="studio"
      >
        <article className="max-w-xl lg:pr-6">
          <p className={eyebrowClass}>02 · Movement</p>
          <BreathingText
            as="h2"
            className="mt-5 text-[var(--primary)]"
            size="heading"
          >
            Strength became a softer kind of listening.
          </BreathingText>
          <BreathingText
            className="mt-7 text-[var(--muted-foreground)]"
            size="body"
          >
            Yoga gave Shannon another language for rhythm, effort, breath, and
            rest.
          </BreathingText>
          <p className="mt-6 text-base leading-[1.85] text-[var(--muted-foreground)]">
            Her teaching is grounded in choice. A session can be strong or
            restorative, exacting or quiet, with room to modify and respond to
            the person who arrived that day.
          </p>
          <Link
            className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--accent)] underline decoration-[var(--room-clay)] underline-offset-8 transition hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-4 focus-visible:outline-none"
            href="/yoga"
          >
            Explore yoga + sound
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </article>

        <div className="grid grid-cols-[1.08fr_0.92fr] items-end gap-4 sm:gap-6">
          <figure>
            <div className="relative aspect-[2/3] overflow-hidden rounded-[2rem] bg-[var(--muted)]">
              <Image
                alt={media.experiences.movementBoat.alt}
                className="object-cover object-center"
                fill
                quality={88}
                sizes="(max-width: 1023px) 54vw, 34vw"
                src={media.experiences.movementBoat.src}
              />
            </div>
            <figcaption className="mt-3 text-xs tracking-[0.12em] text-[var(--muted-foreground)] uppercase">
              Shannon in practice
            </figcaption>
          </figure>
          <figure className="pb-10 sm:pb-16">
            <div className="relative aspect-[2/3] overflow-hidden rounded-[2rem] bg-[var(--muted)]">
              <Image
                alt={media.brand.standingStretch.alt}
                className="object-cover object-center"
                fill
                quality={88}
                sizes="(max-width: 1023px) 42vw, 27vw"
                src={media.brand.standingStretch.src}
              />
            </div>
          </figure>
        </div>
      </BreathingSection>

      <BreathingSection
        background="gradient"
        contentClassName="mx-auto w-full max-w-7xl px-6"
        id="road"
        padding="expansive"
        variant="kitchen"
      >
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end lg:gap-20">
          <p className={eyebrowClass}>03 · The open road</p>
          <div>
            <BreathingText
              as="h2"
              className="max-w-3xl text-[var(--primary)]"
              size="heading"
            >
              Calm was never the same thing as standing still.
            </BreathingText>
            <p className="mt-6 max-w-2xl text-base leading-[1.85] text-[var(--muted-foreground)]">
              Riding carries another side of Shannon&apos;s story: independence,
              momentum, and the clear focus that comes from being fully inside a
              moment.
            </p>
          </div>
        </div>

        <figure
          className="mt-12 md:mt-16"
          data-media-kind={media.editorial.aboutMotorcycleConcept.kind}
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-[var(--muted)] shadow-[0_32px_90px_rgba(72,55,43,0.14)] md:aspect-[3/2]">
            <Image
              alt={media.editorial.aboutMotorcycleConcept.alt}
              className="object-cover object-[46%_center]"
              fill
              quality={88}
              sizes="(max-width: 767px) 100vw, 90vw"
              src={media.editorial.aboutMotorcycleConcept.src}
            />
          </div>
          <figcaption className="mt-4 text-xs leading-[1.7] tracking-[0.1em] text-[var(--muted-foreground)] uppercase">
            <span className="font-semibold text-[var(--accent)]">
              {media.editorial.aboutMotorcycleConcept.label}
            </span>{" "}
            · A visual echo of Shannon&apos;s open-road chapter.{" "}
            {media.editorial.aboutMotorcycleConcept.disclosure}
          </figcaption>
        </figure>
      </BreathingSection>

      <BreathingSection
        background="cool"
        contentClassName="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1.18fr_0.82fr] lg:gap-24"
        id="beauty"
        padding="expansive"
        variant="bathroom"
      >
        <figure>
          <div className="relative aspect-video overflow-hidden rounded-[2rem] bg-[var(--muted)] shadow-[0_30px_90px_rgba(72,55,43,0.12)]">
            <Image
              alt={media.editorial.liftVideoPreview.alt}
              className="object-cover object-center"
              fill
              quality={88}
              sizes="(max-width: 1023px) 100vw, 58vw"
              src={media.editorial.liftVideoPreview.src}
            />
          </div>
          <figcaption className="mt-4 text-xs tracking-[0.12em] text-[var(--muted-foreground)] uppercase">
            Shannon practicing the LIFT facial ritual
          </figcaption>
        </figure>

        <article className="max-w-xl">
          <p className={eyebrowClass}>04 · Beauty + touch</p>
          <BreathingText
            as="h2"
            className="mt-5 text-[var(--primary)]"
            size="heading"
          >
            Care became something tangible.
          </BreathingText>
          <BreathingText
            className="mt-7 text-[var(--muted-foreground)]"
            size="body"
          >
            In her beauty practice, Shannon works through skin, touch, pace, and
            thoughtful personal care.
          </BreathingText>
          <p className="mt-6 text-base leading-[1.85] text-[var(--muted-foreground)]">
            Her beauty practice does not ask anyone to become a different
            person. It creates time to pay attention, soften the pace, and build
            a relationship with a ritual that can be repeated at home.
          </p>
          <Link
            className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--accent)] underline decoration-[var(--room-clay)] underline-offset-8 transition hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-4 focus-visible:outline-none"
            href="/beauty/lift"
          >
            Experience the LIFT ritual
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </article>
      </BreathingSection>

      <BreathingSection
        contentClassName="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 lg:grid-cols-[0.82fr_1.18fr] lg:gap-24"
        id="practice"
        padding="expansive"
        variant="kitchen"
      >
        <article className="max-w-xl">
          <p className={eyebrowClass}>05 · The practice now</p>
          <BreathingText
            as="h2"
            className="mt-5 text-[var(--primary)]"
            size="heading"
          >
            All of it belongs in the room.
          </BreathingText>
          <BreathingText
            className="mt-7 text-[var(--muted-foreground)]"
            size="body"
          >
            Today, HWL brings beauty, movement, sound, astrology, and reflective
            ritual into one attentive practice.
          </BreathingText>
          <p className="mt-6 text-base leading-[1.85] text-[var(--muted-foreground)]">
            The format may change, but Shannon&apos;s approach is consistent:
            listen first, keep the language honest, and leave room for each
            person to choose what feels useful.
          </p>
          <BreathingText
            as="p"
            className="mt-10 border-l border-[var(--room-clay)] pl-6 font-serif text-2xl text-[var(--primary)] italic md:text-3xl"
            size="subheading"
          >
            The through-line is a return to relationship with yourself, not a
            performance of becoming someone new.
          </BreathingText>
        </article>

        <figure>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[var(--muted)] shadow-[0_36px_100px_rgba(72,55,43,0.14)] sm:aspect-[5/6]">
            <Image
              alt={media.brand.destinationPortrait.alt}
              className="object-cover object-[center_32%]"
              fill
              quality={88}
              sizes="(max-width: 1023px) 100vw, 58vw"
              src={media.brand.destinationPortrait.src}
            />
          </div>
          <figcaption className="mt-4 text-xs tracking-[0.12em] text-[var(--muted-foreground)] uppercase">
            Shannon Mary Dixon
          </figcaption>
        </figure>
      </BreathingSection>

      <BreathingSection
        background="gradient"
        contentClassName="mx-auto max-w-4xl px-6 text-center"
        id="invitation"
        padding="expansive"
        variant="kitchen"
      >
        <p className={eyebrowClass}>An invitation</p>
        <BreathingText
          as="h2"
          className="mx-auto mt-5 max-w-3xl text-[var(--primary)] md:text-6xl"
          size="heading"
        >
          Meet the practice in person.
        </BreathingText>
        <p className="mx-auto mt-7 max-w-2xl text-lg leading-[1.8] text-[var(--muted-foreground)]">
          Start with the experience that draws you in, or share what you are
          looking for and let Shannon help you find the right place to begin.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            asChild
            className="h-12 rounded-full bg-[var(--primary)] px-8 text-[var(--primary-foreground)] hover:bg-[var(--accent)]"
          >
            <Link href="/book">
              Book with Shannon
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            className="h-12 rounded-full border-[var(--border)] bg-white/45 px-8 text-[var(--primary)] hover:bg-white/75"
            variant="outline"
          >
            <Link href="/beauty/lift">Explore LIFT</Link>
          </Button>
        </div>
      </BreathingSection>
    </>
  )
}
