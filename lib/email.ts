import "server-only"

import { emailHtmlToText, renderBrandedEmail } from "@/lib/email-branding"

type EmailTemplate = "welcome" | "purchase_confirmation" | "session_reminder"

const subjects: Record<EmailTemplate, string> = {
  purchase_confirmation: "Your HWL ritual is ready",
  session_reminder: "A gentle reminder for your upcoming session",
  welcome: "Welcome to The Den",
}

const presentation: Record<
  EmailTemplate,
  { eyebrow: string; heading: string; preheader: string }
> = {
  purchase_confirmation: {
    eyebrow: "Your LIFT ritual",
    heading: "Your ritual is ready.",
    preheader: "Your HWL ritual is ready to open.",
  },
  session_reminder: {
    eyebrow: "Your session",
    heading: "A gentle reminder.",
    preheader: "A gentle reminder for your upcoming session with Shannon.",
  },
  welcome: {
    eyebrow: "Welcome",
    heading: "Welcome to The Den.",
    preheader: "A warm welcome from Shannon and HWL by SMD.",
  },
}

export async function sendTransactionalEmail({
  html,
  template,
  to,
}: {
  html: string
  template: EmailTemplate
  to: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { skipped: true }

  const branded = renderBrandedEmail({
    bodyHtml: html,
    bodyText: emailHtmlToText(html),
    ...presentation[template],
  })

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? "HWL by SMD <hello@hwlbysmd.com>",
      html: branded.html,
      subject: subjects[template],
      text: branded.text,
      to,
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  })

  if (!response.ok) {
    throw new Error("Transactional email delivery failed.")
  }

  return { skipped: false }
}
