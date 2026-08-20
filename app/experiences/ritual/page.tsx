import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MoonStar, ScrollText, Sparkles } from "lucide-react"

import { JsonLd } from "@/components/seo/json-ld"
import { PullQuote } from "@/components/shared/pull-quote"
import { SectionDivider } from "@/components/shared/section-divider"
import { ServiceAreaNote } from "@/components/shared/service-area-note"
import { Button } from "@/components/ui/button"
import { media } from "@/lib/media"
import { createPageMetadata, createServiceJsonLd } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Tarot Readings & Astrology in Palm Springs | HWL by SMD",
  description:
    "Private tarot readings, astrology consultations, and ritual ceremony in Palm Springs and the Hi-Desert.",
  path: "/tarot",
})

const offerings = [
  {
    icon: ScrollText,
    title: "Intuitive Tarot Reading",
    bookingHref: "/book?service=intuitive-tarot-reading#choose-time",
    summary:
      "A personalized virtual reading for life transitions, decision-making, and reconnecting with inner wisdom.",
    detail:
      "Explore current circumstances, opportunities, challenges, and aligned next steps through reflective card work.",
    format: "45–60 minutes · $222 · Virtual via Zoom",
  },
  {
    icon: MoonStar,
    title: "Moon Oracle Reading",
    bookingHref: "/book?service=moon-oracle-reading#choose-time",
    summary:
      "A personalized astrological and lunar reading for clarity, timing, and connection to the immediate season.",
    detail:
      "Explore the current cosmic landscape and how its themes show up in your life, without treating astrology as fate.",
    format: "45–60 minutes · $222 · Virtual via Zoom",
  },
  {
    icon: Sparkles,
    title: "Tarot + Reiki Experience",
    bookingHref: "/book?service=tarot-and-reiki#choose-time",
    summary:
      "Intuitive guidance followed by restorative Reiki support designed to balance, clarify, and renew.",
    detail:
      "Begin with a virtual tarot reading, then continue with optional in-person Reiki locally or remote Reiki energy work.",
    format: "60–75 minutes · $444 · Hybrid",
  },
] as const

const seasons = [
  {
    name: "Spring",
    ritual: "Begin again",
    note: "A practice for emergence, clarity, and the first honest yes.",
    image: media.brand.sanctuaryHero,
  },
  {
    name: "Summer",
    ritual: "Stand in the light",
    note: "A practice for expression, warmth, and receiving what has grown.",
    image: media.brand.destinationPortrait,
  },
  {
    name: "Autumn",
    ritual: "Release with care",
    note: "A practice for discernment, gratitude, and making room.",
    image: media.editorial.liftBotanicals,
  },
  {
    name: "Winter",
    ritual: "Listen inward",
    note: "A practice for rest, quiet, and trusting what cannot be rushed.",
    image: media.experiences.ritualMoon,
  },
] as const

