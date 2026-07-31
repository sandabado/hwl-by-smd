"use client"

import { useId, useState } from "react"
import { ArrowRight, CalendarPlus, Check, Copy, Loader2, X } from "lucide-react"

import { cn } from "@/lib/utils"

const services = [
  { label: "Beauty", value: "beauty" },
  { label: "Body", value: "body" },
  { label: "Being", value: "being" },
] as const

const durations = [15, 30, 45, 60, 90, 120] as const

export type ChatBookingCta = {
  durationMinutes: number
  href: string
  kind: "booking"
  label: string
  message: string
  service: (typeof services)[number]["value"]
}

type GeneratorState = "idle" | "generating" | "error" | "ready"

export function ChatCtaGenerator({
  className,
  conversationId,
  endpoint = "/admin/api/conversations/booking-cta",
  onInsert,
}: {
  className?: string
  conversationId: string
  endpoint?: string
  onInsert?: (cta: ChatBookingCta) => void
}) {
  const panelId = useId()
  const [open, setOpen] = useState(false)
  const [service, setService] = useState<ChatBookingCta["service"]>("beauty")
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [message, setMessage] = useState("Want to lock this in?")
  const [cta, setCta] = useState<ChatBookingCta | null>(null)
  const [state, setState] = useState<GeneratorState>("idle")
  const [copied, setCopied] = useState(false)

  function resetGeneratedCta() {
    setCta(null)
    setCopied(false)
    setState("idle")
  }

  async function generateCta(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state === "generating") return

    setCopied(false)
    setState("generating")

    const response = await fetch(endpoint, {
      body: JSON.stringify({
        conversationId,
        durationMinutes,
        message,
        service,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })

    if (!response.ok) {
      setState("error")
      return
    }

    const result = (await response.json()) as { cta: ChatBookingCta }
    setCta(result.cta)
    setState("ready")
  }

  async function copyCta() {
    if (!cta) return

    try {
      await navigator.clipboard.writeText(
        `${cta.message}\n${cta.label}: ${new URL(cta.href, window.location.origin)}`
      )
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  function insertCta() {
    if (!cta || !onInsert) return
    onInsert(cta)
    setOpen(false)
  }

  return (
    <div className={cn("relative inline-flex", className)}>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-[#d4cdc1] bg-white/65 px-3 py-2 text-xs font-medium text-[#59645b] transition hover:-translate-y-0.5 hover:border-[#b7a58b] hover:text-[#273029] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9d8464]"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <CalendarPlus className="size-3.5" aria-hidden="true" />
        Add booking link
      </button>

      {open ? (
        <section
          aria-label="Create a booking card"
          className="absolute bottom-[calc(100%+0.75rem)] left-0 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-[1.5rem] border border-[#d8d0c4] bg-[#fbf8f2] p-5 text-left shadow-[0_24px_80px_rgba(39,48,41,0.18)]"
          id={panelId}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false)
          }}
          role="dialog"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[#9d8464] uppercase">
                Booking from conversation
              </p>
              <h2 className="mt-1 font-serif text-2xl text-[#273029]">
                Offer a gentle next step
              </h2>
            </div>
            <button
              aria-label="Close booking link picker"
              className="grid size-8 shrink-0 place-items-center rounded-full text-[#727b73] transition hover:bg-[#273029]/7 hover:text-[#273029]"
              onClick={() => setOpen(false)}
              type="button"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <form className="mt-5 space-y-4" onSubmit={generateCta}>
            <label className="block text-xs font-medium text-[#5b655c]">
              Service
              <select
                className="mt-2 h-10 w-full rounded-xl border border-[#d7d0c5] bg-white/80 px-3 text-sm text-[#354039] outline-none focus:border-[#9d8464] focus:ring-2 focus:ring-[#9d8464]/20"
                onChange={(event) => {
                  setService(event.target.value as ChatBookingCta["service"])
                  resetGeneratedCta()
                }}
                value={service}
              >
                {services.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-medium text-[#5b655c]">
              Duration
              <select
                className="mt-2 h-10 w-full rounded-xl border border-[#d7d0c5] bg-white/80 px-3 text-sm text-[#354039] outline-none focus:border-[#9d8464] focus:ring-2 focus:ring-[#9d8464]/20"
                onChange={(event) => {
                  setDurationMinutes(Number(event.target.value))
                  resetGeneratedCta()
                }}
                value={durationMinutes}
              >
                {durations.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration} minutes
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-medium text-[#5b655c]">
              Invitation
              <textarea
                className="mt-2 min-h-20 w-full resize-y rounded-xl border border-[#d7d0c5] bg-white/80 px-3 py-2 text-sm leading-6 text-[#354039] outline-none focus:border-[#9d8464] focus:ring-2 focus:ring-[#9d8464]/20"
                maxLength={500}
                onChange={(event) => {
                  setMessage(event.target.value)
                  resetGeneratedCta()
                }}
                value={message}
              />
            </label>

            <button
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-[#273029] px-4 text-xs font-medium text-white transition hover:bg-[#9d8464] disabled:cursor-not-allowed disabled:opacity-55"
              disabled={
                state === "generating" || !message.trim() || !conversationId
              }
              type="submit"
            >
              {state === "generating" ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <CalendarPlus className="size-3.5" aria-hidden="true" />
              )}
              Generate booking card
            </button>
          </form>

          {state === "error" ? (
            <p className="mt-4 text-xs leading-5 text-[#9b4e47]" role="alert">
              The booking card could not be prepared. Please try again.
            </p>
          ) : null}

          {cta ? (
            <div className="mt-5 rounded-[1.25rem] border border-[#d9cdbb] bg-white/75 p-4">
              <p className="text-sm leading-6 text-[#4e594f]">{cta.message}</p>
              <a
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#9d8464] px-4 py-2 text-xs font-medium text-white"
                href={cta.href}
              >
                {cta.label}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </a>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#d4cdc1] px-3 py-2 text-[11px] font-medium text-[#59645b]"
                  onClick={copyCta}
                  type="button"
                >
                  {copied ? (
                    <Check className="size-3" aria-hidden="true" />
                  ) : (
                    <Copy className="size-3" aria-hidden="true" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
                {onInsert ? (
                  <button
                    className="rounded-full bg-[#273029] px-3 py-2 text-[11px] font-medium text-white"
                    onClick={insertCta}
                    type="button"
                  >
                    Insert into reply
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
