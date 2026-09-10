import assert from "node:assert/strict"
import { test } from "node:test"

import { POST as handleConversationRead } from "../app/api/conversations/read/route.ts"
import { POST as handleConversationReply } from "../app/api/conversations/reply/route.ts"

const ORIGIN = "https://www.hwlbysmd.com"
const CONVERSATION_ID = "00000000-0000-4000-8000-000000000106"

type RouteScenario = Readonly<{
  contentTypeStatus: number
  handle: (request: Request) => Promise<Response>
  maximumBytes: number
  malformedError: string
  name: string
  oversizedError: string
  path: string
  validPayload: Record<string, unknown>
}>

const scenarios: readonly RouteScenario[] = [
  {
    contentTypeStatus: 415,
    handle: handleConversationReply,
    malformedError: "A JSON request is required.",
    maximumBytes: 12_000,
    name: "member conversation reply",
    oversizedError: "Message is too large.",
    path: "/api/conversations/reply",
    validPayload: {
      body: "A careful reply.",
      conversationId: CONVERSATION_ID,
    },
  },
  {
    contentTypeStatus: 400,
    handle: handleConversationRead,
    malformedError: "A valid JSON request is required.",
    maximumBytes: 2_000,
    name: "member conversation read receipt",
    oversizedError: "The read request is too large.",
    path: "/api/conversations/read",
    validPayload: { conversationId: CONVERSATION_ID },
  },
]

function resetMemberAccess({
  authenticated = false,
  entitled = false,
}: {
  authenticated?: boolean
  entitled?: boolean
} = {}) {
  Reflect.set(globalThis, "__hwlMemberAuthenticationCalls", 0)
  Reflect.set(globalThis, "__hwlMemberEntitlementCalls", 0)
  Reflect.set(
    globalThis,
    "__hwlMemberAuthenticationMode",
    authenticated ? "authenticated" : "unauthenticated"
  )
  Reflect.set(globalThis, "__hwlMemberEntitled", entitled)
}

function accessCalls() {
  return {
    authentication: Reflect.get(
      globalThis,
      "__hwlMemberAuthenticationCalls"
    ) as number,
    entitlement: Reflect.get(
      globalThis,
      "__hwlMemberEntitlementCalls"
    ) as number,
  }
}

function request(
  scenario: RouteScenario,
  body: BodyInit,
  options: {
    contentLength?: string
    contentType?: string
    origin?: string | null
    streaming?: boolean
  } = {}
) {
  const headers = new Headers()
  headers.set("Content-Type", options.contentType ?? "application/json")
  if (options.contentLength !== undefined) {
    headers.set("Content-Length", options.contentLength)
  }
  if (options.origin !== null) {
    headers.set("Origin", options.origin ?? ORIGIN)
  }

  return new Request(`${ORIGIN}${scenario.path}`, {
    body,
    duplex: options.streaming ? "half" : undefined,
    headers,
    method: "POST",
  } as RequestInit & { duplex?: "half" })
}

function oversizedStream(maximumBytes: number) {
  const firstChunkSize = Math.floor(maximumBytes / 2)
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(firstChunkSize).fill(0x78))
      controller.enqueue(
        new Uint8Array(maximumBytes - firstChunkSize + 1).fill(0x78)
      )
      controller.close()
    },
  })
}

for (const scenario of scenarios) {
  test(`${scenario.name} requires an explicit exact same-origin Origin before auth`, async (t) => {
    for (const [label, origin] of [
      ["missing", null],
      ["foreign", "https://attacker.example"],
    ] as const) {
      await t.test(label, async () => {
        resetMemberAccess()
        const candidate = request(
          scenario,
          JSON.stringify(scenario.validPayload),
          { origin }
        )
        const response = await scenario.handle(candidate)

        assert.equal(response.status, 403)
        assert.deepEqual(await response.json(), {
          error: "Request not allowed.",
        })
        assert.equal(candidate.bodyUsed, false)
        assert.deepEqual(accessCalls(), {
          authentication: 0,
          entitlement: 0,
        })
      })
    }
  })

  test(`${scenario.name} rejects a non-JSON content type before auth`, async () => {
    resetMemberAccess()
    const candidate = request(scenario, JSON.stringify(scenario.validPayload), {
      contentType: "text/plain",
    })
    const response = await scenario.handle(candidate)

    assert.equal(response.status, scenario.contentTypeStatus)
    assert.equal(candidate.bodyUsed, false)
    assert.deepEqual(accessCalls(), { authentication: 0, entitlement: 0 })
  })

  test(`${scenario.name} rejects malformed JSON before auth`, async () => {
    resetMemberAccess()
    const response = await scenario.handle(request(scenario, '{"incomplete":'))

    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), { error: scenario.malformedError })
    assert.deepEqual(accessCalls(), { authentication: 0, entitlement: 0 })
  })

  for (const contentLength of [undefined, "1"] as const) {
    test(`${scenario.name} streams and rejects an oversized body with ${contentLength ? "a false" : "no"} Content-Length before auth`, async () => {
      resetMemberAccess()
      const candidate = request(
        scenario,
        oversizedStream(scenario.maximumBytes),
        { contentLength, streaming: true }
      )
      assert.equal(
        candidate.headers.get("content-length"),
        contentLength ?? null
      )

      const response = await scenario.handle(candidate)

      assert.equal(response.status, 413)
      assert.deepEqual(await response.json(), {
        error: scenario.oversizedError,
      })
      assert.deepEqual(accessCalls(), { authentication: 0, entitlement: 0 })
    })
  }

  test(`${scenario.name} preserves authentication and membership gates for valid envelopes`, async (t) => {
    await t.test("signed out", async () => {
      resetMemberAccess()
      const response = await scenario.handle(
        request(scenario, JSON.stringify(scenario.validPayload))
      )
      assert.equal(response.status, 401)
      assert.deepEqual(await response.json(), { error: "Please sign in." })
      assert.deepEqual(accessCalls(), { authentication: 1, entitlement: 0 })
    })

    await t.test("authenticated without membership", async () => {
      resetMemberAccess({ authenticated: true })
      const response = await scenario.handle(
        request(scenario, JSON.stringify(scenario.validPayload))
      )
      assert.equal(response.status, 403)
      assert.deepEqual(await response.json(), {
        error: "An active Den membership is required.",
      })
      assert.deepEqual(accessCalls(), { authentication: 1, entitlement: 1 })
    })

    await t.test(
      "authenticated member reaches the configured-service gate",
      async () => {
        resetMemberAccess({ authenticated: true, entitled: true })
        const response = await scenario.handle(
          request(scenario, JSON.stringify(scenario.validPayload))
        )
        assert.equal(response.status, 503)
        assert.deepEqual(await response.json(), {
          error: "The Connection Hub is not configured yet.",
        })
        assert.deepEqual(accessCalls(), { authentication: 1, entitlement: 1 })
      }
    )
  })
}
