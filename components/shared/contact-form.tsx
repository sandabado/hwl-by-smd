"use client"

import { useState, type FormEvent } from "react"

import { BreathingButton } from "@/components/shared/breathing-button"

type ContactField = {
  label: string
  name: string
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("sending")
    setFeedback("")

    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form).entries())

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, source }),
      })
      const result = (await response.json()) as { message?: string }

      if (!response.ok) {
        throw new Error(result.message ?? "Your note could not be sent.")
      }

      form.reset()
      setStatus("sent")
      setFeedback("Thank you. Your note is on its way to Shannon.")
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
      className="grid gap-4 rounded-lg border border-[var(--border)] bg-white/55 p-6"
      onSubmit={handleSubmit}
    >
      {fields.map((field) => (
        <label
          className="grid gap-2 text-sm text-[var(--primary)]"
          key={field.name}
        >
          {field.label}
          <input
            className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            name={field.name}
            placeholder={field.placeholder}
            required
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
      <BreathingButton
        breathVariant="primary"
        className="mt-2 rounded-full bg-[var(--primary)] text-white hover:bg-[var(--accent)]"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending…" : submitLabel}
      </BreathingButton>
      {feedback ? (
        <p
          aria-live="polite"
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
