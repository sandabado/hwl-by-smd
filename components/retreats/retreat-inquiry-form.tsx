"use client"

import { useState, type FormEvent } from "react"

import {
  inquiryReceiptMessage,
  useInquirySubmission,
} from "@/components/shared/use-inquiry-submission"
import { InquiryCollectionPaused } from "@/components/shared/inquiry-collection-paused"
import { InquiryPrivacyNotice } from "@/components/shared/inquiry-privacy-notice"
import { Button } from "@/components/ui/button"
import { SITE_CONFIG } from "@/lib/constants"
import { isInquiryCollectionReady } from "@/lib/inquiries/readiness"
import { cn } from "@/lib/utils"

type SubmissionStatus = "error" | "idle" | "sending" | "sent"

const interests = [
  "Beauty + facial ritual",
  "Yoga + movement",
  "Sound bath",
  "Tarot + reflection",
  "Reiki aromatherapy",
  "Not sure yet",
] as const

const fieldClassName =
  "min-h-11 w-full rounded-xl border border-[var(--border)] bg-white/82 px-4 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-foreground)]/65 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"

const labelClassName =
  "grid gap-1.5 text-xs font-medium tracking-[0.02em] text-[var(--primary)]"

export function RetreatInquiryForm() {
  const [datePreference, setDatePreference] = useState<"flexible" | "specific">(
    "flexible"
  )
  const [status, setStatus] = useState<SubmissionStatus>("idle")
  const [feedback, setFeedback] = useState("")
  const submitInquiry = useInquirySubmission()

  if (!isInquiryCollectionReady()) {
    return (
      <InquiryCollectionPaused
        actionHref={`mailto:${SITE_CONFIG.email}?subject=Retreat%20with%20HWL`}
        actionLabel="Email Shannon about a retreat"
        className="rounded-[1.75rem] border-white/65 p-6 shadow-[0_24px_80px_rgba(61,47,37,0.11)] backdrop-blur-md sm:p-8"
        description="Share the place, approximate dates, group size, and what you hope the gathering will feel like. Shannon will reply personally."
        showBookingLink={false}
        title="Begin the retreat conversation."
      />
    )
  }

  function resetFeedback() {
    if (status === "error" || status === "sent") {
      setStatus("idle")
      setFeedback("")
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("sending")
    setFeedback("")

    const form = event.currentTarget
    const formData = new FormData(form)
    const selectedInterests = formData
      .getAll("interests")
      .map(String)
      .filter(Boolean)

    const values = Object.fromEntries(formData.entries())

    if (datePreference === "specific" && !values.preferredDate) {
      setStatus("error")
      setFeedback("Add a preferred date or choose “My timing is flexible.”")
      return
    }

    try {
      const receipt = await submitInquiry(
        {
          ...values,
          preferredDate:
            datePreference === "flexible"
              ? "Flexible — no date selected"
              : String(values.preferredDate),
          interests:
            selectedInterests.length > 0
              ? selectedInterests.join(", ")
              : "Open to Shannon’s guidance",
          source: "retreat-partnership-inquiry",
        },
        "Your inquiry could not be sent."
      )

      form.reset()
      setDatePreference("flexible")
      setStatus("sent")
      setFeedback(
        inquiryReceiptMessage(
          receipt,
          "Your retreat inquiry is safely recorded, and Shannon’s email provider accepted the private alert. No date is reserved yet; she’ll reply to talk through fit, timing, and next steps."
        )
      )
    } catch (error) {
      setStatus("error")
      setFeedback(
        error instanceof Error
          ? error.message
          : "Your inquiry could not be sent. Please try again."
      )
    }
  }

  return (
    <form
      aria-busy={status === "sending"}
      className="rounded-[1.75rem] border border-white/65 bg-white/72 p-5 shadow-[0_24px_80px_rgba(61,47,37,0.11)] backdrop-blur-md sm:p-7 lg:p-8"
      onChange={resetFeedback}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClassName}>
          Name
          <input
            autoComplete="name"
            className={fieldClassName}
            name="name"
            required
          />
        </label>
        <label className={labelClassName}>
          Email
          <input
            autoComplete="email"
            className={fieldClassName}
            name="email"
            required
            type="email"
          />
        </label>
        <label className={labelClassName}>
          <span>
            Organization or host name{" "}
            <span className="font-normal text-[#594e41]">Optional</span>
          </span>
          <input
            autoComplete="organization"
            className={fieldClassName}
            name="organization"
          />
        </label>
        <label className={labelClassName}>
          Retreat location
          <input
            className={fieldClassName}
            name="location"
            placeholder="City, venue, or area"
            required
          />
        </label>
      </div>

      <fieldset className="mt-5">
        <legend className="text-xs font-medium tracking-[0.02em] text-[var(--primary)]">
          Timing
        </legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <label
            className={cn(
              "cursor-pointer rounded-xl border px-4 py-3 transition focus-within:ring-2 focus-within:ring-[var(--accent)]/20",
              datePreference === "flexible"
                ? "border-[var(--accent)] bg-[var(--accent)]/[0.07]"
                : "border-[var(--border)] bg-white/55 hover:border-[var(--accent)]/55"
            )}
          >
            <input
              checked={datePreference === "flexible"}
              className="sr-only"
              name="datePreference"
              onChange={() => setDatePreference("flexible")}
              type="radio"
              value="Flexible"
            />
            <span className="block text-sm font-medium text-[var(--primary)]">
              My timing is flexible
            </span>
            <span className="mt-0.5 block text-xs text-[#594e41]">
              We’re still shaping the retreat.
            </span>
          </label>
          <label
            className={cn(
              "cursor-pointer rounded-xl border px-4 py-3 transition focus-within:ring-2 focus-within:ring-[var(--accent)]/20",
              datePreference === "specific"
                ? "border-[var(--accent)] bg-[var(--accent)]/[0.07]"
                : "border-[var(--border)] bg-white/55 hover:border-[var(--accent)]/55"
            )}
          >
            <input
              checked={datePreference === "specific"}
              className="sr-only"
              name="datePreference"
              onChange={() => setDatePreference("specific")}
              type="radio"
              value="Preferred date"
            />
            <span className="block text-sm font-medium text-[var(--primary)]">
              I have a preferred date
            </span>
            <span className="mt-0.5 block text-xs text-[#594e41]">
              Share the best date you know today.
            </span>
          </label>
        </div>
      </fieldset>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {datePreference === "specific" ? (
          <label className={labelClassName}>
            Preferred date
            <input
              className={fieldClassName}
              name="preferredDate"
              required
              type="date"
            />
          </label>
        ) : (
          <input
            name="preferredDate"
            type="hidden"
            value="Flexible — no date selected"
          />
        )}
        <label className={labelClassName}>
          Estimated guest count
          <select
            className={fieldClassName}
            defaultValue=""
            name="guestCount"
            required
          >
            <option disabled value="">
              Choose a range
            </option>
            <option value="1–5 guests">1–5 guests</option>
            <option value="6–12 guests">6–12 guests</option>
            <option value="13–20 guests">13–20 guests</option>
            <option value="21–30 guests">21–30 guests</option>
            <option value="31+ guests">31+ guests</option>
            <option value="Guest count not known yet">Not sure yet</option>
          </select>
        </label>
      </div>

      <fieldset className="mt-5">
        <legend className="text-xs font-medium tracking-[0.02em] text-[var(--primary)]">
          Practices you’re considering
          <span className="ml-1 font-normal text-[#594e41]">Optional</span>
        </legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {interests.map((interest) => (
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] bg-white/55 px-3 py-2.5 text-sm text-[var(--primary)] transition hover:border-[var(--accent)]/55 has-checked:border-[var(--accent)] has-checked:bg-[var(--accent)]/[0.07]"
              key={interest}
            >
              <input
                className="size-4 shrink-0 accent-[var(--accent)]"
                name="interests"
                type="checkbox"
                value={interest}
              />
              <span>{interest}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className={cn(labelClassName, "mt-5")}>
        Tell Shannon about the gathering
        <textarea
          className="min-h-28 w-full rounded-xl border border-[var(--border)] bg-white/82 px-4 py-3 text-sm leading-relaxed text-[var(--foreground)] transition outline-none placeholder:text-[var(--muted-foreground)]/65 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          maxLength={5000}
          name="message"
          placeholder="What are you creating, and what would you like guests to feel? Share any schedule, accessibility, venue, or travel details you already know."
          required
        />
      </label>

      <label aria-hidden="true" className="sr-only">
        Website
        <input autoComplete="off" name="website" tabIndex={-1} />
      </label>

      <InquiryPrivacyNotice className="mt-5 text-[#594e41]" />
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          className="min-h-11 w-full rounded-full bg-[var(--primary)] px-7 text-white hover:bg-[var(--accent)] sm:w-auto"
          disabled={status === "sending"}
          type="submit"
        >
          {status === "sending" ? "Sending inquiry…" : "Send retreat inquiry"}
        </Button>
        <p className="text-xs leading-5 text-[#594e41]">
          This begins a conversation. It does not reserve a date.
        </p>
      </div>

      {feedback ? (
        <p
          aria-live="polite"
          className={cn(
            "mt-4 rounded-xl px-4 py-3 text-sm leading-relaxed",
            status === "sent"
              ? "bg-[var(--primary)]/[0.07] text-[var(--primary)]"
              : "bg-red-50 text-red-700"
          )}
          role={status === "error" ? "alert" : "status"}
        >
          {feedback}
        </p>
      ) : null}
    </form>
  )
}
