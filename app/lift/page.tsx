import Image from "next/image"
import Link from "next/link"
import { Check, LockKeyhole, Play } from "lucide-react"

import { LiftPreviewFilm } from "@/components/home/lift-preview-film"
import { CheckoutButton } from "@/components/payment/checkout-button"
import { BreathingSection } from "@/components/shared/breathing-section"
import { BreathingText } from "@/components/shared/breathing-text"
import { FaqAccordion } from "@/components/shared/internal-page"
import { LiftSequenceProgress } from "@/components/shared/lift-sequence-progress"
import { Reveal } from "@/components/shared/reveal"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getAuthenticatedUser, getMemberAccess } from "@/lib/access"
import { media } from "@/lib/media"
import { createPageMetadata } from "@/lib/seo"
import { isProductCheckoutReady } from "@/lib/stripe"

export const metadata = createPageMetadata({
  title: "LIFT — Daily Facial Massage Guide | HWL by SMD",
  description:
    "Seven movements. Five minutes a day. A daily facial massage ritual by Shannon Mary Dixon.",
  path: "/beauty/lift",
})

const movements = [
  {
    name: "Prep the Skin",
    instruction:
      "Apply your serum, moisturizer, facial oil, lightweight oil, or another product that provides enough slip. Using broad sweeping strokes, distribute your product over the jaw, cheeks, forehead, and neck. Take a slow breath and let your touch become intentional before moving into the massage.",
    supports:
      "Smooth glide, even product application, and a mindful starting point.",
  },
  {
    name: "Jawline Lift",
    instruction:
      "Starting at the chin, glide your knuckles or fingers along the jawline using gentle, upward sweeping motions toward the ear. Make 3 to 6 passes on each side, applying gentle yet firm pressure. Finish with small circular motions where the upper and lower jaw meet to release tension often held in the jaw.",
    supports: "Jawline definition, tension release, and lymphatic flow.",
  },
  {
    name: "Mid-Face Sculpt",
    instruction:
      "Starting beside the nose, gently scoop the cheek upward to find the natural contour beneath the cheekbone and at the orbital bone (under eye). Glide along the cheekbone toward the temple while your opposite hand traces behind to support the tissue. Repeat 3–6 passes on each side. Think of lifting up and out rather than pressing into the skin. If the scissor technique feels more natural, feel free to use that variation (see video).",
    supports:
      "Mid-face volume, cheek definition, circulation, and a naturally lifted appearance.",
  },
  {
    name: "Brow Lift",
    instruction:
      "Diagonal crosshatch — starting at the inner brow, place your fingers just beneath the brow bone and glide diagonally upward toward the opposite hairline. Repeat 3–6 passes. Full brow lift: work in sections along the brow — inner, middle, and outer — using upward strokes toward the hairline. Repeat 3–6 passes in each area.",
    supports:
      "A naturally lifted appearance through the eyes, improved circulation, and softer tension through the brow and forehead.",
  },
  {
    name: "Forehead Release",
    instruction:
      'Using alternating hands, glide upward across the forehead in sections — working from the brows toward the hairline. Next, create a gentle crosshatch pattern across the forehead. Pause over the "11s" and any areas of tension or expression lines, using small circular motions with gentle, sustained pressure before continuing. Repeat 3–6 passes in each area.',
    supports:
      "Relaxation through the forehead, healthy circulation, and the appearance of smoother skin.",
  },
  {
    name: "Lymphatic Sweep",
    instruction:
      "Starting at the center of the forehead near the hairline, glide your fingers along the outer edges of the face toward the ears. Finish by gently sweeping behind the ears. Repeat 3 times.",
    supports:
      "Lymphatic drainage, reduced puffiness, and healthy fluid movement.",
  },
  {
    name: "Neck Release",
    instruction:
      'Place your hands at the center of the neck with your fingers extended and thumbs forming an "L." Glide one hand upward while the other glides downward, creating a continuous, flowing movement. Repeat 3 times.',
    supports:
      "Healthy lymphatic flow, improved circulation, and renewed vitality through the neck and jawline.",
  },
] as const

const previewMovements = movements.slice(0, 2)
const gatedMovements = movements.slice(2)
const movementNames = movements.map(({ name }) => name)

