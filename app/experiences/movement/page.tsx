import Link from "next/link"
import { ArrowRight, Circle, Wind } from "lucide-react"

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
  title: "Private Yoga & Sound Healing in Palm Springs | HWL by SMD",
  description:
    "Private yoga, restorative movement, and sound bath sessions in Palm Springs, Joshua Tree, and Yucca Valley.",
  path: "/yoga",
})

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

      <ServiceAreaNote />
    </div>
  )
}
