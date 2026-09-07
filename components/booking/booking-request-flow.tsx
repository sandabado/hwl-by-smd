"use client"

import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
  type MouseEvent,
} from "react"
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  ExternalLink,
} from "lucide-react"
import dynamic from "next/dynamic"

import { InquiryCollectionPaused } from "@/components/shared/inquiry-collection-paused"
import { InquiryPrivacyNotice } from "@/components/shared/inquiry-privacy-notice"
import {
  inquiryReceiptMessage,
  useInquirySubmission,
} from "@/components/shared/use-inquiry-submission"
import { Button } from "@/components/ui/button"
import {
  bookingPillars,
  findBookingService,
  getInitialBookingStep,
  normalizeBookingServiceSlug,
  type BookingPillarId,
  type BookingService,
} from "@/lib/booking-services"
import { getBookingRequestPresentation } from "@/lib/booking-request-presentation"
import { SITE_CONFIG } from "@/lib/constants"
import { isInquiryCollectionReady } from "@/lib/inquiries/readiness"
import { cn } from "@/lib/utils"

const CalInlineEmbed = dynamic(
  () =>
    import("@/components/booking/cal-inline-embed").then(
      (module) => module.CalInlineEmbed
    ),
  {
    loading: () => (
      <p
        className="mt-5 rounded-2xl border border-[var(--border)] bg-[#faf7f2] p-6 text-center text-sm text-[var(--muted-foreground)]"
        role="status"
      >
        Preparing Shannon&apos;s live calendar…
      </p>
    ),
    ssr: false,
  }
)

type BookingStep = "experience" | "schedule"
type SubmissionStatus = "error" | "idle" | "sending" | "sent"

class CalendarEmbedBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <p
          className="mt-5 rounded-2xl border border-[var(--border)] bg-[#faf7f2] p-6 text-center text-sm leading-relaxed text-[var(--muted-foreground)]"
          role="status"
        >
          The embedded calendar could not open here. Use the secure Cal.com link
          above to continue in a new tab.
        </p>
      )
    }

    return this.props.children
  }
}

const pillarLabels: Record<BookingPillarId, string> = {
  beauty: "Beauty",
  movement: "Yoga + Sound",
  ritual: "Tarot + Reiki",
}

const availabilityLabels: Record<BookingPillarId, string> = {
  beauty: "Beauty availability",
  movement: "Yoga + Sound availability",
  ritual: "Tarot, Reiki + virtual availability",
}

const inputClassName =
  "min-h-11 w-full rounded-xl border border-[var(--border)] bg-white/82 px-4 text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"

function describeGuestRange({
  maximum,
  minimum,
}: {
  maximum?: number
  minimum: number
}) {
  if (maximum && minimum > 1) return `${minimum}–${maximum} guests`
  if (maximum) return `Up to ${maximum} guests`
  if (minimum > 1) return `Minimum ${minimum} guests`
  return ""
}

function guestRangeError({
  maximum,
  minimum,
}: {
  maximum?: number
  minimum: number
}) {
  if (maximum && minimum > 1) {
    return `Choose between ${minimum} and ${maximum} guests for this experience.`
  }
  if (maximum)
    return `Choose no more than ${maximum} guests for this experience.`
  return `This experience requires at least ${minimum} guests.`
}