const benefits = [
  "Lift & Sculpt — Support and define the natural contours of the face",
  "Reduce Puffiness — Encourage lymphatic drainage",
  "Release Tension — Especially in the jaw, brow, forehead, and neck",
  "Boost Circulation — Promote a healthy, natural glow",
  "Support Skin Renewal — Encourage healthy cell turnover and support collagen and elastin over time",
  "Enhance Product Absorption — Help your skincare work more effectively",
] as const

const preparation = [
  {
    title: "Clean Hands, Cleanse Skin",
    detail: "Always begin with freshly cleansed skin and clean hands",
  },
  {
    title: "Work It Into Your Routine",
    detail:
      "This massage can be its own ritual with a facial oil or lightweight oil, or simply become part of the skincare routine you already have. As you apply your serum, moisturizer, or another product that provides enough slip, use these techniques to turn a few everyday minutes into something more intentional.",
  },
  {
    title: "Gentle Pressure",
    detail:
      "Think lift, not force. Use light to medium pressure and avoid pulling or dragging the skin",
  },
  {
    title: "Don't Skip the Neck",
    detail:
      "The neck is an extension of the face and plays an important role in healthy circulation and lymphatic drainage",
  },
  {
    title: "Consistency is Key",
    detail:
      "Five minutes a day goes a long way! You don't need 20 minutes a day to see benefits. Performing this massage consistently can make a meaningful difference over time",
  },
] as const

const glowFinish = [
  {
    name: "Upper Lip Lift",
    instruction:
      "Anchor your thumbs beneath the chin and use the side of your index finger or knuckle to glide from the upper lip, beneath the cheekbone, and toward the temple. You may gently lift along the lip border as you move upward.",
    supports:
      "A more defined upper lip and additional lift through the mid-face.",
  },
  {
    name: "Tapotement",
    instruction:
      "Using light, rhythmic tapping, move beneath the chin, across the cheeks, around the eyes, and over the forehead. Think of this as waking the skin up.",
    supports: "Healthy circulation and a refreshed, energized glow.",
  },
  {
    name: "Ear Massage",
    instruction:
      "Finish by gently massaging the ears and earlobes using slow circular motions. Allow this to be the final exhale of your ritual.",
    supports:
      "Relaxation and activation of the parasympathetic nervous system.",
  },
] as const

const faqs = [
  {
    question: "How long does LIFT take?",
    answer:
      "The full sequence is designed to take about five minutes once you learn the rhythm.",
  },
  {
    question: "What product should I use?",
    answer:
      "Use a facial oil, balm, or moisturizer with enough slip so your hands glide without pulling the skin.",
  },
  {
    question: "What should I expect?",
    answer:
      "LIFT offers a brief ritual of touch and attention. Every person and every day can feel different, so it does not promise a particular physical result.",
  },
  {
    question: "Can I do this with sensitive skin?",
    answer:
      "Sensitive or reactive skin needs individual care. Skip irritated, inflamed, injured, or recently treated areas and ask an appropriate licensed professional if you are unsure whether facial massage is suitable for you.",
  },
  {
    question: "Morning or night?",
    answer:
      "Either can work. Choose the time when you can move slowly and pay attention to comfort.",
  },
  {
    question: "Do I need tools?",
    answer:
      "No. Your hands are enough. Tools can be added later, but they are not required.",
  },
  {
    question: "Is LIFT medical or dermatological care?",
    answer:
      "No. LIFT is general wellness education and is not a substitute for medical or dermatological care. Skip irritated, inflamed, injured, or recently treated areas and ask an appropriate licensed professional when you are unsure whether facial massage is suitable for you.",
  },
]

const welcomeParagraphs = [
  "I'm so glad you're taking this time to love on yourself!",
  "One of the questions I hear most often in the treatment room is, 'What can I do at home to lift, sculpt, and support my skin as I age?'",
  "My answer is almost always the same: facial massage.",
  "It's a technique I use with every client, and a daily ritual I've developed for myself. With consistency, it's one of the simplest ways to support healthy, radiant skin while creating a moment to slow down and reconnect with yourself.",
  "Facial massage helps stimulate circulation, encourage lymphatic drainage, release tension, improve product absorption, and create a more lifted, sculpted appearance over time.",
  "This isn't about adding another 20-minute ritual to your day. It's about making the few minutes you're already spending on your skincare more intentional. Even five minutes a day can make a meaningful difference.",
  "I hope these techniques become something you look forward to—a simple ritual that supports not only your skin, but your relationship with yourself.",
  "Let's begin!",
] as const

