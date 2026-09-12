import assert from "node:assert/strict"
import { createHash, createHmac } from "node:crypto"
import { after, beforeEach, test } from "node:test"

import { POST as receiveCalcomWebhook } from "../app/api/calcom/webhook/route.ts"

const WEBHOOK_URL = "https://preview.hwlbysmd.com/api/calcom/webhook"
const WEBHOOK_SECRET = "fixture-calcom-route-secret-32-characters"
const ENVIRONMENT_KEYS = [
  "CALCOM_BOOKING_LEDGER_READY",
  "CALCOM_WEBHOOK_SECRET",
] as const

type RpcResult = Readonly<{
  data: readonly Readonly<{ outcome: string }>[] | null
  error: Readonly<{ code: string }> | null
}>

type RpcCall = Readonly<{
  args: Readonly<Record<string, unknown>>
  name: string
}>

const originalEnvironment = Object.fromEntries(
  ENVIRONMENT_KEYS.map((key) => [key, process.env[key]])
)

after(() => {
  for (const key of ENVIRONMENT_KEYS) {
    const value = originalEnvironment[key]
    if (value === undefined) Reflect.deleteProperty(process.env, key)
    else Reflect.set(process.env, key, value)
  }
})

beforeEach(() => {
  process.env.CALCOM_BOOKING_LEDGER_READY = "true"
  process.env.CALCOM_WEBHOOK_SECRET = WEBHOOK_SECRET
  Reflect.set(globalThis, "__hwlCalcomRouteAdminMode", "configured")
  Reflect.set(globalThis, "__hwlCalcomRouteDeploymentTarget", "preview")
  Reflect.set(globalThis, "__hwlCalcomRouteRpcCalls", [])
  Reflect.set(globalThis, "__hwlCalcomRouteRpcResults", [])
})

function rpcCalls() {
  return Reflect.get(globalThis, "__hwlCalcomRouteRpcCalls") as RpcCall[]
}

function setRpcResults(results: readonly RpcResult[]) {
  Reflect.set(globalThis, "__hwlCalcomRouteRpcResults", [...results])
}

function webhookPayload(overrides: Record<string, unknown> = {}) {
  return {
    createdAt: "2026-09-09T18:00:00.000Z",
    triggerEvent: "BOOKING_REQUESTED",
    payload: {
      attendees: [
        {
          email: "client@example.com",
          name: "Client Name",
          timeZone: "America/Los_Angeles",
        },
      ],
      bookingId: 4301,
      currency: "usd",
      endTime: "2026-09-20T19:00:00.000Z",
      eventTitle: "Signature Facial",
      eventTypeId: 901,
      iCalSequence: 0,
      iCalUID: "stable-ical-identity@example.com",
      length: 60,
      organizer: { username: "hwlbysmd" },
      price: 0,
      requiresConfirmation: true,
      startTime: "2026-09-20T18:00:00.000Z",
      status: "PENDING",
      type: "signature-facial",
      uid: "booking-current-uid",
      ...overrides,
    },
  }
}

function sign(body: string) {
  return createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex")
}

function requestFor(
  body: string,
  options: Readonly<{
    contentLength?: string
    contentType?: string
    signature?: string | null
    version?: string | null
  }> = {}
) {
  const headers = new Headers()
  headers.set("Content-Type", options.contentType ?? "application/json")
  if (options.contentLength)
    headers.set("Content-Length", options.contentLength)

  const signature =
    options.signature === undefined ? sign(body) : options.signature
  if (signature !== null) headers.set("x-cal-signature-256", signature)

  const version = options.version === undefined ? "2026-07-27" : options.version
  if (version !== null) headers.set("x-cal-webhook-version", version)

  return new Request(WEBHOOK_URL, { body, headers, method: "POST" })
}

test("Cal.com webhook gate fails closed before consuming a request", async () => {
  process.env.CALCOM_BOOKING_LEDGER_READY = "false"
  const request = requestFor(JSON.stringify(webhookPayload()))
  const response = await receiveCalcomWebhook(request)

  assert.equal(response.status, 503)
  assert.equal(await response.text(), "Booking history is not configured.")
  assert.equal(request.bodyUsed, false)
  assert.equal(rpcCalls().length, 0)
})

test("Cal.com webhook rejects a short signing secret before consuming a request", async () => {
  process.env.CALCOM_WEBHOOK_SECRET = "too-short"
  const request = requestFor(JSON.stringify(webhookPayload()))
  const response = await receiveCalcomWebhook(request)

  assert.equal(response.status, 503)
  assert.equal(request.bodyUsed, false)
  assert.equal(rpcCalls().length, 0)
})

test("Cal.com webhook requires its server dependencies before consuming a request", async (t) => {
  for (const [name, configure] of [
    [
      "missing deployment target",
      () => Reflect.set(globalThis, "__hwlCalcomRouteDeploymentTarget", null),
    ],
    [
      "missing service-role client",
      () => Reflect.set(globalThis, "__hwlCalcomRouteAdminMode", "missing"),
    ],
  ] as const) {
    await t.test(name, async () => {
      configure()
      const request = requestFor(JSON.stringify(webhookPayload()))
      const response = await receiveCalcomWebhook(request)

      assert.equal(response.status, 503)
      assert.equal(request.bodyUsed, false)
      assert.equal(rpcCalls().length, 0)
    })
  }
})

