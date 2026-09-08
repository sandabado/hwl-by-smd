import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

import {
  bookingPillars,
  findBookingService,
  getBookingHref,
  getBookingPillar,
  getBookingServiceAction,
  getInitialBookingStep,
  isExactCalEventForBookingService,
  normalizeBookingServiceSlug,
} from "../lib/booking-services.ts"
import { getBookingRequestPresentation } from "../lib/booking-request-presentation.ts"
import {
  resolveCalcomBookingLinks,
  resolveCalcomBookingOptions,
} from "../lib/calcom-booking-links.ts"
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

test("Cal.com discovery treats price and currency as required authority", async (t) => {
  const originalFetch = globalThis.fetch
  const signatureFacial = findBookingService("signature-facial")?.service

  assert.ok(signatureFacial?.calendarBooking.kind === "exact-event")

  const fetchEventTypes = async (data: readonly unknown[]) => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ data, status: "success" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      })

    return getCalcomPublicEventTypes()
  }

  const validEvent = {
    confirmationPolicy: {
      blockUnconfirmedBookingsInBooker: true,
      type: "always",
    },
    currency: "USD",
    id: 101,
    lengthInMinutes: signatureFacial.calendarBooking.durationMinutes,
    price: signatureFacial.payment.unitAmountMinor,
    slug: signatureFacial.slug,
    title: signatureFacial.title,
  }

  try {
    await t.test(
      "zero and exact paid prices parse without losing cents",
      async () => {
        assert.deepEqual(
          await fetchEventTypes([
            { ...validEvent, id: 102, price: 0 },
            validEvent,
          ]),
          {
            eventTypes: [
              {
                confirmationRequired: true,
                currency: "usd",
                id: 102,
                lengthInMinutes: validEvent.lengthInMinutes,
                price: 0,
                slug: validEvent.slug,
                title: validEvent.title,
                url: `https://cal.com/hwlbysmd/${signatureFacial.slug}`,
              },
              {
                confirmationRequired: true,
                currency: "usd",
                id: validEvent.id,
                lengthInMinutes: validEvent.lengthInMinutes,
                price: validEvent.price,
                slug: validEvent.slug,
                title: validEvent.title,
                url: `https://cal.com/hwlbysmd/${signatureFacial.slug}`,
              },
            ],
            status: "available",
          }
        )
      }
    )

    for (const [name, override] of [
      ["missing price", { price: undefined }],
      ["string price", { price: "27700" }],
      ["fractional price", { price: 27700.5 }],
      ["negative price", { price: -1 }],
      ["missing currency", { currency: undefined }],
      ["malformed currency", { currency: "US dollars" }],
      ["missing confirmation policy", { confirmationPolicy: undefined }],
      [
        "malformed confirmation policy",
        {
          confirmationPolicy: {
            blockUnconfirmedBookingsInBooker: "yes",
            type: "always",
          },
        },
      ],
    ] as const) {
      await t.test(`${name} fails the complete provider response`, async () => {
        assert.deepEqual(
          await fetchEventTypes([{ ...validEvent, ...override }]),
          {
            eventTypes: [],
            reason: "invalid-response",
            status: "unavailable",
          }
        )
      })
    }
  } finally {
    globalThis.fetch = originalFetch
  }
})

