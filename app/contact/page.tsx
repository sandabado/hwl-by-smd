import Link from "next/link"
import { AtSign, Mail, MapPin, Phone } from "lucide-react"

import { InteriorHero, PageSection } from "@/components/shared/internal-page"
import { ContactForm } from "@/components/shared/contact-form"
import { SectionHeading } from "@/components/shared/section-heading"
import { Card } from "@/components/ui/card"
import { SITE_CONFIG } from "@/lib/constants"
import { media } from "@/lib/media"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Contact Shannon | HWL by SMD",
  description:
    "Contact Shannon about a session, retreat, or question, or choose from her live booking availability.",
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
              subtitle="For appointments, choose a live time. For a retreat, question, or personal note, write to Shannon directly."
              title="Send a note"
            />
            {notice === "connection" ? (
              <p
                className="mt-6 rounded-lg border border-[var(--accent)]/30 bg-white/55 px-5 py-4 text-sm leading-relaxed text-[var(--primary)]"
                role="status"
              >
                For now, reach Shannon directly by email or choose from her live
                availability.
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
              Other ways to connect
            </h2>
            <div className="mt-6 grid gap-4 text-sm text-[var(--muted-foreground)]">
              <a
                className="flex items-center gap-3 hover:text-[var(--accent)]"
                href={`mailto:${SITE_CONFIG.email}`}
              >
                <Mail aria-hidden="true" className="size-4" />
                {SITE_CONFIG.email}
              </a>
              <a
                className="flex items-center gap-3 hover:text-[var(--accent)]"
                href={`tel:${SITE_CONFIG.phone.replace(/\D/g, "")}`}
              >
                <Phone aria-hidden="true" className="size-4" />
                {SITE_CONFIG.phone}
              </a>
              <Link
                className="flex items-center gap-3 hover:text-[var(--accent)]"
                href={SITE_CONFIG.instagramPersonalUrl}
              >
                <AtSign aria-hidden="true" className="size-4" />
                {SITE_CONFIG.instagramPersonal}
              </Link>
              <Link
                className="flex items-center gap-3 hover:text-[var(--accent)]"
                href={SITE_CONFIG.instagramBrandUrl}
              >
                <AtSign aria-hidden="true" className="size-4" />
                {SITE_CONFIG.instagramBrand}
              </Link>
              <p className="flex items-center gap-3">
                <MapPin aria-hidden="true" className="size-4" />
                {SITE_CONFIG.location}
              </p>
            </div>
          </Card>
        </div>
      </PageSection>
    </>
  )
}
