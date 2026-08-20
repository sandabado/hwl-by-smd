import Link from "next/link"
import {
  ArrowRight,
  Droplets,
  Flower2,
  MoonStar,
  Sparkles,
  Waves,
  Wind,
} from "lucide-react"

import { JsonLd } from "@/components/seo/json-ld"
import { AmbientLight } from "@/components/shared/ambient-light"
import { BreathingSection } from "@/components/shared/breathing-section"
import { BreathingText } from "@/components/shared/breathing-text"
import { ParallaxWindow } from "@/components/shared/parallax-window"
import { Reveal } from "@/components/shared/reveal"
import { TextureOverlay } from "@/components/shared/texture-overlay"
import { Button } from "@/components/ui/button"
import { media } from "@/lib/media"
import { absoluteUrl, createPageMetadata, SITE_URL } from "@/lib/seo"

export const metadata = createPageMetadata({
  title:
    "Shannon Mary Dixon — Aesthetician, Yoga Teacher & Tarot Reader in Palm Springs",
  description:
    "Meet Shannon Mary Dixon, a licensed aesthetician, 500-hour yoga instructor, Reiki practitioner, and aromatherapy specialist in Palm Springs.",
  path: "/about",
})

const journey = [
  {
    title: "Beauty",
    body: "Begin with what can be felt: skin, touch, and attention.",
  },
  {
    title: "Body",
    body: "Let breath, movement, and sound create room to soften.",
  },
  {
    title: "Being",
    body: "Make space for questions, transitions, and inner listening.",
  },
  {
    title: "Integration",
    body: "Bring each practice back to the whole person.",
  },
  {
    title: "HWL",
    body: "A home where Beauty, Body, and Being can be experienced together.",
  },
]

const modalities = [
  {
    title: "Skin Rituals",
    description: "Thoughtful care for skin, touch, and rest.",
    icon: Flower2,
  },
  {
    title: "Restorative Touch",
    description: "Gentle, rhythmic touch held with patience and care.",
    icon: Droplets,
  },
  {
    title: "Yoga",
    description: "Movement shaped by attention, breath, and embodiment.",
    icon: Wind,
  },
  {
    title: "Sound & Rest",
    description: "An invitation to slow down and listen inward.",
    icon: Waves,
  },
  {
    title: "Tarot",
    description: "A reflective practice for questions, clarity, and change.",
    icon: Sparkles,
  },
  {
    title: "Ritual Ceremony",
    description:
      "Astrology and ceremony for meaningful thresholds and transitions.",
    icon: MoonStar,
  },
]

const story = [
  "Shannon started on ice. Figure skating — the discipline, the early mornings, the falls you don't talk about. Elite athletics taught her embodiment, resilience, and presence before she had words for them. When the body said stop, she listened. Not right away. But eventually.",
  "Beauty came next. Licensed aesthetician. She learned the face like terrain — where tension collects, where lymph stalls, where a gentle hand can move what years of holding have locked. Aromatherapy study. Reiki training. The understanding that touch is a language the nervous system speaks before the mind translates.",
  "Then the body. 500 hours of yoga instruction. Breath as regulation, not performance. Sound as vibration the body receives before the brain interprets. Private sessions customized for restorative flow, vinyasa strength, mobility work, or athletic recovery. Always with modifications. Always free of judgment.",
  "Then the being. Twenty years studying astrology, symbolism, ritual, tarot, energetics. The practices women kept alive when institutions weren't listening. Not prediction. Reflection. Pattern-reading. Astrology for context, not fate. Tarot for clarity, not certainty.",
  "Reiki wove through all of it. Energy moves where attention goes. Healing isn't something you do to someone — it's something you create space for.",
  "Now it's one practice. HWL. Beauty, body, being. In the desert, where things are dry and clear and you can see further than you can hide.",
] as const

