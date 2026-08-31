import Image from "next/image"
import Link from "next/link"

import { RetreatInquiryForm } from "@/components/retreats/retreat-inquiry-form"
import { JsonLd } from "@/components/seo/json-ld"
import { BreathingText } from "@/components/shared/breathing-text"
import { media } from "@/lib/media"
import { createPageMetadata, createServiceJsonLd } from "@/lib/seo"

export const metadata = createPageMetadata({
  title:
    "Wellness Retreat Facilitation in Palm Springs & Joshua Tree | HWL by SMD",
  description:
    "Custom facial ritual, yoga, sound, tarot, and seasonal wellness programming for retreats in Palm Springs, Joshua Tree, and the Coachella Valley.",
  path: "/retreats",
})

const practices = [
  {
    eyebrow: "Beauty",
    title: "Facial ritual & restoration",
    description:
      "Express and extended facial experiences, aromatherapy, and individual care paced around the wider retreat day.",
    details: [
      "Luxury facial experiences",
      "Reiki + aromatherapy",
      "Private sessions",
    ],
    image: media.retreats.facialRitual,
  },
  {
    eyebrow: "Yoga + Sound",
    title: "Movement, breath & deep rest",
    description:
      "Yoga, mobility, restorative practice, crystal bowls, meditation, and breathwork shaped for the energy of the group.",
    details: ["Group yoga + mobility", "Restorative practice", "Sound healing"],
    image: media.retreats.outdoorYoga,
  },
  {
    eyebrow: "Tarot + Ritual",
    title: "Reflection & seasonal practice",
    description:
      "Astrology, reflective card work, journaling, and intentional ceremony for private groups, transitions, and celebrations.",
    details: ["Astrology workshops", "Tarot reflection", "Seasonal ceremony"],
    image: media.retreats.soundRitual,
  },
] as const

const rhythm = [
  {
    time: "Morning",
    title: "Arrive in the body",
    description: "Movement, breath, and a spacious opening for the group.",
  },
  {
    time: "Midday",
    title: "Receive individual care",
    description: "Facial ritual or one-to-one sessions woven around open time.",
  },
  {
    time: "Evening",
    title: "Settle and reflect",
    description: "Sound, meditation, tarot, or ritual to close the day gently.",
  },
] as const

const process = [
  {
    number: "01",
    title: "Listen",
    description:
      "We begin with your intention, guests, setting, timing, and the feeling you want the gathering to hold.",
  },
  {
    number: "02",
    title: "Design",
    description:
      "Shannon shapes a practical wellness arc around the group, the venue, and the natural rhythm of the retreat.",
  },
  {
    number: "03",
    title: "Facilitate",
    description:
      "She arrives prepared and guides each agreed experience with care, presence, and room to breathe.",
  },
] as const

const formats = [
  {
    guests: "Up to 8 guests",
    title: "Small group",
    investment: "Starting at $1,555/day",
    note: "Half-day, full-day, and multi-day formats available.",
  },
  {
    guests: "9–15 guests",
    title: "Medium group",
    investment: "Starting at $2,222/day",
    note: "Shaped around the venue, schedule, and selected practices.",
  },
  {
    guests: "16–24 guests",
    title: "Large group",
    investment: "Starting at $3,333/day",
    note: "Includes a custom program and realistic capacity plan.",
  },
  {
    guests: "25–40+ guests",
    title: "Extra large group",
    investment: "Custom proposal",
    note: "Scoped around format, staffing, timing, and individual care.",
  },
] as const

const seasonalExperiences = [
  {
    title: "Seasonal Astrology Workshop",
    duration: "60–90 min",
    investment: "From $555",
  },
  {
    title: "Seasonal Astrology + Ritual",
    duration: "90–120 min",
    investment: "From $777",
  },
  {
    title: "Solstice & Equinox Ceremonies",
    duration: "120+ min",
    investment: "From $888",
  },
] as const

