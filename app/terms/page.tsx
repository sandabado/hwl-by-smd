import { LegalPage, type LegalSection } from "@/components/shared/legal-page"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Terms | HWL by SMD",
  description:
    "Terms for HWL by SMD products, digital content, bookings, and wellness experiences.",
  path: "/terms",
})

const sections: LegalSection[] = [
  {
    title: "Using HWL by SMD",
    body: [
      "By using this site, creating an account, purchasing digital content, or booking an experience, you agree to these terms. If you do not agree, do not use the service.",
      "You are responsible for accurate account information, protecting your sign-in credentials, and activity under your account. Please notify HWL by SMD if you believe access has been compromised.",
    ],
  },
  {
    title: "Services and appropriate use",
    body: [
      "HWL by SMD offers aesthetician services, yoga instruction, Reiki, aromatherapy, tarot and astrology readings, retreat facilitation, digital products, and educational content for general wellness and personal development.",
      "Astrology and tarot are reflective practices offered for entertainment and personal insight. They are not medical, psychological, legal, or financial advice. Wellness services do not diagnose, treat, or replace medical, mental-health, or emergency care.",
      "Consult an appropriate licensed professional before beginning a practice when you have an injury, medical condition, pregnancy, allergy, medication concern, or other reason for caution. Stop any practice that causes pain or concerning symptoms.",
    ],
  },
  {
    id: "digital-products-and-access",
    title: "Digital products and access",
    body: [
      "A LIFT digital purchase gives one person a limited, personal, non-transferable license to use the private guided video and downloadable PDF. You may access the materials on your personal devices, keep a private backup, and make reasonable personal or accessibility copies. Purchase does not transfer ownership of the materials.",
      "You may not share your account or private links; publish, record, upload, redistribute, or resell the purchased materials; copy the recordings, writing, images, or branded materials into a commercial class or service; or remove notices or branding without written permission.",
      "This personal-use license does not limit rights that cannot lawfully be waived. Contact Shannon for written permission before making any use beyond it.",
      "Access depends on a working account and supported device or browser. Reasonable efforts will be made to restore access after a technical interruption.",
    ],
  },
  {
    title: "Payments and cancellations",
    body: [
      "Prices are shown before checkout and payments are processed by Stripe. LIFT is a one-time $11.11 purchase containing the guided video and downloadable PDF; it is not a subscription.",
      "Digital products may be refunded within 14 days of purchase by contacting HWL by SMD.",
    ],
  },
  {
    title: "Bookings and in-person experiences",
    body: [
      "Session scope, location, timing, travel, group size, cancellation terms, and any venue requirements are confirmed during booking. A request is not confirmed until Shannon accepts it. No service payment is collected when you request an appointment; Shannon arranges payment after the completed appointment.",
      "Please give at least 24 hours' notice when canceling a booked service. Late cancellations and no-shows may be charged the full session rate. Any separately agreed deposit and all retreat cancellation, travel, lodging, equipment, and host responsibilities are governed by the individual agreement.",
      "You agree to disclose relevant safety information and follow reasonable instructions. HWL by SMD may adapt or stop an experience when continued participation appears unsafe.",
    ],
  },
  {
    title: "Connection Hub and Journeys",
    body: [
      "The Connection Hub supports human-paced guidance and private conversation. It is not monitored continuously and must not be used for urgent or emergency help.",
      "Members may change frequency, pause a Journey, or opt out of optional guidance. Abusive, threatening, unlawful, or harassing messages may result in conversation limits or account suspension.",
    ],
  },
  {
    title: "Intellectual property",
    body: [
      "Unless otherwise stated, original content owned by Shannon Mary Dixon is protected by applicable intellectual-property law. No ownership transfers through a purchase.",
      "Third-party materials remain the property of their respective owners and are used under license, permission, or applicable law.",
      "HWL by SMD™ and LIFT™ are marks used in connection with Shannon's offerings. The ™ symbol does not indicate federal registration.",
    ],
  },
  {
    title: "Availability and responsibility",
    body: [
      "Services may change, pause, or be discontinued as the practice evolves. To the fullest extent permitted by law, the service is provided without guarantees of a particular wellness, beauty, business, or personal outcome.",
      "HWL by SMD is not responsible for indirect or consequential loss arising from use of the site or voluntary participation in a practice, except where that limitation is not permitted by law.",
    ],
  },
  {
    title: "Changes and applicable law",
    body: [
      "These terms may be updated as products and services change. Continued use after an update means you accept the revised terms. Applicable law and any non-waivable consumer protections remain in effect.",
    ],
  },
]

export default function Page() {
  return (
    <LegalPage
      effectiveDate="September 7, 2026"
      eyebrow="Terms"
      introduction="A clear foundation for digital rituals, conversations, and booked experiences."
      sections={sections}
      title="Terms, in plain language."
    />
  )
}
