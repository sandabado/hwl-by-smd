import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { JsonLd } from "@/components/seo/json-ld"
import { ServiceOfferingsSection } from "@/components/services/service-offerings-section"
import { PullQuote } from "@/components/shared/pull-quote"
import { ServiceAreaNote } from "@/components/shared/service-area-note"
import { Button } from "@/components/ui/button"
import { media } from "@/lib/media"
import { createPageMetadata, createServiceJsonLd } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Tarot, Astrology & Reiki in Palm Springs | HWL by SMD",
  description:
    "Private tarot, astrology, and Reiki experiences for reflection and renewal in Palm Springs and the Hi-Desert.",
  path: "/astrology",
})

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

export default function AstrologyPage() {
  return (
    <>
      <JsonLd
        data={createServiceJsonLd({
          name: "HWL Being Experiences",
          description:
            "Tarot, astrology, and Reiki offered as reflective wellness practices for private guests and groups.",
          path: "/astrology",
          serviceType: "Tarot, astrology, Reiki, and reflective ritual",
          image: media.experiences.tarotSpread.src,
        })}
        id="astrology-service-schema"
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
            Being
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl leading-[1.02] font-medium text-white md:text-7xl lg:text-8xl">
            A mirror, not a map.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-[1.9] text-white/65 md:text-xl">
            Tarot · Astrology · Reiki
          </p>
          <Button
            asChild
            className="mt-10 h-12 rounded-full bg-[#dcc5a5] px-7 text-[#211c22] hover:bg-white"
          >
            <Link href="#offerings">
              Explore Being Sessions <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <ServiceOfferingsSection pillarId="ritual" />

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
            moon oracle readings may be held virtually or in person; Tarot +
            Reiki is an in-person experience. The work begins with presence.
          </p>
        </div>
        <PullQuote
          className="mx-auto mt-24 max-w-5xl"
          quote="The cards don't tell you what to do. They show you what you already know."
        />
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

      <ServiceAreaNote />
    </>
  )
}