test("Cal.com webhook rejects the wrong content type before reading the body", async () => {
  const request = requestFor(JSON.stringify(webhookPayload()), {
    contentType: "text/plain",
  })
  const response = await receiveCalcomWebhook(request)

  assert.equal(response.status, 415)
  assert.equal(await response.text(), "Expected a JSON webhook.")
  assert.equal(request.bodyUsed, false)
  assert.equal(rpcCalls().length, 0)
})

test("Cal.com webhook rejects a declared oversized body before reading it", async () => {
  const request = requestFor("{}", { contentLength: "256001" })
  const response = await receiveCalcomWebhook(request)

  assert.equal(response.status, 413)
  assert.equal(await response.text(), "Cal.com webhook payload is too large.")
  assert.equal(request.bodyUsed, false)
  assert.equal(rpcCalls().length, 0)
})

test("Cal.com webhook enforces the body cap without a Content-Length header", async () => {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(128_000).fill(0x78))
      controller.enqueue(new Uint8Array(128_001).fill(0x78))
      controller.close()
    },
  })
  const request = new Request(WEBHOOK_URL, {
    body,
    duplex: "half",
    headers: {
      "Content-Type": "application/json",
      "x-cal-signature-256": "0".repeat(64),
      "x-cal-webhook-version": "2026-07-27",
    },
    method: "POST",
  } as RequestInit & { duplex: "half" })

  assert.equal(request.headers.get("content-length"), null)
  const response = await receiveCalcomWebhook(request)

  assert.equal(response.status, 413)
  assert.equal(await response.text(), "Cal.com webhook payload is too large.")
  assert.equal(rpcCalls().length, 0)
})

test("Cal.com webhook rejects an invalid signature before parsing or persistence", async () => {
  const request = requestFor(JSON.stringify(webhookPayload()), {
    signature: "0".repeat(64),
  })
  const response = await receiveCalcomWebhook(request)

  assert.equal(response.status, 400)
  assert.equal(await response.text(), "Invalid Cal.com signature.")
  assert.equal(rpcCalls().length, 0)
})

test("Cal.com webhook rejects a signed payload with an unsupported version", async () => {
  const request = requestFor(JSON.stringify(webhookPayload()), {
    version: "2024-06-14",
  })
  const response = await receiveCalcomWebhook(request)

  assert.equal(response.status, 422)
  assert.equal(await response.text(), "Cal.com booking event was not accepted.")
  assert.equal(rpcCalls().length, 0)
})

test("Cal.com webhook acknowledges an unsupported signed trigger without persistence", async () => {
  const body = JSON.stringify({
    ...webhookPayload(),
    triggerEvent: "MEETING_STARTED",
  })
  const response = await receiveCalcomWebhook(requestFor(body))

  assert.equal(response.status, 200)
  assert.equal(await response.text(), "Ignored unsupported Cal.com event.")
  assert.equal(rpcCalls().length, 0)
})

test("Cal.com webhook maps a valid signed request into the narrow ledger RPC", async () => {
  const body = JSON.stringify(webhookPayload())
  const response = await receiveCalcomWebhook(requestFor(body))

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { received: true })
  assert.equal(rpcCalls().length, 1)
  assert.equal(rpcCalls()[0]?.name, "ingest_calcom_booking_event")
  assert.deepEqual(rpcCalls()[0]?.args, {
    p_attendee_email: "client@example.com",
    p_attendee_name: "Client Name",
    p_attendee_timezone: "America/Los_Angeles",
    p_booking_status: "requested",
    p_cal_booking_id: 4301,
    p_cal_booking_uid: "booking-current-uid",
    p_cal_event_type_id: 901,
    p_cal_ical_sequence: 0,
    p_cal_ical_uid: "stable-ical-identity@example.com",
    p_cal_status: "PENDING",
    p_calcom_username: "hwlbysmd",
    p_currency: "usd",
    p_deployment_target: "preview",
    p_end_at: "2026-09-20T19:00:00.000Z",
    p_event_created_at: "2026-09-09T18:00:00.000Z",
    p_payload_digest: createHash("sha256").update(body).digest("hex"),
    p_previous_cal_booking_uid: null,
    p_provider_price_was_null: false,
    p_requires_confirmation: true,
    p_service_duration_minutes: 60,
    p_service_slug: "signature-facial",
    p_service_title: "Signature Facial",
    p_start_at: "2026-09-20T18:00:00.000Z",
    p_trigger_event: "BOOKING_REQUESTED",
    p_webhook_version: "2026-07-27",
  })
})

