import Link from "next/link"
import { AtSign, Mail, MapPin, Phone } from "lucide-react"

import { InteriorHero, PageSection } from "@/components/shared/internal-page"
import { ContactForm } from "@/components/shared/contact-form"
import { CtaBlock } from "@/components/shared/cta-block"
import { SectionHeading } from "@/components/shared/section-heading"
import { Card } from "@/components/ui/card"
import { SITE_CONFIG } from "@/lib/constants"
import { media } from "@/lib/media"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Contact Shannon | HWL by SMD",
  description:
    "Get in touch to book an experience, plan a retreat, or ask a question. Shannon responds within 48 hours.",
  path: "/contact",
})

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>
}) {
  const { notice } = await searchParams

  return (
    <>
      <InteriorHero
        eyebrow="Contact"
        image={media.brand.windowPortrait.src}
        imageAlt={media.brand.windowPortrait.alt}
        imagePosition="center 30%"
        title="Get in Touch"
        subtitle="Questions, retreat inquiries, or just a hello."
        variant="ritual"
      />

      <PageSection>
        <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Inquiry"
              subtitle="For bookings, use the Book page. For retreat partnerships, use the Retreats inquiry form. For everything else, send a note."
              title="Send a note"
            />
            {notice === "connection" ? (
              <p
                className="mt-6 rounded-lg border border-[var(--accent)]/30 bg-white/55 px-5 py-4 text-sm leading-relaxed text-[var(--primary)]"
                role="status"
              >
                Messages are coming soon. For now, reach Shannon directly
                through this contact form.
              </p>
            ) : null}
            <div className="mt-8">
              <ContactForm
                fields={[
                  { label: "Name", name: "name", required: true },
                  {
                    label: "Email",
                    name: "email",
                    required: true,
                    type: "email",
                  },
                  { label: "Phone", name: "phone", type: "tel" },
                  { label: "Subject", name: "subject" },
                ]}
                source="contact-page"
                submitLabel="Send Note"
              />
            </div>
          </div>

          <Card className="rounded-lg border-[var(--border)] bg-white/55 p-6">
            <h2 className="text-2xl font-medium text-[var(--primary)]">
              Direct contact
            </h2>
            <div className="mt-6 grid gap-4 text-sm text-[var(--muted-foreground)]">
              <a
                className="flex items-center gap-3 hover:text-[var(--accent)]"
                href={`mailto:${SITE_CONFIG.email}`}
              >
                <Mail className="size-4" />
                {SITE_CONFIG.email}
              </a>
              <a
                className="flex items-center gap-3 hover:text-[var(--accent)]"
                href={`tel:${SITE_CONFIG.phone.replace(/\D/g, "")}`}
              >
                <Phone className="size-4" />
                {SITE_CONFIG.phone}
              </a>
              <Link
                className="flex items-center gap-3 hover:text-[var(--accent)]"
                href={SITE_CONFIG.instagramPersonalUrl}
              >
                <AtSign className="size-4" />
                {SITE_CONFIG.instagramPersonal}
              </Link>
              <Link
                className="flex items-center gap-3 hover:text-[var(--accent)]"
                href={SITE_CONFIG.instagramBrandUrl}
              >
                <AtSign className="size-4" />
                {SITE_CONFIG.instagramBrand}
              </Link>
              <p className="flex items-center gap-3">
                <MapPin className="size-4" />
                {SITE_CONFIG.location}
              </p>
            </div>
          </Card>
        </div>
      </PageSection>

      <PageSection className="bg-white/35">
        <SectionHeading
          align="center"
          eyebrow="Retreat Inquiries"
          subtitle="For retreats and destination gatherings, please include your preferred date, location, group size, host contact, and the type of experience you imagine. Shannon responds within 48 hours whenever possible."
          title="Planning something larger?"
        />
      </PageSection>

      <CtaBlock
        primaryHref="/book"
        primaryLabel="Explore Booking"
        secondaryHref={`mailto:${SITE_CONFIG.email}`}
        secondaryLabel="Email Shannon"
        subtitle="If you already know what you need, begin with the concierge booking flow. If not, a simple note is a beautiful place to start."
        title="Choose your next step"
      />
    </>
  )
}
