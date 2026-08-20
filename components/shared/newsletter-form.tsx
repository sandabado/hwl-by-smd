"use client"

import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"

export function NewsletterForm() {
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
        body: JSON.stringify({
          ...values,
          source: "journal-newsletter",
          message: "Please add me to the HWL by SMD journal list.",
        }),
      })
      const result = (await response.json()) as { message?: string }

      if (!response.ok) {
        throw new Error(result.message ?? "Your request could not be sent.")
      }

      form.reset()
      setStatus("sent")
      setFeedback(
        "Shannon received your request for journal updates. She’ll follow up when new notes are ready."
      )
    } catch (error) {
      setStatus("error")
      setFeedback(
        error instanceof Error
          ? error.message
          : "Your request could not be sent."
      )
    }
  }

  return (
    <form
      aria-busy={status === "sending"}
      className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row sm:flex-wrap"
      onSubmit={handleSubmit}
    >
      <label className="sr-only" htmlFor="journal-email">
        Email address
      </label>
      <input
        className="min-h-11 flex-1 rounded-full border border-[var(--border)] bg-white/70 px-5 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
        id="journal-email"
        name="email"
        placeholder="Your email address"
        required
        type="email"
      />
      <label aria-hidden="true" className="sr-only">
        Website
        <input autoComplete="off" name="website" tabIndex={-1} />
      </label>
      <Button
        className="min-h-11 rounded-full bg-[var(--primary)] px-6 text-white hover:bg-[var(--accent)]"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending…" : "Request journal updates"}
      </Button>
      <p className="text-xs leading-relaxed text-[var(--muted-foreground)] sm:basis-full">
        This sends a private request to Shannon. It does not subscribe you to
        automated marketing. See the{" "}
        <a className="underline underline-offset-2" href="/privacy">
          privacy policy
        </a>
        .
      </p>
      {feedback ? (
        <p
          role={status === "error" ? "alert" : "status"}
          className="text-sm text-[var(--muted-foreground)] sm:basis-full"
        >
          {feedback}
        </p>
      ) : null}
    </form>
  )
}
