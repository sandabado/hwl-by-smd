import Link from "next/link"
import type { Metadata } from "next"
import { AtSign, Mail, MapPin, Phone } from "lucide-react"

import {
  ContactForm,
  InteriorHero,
  PageSection,
} from "@/components/shared/internal-page"
import { SectionHeading } from "@/components/shared/section-heading"
import { Card } from "@/components/ui/card"
import { SITE_CONFIG } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Contact Shannon | HWL by SMD",
  description:
    "Get in touch to book an experience, plan a retreat, or ask a question. Shannon responds within 48 hours.",
}

export default function ContactPage() {
  return (
    <>
      <InteriorHero
        eyebrow="Contact"
        title="Connect with Shannon"
        subtitle="Questions? Ready to book? Planning a retreat? I'd love to hear from you."
        variant="ritual"
      />

      <PageSection>
        <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Inquiry"
              subtitle="Use the form for bookings, retreat partnerships, collaborations, or simple questions."
              title="Send a note"
            />
            <div className="mt-8">
              <ContactForm
                fields={[
                  { label: "Name", name: "name" },
                  { label: "Email", name: "email", type: "email" },
                  { label: "Phone", name: "phone", type: "tel" },
                  { label: "Subject", name: "subject" },
                ]}
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
    </>
  )
}
