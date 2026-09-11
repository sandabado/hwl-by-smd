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
      "We collect information you choose to provide when you create an account, purchase LIFT, request an appointment through Cal.com, submit a website inquiry, or contact HWL by SMD for support.",
    ],
    items: [
      "Account details such as your name, email address, and sign-in identifiers.",
      "LIFT purchase, course-progress, and protected-content access records. Complete card details are handled by Stripe and are not stored by HWL by SMD.",
      "Booking details such as the service, requested date and time, contact information, location choice, booking status, and any preparation or accessibility notes you choose to share.",
      "Inquiry details such as your contact information, subject, and message.",
      "Basic technical records needed for security, reliability, and fraud prevention.",
    ],
  },
  {
    title: "How information is used",
    body: [
      "Information is used to authenticate accounts, complete and deliver LIFT purchases, protect private content, coordinate appointments, respond to inquiries, provide support, prevent abuse, maintain required business records, and operate the site.",
      "HWL by SMD does not sell personal information or use inquiry and booking details to build advertising profiles.",
    ],
  },
  {
    title: "Booking, inquiry, and care details",
    body: [
      "Booking and inquiry fields may include personal wellness, accessibility, location, or preparation details. Share only what Shannon reasonably needs to understand the request and prepare for the service.",
      "Website inquiries and booking notes are not clinical records, are not monitored continuously, and must not be used for urgent or emergency help. Access is limited to authorized administration and the providers needed to process the request.",
    ],
  },
  {
    title: "Service providers",
    body: [
      "Supabase supports account authentication, application data, booking and inquiry records, and protected LIFT media. Stripe processes the one-time LIFT purchase and any payment Shannon arranges after a completed appointment. Cal.com processes appointment scheduling details and its booking messages. Resend delivers transactional account, purchase, inquiry, and other service email sent directly by this site. The hosting provider processes ordinary technical requests needed to serve and secure the site.",
      "Website inquiry content is stored in the restricted private inbox before any optional email alert is attempted. The Resend alert contains an inquiry identifier, source, and protected inbox link—not the visitor’s submitted contact details or message.",
      "Each provider processes information under its own terms and privacy practices. HWL by SMD limits provider use to the functions needed to operate the current service.",
    ],
  },
  {
    title: "Service-area maps and analytics",
    body: [
      "HWL by SMD does not currently load a third-party analytics script.",
      "Location pages load map tiles from OpenStreetMap. As with most externally hosted web resources, the tile service receives ordinary technical request information such as an IP address, browser headers, and the tiles requested. Maps show a general service area rather than a client or studio address.",
    ],
  },
  {
    title: "Service communications",
    body: [
      "HWL by SMD may send account confirmation, security, purchase receipt, protected-access, booking, rescheduling, cancellation, payment, inquiry follow-up, and support messages when needed to provide the service you requested.",
      "Submitting an inquiry or booking request does not add you to a marketing mailing list.",
    ],
  },
  {
    title: "Storage, security, and retention",
    body: [
      "Reasonable administrative and technical safeguards are used, including authenticated access, row-level database policies, signed media links, and restricted administrative permissions. No online system can guarantee absolute security.",
      "Website inquiry content becomes eligible for deletion 12 months after submission and is purged during monthly review. A record may be held beyond that period only while needed for an active service or a legal, safety, or dispute matter. When the reason ends, the hold is removed and the record returns to the next monthly review.",
      "The inquiry abuse-control system stores a keyed fingerprint rather than a raw network address. Fingerprints older than 30 days are removed during the monthly retention process and may also be removed during later valid submissions.",
      "Deletion from active systems does not immediately rewrite encrypted managed backups. A residual backup copy may remain inaccessible to ordinary operations until the provider's verified backup cycle expires.",
      "Other account, purchase, booking, and service records are retained while needed to provide the service, meet financial or legal obligations, or resolve disputes. Data that is no longer needed may be deleted or anonymized.",
    ],
  },
  {
    title: "Your choices and requests",
    body: [
      "You may request access, correction, export, or deletion of personal information, subject to identity verification and records that must be retained for legal, security, or transaction purposes.",
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
      effectiveDate="September 11, 2026"
      introduction="How account, purchase, booking, inquiry, and support information is handled."
      sections={sections}
      title="Privacy with intention."
    />
  )
}
