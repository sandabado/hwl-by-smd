import assert from "node:assert/strict"
import { test } from "node:test"

import {
  CALCOM_ADMIN_BOOKING_QUEUES,
  getCalcomAdminBookings,
  parseCalcomAdminBooking,
} from "../lib/bookings/calcom-admin.ts"

const ADMIN_ACCESS = {
  email: "shannon@hwlbysmd.com",
  source: "supabase",
  userId: "3e218daf-e254-43c6-93cc-20fe50a9f829",
} as const

function bookingFixture(overrides: Readonly<Record<string, unknown>> = {}) {
  return {
    attendees: [
      {
        email: "Client@Example.com",
        name: "Client Name",
        phoneNumber: "+15555550101",
        timeZone: "America/New_York",
      },
    ],
    bookingFieldsResponses: { privateIntake: "must not be retained" },
    end: "2026-09-20T19:00:00.000Z",
    eventType: { id: 42, slug: "signature-facial" },
    location: "https://example.com/private-meeting-url",
    meetingUrl: "https://example.com/private-meeting-url",
    start: "2026-09-20T18:00:00.000Z",
    status: "accepted",
    title: "Signature Facial",
    uid: "booking-uid-123",
    ...overrides,
  }
}

function successResponse(data: readonly unknown[] = [bookingFixture()]) {
  return new Response(
    JSON.stringify({
      data,
      pagination: { hasMore: false, nextCursor: null },
      status: "success",
    }),
    { headers: { "Content-Type": "application/json" }, status: 200 }
  )
}

function profileResponse(overrides: Readonly<Record<string, unknown>> = {}) {
  return new Response(
    JSON.stringify({
      data: {
        email: "shannon@hwlbysmd.com",
        id: 123,
        username: "hwlbysmd",
        ...overrides,
      },
      status: "success",
    }),
    { headers: { "Content-Type": "application/json" }, status: 200 }
  )
}

test("Cal.com admin booking parser retains only the minimal operations DTO", () => {
  const booking = parseCalcomAdminBooking(bookingFixture(), "upcoming")

  assert.deepEqual(booking, {
    attendeeEmail: "client@example.com",
    attendeeName: "Client Name",
    attendeeTimeZone: "America/New_York",
    endAt: "2026-09-20T19:00:00.000Z",
    locationSummary: "Online",
    providerStatus: "accepted",
    queue: "upcoming",
    serviceSlug: "signature-facial",
    serviceTitle: "Signature Facial",
    startAt: "2026-09-20T18:00:00.000Z",
    uid: "booking-uid-123",
  })
  assert.ok(booking)
  assert.equal("phoneNumber" in booking, false)
  assert.equal("bookingFieldsResponses" in booking, false)
  assert.equal("meetingUrl" in booking, false)
})

test("Cal.com admin booking parser rejects malformed required fields", () => {
  for (const invalid of [
    bookingFixture({ attendees: [] }),
    bookingFixture({ end: "not-a-date" }),
    bookingFixture({ end: "2026-09-20T17:00:00.000Z" }),
    bookingFixture({ uid: "" }),
  ]) {
    assert.equal(parseCalcomAdminBooking(invalid, "upcoming"), null)
  }
})

test("Cal.com admin listing stays disabled without a private key", async () => {
  const originalKey = process.env.CALCOM_API_KEY
  const originalFetch = globalThis.fetch
  let fetchCalled = false

  delete process.env.CALCOM_API_KEY
  globalThis.fetch = async () => {
    fetchCalled = true
    return successResponse()
  }

  try {
    assert.deepEqual(await getCalcomAdminBookings(ADMIN_ACCESS), {
      queues: {
        cancelled: [],
        past: [],
        unconfirmed: [],
        upcoming: [],
      },
      status: "not-configured",
    })
  } finally {
    if (originalKey === undefined) delete process.env.CALCOM_API_KEY
    else process.env.CALCOM_API_KEY = originalKey
    globalThis.fetch = originalFetch
  }

  assert.equal(fetchCalled, false)
})

test("Cal.com admin listing never reads a provider from the signed local preview", async () => {
  const originalFetch = globalThis.fetch
  let fetchCalled = false
  globalThis.fetch = async () => {
    fetchCalled = true
    return profileResponse()
  }

  try {
    assert.deepEqual(
      await getCalcomAdminBookings({
        email: "local-preview",
        source: "local-preview",
        userId: null,
      }),
      {
        queues: {
          cancelled: [],
          past: [],
          unconfirmed: [],
          upcoming: [],
        },
        status: "local-preview",
      }
    )
  } finally {
    globalThis.fetch = originalFetch
  }

  assert.equal(fetchCalled, false)
})

