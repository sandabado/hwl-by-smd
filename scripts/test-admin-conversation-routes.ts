import assert from "node:assert/strict"
import { test } from "node:test"

import { POST as handleAdminBookingCta } from "../app/admin/api/conversations/booking-cta/route.ts"
import { POST as handleAdminConversationReply } from "../app/admin/api/conversations/reply/route.ts"
import { isAdminConversationReplyReady } from "../lib/relationships/messaging-readiness.ts"

const ORIGIN = "https://www.hwlbysmd.com"
const CONVERSATION_ID = "00000000-0000-4000-8000-000000000106"

type RouteScenario = {
  handle: (request: Request) => Promise<Response>
  maximumBytes: number
  malformedError: string
  name: string
  oversizedError: string
  path: string
  validPayload: Record<string, unknown>
}

const scenarios: readonly RouteScenario[] = [
  {
    handle: handleAdminConversationReply,
    maximumBytes: 16_000,
    malformedError: "A JSON request is required.",
    name: "admin conversation reply",
    oversizedError: "Message is too large.",
    path: "/admin/api/conversations/reply",
    validPayload: {
      body: "A careful reply.",
      conversationId: CONVERSATION_ID,
    },
  },
  {
    handle: handleAdminBookingCta,
    maximumBytes: 8_000,
    malformedError: "A valid JSON request is required.",
    name: "admin booking CTA",
    oversizedError: "The booking-link request is too large.",
    path: "/admin/api/conversations/booking-cta",
    validPayload: {
      conversationId: CONVERSATION_ID,
      durationMinutes: 30,
      message: "Want to lock this in?",
      service: "beauty",
    },
  },
]

test("admin conversation replies remain fail closed until explicitly opened", () => {
  assert.equal(isAdminConversationReplyReady(), false)
  assert.equal(isAdminConversationReplyReady("false"), false)
  assert.equal(isAdminConversationReplyReady("TRUE"), false)
  assert.equal(isAdminConversationReplyReady(" true "), false)
  assert.equal(isAdminConversationReplyReady("true"), true)
})

function resetAuthenticationCalls() {
  Reflect.set(globalThis, "__hwlAdminApiAuthenticationCalls", 0)
  Reflect.set(globalThis, "__hwlAdminApiAuthenticationMode", "denied")
  Reflect.set(globalThis, "__hwlAdminClientCreationCalls", 0)
}

function authenticationCalls() {
  return Reflect.get(globalThis, "__hwlAdminApiAuthenticationCalls") as number
}

function adminClientCreationCalls() {
  return Reflect.get(globalThis, "__hwlAdminClientCreationCalls") as number
}

function jsonRequest(
  scenario: RouteScenario,
  body: string,
  options: { includeOrigin?: boolean } = {}
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (options.includeOrigin !== false) headers.Origin = ORIGIN

  return new Request(`${ORIGIN}${scenario.path}`, {
    body,
    headers,
    method: "POST",
  })
}

function oversizedChunkedRequest(scenario: RouteScenario) {
  const firstChunkSize = Math.floor(scenario.maximumBytes / 2)
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(firstChunkSize).fill(0x78))
      controller.enqueue(
        new Uint8Array(scenario.maximumBytes - firstChunkSize + 1).fill(0x78)
      )
      controller.close()
    },
  })
  const request = new Request(`${ORIGIN}${scenario.path}`, {
    body,
    duplex: "half",
    headers: {
      "Content-Type": "application/json",
      Origin: ORIGIN,
    },
    method: "POST",
  } as RequestInit & { duplex: "half" })

  assert.equal(request.headers.get("content-length"), null)
  return request
}

for (const scenario of scenarios) {
  test(`${scenario.name} requires an explicit same-origin Origin header before auth`, async () => {
    resetAuthenticationCalls()
    const request = jsonRequest(
      scenario,
      JSON.stringify(scenario.validPayload),
      { includeOrigin: false }
    )
    const response = await scenario.handle(request)

    assert.equal(response.status, 403)
    assert.deepEqual(await response.json(), { error: "Request not allowed." })
    assert.equal(request.bodyUsed, false)
    assert.equal(authenticationCalls(), 0)
  })

  test(`${scenario.name} rejects malformed JSON before auth`, async () => {
    resetAuthenticationCalls()
    const response = await scenario.handle(
      jsonRequest(scenario, '{"incomplete":')
    )

    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), { error: scenario.malformedError })
    assert.equal(authenticationCalls(), 0)
  })

  test(`${scenario.name} rejects an oversized no-Content-Length stream before auth`, async () => {
    resetAuthenticationCalls()
    const response = await scenario.handle(oversizedChunkedRequest(scenario))

    assert.equal(response.status, 413)
    assert.deepEqual(await response.json(), { error: scenario.oversizedError })
    assert.equal(authenticationCalls(), 0)
  })

  test(`${scenario.name} authenticates after a valid bounded JSON envelope`, async () => {
    resetAuthenticationCalls()
    const response = await scenario.handle(
      jsonRequest(scenario, JSON.stringify(scenario.validPayload))
    )

    assert.equal(response.status, 503)
    assert.deepEqual(await response.json(), {
      error: "Administrator access is not configured.",
    })
    assert.equal(authenticationCalls(), 1)
  })
}

test("an authenticated hosted admin still reaches the closed reply gate before any database access", async () => {
  const originalReady = process.env.ADMIN_CLIENT_MESSAGING_READY
  resetAuthenticationCalls()
  Reflect.set(globalThis, "__hwlAdminApiAuthenticationMode", "authorized")
  process.env.ADMIN_CLIENT_MESSAGING_READY = "false"

  try {
    const response = await handleAdminConversationReply(
      jsonRequest(
        scenarios[0],
        JSON.stringify(scenarios[0]?.validPayload ?? {})
      )
    )

    assert.equal(response.status, 503)
    assert.deepEqual(await response.json(), {
      error:
        "Client replies remain read only until delivery notifications and the audit trail are verified.",
    })
    assert.equal(authenticationCalls(), 1)
    assert.equal(adminClientCreationCalls(), 0)
  } finally {
    Reflect.set(globalThis, "__hwlAdminApiAuthenticationMode", "denied")
    if (originalReady === undefined) {
      delete process.env.ADMIN_CLIENT_MESSAGING_READY
    } else {
      process.env.ADMIN_CLIENT_MESSAGING_READY = originalReady
    }
  }
})
