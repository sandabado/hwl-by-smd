import { LegalPage, type LegalSection } from "@/components/shared/legal-page"
import { SITE_CONFIG } from "@/lib/constants"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Refund Policy | HWL by SMD",
  description:
    "Refund and cancellation terms for the HWL by SMD LIFT purchase, appointments, and retreats.",
  path: "/refund-policy",
})

const sections: LegalSection[] = [
  {
    title: "LIFT digital purchase",
    body: [
      `LIFT includes the guided video and downloadable PDF in one $11.11 purchase. You may request a refund within 14 days of purchase by emailing ${SITE_CONFIG.email} from the address used for checkout.`,
      "When a full refund is issued, access to the LIFT video and PDF is removed. If a partial refund is separately agreed, LIFT access remains unless the written agreement says otherwise.",
    ],
  },
  {
    title: "Appointment cancellations",
    body: [
      "No appointment payment is collected when you request or confirm a time, so an ordinary cancellation does not create a refund. Please give at least 24 hours' notice if you need to cancel or reschedule.",
      "A late-cancellation or no-show charge may apply only when that term was disclosed in the booking confirmation or separately agreed. If Shannon accepted a separate deposit or advance payment for a custom arrangement, its written terms determine whether it is refundable.",
    ],
  },
  {
    title: "Completed services",
    body: [
      "Shannon arranges payment after the appointment is complete. If you have a concern about a completed service or its payment request, contact HWL by SMD promptly so it can be reviewed directly and in light of any rights that apply.",
    ],
  },
  {
    title: "Retreat partnerships",
    body: [
      "Retreat cancellation terms vary by contract. The terms in the signed retreat agreement govern deposits, travel, lodging, rescheduling, and cancellation.",
    ],
  },
  {
    title: "Applicable rights",
    body: [
      "This policy explains the current HWL by SMD approach in plain language. It does not limit any consumer rights or remedies that cannot be waived under applicable law.",
    ],
  },
]

export default function RefundPolicyPage() {
  return (
    <LegalPage
      effectiveDate="September 11, 2026"
      eyebrow="Refund Policy"
      introduction="Clear terms for the LIFT purchase, appointments, and retreat partnerships."
      sections={sections}
      title="Refunds and cancellations."
    />
  )
}