const credentials = [
  "Licensed Aesthetician",
  "500hr Yoga Instructor",
  "Reiki Practitioner",
  "Aromatherapy Specialist",
  "Wellness Facilitator",
  "Former Elite Figure Skater",
] as const

const shannonJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/about#shannon`,
  name: "Shannon Mary Dixon",
  url: absoluteUrl("/about"),
  image: absoluteUrl(media.brand.windowPortrait.src),
}

export default function AboutPage() {
  return (
    <>
      <JsonLd data={shannonJsonLd} id="shannon-person-schema" />

      <section className="kitchen-hero relative -mt-16 overflow-hidden px-6 pt-28 pb-20 md:-mt-20 md:pt-32 md:pb-28">
        <AmbientLight position="top-left" tone="warm" />
        <AmbientLight position="bottom-right" tone="clay" />
        <TextureOverlay intensity="soft" variant="paper" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2.5rem] shadow-[0_38px_110px_rgba(72,55,43,0.18)]">
            <ParallaxWindow
              alt={media.brand.windowPortrait.alt}
              aspectRatio="16 / 10"
              className="min-h-[36rem] rounded-[2.5rem] md:min-h-[43rem]"
              frame="none"
              imageClassName="object-cover object-[center_38%]"
              preload
              sizes="(max-width: 767px) 100vw, 90vw"
              speed={0.12}
              src={media.brand.windowPortrait.src}
              texture="paper"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,transparent_30%,rgba(31,25,22,0.74)_100%)]"
            />
            <Reveal className="absolute right-0 bottom-0 left-0 z-20 p-8 text-white md:p-14 lg:p-16">
              <p className="mb-5 text-xs tracking-[0.28em] text-white/75 uppercase">
                About
              </p>
              <BreathingText
                as="h1"
                className="max-w-3xl text-white md:text-7xl"
                size="hero"
              >
                Shannon&apos;s Story
              </BreathingText>
              <BreathingText
                className="mt-5 max-w-2xl text-white/88"
                size="subheading"
              >
                One long way home.
              </BreathingText>
            </Reveal>
          </div>
        </div>
      </section>

      <BreathingSection
        contentClassName="mx-auto max-w-3xl px-6 text-center"
        id="philosophy"
        padding="expansive"
        variant="kitchen"
      >
        <div className="space-y-7 text-left">
          {story.map((paragraph) => (
            <BreathingText
              className="text-[var(--muted-foreground)]"
              key={paragraph}
              size="body"
            >
              {paragraph}
            </BreathingText>
          ))}
        </div>

        <BreathingText
          as="blockquote"
          className="mx-auto mt-20 max-w-2xl border-l-2 border-[var(--room-clay)] pl-7 text-left font-serif text-3xl text-[var(--primary)] italic md:text-4xl"
          size="subheading"
        >
          “The most powerful experiences don&apos;t ask us to become someone
          new. They help us remember who we already are.”
        </BreathingText>
      </BreathingSection>

      <BreathingSection
        background="gradient"
        contentClassName="mx-auto w-full max-w-7xl px-6"
        id="journey"
        padding="expansive"
        variant="kitchen"
      >
        <div className="mx-auto max-w-3xl text-center">
          <BreathingText
            className="text-[var(--accent)] uppercase"
            size="caption"
          >
            The journey
          </BreathingText>
          <BreathingText
            as="h2"
            className="mt-5 text-[var(--primary)]"
            size="heading"
          >
            Five invitations. One continuous practice.
          </BreathingText>
        </div>

        <ol className="kitchen-timeline mt-16 grid gap-8 md:grid-cols-5 md:gap-4">
          {journey.map((item, index) => (
            <Reveal as="li" delay={index * 90} key={item.title}>
              <span className="relative z-10 grid size-10 place-items-center rounded-full border border-[var(--room-clay)] bg-[var(--background)] font-serif text-sm text-[var(--accent)] shadow-[0_8px_24px_rgba(72,55,43,0.08)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="mt-6 pl-14 md:pl-0">
                <h3 className="text-2xl text-[var(--primary)]">{item.title}</h3>
                <p className="mt-3 text-sm leading-[1.8] text-[var(--muted-foreground)]">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </BreathingSection>

      <BreathingSection
        contentClassName="mx-auto w-full max-w-7xl px-6"
        id="modalities"
        padding="expansive"
        variant="kitchen"
      >
        <div className="mx-auto max-w-3xl text-center">
          <BreathingText
            className="text-[var(--accent)] uppercase"
            size="caption"
          >
            Modalities
          </BreathingText>
          <BreathingText
            as="h2"
            className="mt-5 text-[var(--primary)]"
            size="heading"
          >
            Different languages for the same care.
          </BreathingText>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modalities.map((modality, index) => {
            const Icon = modality.icon

            return (
              <Reveal
                as="article"
                delay={(index % 3) * 90}
                key={modality.title}
              >
                <div className="h-full rounded-[1.75rem] border border-[var(--border)] bg-white/52 p-7 shadow-[0_18px_55px_rgba(72,55,43,0.06)] transition duration-400 hover:bg-white/72 hover:shadow-[0_24px_70px_rgba(72,55,43,0.1)] motion-safe:hover:-translate-y-1">
                  <Icon
                    aria-hidden="true"
                    className="size-5 text-[var(--accent)]"
                    strokeWidth={1.4}
                  />
                  <h3 className="mt-8 text-3xl text-[var(--primary)]">
                    {modality.title}
                  </h3>
                  <p className="mt-4 text-base leading-[1.8] text-[var(--muted-foreground)]">
                    {modality.description}
                  </p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </BreathingSection>

      <BreathingSection
        background="cool"
        contentClassName="mx-auto w-full max-w-6xl px-6"
        id="credentials"
        padding="expansive"
        variant="kitchen"
      >
        <div className="mx-auto max-w-3xl text-center">
          <BreathingText
            className="text-[var(--accent)] uppercase"
            size="caption"
          >
            Training &amp; credentials
          </BreathingText>
          <BreathingText
            as="h2"
            className="mt-5 text-[var(--primary)]"
            size="heading"
          >
            One practice, many ways in.
          </BreathingText>
          <p className="mt-6 text-base leading-[1.8] text-[var(--muted-foreground)]">
            Shannon&apos;s work brings beauty, movement, energy, and reflection
            into one attentive practice.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {credentials.map((credential) => (
            <article
              className="rounded-[1.5rem] border border-[var(--border)] bg-white/45 p-7"
              key={credential}
            >
              <p className="text-xs tracking-[0.18em] text-[var(--accent)] uppercase">
                Shannon Mary Dixon
              </p>
              <h3 className="mt-4 text-2xl text-[var(--primary)]">
                {credential}
              </h3>
            </article>
          ))}
        </div>
      </BreathingSection>

      <BreathingSection
        background="dark"
        contentClassName="mx-auto max-w-4xl px-6 text-center"
        id="invitation"
        padding="expansive"
        variant="kitchen"
      >
        <BreathingText
          as="h2"
          className="text-[var(--background)] md:text-6xl"
          size="heading"
        >
          Work with Shannon.
        </BreathingText>
        <Button
          asChild
          className="mt-10 h-12 rounded-full bg-[var(--background)] px-8 text-[var(--primary)] hover:bg-[var(--room-clay)] hover:text-[var(--room-charcoal)]"
        >
          <Link href="/book">
            Work with Shannon
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
        <Button
          asChild
          className="mt-4 h-12 rounded-full border-white/35 bg-transparent px-8 text-[var(--background)] hover:bg-white/10 hover:text-white md:mt-10 md:ml-3"
          variant="outline"
        >
          <Link href="/journal">Read the Journal</Link>
        </Button>
      </BreathingSection>
    </>
  )
}
