import Link from "next/link"
import { ArrowRight, Check, Circle, Wind } from "lucide-react"

import { SelectBookingButton } from "@/components/booking/select-booking-button"
import { JsonLd } from "@/components/seo/json-ld"
import { ServiceOfferingsSection } from "@/components/services/service-offerings-section"
import { PageSection } from "@/components/shared/internal-page"
import { ParallaxImage } from "@/components/shared/parallax-image"
import { PullQuote } from "@/components/shared/pull-quote"
import { SectionHeading } from "@/components/shared/section-heading"
import { ServiceAreaNote } from "@/components/shared/service-area-note"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { findBookingService } from "@/lib/booking-services"
import { media } from "@/lib/media"
import { createPageMetadata, createServiceJsonLd } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Private Yoga & Sound Healing in Palm Springs | HWL by SMD",
  description:
    "Private yoga, restorative movement, and sound bath sessions in Palm Springs, Joshua Tree, and Yucca Valley.",
  path: "/yoga",
})

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
  const privateYogaBooking = findBookingService("private-yoga")

  if (!privateYogaBooking) {
    throw new Error("Private Yoga is missing from the booking catalog.")
  }

  return (
    <div className="overflow-hidden">
      <JsonLd
        data={createServiceJsonLd({
          name: "HWL Yoga Experiences",
          description:
            "Private yoga, restorative practice, and sound healing to reconnect with your body.",
          path: "/yoga",
          serviceType: "Private yoga, restorative movement, and sound healing",
          image: media.brand.standingStretch.src,
        })}
        id="yoga-service-schema"
      />

      <section className="experience-hero relative isolate flex min-h-[82svh] items-center overflow-hidden bg-[linear-gradient(145deg,#f6f2e9_0%,#e9ece4_50%,#ddd9cf_100%)] px-6 py-24">
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

        <div className="experience-hero-grid relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 md:grid-cols-[minmax(0,0.88fr)_minmax(360px,0.82fr)] md:gap-20">
          <div className="max-w-3xl text-center md:text-left">
            <p className="hero-reveal hero-reveal--1 text-xs font-medium tracking-[0.32em] text-[#68735f] uppercase">
              Yoga
            </p>
            <h1 className="experience-hero-heading hero-reveal hero-reveal--2 mt-6 text-5xl leading-[0.98] font-medium text-[var(--primary)] md:text-7xl lg:text-8xl">
              The body trusts what the mind hasn&apos;t said yet.
            </h1>
            <p className="experience-hero-subtitle hero-reveal hero-reveal--3 mx-auto mt-7 max-w-2xl text-lg leading-[1.9] text-[var(--muted-foreground)] md:mx-0 md:text-xl">
              Movement as nervous system care.
            </p>
            <div className="experience-hero-actions mt-9 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
              <Button
                asChild
                className="h-12 rounded-full bg-[var(--primary)] px-7 text-white hover:bg-[#68735f]"
              >
                <Link href="#offerings">
                  Explore Body Sessions <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                className="h-12 rounded-full border-[#68735f]/25 bg-white/35 px-7 text-[var(--primary)] hover:bg-white/70"
                variant="outline"
              >
                <Link href="/the-den">Explore The Den</Link>
              </Button>
            </div>
          </div>

          {/* Static atmospheric fallback until Shannon's approved movement loop is available. */}
          <div className="experience-hero-image hero-image-reveal relative mx-auto w-full max-w-md md:max-w-none">
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

      <ServiceOfferingsSection pillarId="movement" />

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
            <p className="mt-6 font-serif text-2xl text-[var(--primary)] italic md:text-3xl">
              Private yoga with Shannon is not a class. It&apos;s a conversation
              between your body and your nervous system.
            </p>
            <p className="mt-5 text-lg leading-[1.9] text-[var(--foreground)] md:text-xl">
              Breath-led. Slow enough to feel what&apos;s underneath the
              holding. Customized for restorative flow, mindful movement,
              vinyasa strength, mobility work, or athletic recovery. Always with
              modifications, always free of judgment. Sessions are offered in
              person only, rooted in the desert environment. The space matters.
              The light changes. Your breath finds its own rhythm.
            </p>
          </div>
        </div>
        <PullQuote
          attribution="Shannon"
          className="mt-20"
          quote="Movement doesn't ask you to be impressive. It asks you to be present."
        />
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
              Group rates are shown above. Individual one-to-one pricing is
              confirmed through booking. All sessions are in person in the
              desert.
            </p>
            <SelectBookingButton
              className="mt-8 h-12 rounded-full bg-[var(--primary)] px-7 text-white hover:bg-[#68735f] sm:w-auto"
              label="Book a Yoga Session"
              pillarId={privateYogaBooking.pillar.id}
              service={privateYogaBooking.service}
            />
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
          <SelectBookingButton
            className="mt-9 h-12 rounded-full bg-[var(--primary)] px-7 text-white hover:bg-[#68735f] sm:w-auto"
            label="Book a Yoga Session"
            pillarId={privateYogaBooking.pillar.id}
            service={privateYogaBooking.service}
          />
        </div>
      </section>
      <ServiceAreaNote />
    </div>
  )
}
