import Link from "next/link"
import { Check, LockKeyhole, Play } from "lucide-react"

import { CheckoutButton } from "@/components/payment/checkout-button"
import { BreathingSection } from "@/components/shared/breathing-section"
import { BreathingText } from "@/components/shared/breathing-text"
import { FaqAccordion } from "@/components/shared/internal-page"
import { LiftSequenceProgress } from "@/components/shared/lift-sequence-progress"
import { ParallaxWindow } from "@/components/shared/parallax-window"
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
    "Seven facial massage movements and a five-minute daily ritual from Shannon Mary Dixon.",
  path: "/beauty/lift",
})

const previewMovements = [
  {
    name: "The Opening",
    instruction:
      "With very light pressure, trace slow downward strokes along the sides of the neck before moving to the face.",
  },
  {
    name: "The Unwind",
    instruction:
      "With soft, sustained pressure, trace slow circles along the jaw hinge to release tension stored in the masseter.",
  },
] as const

const lockedMovements = [
  "The Sculpt",
  "The Sweep",
  "The Arch",
  "The Smooth",
  "The Hold",
] as const

const movementNames = [
  ...previewMovements.map(({ name }) => name),
  ...lockedMovements,
]

const benefits = [
  "Invites a few minutes of gentle, intentional touch",
  "Creates space to notice the jaw, temples, and breath",
  "Offers a consistent rhythm for applying facial products",
  "Encourages a softer, less hurried morning or evening ritual",
  "Builds familiarity with how your face feels from day to day",
  "Keeps pressure, pace, and comfort in your own hands",
  "Creates a daily moment of physical self-awareness",
] as const

