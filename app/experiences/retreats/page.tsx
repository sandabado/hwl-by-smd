import Link from "next/link"

import { JsonLd } from "@/components/seo/json-ld"
import { BreathingSection } from "@/components/shared/breathing-section"
import { BreathingText } from "@/components/shared/breathing-text"
import { ParallaxWindow } from "@/components/shared/parallax-window"
import { PullQuote } from "@/components/shared/pull-quote"
import { media } from "@/lib/media"
import { createPageMetadata, createServiceJsonLd } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Retreat Partnerships | HWL by SMD",
  description:
    "Custom beauty, movement, and ritual programming for boutique retreats, luxury hospitality, private groups, and destination events.",
  path: "/retreats",
})

const process = [
  {
    number: "01",
    title: "Listen",
    description:
      "We begin with your intention, your guests, your setting, and the feeling you want the gathering to hold.",
  },
  {
    number: "02",
    title: "Design",
    description:
      "Shannon shapes a spacious wellness arc around the group, the place, and the natural rhythm of the retreat.",
  },
  {
    number: "03",
    title: "Facilitate",
    description:
      "She arrives prepared and guides each experience with care, presence, and room for the unexpected.",
  },
]

const offerings = [
  {
    title: "Beauty rituals",
    description:
      "Facials and skin rituals paced around the group schedule, guest needs, and the atmosphere of the gathering.",
  },
  {
    title: "Movement",
    description:
      "Private or group yoga, mobility, and restorative practice that helps guests return to their bodies.",
  },
  {
    title: "Sound & stillness",
    description:
      "Sound baths, breathwork, and meditation that create a natural pause inside the retreat day.",
  },
  {
    title: "Ritual",
    description:
      "Seasonal ceremony, intention setting, and intuitive practices created for the moment your group is moving through.",
  },
]

const formats = [
  {
    title: "Half-Day Partnership",
    duration: "3–4 hours",
    description:
      "One or two offerings arranged as a focused, unhurried wellness experience for your group.",
  },
  {
    title: "Full-Day Partnership",
    duration: "6–8 hours",
    description:
      "A complete day of complementary practices, paced with enough space for guests to receive and integrate.",
  },
  {
    title: "Multi-Day Partnership",
    duration: "2–7 days",
    description:
      "A continuous thread of care woven through arrival, daily practice, private sessions, and closing.",
  },
]

const responsibilities = [
  {
    title: "Shannon brings",
    items: [
      "Custom wellness program design",
      "Facilitation for every agreed experience",
      "Core practice, beauty, and ritual materials",
      "A guest-centered rhythm held with care",
    ],
  },
  {
    title: "The host holds",
    items: [
      "Venue, guest accommodation, and event logistics",
      "A clean, quiet space suited to the program",
      "Guest safety, scheduling, and an on-site contact",
      "Travel, lodging, and transport when required",
    ],
  },
]

const logistics = [
  {
    question: "What group sizes and daily limits work best?",
    answer: (
      <div className="space-y-3">
        <p>
          Capacity is tailored to the venue, timing, staffing, program format,
          and level of individual attention requested. Group practices may
          accommodate larger gatherings; facials and one-to-one sessions are
          intentionally scheduled in smaller numbers.
        </p>
        <p>
          Shannon confirms a realistic guest count and daily schedule in the
          written proposal after the scope and setup have been reviewed
          together.
        </p>
      </div>
    ),
  },
  {
    question: "Can the programming be customized?",
    answer: (
      <p>
        Yes. Every partnership is shaped around the host&apos;s intention, the
        guest profile, the setting, and the pace of the wider retreat. Group
        experiences, private sessions, or a thoughtful blend of both can be
        included.
      </p>
    ),
  },
  {
    question: "What equipment and space are needed?",
    answer: (
      <p>
        Shannon brings the core facilitation materials agreed in the proposal.
        The host provides a clean, quiet, accessible space plus power and water
        when the selected practices require them. Exact setup needs are
        confirmed during planning.
      </p>
    ),
  },
  {
    question: "How do travel, timing, and investment work?",
    answer: (
      <p>
        Travel can be included and is scoped with lodging, transport, timing,
        group size, and program complexity. Each partnership receives a custom
        proposal; beginning the conversation early leaves the most room to
        design well.
      </p>
    ),
  },
]

const eyebrowClass =
  "text-xs font-medium tracking-[0.28em] text-[var(--accent)] uppercase"

const primaryLinkClass =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--primary)] px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--background)]"