export default function RitualPage() {
  return (
    <>
      <JsonLd
        data={createServiceJsonLd({
          name: "HWL Tarot Experiences",
          description:
            "Tarot, astrology, and intentional ritual offered as reflective wellness practices for private guests and groups.",
          path: "/tarot",
          serviceType: "Reflective ritual and intuitive guidance",
          image: media.experiences.tarotSpread.src,
        })}
        id="tarot-service-schema"
      />

      <section className="relative -mt-16 flex min-h-[88vh] items-end overflow-hidden bg-[#211c22] px-6 py-24 pt-36 text-white md:-mt-20 md:pt-40">
        <Image
          alt={media.experiences.tarotSpread.alt}
          className="object-cover object-[67%_center] [filter:saturate(.82)_contrast(1.02)] md:object-center"
          fill
          preload
          sizes="100vw"
          src={media.experiences.tarotSpread.src}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(20,16,21,0.96)_0%,rgba(20,16,21,0.8)_34%,rgba(20,16,21,0.2)_70%,rgba(20,16,21,0.14)_100%),linear-gradient(to_top,rgba(20,16,21,0.93)_0%,rgba(20,16,21,0.22)_56%,rgba(20,16,21,0.48)_100%)]"
        />
        <div className="relative z-10 mx-auto w-full max-w-7xl pb-8 md:pb-16">
          <p className="text-xs tracking-[0.3em] text-[#dcc5a5] uppercase">
            Tarot
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl leading-[1.02] font-medium text-white md:text-7xl lg:text-8xl">
            A mirror, not a map.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-[1.9] text-white/65 md:text-xl">
            Pattern-reading for the season you&apos;re in.
          </p>
          <Button
            asChild
            className="mt-10 h-12 rounded-full bg-[#dcc5a5] px-7 text-[#211c22] hover:bg-white"
          >
            <Link href="/book?service=intuitive-tarot-reading#choose-time">
              Book a Reading
            </Link>
          </Button>
          <Button
            asChild
            className="mt-4 h-12 rounded-full border-white/35 bg-white/10 px-7 text-white hover:bg-white/20 hover:text-white sm:mt-10 sm:ml-3"
            variant="outline"
          >
            <Link href="/the-den">Explore The Den</Link>
          </Button>
        </div>
      </section>

      <section
        className="relative overflow-hidden bg-[#f7f1e9] px-6 py-28 md:py-40"
        id="overview"
      >
        <div
          aria-hidden="true"
          className="absolute -top-44 -left-40 size-[34rem] rounded-full bg-[#76536e]/6 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="mb-7 font-serif text-2xl text-[var(--primary)] italic md:text-3xl">
            Shannon reads tarot the way she reads skin — looking for what&apos;s
            held, what&apos;s ready to move, what the body already knows.
          </p>
          <p className="font-serif text-xl leading-[2] text-[var(--primary)] md:text-2xl">
            For more than two decades she has studied astrology, symbolism,
            ritual, tarot, energetics, and personal transformation. Tarot and
            astrology readings are offered virtually via Zoom. Meet from
            wherever you are. The work doesn&apos;t require physical presence.
            It requires presence.
          </p>
        </div>
        <PullQuote
          className="mx-auto mt-24 max-w-5xl"
          quote="The cards don't tell you what to do. They show you what you already know."
        />
      </section>

      <SectionDivider variant="fade" />

      <section
        className="relative overflow-hidden bg-[#251f27] px-6 py-28 text-white md:py-40"
        id="offerings"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 [background-image:radial-gradient(circle_at_20%_18%,rgba(220,197,165,0.12),transparent_24%),radial-gradient(circle_at_82%_72%,rgba(118,83,110,0.2),transparent_30%)] opacity-30"
        />
        <div className="relative mx-auto max-w-5xl">
          <p className="text-center text-xs tracking-[0.28em] text-[#dcc5a5] uppercase">
            Offerings
          </p>
          <h2 className="mx-auto mt-5 max-w-2xl text-center text-5xl leading-tight text-white md:text-6xl">
            Three ways to listen.
          </h2>
          <div className="mt-20 divide-y divide-white/10 border-y border-white/10">
            {offerings.map(
              ({ bookingHref, detail, format, icon: Icon, summary, title }) => (
                <details className="group py-8 md:py-10" key={title}>
                  <summary className="grid cursor-pointer list-none gap-6 md:grid-cols-[64px_0.55fr_1fr_auto] md:items-center">
                    <span className="grid size-14 place-items-center rounded-full border border-white/12 text-[#dcc5a5]">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="text-4xl text-white">{title}</h3>
                    <p className="max-w-xl text-base leading-[1.9] text-white/58">
                      {summary}
                    </p>
                    <span className="text-xs tracking-[0.18em] text-[#dcc5a5] uppercase group-open:hidden">
                      Enter
                    </span>
                    <span className="hidden text-xs tracking-[0.18em] text-[#dcc5a5] uppercase group-open:block">
                      Close
                    </span>
                  </summary>
                  <div className="mt-8 grid gap-5 pl-0 md:ml-[calc(64px+1.5rem)] md:grid-cols-[1fr_auto] md:items-end">
                    <p className="max-w-2xl text-base leading-[1.9] text-white/68">
                      {detail}
                    </p>
                    <div className="md:text-right">
                      <p className="text-xs tracking-wide text-white/70">
                        {format}
                      </p>
                      <Link
                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#dcc5a5] underline-offset-4 hover:underline"
                        href={bookingHref}
                      >
                        Book this offering
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </details>
              )
            )}
          </div>
          <p className="mx-auto mt-12 max-w-2xl text-center text-xs leading-[1.8] text-white/72">
            Readings are offered for reflection and self-inquiry. They are not
            predictions, psychological counseling, medical care, or financial
            advice. Take what resonates and leave what does not.
          </p>
        </div>
      </section>

      <section className="bg-[#f3e9dc] px-6 py-24 text-center md:py-32">
        <figure className="mx-auto max-w-4xl">
          <blockquote className="font-serif text-3xl leading-[1.35] text-[var(--primary)] italic md:text-5xl">
            “The celestial and aromatherapy elements are so fascinating and
            comforting. Such an empowering and healing space.”
          </blockquote>
          <figcaption className="mt-8 text-xs tracking-[0.22em] text-[var(--accent)] uppercase">
            Grace R. · Astrology + Yoga Client
          </figcaption>
        </figure>
      </section>

      <section
        className="overflow-hidden bg-[#f8f3ec] px-6 py-28 md:py-40"
        id="seasons"
      >
        <div className="mx-auto max-w-7xl">
          <p className="text-xs tracking-[0.28em] text-[var(--accent)] uppercase">
            Seasonal rituals
          </p>
          <h2 className="mt-5 max-w-3xl text-5xl leading-tight text-[var(--primary)] md:text-6xl">
            The year already knows how to move.
          </h2>
          <div
            aria-label="Seasonal ritual gallery"
            className="-mx-6 mt-16 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] md:mx-0 md:px-0"
            role="region"
            tabIndex={0}
          >
            {seasons.map(({ image, name, note, ritual }) => (
              <article
                className="group relative aspect-[4/5] w-[82vw] max-w-sm shrink-0 snap-center overflow-hidden rounded-[2rem] bg-[var(--muted)] md:w-[30vw]"
                key={name}
              >
                <Image
                  alt={image.alt}
                  className="object-cover transition duration-[1200ms] ease-out motion-safe:group-hover:scale-[1.035]"
                  fill
                  sizes="(max-width: 767px) 82vw, 30vw"
                  src={image.src}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#211c22]/88 via-[#211c22]/12 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                  <p className="text-xs tracking-[0.22em] text-[#dcc5a5] uppercase">
                    {name}
                  </p>
                  <h3 className="mt-3 text-3xl text-white">{ritual}</h3>
                  <p className="mt-3 text-sm leading-[1.75] text-white/62">
                    {note}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="relative overflow-hidden bg-[#211c22] px-6 py-36 text-center text-white md:py-52"
        id="invitation"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_105%,rgba(210,150,100,0.17),transparent_48%)]"
        />
        <div className="relative mx-auto max-w-3xl">
          <p className="text-xs tracking-[0.3em] text-[#dcc5a5] uppercase">
            Tarot
          </p>
          <h2 className="mt-6 text-5xl leading-tight text-white md:text-7xl">
            Begin the inner work.
          </h2>
          <Link
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#dcc5a5] px-7 py-3 text-sm font-medium text-[#211c22] transition hover:bg-white"
            href="/book?service=intuitive-tarot-reading#choose-time"
          >
            Book a Reading <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
      <ServiceAreaNote />
    </>
  )
}
