import Link from "next/link"
import { Droplets } from "lucide-react"

import { JsonLd } from "@/components/seo/json-ld"
import { ServiceOfferingsSection } from "@/components/services/service-offerings-section"
import { PageSection } from "@/components/shared/internal-page"
import { ParallaxImage } from "@/components/shared/parallax-image"
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
            <div className="experience-hero-actions mt-9 flex justify-center md:justify-start">
              <Button
                asChild
                className="h-12 rounded-full bg-[var(--primary)] px-7 text-white hover:bg-[var(--accent)]"
              >
                <Link href="#offerings">Choose a facial or LIFT</Link>
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

      <ServiceAreaNote />
    </div>
  )
}
