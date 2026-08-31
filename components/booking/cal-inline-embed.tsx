"use client"

import Cal, { getCalApi } from "@calcom/embed-react"
import { ExternalLink } from "lucide-react"
import { useEffect, useId, useMemo, useState } from "react"

import { cn } from "@/lib/utils"

const CAL_EMBED_CONFIG = {
  layout: "week_view",
  theme: "light",
  "ui.color-scheme": "light",
} as const

const CAL_UI_CONFIG = {
  theme: "light",
  layout: "week_view",
  hideEventTypeDetails: true,
  styles: {
    body: { background: "#faf7f2" },
    eventTypeListItem: {
      background: "#fffaf4",
      color: "#2b2724",
    },
    availabilityDatePicker: { background: "#faf7f2" },
    branding: { brandColor: "#765538" },
  },
} as const

type EmbedStatus = "error" | "loading" | "ready"
const EMBED_READY_TIMEOUT_MS = 12_000

export interface CalInlineEmbedProps {
  calLink: string
  serviceTitle: string
  className?: string
}

function normalizeCalLink(calLink: string) {
  return calLink
    .trim()
    .replace(/^https?:\/\/(?:app\.)?cal\.com\//i, "")
    .split(/[?#]/, 1)[0]
    .replace(/^\/+|\/+$/g, "")
}

function canonicalCalUrl(calLink: string) {
  const encodedPath = calLink
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/")

  return `https://cal.com/${encodedPath}`
}

function CalEmbedInstance({
  calLink,
  serviceTitle,
  className,
}: CalInlineEmbedProps) {
  const reactId = useId()
  const [status, setStatus] = useState<EmbedStatus>("loading")
  const namespace = useMemo(() => {
    const safeId = reactId.replace(/[^a-z0-9]/gi, "")
    const safeLink = calLink.replace(/[^a-z0-9]/gi, "-").slice(0, 48)

    return `hwl-${safeLink}-${safeId}`
  }, [calLink, reactId])
  const headingId = `${namespace}-heading`
  const descriptionId = `${namespace}-description`
  const iframeId = `${namespace}-iframe`
  const iframeTitle = `Choose a date and time for ${serviceTitle}`
  const embedConfig = useMemo(
    () => ({
      ...CAL_EMBED_CONFIG,
      iframeAttrs: {
        id: iframeId,
      },
    }),
    [iframeId]
  )
  const externalUrl = canonicalCalUrl(calLink)

  useEffect(() => {
    let active = true
    let api: Awaited<ReturnType<typeof getCalApi>> | undefined

    const handleReady = () => {
      if (!active) return

      window.clearTimeout(readyTimeout)

      const iframe = document.getElementById(iframeId)
      if (iframe instanceof HTMLIFrameElement) iframe.title = iframeTitle

      setStatus("ready")
    }
    const handleFailure = () => {
      if (!active) return

      window.clearTimeout(readyTimeout)
      setStatus("error")
    }

    const readyTimeout = window.setTimeout(
      handleFailure,
      EMBED_READY_TIMEOUT_MS
    )

    void getCalApi({ namespace })
      .then((calApi) => {
        if (!active) return

        api = calApi
        calApi("on", { action: "linkReady", callback: handleReady })
        calApi("on", { action: "linkFailed", callback: handleFailure })
        calApi("ui", CAL_UI_CONFIG)
      })
      .catch(handleFailure)

    return () => {
      active = false
      window.clearTimeout(readyTimeout)
      api?.("off", { action: "linkReady", callback: handleReady })
      api?.("off", { action: "linkFailed", callback: handleFailure })
    }
  }, [iframeId, iframeTitle, namespace])

  return (
    <section
      aria-busy={status === "loading"}
      aria-describedby={descriptionId}
      aria-labelledby={headingId}
      className={cn(
        "overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[#faf7f2] shadow-[0_24px_70px_rgba(43,39,36,0.08)]",
        className
      )}
    >
      <div className="border-b border-[var(--border)] px-5 py-4 sm:px-7">
        <h4 className="font-serif text-xl text-[var(--primary)]" id={headingId}>
          Available dates and times
        </h4>
        <p
          className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]"
          id={descriptionId}
        >
          Choose an available time for {serviceTitle}. Times remain visible in
          your local timezone.
        </p>
      </div>

      <div
        className={cn(
          "relative",
          status === "error"
            ? "min-h-40"
            : "min-h-[42rem] sm:min-h-[46rem] lg:min-h-[44rem]"
        )}
      >
        {status === "loading" ? (
          <div
            aria-live="polite"
            className="absolute inset-x-0 top-0 z-10 flex min-h-32 items-center justify-center bg-[#faf7f2]/92 px-6 text-center backdrop-blur-sm"
            role="status"
          >
            <div>
              <span
                aria-hidden="true"
                className="mx-auto block size-7 animate-pulse rounded-full border border-[var(--accent)] bg-[var(--accent)]/12 motion-reduce:animate-none"
              />
              <span className="mt-3 block text-sm text-[var(--muted-foreground)]">
                Gathering Shannon&apos;s available times…
              </span>
            </div>
          </div>
        ) : null}

        {status === "error" ? (
          <div
            aria-live="polite"
            className="grid min-h-40 place-items-center px-6 text-center"
            role="status"
          >
            <div className="max-w-md">
              <p className="text-sm font-medium text-[var(--primary)]">
                The live calendar could not load here.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                Send Shannon a booking request below, or open Cal.com in a new
                tab to check the current availability.
              </p>
            </div>
          </div>
        ) : (
          <Cal
            calLink={calLink}
            className="min-h-[42rem] w-full sm:min-h-[46rem] lg:min-h-[44rem]"
            config={embedConfig}
            key={calLink}
            namespace={namespace}
          />
        )}
      </div>

      <div className="flex justify-end border-t border-[var(--border)] px-5 py-4 sm:px-7">
        <a
          aria-label={`Open ${serviceTitle} scheduling in Cal.com in a new tab`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] underline-offset-4 transition-colors hover:text-[var(--primary)] hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          href={externalUrl}
          rel="noreferrer"
          target="_blank"
        >
          Open in Cal.com
          <ExternalLink aria-hidden="true" className="size-4" />
        </a>
      </div>
    </section>
  )
}

export function CalInlineEmbed({
  calLink,
  serviceTitle,
  className,
}: CalInlineEmbedProps) {
  const normalizedCalLink = normalizeCalLink(calLink)

  if (!normalizedCalLink) {
    return (
      <p
        className={cn(
          "rounded-2xl border border-[var(--border)] bg-[#faf7f2] p-6 text-sm text-[var(--muted-foreground)]",
          className
        )}
        role="status"
      >
        Scheduling is temporarily unavailable for {serviceTitle}.
      </p>
    )
  }

  return (
    <CalEmbedInstance
      calLink={normalizedCalLink}
      className={className}
      key={normalizedCalLink}
      serviceTitle={serviceTitle}
    />
  )
}
