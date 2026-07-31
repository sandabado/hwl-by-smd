"use client"

import { useState } from "react"
import { Loader2, Pause, Play } from "lucide-react"

type JourneyState = "active" | "paused" | "pending"

export function JourneyPauseControl({
  journeyId,
  initialStatus,
}: {
  journeyId: string
  initialStatus: JourneyState
}) {
  const [status, setStatus] = useState<JourneyState>(initialStatus)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)
  const paused = status === "paused"

  async function updatePacing() {
    setSaving(true)
    setError(false)

    const response = await fetch(`/api/journeys/${journeyId}/pause`, {
      body: JSON.stringify({ paused: !paused }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })

    if (response.ok) {
      const result = (await response.json()) as {
        enrollment?: { status?: JourneyState }
      }
      setStatus(result.enrollment?.status ?? (paused ? "active" : "paused"))
    } else {
      setError(true)
    }

    setSaving(false)
  }

  return (
    <div className="text-right">
      <button
        className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 text-xs font-medium text-white transition hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={saving}
        onClick={updatePacing}
        type="button"
      >
        {saving ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        ) : paused ? (
          <Play className="size-3.5" aria-hidden="true" />
        ) : (
          <Pause className="size-3.5" aria-hidden="true" />
        )}
        {paused ? "Resume" : "Pause"}
      </button>
      {error ? (
        <p className="mt-2 text-[10px] text-[#f1c2ba]" role="alert">
          Your pacing could not be changed just yet.
        </p>
      ) : null}
    </div>
  )
}