test("Cal.com booking links preserve request-only discovery authority and fail closed", async (t) => {
  const signatureFacial = findBookingService("signature-facial")?.service
  const moonOracle = findBookingService("moon-oracle-reading")?.service

  assert.ok(signatureFacial?.calendarBooking.kind === "exact-event")
  assert.ok(moonOracle?.calendarBooking.kind === "exact-event")
  const signatureFacialDuration =
    signatureFacial.calendarBooking.durationMinutes
  const moonOracleDuration = moonOracle.calendarBooking.durationMinutes

  await t.test("an available response still requires every exact match", () => {
    assert.deepEqual(
      resolveCalcomBookingLinks({
        eventTypes: [
          {
            confirmationRequired: true,
            currency: signatureFacial.payment.currency,
            id: 1,
            lengthInMinutes: signatureFacialDuration,
            price: 0,
            slug: signatureFacial.slug,
            title: signatureFacial.title,
            url: `https://cal.com/hwlbysmd/${signatureFacial.slug}`,
          },
          {
            confirmationRequired: true,
            currency: moonOracle.payment.currency,
            id: 2,
            lengthInMinutes: moonOracleDuration,
            price: 0,
            slug: moonOracle.slug,
            title: `${moonOracle.title} Session`,
            url: `https://cal.com/hwlbysmd/${moonOracle.slug}`,
          },
        ],
        status: "available",
      }),
      {
        [signatureFacial.slug]: `https://cal.com/hwlbysmd/${signatureFacial.slug}`,
      }
    )
  })

  await t.test(
    "request-only events must remain free in the booking calendar",
    () => {
      const freeEvent = {
        confirmationRequired: true,
        currency: signatureFacial.payment.currency,
        id: 3,
        lengthInMinutes: signatureFacialDuration,
        price: 0,
        slug: signatureFacial.slug,
        title: signatureFacial.title,
        url: `https://cal.com/hwlbysmd/${signatureFacial.slug}`,
      }
      const paidEvent = {
        ...freeEvent,
        id: 4,
        price: signatureFacial.payment.unitAmountMinor,
      }

      assert.deepEqual(
        resolveCalcomBookingOptions({
          eventTypes: [freeEvent],
          status: "available",
        }),
        {
          [signatureFacial.slug]: {
            currency: "usd",
            paymentState: "not_required",
            priceMinor: 0,
            url: freeEvent.url,
          },
        }
      )
      assert.deepEqual(
        resolveCalcomBookingOptions({
          eventTypes: [paidEvent],
          status: "available",
        }),
        {}
      )
    }
  )

  await t.test(
    "an event that no longer requires Shannon's confirmation stays hidden",
    () => {
      const autoConfirmedEvent = {
        confirmationRequired: false,
        currency: signatureFacial.payment.currency,
        id: 5,
        lengthInMinutes: signatureFacialDuration,
        price: 0,
        slug: signatureFacial.slug,
        title: signatureFacial.title,
        url: `https://cal.com/hwlbysmd/${signatureFacial.slug}`,
      }

      assert.deepEqual(
        resolveCalcomBookingOptions({
          eventTypes: [autoConfirmedEvent],
          status: "available",
        }),
        {}
      )
    }
  )

  await t.test("paid or wrong-currency variants cannot produce a link", () => {
    const baseEvent = {
      confirmationRequired: true,
      currency: signatureFacial.payment.currency,
      id: 5,
      lengthInMinutes: signatureFacialDuration,
      price: 0,
      slug: signatureFacial.slug,
      title: signatureFacial.title,
      url: `https://cal.com/hwlbysmd/${signatureFacial.slug}`,
    }

    for (const eventType of [
      { ...baseEvent, price: signatureFacial.payment.unitAmountMinor },
      { ...baseEvent, currency: "eur" },
    ]) {
      assert.deepEqual(
        resolveCalcomBookingOptions({
          eventTypes: [eventType],
          status: "available",
        }),
        {}
      )
    }
  })

  await t.test(
    "provider outages never guess a request-only booking URL",
    () => {
      for (const reason of [
        "http-error",
        "invalid-response",
        "request-error",
      ] as const) {
        assert.deepEqual(
          resolveCalcomBookingOptions({
            eventTypes: [],
            reason,
            status: "unavailable",
          }),
          {},
          `${reason} must not expose an unverified fallback link`
        )
      }
    }
  )

  await t.test(
    "an available empty response does not guess that events are published",
    () => {
      assert.deepEqual(
        resolveCalcomBookingLinks({ eventTypes: [], status: "available" }),
        {}
      )
    }
  )

  for (const reason of [
    "http-error",
    "invalid-response",
    "request-error",
  ] as const) {
    await t.test(`${reason} never guesses direct booking links`, () => {
      const links = resolveCalcomBookingLinks({
        eventTypes: [],
        reason,
        status: "unavailable",
      })
      assert.deepEqual(links, {})
    })
  }
})

