import { LegalPage, type LegalSection } from "@/components/shared/legal-page"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Refund Policy | HWL by SMD",
  description:
    "Refund and cancellation terms for HWL by SMD digital products, memberships, services, and retreats.",
  path: "/refund-policy",
})

const sections: LegalSection[] = [
  {
    title: "Digital products",
    body: [
      "LIFT PDF and LIFT Video + PDF purchases may be refunded within 14 days of purchase. Contact shannonmarydixon@gmail.com with the email used for checkout.",
    ],
  },
  {
    title: "The Den membership",
    body: [
      "The Den can be canceled at any time. Partial membership months are not refunded, and access continues through the end of the current billing period.",
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
      eyebrow="Refund Policy"
      introduction="Clear terms for digital purchases, memberships, sessions, and retreat partnerships."
      sections={sections}
      title="Refunds and cancellations."
    />
  )
}