const preparation = [
  {
    title: "Clean hands",
    detail: "Begin with freshly washed hands.",
  },
  {
    title: "Cleansed skin",
    detail: "Remove makeup and settle in at the mirror.",
  },
  {
    title: "Add slip",
    detail: "Use facial oil, balm, or moisturizer so your hands glide.",
  },
  {
    title: "Gentle pressure",
    detail: "Start lighter than you think and never force the skin.",
  },
  {
    title: "Five quiet minutes",
    detail: "Let your breath set the pace of the ritual.",
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
            A Daily Ritual.
          </BreathingText>
          <BreathingText
            as="p"
            className="mt-7 max-w-xl text-[var(--primary)]"
            size="subheading"
          >
            Seven movements. Five minutes a day.
          </BreathingText>
          <BreathingText
            className="mt-7 max-w-2xl text-[var(--muted-foreground)]"
            size="body"
          >
            This guide came from years of holding space for others&apos; skin.
            What I found is simple: the five minutes you give yourself each
            morning matter more than any single appointment. Your hands know
            more than you think. This practice teaches you what to do with them.
            Seven movements. Five minutes. Your face, your breath, your ritual.
          </BreathingText>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button
              asChild
              className="min-h-12 rounded-full bg-[var(--primary)] px-7 text-white hover:bg-[var(--accent)]"
            >
              <Link href="#download">Get the Guide — $5.55</Link>
            </Button>
            <Button
              asChild
              className="min-h-12 rounded-full border-[var(--border)] bg-white/30 px-7 text-[var(--primary)] hover:bg-white/70"
              variant="outline"
            >
              <Link href="#sequence">
                <Play className="size-4" aria-hidden="true" />
                Watch Preview
              </Link>
            </Button>
          </div>
          <BreathingText
            as="blockquote"
            className="mt-12 border-l border-[var(--accent)] pl-6 font-serif text-[var(--primary)] italic"
            size="subheading"
          >
            &ldquo;Your hands know more than you think.&rdquo;
          </BreathingText>
        </Reveal>

        <Reveal className="relative" delay={140}>
          <ParallaxWindow
            alt={media.editorial.liftBotanicals.alt}
            aspectRatio="4 / 5"
            imageClassName="scale-[1.04] object-cover"
            preload
            sizes="(max-width: 1023px) 92vw, 42vw"
            speed={0.1}
            src={media.editorial.liftBotanicals.src}
            texture="paper"
          />
          <a
            className="absolute inset-x-5 bottom-5 z-10 flex min-h-14 items-center justify-between rounded-full border border-white/60 bg-[var(--background)]/88 px-6 text-sm font-medium text-[var(--primary)] shadow-lg backdrop-blur-md transition outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            href="#sequence"
          >
            Preview the first two movements
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
        <div>
          <BreathingText className="text-[var(--muted-foreground)]" size="body">
            This practice grew from holding space for other people&apos;s skin
            and noticing what a few quiet minutes of intentional touch can
            offer. Seven movements. That&apos;s all. Not complicated. Not
            impressive. Just consistent. Your hands are the tools. Your breath
            is the pace. Give yourself five minutes tomorrow morning. Then the
            next morning. Then the next. That&apos;s how ritual begins.
          </BreathingText>
          <p className="mt-8 font-serif text-xl text-[var(--primary)]">
            — Shannon
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
              Seven quiet shifts
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
            <p className="mt-5 text-xs leading-relaxed text-[var(--muted-foreground)]">
              Draft benefit language for Shannon&apos;s final review before
              publication.
            </p>
          </div>

          <aside className="relative overflow-hidden rounded-[2rem] bg-[var(--primary)] p-8 text-[var(--background)] md:p-12 lg:mt-24">
            <p className="text-xs font-medium tracking-[0.28em] text-[var(--accent-on-dark)] uppercase">
              Beyond Skin Deep
            </p>
            <BreathingText
              as="h3"
              className="mt-6 font-medium text-[var(--background)]"
              size="subheading"
            >
              Attention changes the relationship.
            </BreathingText>
            <p className="mt-7 text-lg leading-[1.9] text-white/78">
              The face is the most visible part of you, and also the most
              guarded. It&apos;s where you hold your stress, your concentration,
              your effort to appear okay. Five minutes a day of conscious touch
              changes that relationship. Not because you&apos;re fixing
              something broken, but because you&apos;re paying attention to
              something you usually ignore. Over time, your hands learn your
              face. Your face learns to soften. And that softness — that&apos;s
              what people notice. Not a technique. A presence.
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
            Before you begin
          </p>
          <BreathingText
            as="h2"
            className="mt-5 font-medium text-[var(--primary)]"
            size="heading"
          >
            Prepare the space.
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
            Movement and preparation guidance is working copy awaiting
            Shannon&apos;s final technique verification before publication.
          </p>
        </div>

        <LiftSequenceProgress steps={movementNames} />

        <div className="mx-auto mt-14 max-w-6xl space-y-12">
          {previewMovements.map(({ instruction, name }, index) => (
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
              </div>
            </article>
          ))}

          <aside className="mx-auto max-w-4xl rounded-[2rem] border border-[var(--accent)]/35 bg-[#f5ecde] p-8 md:p-10">
            <p className="text-xs font-medium tracking-[0.24em] text-[#8c6d47] uppercase">
              A few notes from Shannon
            </p>
            <ul className="mt-6 space-y-4 text-base leading-[1.8] text-[var(--muted-foreground)]">
              <li>
                Start slower than you think. Keep neck touch light and steady.
              </li>
              <li>Let jaw pressure build gradually. Think melt, not push.</li>
              <li>Add more slip whenever the skin begins to drag.</li>
            </ul>
          </aside>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {lockedMovements.map((name, index) => {
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
                      The complete demonstration and hand placement are inside
                      the full guide.
                    </p>
                  </Card>
                </article>
              )
            })}
          </div>
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
              LIFT PDF
            </h3>
            <p className="mt-3 font-serif text-4xl text-[var(--accent)]">
              $3.33
            </p>
            <p className="mt-5 flex-1 text-sm leading-[1.8] text-[var(--muted-foreground)]">
              The printable guide is in final preparation for a screen-free
              daily practice.
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
            <h3 className="mt-5 text-3xl font-medium">LIFT Video + PDF</h3>
            <p className="mt-3 font-serif text-4xl text-[var(--accent-on-dark)]">
              $5.55
            </p>
            <p className="mt-5 flex-1 text-sm leading-[1.8] text-white/78">
              The guided video and printable ritual are in final preparation.
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
                  label="Get the Guide — $5.55"
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
              The Den
            </h3>
            <p className="mt-3 font-serif text-4xl text-[var(--accent)]">
              $11.11
              <span className="text-sm">/mo</span>
            </p>
            <p className="mt-5 flex-1 text-sm leading-[1.8] text-[var(--muted-foreground)]">
              A growing member library with a private connection hub.
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
