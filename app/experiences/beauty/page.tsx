import Link from "next/link"
import { ArrowRight, Check, Droplets, Sparkles } from "lucide-react"

import { AddToCartButton } from "@/components/cart/add-to-cart-button"
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
import { media } from "@/lib/media"
import { createPageMetadata, createServiceJsonLd } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Facial Rituals & Skincare in Palm Springs | HWL by SMD",
  description:
    "Facial rituals, lymphatic care, and skin consultation with Shannon Mary Dixon in Palm Springs and the Coachella Valley.",
  path: "/beauty",
})

const benefits = [
  {
    title: "A refreshed finish",
    description:
      "Thoughtful skin care and an unhurried pace create a polished, rested-looking finish.",
  },
  {
    title: "Space to soften",
    description:
      "Intentional touch around the jaw, brow, and temples is offered at a comfortable pace, based on your preferences.",
  },
  {
    title: "A quieter pace",
    description:
      "The room, rhythm, and touch are designed to make slowing down feel possible.",
  },
  {
    title: "Personal attention",
    description:
      "Products, pressure, and pacing are chosen around what you share with Shannon.",
  },
  {
    title: "Simple continuity",
    description:
      "You leave with clear, realistic guidance for caring for your skin between visits.",
  },
  {
    title: "Time to receive",
    description:
      "Nothing to perform. Nothing to solve. Just a protected interval of care.",
  },
]

const process = [
  {
    title: "Arrive",
    description:
      "Settle into a quiet room and let the pace of the day begin to change.",
  },
  {
    title: "Listen",
    description:
      "Share what your skin has been doing, what it is sensitive to, and what you need today.",
  },
  {
    title: "Receive",
    description:
      "Shannon shapes the facial, products, pressure, and rhythm around that conversation.",
  },
  {
    title: "Rest",
    description:
      "The final moments are deliberately unhurried so the experience can close without a rush.",
  },
  {
    title: "Continue",
    description:
      "Leave with a few grounded suggestions—not a complicated list—for the days ahead.",
  },
]

const faqs = [
  {
    question: "How do I choose the right facial?",
    answer:
      "You do not need to decide alone. Begin with a consultation or share what you are looking for in your booking note. Shannon will confirm the most fitting format before your appointment.",
  },
  {
    question: "What should I share before my appointment?",
    answer:
      "Please mention active skin conditions, allergies, pregnancy, recent procedures, prescriptions, or anything that changes how your skin should be cared for.",
  },
  {
    question: "What should I do before I arrive?",
    answer:
      "Come with a clean face when possible, but do not make the day complicated. Your current products and routine can be discussed when you arrive.",
  },
  {
    question: "Can a beauty experience be part of a retreat?",
    answer:
      "Yes. Private groups and retreats can request a beauty format shaped around the setting, timing, and number of guests.",
  },
  {
    question: "Is this medical or dermatological care?",
    answer:
      "No. HWL beauty experiences are complementary wellness practices and are not a substitute for dermatological or medical treatment.",
  },
]

