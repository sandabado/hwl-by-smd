import assert from "node:assert/strict"
import { test } from "node:test"

import {
  bookingPillars,
  findBookingService,
  isExactCalEventForBookingService,
} from "../lib/booking-services.ts"
import { getCalcomPublicEventTypes } from "../lib/calcom.ts"

const services = bookingPillars.flatMap((pillar) => pillar.services)

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
