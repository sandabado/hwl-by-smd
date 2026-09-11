"use client"

import {
  Component,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
} from "react"
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Droplets,
  Eye,
  ExternalLink,
  Flower2,
  Gem,
  HandHeart,
  MoonStar,
  Music2,
  PersonStanding,
  Sparkles,
  Sun,
  Waves,
  type LucideIcon,
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
import type { CalcomBookingOption } from "@/lib/calcom-booking-links"
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

const serviceIconBySlug = {
  "wild-glow-express-facial": Sparkles,
  "reiki-aromatherapy-healing": Flower2,
  "signature-facial": Droplets,
  "beauty-being-ritual": Gem,
  "wild-glow-luxury-facial": Sun,
  "private-yoga-and-sound": PersonStanding,
  "private-sound-healing": Music2,
  "private-yoga": Waves,
  "intuitive-tarot-reading": Eye,
  "moon-oracle-reading": MoonStar,
  "tarot-and-reiki": HandHeart,
} as const satisfies Record<string, LucideIcon>

type ServiceIconSlug = keyof typeof serviceIconBySlug

const pillarSigilStyles: Record<
  BookingPillarId,
  { icon: string; surface: string }
> = {
  beauty: {
    icon: "text-[#9a5f3f]",
    surface: "border-[#c9906d]/35 bg-[#f4e7dc]",
  },
  movement: {
    icon: "text-[#665c4c]",
    surface: "border-[#b6a789]/35 bg-[#eee7d9]",
  },
  ritual: {
    icon: "text-[#654e50]",
    surface: "border-[#a98a82]/35 bg-[#eee2df]",
  },
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

function getBookingLocationLabel(service: BookingService) {
  switch (service.locationPolicy.kind) {
    case "fixed":
      return "HWL Beauty · Palm Springs"
    case "attendee-address":
      return "Your selected location"
    case "virtual-or-attendee-address":
      return "Virtual or your selected location"
  }
}

function getServiceIcon(slug: string) {
  return serviceIconBySlug[slug as ServiceIconSlug] ?? Sparkles
}

function withCalAttendee(
  href: string,
  attendee: { email: string; name?: string } | undefined
) {
  if (!attendee?.email) return href

  try {
    const url = new URL(href)
    url.searchParams.set("email", attendee.email)
    if (attendee.name) url.searchParams.set("name", attendee.name)
    return url.toString()
  } catch {
    return href
  }
}

function BookingInquiryForm({
  attendee,
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
  attendee?: {
    email: string
    name?: string
  }
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
  const isIndividual = selectedService.guestRange.maximum === 1
  const fixedLocation =
    selectedService.locationPolicy.kind === "fixed"
      ? selectedService.locationPolicy.label
      : undefined
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
                ? "Arrange this experience with Shannon."
                : hasLiveCalendar
                  ? "Need another time?"
                  : "Request Shannon’s next opening."}
            </h3>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              {isInquiryOnly
                ? `${selectedService.title} needs a personal arrangement. Share your preferred timing and Shannon will reply personally within 48 hours.`
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
            defaultValue={attendee?.name}
            name="name"
            required
          />
        </label>
        <label className="grid gap-1.5 text-xs font-medium text-[var(--primary)]">
          Email
          <input
            autoComplete="email"
            className={inputClassName}
            defaultValue={attendee?.email}
            name="email"
            required
            type="email"
          />
        </label>
      </div>
      {isIndividual ? (
        <input name="guestCount" type="hidden" value="1" />
      ) : null}
      {fixedLocation ? (
        <input name="location" type="hidden" value={fixedLocation} />
      ) : null}
      {!isIndividual || !fixedLocation ? (
        <div
          className={cn(
            "mt-3 grid gap-3",
            !isIndividual && !fixedLocation && "sm:grid-cols-2"
          )}
        >
          {!isIndividual ? (
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
          ) : null}
          {!fixedLocation ? (
            <label className="grid gap-1.5 text-xs font-medium text-[var(--primary)]">
              Location
              <input
                className={inputClassName}
                name="location"
                placeholder="City, venue, or Virtual"
                required
              />
            </label>
          ) : null}
        </div>
      ) : null}
      <label className="mt-3 grid gap-1.5 text-xs font-medium text-[var(--primary)]">
        Anything Shannon should know?{" "}
        <span className="font-normal">Optional</span>
        <textarea
          className="min-h-20 w-full rounded-xl border border-[var(--border)] bg-white/82 px-4 py-3 text-sm text-[var(--foreground)] transition outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          name="message"
          placeholder={
            fixedLocation
              ? "Accessibility needs, skin sensitivities, or a second window that could work."
              : "Location, accessibility needs, or a second window that could work."
          }
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
  attendee,
  calBookingOptionsByServiceSlug,
  initialServiceSlug,
  minimumDate,
}: {
  attendee?: {
    email: string
    name?: string
  }
  calBookingOptionsByServiceSlug: Readonly<Record<string, CalcomBookingOption>>
  initialServiceSlug?: string
  minimumDate: string
}) {
  const initialSelection = findBookingService(initialServiceSlug)
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
  const scheduleStepRef = useRef<HTMLDivElement>(null)
  const stepHeadingRef = useRef<HTMLHeadingElement>(null)
  const shouldFocusStepRef = useRef(false)
  const submitInquiry = useInquirySubmission()
  const selectedResult = findBookingService(selectedServiceSlug)
  const selectedService = selectedResult?.service
  const selectedLocationLabel = selectedService
    ? getBookingLocationLabel(selectedService)
    : undefined
  const selectedCalOption =
    selectedService?.calendarBooking.kind === "exact-event"
      ? calBookingOptionsByServiceSlug[selectedService.slug]
      : undefined
  const selectedCalLink = selectedCalOption?.url
  const selectedExternalCalLink = selectedCalLink
    ? withCalAttendee(selectedCalLink, attendee)
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
      const target =
        step === "schedule" ? scheduleStepRef.current : bookingFlowRef.current
      target?.scrollIntoView({
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
        setSelectedServiceSlug(result.service.slug)
        setStep("schedule")
        return
      }

      setStep("experience")
    }

    window.addEventListener("popstate", syncStepFromHistory)
    return () => window.removeEventListener("popstate", syncStepFromHistory)
  }, [])

  function resetFeedback() {
    if (status !== "idle") setStatus("idle")
    if (feedback) setFeedback("")
  }

  function chooseService(serviceSlug: string) {
    setSelectedServiceSlug(serviceSlug)
    resetFeedback()
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
      className="scroll-mt-24 border-b border-[var(--border)] bg-[#f7f3ec] px-5 py-5 sm:px-6 md:py-7"
      id="choose-time"
      ref={bookingFlowRef}
    >
      <div className="mx-auto max-w-6xl">
        {step === "experience" ? (
          <header className="grid gap-4 rounded-[1.25rem] bg-[#eee7dc] px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(28rem,0.72fr)] lg:items-end">
            <div className="min-w-0">
              <h1
                className="font-serif text-2xl leading-tight text-[var(--primary)] outline-none sm:text-3xl"
                ref={stepHeadingRef}
                tabIndex={-1}
              >
                Book with Shannon
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-5 text-[var(--muted-foreground)]">
                Choose a service, then see Shannon’s live dates and times.
              </p>
            </div>
            <nav
              aria-label="Jump to a service category"
              className="grid w-full grid-cols-3 gap-2"
            >
              {bookingPillars.map((pillar) => (
                <a
                  className="inline-flex min-h-11 min-w-0 items-center justify-center rounded-full border border-[var(--border)] bg-white/68 px-2.5 py-2 text-center text-xs font-medium text-[var(--primary)] transition hover:border-[var(--accent)] hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:outline-none sm:text-sm"
                  href={`#booking-pillar-${pillar.id}`}
                  key={pillar.id}
                >
                  {pillarLabels[pillar.id]}
                </a>
              ))}
            </nav>
          </header>
        ) : null}

        {step === "experience" || !selectedService ? (
          <div>
            <div className="mt-7 space-y-7" id="booking-service-options">
              {bookingPillars.map((pillar) => (
                <section
                  aria-labelledby={`booking-pillar-${pillar.id}-title`}
                  className="scroll-mt-24"
                  id={`booking-pillar-${pillar.id}`}
                  key={pillar.id}
                >
                  <div className="mb-3 border-b border-[var(--border)] pb-3">
                    <h2
                      className="font-serif text-2xl text-[var(--primary)]"
                      id={`booking-pillar-${pillar.id}-title`}
                    >
                      {pillarLabels[pillar.id]}
                    </h2>
                  </div>

                  <div
                    aria-label={`${pillarLabels[pillar.id]} services`}
                    className="grid gap-3 md:grid-cols-2"
                    role="group"
                  >
                    {pillar.services.map((service) => {
                      const selected = service.slug === selectedServiceSlug
                      const ServiceIcon = getServiceIcon(service.slug)
                      const sigilStyles = pillarSigilStyles[pillar.id]

                      return (
                        <div
                          className={cn(
                            "group overflow-hidden rounded-2xl border text-left transition-colors",
                            selected
                              ? "border-[var(--accent)] bg-[#fffaf4] ring-2 ring-[var(--accent)]/12"
                              : "border-[var(--border)] bg-white/42 hover:border-[var(--accent)]/60 hover:bg-white/68"
                          )}
                          key={service.slug}
                        >
                          <button
                            aria-controls={
                              selected ? `continue-${service.slug}` : undefined
                            }
                            aria-pressed={selected}
                            className="w-full p-3 text-left focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none focus-visible:ring-inset sm:p-4"
                            onClick={() => chooseService(service.slug)}
                            type="button"
                          >
                            <span className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-4">
                              <span
                                aria-hidden="true"
                                className={cn(
                                  "grid size-10 place-items-center self-center rounded-full border sm:size-11",
                                  sigilStyles.surface
                                )}
                              >
                                <ServiceIcon
                                  className={cn(
                                    "size-[1.125rem]",
                                    sigilStyles.icon
                                  )}
                                  strokeWidth={1.4}
                                />
                              </span>
                              <span className="min-w-0 self-center">
                                <span className="flex items-start justify-between gap-3">
                                  <span className="min-w-0">
                                    <span className="block font-serif text-lg leading-tight text-[var(--primary)] sm:text-xl">
                                      {service.title}
                                    </span>
                                    <span className="mt-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
                                      {service.duration} · {service.format}
                                    </span>
                                  </span>
                                  <span className="flex shrink-0 items-center gap-2 text-sm font-medium text-[var(--accent)]">
                                    {service.price}
                                    {selected ? (
                                      <span className="grid size-6 place-items-center rounded-full bg-[var(--accent)] text-white">
                                        <Check
                                          aria-hidden="true"
                                          className="size-3.5"
                                        />
                                      </span>
                                    ) : null}
                                  </span>
                                </span>
                                <span className="mt-2 block text-xs leading-5 text-[var(--muted-foreground)] sm:text-sm sm:leading-6">
                                  {service.description}
                                </span>
                              </span>
                            </span>
                          </button>

                          {selected ? (
                            <div
                              className="border-t border-[var(--accent)]/20 px-3 py-3 sm:px-4"
                              id={`continue-${service.slug}`}
                            >
                              <Button
                                className="min-h-11 w-full rounded-full bg-[var(--primary)] px-5 text-white hover:bg-[var(--accent)]"
                                onClick={continueToSchedule}
                                type="button"
                              >
                                {selectedCalLink
                                  ? "See available dates & times"
                                  : "Continue to request details"}
                                <ArrowRight
                                  aria-hidden="true"
                                  className="size-4"
                                />
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>

            <p aria-atomic="true" aria-live="polite" className="sr-only">
              {selectedService
                ? `${selectedService.title} selected. ${selectedService.duration}. ${selectedService.price}. Continue from the selected card.`
                : "All service categories are visible. Choose an experience to continue."}
            </p>
          </div>
        ) : (
          <div className="mt-4 scroll-mt-24" ref={scheduleStepRef}>
            <div className="flex items-start justify-between gap-3 rounded-[1.25rem] border border-[var(--border)] bg-[#eee7dc] p-3.5 sm:items-center sm:px-5 sm:py-4">
              <div className="min-w-0">
                <h1
                  className="font-serif text-xl leading-tight text-[var(--primary)] outline-none sm:text-2xl"
                  ref={stepHeadingRef}
                  tabIndex={-1}
                >
                  {selectedService.title}
                </h1>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)] sm:text-sm">
                  With Shannon · {selectedLocationLabel}
                  {selectedCalLink ? " · Request now, pay after your visit" : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  aria-label="Change service"
                  className="min-h-11 rounded-full px-3 text-[var(--primary)] sm:px-4"
                  onClick={returnToExperience}
                  type="button"
                  variant="outline"
                >
                  <ArrowLeft aria-hidden="true" className="size-4" />
                  <span className="sr-only sm:not-sr-only">Change</span>
                </Button>
                {selectedCalLink ? (
                  <a
                    aria-label={`Open ${selectedService.title} scheduling in Cal.com in a new tab`}
                    className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--border)] bg-white/45 text-[var(--accent)] transition hover:border-[var(--accent)] hover:bg-white/75 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:outline-none"
                    href={selectedExternalCalLink}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLink aria-hidden="true" className="size-3.5" />
                    <span className="sr-only">Open in Cal.com</span>
                  </a>
                ) : null}
              </div>
            </div>

            {selectedCalLink ? (
              <div>
                <CalendarEmbedBoundary key={selectedCalLink}>
                  <CalInlineEmbed
                    attendee={attendee}
                    calLink={selectedCalLink}
                    className="mt-4"
                    serviceTitle={selectedService.title}
                    showExternalLink={false}
                  />
                </CalendarEmbedBoundary>
              </div>
            ) : null}

            {bookingRequestPresentation?.kind === "online-form" ? (
              <BookingInquiryForm
                attendee={attendee}
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
