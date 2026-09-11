import assert from "node:assert/strict"
import test from "node:test"

import {
  findNextMemberBooking,
  type MemberBooking,
} from "../lib/bookings/member-bookings.ts"

function booking(
  overrides: Partial<MemberBooking> &
    Pick<MemberBooking, "id" | "startAt" | "endAt">
): MemberBooking {
  return {
    bookingStatus: "confirmed",
    requiresConfirmation: true,
    serviceSlug: "intuitive-tarot-reading",
    serviceTitle: "Intuitive Tarot Reading",
    timeZone: "America/Los_Angeles",
    ...overrides,
  }
}

test("findNextMemberBooking returns the nearest active session", () => {
  const now = Date.parse("2026-09-10T12:00:00.000Z")
  const result = findNextMemberBooking(
    [
      booking({
        id: "later",
        startAt: "2026-09-12T19:00:00.000Z",
        endAt: "2026-09-12T20:00:00.000Z",
      }),
      booking({
        id: "next",
        bookingStatus: "requested",
        startAt: "2026-09-11T19:00:00.000Z",
        endAt: "2026-09-11T20:00:00.000Z",
      }),
    ],
    now
  )

  assert.equal(result?.id, "next")
})

test("findNextMemberBooking excludes past, cancelled, and rejected sessions", () => {
  const now = Date.parse("2026-09-10T12:00:00.000Z")
  const result = findNextMemberBooking(
    [
      booking({
        id: "past",
        startAt: "2026-09-09T19:00:00.000Z",
        endAt: "2026-09-09T20:00:00.000Z",
      }),
      booking({
        id: "cancelled",
        bookingStatus: "cancelled",
        startAt: "2026-09-11T19:00:00.000Z",
        endAt: "2026-09-11T20:00:00.000Z",
      }),
      booking({
        id: "rejected",
        bookingStatus: "rejected",
        startAt: "2026-09-12T19:00:00.000Z",
        endAt: "2026-09-12T20:00:00.000Z",
      }),
    ],
    now
  )

  assert.equal(result, undefined)
})
