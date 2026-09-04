import "server-only"

type EmailTemplate = "welcome" | "purchase_confirmation" | "session_reminder"

const subjects: Record<EmailTemplate, string> = {
  purchase_confirmation: "Your HWL ritual is ready",
  session_reminder: "A gentle reminder for your upcoming session",
  welcome: "Welcome to The Den",
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

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? "HWL by SMD <hello@hwlbysmd.com>",
      html,
      subject: subjects[template],
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