const responsibilities = [
  {
    title: "Shannon brings",
    items: [
      "Custom wellness program design and facilitation",
      "Professional products, supplies, skincare, and aromatherapy",
      "Sound instruments, ritual tools, and professional liability insurance",
    ],
  },
  {
    title: "The host holds",
    items: [
      "A private treatment room and treatment or massage table",
      "Linens, blankets, steamer, hot towel cabinet, and power",
      "Hot water, refrigeration, speaker connectivity, and an on-site contact",
    ],
  },
] as const

const logistics = [
  {
    question: "What group sizes and daily limits work best?",
    answer:
      "Movement, sound, ritual, and workshops can serve up to 40+ guests. Express facials can serve up to 15 guests, while up to five private facial or one-to-one wellness sessions can be scheduled per day. The written proposal confirms the realistic capacity and schedule.",
  },
  {
    question: "Can the programming be customized?",
    answer:
      "Yes. Every partnership is shaped around the host’s intention, guest profile, setting, and wider itinerary. Group experiences, private sessions, or a thoughtful blend of both can be included.",
  },
  {
    question: "What equipment and space are needed?",
    answer:
      "Shannon brings professional products, supplies, sound instruments, and ritual tools. The host preferably provides the treatment room, table, linens, blankets, steamer, hot towel cabinet, power, hot water, refrigeration, and speaker connectivity. Treatment equipment and linens can be arranged with advance notice.",
  },
  {
    question: "How do travel and timing work?",
    answer:
      "There is no travel fee within Palm Springs, Palm Desert, Joshua Tree, Yucca Valley, or surrounding desert communities. Additional travel and lodging fees apply outside the Coachella Valley. Ten to fourteen days’ notice is preferred, though shorter windows may be possible.",
  },
] as const

const eyebrowClass =
  "text-xs font-semibold tracking-[0.24em] text-[var(--accent)] uppercase"

