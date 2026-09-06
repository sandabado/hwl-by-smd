"use client"

import { useState, type FormEvent } from "react"

import { BreathingButton } from "@/components/shared/breathing-button"
import { InquiryCollectionPaused } from "@/components/shared/inquiry-collection-paused"
import { InquiryPrivacyNotice } from "@/components/shared/inquiry-privacy-notice"
import {
  inquiryReceiptMessage,
  useInquirySubmission,
} from "@/components/shared/use-inquiry-submission"
import { isInquiryCollectionReady } from "@/lib/inquiries/readiness"

type ContactField = {
  label: string
  name: string
  required?: boolean
  type?: string
  placeholder?: string
}

export function ContactForm({
  fields,
  messageLabel = "Message",
  source = "general-inquiry",
  submitLabel = "Send Inquiry",
}: {
  fields: ContactField[]
  messageLabel?: string
  source?: string
  submitLabel?: string
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  )
  const [feedback, setFeedback] = useState("")
  const submitInquiry = useInquirySubmission()

  if (!isInquiryCollectionReady()) {
    return (
      <InquiryCollectionPaused
        description="Shannon’s private website inbox will open after its privacy operations are finalized. Published appointment times remain available now."
        title="The online contact form is paused."
      />
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("sending")
    setFeedback("")

    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form).entries())

    try {
      const receipt = await submitInquiry(
        { ...values, source },
        "Your note could not be sent."
      )

      form.reset()
      setStatus("sent")
      setFeedback(
        inquiryReceiptMessage(
          receipt,
          "Thank you. Shannon’s email provider accepted the private alert."
        )
      )
    } catch (error) {
      setStatus("error")
      setFeedback(
        error instanceof Error
          ? error.message
          : "Your note could not be sent. Please try again."
      )
    }
  }

  return (
    <form
      aria-busy={status === "sending"}
      className="grid gap-4 rounded-lg border border-[var(--border)] bg-white/55 p-6"
      onSubmit={handleSubmit}
    >
      {fields.map((field) => (
        <label
          className="grid gap-2 text-sm text-[var(--primary)]"
          key={field.name}
        >
          <span>
            {field.label}
            {field.required ? null : (
              <span className="ml-1 font-normal text-[var(--muted-foreground)]">
                (optional)
              </span>
            )}
          </span>
          <input
            className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            name={field.name}
            placeholder={field.placeholder}
            required={field.required ?? false}
            type={field.type ?? "text"}
          />
        </label>
      ))}
      <label className="sr-only" aria-hidden="true">
        Website
        <input autoComplete="off" name="website" tabIndex={-1} />
      </label>
      <label className="grid gap-2 text-sm text-[var(--primary)]">
        {messageLabel}
        <textarea
          className="min-h-36 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          name="message"
          required
        />
      </label>
      <InquiryPrivacyNotice />
      <BreathingButton
        breathVariant="primary"
        className="mt-2 rounded-full bg-[var(--primary)] text-white hover:bg-[var(--accent)]"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending…" : submitLabel}
      </BreathingButton>
      {feedback ? (
        <p
          role={status === "error" ? "alert" : "status"}
          className={
            status === "sent"
              ? "text-sm text-[var(--primary)]"
              : "text-sm text-red-700"
          }
        >
          {feedback}
        </p>
      ) : null}
    </form>
  )
}
