import { LegalPage, type LegalSection } from "@/components/shared/legal-page"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Health Disclaimer | HWL by SMD",
  description:
    "Important health and wellness guidance for HWL by SMD services and educational content.",
  path: "/health-disclaimer",
})

const sections: LegalSection[] = [
  {
    title: "Wellness and beauty practices",
    body: [
      "HWL by SMD offers beauty and wellness practices for personal care and reflection. These services are not medical treatments.",
      "Facial massage, lymphatic drainage, and skincare services are cosmetic and supportive in nature. They are not intended to diagnose, treat, cure, or prevent any medical condition.",
    ],
  },
  {
    title: "Movement, sound, and Reiki",
    body: [
      "Yoga, sound healing, and movement sessions are not substitutes for professional medical or mental-health care. Reiki is a complementary energy practice and not a medical treatment.",
    ],
  },
  {
    title: "Astrology and tarot",
    body: [
      "Astrology and tarot readings are reflective practices offered for entertainment and personal insight. They do not constitute medical, psychological, legal, or financial advice.",
    ],
  },
  {
    title: "Before participating",
    body: [
      "If you have a medical condition, are pregnant, or are under professional care, consult your provider before booking or beginning a practice. Stop any activity that causes pain or concerning symptoms.",
    ],
  },
]

export default function HealthDisclaimerPage() {
  return (
    <LegalPage
      effectiveDate="August 20, 2026"
      eyebrow="Health Disclaimer"
      introduction="Know the scope of each practice and choose support appropriate to your needs."
      sections={sections}
      title="Wellness care, clearly defined."
    />
  )
}