export default function BeautyPage() {
  return (
    <div className="overflow-hidden">
      <JsonLd
        data={createServiceJsonLd({
          name: "HWL Beauty Experiences",
          description:
            "Facial rituals centered on thoughtful skin care and space to slow down.",
          path: "/beauty",
          serviceType: "Facial and beauty wellness experiences",
          image: media.experiences.beauty.src,
        })}
        id="beauty-service-schema"
      />

      <section className="experience-hero relative isolate flex min-h-[82svh] items-center overflow-hidden bg-[linear-gradient(145deg,#faf7f2_0%,#f5ece8_46%,#edf2ef_100%)] px-6 py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-32 size-[34rem] rounded-full border border-white/70 opacity-80"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-6 -left-12 size-[22rem] rounded-full border border-[var(--accent)]/15"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-12rem] bottom-[-14rem] size-[38rem] rounded-full bg-white/30 blur-3xl"
        />

        <div className="experience-hero-grid relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 md:grid-cols-[minmax(0,0.92fr)_minmax(340px,0.78fr)] md:gap-20">
          <div className="max-w-3xl text-center md:text-left">
            <p className="hero-reveal hero-reveal--1 text-xs font-medium tracking-[0.32em] text-[var(--accent)] uppercase">
              Beauty
            </p>
            <h1 className="experience-hero-heading hero-reveal hero-reveal--2 mt-6 text-5xl leading-[0.98] font-medium text-[var(--primary)] md:text-7xl lg:text-8xl">
              Skin as landscape. Touch as language.
            </h1>
            <p className="experience-hero-subtitle hero-reveal hero-reveal--3 mx-auto mt-7 max-w-2xl text-lg leading-[1.9] text-[var(--muted-foreground)] md:mx-0 md:text-xl">
              The face holds what the body carries.
            </p>
            <div className="experience-hero-actions mt-9 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
              <AddToCartButton
                className="h-12 sm:w-auto"
                label="Get LIFT · $11.11"
              />
              <Button
                asChild
                className="h-12 rounded-full border-[var(--border)] bg-white/35 px-7 text-[var(--primary)] backdrop-blur-sm hover:bg-white/65"
                variant="outline"
              >
                <Link href="#offerings">Explore Beauty</Link>
              </Button>
            </div>
          </div>

          <div className="experience-hero-image hero-image-reveal relative mx-auto w-full max-w-md md:max-w-none">
            <div
              aria-hidden="true"
              className="absolute -inset-5 rounded-[2.75rem] border border-white/70"
            />
            <ParallaxImage
              alt={media.experiences.beauty.alt}
              aspectRatio="4 / 5"
              className="rounded-[2.5rem] shadow-[0_32px_90px_rgba(112,84,77,0.16)]"
              imageClassName="object-cover"
              preload
              speed={0.1}
              src={media.experiences.beauty.src}
            />
            <span className="absolute right-5 bottom-5 inline-flex items-center gap-2 rounded-full border border-white/55 bg-[var(--background)]/75 px-4 py-2 text-[10px] tracking-[0.2em] text-[var(--primary)] uppercase backdrop-blur-md">
              <Droplets
                className="size-3.5 text-[var(--accent)]"
                aria-hidden="true"
              />
              The bathroom
            </span>
          </div>
        </div>
      </section>

      <ServiceOfferingsSection pillarId="beauty" />

      <PageSection className="py-24 md:py-32" id="overview">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[0.72fr_1fr] lg:gap-24">
          <div className="relative mx-auto grid aspect-square w-full max-w-sm place-items-center rounded-full border border-[var(--accent)]/25 bg-[radial-gradient(circle,rgba(255,255,255,0.88)_0%,rgba(232,223,211,0.36)_52%,transparent_72%)]">
            <div
              aria-hidden="true"
              className="absolute inset-[12%] rounded-full border border-white"
            />
            <div
              aria-hidden="true"
              className="absolute inset-[27%] rounded-full border border-[var(--accent)]/20"
            />
            <Droplets
              className="size-10 text-[var(--accent)]/70"
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-xs font-medium tracking-[0.3em] text-[var(--accent)] uppercase">
              Beneath the surface
            </p>
            <p className="mt-6 text-lg leading-[1.9] text-[var(--foreground)] md:text-xl">
              Shannon&apos;s approach to skin is slow. As a licensed
              aesthetician, she works with lymphatic drainage, facial sculpting,
              and circulation — not to erase age, but to move what&apos;s
              stagnant. The glow that comes from flow, not from product.
            </p>
          </div>
        </div>
        <PullQuote
          className="mt-20"
          quote="Your face is not a problem to solve. It's a landscape to tend."
        />
      </PageSection>

      <section className="relative isolate overflow-hidden border-y border-[var(--border)] bg-[#f3e9dc] px-6 py-16 md:py-20">
        <div
          aria-hidden="true"
          className="absolute -top-28 -right-20 size-80 rounded-full bg-white/35 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl gap-8 md:grid-cols-[0.32fr_0.68fr] md:items-start md:gap-14">
          <div>
            <p className="text-xs font-medium tracking-[0.28em] text-[var(--accent)] uppercase">
              Kind words
            </p>
            <h2 className="mt-4 max-w-xs text-3xl leading-tight font-medium text-[var(--primary)] md:text-4xl">
              Care that stays with you.
            </h2>
          </div>

          <figure className="relative rounded-[2rem] border border-white/65 bg-white/42 p-7 shadow-[0_24px_70px_rgba(90,74,63,0.08)] backdrop-blur-sm sm:p-9 md:p-10">
            <span
              aria-hidden="true"
              className="absolute top-4 left-6 font-serif text-6xl leading-none text-[var(--accent)]/22"
            >
              “
            </span>
            <blockquote className="relative pt-5 font-serif text-xl leading-[1.55] text-[var(--primary)] italic sm:text-2xl md:text-[1.75rem]">
              What a wonderful experience! Went in to get a facial for my
              upcoming wedding — I was feeling quite stressed but felt
              immediately soothed once Shannon started working her magic. My
              skin is still showing the happy effects of being fed and massaged
              with all these fancy concoctions. And honestly, I would pay again
              just to have that meditative experience!
            </blockquote>
            <figcaption className="mt-7 flex items-center gap-3 text-[11px] font-medium tracking-[0.2em] text-[var(--accent)] uppercase">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-[var(--accent)]/45"
              />
              Zara K. · Beauty + facial client
            </figcaption>
          </figure>
        </div>
      </section>

      <PageSection className="py-24 md:py-32" id="benefits">
        <SectionHeading
          align="center"
          eyebrow="What the room makes possible"
          title="Care you can feel after you leave."
        />
        <div className="mt-14 grid gap-px overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <article
              className="bg-[var(--background)] p-7 md:p-9"
              key={benefit.title}
            >
              <Check
                className="size-4 text-[var(--accent)]"
                aria-hidden="true"
              />
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

      <PageSection className="bg-white/35 py-24 md:py-32" id="process">
        <SectionHeading
          align="center"
          eyebrow="Your experience"
          title="Five unhurried moments."
        />
        <ol className="mx-auto mt-16 max-w-5xl">
          {process.map((step, index) => (
            <li
              className="grid gap-5 border-t border-[var(--border)] py-8 first:border-t-0 md:grid-cols-[7rem_0.75fr_1fr] md:items-baseline"
              key={step.title}
            >
              <span className="text-xs tracking-[0.25em] text-[var(--accent)] uppercase">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-3xl font-medium text-[var(--primary)]">
                {step.title}
              </h3>
              <p className="text-base leading-[1.9] text-[var(--muted-foreground)]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </PageSection>

      <PageSection className="py-24 md:py-32" id="investment">
        <div className="mx-auto max-w-4xl rounded-[2.5rem] border border-[var(--accent)]/25 bg-[linear-gradient(135deg,rgba(255,255,255,0.72),rgba(232,223,211,0.32))] p-8 text-center shadow-[0_28px_80px_rgba(90,74,63,0.08)] md:p-14">
          <Sparkles
            className="mx-auto size-5 text-[var(--accent)]"
            aria-hidden="true"
          />
          <p className="mt-5 text-xs tracking-[0.28em] text-[var(--accent)] uppercase">
            Investment
          </p>
          <h2 className="mt-5 text-4xl font-medium text-[var(--primary)] md:text-5xl">
            Book your facial ritual.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-[1.9] text-[var(--muted-foreground)]">
            Each facial ritual above can be booked as an individual appointment.
            Choose one to see Shannon’s live dates and times. No payment is
            collected with the request; Shannon confirms the appointment
            personally.
          </p>
          <Button
            asChild
            className="mt-8 h-12 rounded-full bg-[var(--primary)] px-7 text-white hover:bg-[var(--accent)]"
          >
            <Link href="#offerings">
              Choose a Facial <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </PageSection>

      <PageSection className="bg-white/35 py-24 md:py-32" id="faq">
        <SectionHeading align="center" title="Questions, answered gently." />
        <Accordion
          className="mx-auto mt-10 max-w-3xl"
          collapsible
          type="single"
        >
          {faqs.map((item, index) => (
            <AccordionItem
              className="border-[var(--border)]"
              key={item.question}
              value={`beauty-faq-${index}`}
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

      <PageSection className="py-24 md:py-32" id="lift">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2.5rem] bg-[var(--primary)] text-[var(--background)] shadow-[0_35px_90px_rgba(43,39,36,0.18)] lg:grid-cols-[0.88fr_1.12fr]">
          <ParallaxImage
            alt={media.shannon.beautyLift.alt}
            aspectRatio="4 / 3"
            className="h-full min-h-80 rounded-none"
            imageClassName="object-cover opacity-85"
            sizes="(max-width: 1023px) 100vw, 42vw"
            speed={0.1}
            src={media.shannon.beautyLift.src}
          />
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
            <p className="text-xs tracking-[0.3em] text-[var(--accent-on-dark)] uppercase">
              LIFT · A daily ritual
            </p>
            <h2 className="mt-5 text-4xl leading-tight font-medium md:text-5xl">
              Your hands know more than you think.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-[1.9] text-[var(--background)]/72">
              LIFT is Shannon&apos;s daily facial massage ritual — seven
              movements, five minutes, your own two hands. It&apos;s the
              practice she teaches every client to do at home, between sessions,
              when the appointment ends and the maintenance begins.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <span className="font-serif text-4xl text-[var(--accent-on-dark)]">
                $11.11
              </span>
              <AddToCartButton
                className="h-12 rounded-full bg-[var(--background)] px-7 text-[var(--primary)] hover:bg-[var(--accent)] hover:text-white"
                label="Add LIFT to cart"
              />
            </div>
          </div>
        </div>
      </PageSection>
      <ServiceAreaNote />
    </div>
  )
}