const primaryLinkClass =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-[#f4eadc] px-7 py-3 text-sm font-semibold text-[#322d28] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#2f352d]"

const secondaryLinkClass =
  "inline-flex min-h-12 items-center justify-center rounded-full border border-white/45 bg-black/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#2f352d]"

export default function RetreatsPage() {
  return (
    <>
      <JsonLd
        data={createServiceJsonLd({
          name: "HWL Retreat Partnerships",
          description:
            "Custom facial ritual, yoga, sound, tarot, and seasonal wellness programming for private retreats and groups.",
          path: "/retreats",
          serviceType: "Custom retreat wellness programming",
          image: media.retreats.palmSpringsHero.src,
          areaServed: "Palm Springs, Joshua Tree, and the Coachella Valley",
        })}
        id="retreat-service-schema"
      />

      <section className="relative isolate min-h-[calc(100svh-4.5rem)] overflow-hidden bg-[#34372e] text-white">
        <Image
          alt={media.retreats.palmSpringsHero.alt}
          className="object-cover object-[58%_center] md:object-center"
          fill
          preload
          quality={88}
          sizes="100vw"
          src={media.retreats.palmSpringsHero.src}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(30,31,26,0.84)_0%,rgba(30,31,26,0.58)_42%,rgba(30,31,26,0.12)_76%),linear-gradient(0deg,rgba(24,25,21,0.65)_0%,transparent_48%)]" />
        <div className="relative mx-auto flex min-h-[calc(100svh-4.5rem)] max-w-7xl items-end px-6 py-12 sm:items-center sm:py-16 lg:py-20">
          <div className="max-w-[46rem] pb-6 sm:pb-0">
            <p className="text-[0.68rem] font-semibold tracking-[0.2em] text-[#f3dfc4] uppercase sm:text-xs sm:tracking-[0.26em]">
              Palm Springs · Joshua Tree · Coachella Valley
            </p>
            <h1 className="mt-5 max-w-[12ch] font-serif text-[clamp(2.75rem,7vw,5.8rem)] leading-[0.93] tracking-[-0.025em] text-white text-shadow-lg">
              Custom wellness experiences for desert retreats.
            </h1>
            <p className="mt-6 max-w-[37rem] text-base leading-[1.7] text-white/90 sm:text-lg md:text-xl">
              Shannon brings facial ritual, movement, sound, and reflective
              practice into the natural rhythm of your gathering.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className={primaryLinkClass} href="#inquire">
                Plan your retreat
              </Link>
              <Link className={secondaryLinkClass} href="#possibilities">
                See what&apos;s possible
              </Link>
            </div>
          </div>
        </div>
        <p className="absolute right-6 bottom-5 hidden text-[0.68rem] font-medium tracking-[0.2em] text-white/75 uppercase lg:block">
          Custom · Host-led · Desert-rooted
        </p>
      </section>

      <section
        aria-label="Retreat partnership highlights"
        className="border-b border-[#786f61]/15 bg-[#efe6da]"
      >
        <ul className="mx-auto grid max-w-7xl grid-cols-2 px-6 py-6 md:grid-cols-4 md:py-7">
          {[
            "Palm Springs-based",
            "Private groups",
            "Custom programming",
            "Written proposal",
          ].map((item) => (
            <li
              className="border-[#786f61]/20 px-2 py-2 text-center text-xs font-semibold tracking-[0.13em] text-[#5d554b] uppercase even:border-l md:border-l md:first:border-l-0"
              key={item}
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="overflow-hidden bg-[#f6f1e9] py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-24">
          <div className="max-w-xl">
            <p className={eyebrowClass}>Rooted here</p>
            <BreathingText as="h2" className="mt-5" size="heading">
              The desert is part of the experience.
            </BreathingText>
            <p className="mt-7 text-lg leading-[1.9] text-[var(--muted-foreground)]">
              Palm light, mountain shade, open sky, and the stillness of the
              high desert change the pace before the first practice begins.
              Shannon designs with the place—not over it—so the work belongs to
              the gathering and its surroundings.
            </p>
            <p className="mt-6 text-base leading-[1.85] text-[var(--muted-foreground)]">
              From a private Palm Springs courtyard to a quiet Joshua Tree
              house, the itinerary starts with where your guests already are.
            </p>
          </div>

          <div className="grid grid-cols-[1.03fr_0.97fr] gap-4 sm:gap-6">
            <figure className="relative mt-16 aspect-[4/5] overflow-hidden rounded-[2rem] sm:mt-24">
              <Image
                alt={media.retreats.fanPalmOasis.alt}
                className="object-cover"
                fill
                sizes="(max-width: 1023px) 45vw, 28vw"
                src={media.retreats.fanPalmOasis.src}
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-5 pt-16 pb-5 text-xs font-semibold tracking-[0.18em] text-white uppercase">
                Low desert · Palm oases
              </figcaption>
            </figure>
            <figure className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
              <Image
                alt={media.retreats.highDesertPath.alt}
                className="object-cover"
                fill
                sizes="(max-width: 1023px) 45vw, 28vw"
                src={media.retreats.highDesertPath.src}
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-5 pt-16 pb-5 text-xs font-semibold tracking-[0.18em] text-white uppercase">
                High desert · Open horizon
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="bg-[#e4e9df] py-24 md:py-32" id="possibilities">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className={eyebrowClass}>Three ways to shape the day</p>
            <BreathingText as="h2" className="mt-5" size="heading">
              Care for the whole group, without crowding the schedule.
            </BreathingText>
            <p className="mt-7 max-w-2xl text-lg leading-[1.85] text-[var(--muted-foreground)]">
              Choose one practice, build a full day, or layer private care into
              a multi-day retreat. Every program is edited to fit the people,
              place, and pace.
            </p>
          </div>

          <div className="mt-14 grid gap-7 lg:grid-cols-3">
            {practices.map((practice) => (
              <article
                className="group overflow-hidden rounded-[2rem] bg-[#fbf8f2] shadow-[0_24px_70px_rgba(53,52,46,0.09)]"
                key={practice.eyebrow}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    alt={practice.image.alt}
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    fill
                    sizes="(max-width: 1023px) 100vw, 33vw"
                    src={practice.image.src}
                  />
                </div>
                <div className="p-7 md:p-8">
                  <p className={eyebrowClass}>{practice.eyebrow}</p>
                  <h3 className="mt-4 font-serif text-3xl leading-[1.08] text-[var(--primary)]">
                    {practice.title}
                  </h3>
                  <p className="mt-5 text-base leading-[1.8] text-[var(--muted-foreground)]">
                    {practice.description}
                  </p>
                  <ul className="mt-7 border-t border-[var(--border)] pt-5">
                    {practice.details.map((detail) => (
                      <li
                        className="py-1.5 text-sm font-medium text-[var(--primary)]"
                        key={detail}
                      >
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#3d4037] py-24 text-white md:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[1.18fr_0.82fr] lg:items-center lg:gap-20">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-2xl lg:aspect-[3/2]">
            <Image
              alt={media.retreats.groupPractice.alt}
              className="object-cover object-center"
              fill
              sizes="(max-width: 1023px) 100vw, 58vw"
              src={media.retreats.groupPractice.src}
            />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-[#dfc49f] uppercase">
              One possible rhythm
            </p>
            <h2 className="mt-5 max-w-[12ch] font-serif text-4xl leading-[1.04] md:text-5xl">
              A day with room around it.
            </h2>
            <ol className="mt-9 border-t border-white/20">
              {rhythm.map((item) => (
                <li
                  className="grid gap-2 border-b border-white/20 py-5 sm:grid-cols-[5rem_1fr]"
                  key={item.time}
                >
                  <p className="text-xs font-semibold tracking-[0.16em] text-[#dfc49f] uppercase">
                    {item.time}
                  </p>
                  <div>
                    <h3 className="font-serif text-xl text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-[1.7] text-white/70">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm leading-[1.75] text-white/65">
              Every partnership is custom. This is an example, not a fixed
              package.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#f6f1e9] py-24 md:py-32" id="process">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
            <div className="max-w-xl">
              <p className={eyebrowClass}>The partnership</p>
              <BreathingText as="h2" className="mt-5" size="heading">
                Begin with the feeling. Build the details together.
              </BreathingText>
            </div>
            <ol className="border-t border-[var(--border)]">
              {process.map((step) => (
                <li
                  className="grid gap-4 border-b border-[var(--border)] py-7 sm:grid-cols-[3rem_0.65fr_1.35fr] sm:gap-6"
                  key={step.number}
                >
                  <span
                    aria-hidden="true"
                    className="font-serif text-xl text-[var(--accent)]"
                  >
                    {step.number}
                  </span>
                  <h3 className="font-serif text-2xl text-[var(--primary)]">
                    {step.title}
                  </h3>
                  <p className="text-base leading-[1.8] text-[var(--muted-foreground)]">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-[#eee3d4] py-24 md:py-32" id="investment">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
            <div className="max-w-xl">
              <p className={eyebrowClass}>Investment</p>
              <BreathingText as="h2" className="mt-5" size="heading">
                A clear starting point for a custom retreat.
              </BreathingText>
              <p className="mt-7 text-base leading-[1.85] text-[var(--muted-foreground)]">
                Final investment follows the guest count, schedule, venue,
                selected practices, and equipment needs. Shannon confirms the
                full scope in writing before the partnership begins.
              </p>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-[#817565]/20 bg-[#fbf8f2]/75">
              {formats.map((format) => (
                <article
                  className="grid gap-4 border-b border-[#817565]/20 p-6 last:border-b-0 sm:grid-cols-[0.7fr_0.75fr_1.15fr] sm:items-center md:p-7"
                  key={format.title}
                >
                  <div>
                    <p className="text-xs font-semibold tracking-[0.15em] text-[var(--accent)] uppercase">
                      {format.guests}
                    </p>
                    <h3 className="mt-2 font-serif text-2xl text-[var(--primary)]">
                      {format.title}
                    </h3>
                  </div>
                  <p className="font-serif text-2xl text-[var(--primary)] sm:text-xl">
                    {format.investment}
                  </p>
                  <p className="text-sm leading-[1.7] text-[var(--muted-foreground)]">
                    {format.note}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-16 border-t border-[#817565]/20 pt-10">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className={eyebrowClass}>Standalone group experiences</p>
                <h3 className="mt-4 font-serif text-3xl text-[var(--primary)]">
                  A focused way to gather.
                </h3>
              </div>
              <p className="max-w-md text-sm leading-[1.7] text-[var(--muted-foreground)]">
                In-person, private-group starting prices. Final scope is
                confirmed in Shannon&apos;s proposal.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {seasonalExperiences.map((experience) => (
                <article
                  className="rounded-[1.5rem] border border-[#817565]/20 bg-[#fbf8f2]/70 p-6"
                  key={experience.title}
                >
                  <h4 className="font-serif text-xl leading-tight text-[var(--primary)]">
                    {experience.title}
                  </h4>
                  <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4 text-xs font-semibold tracking-[0.1em] text-[var(--accent)] uppercase">
                    <span>{experience.duration}</span>
                    <span>{experience.investment}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#e4e9df] py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
          <div>
            <p className={eyebrowClass}>A clear container</p>
            <BreathingText as="h2" className="mt-5" size="heading">
              Held together, responsibly.
            </BreathingText>
            <figure className="mt-10 border-l border-[var(--accent)] pl-6">
              <blockquote className="font-serif text-xl leading-[1.65] text-[var(--primary)] italic">
                “Such an empowering and healing space that Shannon cultivates —
                she is so wonderful and knowledgeable.”
              </blockquote>
              <figcaption className="mt-5 text-xs font-semibold tracking-[0.16em] text-[var(--accent)] uppercase">
                Grace R. · Astrology + Yoga client
              </figcaption>
            </figure>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            {responsibilities.map((group) => (
              <article
                className="rounded-[2rem] border border-white/60 bg-white/45 p-7 md:p-8"
                key={group.title}
              >
                <h3 className="font-serif text-3xl text-[var(--primary)]">
                  {group.title}
                </h3>
                <ul className="mt-6 divide-y divide-[var(--border)]">
                  {group.items.map((item) => (
                    <li
                      className="py-4 text-sm leading-[1.75] text-[var(--muted-foreground)]"
                      key={item}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f6f1e9] py-24 md:py-32" id="details">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
          <div className="max-w-xl">
            <p className={eyebrowClass}>Practical details</p>
            <BreathingText as="h2" className="mt-5" size="heading">
              The useful things, when you need them.
            </BreathingText>
            <p className="mt-7 text-base leading-[1.85] text-[var(--muted-foreground)]">
              Capacity and logistics matter. They simply do not need to lead the
              conversation.
            </p>
          </div>

          <div className="border-t border-[var(--border)]">
            {logistics.map((item) => (
              <details
                className="group border-b border-[var(--border)]"
                key={item.question}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left font-serif text-xl text-[var(--primary)] transition-colors outline-none hover:text-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-4 md:text-2xl [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span
                    aria-hidden="true"
                    className="text-2xl font-light text-[var(--accent)] transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none"
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pr-10 pb-7 text-base leading-[1.85] text-[var(--muted-foreground)]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#3d4037] py-24 text-white md:py-32" id="inquire">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-[0.24em] text-[#dfc49f] uppercase">
              Your gathering
            </p>
            <h2 className="mt-5 font-serif text-4xl leading-[1.04] text-white md:text-5xl">
              Tell Shannon about the place, the people, and the feeling.
            </h2>
            <p className="mt-7 text-lg leading-[1.8] text-white/72">
              Share what you know now. Dates can be flexible, and the practice
              mix can be shaped together.
            </p>
            <p className="mt-7 text-sm leading-[1.75] text-white/[0.56]">
              Prefer email? Write directly through the{" "}
              <Link
                className="font-semibold text-[#f3dfc4] underline decoration-white/30 underline-offset-4 hover:text-white"
                href="/contact"
              >
                contact page
              </Link>
              .
            </p>
          </div>
          <RetreatInquiryForm />
        </div>
      </section>
    </>
  )
}
