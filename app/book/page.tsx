import {
  InteriorHero,
  LinkCard,
  PageSection,
} from "@/components/shared/internal-page"
import { ContactForm } from "@/components/shared/contact-form"
import { CtaBlock } from "@/components/shared/cta-block"
import { SectionHeading } from "@/components/shared/section-heading"
import { Button } from "@/components/ui/button"
import { media } from "@/lib/media"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Book an Experience | HWL by SMD",
  description:
    "Request a beauty experience, movement session, ritual, consultation, coaching session, or retreat partnership with Shannon.",
  path: "/book",
})

const concierge = [
  [
    "Restore my skin",
    "Luxury facial rituals, sculpting massage, glow, and nervous system care.",
    "/beauty",
  ],
  [
    "Reduce stress",
    "Private yoga, restorative movement, breath, and sound healing.",
    "/yoga",
  ],
  [
    "Find clarity",
    "Tarot, astrology, and grounded ritual for the question or transition asking for attention.",
    "/tarot",
  ],
  [
    "Plan a retreat",
    "Custom programming for retreats, hospitality, and destination gatherings.",
    "/retreats",
  ],
  [
    "Not sure yet",
    "Share what you are looking for and Shannon can help you find the right place to begin.",
    "/contact",
  ],
]

const direct = [
  [
    "Beauty",
    "Facial rituals, Reiki aromatherapy healing, and skin-nervous system restoration.",
    "/beauty",
  ],
  ["Yoga", "Private yoga, restorative movement, and sound healing.", "/yoga"],
  [
    "Tarot",
    "Astrology, tarot, Reiki, seasonal ceremonies, and intentional guidance.",
    "/tarot",
  ],
  [
    "Retreats",
    "Custom wellness programming for groups and destination events.",
    "/retreats",
  ],
  [
    "Coaching & Consultation",
    "Private life coaching, one-to-one consultation, and thoughtful support shaped around what you need now.",
    "/book?service=coaching-consultation#booking-inquiry",
  ],
  [
    "Private & Group Experiences",
    "Private sound baths, yoga, consultation, and custom group gatherings planned with Shannon.",
    "/book?service=private-group#booking-inquiry",
  ],
]

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{
    duration?: string
    from?: string
    service?: string
  }>
}) {
  const params = await searchParams
  const configuredCalendar = process.env.NEXT_PUBLIC_CALCOM_URL
  let bookingUrl: string | null = null

  if (configuredCalendar) {
    try {
      const url = new URL(configuredCalendar)
      url.searchParams.set("embed", "1")
      if (params.service) url.searchParams.set("service", params.service)
      if (params.duration) url.searchParams.set("duration", params.duration)
      if (params.from) url.searchParams.set("metadata[from]", params.from)
      bookingUrl = url.toString()
    } catch {
      bookingUrl = null
    }
  }

  return (
    <>
      <InteriorHero
        eyebrow="Book"
        image={media.brand.smilingPortrait.src}
        imageAlt={media.brand.smilingPortrait.alt}
        imagePosition="center 32%"
        title="Book an Experience"
        subtitle="Let's find what you need. Answer a few questions and I'll recommend the best experience for you."
        variant="flow"
      />

      <PageSection>
        <SectionHeading align="center" title="What are you looking for?" />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {concierge.map(([title, description, href]) => (
            <LinkCard
              description={description}
              href={href}
              key={title}
              label="Start here"
              title={title}
            />
          ))}
        </div>
      </PageSection>

      <PageSection className="bg-white/35">
        <SectionHeading align="center" title="Or choose directly" />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {direct.map(([title, description, href]) => (
            <LinkCard
              description={description}
              href={href}
              key={title}
              label="Explore"
              title={title}
            />
          ))}
        </div>
      </PageSection>

      <PageSection>
        <SectionHeading
          align="center"
          eyebrow="Private Booking"
          subtitle="A live calendar is being prepared for private beauty, movement, sound, and guidance sessions."
          title="Choose a time with Shannon"
        />
        {bookingUrl ? (
          <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-[2rem] border border-[var(--border)] bg-white/55 shadow-[0_24px_70px_rgba(90,74,63,0.1)]">
            <iframe
              allow="payment"
              className="h-[760px] w-full"
              loading="lazy"
              src={bookingUrl}
              title="Book a private session with Shannon"
            />
          </div>
        ) : (
          <div className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-[var(--border)] bg-white/55 p-8 text-center md:p-12">
            <p className="mx-auto max-w-xl text-base leading-relaxed text-[var(--muted-foreground)]">
              Until live scheduling opens, send a private inquiry with your
              preferred dates, location, and the experience you are considering.
              Shannon will respond within 48 hours whenever possible.
            </p>
            <Button
              asChild
              className="mt-6 rounded-full bg-[var(--primary)] px-6 text-white hover:bg-[var(--accent)]"
            >
              <a href="#booking-inquiry">Request a time</a>
            </Button>
          </div>
        )}
      </PageSection>

      <PageSection className="bg-white/35" id="booking-inquiry">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1fr] lg:items-start">
          <SectionHeading
            eyebrow="Inquiry"
            subtitle="Share what you're drawn to, the date or location if you have one, and anything you'd like Shannon to know."
            title="Tell me what you're planning"
          />
          <ContactForm
            fields={[
              { label: "Name", name: "name" },
              { label: "Email", name: "email", type: "email" },
              { label: "Inquiry Type", name: "inquiryType" },
            ]}
            source="booking-inquiry"
          />
        </div>
      </PageSection>

      <CtaBlock
        primaryHref="/contact"
        primaryLabel="Contact Shannon"
        secondaryHref="/beauty"
        secondaryLabel="Explore Beauty"
        subtitle="Not sure which path fits? Share what you want to feel when the experience is complete."
        title="You do not need to know exactly what to book."
      />
    </>
  )
}
