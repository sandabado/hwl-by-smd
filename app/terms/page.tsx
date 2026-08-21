import { LegalPage, type LegalSection } from "@/components/shared/legal-page"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Terms | HWL by SMD",
  description:
    "Terms for HWL by SMD products, memberships, digital content, bookings, and wellness experiences.",
  path: "/terms",
})

const sections: LegalSection[] = [
  {
    title: "Using HWL by SMD",
    body: [
      "By using this site, creating an account, purchasing digital content, joining The Den, or booking an experience, you agree to these terms. If you do not agree, do not use the service.",
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
    title: "Digital products and access",
    body: [
      "Digital purchases provide a personal, limited, non-transferable license to access the purchased material. Videos, PDFs, course materials, and private links may not be copied, shared, resold, published, recorded, or used to train another service without written permission.",
      "Access depends on a working account and supported device or browser. Reasonable efforts will be made to restore access after a technical interruption.",
    ],
  },
  {
    title: "Payments, memberships, and cancellations",
    body: [
      "Prices are shown before checkout and payments are processed by Stripe. The Den renews monthly until canceled. You can manage or cancel renewal from the secure billing portal; access continues through the paid period unless otherwise stated.",
      "Digital products may be refunded within 14 days of purchase by contacting HWL by SMD. The Den is $11.11 per month and can be canceled at any time. Partial membership months are not refunded; access continues through the current billing period.",
    ],
  },
  {
    title: "Bookings and in-person experiences",
    body: [
      "Session scope, location, timing, travel, group size, payment schedule, cancellation terms, and any venue requirements are confirmed during booking. A request is not confirmed until Shannon accepts it and any required payment is received.",
      "Booked services require at least 24 hours' cancellation notice for a full refund. No-shows may be charged the full session rate. Retreat cancellation, travel, lodging, equipment, and host responsibilities are governed by the individual retreat agreement.",
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
      "The HWL by SMD name, Whole Body OS experience, writing, videos, course structures, graphics, photography, and original materials are protected by applicable intellectual-property laws. No ownership transfers through purchase or membership.",
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
      eyebrow="Terms"
      introduction="A clear foundation for digital rituals, memberships, conversations, and booked experiences."
      sections={sections}
      title="Terms, in plain language."
    />
  )
}