function BookingProgress({ step }: { step: BookingStep }) {
  const steps = [
    { id: "experience", label: "Experience" },
    { id: "schedule", label: "Schedule & confirm" },
  ] as const

  return (
    <ol
      aria-label="Booking progress"
      className="mx-auto grid w-full max-w-xl grid-cols-2 gap-2"
    >
      {steps.map((item, index) => {
        const isCurrent = item.id === step
        const isComplete = step === "schedule" && item.id === "experience"

        return (
          <li
            aria-current={isCurrent ? "step" : undefined}
            className={cn(
              "flex min-h-14 items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors sm:px-4",
              isCurrent
                ? "border-[var(--accent)] bg-[var(--accent)]/[0.09] text-[var(--primary)]"
                : "border-[var(--border)] bg-white/45 text-[var(--muted-foreground)]",
              isComplete && "border-[var(--primary)]/20 bg-white/72"
            )}
            key={item.id}
          >
            <span
              aria-hidden="true"
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                isCurrent
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-[var(--border)] bg-white",
                isComplete &&
                  "border-[var(--primary)] bg-[var(--primary)] text-white"
              )}
            >
              {isComplete ? <Check className="size-3.5" /> : index + 1}
            </span>
            <span>
              <span className="block text-[9px] font-semibold tracking-[0.16em] uppercase">
                Step {index + 1}
              </span>
              <span className="mt-0.5 block text-xs font-medium sm:text-sm">
                {item.label}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function BookingInquiryForm({
  feedback,
  hasLiveCalendar,
  isFlexible,
  minimumDate,
  onFlexibleChange,
  onSubmit,
  selectedService,
  status,
  timeZone,
}: {
  feedback: string
  hasLiveCalendar: boolean
  isFlexible: boolean
  minimumDate: string
  onFlexibleChange: (isFlexible: boolean) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  selectedService: BookingService
  status: SubmissionStatus
  timeZone: string
}) {
  const guestRangeLabel = describeGuestRange(selectedService.guestRange)
  const isInquiryOnly = selectedService.calendarBooking.kind === "inquiry-only"

  return (
    <form
      aria-labelledby="alternative-booking-request-title"
      className="mt-6 rounded-[1.6rem] border border-[var(--border)] bg-white/68 p-5 shadow-[0_20px_65px_rgba(90,74,63,0.06)] sm:p-6"
      id="alternative-booking-request"
      onSubmit={onSubmit}
    >
      <div className="rounded-2xl bg-[var(--primary)]/[0.055] p-4">
        <div className="flex items-start gap-3">
          <CalendarDays
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[var(--accent)]"
          />
          <div>
            <h3
              className="text-sm font-medium text-[var(--primary)]"
              id="alternative-booking-request-title"
            >
              {isInquiryOnly
                ? "Arrange this group facial with Shannon."
                : hasLiveCalendar
                  ? "Need another time?"
                  : "Request Shannon’s next opening."}
            </h3>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              {isInquiryOnly
                ? "Wild Glow Express is 15–20 minutes per guest and begins with four guests. Share your group timing so Shannon can reserve the full appointment without guessing; she’ll reply personally within 48 hours."
                : hasLiveCalendar
                  ? "Share your timing below and Shannon will reply personally within 48 hours with an alternate option."
                  : "Share your timing below. Shannon will reply personally within 48 hours with an available option. Ten to fourteen days’ notice is preferred, but shorter windows may be possible."}
            </p>
          </div>
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className="text-xs font-medium tracking-[0.12em] text-[var(--primary)] uppercase">
          Timing
        </legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <label
            className={cn(
              "cursor-pointer rounded-xl border p-3 transition focus-within:ring-2 focus-within:ring-[var(--accent)] focus-within:ring-offset-2 focus-within:outline-none",
              isFlexible
                ? "border-[var(--accent)] bg-[var(--accent)]/[0.07]"
                : "border-[var(--border)] bg-white/55"
            )}
          >
            <input
              checked={isFlexible}
              className="sr-only"
              name="bookingPreference"
              onChange={() => onFlexibleChange(true)}
              type="radio"
              value="Next available opening"
            />
            <span className="block text-sm font-medium text-[var(--primary)]">
              I’m flexible
            </span>
            <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
              Send me the next opening.
            </span>
          </label>
          <label
            className={cn(
              "cursor-pointer rounded-xl border p-3 transition focus-within:ring-2 focus-within:ring-[var(--accent)] focus-within:ring-offset-2 focus-within:outline-none",
              !isFlexible
                ? "border-[var(--accent)] bg-[var(--accent)]/[0.07]"
                : "border-[var(--border)] bg-white/55"
            )}
          >
            <input
              checked={!isFlexible}
              className="sr-only"
              name="bookingPreference"
              onChange={() => onFlexibleChange(false)}
              type="radio"
              value="Preferred window"
            />
            <span className="block text-sm font-medium text-[var(--primary)]">
              I have a window
            </span>
            <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
              Share a date and time of day.
            </span>
          </label>
        </div>
      </fieldset>

      {isFlexible ? (
        <input
          name="preferredWindow"
          type="hidden"
          value="Next available opening"
        />
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-xs font-medium text-[var(--primary)]">
            Preferred date
            <input
              className={inputClassName}
              min={minimumDate}
              name="preferredDate"
              required
              type="date"
            />
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-[var(--primary)]">
            Time of day
            <select
              className={inputClassName}
              defaultValue="Any time"
              name="preferredWindow"
            >
              <option>Any time</option>
              <option>Morning</option>
              <option>Afternoon</option>
              <option>Evening</option>
            </select>
          </label>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
        <Clock3 aria-hidden="true" className="size-3.5" />
        Times interpreted in {timeZone}
      </div>

      <input name="service" type="hidden" value={selectedService.title} />
      <input name="serviceSlug" type="hidden" value={selectedService.slug} />
      <input name="timeZone" type="hidden" value={timeZone} />
      <label aria-hidden="true" className="sr-only">
        Website
        <input autoComplete="off" name="website" tabIndex={-1} />
      </label>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-xs font-medium text-[var(--primary)]">
          Name
          <input
            autoComplete="name"
            className={inputClassName}
            name="name"
            required
          />
        </label>
        <label className="grid gap-1.5 text-xs font-medium text-[var(--primary)]">
          Email
          <input
            autoComplete="email"
            className={inputClassName}
            name="email"
            required
            type="email"
          />
        </label>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-xs font-medium text-[var(--primary)]">
          <span className="flex items-baseline justify-between gap-3">
            <span>Number of guests</span>
            {guestRangeLabel ? (
              <span className="font-normal text-[var(--muted-foreground)]">
                {guestRangeLabel}
              </span>
            ) : null}
          </span>
          <input
            className={inputClassName}
            defaultValue={selectedService.guestRange.minimum}
            key={selectedService.slug}
            max={selectedService.guestRange.maximum ?? 100}
            min={selectedService.guestRange.minimum}
            name="guestCount"
            required
            type="number"
          />
        </label>
        <label className="grid gap-1.5 text-xs font-medium text-[var(--primary)]">
          Location
          <input
            className={inputClassName}
            name="location"
            placeholder="City, venue, or Virtual"
            required
          />
        </label>
      </div>
      <label className="mt-3 grid gap-1.5 text-xs font-medium text-[var(--primary)]">
        Anything Shannon should know?{" "}
        <span className="font-normal">Optional</span>
        <textarea
          className="min-h-20 w-full rounded-xl border border-[var(--border)] bg-white/82 px-4 py-3 text-sm text-[var(--foreground)] transition outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          name="message"
          placeholder="Location, accessibility needs, or a second window that could work."
        />
      </label>

      <InquiryPrivacyNotice className="mt-4" />
      <Button
        className="mt-4 min-h-11 w-full rounded-full bg-[var(--primary)] px-6 text-white hover:bg-[var(--accent)]"
        disabled={status === "sending"}
        type="submit"
      >
        {status === "sending"
          ? "Sending…"
          : isFlexible
            ? "Request the next opening"
            : "Send preferred window"}
      </Button>

      {feedback ? (
        <p
          className={cn(
            "mt-4 rounded-xl px-4 py-3 text-sm",
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

export function BookingRequestFlow({
  calLinksByServiceSlug,
  initialServiceSlug,
  minimumDate,
}: {
  calLinksByServiceSlug: Readonly<Record<string, string>>
  initialServiceSlug?: string
  minimumDate: string
}) {
  const initialSelection = findBookingService(initialServiceSlug)
  const [activePillar, setActivePillar] = useState<BookingPillarId>(
    initialSelection?.pillar.id ?? "beauty"
  )
  const [selectedServiceSlug, setSelectedServiceSlug] = useState(
    initialSelection?.service.slug ?? ""
  )
  const [step, setStep] = useState<BookingStep>(
    getInitialBookingStep(initialServiceSlug)
  )
  const [isFlexible, setIsFlexible] = useState(true)
  const [timeZone, setTimeZone] = useState("Your local time")
  const [status, setStatus] = useState<SubmissionStatus>("idle")
  const [feedback, setFeedback] = useState("")
  const bookingFlowRef = useRef<HTMLElement>(null)
  const selectionSummaryRef = useRef<HTMLDivElement>(null)
  const stepHeadingRef = useRef<HTMLHeadingElement>(null)
  const shouldFocusStepRef = useRef(false)
  const submitInquiry = useInquirySubmission()
  const selectedResult = findBookingService(selectedServiceSlug)
  const selectedService = selectedResult?.service
  const activePillarData =
    bookingPillars.find((pillar) => pillar.id === activePillar) ??
    bookingPillars[0]
  const activeServices = activePillarData.services
  const selectedCalLink =
    selectedService?.calendarBooking.kind === "exact-event"
      ? calLinksByServiceSlug[selectedService.slug]
      : undefined
  const inquiryCollectionReady = isInquiryCollectionReady()
  const bookingRequestPresentation = selectedService
    ? getBookingRequestPresentation({
        calendarBookingKind: selectedService.calendarBooking.kind,
        hasLiveCalendar: Boolean(selectedCalLink),
        inquiryCollectionReady,
        recipientEmail: SITE_CONFIG.email,
        serviceTitle: selectedService.title,
      })
    : null

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const detectedTimeZone = Intl.DateTimeFormat()
        .resolvedOptions()
        .timeZone?.trim()

      if (detectedTimeZone) setTimeZone(detectedTimeZone)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!shouldFocusStepRef.current) return

    shouldFocusStepRef.current = false
    const frame = window.requestAnimationFrame(() => {
      bookingFlowRef.current?.scrollIntoView({
        behavior: "auto",
        block: "start",
      })
      stepHeadingRef.current?.focus({ preventScroll: true })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [step])

  useEffect(() => {
    function syncStepFromHistory() {
      const serviceSlug = normalizeBookingServiceSlug(
        new URL(window.location.href).searchParams.get("service") ?? undefined
      )
      const result = findBookingService(serviceSlug)

      shouldFocusStepRef.current = true

      if (result) {
        setActivePillar(result.pillar.id)
        setSelectedServiceSlug(result.service.slug)
        setStep("schedule")
        return
      }

      setStep("experience")
    }

    window.addEventListener("popstate", syncStepFromHistory)
    return () => window.removeEventListener("popstate", syncStepFromHistory)
  }, [])

  const settleCalendarPosition = useCallback(() => {
    window.requestAnimationFrame(() => {
      const flow = bookingFlowRef.current
      if (!flow || flow.getBoundingClientRect().top >= 0) return

      flow.scrollIntoView({ behavior: "auto", block: "start" })
    })
  }, [])

  function resetFeedback() {
    if (status !== "idle") setStatus("idle")
    if (feedback) setFeedback("")
  }

  function choosePillar(pillarId: BookingPillarId) {
    setActivePillar(pillarId)

    const selectedPillar = findBookingService(selectedServiceSlug)?.pillar.id
    if (selectedPillar !== pillarId) setSelectedServiceSlug("")

    resetFeedback()
  }

  function chooseService(serviceSlug: string, shouldScroll: boolean) {
    setSelectedServiceSlug(serviceSlug)
    resetFeedback()

    if (shouldScroll && window.matchMedia("(max-width: 1023px)").matches) {
      window.requestAnimationFrame(() => {
        selectionSummaryRef.current?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
          block: "start",
        })
      })
    }
  }

  function transitionToStep(nextStep: BookingStep) {
    shouldFocusStepRef.current = true
    setStep(nextStep)
  }

  function updateServiceInUrl(
    serviceSlug?: string,
    historyMode: "push" | "replace" = "replace"
  ) {
    const url = new URL(window.location.href)

    if (serviceSlug) url.searchParams.set("service", serviceSlug)
    else url.searchParams.delete("service")

    url.hash = "choose-time"
    const nextUrl = `${url.pathname}${url.search}${url.hash}`
    if (historyMode === "push") window.history.pushState(null, "", nextUrl)
    else window.history.replaceState(null, "", nextUrl)
  }

  function continueToSchedule() {
    if (!selectedService) return

    updateServiceInUrl(selectedService.slug, "push")
    transitionToStep("schedule")
  }

  function returnToExperience() {
    updateServiceInUrl()
    resetFeedback()
    transitionToStep("experience")
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("sending")
    setFeedback("")

    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form).entries())

    if (!selectedService) {
      setStatus("error")
      setFeedback("Choose a service before sending your request.")
      return
    }

    if (!isFlexible && !values.preferredDate) {
      setStatus("error")
      setFeedback("Choose a preferred date or select “I’m flexible.”")
      return
    }

    const guestCount = Number(values.guestCount)
    const { maximum, minimum } = selectedService.guestRange

    if (
      !Number.isInteger(guestCount) ||
      guestCount < minimum ||
      (maximum !== undefined && guestCount > maximum)
    ) {
      setStatus("error")
      setFeedback(guestRangeError(selectedService.guestRange))
      return
    }

    const note = typeof values.message === "string" ? values.message.trim() : ""
    values.message =
      note ||
      (isFlexible
        ? `Please send the next available opening for ${selectedService.title}.`
        : `Preferred-window request for ${selectedService.title}.`)

    try {
      const receipt = await submitInquiry(
        { ...values, source: "booking-request" },
        "Your booking request could not be sent."
      )

      form.reset()
      setIsFlexible(true)
      setStatus("sent")
      setFeedback(
        inquiryReceiptMessage(
          receipt,
          "Thank you. Your booking request is safely recorded, and Shannon’s email provider accepted the private alert. She will respond personally within 48 hours."
        )
      )
    } catch (error) {
      setStatus("error")
      setFeedback(
        error instanceof Error
          ? error.message
          : "Your booking request could not be sent. Please try again."
      )
    }
  }

  return (
    <section
      className="scroll-mt-24 border-y border-[var(--border)] bg-white/38 px-5 py-8 sm:px-6 md:py-11"
      id="choose-time"
      ref={bookingFlowRef}
    >
      <div className="mx-auto max-w-6xl">
        <BookingProgress step={step} />

        {step === "experience" || !selectedService ? (
          <div className="mt-9">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-medium tracking-[0.26em] text-[var(--accent)] uppercase">
                Step 1 of 2 · Experience
              </p>
              <h2
                className="mt-2 text-3xl font-medium text-[var(--primary)] outline-none md:text-4xl"
                ref={stepHeadingRef}
                tabIndex={-1}
              >
                Choose what meets you here.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)] md:text-base">
                Begin with the experience. You&apos;ll choose a date and time on
                the next, dedicated step.
              </p>
            </div>

            <div
              aria-label="Service categories"
              className="mx-auto mt-7 grid max-w-2xl grid-cols-3 gap-2"
              role="group"
            >
              {bookingPillars.map((pillar) => (
                <button
                  aria-controls="booking-service-options"
                  aria-pressed={activePillar === pillar.id}
                  className={cn(
                    "min-h-11 rounded-full border px-2.5 py-2 text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:outline-none sm:text-sm",
                    activePillar === pillar.id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-[var(--border)] bg-white/58 text-[var(--primary)] hover:border-[var(--accent)]"
                  )}
                  key={pillar.id}
                  onClick={() => choosePillar(pillar.id)}
                  type="button"
                >
                  {pillarLabels[pillar.id]}
                </button>
              ))}
            </div>

            <div
              aria-label={`${pillarLabels[activePillar]} services`}
              className="mt-5 grid gap-3 md:grid-cols-2"
              id="booking-service-options"
              role="group"
            >
              {activeServices.map((service) => {
                const selected = service.slug === selectedServiceSlug

                return (
                  <button
                    aria-controls="booking-selection-summary"
                    aria-pressed={selected}
                    className={cn(
                      "group min-h-36 rounded-[1.35rem] border p-5 text-left transition focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:outline-none",
                      selected
                        ? "border-[var(--accent)] bg-white shadow-[0_16px_42px_rgba(90,74,63,0.09)] ring-2 ring-[var(--accent)]/12"
                        : "border-[var(--border)] bg-white/55 hover:border-[var(--accent)]/60 hover:bg-white/78"
                    )}
                    key={service.slug}
                    onClick={(event: MouseEvent<HTMLButtonElement>) =>
                      chooseService(service.slug, event.detail > 0)
                    }
                    type="button"
                  >
                    <span className="flex items-start justify-between gap-4">
                      <span className="min-w-0">
                        <span className="block font-serif text-xl leading-tight text-[var(--primary)]">
                          {service.title}
                        </span>
                        <span className="mt-1.5 block text-[10px] font-medium tracking-[0.1em] text-[var(--muted-foreground)] uppercase">
                          {service.duration} · {service.format}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2 text-sm font-medium text-[var(--accent)]">
                        {service.price}
                        {selected ? (
                          <span className="grid size-6 place-items-center rounded-full bg-[var(--accent)] text-white">
                            <Check aria-hidden="true" className="size-3.5" />
                          </span>
                        ) : null}
                      </span>
                    </span>
                    <span className="mt-4 block text-sm leading-6 text-[var(--muted-foreground)]">
                      {service.description}
                    </span>
                  </button>
                )
              })}
            </div>

            <div
              aria-label={selectedService ? undefined : "Selected experience"}
              aria-labelledby={
                selectedService ? "booking-selection-title" : undefined
              }
              className="mt-6 scroll-mt-24"
              id="booking-selection-summary"
              ref={selectionSummaryRef}
              role="region"
            >
              <p aria-atomic="true" aria-live="polite" className="sr-only">
                {selectedService
                  ? `${selectedService.title} selected. ${selectedService.duration}. ${selectedService.price}.`
                  : `${pillarLabels[activePillar]} category selected. Choose an experience to continue.`}
              </p>

              {selectedService ? (
                <div className="grid gap-5 rounded-[1.6rem] border border-[var(--accent)]/45 bg-white/82 p-5 shadow-[0_20px_60px_rgba(90,74,63,0.08)] md:grid-cols-[1fr_auto] md:items-center md:p-6">
                  <div className="flex min-w-0 items-start gap-4">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-white"
                    >
                      <Check className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--accent)] uppercase">
                        Your experience
                      </p>
                      <h3
                        className="mt-1 font-serif text-2xl leading-tight text-[var(--primary)]"
                        id="booking-selection-title"
                      >
                        {selectedService.title}
                      </h3>
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                        {selectedService.duration} · {selectedService.format} ·{" "}
                        {selectedService.price}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="min-h-11 w-full rounded-full bg-[var(--primary)] px-6 text-white hover:bg-[var(--accent)] md:w-auto"
                    onClick={continueToSchedule}
                    type="button"
                  >
                    {selectedCalLink
                      ? "Continue to available times"
                      : "Continue to booking options"}
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="grid min-h-32 place-items-center rounded-[1.6rem] border border-dashed border-[var(--border)] bg-white/35 px-6 text-center">
                  <div>
                    <CalendarDays
                      aria-hidden="true"
                      className="mx-auto size-5 text-[var(--accent)]"
                    />
                    <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                      Choose one experience to continue.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-9">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-medium tracking-[0.26em] text-[var(--accent)] uppercase">
                Step 2 of 2 · Schedule & confirm
              </p>
              <h2
                className="mt-2 text-3xl font-medium text-[var(--primary)] outline-none md:text-4xl"
                ref={stepHeadingRef}
                tabIndex={-1}
              >
                {selectedCalLink
                  ? "Choose a day and time."
                  : "Complete your booking request."}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)] md:text-base">
                {selectedCalLink
                  ? "The calendar now has the room. Choose a live opening, then Cal.com will collect the details Shannon needs to confirm your appointment."
                  : "This experience begins with a personal arrangement so Shannon can hold the right amount of time and care."}
              </p>
            </div>

            <div className="mt-7 rounded-[1.6rem] border border-[var(--border)] bg-white/72 p-5 shadow-[0_18px_55px_rgba(90,74,63,0.06)] sm:p-6">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--accent)] uppercase">
                    Selected experience
                  </p>
                  <h3 className="mt-1 font-serif text-2xl leading-tight text-[var(--primary)]">
                    {selectedService.title}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {selectedService.duration} · {selectedService.format} ·{" "}
                    {selectedService.price}
                  </p>
                </div>
                <div className="md:text-right">
                  <Button
                    className="min-h-11 rounded-full px-4 text-[var(--primary)]"
                    onClick={returnToExperience}
                    type="button"
                    variant="outline"
                  >
                    <ArrowLeft aria-hidden="true" className="size-4" />
                    Change experience
                  </Button>
                  <p className="mt-2 max-w-xs text-xs leading-5 text-[var(--muted-foreground)]">
                    Changing the experience resets any calendar progress.
                  </p>
                </div>
              </div>
            </div>

            {selectedCalLink ? (
              <div className="mt-6">
                <div className="flex flex-col justify-between gap-4 rounded-2xl bg-[var(--accent)]/[0.09] p-4 sm:flex-row sm:items-center sm:p-5">
                  <div className="flex items-start gap-3">
                    <CalendarDays
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-[var(--accent)]"
                    />
                    <div>
                      <p className="text-sm font-medium text-[var(--primary)]">
                        {availabilityLabels[activePillar]}
                      </p>
                      <p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--muted-foreground)]">
                        Times are live and shown in your local timezone. Your
                        appointment remains pending until Shannon confirms it.
                      </p>
                      {bookingRequestPresentation?.kind === "online-form" ? (
                        <a
                          className="mt-2 inline-flex text-xs font-medium text-[var(--accent)] underline underline-offset-4 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:outline-none"
                          href="#alternative-booking-request"
                        >
                          Need a different time? Send a private request.
                        </a>
                      ) : bookingRequestPresentation?.kind ===
                        "direct-email" ? (
                        <p className="mt-2 text-xs font-medium text-[var(--accent)]">
                          {bookingRequestPresentation.calendarNote}{" "}
                          <a
                            className="underline underline-offset-4 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:outline-none"
                            href={bookingRequestPresentation.actionHref}
                          >
                            {bookingRequestPresentation.actionLabel}.
                          </a>
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <a
                    aria-label={`Open ${selectedService.title} scheduling in Cal.com in a new tab`}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--accent)]/35 bg-white/55 px-4 text-sm font-medium text-[var(--accent)] transition hover:bg-white focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:outline-none"
                    href={selectedCalLink}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open calendar in a new tab
                    <ExternalLink aria-hidden="true" className="size-4" />
                  </a>
                </div>

                <CalendarEmbedBoundary key={selectedCalLink}>
                  <CalInlineEmbed
                    calLink={selectedCalLink}
                    className="mt-5"
                    onInitialReady={settleCalendarPosition}
                    serviceTitle={selectedService.title}
                    showExternalLink={false}
                  />
                </CalendarEmbedBoundary>
              </div>
            ) : null}

            {bookingRequestPresentation?.kind === "online-form" ? (
              <BookingInquiryForm
                feedback={feedback}
                hasLiveCalendar={Boolean(selectedCalLink)}
                isFlexible={isFlexible}
                minimumDate={minimumDate}
                onFlexibleChange={(nextValue) => {
                  setIsFlexible(nextValue)
                  resetFeedback()
                }}
                onSubmit={handleSubmit}
                selectedService={selectedService}
                status={status}
                timeZone={timeZone}
              />
            ) : bookingRequestPresentation?.kind === "direct-email" ? (
              <InquiryCollectionPaused
                actionHref={bookingRequestPresentation.actionHref}
                actionLabel={bookingRequestPresentation.actionLabel}
                className="mt-6"
                description={bookingRequestPresentation.description}
                showBookingLink={false}
                title={bookingRequestPresentation.title}
              />
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}