export default async function LiftPage() {
  const user = await getAuthenticatedUser()
  const access = user ? await getMemberAccess(user.id) : null
  const pdfSalesReady = isProductCheckoutReady("pdf_download")
  const guideSalesReady = isProductCheckoutReady("lift_guide")
  const membershipSalesReady = isProductCheckoutReady("membership")

  return (
    <>
      <BreathingSection
        background="gradient"
        className="flex min-h-[84svh] items-center"
        contentClassName="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1.02fr_0.98fr]"
        padding="expansive"
        reveal={false}
        variant="dressing-room"
      >
        <Reveal>
          <p className="text-xs font-medium tracking-[0.32em] text-[var(--accent)] uppercase">
            LIFT
          </p>
          <BreathingText
            as="h1"
            className="mt-6 max-w-3xl font-medium text-[var(--primary)]"
            size="hero"
          >
            A Daily Facial Ritual
          </BreathingText>
          <BreathingText
            as="p"
            className="mt-7 max-w-xl text-[var(--primary)]"
            size="subheading"
          >
            Seven movements. Five minutes. Your own two hands.
          </BreathingText>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button
              asChild
              className="min-h-12 rounded-full bg-[var(--primary)] px-7 text-white hover:bg-[var(--accent)]"
            >
              <Link href="/store">Get LIFT</Link>
            </Button>
            <Button
              asChild
              className="min-h-12 rounded-full border-[var(--border)] bg-white/30 px-7 text-[var(--primary)] hover:bg-white/70"
              variant="outline"
            >
              <Link href="#sequence">
                <Play className="size-4" aria-hidden="true" />
                Preview the First Two Movements
              </Link>
            </Button>
          </div>
        </Reveal>

        <Reveal className="relative" delay={140}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/70 bg-[#d6c3ae] shadow-[0_28px_80px_rgba(65,45,31,0.16)]">
            <Image
              alt={media.editorial.liftVideoPreview.alt}
              className="object-cover object-center"
              fill
              preload
              sizes="(max-width: 1023px) 92vw, 42vw"
              src={media.editorial.liftVideoPreview.src}
            />
            <LiftPreviewFilm
              poster={media.editorial.liftVideoPreview.src}
              source={media.motion.liftPreview.src}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a241d]/55 via-transparent to-transparent" />
          </div>
          <a
            className="absolute inset-x-5 bottom-5 z-10 flex min-h-14 items-center justify-between rounded-full border border-white/60 bg-[var(--background)]/88 px-6 text-sm font-medium text-[var(--primary)] shadow-lg backdrop-blur-md transition outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            href="#sequence"
          >
            LIFT in motion · Begin the ritual
            <span className="grid size-9 place-items-center rounded-full bg-[var(--primary)] text-white">
              <Play className="ml-0.5 size-4" aria-hidden="true" />
            </span>
          </a>
        </Reveal>
      </BreathingSection>

      <BreathingSection
        background="warm"
        contentClassName="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.68fr_1.32fr]"
        id="welcome"
        variant="dressing-room"
      >
        <div>
          <p className="text-xs font-medium tracking-[0.28em] text-[var(--accent)] uppercase">
            A note from Shannon
          </p>
          <BreathingText
            as="h2"
            className="mt-5 font-medium text-[var(--primary)]"
            size="heading"
          >
            Welcome.
          </BreathingText>
        </div>
        <div className="space-y-6">
          {welcomeParagraphs.map((paragraph) => (
            <BreathingText
              className="text-[var(--muted-foreground)]"
              key={paragraph}
              size="body"
            >
              {paragraph}
            </BreathingText>
          ))}
          <p className="mt-8 font-serif text-xl text-[var(--primary)]">
            — Shannon Mary Dixon, Founder, HWL by SMD
          </p>
        </div>
      </BreathingSection>

      <BreathingSection
        background="cool"
        contentClassName="mx-auto max-w-7xl px-6"
        id="benefits"
        variant="dressing-room"
      >
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <p className="text-xs font-medium tracking-[0.28em] text-[var(--accent)] uppercase">
              Why Facial Massage
            </p>
            <BreathingText
              as="h2"
              className="mt-5 font-medium text-[var(--primary)]"
              size="heading"
            >
              What the ritual supports.
            </BreathingText>
            <ol className="mt-10 border-t border-[var(--border)]">
              {benefits.map((benefit, index) => (
                <li
                  className="grid grid-cols-[3rem_1fr] gap-4 border-b border-[var(--border)] py-5"
                  key={benefit}
                >
                  <span className="font-serif text-lg text-[var(--accent)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-base leading-[1.8] text-[var(--primary)]">
                    {benefit}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <aside className="relative overflow-hidden rounded-[2rem] bg-[var(--primary)] p-8 text-[var(--background)] md:p-12 lg:mt-24">
            <p className="text-xs font-medium tracking-[0.28em] text-[var(--accent-on-dark)] uppercase">
              The practice
            </p>
            <BreathingText
              as="h3"
              className="mt-6 font-medium text-[var(--background)]"
              size="subheading"
            >
              Beyond Skin Deep
            </BreathingText>
            <p className="mt-7 text-lg leading-[1.9] text-white/78">
              An opportunity to slow down and be intentional. Create a daily
              ritual that transforms your skincare routine into something you
              genuinely look forward to. Reconnect with yourself. Consistency
              creates results.
            </p>
          </aside>
        </div>
      </BreathingSection>

      <BreathingSection
        background="warm"
        contentClassName="mx-auto max-w-7xl px-6"
        id="prepare"
        variant="dressing-room"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium tracking-[0.28em] text-[var(--accent)] uppercase">
            A thoughtful start
          </p>
          <BreathingText
            as="h2"
            className="mt-5 font-medium text-[var(--primary)]"
            size="heading"
          >
            Before You Begin
          </BreathingText>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {preparation.map(({ detail, title }, index) => (
            <Reveal as="article" delay={index * 70} key={title}>
              <Card className="h-full rounded-[1.5rem] border-[var(--border)] bg-white/52 p-6 shadow-none">
                <span className="font-serif text-xl text-[var(--accent)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-8 text-xl font-medium text-[var(--primary)]">
                  {title}
                </h3>
                <p className="mt-4 text-sm leading-[1.8] text-[var(--muted-foreground)]">
                  {detail}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </BreathingSection>

      <BreathingSection
        background="gradient"
        contentClassName="mx-auto max-w-7xl px-6"
        id="sequence"
        variant="dressing-room"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium tracking-[0.28em] text-[var(--accent)] uppercase">
            The ritual
          </p>
          <BreathingText
            as="h2"
            className="mt-5 font-medium text-[var(--primary)]"
            size="heading"
          >
            Seven movements. One return.
          </BreathingText>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-[1.8] text-[var(--muted-foreground)]">
            Steps one and two are public previews. The complete demonstrations
            for steps three through seven are available with LIFT access.
          </p>
        </div>

        <LiftSequenceProgress steps={movementNames} />

        <div className="mx-auto mt-14 max-w-6xl space-y-12">
          {previewMovements.map(({ instruction, name, supports }, index) => (
            <article
              className="grid scroll-mt-32 gap-7 lg:grid-cols-2 lg:items-stretch"
              data-lift-step
              id={`lift-step-${index + 1}`}
              key={name}
            >
              <div
                className={
                  index % 2 === 1
                    ? "relative grid min-h-72 place-items-center overflow-hidden rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.92),transparent_32%),linear-gradient(135deg,#dfcbb7,#f4ece2_56%,#c4a882)] lg:order-2"
                    : "relative grid min-h-72 place-items-center overflow-hidden rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.92),transparent_32%),linear-gradient(135deg,#dfcbb7,#f4ece2_56%,#c4a882)]"
                }
              >
                <span
                  aria-hidden="true"
                  className="absolute -right-5 -bottom-12 font-serif text-[12rem] leading-none text-white/38"
                >
                  {index + 1}
                </span>
                <div className="relative z-10 text-center">
                  <span className="mx-auto grid size-16 place-items-center rounded-full border border-white/70 bg-white/60 text-[var(--primary)] shadow-lg backdrop-blur-sm">
                    <Play className="ml-1 size-5" aria-hidden="true" />
                  </span>
                  <p className="mt-5 text-xs font-medium tracking-[0.2em] text-[var(--primary)] uppercase">
                    Preview film coming soon
                  </p>
                </div>
              </div>
              <div
                className={
                  index % 2 === 1
                    ? "flex flex-col justify-center rounded-[2rem] border border-[var(--border)] bg-white/60 p-8 md:p-12 lg:order-1"
                    : "flex flex-col justify-center rounded-[2rem] border border-[var(--border)] bg-white/60 p-8 md:p-12"
                }
              >
                <p className="text-xs font-medium tracking-[0.22em] text-[var(--accent)] uppercase">
                  Movement {index + 1}
                </p>
                <BreathingText
                  as="h3"
                  className="mt-5 font-medium text-[var(--primary)]"
                  size="heading"
                >
                  {name}
                </BreathingText>
                <BreathingText
                  className="mt-7 text-[var(--muted-foreground)]"
                  size="body"
                >
                  {instruction}
                </BreathingText>
                <p className="mt-6 border-t border-[var(--border)] pt-5 text-sm leading-[1.75] text-[var(--primary)] italic">
                  <span className="font-medium not-italic">Supports:</span>{" "}
                  {supports}
                </p>
              </div>
            </article>
          ))}

          {access?.canAccessLift ? (
            <div className="space-y-7">
              <div className="rounded-[1.5rem] border border-[var(--accent)]/35 bg-[#f5ecde] px-6 py-5 text-center text-sm leading-relaxed text-[var(--primary)]">
                Your complete LIFT ritual is unlocked. The guided films live in
                your private library.
              </div>
              {gatedMovements.map(({ instruction, name, supports }, index) => {
                const step = index + 3

                return (
                  <article
                    className="grid scroll-mt-32 overflow-hidden rounded-[2rem] border border-[var(--border)] bg-white/60 lg:grid-cols-[0.32fr_0.68fr]"
                    data-lift-step
                    id={`lift-step-${step}`}
                    key={name}
                  >
                    <div className="relative grid min-h-52 place-items-center overflow-hidden bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.92),transparent_32%),linear-gradient(135deg,#dfcbb7,#f4ece2_56%,#c4a882)] p-8">
                      <span
                        aria-hidden="true"
                        className="absolute -right-4 -bottom-12 font-serif text-[11rem] leading-none text-white/42"
                      >
                        {step}
                      </span>
                      <p className="relative z-10 text-xs font-medium tracking-[0.22em] text-[var(--primary)] uppercase">
                        Movement {step}
                      </p>
                    </div>
                    <div className="p-8 md:p-11">
                      <BreathingText
                        as="h3"
                        className="font-medium text-[var(--primary)]"
                        size="subheading"
                      >
                        {name}
                      </BreathingText>
                      <BreathingText
                        className="mt-6 text-[var(--muted-foreground)]"
                        size="body"
                      >
                        {instruction}
                      </BreathingText>
                      <p className="mt-6 border-t border-[var(--border)] pt-5 text-sm leading-[1.75] text-[var(--primary)] italic">
                        <span className="font-medium not-italic">
                          Supports:
                        </span>{" "}
                        {supports}
                      </p>
                    </div>
                  </article>
                )
              })}
              <div className="text-center">
                <Button asChild className="min-h-12 rounded-full px-7">
                  <Link href="/course/lift-daily-facial-ritual">
                    Watch the Complete Ritual
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                {gatedMovements.map(({ name }, index) => {
                  const step = index + 3

                  return (
                    <article
                      className="scroll-mt-32"
                      data-lift-step
                      id={`lift-step-${step}`}
                      key={name}
                    >
                      <Card className="relative h-full min-h-72 overflow-hidden rounded-[1.75rem] border-[var(--border)] bg-white/52 p-6 shadow-none">
                        <span
                          aria-hidden="true"
                          className="absolute -right-2 -bottom-7 font-serif text-8xl text-[var(--muted)]/70"
                        >
                          {step}
                        </span>
                        <LockKeyhole
                          className="size-5 text-[var(--accent)]"
                          aria-hidden="true"
                        />
                        <p className="mt-10 text-xs font-medium tracking-[0.2em] text-[var(--accent)] uppercase">
                          Movement {step}
                        </p>
                        <h3 className="mt-4 text-2xl font-medium text-[var(--primary)]">
                          {name}
                        </h3>
                        <p className="relative mt-5 text-sm leading-[1.8] text-[var(--muted-foreground)]">
                          The full instruction and guided demonstration unlock
                          with Complete LIFT or The Den.
                        </p>
                      </Card>
                    </article>
                  )
                })}
              </div>
              <div className="mt-8 text-center">
                <Button
                  asChild
                  className="min-h-12 rounded-full px-7"
                  variant="outline"
                >
                  <Link href="/store">Unlock the Complete Ritual</Link>
                </Button>
              </div>
            </div>
          )}

          <section className="rounded-[2rem] border border-[var(--border)] bg-white/55 p-7 md:p-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs tracking-[0.24em] text-[var(--accent)] uppercase">
                Glow Finish · Optional
              </p>
              <p className="mt-4 font-serif text-2xl leading-relaxed text-[var(--primary)]">
                A few techniques to elevate your ritual.
              </p>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {glowFinish.map(({ instruction, name, supports }) => (
                <article
                  className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--background)]/72 p-6"
                  key={name}
                >
                  <h3 className="text-xl font-medium text-[var(--primary)]">
                    {name}
                  </h3>
                  <p className="mt-4 text-sm leading-[1.8] text-[var(--muted-foreground)]">
                    {instruction}
                  </p>
                  <p className="mt-5 text-sm leading-[1.75] text-[var(--primary)] italic">
                    <span className="font-medium not-italic">Supports:</span>{" "}
                    {supports}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <blockquote className="mx-auto max-w-4xl rounded-[2rem] bg-[var(--primary)] px-8 py-10 text-center text-[var(--background)] md:px-14 md:py-14">
            <p className="font-serif text-2xl leading-[1.65] md:text-3xl">
              &ldquo;Beautiful skin is built through consistency, not
              perfection. Return to this ritual often. Five intentional minutes
              each day can become one of the most meaningful investments you
              make in your skin — and in yourself. Thank you for letting me be
              part of your ritual. — SHANNON&rdquo;
            </p>
          </blockquote>
        </div>
      </BreathingSection>

      <BreathingSection
        background="warm"
        contentClassName="mx-auto max-w-7xl px-6"
        id="download"
        variant="dressing-room"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium tracking-[0.28em] text-[var(--accent)] uppercase">
            Choose your access
          </p>
          <BreathingText
            as="h2"
            className="mt-5 font-medium text-[var(--primary)]"
            size="heading"
          >
            Keep the ritual close.
          </BreathingText>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-3 md:items-stretch">
          <Card className="flex h-full flex-col rounded-[2rem] border-[var(--border)] bg-white/60 p-7 text-center shadow-none">
            <p className="text-xs font-medium tracking-[0.2em] text-[var(--accent)] uppercase">
              Printable ritual
            </p>
            <h3 className="mt-5 text-3xl font-medium text-[var(--primary)]">
              LIFT PDF Guide
            </h3>
            <p className="mt-3 font-serif text-4xl text-[var(--accent)]">
              $3.33
            </p>
            <p className="mt-5 flex-1 text-sm leading-[1.8] text-[var(--muted-foreground)]">
              Complete guide with instructions, benefits, preparation notes
            </p>
            <div className="mt-7">
              {access?.canDownloadLift ? (
                <Button
                  asChild
                  className="h-11 w-full rounded-full"
                  variant="outline"
                >
                  <Link href="/api/download/lift" prefetch={false}>
                    Access Now
                  </Link>
                </Button>
              ) : pdfSalesReady ? (
                <CheckoutButton
                  label="Choose the PDF"
                  productId="pdf_download"
                  variant="outline"
                />
              ) : (
                <Button
                  className="h-11 w-full rounded-full"
                  disabled
                  variant="outline"
                >
                  Opening soon
                </Button>
              )}
            </div>
          </Card>

          <Card className="relative flex h-full flex-col rounded-[2rem] border-[var(--accent)] bg-[var(--primary)] p-7 text-center text-[var(--background)] shadow-[0_28px_75px_rgba(90,74,63,0.2)] md:-translate-y-4">
            <span className="mx-auto inline-flex rounded-full bg-[var(--accent)] px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-white uppercase">
              Recommended
            </span>
            <p className="mt-5 text-xs font-medium tracking-[0.2em] text-[var(--accent-on-dark)] uppercase">
              Watch and learn
            </p>
            <h3 className="mt-5 text-3xl font-medium">
              Complete LIFT — Video + PDF
            </h3>
            <p className="mt-3 font-serif text-4xl text-[var(--accent-on-dark)]">
              $11.11
            </p>
            <p className="mt-5 flex-1 text-sm leading-[1.8] text-white/78">
              Full video walkthrough of all seven movements plus downloadable
              guide
            </p>
            <div className="mt-7">
              {access?.canAccessLift ? (
                <Button
                  asChild
                  className="h-11 w-full rounded-full bg-[var(--background)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-white"
                >
                  <Link href="/course/lift-daily-facial-ritual">
                    Access Now
                  </Link>
                </Button>
              ) : guideSalesReady ? (
                <CheckoutButton
                  className="bg-[var(--background)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-white"
                  label="Get Complete LIFT — $11.11"
                  productId="lift_guide"
                />
              ) : (
                <Button
                  className="h-11 w-full rounded-full bg-[var(--background)] text-[var(--primary)]"
                  disabled
                >
                  Opening soon
                </Button>
              )}
            </div>
          </Card>

          <Card className="flex h-full flex-col rounded-[2rem] border-[var(--border)] bg-white/60 p-7 text-center shadow-none">
            <p className="text-xs font-medium tracking-[0.2em] text-[var(--accent)] uppercase">
              The full library
            </p>
            <h3 className="mt-5 text-3xl font-medium text-[var(--primary)]">
              The Den Membership
            </h3>
            <p className="mt-3 font-serif text-4xl text-[var(--accent)]">
              $11.11
              <span className="text-sm">/month</span>
            </p>
            <p className="mt-5 flex-1 text-sm leading-[1.8] text-[var(--muted-foreground)]">
              Full library access, Connection Hub, guided journeys, member
              pricing
            </p>
            <div className="mt-7">
              {access?.isMember ? (
                <Button
                  asChild
                  className="h-11 w-full rounded-full"
                  variant="outline"
                >
                  <Link href="/the-den">Access Now</Link>
                </Button>
              ) : membershipSalesReady ? (
                <CheckoutButton
                  label="Join The Den"
                  productId="membership"
                  variant="outline"
                />
              ) : (
                <Button
                  className="h-11 w-full rounded-full"
                  disabled
                  variant="outline"
                >
                  Opening soon
                </Button>
              )}
            </div>
          </Card>
        </div>

        <p className="mx-auto mt-9 flex max-w-2xl items-center justify-center gap-2 text-center text-xs leading-relaxed text-[var(--muted-foreground)]">
          <Check className="size-4 text-[var(--accent)]" aria-hidden="true" />
          {pdfSalesReady || guideSalesReady || membershipSalesReady
            ? "Purchases live inside your private HWL library."
            : "Sales open only after every promised file, lesson, and access path is ready."}
        </p>
      </BreathingSection>

      <BreathingSection
        background="cool"
        contentClassName="mx-auto max-w-5xl px-6"
        id="faq"
        variant="dressing-room"
      >
        <div className="mx-auto max-w-3xl text-center">
          <BreathingText
            as="h2"
            className="font-medium text-[var(--primary)]"
            size="heading"
          >
            Questions
          </BreathingText>
        </div>
        <div className="mt-10">
          <FaqAccordion items={faqs} />
        </div>
      </BreathingSection>
    </>
  )
}
