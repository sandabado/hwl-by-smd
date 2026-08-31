import { LegalPage, type LegalSection } from "@/components/shared/legal-page"
import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Privacy Policy | HWL by SMD",
  description:
    "How HWL by SMD handles account, purchase, booking, and communication information.",
  path: "/privacy",
})

const sections: LegalSection[] = [
  {
    title: "Information we collect",
    body: [
      "We collect information you choose to provide when you create an account, purchase a product, join The Den, request a booking, submit a form, adjust connection preferences, or exchange messages with Shannon.",
    ],
    items: [
      "Account details such as your name, email address, and sign-in identifiers.",
      "Purchase, membership, and booking records. Complete card details are handled by Stripe and are not stored by HWL by SMD.",
      "Course progress and protected-content access records.",
      "Connection Hub messages, Journey enrollment, communication preferences, and any care context you voluntarily share.",
      "Basic technical records needed for security, reliability, and fraud prevention.",
    ],
  },
  {
    title: "How information is used",
    body: [
      "Information is used to deliver purchases and memberships, protect private content, respond to inquiries, coordinate bookings, personalize requested guidance, maintain conversation history, and operate the site.",
      "HWL by SMD does not sell personal information. The Connection Hub is designed for care and continuity, not advertising profiles or automated lead scoring.",
    ],
  },
  {
    title: "Connection Hub and sensitive details",
    body: [
      "Messages may include personal wellness context. Share only what you are comfortable placing in an online account. The Connection Hub is not a clinical record, is not monitored continuously, and should not be used for emergencies.",
      "Private practitioner notes are limited to care context Shannon needs to safely and thoughtfully support a member. Access is restricted to authorized administration.",
      "The relationship system checks member messages for a small, disclosed set of support words such as ‘help,’ ‘struggling,’ ‘urgent,’ and ‘emergency.’ When one is detected, automated Journey messages are paused and Shannon is notified to review the conversation personally. The system does not send an automated reply, and the alert stores the matched word rather than a private message excerpt.",
    ],
  },
  {
    title: "Service providers",
    body: [
      "Trusted providers process information only as needed to operate the service. These may include Supabase for authentication, data storage, and protected media; Stripe for payments; Mux for future protected streaming; Resend for transactional email; Cal.com for scheduling; OpenStreetMap for map tiles; and hosting or monitoring providers.",
      "Website inquiry content is stored in the restricted private inbox before any optional email alert is attempted. The Resend alert contains an inquiry identifier, source, and protected inbox link—not the visitor’s submitted contact details or message.",
      "Each provider processes information under its own terms and security practices. Services are configured to minimize unnecessary access wherever practical.",
    ],
  },
  {
    title: "Service-area maps and future analytics",
    body: [
      "HWL by SMD does not currently load a third-party analytics script. If privacy-respecting aggregate analytics are enabled later, this notice will be updated before collection begins.",
      "Location pages load map tiles from OpenStreetMap. As with most externally hosted web resources, the tile service receives ordinary technical request information such as an IP address, browser headers, and the tiles requested. Maps show a general service area rather than a client or studio address.",
    ],
  },
  {
    title: "Communication choices",
    body: [
      "Members can choose whether guided Journeys may include booking invitations. A Journey can be paused or left without losing unrelated purchases.",
      "Required account, security, billing, and service messages may still be sent when necessary. Optional messages include a clear way to change frequency or opt out.",
    ],
  },
  {
    title: "Storage, security, and retention",
    body: [
      "Reasonable administrative and technical safeguards are used, including authenticated access, row-level database policies, signed media links, and restricted administrative permissions. No online system can guarantee absolute security.",
      "Records are retained while needed to provide the service, comply with financial or legal obligations, resolve disputes, and preserve conversation history requested by members. Data that is no longer needed may be deleted or anonymized.",
    ],
  },
  {
    title: "Your choices and requests",
    body: [
      "You may request access, correction, export, or deletion of personal information, subject to identity verification and records that must be retained for legal, security, or transaction purposes. You may also request that a conversation be archived.",
      "Browser settings can control local storage and cookies, though disabling essential session storage may prevent sign-in or checkout.",
    ],
  },
  {
    title: "Children and changes",
    body: [
      "The services are intended for adults and are not directed to children under 13. This policy may be updated as the platform evolves. Material changes will be posted here with a revised effective date.",
    ],
  },
]

export default function Page() {
  return (
    <LegalPage
      eyebrow="Privacy"
      introduction="How your account, purchases, conversations, and care context are handled."
      sections={sections}
      title="Privacy with intention."
    />
  )
}