test("Cal.com admin listing requests each official queue without exposing its key", async () => {
  const originalKey = process.env.CALCOM_API_KEY
  const originalFetch = globalThis.fetch
  const requests: Array<{ init?: RequestInit; url: string }> = []
  process.env.CALCOM_API_KEY = "cal_test_private_admin_fixture"

  globalThis.fetch = async (input, init) => {
    requests.push({ init, url: input.toString() })
    return input.toString() === "https://api.cal.com/v2/me"
      ? profileResponse()
      : successResponse()
  }

  try {
    const result = await getCalcomAdminBookings(ADMIN_ACCESS)
    assert.equal(result.status, "available")
    if (result.status === "available") {
      for (const queue of CALCOM_ADMIN_BOOKING_QUEUES) {
        assert.equal(result.queues[queue].length, 1)
        assert.equal(result.queues[queue][0]?.queue, queue)
        assert.equal(result.hasMore[queue], false)
      }
    }
  } finally {
    if (originalKey === undefined) delete process.env.CALCOM_API_KEY
    else process.env.CALCOM_API_KEY = originalKey
    globalThis.fetch = originalFetch
  }

  assert.equal(requests.length, 5)
  const profileRequest = requests[0]
  assert.equal(profileRequest?.url, "https://api.cal.com/v2/me")
  assert.equal(
    new Headers(profileRequest?.init?.headers).get("authorization"),
    "Bearer cal_test_private_admin_fixture"
  )
  assert.deepEqual(
    requests
      .filter(({ url }) => url !== "https://api.cal.com/v2/me")
      .map(({ url }) => new URL(url).searchParams.get("status"))
      .toSorted(),
    [...CALCOM_ADMIN_BOOKING_QUEUES].toSorted()
  )

  for (const request of requests.slice(1)) {
    const url = new URL(request.url)
    const headers = new Headers(request.init?.headers)
    assert.equal(url.origin + url.pathname, "https://api.cal.com/v2/bookings")
    assert.equal(url.searchParams.get("limit"), "50")
    assert.equal(headers.get("cal-api-version"), "2026-05-01")
    assert.equal(
      headers.get("authorization"),
      "Bearer cal_test_private_admin_fixture"
    )
    assert.equal(request.init?.cache, "no-store")
    assert.ok(request.init?.signal instanceof AbortSignal)
  }
})

test("Cal.com admin listing rejects a key for any non-canonical account before booking PII is requested", async () => {
  const originalKey = process.env.CALCOM_API_KEY
  const originalFetch = globalThis.fetch
  const requestedUrls: string[] = []
  process.env.CALCOM_API_KEY = "cal_test_wrong_account_fixture"

  globalThis.fetch = async (input) => {
    requestedUrls.push(input.toString())
    return profileResponse({
      email: "someone@example.com",
      username: "another-account",
    })
  }

  try {
    const result = await getCalcomAdminBookings(ADMIN_ACCESS)
    assert.deepEqual(result, {
      queues: {
        cancelled: [],
        past: [],
        unconfirmed: [],
        upcoming: [],
      },
      reason: "account-mismatch",
      status: "unavailable",
    })
  } finally {
    if (originalKey === undefined) delete process.env.CALCOM_API_KEY
    else process.env.CALCOM_API_KEY = originalKey
    globalThis.fetch = originalFetch
  }

  assert.deepEqual(requestedUrls, ["https://api.cal.com/v2/me"])
})

test("Cal.com admin listing fails closed for provider and transport errors", async (t) => {
  const originalKey = process.env.CALCOM_API_KEY
  const originalFetch = globalThis.fetch
  process.env.CALCOM_API_KEY = "cal_test_private_admin_fixture"

  try {
    await t.test("non-success HTTP response", async () => {
      globalThis.fetch = async (input) =>
        input.toString() === "https://api.cal.com/v2/me"
          ? profileResponse()
          : new Response(null, { status: 401 })
      const result = await getCalcomAdminBookings(ADMIN_ACCESS)
      assert.equal(result.status, "unavailable")
      if (result.status === "unavailable") {
        assert.equal(result.reason, "http-error")
      }
    })

    await t.test("malformed provider data", async () => {
      globalThis.fetch = async (input) =>
        input.toString() === "https://api.cal.com/v2/me"
          ? profileResponse()
          : successResponse([{ uid: "incomplete" }])
      const result = await getCalcomAdminBookings(ADMIN_ACCESS)
      assert.equal(result.status, "unavailable")
      if (result.status === "unavailable") {
        assert.equal(result.reason, "invalid-response")
      }
    })

    await t.test("transport exception", async () => {
      globalThis.fetch = async (input) => {
        if (input.toString() === "https://api.cal.com/v2/me") {
          return profileResponse()
        }
        throw new Error("fixture transport failure")
      }
      const result = await getCalcomAdminBookings(ADMIN_ACCESS)
      assert.equal(result.status, "unavailable")
      if (result.status === "unavailable") {
        assert.equal(result.reason, "request-error")
      }
    })
  } finally {
    if (originalKey === undefined) delete process.env.CALCOM_API_KEY
    else process.env.CALCOM_API_KEY = originalKey
    globalThis.fetch = originalFetch
  }
})
