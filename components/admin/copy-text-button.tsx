"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

export function CopyTextButton({
  label,
  text,
}: {
  label: string
  text: string
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle")

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text)
      setStatus("copied")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div>
      <button
        aria-label={`Copy ${label}`}
        className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#d4cdc1] bg-white/50 px-3 text-[10px] font-semibold text-[#6c725f] transition hover:bg-white/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9d8464]"
        onClick={copyText}
        type="button"
      >
        {status === "copied" ? (
          <Check className="size-3.5" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" aria-hidden="true" />
        )}
        {status === "copied" ? "Copied" : `Copy ${label}`}
      </button>
      <span className="sr-only" aria-live="polite">
        {status === "copied"
          ? `${label} copied to clipboard.`
          : status === "error"
            ? `${label} could not be copied.`
            : ""}
      </span>
    </div>
  )
}
