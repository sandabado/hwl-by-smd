"use client"

import { useState } from "react"
import { Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ConnectionPreferences = {
  bookingInvites: boolean
  guidanceCadence: "daily" | "weekly" | "relevant"
  shareProgress: boolean
}

const cadenceOptions: Array<{
  description: string
  label: string
  value: ConnectionPreferences["guidanceCadence"]
}> = [
  {
    description: "A brief practice or check-in when a Journey is active.",
    label: "Daily rituals",
    value: "daily",
  },
  {
    description: "One thoughtful collection of notes each week.",
    label: "Weekly digest",
    value: "weekly",
  },
  {
    description: "Only personal notes and guidance connected to your care.",
    label: "Only when relevant",
    value: "relevant",
  },
]

export function ConnectionPreferencesForm({
  initialPreferences,
}: {
  initialPreferences: ConnectionPreferences
}) {
  const [preferences, setPreferences] = useState(initialPreferences)
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  )

  async function savePreferences(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("saving")

    const response = await fetch("/api/account/connection-preferences", {
      body: JSON.stringify(preferences),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })

    setStatus(response.ok ? "saved" : "error")
  }

  return (
    <form className="space-y-6" onSubmit={savePreferences}>
      <fieldset className="den-card rounded-[2rem] p-7 md:p-9">
        <legend className="px-2 font-serif text-3xl text-[var(--primary)]">
          How do you want to receive guidance?
        </legend>
        <div className="mt-6 grid gap-3">
          {cadenceOptions.map((option) => {
            const selected = preferences.guidanceCadence === option.value

            return (
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-4 rounded-[1.25rem] border p-5 transition",
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent)]/8"
                    : "border-[var(--border)] bg-white/35 hover:bg-white/60"
                )}
                key={option.value}
              >
                <input
                  checked={selected}
                  className="sr-only"
                  name="guidanceCadence"
                  onChange={() =>
                    setPreferences((current) => ({
                      ...current,
                      guidanceCadence: option.value,
                    }))
                  }
                  type="radio"
                  value={option.value}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border",
                    selected
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                      : "border-[var(--border)]"
                  )}
                >
                  {selected ? <Check className="size-3" /> : null}
                </span>
                <span>
                  <span className="block font-medium text-[var(--primary)]">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-[var(--muted-foreground)]">
                    {option.description}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="den-card rounded-[2rem] p-7 md:p-9">
        <legend className="px-2 font-serif text-3xl text-[var(--primary)]">
          Your boundaries
        </legend>
        <div className="mt-5 divide-y divide-[var(--border)]">
          <label className="flex cursor-pointer items-start justify-between gap-5 py-5">
            <span>
              <span className="block font-medium text-[var(--primary)]">
                Open to booking invitations
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-[var(--muted-foreground)]">
                Shannon may suggest a private check-in when it genuinely
                supports your Journey.
              </span>
            </span>
            <input
              checked={preferences.bookingInvites}
              className="mt-1 size-5 accent-[var(--accent)]"
              onChange={(event) =>
                setPreferences((current) => ({
                  ...current,
                  bookingInvites: event.target.checked,
                }))
              }
              type="checkbox"
            />
          </label>
          <label className="flex cursor-pointer items-start justify-between gap-5 py-5">
            <span>
              <span className="block font-medium text-[var(--primary)]">
                Share progress with Shannon
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-[var(--muted-foreground)]">
                Let practice progress help Shannon personalize her guidance.
                Turn this off for a fully private Journey.
              </span>
            </span>
            <input
              checked={preferences.shareProgress}
              className="mt-1 size-5 accent-[var(--accent)]"
              onChange={(event) =>
                setPreferences((current) => ({
                  ...current,
                  shareProgress: event.target.checked,
                }))
              }
              type="checkbox"
            />
          </label>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <Button
          className="h-11 rounded-full bg-[var(--primary)] px-7 text-white hover:bg-[var(--accent)]"
          disabled={status === "saving"}
          type="submit"
        >
          {status === "saving" ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : null}
          Save preferences
        </Button>
        {status === "saved" ? (
          <p className="text-sm text-[#52694d]" role="status">
            Your preferences are saved.
          </p>
        ) : null}
        {status === "error" ? (
          <p className="text-sm text-red-700" role="alert">
            We couldn&apos;t save that just yet. Please try again.
          </p>
        ) : null}
      </div>
    </form>
  )
}
