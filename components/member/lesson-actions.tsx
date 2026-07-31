"use client"

import { useState } from "react"
import { Check, LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

export function MarkCompleteButton({
  initiallyComplete,
  lessonId,
}: {
  initiallyComplete: boolean
  lessonId: string
}) {
  const [complete, setComplete] = useState(initiallyComplete)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")

  async function toggle() {
    setPending(true)
    setError("")
    const response = await fetch("/api/progress", {
      body: JSON.stringify({ completed: !complete, lessonId }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })
    const data = (await response.json()) as { error?: string }
    setPending(false)
    if (response.ok) setComplete(!complete)
    else setError(data.error ?? "Progress could not be saved.")
  }

  return (
    <div>
      <Button
        className={
          complete
            ? "h-11 rounded-full border-[#52694d]/30 bg-[#52694d]/10 px-6 text-[#52694d] hover:bg-[#52694d]/15"
            : "h-11 rounded-full bg-[var(--primary)] px-6 text-white hover:bg-[var(--accent)]"
        }
        disabled={pending}
        onClick={toggle}
        variant={complete ? "outline" : "default"}
      >
        {pending ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : (
          <Check aria-hidden="true" />
        )}
        {complete ? "Completed" : "Mark as Complete"}
      </Button>
      {error && <p className="mt-2 text-xs text-[#9c4b40]">{error}</p>}
    </div>
  )
}
