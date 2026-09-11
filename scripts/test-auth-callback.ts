import assert from "node:assert/strict"
import { test } from "node:test"

import {
  handleAuthCallback,
  type AuthCallbackDependencies,
} from "../lib/auth-callback.ts"

type Calls = {
  exchange: string[]
  verify: Array<{ token_hash: string; type: "invite" | "magiclink" }>
}

function dependencies(
  calls: Calls,
  overrides: {
    exchangeError?: unknown | null
    verifyError?: unknown | null
  } = {}
): AuthCallbackDependencies {
  return {
    createClient: async () => ({
      auth: {
        exchangeCodeForSession: async (code) => {
          calls.exchange.push(code)
          return { error: overrides.exchangeError ?? null }
        },
        verifyOtp: async (parameters) => {
          calls.verify.push(parameters)
          return { error: overrides.verifyError ?? null }
        },
      },
    }),
  }
}

function callLog(): Calls {
  return { exchange: [], verify: [] }
}

test("auth callback exchanges browser-initiated PKCE codes", async () => {
  const calls = callLog()
  const response = await handleAuthCallback(
    new Request(
      "https://www.hwlbysmd.com/auth/callback?code=safe-code&next=/account"
    ),
    dependencies(calls)
  )

  assert.deepEqual(calls.exchange, ["safe-code"])
  assert.deepEqual(calls.verify, [])
  assert.equal(response.status, 307)
  assert.equal(
    response.headers.get("location"),
    "https://www.hwlbysmd.com/account"
  )
  assert.equal(response.headers.get("cache-control"), "no-store")
})

test("auth callback verifies an invite token hash on the server", async () => {
  const calls = callLog()
  const response = await handleAuthCallback(
    new Request(
      "https://www.hwlbysmd.com/auth/callback?token_hash=invite-secret&type=invite&next=/update-password"
    ),
    dependencies(calls)
  )

  assert.deepEqual(calls.exchange, [])
  assert.deepEqual(calls.verify, [
    { token_hash: "invite-secret", type: "invite" },
  ])
  assert.equal(response.status, 307)
  assert.equal(
    response.headers.get("location"),
    "https://www.hwlbysmd.com/update-password"
  )
  assert.equal(
    response.headers.get("location")?.includes("invite-secret"),
    false
  )
})

test("invite callbacks default to the password setup page", async () => {
  const calls = callLog()
  const response = await handleAuthCallback(
    new Request(
      "https://www.hwlbysmd.com/auth/callback?token_hash=invite-secret&type=invite"
    ),
    dependencies(calls)
  )

  assert.equal(
    response.headers.get("location"),
    "https://www.hwlbysmd.com/update-password"
  )
})

test("invite callbacks reject external destinations", async () => {
  const calls = callLog()
  const response = await handleAuthCallback(
    new Request(
      "https://www.hwlbysmd.com/auth/callback?token_hash=invite-secret&type=invite&next=https://evil.example/steal"
    ),
    dependencies(calls)
  )

  assert.equal(
    response.headers.get("location"),
    "https://www.hwlbysmd.com/update-password"
  )
})

test("auth callback verifies a magic link token hash on the server", async () => {
  const calls = callLog()
  const response = await handleAuthCallback(
    new Request(
      "https://www.hwlbysmd.com/auth/callback?token_hash=private-token&type=magiclink&next=%2Fbeauty%2Flift%3Fcart%3Dopen"
    ),
    dependencies(calls)
  )

  assert.deepEqual(calls.exchange, [])
  assert.deepEqual(calls.verify, [
    { token_hash: "private-token", type: "magiclink" },
  ])
  assert.equal(response.status, 307)
  assert.equal(
    response.headers.get("location"),
    "https://www.hwlbysmd.com/beauty/lift?cart=open"
  )
  assert.equal(
    response.headers.get("location")?.includes("private-token"),
    false
  )
})

test("magic link callbacks reject external destinations", async () => {
  const calls = callLog()
  const response = await handleAuthCallback(
    new Request(
      "https://www.hwlbysmd.com/auth/callback?token_hash=private-token&type=magiclink&next=https://evil.example/steal"
    ),
    dependencies(calls)
  )

  assert.deepEqual(calls.verify, [
    { token_hash: "private-token", type: "magiclink" },
  ])
  assert.equal(
    response.headers.get("location"),
    "https://www.hwlbysmd.com/library"
  )
})

test("unsupported token types fail closed without provider verification", async () => {
  const calls = callLog()
  const response = await handleAuthCallback(
    new Request(
      "https://www.hwlbysmd.com/auth/callback?token_hash=private-token&type=recovery"
    ),
    dependencies(calls)
  )

  assert.deepEqual(calls.exchange, [])
  assert.deepEqual(calls.verify, [])
  assert.equal(response.status, 307)
  assert.equal(
    response.headers.get("location"),
    "https://www.hwlbysmd.com/login?error=auth_link_failed&redirectTo=%2Flibrary"
  )
  assert.equal(
    response.headers.get("location")?.includes("private-token"),
    false
  )
})

test("provider failures return one sanitized login state", async (t) => {
  await t.test("verification error", async () => {
    const calls = callLog()
    const response = await handleAuthCallback(
      new Request(
        "https://www.hwlbysmd.com/auth/callback?token_hash=private-token&type=invite"
      ),
      dependencies(calls, { verifyError: new Error("private provider detail") })
    )

    assert.equal(
      response.headers.get("location"),
      "https://www.hwlbysmd.com/login?error=auth_link_failed&redirectTo=%2Fupdate-password"
    )
    assert.equal(response.headers.get("location")?.includes("private"), false)
  })

  await t.test("missing client", async () => {
    const response = await handleAuthCallback(
      new Request("https://www.hwlbysmd.com/auth/callback?code=private-code"),
      { createClient: async () => null }
    )

    assert.equal(response.status, 307)
    assert.equal(
      response.headers.get("location"),
      "https://www.hwlbysmd.com/login?error=auth_link_failed&redirectTo=%2Flibrary"
    )
    assert.equal(
      response.headers.get("location")?.includes("private-code"),
      false
    )
  })

  await t.test("unexpected exception", async () => {
    const response = await handleAuthCallback(
      new Request("https://www.hwlbysmd.com/auth/callback?code=private-code"),
      {
        createClient: async () => {
          throw new Error("private provider detail")
        },
      }
    )

    assert.equal(response.status, 307)
    assert.equal(response.headers.get("location")?.includes("private"), false)
  })
})
