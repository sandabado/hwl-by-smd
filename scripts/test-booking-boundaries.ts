import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

import {
  bookingPillars,
  findBookingService,
  isExactCalEventForBookingService,
} from "../lib/booking-services.ts"
import { getBookingRequestPresentation } from "../lib/booking-request-presentation.ts"
import { getCalcomPublicEventTypes } from "../lib/calcom.ts"

const services = bookingPillars.flatMap((pillar) => pillar.services)

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
}

test("Cal.com discovery sends the complete stable request identity", async () => {
  const originalFetch = globalThis.fetch
  let requestUrl: string | null = null
  let requestInit: RequestInit | undefined

  globalThis.fetch = async (input, init) => {
    requestUrl = input.toString()
    requestInit = init

    return new Response(JSON.stringify({ data: [], status: "success" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  }

  try {
    assert.deepEqual(await getCalcomPublicEventTypes(), {
      eventTypes: [],
      status: "available",
    })
  } finally {
    globalThis.fetch = originalFetch
  }

  assert.equal(
    requestUrl,
    "https://api.cal.com/v2/event-types?username=hwlbysmd"
  )
  assert.deepEqual(
    Object.fromEntries(new Headers(requestInit?.headers).entries()),
    {
      accept: "application/json",
      "cal-api-version": "2024-06-14",
      "user-agent": "HWLbySMD/1.0 (+https://www.hwlbysmd.com)",
    }
  )
  assert.deepEqual(requestInit?.next, {
    revalidate: 300,
    tags: ["calcom-public-event-types"],
  })
  assert.ok(requestInit?.signal instanceof AbortSignal)
})

test("booking catalog keeps live Cal discovery fail closed", async (t) => {
  await t.test("all public services have one unique canonical slug", () => {
    const slugs = services.map((service) => service.slug)

    assert.equal(services.length, 11)
    assert.equal(new Set(slugs).size, services.length)
    for (const service of services) {
      assert.equal(findBookingService(service.slug)?.service, service)
    }
  })

  await t.test(
    "Wild Glow Express cannot activate from a guessed 20-minute event",
    () => {
      const express = findBookingService("wild-glow-express-facial")?.service

      assert.ok(express)
      assert.deepEqual(express.calendarBooking, {
        kind: "inquiry-only",
        reason: "group-duration-unconfirmed",
      })
      assert.deepEqual(express.guestRange, { minimum: 4 })
      assert.equal(
        isExactCalEventForBookingService(express, {
          lengthInMinutes: 20,
          slug: express.slug,
          title: express.title,
        }),
        false
      )
    }
  )

  await t.test(
    "each eligible service requires an exact slug, title, and duration",
    () => {
      const eligible = services.filter(
        (service) => service.calendarBooking.kind === "exact-event"
      )

      assert.equal(eligible.length, 10)
      for (const service of eligible) {
        assert.equal(service.calendarBooking.kind, "exact-event")
        const exactEvent = {
          lengthInMinutes: service.calendarBooking.durationMinutes,
          slug: service.slug,
          title: service.title,
        }

        assert.equal(
          isExactCalEventForBookingService(service, exactEvent),
          true,
          `${service.slug} should accept its exact event`
        )
        assert.equal(
          isExactCalEventForBookingService(service, {
            ...exactEvent,
            lengthInMinutes: exactEvent.lengthInMinutes + 1,
          }),
          false,
          `${service.slug} should reject a duration mismatch`
        )
        assert.equal(
          isExactCalEventForBookingService(service, {
            ...exactEvent,
            slug: `${exactEvent.slug}-other`,
          }),
          false,
          `${service.slug} should reject a slug mismatch`
        )
        assert.equal(
          isExactCalEventForBookingService(service, {
            ...exactEvent,
            title: `${exactEvent.title} `,
          }),
          true,
          `${service.slug} should tolerate surrounding title whitespace`
        )
        assert.equal(
          isExactCalEventForBookingService(service, {
            ...exactEvent,
            title: `${exactEvent.title} Session`,
          }),
          false,
          `${service.slug} should reject a title mismatch`
        )
      }
    }
  )

  await t.test("group-size boundaries match the published offers", () => {
    assert.deepEqual(findBookingService("private-yoga")?.service.guestRange, {
      maximum: 4,
      minimum: 2,
    })
    assert.deepEqual(
      findBookingService("private-yoga-and-sound")?.service.guestRange,
      { maximum: 4, minimum: 1 }
    )
    assert.deepEqual(
      findBookingService("private-sound-healing")?.service.guestRange,
      { maximum: 8, minimum: 1 }
    )
  })
})

test("booking request presentation stays actionable in both readiness states", async (t) => {
  const recipientEmail = "shannonmarydixon@gmail.com"

  const scenarios = [
    {
      calendarBookingKind: "inquiry-only" as const,
      closed: {
        actionHref:
          "mailto:shannonmarydixon@gmail.com?subject=Booking%20request%3A%20Wild%20Glow%20Express%20Facial",
        actionLabel: "Email Shannon about Wild Glow Express Facial",
        announcement:
          "Use the email link below to arrange this experience directly. The website request form is paused.",
        calendarNote: "",
        description:
          "This experience needs a personal arrangement. The website request form is paused; email Shannon directly below so no details are collected on this page.",
        kind: "direct-email" as const,
        title: "Arrange this experience directly.",
      },
      hasLiveCalendar: false,
      name: "inquiry-only service",
      openAnnouncement: "Send Shannon a request for the next opening below.",
      serviceTitle: "Wild Glow Express Facial",
    },
    {
      calendarBookingKind: "exact-event" as const,
      closed: {
        actionHref:
          "mailto:shannonmarydixon@gmail.com?subject=Booking%20request%3A%20Signature%20Facial",
        actionLabel: "Email Shannon about another time",
        announcement:
          "Live dates and appointment times are available below. The website request form is paused; email Shannon directly for help with another time.",
        calendarNote: "The website request form is paused.",
        description:
          "Live appointment times above remain available. The website request form is paused; email Shannon directly for help with another time.",
        kind: "direct-email" as const,
        title: "Need another time?",
      },
      hasLiveCalendar: true,
      name: "exact Cal service with a live calendar",
      openAnnouncement:
        "Live dates and appointment times are available below. Send Shannon a request below if you need another time.",
      serviceTitle: "Signature Facial",
    },
    {
      calendarBookingKind: "exact-event" as const,
      closed: {
        actionHref:
          "mailto:shannonmarydixon@gmail.com?subject=Booking%20request%3A%20Moon%20Oracle%20Reading",
        actionLabel: "Email Shannon about Moon Oracle Reading",
        announcement:
          "The live calendar is not available for this experience right now. Use the email link below to book directly with Shannon.",
        calendarNote: "",
        description:
          "The live calendar is not available for this experience right now. The website request form is paused; email Shannon directly below so no details are collected on this page.",
        kind: "direct-email" as const,
        title: "Email Shannon to book.",
      },
      hasLiveCalendar: false,
      name: "exact Cal service while its calendar is unavailable",
      openAnnouncement: "Send Shannon a request for the next opening below.",
      serviceTitle: "Moon Oracle Reading",
    },
  ]

  for (const scenario of scenarios) {
    await t.test(`${scenario.name}: collection open`, () => {
      assert.deepEqual(
        getBookingRequestPresentation({
          calendarBookingKind: scenario.calendarBookingKind,
          hasLiveCalendar: scenario.hasLiveCalendar,
          inquiryCollectionReady: true,
          recipientEmail,
          serviceTitle: scenario.serviceTitle,
        }),
        {
          announcement: scenario.openAnnouncement,
          kind: "online-form",
        }
      )
    })

    await t.test(`${scenario.name}: collection paused`, () => {
      assert.deepEqual(
        getBookingRequestPresentation({
          calendarBookingKind: scenario.calendarBookingKind,
          hasLiveCalendar: scenario.hasLiveCalendar,
          inquiryCollectionReady: false,
          recipientEmail,
          serviceTitle: scenario.serviceTitle,
        }),
        scenario.closed
      )
    })
  }
})

test("closed-mode presentation remains connected to the rendered email action", () => {
  const bookingPage = source("app/book/page.tsx")
  const bookingFlow = source("components/booking/booking-request-flow.tsx")
  const calEmbed = source("components/booking/cal-inline-embed.tsx")
  const pausedPanel = source("components/shared/inquiry-collection-paused.tsx")

  assert.match(
    bookingPage,
    /custom arrangements include a direct way to email Shannon/
  )
  assert.match(
    bookingFlow,
    /actionHref=\{bookingRequestPresentation\.actionHref\}/
  )
  assert.match(pausedPanel, /href=\{actionHref\}/)
  assert.doesNotMatch(calEmbed, /Send Shannon a booking request below/)
  assert.match(calEmbed, /shows any other available booking path/)
})