test("Cal.com webhook preserves missing rejection iCal metadata for database ordering", async () => {
  const payload = webhookPayload({
    iCalSequence: undefined,
    iCalUID: undefined,
    status: "REJECTED",
  })
  const body = JSON.stringify({
    ...payload,
    triggerEvent: "BOOKING_REJECTED",
  })
  const response = await receiveCalcomWebhook(requestFor(body))

  assert.equal(response.status, 200)
  assert.equal(rpcCalls().length, 1)
  assert.equal(rpcCalls()[0]?.args.p_booking_status, "rejected")
  assert.equal(rpcCalls()[0]?.args.p_cal_ical_sequence, null)
  assert.equal(rpcCalls()[0]?.args.p_cal_ical_uid, null)
  assert.equal(rpcCalls()[0]?.args.p_provider_price_was_null, false)
})

test("Cal.com webhook rejects a reschedule without iCalSequence", async () => {
  const payload = webhookPayload({
    iCalSequence: undefined,
    iCalUID: undefined,
    rescheduleUid: "booking-prior-uid",
    status: "ACCEPTED",
    uid: "booking-rescheduled-uid",
  })
  const body = JSON.stringify({
    ...payload,
    triggerEvent: "BOOKING_RESCHEDULED",
  })
  const response = await receiveCalcomWebhook(requestFor(body))

  assert.equal(response.status, 422)
  assert.equal(rpcCalls().length, 0)
})

test("Cal.com webhook forwards signed null-price cancellation evidence without storing payment data", async () => {
  const payload = webhookPayload({ price: null, status: "CANCELLED" })
  const body = JSON.stringify({
    ...payload,
    triggerEvent: "BOOKING_CANCELLED",
  })
  const response = await receiveCalcomWebhook(requestFor(body))

  assert.equal(response.status, 200)
  assert.equal(rpcCalls().length, 1)
  assert.equal(rpcCalls()[0]?.args.p_booking_status, "cancelled")
  assert.equal(rpcCalls()[0]?.args.p_currency, "usd")
  assert.equal(rpcCalls()[0]?.args.p_provider_price_was_null, true)
  assert.equal("p_price" in (rpcCalls()[0]?.args ?? {}), false)
  assert.equal("p_payment_status" in (rpcCalls()[0]?.args ?? {}), false)
})

test("Cal.com webhook fails closed when the ledger RPC fails", async () => {
  setRpcResults([{ data: null, error: { code: "PGRST202" } }])
  const logged: unknown[][] = []
  const originalError = console.error
  console.error = (...args: unknown[]) => logged.push(args)

  try {
    const response = await receiveCalcomWebhook(
      requestFor(JSON.stringify(webhookPayload()))
    )

    assert.equal(response.status, 500)
    assert.equal(
      await response.text(),
      "Cal.com webhook could not be recorded."
    )
    assert.equal(rpcCalls().length, 1)
    assert.equal(logged.length, 1)
  } finally {
    console.error = originalError
  }
})

test("Cal.com webhook fails closed on a missing ledger receipt", async () => {
  setRpcResults([{ data: [], error: null }])
  const logged: unknown[][] = []
  const originalError = console.error
  console.error = (...args: unknown[]) => logged.push(args)

  try {
    const response = await receiveCalcomWebhook(
      requestFor(JSON.stringify(webhookPayload()))
    )

    assert.equal(response.status, 500)
    assert.equal(
      await response.text(),
      "Cal.com webhook could not be recorded."
    )
    assert.equal(rpcCalls().length, 1)
    assert.equal(logged.length, 1)
    assert.match(String(logged[0]?.[0]), /invalid receipt/i)
  } finally {
    console.error = originalError
  }
})

test("Cal.com webhook records a manual-review outcome without retrying", async () => {
  setRpcResults([{ data: [{ outcome: "manual_review" }], error: null }])
  const logged: unknown[][] = []
  const originalError = console.error
  console.error = (...args: unknown[]) => logged.push(args)

  try {
    const response = await receiveCalcomWebhook(
      requestFor(JSON.stringify(webhookPayload()))
    )

    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { received: true })
    assert.equal(rpcCalls().length, 1)
    assert.equal(logged.length, 1)
    assert.match(String(logged[0]?.[0]), /requires manual review/i)
  } finally {
    console.error = originalError
  }
})

test("Cal.com webhook sends exact replays to the idempotent ledger boundary", async () => {
  setRpcResults([
    { data: [{ outcome: "applied" }], error: null },
    { data: [{ outcome: "ignored_stale" }], error: null },
  ])
  const body = JSON.stringify(webhookPayload())

  const first = await receiveCalcomWebhook(requestFor(body))
  const replay = await receiveCalcomWebhook(requestFor(body))

  assert.equal(first.status, 200)
  assert.equal(replay.status, 200)
  assert.equal(rpcCalls().length, 2)
  assert.equal(
    rpcCalls()[0]?.args.p_payload_digest,
    rpcCalls()[1]?.args.p_payload_digest
  )
  assert.deepEqual(rpcCalls()[0]?.args, rpcCalls()[1]?.args)
})
