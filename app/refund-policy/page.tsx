import { LegalPage, type LegalSection } from "@/components/shared/legal-page"
import { SITE_CONFIG } from "@/lib/constants"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Refund Policy | HWL by SMD",
  description:
    "Refund and cancellation terms for HWL by SMD digital products, services, and retreats.",
  path: "/refund-policy",
})

const sections: LegalSection[] = [
  {
    title: "Digital products",
    body: [
      `LIFT includes the guided video and downloadable PDF in one purchase. It may be refunded within 14 days of purchase. Contact ${SITE_CONFIG.email} with the email used for checkout.`,
    ],
  },
  {
    title: "Booked services",
    body: [
      "Cancel at least 24 hours before a scheduled service to receive a full refund. No-shows may be charged the full session rate.",
    ],
  },
  {
    title: "Retreat partnerships",
    body: [
      "Retreat cancellation terms vary by contract. The terms in the signed retreat agreement govern deposits, travel, lodging, rescheduling, and cancellation.",
    ],
  },
]

export default function RefundPolicyPage() {
  return (
    <LegalPage
      effectiveDate="August 20, 2026"
      eyebrow="Refund Policy"
      introduction="Clear terms for digital purchases, sessions, and retreat partnerships."
      sections={sections}
      title="Refunds and cancellations."
    />
  )
}