test("booking catalog keeps available Cal discovery exact", async (t) => {
  await t.test("query values resolve to one truthful initial step", () => {
    assert.equal(normalizeBookingServiceSlug(undefined), undefined)
    assert.equal(normalizeBookingServiceSlug("  "), undefined)
    assert.equal(
      normalizeBookingServiceSlug(["signature-facial", "moon-oracle-reading"]),
      "signature-facial"
    )
    assert.equal(getInitialBookingStep(undefined), "experience")
    assert.equal(getInitialBookingStep("not-a-service"), "experience")
    assert.equal(getInitialBookingStep("signature-facial"), "schedule")
    assert.equal(getInitialBookingStep("wild-glow-express-facial"), "schedule")
  })

  await t.test("all public services have one unique canonical slug", () => {
    const slugs = services.map((service) => service.slug)

    assert.equal(services.length, 11)
    assert.equal(new Set(slugs).size, services.length)
    for (const service of services) {
      assert.equal(findBookingService(service.slug)?.service, service)
    }
  })

  await t.test(
    "catalog helpers preserve pillar authority and truthful booking actions",
    () => {
      assert.equal(getBookingPillar("beauty"), bookingPillars[0])
      assert.equal(getBookingPillar("movement"), bookingPillars[1])
      assert.equal(getBookingPillar("ritual"), bookingPillars[2])

      const exactServices = services.filter(
        (service) => service.calendarBooking.kind === "exact-event"
      )
      const inquiryServices = services.filter(
        (service) => service.calendarBooking.kind === "inquiry-only"
      )

      assert.equal(exactServices.length, 11)
      assert.equal(inquiryServices.length, 0)

      for (const service of services) {
        const expectedHref = `/book?service=${service.slug}#choose-time`

        assert.equal(getBookingHref(service.slug), expectedHref)
        assert.equal(getBookingServiceAction(service).href, expectedHref)
      }

      for (const service of exactServices) {
        assert.deepEqual(getBookingServiceAction(service), {
          href: `/book?service=${service.slug}#choose-time`,
          kind: "book",
          label: "Choose a time",
        })
      }
    }
  )

  await t.test(
    "Wild Glow Express is an individual exact 20-minute booking",
    () => {
      const express = findBookingService("wild-glow-express-facial")?.service

      assert.ok(express)
      assert.deepEqual(express.calendarBooking, {
        durationMinutes: 20,
        kind: "exact-event",
      })
      assert.deepEqual(express.guestRange, { maximum: 1, minimum: 1 })
      assert.equal(express.price, "$111")
      assert.equal(
        isExactCalEventForBookingService(express, {
          lengthInMinutes: 20,
          slug: express.slug,
          title: express.title,
        }),
        true
      )
    }
  )

  await t.test(
    "each eligible service requires an exact slug, title, and duration",
    () => {
      const eligible = services.filter(
        (service) => service.calendarBooking.kind === "exact-event"
      )

      assert.equal(eligible.length, 11)
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

    for (const service of getBookingPillar("movement").services) {
      assert.doesNotMatch(
        service.duration,
        /\+\$\d+/,
        `${service.slug} must not advertise guests beyond its enforced maximum`
      )
    }
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
    /Custom arrangements include a direct way to email her/
  )
  assert.match(
    bookingFlow,
    /actionHref=\{bookingRequestPresentation\.actionHref\}/
  )
  assert.match(pausedPanel, /href=\{actionHref\}/)
  assert.doesNotMatch(calEmbed, /Send Shannon a booking request below/)
  assert.match(calEmbed, /shows any other available booking path/)
})

test("stepped booking keeps navigation and calendar recovery inside the journey", () => {
  const bookingFlow = source("components/booking/booking-request-flow.tsx")
  const calEmbed = source("components/booking/cal-inline-embed.tsx")

  assert.match(bookingFlow, /aria-label="Booking progress"/)
  assert.match(bookingFlow, /aria-current=\{isCurrent \? "step" : undefined\}/)
  assert.match(bookingFlow, /window\.history\.pushState/)
  assert.match(bookingFlow, /window\.addEventListener\("popstate"/)
  assert.match(bookingFlow, /class CalendarEmbedBoundary/)
  assert.match(bookingFlow, /Open in Cal\.com/)
  assert.doesNotMatch(bookingFlow, /settleCalendarPosition|onInitialReady/)
  assert.doesNotMatch(calEmbed, /onInitialReady/)
  assert.doesNotMatch(calEmbed, /styles:\s*\{/)
  assert.match(calEmbed, /cssVarsPerTheme:\s*\{/)
  assert.match(calEmbed, /CAL_BOOKER_LAYOUT = "month_view"/)
  assert.doesNotMatch(calEmbed, /week_view/)
})

test("products and appointments share a review-shelf journey without sharing transaction authority", () => {
  const rootLayout = source("app/layout.tsx")
  const serviceShelf = source(
    "components/services/service-offerings-section.tsx"
  )
  const bookingShelf = source("components/booking/booking-shelf.tsx")
  const bookingTrigger = source("components/booking/select-booking-button.tsx")
  const homepage = source("components/home/hero-entry.tsx")

  assert.match(rootLayout, /<BookingShelfProvider>/)
  assert.match(rootLayout, /<BookingShelf \/>/)
  assert.match(serviceShelf, /<AddToCartButton/)
  assert.match(serviceShelf, /<SelectBookingButton/)
  assert.match(homepage, /<SelectBookingButton/)
  assert.match(bookingTrigger, /aria-haspopup="dialog"/)
  assert.match(bookingTrigger, /data-booking-trigger/)
  assert.match(bookingTrigger, /href=\{action\.href\}/)
  assert.match(bookingTrigger, /event\.preventDefault\(\)/)
  assert.match(bookingShelf, /href=\{action\.href\}/)
  assert.match(bookingShelf, /See available dates & times/)
  assert.match(bookingShelf, /No payment is collected when you request a time/)
  assert.doesNotMatch(bookingShelf, /CheckoutButton|productId|STRIPE/i)
})
