import assert from "node:assert/strict"
import { test } from "node:test"

import { AUTH_LINK_FAILURE, loginAuthFeedback } from "../lib/auth-feedback.ts"
import { safeInternalPath } from "../lib/safe-path.ts"

test("login auth feedback accepts only stable error codes", async (t) => {
  for (const input of [
    { legacyOrNormalizedError: "auth_link_failed" },
    { legacyOrNormalizedError: "confirmation_failed" },
    { errorCode: "otp_expired" },
    { errorCode: "access_denied" },
  ]) {
    await t.test(`maps ${JSON.stringify(input)} to friendly copy`, () => {
      assert.deepEqual(loginAuthFeedback(input), AUTH_LINK_FAILURE)
    })
  }

  await t.test("never reflects arbitrary provider input", () => {
    const hostile = '<img src=x onerror="alert(1)">'
    const feedback = loginAuthFeedback({
      errorCode: hostile,
      legacyOrNormalizedError: "arbitrary-provider-description",
    })

    assert.equal(feedback, null)
    assert.equal(JSON.stringify(AUTH_LINK_FAILURE).includes(hostile), false)
  })
})

test("auth redirect destinations remain same-origin paths", async (t) => {
  await t.test("preserves a valid internal path, query, and hash", () => {
    assert.equal(
      safeInternalPath(
        "/checkout/success?session_id=cs_test_123#receipt",
        "/library"
      ),
      "/checkout/success?session_id=cs_test_123#receipt"
    )
  })

  const hostileCases = [
    "https://evil.example/steal",
    "//evil.example/steal",
    "/%2f%2fevil.example/steal",
    "/\\evil.example/steal",
    "/%5cevil.example/steal",
    "/%0a//evil.example/steal",
    "/%09//evil.example/steal",
    "/a/..//evil.example/steal",
    "/%2e%2e//evil.example/steal",
    "/%E0%A4%A",
  ]

  for (const value of hostileCases) {
    await t.test(`rejects ${JSON.stringify(value)}`, () => {
      assert.equal(safeInternalPath(value, "/library"), "/library")
    })
  }
})
