import { ArrowRight, ArrowUpRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { LiftPreviewFilm } from "@/components/home/lift-preview-film"
import { NewsletterForm } from "@/components/shared/newsletter-form"
import { Button } from "@/components/ui/button"
import { getCanonicalHomepageLiftHref } from "@/lib/homepage-feature"
import { media } from "@/lib/media"
import type { PublishedHomepageFeature } from "@/lib/site-content"

const brandWorlds = [
  {
    id: "beauty",
    title: "Beauty",
    detail: "Skin · Facial Ritual · LIFT",
    description:
      "Professional skincare, intentional touch and simple practices designed to support the skin you’re in.",
    href: "/beauty",
    image: media.home.beauty,
    imagePosition: "object-center",
  },
  {
    id: "body",
    title: "Body",
    detail: "Movement · Yoga · Sound",
    description: "Move with intention. Build strength. Create space.",
    href: "/yoga",
    image: media.home.body,
    imagePosition: "object-[52%_42%]",
  },
  {
    id: "being",
    title: "Being",
    detail: "Tarot · Astrology · Ritual",
    description:
      "Practices for listening deeper, noticing what’s moving, and meeting yourself where you are.",
    href: "/astrology",
    image: media.home.being,
    imagePosition: "object-center",
  },
] as const

const sessionPathways = [
  {
    title: "Facials",
    location: "Palm Springs",
    description: "Customized facial treatments and intentional touch.",
    href: "/book?service=signature-facial",
    cta: "Book a facial",
    image: media.home.proofFacial,
  },
  {
    title: "Private Yoga",
    location: "Palm Springs · Joshua Tree · Surrounding Desert",
    description: "Private movement for individuals, groups and celebrations.",
    href: "/book?service=private-yoga",
    cta: "Book or inquire",
    image: media.home.proofPrivateYoga,
  },
  {
    title: "Readings",
    location: "Virtual + select in-person sessions",
    description: "Private tarot and intuitive sessions with Shannon.",
    href: "/book?service=intuitive-tarot-reading",
    cta: "Book a reading",
    image: media.home.proofReadings,
  },
] as const

function EditorialLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="group inline-flex min-h-11 items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase underline-offset-8 hover:underline"
      href={href}
    >
      {label}
      <ArrowUpRight
        aria-hidden="true"
        className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </Link>
  )
}

