import Link from "next/link"
import { ArrowRight, Check, Circle, Wind } from "lucide-react"

import { JsonLd } from "@/components/seo/json-ld"
import { PageSection } from "@/components/shared/internal-page"
import { ParallaxImage } from "@/components/shared/parallax-image"
import { PullQuote } from "@/components/shared/pull-quote"
import { SectionDivider } from "@/components/shared/section-divider"
import { SectionHeading } from "@/components/shared/section-heading"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { media } from "@/lib/media"
import { cn } from "@/lib/utils"
import { createPageMetadata, createServiceJsonLd } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Body | Movement & Sound | HWL by SMD",
  description:
    "Private yoga, restorative practice, and sound healing to reconnect with your body.",
  path: "/body",
})

const practices = [
  {
    title: "Private Yoga",
    detail: "60 minutes · Investment by consultation",
    image: media.experiences.movementBoat,
    description:
      "A personalized flow based on your body and goals. The session can make room for strength, mobility, recovery, or stillness without asking you to perform.",
  },
  {
    title: "Restorative Yoga",
    detail: "75 minutes · Investment by consultation",
    image: media.experiences.movementEagle,
    description:
      "A slow, prop-supported practice for nervous system regulation. Time is built in for breath, sensation, and the kind of rest that does not need to be earned.",
  },
  {
    title: "Private Sound Bath",
    detail: "60 minutes · Investment by consultation",
    image: media.experiences.movementStretch,
    description:
      "A one-to-one sound healing session shaped around deep listening. Crystal bowls, tone, breath, and silence create a spacious place to settle.",
  },
]

const process = [
  {
    title: "Connect",
    description:
      "Share how your body feels, what has been asking for energy, and what you hope to receive.",
  },
  {
    title: "Arrive",
    description:
      "Begin with breath and simple grounding so the session meets your actual nervous system.",
  },
  {
    title: "Move",
    description:
      "Explore an adaptive practice shaped around mobility, strength, recovery, or rest.",
  },
  {
    title: "Receive",
    description:
      "Integrate through sound, stillness, breathwork, or a slower closing practice.",
  },
  {
    title: "Return",
    description:
      "Leave with one or two accessible practices to come back to between sessions.",
  },
]

const benefits = [
  {
    title: "A steadier breath",
    description:
      "Space to notice the breath without forcing it into a particular shape.",
  },
  {
    title: "Tension release",
    description:
      "Slow movement and supportive positions invite effort to soften gradually.",
  },
  {
    title: "Body awareness",
    description:
      "Practice listening to sensation before habit or momentum takes over.",
  },
  {
    title: "Adaptive movement",
    description:
      "The session changes with your energy, experience, and range on that day.",
  },
  {
    title: "Rest without performance",
    description:
      "No metrics and no audience—only time to be present inside your own body.",
  },
  {
    title: "A practice to keep",
    description:
      "Simple movements or pauses you can return to long after the session ends.",
  },
]

const faqs = [
  {
    question: "What if I have never practiced yoga?",
    answer:
      "You are welcome exactly as you are. Private sessions adapt to your body and experience; there is no preset sequence you need to keep up with.",
  },
  {
    question: "Do I need to be flexible?",
    answer:
      "No. Flexibility is not the goal. Attention, breath, and a more honest relationship with your body matter far more here.",
  },
  {
    question: "What should I bring?",
    answer:
      "Comfortable clothing and water are enough. Shannon will confirm mats, props, and sound materials with you before the session.",
  },
  {
    question: "What happens in a sound bath?",
    answer:
      "You rest while sound and vibration give your attention something gentle to follow. Shannon explains the setup before beginning, and silence remains part of the experience.",
  },
  {
    question: "Is this physical therapy or medical care?",
    answer:
      "No. Yoga and movement sessions are designed for general wellness and are not physical therapy or medical treatment. Please share injuries, chronic conditions, or physical limitations before your session.",
  },
]