export default function RetreatsPage() {
  return (
    <>
      <JsonLd
        data={createServiceJsonLd({
          name: "HWL Retreat Partnerships",
          description:
            "Custom beauty, movement, sound, ritual, and restoration programming for boutique retreats, private groups, and destination events.",
          path: "/retreats",
          serviceType: "Custom retreat wellness programming",
          image: media.brand.destinationPortrait.src,
          areaServed: "United States and destination retreats",
        })}
        id="retreat-service-schema"
      />

      <BreathingSection
        background="gradient"
        contentClassName="mx-auto max-w-7xl px-6"
        padding="expansive"
        reveal={false}
        variant="sunroom"
      >
        <div className="grid min-h-[calc(100svh-10rem)] items-center gap-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(22rem,0.72fr)] lg:gap-20">
          <div className="max-w-3xl">
            <p className={eyebrowClass}>Retreats</p>
            <BreathingText as="h1" className="mt-6" size="hero">
              Curated wellness for unforgettable gatherings.
            </BreathingText>
            <BreathingText
              className="mt-8 max-w-2xl text-[var(--primary)]"
              size="subheading"
            >
              Custom programming for boutique retreats, luxury hospitality, and
              private groups.
            </BreathingText>
            <BreathingText
              className="mt-8 max-w-2xl text-[var(--muted-foreground)]"
              size="body"
            >
              A retreat is a container. What fills it determines whether people
              leave changed or just leave. Shannon designs and facilitates
              wellness programming — facials, movement, sound, ritual — tailored
              to your group, your space, and your intention. You bring the
              setting. She brings the craft.
            </BreathingText>
            <Link className={`${primaryLinkClass} mt-10`} href="/contact">
              Start a Conversation
            </Link>
          </div>

          <ParallaxWindow
            alt={media.brand.destinationPortrait.alt}
            aspectRatio="4 / 5"
            className="mx-auto w-full max-w-lg lg:max-w-none"
            imageClassName="object-[center_35%]"
            preload
            quality={78}
            sizes="(max-width: 1023px) 88vw, 38vw"
            speed={0.1}
            src={media.brand.destinationPortrait.src}
            texture="paper"
          />
        </div>
      </BreathingSection>

      <BreathingSection
        background="warm"
        contentClassName="mx-auto max-w-6xl px-6"
        padding="expansive"
        variant="sunroom"
      >
        <PullQuote
          className="my-0 md:my-0"
          quote="The best retreats don't fill time. They fill space."
        />
      </BreathingSection>

      <BreathingSection
        background="cool"
        contentClassName="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24"
        id="process"
        variant="sunroom"
      >
        <div className="max-w-xl">
          <p className={eyebrowClass}>The process</p>
          <BreathingText as="h2" className="mt-5" size="heading">
            Begin with the feeling.
          </BreathingText>
          <BreathingText
            className="mt-7 text-[var(--muted-foreground)]"
            size="body"
          >
            The itinerary follows after the intention is clear. From there, each
            part of the experience has a reason to be present.
          </BreathingText>
        </div>

        <ol className="border-t border-[var(--border)]">
          {process.map((step) => (
            <li
              className="grid gap-4 border-b border-[var(--border)] py-8 sm:grid-cols-[4rem_0.7fr_1.3fr] sm:gap-6 md:py-10"
              key={step.number}
            >
              <span
                aria-hidden="true"
                className="font-serif text-2xl text-[var(--accent)]"
              >
                {step.number}
              </span>
              <h3 className="font-serif text-2xl text-[var(--primary)] md:text-3xl">
                {step.title}
              </h3>
              <p className="text-base leading-[1.9] text-[var(--muted-foreground)]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </BreathingSection>

      <BreathingSection
        background="warm"
        contentClassName="mx-auto max-w-7xl px-6"
        id="offerings"
        variant="sunroom"
      >
        <div className="max-w-3xl">
          <p className={eyebrowClass}>What can fill the space</p>
          <BreathingText as="h2" className="mt-5" size="heading">
            Four ways to care for the whole group.
          </BreathingText>
        </div>

        <div className="mt-16 grid gap-x-16 gap-y-12 md:grid-cols-2">
          {offerings.map((offering, index) => (
            <article
              className="border-t border-[var(--border)] pt-8"
              key={offering.title}
            >
              <div className="flex items-baseline gap-5">
                <span
                  aria-hidden="true"
                  className="text-xs tracking-[0.2em] text-[var(--accent)]"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-serif text-3xl text-[var(--primary)]">
                  {offering.title}
                </h3>
              </div>
              <p className="mt-5 max-w-xl text-base leading-[1.9] text-[var(--muted-foreground)]">
                {offering.description}
              </p>
            </article>
          ))}
        </div>
      </BreathingSection>

      <BreathingSection
        background="gradient"
        contentClassName="mx-auto max-w-7xl px-6"
        id="formats"
        variant="sunroom"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className={eyebrowClass}>Partnership formats</p>
          <BreathingText as="h2" className="mt-5" size="heading">
            Choose the rhythm, then make it yours.
          </BreathingText>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {formats.map((format) => (
            <article
              className="flex h-full flex-col rounded-[2rem] border border-white/65 bg-white/55 p-8 shadow-[0_24px_70px_rgba(90,74,63,0.08)] backdrop-blur-sm md:p-10"
              key={format.title}
            >
              <p className="text-xs font-medium tracking-[0.2em] text-[var(--accent)] uppercase">
                {format.duration}
              </p>
              <h3 className="mt-5 font-serif text-3xl leading-tight text-[var(--primary)]">
                {format.title}
              </h3>
              <p className="mt-6 flex-1 text-base leading-[1.9] text-[var(--muted-foreground)]">
                {format.description}
              </p>
              <p className="mt-8 border-t border-[var(--border)] pt-5 text-sm font-medium text-[var(--primary)]">
                Custom proposal
              </p>
            </article>
          ))}
        </div>
      </BreathingSection>

      <BreathingSection
        background="warm"
        contentClassName="mx-auto max-w-7xl px-6"
        id="responsibilities"
        variant="sunroom"
      >
        <div className="grid gap-16 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
          <div className="max-w-xl">
            <p className={eyebrowClass}>A clear container</p>
            <BreathingText as="h2" className="mt-5" size="heading">
              Held together, responsibly.
            </BreathingText>
            <BreathingText
              className="mt-7 text-[var(--muted-foreground)]"
              size="body"
            >
              Care works best when everyone knows what they are holding. The
              final scope, deliverables, and responsibilities are named in a
              formal agreement before the partnership begins.
            </BreathingText>
          </div>

          <div className="grid gap-10 sm:grid-cols-2">
            {responsibilities.map((group) => (
              <div key={group.title}>
                <h3 className="font-serif text-3xl text-[var(--primary)]">
                  {group.title}
                </h3>
                <ul className="mt-7 space-y-5">
                  {group.items.map((item) => (
                    <li
                      className="border-b border-[var(--border)] pb-5 text-base leading-[1.8] text-[var(--muted-foreground)] last:border-b-0"
                      key={item}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </BreathingSection>

      <BreathingSection
        background="warm"
        contentClassName="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24"
        id="logistics"
        variant="sunroom"
      >
        <div className="max-w-xl">
          <p className={eyebrowClass}>Practical details</p>
          <BreathingText as="h2" className="mt-5" size="heading">
            The useful things, when you need them.
          </BreathingText>
          <BreathingText
            className="mt-7 text-[var(--muted-foreground)]"
            size="body"
          >
            Capacity and logistics matter. They just do not need to lead the
            conversation.
          </BreathingText>
        </div>

        <div className="border-t border-[var(--border)]">
          {logistics.map((item) => (
            <details
              className="group border-b border-[var(--border)]"
              key={item.question}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 text-left font-serif text-xl text-[var(--primary)] transition-colors outline-none hover:text-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-4 md:text-2xl [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  aria-hidden="true"
                  className="text-2xl font-light text-[var(--accent)] transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none"
                >
                  +
                </span>
              </summary>
              <div className="max-w-2xl pr-10 pb-8 text-base leading-[1.9] text-[var(--muted-foreground)]">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </BreathingSection>

      <BreathingSection
        background="gradient"
        contentClassName="mx-auto max-w-3xl px-6 text-center"
        padding="expansive"
        variant="sunroom"
      >
        <p className={eyebrowClass}>Your gathering</p>
        <BreathingText as="h2" className="mt-5" size="heading">
          Let&apos;s create the space people remember.
        </BreathingText>
        <BreathingText
          className="mx-auto mt-7 max-w-2xl text-[var(--muted-foreground)]"
          size="body"
        >
          Tell Shannon about the place, the people, and what you hope they carry
          home.
        </BreathingText>
        <Link className={`${primaryLinkClass} mt-10`} href="/contact">
          Start a Conversation
        </Link>
      </BreathingSection>
    </>
  )
}
