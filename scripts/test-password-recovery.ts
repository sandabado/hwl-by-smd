import assert from "node:assert/strict"
import { test } from "node:test"

import {
  completePasswordRecovery,
  PASSWORD_RECOVERY_NEXT_COOKIE,
  PASSWORD_RECOVERY_TOKEN_COOKIE,
  stagePasswordRecovery,
  type PasswordRecoveryDependencies,
} from "../lib/password-recovery.ts"

function cookieValues(values: Record<string, string> = {}) {
  return {
    get(name: string) {
      const value = values[name]
      return value === undefined ? undefined : { value }
    },
  }
}

function completionDependencies(
  calls: Array<{ token_hash: string; type: "recovery" }>,
  options: { error?: unknown | null; values?: Record<string, string> } = {}
): PasswordRecoveryDependencies {
  return {
    createClient: async () => ({
      auth: {
        verifyOtp: async (parameters) => {
          calls.push(parameters)
          return { error: options.error ?? null }
        },
      },
    }),
    getCookieStore: async () => cookieValues(options.values),
  }
}

function sameOriginPost() {
  return new Request("https://www.hwlbysmd.com/auth/recovery/complete", {
    headers: { origin: "https://www.hwlbysmd.com" },
    method: "POST",
  })
}

test("recovery entry stages but does not consume the emailed token", () => {
  const response = stagePasswordRecovery(
    new Request(
      "https://www.hwlbysmd.com/auth/recovery?token_hash=recovery-secret&type=recovery&next=%2Fupdate-password%3Fflow%3Drecovery"
    )
  )

  assert.equal(response.status, 303)
  assert.equal(
    response.headers.get("location"),
    "https://www.hwlbysmd.com/auth/recovery/confirm"
  )
  assert.equal(
    response.headers.get("location")?.includes("recovery-secret"),
    false
  )
  assert.equal(response.headers.get("cache-control"), "no-store")
  assert.equal(response.headers.get("referrer-policy"), "no-referrer")
  assert.match(response.headers.get("set-cookie") ?? "", /hwl-recovery-token=/)
  assert.match(response.headers.get("set-cookie") ?? "", /HttpOnly/i)
  assert.match(response.headers.get("set-cookie") ?? "", /SameSite=Lax/i)
})

test("recovery entry preserves an allowlisted alias-free candidate origin", () => {
  const response = stagePasswordRecovery(
    new Request(
      "https://hwl-candidate.vercel.app/auth/recovery?token_hash=recovery-secret&type=recovery"
    )
  )

  assert.equal(response.status, 303)
  assert.equal(
    response.headers.get("location"),
    "https://hwl-candidate.vercel.app/auth/recovery/confirm"
  )
  assert.equal(
    response.headers.get("location")?.includes("recovery-secret"),
    false
  )
  assert.match(response.headers.get("set-cookie") ?? "", /hwl-recovery-token=/)
})

test("recovery entry rejects malformed or non-recovery links", () => {
  for (const url of [
    "https://www.hwlbysmd.com/auth/recovery?type=recovery",
    "https://www.hwlbysmd.com/auth/recovery?token_hash=safe&type=invite",
  ]) {
    const response = stagePasswordRecovery(new Request(url))
    assert.equal(response.status, 303)
    assert.equal(
      response.headers.get("location"),
      "https://www.hwlbysmd.com/reset-password?error=auth_link_failed"
    )
    assert.equal(response.headers.has("set-cookie"), false)
  }
})

test("recovery entry sanitizes external destinations before staging", () => {
  const response = stagePasswordRecovery(
    new Request(
      "https://www.hwlbysmd.com/auth/recovery?token_hash=recovery-secret&type=recovery&next=https://evil.example/steal"
    )
  )
  const cookies = response.headers.get("set-cookie") ?? ""

  assert.match(cookies, /hwl-recovery-next=/)
  assert.equal(cookies.includes("evil.example"), false)
})

test("same-origin confirmation verifies recovery and opens password setup", async () => {
  const calls: Array<{ token_hash: string; type: "recovery" }> = []
  const response = await completePasswordRecovery(
    sameOriginPost(),
    completionDependencies(calls, {
      values: {
        [PASSWORD_RECOVERY_TOKEN_COOKIE]: "recovery-secret",
        [PASSWORD_RECOVERY_NEXT_COOKIE]: "/update-password?flow=recovery",
      },
    })
  )

  assert.deepEqual(calls, [{ token_hash: "recovery-secret", type: "recovery" }])
  assert.equal(response.status, 303)
  assert.equal(
    response.headers.get("location"),
    "https://www.hwlbysmd.com/update-password?flow=recovery"
  )
  assert.equal(
    response.headers.get("location")?.includes("recovery-secret"),
    false
  )
  assert.match(response.headers.get("set-cookie") ?? "", /Max-Age=0/i)
})

test("confirmation rejects cross-origin posts without consuming recovery", async () => {
  const calls: Array<{ token_hash: string; type: "recovery" }> = []
  const response = await completePasswordRecovery(
    new Request("https://www.hwlbysmd.com/auth/recovery/complete", {
      headers: { origin: "https://evil.example" },
      method: "POST",
    }),
    completionDependencies(calls)
  )

  assert.equal(response.status, 403)
  assert.deepEqual(calls, [])
  assert.equal(response.headers.get("cache-control"), "no-store")
})

test("expired recovery returns a sanitized retry path", async () => {
  const calls: Array<{ token_hash: string; type: "recovery" }> = []
  const response = await completePasswordRecovery(
    sameOriginPost(),
    completionDependencies(calls, {
      error: new Error("private provider detail"),
      values: {
        [PASSWORD_RECOVERY_TOKEN_COOKIE]: "recovery-secret",
        [PASSWORD_RECOVERY_NEXT_COOKIE]: "/update-password?flow=recovery",
      },
    })
  )

  assert.equal(
    response.headers.get("location"),
    "https://www.hwlbysmd.com/reset-password?error=auth_link_failed"
  )
  assert.equal(response.headers.get("location")?.includes("private"), false)
  assert.equal(response.headers.get("location")?.includes("recovery"), false)
})