export default function MovementPage() {
  return (
    <div className="overflow-hidden">
      <JsonLd
        data={createServiceJsonLd({
          name: "HWL Body Experiences",
          description:
            "Private yoga, restorative practice, and sound healing to reconnect with your body.",
          path: "/body",
          serviceType: "Private yoga, restorative movement, and sound healing",
          image: media.brand.standingStretch.src,
        })}
        id="body-service-schema"
      />

      <section className="relative isolate flex min-h-[82svh] items-center overflow-hidden bg-[linear-gradient(145deg,#f6f2e9_0%,#e9ece4_50%,#ddd9cf_100%)] px-6 py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-[12%] hidden w-px bg-white/55 md:block"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-[14%] hidden w-px bg-[var(--primary)]/5 md:block"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -bottom-36 size-[36rem] rounded-full border border-[#839078]/20"
        />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 md:grid-cols-[minmax(0,0.88fr)_minmax(360px,0.82fr)] md:gap-20">
          <div className="max-w-3xl text-center md:text-left">
            <p className="hero-reveal hero-reveal--1 text-xs font-medium tracking-[0.32em] text-[#68735f] uppercase">
              Body
            </p>
            <h1 className="hero-reveal hero-reveal--2 mt-6 text-5xl leading-[0.98] font-medium text-[var(--primary)] md:text-7xl lg:text-8xl">
              Movement as medicine.
            </h1>
            <p className="hero-reveal hero-reveal--3 mx-auto mt-7 max-w-2xl text-lg leading-[1.9] text-[var(--muted-foreground)] md:mx-0 md:text-xl">
              Private yoga, restorative practice, and sound healing to reconnect
              with your body.
            </p>
            <div className="hero-reveal hero-reveal--4 mt-9 flex justify-center md:justify-start">
              <Button
                asChild
                className="h-12 rounded-full bg-[var(--primary)] px-7 text-white hover:bg-[#68735f]"
              >
                <Link href="/book">
                  Book a Session <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Static atmospheric fallback until Shannon's approved movement loop is available. */}
          <div className="hero-image-reveal relative mx-auto w-full max-w-md md:max-w-none">
            <div
              aria-hidden="true"
              className="absolute -inset-5 rounded-t-[12rem] rounded-b-[2rem] border border-white/70"
            />
            <ParallaxImage
              alt={media.brand.standingStretch.alt}
              aspectRatio="4 / 5"
              className="rounded-t-[12rem] rounded-b-[2rem] shadow-[0_32px_90px_rgba(67,79,61,0.16)]"
              imageClassName="object-cover object-center"
              preload
              speed={0.2}
              src={media.brand.standingStretch.src}
            />
            <span className="absolute right-5 bottom-5 inline-flex items-center gap-2 rounded-full border border-white/55 bg-[var(--background)]/75 px-4 py-2 text-[10px] tracking-[0.2em] text-[var(--primary)] uppercase backdrop-blur-md">
              <Wind className="size-3.5 text-[#68735f]" aria-hidden="true" />
              The studio
            </span>
          </div>
        </div>
      </section>

      <PageSection className="py-24 md:py-32" id="overview">
        <div className="mx-auto grid max-w-6xl items-start gap-16 lg:grid-cols-[0.72fr_1fr] lg:gap-24">
          <div className="relative hidden min-h-80 lg:block">
            <span className="absolute top-0 left-10 h-full w-px bg-[var(--border)]" />
            <span className="absolute top-1/3 left-0 h-px w-40 bg-[var(--border)]" />
            <Circle
              className="absolute top-[30%] left-[1.9rem] size-6 text-[#839078]/65"
              strokeWidth={1}
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-xs font-medium tracking-[0.3em] text-[#68735f] uppercase">
              Come back inside
            </p>
            <p className="mt-6 text-lg leading-[1.9] text-[var(--foreground)] md:text-xl">
              Your body keeps score. Tension accumulates — in the jaw, the hips,
              the breath. These sessions are designed to help that tension
              release. Not through performance, but through attention. Through
              moving slowly enough to actually feel what&apos;s happening
              inside. Whether it&apos;s yoga, sound, or both, the goal is the
              same: come home to your body.
            </p>
          </div>
        </div>
        <PullQuote
          attribution="HWL by SMD"
          className="mt-20"
          quote="Your body keeps score. Movement helps it settle."
        />
      </PageSection>

      <SectionDivider variant="line" />

      <PageSection className="bg-white/35 py-24 md:py-32" id="practices">
        <SectionHeading
          eyebrow="Three ways to enter"
          title="A practice shaped around the body that arrives."
        />
        <p className="mt-6 max-w-2xl text-base leading-[1.9] text-[var(--muted-foreground)]">
          Each private session has a clear form and enough space to change with
          your energy that day.
        </p>
        <div className="mt-16 space-y-20 md:space-y-28">
          {practices.map((practice, index) => (
            <article
              className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20"
              key={practice.title}
            >
              <div className={cn(index % 2 === 1 && "lg:order-2")}>
                <span className="text-xs tracking-[0.28em] text-[#68735f] uppercase">
                  Practice {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-5 text-4xl leading-tight font-medium text-[var(--primary)] md:text-5xl">
                  {practice.title}
                </h2>
                <p className="mt-4 text-xs tracking-[0.16em] text-[var(--muted-foreground)] uppercase">
                  {practice.detail}
                </p>
                <p className="mt-6 max-w-xl text-lg leading-[1.9] text-[var(--muted-foreground)]">
                  {practice.description}
                </p>
                <Link
                  className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] underline-offset-4 hover:underline"
                  href="/book"
                >
                  Ask about this practice
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
              <ParallaxImage
                alt={practice.image.alt}
                aspectRatio="5 / 4"
                className={cn(
                  "rounded-[2rem] shadow-[0_26px_75px_rgba(67,79,61,0.12)]",
                  index % 2 === 1 && "lg:order-1"
                )}
                imageClassName="object-cover"
                sizes="(max-width: 1023px) 100vw, 50vw"
                speed={0.2}
                src={practice.image.src}
              />
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection className="py-24 md:py-32" id="for-you">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-medium tracking-[0.3em] text-[#68735f] uppercase">
            Who this is for
          </p>
          <h2 className="mt-5 text-4xl leading-tight font-medium text-[var(--primary)] md:text-5xl">
            You do not need to arrive ready.
          </h2>
          <p className="mt-7 text-lg leading-[1.9] text-[var(--muted-foreground)] md:text-xl">
            This is for you if you are tired of being asked to perform wellness.
            You do not need to be flexible, experienced, or good at stillness.
            Come with the body you have and the energy available that day. The
            practice will meet you there.
          </p>
        </div>
      </PageSection>

      <PageSection
        className="bg-[linear-gradient(180deg,rgba(233,236,228,0.54),rgba(250,247,242,0.9))] py-24 md:py-32"
        id="process"
      >
        <SectionHeading
          align="center"
          eyebrow="Your session"
          title="Five ways the room holds you."
        />
        <ol className="relative mx-auto mt-16 grid max-w-6xl gap-5 md:grid-cols-5">
          <span
            aria-hidden="true"
            className="absolute top-7 right-[8%] left-[8%] hidden h-px bg-[#839078]/25 md:block"
          />
          {process.map((step, index) => (
            <li
              className="relative rounded-[1.5rem] border border-white/70 bg-[var(--background)]/70 p-6 shadow-[0_18px_55px_rgba(67,79,61,0.06)] backdrop-blur-sm"
              key={step.title}
            >
              <span className="relative z-10 inline-grid size-9 place-items-center rounded-full border border-[#839078]/30 bg-[var(--background)] text-xs text-[#68735f]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 text-2xl font-medium text-[var(--primary)]">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-[1.9] text-[var(--muted-foreground)]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </PageSection>

      <PageSection className="py-24 md:py-32" id="benefits">
        <SectionHeading
          align="center"
          eyebrow="What this supports"
          title="Less force. More feeling."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <article
              className="rounded-[1.75rem] border border-[var(--border)] p-7 transition duration-500 hover:border-[#839078]/35 hover:bg-white/35 motion-safe:hover:-translate-y-1"
              key={benefit.title}
            >
              <Check className="size-4 text-[#68735f]" aria-hidden="true" />
              <h3 className="mt-5 text-2xl font-medium text-[var(--primary)]">
                {benefit.title}
              </h3>
              <p className="mt-3 text-sm leading-[1.9] text-[var(--muted-foreground)]">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection className="bg-white/35 py-24 md:py-32" id="investment">
        <div className="mx-auto grid max-w-5xl items-center gap-10 rounded-[2.5rem] border border-[#839078]/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.76),rgba(221,225,214,0.48))] p-8 shadow-[0_30px_80px_rgba(67,79,61,0.08)] md:grid-cols-[0.7fr_1.3fr] md:p-14">
          <div className="mx-auto grid size-36 place-items-center rounded-full border border-[#839078]/25">
            <Wind className="size-8 text-[#68735f]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs tracking-[0.28em] text-[#68735f] uppercase">
              Investment
            </p>
            <h2 className="mt-5 text-4xl font-medium text-[var(--primary)] md:text-5xl">
              Let the format follow the need.
            </h2>
            <p className="mt-6 text-lg leading-[1.9] text-[var(--muted-foreground)]">
              Private session investment is confirmed in consultation, once the
              practice, setting, timing, and number of guests are clear. You
              will receive the full details before booking.
            </p>
            <Button
              asChild
              className="mt-8 h-12 rounded-full bg-[var(--primary)] px-7 text-white hover:bg-[#68735f]"
            >
              <Link href="/book">
                Book a Session <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </PageSection>

      <PageSection className="bg-white/35 py-24 md:py-32" id="faq">
        <SectionHeading
          align="center"
          title="Before you step into the studio."
        />
        <Accordion
          className="mx-auto mt-10 max-w-3xl"
          collapsible
          type="single"
        >
          {faqs.map((item, index) => (
            <AccordionItem
              className="border-[var(--border)]"
              key={item.question}
              value={`body-faq-${index}`}
            >
              <AccordionTrigger className="py-6 text-left text-lg text-[var(--primary)] hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-base leading-[1.9] text-[var(--muted-foreground)]">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </PageSection>

      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs tracking-[0.3em] text-[#68735f] uppercase">
            The studio is ready
          </p>
          <h2 className="mt-5 text-5xl leading-tight font-medium text-[var(--primary)] md:text-6xl">
            Come home to your body.
          </h2>
          <Button
            asChild
            className="mt-9 h-12 rounded-full bg-[var(--primary)] px-7 text-white hover:bg-[#68735f]"
          >
            <Link href="/book">
              Book a Session <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
