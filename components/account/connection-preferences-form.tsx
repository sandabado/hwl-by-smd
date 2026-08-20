"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
export type ConnectionPreferences = {
  bookingInvites: boolean
}

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
    <form
      aria-busy={status === "saving"}
      className="space-y-6"
      onSubmit={savePreferences}
    >
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
