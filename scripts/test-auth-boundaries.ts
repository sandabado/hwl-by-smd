import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

import { AUTH_LINK_FAILURE, loginAuthFeedback } from "../lib/auth-feedback.ts"
import { safeInternalPath } from "../lib/safe-path.ts"

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
}

test("password recovery has dedicated route metadata", () => {
  const layout = source("app/reset-password/layout.tsx")

  assert.match(layout, /title: "Reset Password \| HWL by SMD"/)
  assert.match(
    layout,
    /description:\s*\n?\s*"Request a secure password reset link for your HWL by SMD account\."/
  )
})

test("account creation presents its existing password rule before submission", () => {
  const form = source("components/auth/login-form.tsx")

  assert.match(form, /if \(password\.length < 8\)/)
  assert.match(form, /minLength=\{8\}/)
  assert.match(
    form,
    /aria-describedby=\{\s*mode === "signup"\s*\? "signup-password-guidance"\s*: undefined\s*\}/
  )
  assert.match(form, /id="signup-password-guidance"/)
  assert.match(form, />\s*Use at least 8 characters\.\s*<\/span>/)
})

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
