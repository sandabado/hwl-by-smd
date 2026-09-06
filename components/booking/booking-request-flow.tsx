"use client"

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react"
import { CalendarDays, Check, Clock3 } from "lucide-react"
import dynamic from "next/dynamic"
import Image from "next/image"

import {
  inquiryReceiptMessage,
  useInquirySubmission,
} from "@/components/shared/use-inquiry-submission"
import { InquiryCollectionPaused } from "@/components/shared/inquiry-collection-paused"
import { InquiryPrivacyNotice } from "@/components/shared/inquiry-privacy-notice"
import { Button } from "@/components/ui/button"
import {
  bookingPillars,
  findBookingService,
  type BookingPillarId,
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
        className="mt-4 rounded-2xl border border-[var(--border)] bg-[#faf7f2] p-6 text-center text-sm text-[var(--muted-foreground)]"
        role="status"
      >
        Preparing Shannon&apos;s live calendar…
      </p>
    ),
    ssr: false,
  }
)

type SubmissionStatus = "error" | "idle" | "sending" | "sent"

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
  const [isFlexible, setIsFlexible] = useState(true)
  const [timeZone, setTimeZone] = useState("Your local time")
  const [status, setStatus] = useState<SubmissionStatus>("idle")
  const [feedback, setFeedback] = useState("")
  const schedulingPanelRef = useRef<HTMLDivElement>(null)
  const submitInquiry = useInquirySubmission()
  const selectedService = findBookingService(selectedServiceSlug)?.service
  const activePillarData =
    bookingPillars.find((pillar) => pillar.id === activePillar) ??
    bookingPillars[0]
  const activeServices = activePillarData.services
  const previewImage = selectedService?.image ?? activePillarData.image
  const selectedCalLink =
    selectedService?.calendarBooking.kind === "exact-event"
      ? calLinksByServiceSlug[selectedService.slug]
      : undefined
  const guestRangeLabel = selectedService
    ? describeGuestRange(selectedService.guestRange)
    : ""
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
        schedulingPanelRef.current?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
          block: "start",
        })
      })
    }
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
    <form aria-label="Book an experience with Shannon" onSubmit={handleSubmit}>
      <section
        className="scroll-mt-24 border-y border-[var(--border)] bg-white/38 px-5 py-7 sm:px-6 md:py-9"
        id="choose-time"
      >
        <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[0.92fr_1.08fr] lg:items-start xl:gap-10">
          <div>
            <p className="text-xs font-medium tracking-[0.26em] text-[var(--accent)] uppercase">
              Step 1 · Experience
            </p>
            <h2 className="mt-2 text-3xl font-medium text-[var(--primary)] md:text-4xl">
              What would feel good?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted-foreground)]">
              Choose the experience you want to explore. You can change your
              mind before sending the request.
            </p>

            <div
              aria-label="Service categories"
              className="mt-5 grid grid-cols-3 gap-2"
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
              className="mt-4 grid gap-2 sm:grid-cols-2"
              id="booking-service-options"
              role="group"
            >
              {activeServices.map((service) => {
                const selected = service.slug === selectedServiceSlug

                return (
                  <button
                    aria-controls="booking-scheduling-panel"
                    aria-pressed={selected}
                    className={cn(
                      "grid min-h-[4.35rem] grid-cols-[1fr_auto] items-center gap-4 rounded-2xl border px-4 py-3 text-left transition focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:outline-none",
                      selected
                        ? "border-[var(--accent)] bg-white shadow-[0_12px_35px_rgba(90,74,63,0.08)] ring-2 ring-[var(--accent)]/12"
                        : "border-[var(--border)] bg-white/55 hover:border-[var(--accent)]/60 hover:bg-white/78"
                    )}
                    key={service.slug}
                    onClick={(event: MouseEvent<HTMLButtonElement>) =>
                      chooseService(service.slug, event.detail > 0)
                    }
                    type="button"
                  >
                    <span className="min-w-0">
                      <span className="block font-serif text-lg leading-tight text-[var(--primary)]">
                        {service.title}
                      </span>
                      <span className="mt-1 block text-[10px] font-medium tracking-[0.1em] text-[var(--muted-foreground)] uppercase">
                        {service.duration} · {service.format}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
                      {service.price}
                      {selected ? (
                        <Check aria-hidden="true" className="size-4" />
                      ) : null}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div
            aria-label={selectedService ? undefined : "Booking details"}
            aria-labelledby={
              selectedService ? "booking-selected-service-title" : undefined
            }
            className="scroll-mt-24 rounded-[1.6rem] border border-[var(--border)] bg-white/68 p-5 shadow-[0_20px_65px_rgba(90,74,63,0.07)] sm:p-6"
            id="booking-scheduling-panel"
            ref={schedulingPanelRef}
            role="region"
          >
            <p aria-atomic="true" aria-live="polite" className="sr-only">
              {selectedService
                ? `${selectedService.title} selected. ${selectedService.duration}. ${selectedService.price}. ${bookingRequestPresentation?.announcement ?? ""}`
                : `${pillarLabels[activePillar]} category selected. Choose a service to continue.`}
            </p>

            <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-[1.15rem] bg-[var(--muted)]">
              <Image
                alt={previewImage.alt}
                className="object-cover object-center"
                fill
                preload
                sizes="(max-width: 1023px) 90vw, 44vw"
                src={previewImage.src}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[var(--primary)]/65 via-transparent to-transparent"
              />
              <p className="absolute right-4 bottom-4 left-4 text-xs font-semibold tracking-[0.18em] text-white uppercase">
                {selectedService?.title ??
                  `${activePillarData.title} with Shannon`}
              </p>
            </div>

            {selectedService ? (
              <>
                <div className="flex flex-col justify-between gap-3 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-[10px] font-medium tracking-[0.18em] text-[var(--accent)] uppercase">
                      Your experience
                    </p>
                    <h3
                      className="mt-1 font-serif text-2xl leading-tight text-[var(--primary)]"
                      id="booking-selected-service-title"
                    >
                      {selectedService.title}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {selectedService.duration} · {selectedService.format}
                    </p>
                  </div>
                  <p className="text-lg font-medium text-[var(--accent)]">
                    {selectedService.price}
                  </p>
                </div>

                <>
                  {selectedCalLink ? (
                    <div className="mt-5">
                      <div className="rounded-2xl bg-[var(--accent)]/[0.09] p-4">
                        <div className="flex items-start gap-3">
                          <CalendarDays
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-[var(--accent)]"
                          />
                          <div>
                            <p className="text-sm font-medium text-[var(--primary)]">
                              {availabilityLabels[activePillar]}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                              These live dates and times are specific to this
                              experience. Cal.com will guide you through
                              confirmation.
                            </p>
                            {bookingRequestPresentation?.kind ===
                            "online-form" ? (
                              <a
                                className="mt-2 inline-flex text-xs font-medium text-[var(--accent)] underline underline-offset-4 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:outline-none"
                                href="#alternative-booking-request"
                              >
                                Need a different time? Skip to the request form.
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
                      </div>

                      <CalInlineEmbed
                        calLink={selectedCalLink}
                        className="mt-4"
                        serviceTitle={selectedService.title}
                      />
                    </div>
                  ) : null}

                  {bookingRequestPresentation?.kind === "online-form" ? (
                    <>
                      <div
                        className="mt-4 scroll-mt-24 rounded-2xl bg-[var(--primary)]/[0.055] p-4"
                        id="alternative-booking-request"
                      >
                        <div className="flex items-start gap-3">
                          <CalendarDays
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-[var(--accent)]"
                          />
                          <div>
                            <p className="text-sm font-medium text-[var(--primary)]">
                              {selectedService.calendarBooking.kind ===
                              "inquiry-only"
                                ? "Arrange this group facial with Shannon."
                                : selectedCalLink
                                  ? "Need another time?"
                                  : "Request Shannon’s next opening."}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                              {selectedService.calendarBooking.kind ===
                              "inquiry-only"
                                ? "Wild Glow Express is 15–20 minutes per guest and begins with four guests. Share your group timing so Shannon can reserve the full appointment without guessing; she’ll reply personally within 48 hours."
                                : selectedCalLink
                                  ? "Share your timing below and Shannon will reply personally within 48 hours with an alternate option."
                                  : "Share your timing below. Shannon will reply personally within 48 hours with an available option. Ten to fourteen days’ notice is preferred, but shorter windows may be possible."}
                            </p>
                          </div>
                        </div>
                      </div>

                      <fieldset className="mt-4">
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
                              onChange={() => {
                                setIsFlexible(true)
                                resetFeedback()
                              }}
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
                              onChange={() => {
                                setIsFlexible(false)
                                resetFeedback()
                              }}
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

                      <input
                        name="service"
                        type="hidden"
                        value={selectedService.title}
                      />
                      <input
                        name="serviceSlug"
                        type="hidden"
                        value={selectedService.slug}
                      />
                      <input name="timeZone" type="hidden" value={timeZone} />
                      <label aria-hidden="true" className="sr-only">
                        Website
                        <input
                          autoComplete="off"
                          name="website"
                          tabIndex={-1}
                        />
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
                    </>
                  ) : bookingRequestPresentation?.kind === "direct-email" ? (
                    <InquiryCollectionPaused
                      actionHref={bookingRequestPresentation.actionHref}
                      actionLabel={bookingRequestPresentation.actionLabel}
                      className="mt-4"
                      description={bookingRequestPresentation.description}
                      showBookingLink={false}
                      title={bookingRequestPresentation.title}
                    />
                  ) : null}
                </>
              </>
            ) : (
              <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-[var(--border)] px-6 text-center">
                <div className="max-w-sm">
                  <CalendarDays
                    aria-hidden="true"
                    className="mx-auto size-5 text-[var(--accent)]"
                  />
                  <h3 className="mt-3 font-serif text-2xl text-[var(--primary)]">
                    Choose an experience.
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                    Its duration, price, and truthful scheduling options will
                    appear here.
                  </p>
                </div>
              </div>
            )}

            {feedback ? (
              <p
                role={status === "error" ? "alert" : "status"}
                className={cn(
                  "mt-4 rounded-xl px-4 py-3 text-sm",
                  status === "sent"
                    ? "bg-[var(--primary)]/[0.07] text-[var(--primary)]"
                    : "bg-red-50 text-red-700"
                )}
              >
                {feedback}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </form>
  )
}
