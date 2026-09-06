export type BookingRequestPresentation =
  | {
      announcement: string
      kind: "online-form"
    }
  | {
      actionHref: string
      actionLabel: string
      announcement: string
      calendarNote: string
      description: string
      kind: "direct-email"
      title: string
    }

export function getBookingRequestPresentation({
  calendarBookingKind,
  hasLiveCalendar,
  inquiryCollectionReady,
  recipientEmail,
  serviceTitle,
}: {
  calendarBookingKind: "exact-event" | "inquiry-only"
  hasLiveCalendar: boolean
  inquiryCollectionReady: boolean
  recipientEmail: string
  serviceTitle: string
}): BookingRequestPresentation {
  if (inquiryCollectionReady) {
    return {
      announcement: hasLiveCalendar
        ? "Live dates and appointment times are available below. Send Shannon a request below if you need another time."
        : "Send Shannon a request for the next opening below.",
      kind: "online-form",
    }
  }

  const actionHref = `mailto:${recipientEmail}?subject=${encodeURIComponent(
    `Booking request: ${serviceTitle}`
  )}`

  if (hasLiveCalendar) {
    return {
      actionHref,
      actionLabel: "Email Shannon about another time",
      announcement:
        "Live dates and appointment times are available below. The website request form is paused; email Shannon directly for help with another time.",
      calendarNote: "The website request form is paused.",
      description:
        "Live appointment times above remain available. The website request form is paused; email Shannon directly for help with another time.",
      kind: "direct-email",
      title: "Need another time?",
    }
  }

  if (calendarBookingKind === "inquiry-only") {
    return {
      actionHref,
      actionLabel: `Email Shannon about ${serviceTitle}`,
      announcement:
        "Use the email link below to arrange this experience directly. The website request form is paused.",
      calendarNote: "",
      description:
        "This experience needs a personal arrangement. The website request form is paused; email Shannon directly below so no details are collected on this page.",
      kind: "direct-email",
      title: "Arrange this experience directly.",
    }
  }

  return {
    actionHref,
    actionLabel: `Email Shannon about ${serviceTitle}`,
    announcement:
      "The live calendar is not available for this experience right now. Use the email link below to book directly with Shannon.",
    calendarNote: "",
    description:
      "The live calendar is not available for this experience right now. The website request form is paused; email Shannon directly below so no details are collected on this page.",
    kind: "direct-email",
    title: "Email Shannon to book.",
  }
}