export function HeroEntry({
  featuredExperience,
}: {
  featuredExperience: PublishedHomepageFeature
}) {
  return (
    <div className="overflow-hidden bg-[#f7f3ec]" data-homepage="">
      <section
        aria-labelledby="home-hero-heading"
        className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[#dde2dc] pt-20"
      >
        <Image
          alt={media.home.hero.alt}
          className="object-contain object-right-bottom"
          fill
          loading="eager"
          quality={88}
          sizes="100vw"
          src={media.home.hero.src}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(232,236,231,0.98)_0%,rgba(232,236,231,0.9)_34%,rgba(232,236,231,0.28)_68%,rgba(232,236,231,0.05)_100%)] max-md:bg-[linear-gradient(180deg,rgba(232,236,231,0.96)_0%,rgba(232,236,231,0.82)_42%,rgba(232,236,231,0.1)_72%,rgba(31,38,33,0.12)_100%)]"
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 sm:py-24 lg:py-32">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-[0.3em] text-[#4a5c50] uppercase">
              Body · Beauty · Being
            </p>
            <h1
              className="mt-7 text-[clamp(3rem,7.5vw,6.9rem)] leading-[0.91] font-medium tracking-[-0.04em] text-[#20251f]"
              id="home-hero-heading"
            >
              Come back to your whole body.
            </h1>
            <p className="mt-7 text-sm font-medium tracking-[0.19em] text-[#465149] uppercase sm:text-base">
              Beauty · Movement · Ritual
            </p>
            <p className="mt-5 max-w-md text-base leading-7 text-[#4d554f]">
              Practices, products + experiences by Shannon Mary Dixon.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button
                asChild
                className="min-h-12 rounded-full bg-[#20251f] px-7 text-xs font-semibold tracking-[0.16em] text-white uppercase hover:bg-[#765538]"
              >
                <Link href="#worlds">Explore HWL</Link>
              </Button>
              <Button
                asChild
                className="min-h-12 rounded-full border-[#20251f]/25 bg-white/30 px-7 text-xs font-semibold tracking-[0.16em] text-[#20251f] uppercase backdrop-blur-sm hover:bg-white/75"
                variant="outline"
              >
                <Link href="/book">Book with Shannon</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold tracking-[0.28em] text-[var(--accent)] uppercase">
            A practice for wherever you are
          </p>
          <h2 className="mt-7 text-4xl leading-tight font-medium text-[var(--primary)] sm:text-5xl lg:text-6xl">
            HWL is a practice in coming back to yourself.
          </h2>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[var(--muted-foreground)] sm:text-lg">
            Through skin, movement and ritual, HWL brings together simple
            practices designed to help you feel more at home in your body —
            wherever you are.
          </p>
        </div>
      </section>

      <section
        className="bg-[#e8e8e1] px-6 py-24 sm:py-28 lg:py-36"
        id="worlds"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 border-b border-[#20251f]/15 pb-9 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.28em] text-[#626a61] uppercase">
                The HWL world
              </p>
              <h2 className="mt-4 text-4xl font-medium text-[#20251f] sm:text-5xl">
                Beauty · Body · Being
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-[#5b625b]">
              Three ways into one practice: care for the skin, movement for the
              body, and rituals for deeper listening.
            </p>
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-3 lg:gap-6">
            {brandWorlds.map((world, index) => (
              <article className="group" id={world.id} key={world.title}>
                <Link
                  aria-label={`Explore ${world.title}`}
                  className="relative block aspect-[4/5] overflow-hidden bg-[#cfd3cc]"
                  href={world.href}
                >
                  <Image
                    alt={world.image.alt}
                    className={`${world.imagePosition} object-cover transition duration-700 ease-out group-hover:scale-[1.025]`}
                    fill
                    sizes="(max-width: 1023px) 92vw, 31vw"
                    src={world.image.src}
                  />
                  <span className="absolute top-5 left-5 grid size-10 place-items-center rounded-full bg-[#f7f3ec]/90 font-serif text-sm text-[#20251f] backdrop-blur-sm">
                    0{index + 1}
                  </span>
                </Link>
                <p className="mt-7 text-xs font-semibold tracking-[0.2em] text-[#626a61] uppercase">
                  {world.detail}
                </p>
                <h3 className="mt-3 text-4xl font-medium text-[#20251f]">
                  {world.title}
                </h3>
                <p className="mt-4 min-h-20 text-sm leading-7 text-[#5b625b]">
                  {world.description}
                </p>
                <div className="flex flex-wrap items-center gap-x-7">
                  <EditorialLink
                    href={world.href}
                    label={`Explore ${world.title}`}
                  />
                  {world.id === "beauty" ? (
                    <Link
                      className="inline-flex min-h-11 items-center text-xs font-medium tracking-[0.14em] text-[#626a61] uppercase underline-offset-8 transition-colors hover:text-[#20251f] hover:underline"
                      href="/beauty/lift"
                    >
                      Discover LIFT
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#20251f] px-6 py-24 text-[#f7f3ec] sm:py-28 lg:py-36">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.03fr_0.97fr] lg:gap-24">
          <div className="lg:order-2">
            <p className="text-xs font-semibold tracking-[0.28em] text-[#d8b98e] uppercase">
              HWL Beauty
            </p>
            <h2 className="mt-6 text-[clamp(4.5rem,11vw,8rem)] leading-[0.85] font-medium tracking-[-0.05em]">
              LIFT
            </h2>
            <h3 className="mt-8 text-3xl font-medium sm:text-4xl">
              A Daily Facial Ritual
            </h3>
            <p className="mt-5 text-lg text-white/75">
              Seven movements. Five minutes. Your own two hands.
            </p>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/66">
              A guided facial massage designed to lift, sculpt, release tension
              and make the skincare ritual you’re already doing more
              intentional.
            </p>
            <div className="mt-8">
              <Link
                className="inline-flex min-h-12 items-center gap-3 rounded-full bg-[#f7f3ec] px-7 text-xs font-semibold tracking-[0.18em] text-[#20251f] uppercase transition hover:bg-[#d8b98e]"
                href={getCanonicalHomepageLiftHref(featuredExperience)}
              >
                Explore LIFT
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden bg-[#c8b198] lg:order-1">
            <Image
              alt={media.editorial.liftVideoPreview.alt}
              className="object-cover"
              fill
              sizes="(max-width: 1023px) 92vw, 48vw"
              src={media.editorial.liftVideoPreview.src}
            />
            <LiftPreviewFilm
              poster={media.editorial.liftVideoPreview.src}
              source={media.motion.liftPreview.src}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#20251f]/45 via-transparent to-transparent" />
            <p className="absolute right-6 bottom-6 left-6 text-xs font-semibold tracking-[0.22em] text-white uppercase">
              Seven movements · Five minutes
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold tracking-[0.28em] text-[var(--accent)] uppercase">
                Palm Springs · Joshua Tree · Virtual
              </p>
              <h2 className="mt-5 text-5xl font-medium text-[var(--primary)] sm:text-6xl">
                Work with Shannon.
              </h2>
            </div>
            <div className="lg:pb-1">
              <p className="max-w-xl text-base leading-8 text-[var(--muted-foreground)]">
                Private sessions designed around where you are and what you
                need. In-person offerings throughout Palm Springs, Joshua Tree +
                the surrounding desert, with select sessions available
                virtually.
              </p>
              <div className="mt-5">
                <EditorialLink href="/book" label="Book with Shannon" />
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-3 lg:gap-6">
            {sessionPathways.map((pathway) => (
              <article key={pathway.title}>
                <Link
                  aria-label={pathway.cta}
                  className="group relative block aspect-[4/3] overflow-hidden bg-[#ded7cc]"
                  href={pathway.href}
                >
                  <Image
                    alt={pathway.image.alt}
                    className="object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
                    fill
                    sizes="(max-width: 1023px) 92vw, 31vw"
                    src={pathway.image.src}
                  />
                </Link>
                <p className="mt-6 text-xs font-semibold tracking-[0.16em] text-[var(--accent)] uppercase">
                  {pathway.location}
                </p>
                <h3 className="mt-3 text-3xl font-medium text-[var(--primary)]">
                  {pathway.title}
                </h3>
                <p className="mt-3 min-h-14 text-sm leading-7 text-[var(--muted-foreground)]">
                  {pathway.description}
                </p>
                <EditorialLink href={pathway.href} label={pathway.cta} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#dfddd4] px-6 py-24 sm:py-28 lg:py-36">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div className="relative min-h-[34rem] overflow-hidden bg-[#a99f91] sm:min-h-[42rem]">
            <Image
              alt={media.retreats.highDesertPath.alt}
              className="object-cover"
              fill
              sizes="(max-width: 1023px) 92vw, 62vw"
              src={media.retreats.highDesertPath.src}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#20251f]/62 via-[#20251f]/5 to-transparent" />
            <div className="absolute right-7 bottom-8 left-7 max-w-2xl text-white sm:right-10 sm:bottom-10 sm:left-10">
              <p className="text-xs font-semibold tracking-[0.25em] uppercase">
                Palm Springs · Joshua Tree · Beyond
              </p>
              <h2 className="mt-4 text-5xl leading-none font-medium sm:text-6xl">
                Bring HWL with you.
              </h2>
            </div>
          </div>

          <div className="bg-[#f7f3ec] p-7 sm:p-9 lg:mb-10 lg:-ml-24">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#d5cabd]">
              <Image
                alt={media.home.proofRetreat.alt}
                className="object-cover"
                fill
                sizes="(max-width: 1023px) 86vw, 32vw"
                src={media.home.proofRetreat.src}
              />
            </div>
            <p className="mt-7 text-base leading-8 text-[var(--muted-foreground)]">
              Thoughtfully curated beauty, movement and intuitive experiences
              for retreats, private groups and gatherings.
            </p>
            <p className="mt-5 text-xs font-semibold tracking-[0.18em] text-[var(--accent)] uppercase">
              Facials · Yoga · Sound · Tarot · Astrology
            </p>
            <div className="mt-6 flex flex-wrap gap-x-7">
              <EditorialLink href="/retreats" label="Explore retreats" />
              <EditorialLink href="/contact" label="Inquire" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:py-28 lg:py-36">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:gap-24">
          <div className="relative aspect-[3/4] overflow-hidden bg-[#b6a79a]">
            <Image
              alt={media.home.shannonPortrait.alt}
              className="object-cover object-center"
              fill
              sizes="(max-width: 1023px) 92vw, 39vw"
              src={media.home.shannonPortrait.src}
            />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-[var(--accent)] uppercase">
              Founder + practitioner
            </p>
            <h2 className="mt-5 text-5xl font-medium text-[var(--primary)] sm:text-6xl">
              Meet Shannon.
            </h2>
            <div className="mt-7 space-y-5 text-base leading-8 text-[var(--muted-foreground)]">
              <p>
                HWL was created by Shannon Mary Dixon — an esthetician, movement
                teacher, intuitive practitioner and lifelong athlete whose work
                lives at the intersection of body, beauty and being.
              </p>
              <p>
                Her approach brings professional technique together with
                movement, intuition and a belief that the practices we return to
                consistently are often the ones that change us most.
              </p>
            </div>
            <div className="mt-7">
              <EditorialLink href="/about" label="About Shannon" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[#eee8dd] px-6 py-24 text-center sm:py-28">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.28em] text-[var(--accent)] uppercase">
            Notes from HWL
          </p>
          <h2 className="mt-5 text-5xl font-medium text-[var(--primary)] sm:text-6xl">
            Stay close.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-[var(--muted-foreground)]">
            Seasonal notes on skin, movement, astrology + whatever we’re working
            with right now.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  )
}
