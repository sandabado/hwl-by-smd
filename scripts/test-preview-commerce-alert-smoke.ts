import assert from "node:assert/strict"
import test from "node:test"

import { handlePreviewCommerceAlertSmoke } from "../lib/commerce/preview-alert-smoke.ts"

const CRON_SECRET = "0123456789abcdef0123456789abcdef"
const PREVIEW_ENVIRONMENT = {
  CRON_SECRET,
  HWL_DEPLOYMENT_TARGET: "preview",
  VERCEL: "1",
  VERCEL_ENV: "preview",
}

test("the smoke route is absent outside an exact Vercel Preview runtime", async () => {
  let sendCount = 0

  for (const environment of [
    { ...PREVIEW_ENVIRONMENT, VERCEL: undefined },
    { ...PREVIEW_ENVIRONMENT, VERCEL_ENV: "production" },
    { ...PREVIEW_ENVIRONMENT, HWL_DEPLOYMENT_TARGET: "production" },
  ]) {
    const response = await handlePreviewCommerceAlertSmoke(
      new Request("https://www.hwlbysmd.com/api/preview/commerce-alert-smoke", {
        method: "POST",
      }),
      {
        environment,
        async sendAlert() {
          sendCount += 1
          return { kind: "accepted" }
        },
      }
    )

    assert.equal(response.status, 404)
    assert.equal(response.headers.get("cache-control"), "no-store")
    assert.deepEqual(await response.json(), { kind: "not_found" })
  }

  assert.equal(sendCount, 0)
})

test("the smoke route requires the exact cron bearer before sending", async () => {
  let sendCount = 0

  for (const authorization of [
    undefined,
    `bearer ${CRON_SECRET}`,
    `Bearer ${CRON_SECRET} extra`,
    `Bearer ${"x".repeat(32)}`,
  ]) {
    const headers = new Headers()
    if (authorization) headers.set("authorization", authorization)

    const response = await handlePreviewCommerceAlertSmoke(
      new Request(
        "https://preview.hwlbysmd.com/api/preview/commerce-alert-smoke",
        { headers, method: "POST" }
      ),
      {
        environment: PREVIEW_ENVIRONMENT,
        async sendAlert() {
          sendCount += 1
          return { kind: "accepted" }
        },
      }
    )

    assert.equal(response.status, 401)
    assert.deepEqual(await response.json(), { kind: "unauthorized" })
  }

  assert.equal(sendCount, 0)
})

test("the authorized smoke route sends one aggregate Preview alert and returns only its kind", async () => {
  const occurredAt = new Date("2026-09-06T18:00:00.000Z")
  const calls: unknown[] = []
  const privateFixture = {
    customer: "customer@example.com",
    payment: "pi_private_fixture",
    provider: "provider-secret-fixture",
  }

  const response = await handlePreviewCommerceAlertSmoke(
    new Request(
      "https://preview.hwlbysmd.com/api/preview/commerce-alert-smoke",
      {
        body: JSON.stringify(privateFixture),
        headers: { authorization: `Bearer ${CRON_SECRET}` },
        method: "POST",
      }
    ),
    {
      environment: PREVIEW_ENVIRONMENT,
      now: () => occurredAt,
      async sendAlert(input) {
        calls.push(input)
        return { kind: "accepted" }
      },
    }
  )
  const body = await response.text()

  assert.equal(response.status, 200)
  assert.equal(response.headers.get("cache-control"), "no-store")
  assert.deepEqual(calls, [
    {
      alertsPending: 1,
      deploymentTarget: "preview",
      manualReview: 0,
      occurredAt,
    },
  ])
  assert.deepEqual(JSON.parse(body), { kind: "accepted" })
  assert.doesNotMatch(
    body,
    /customer@example\.com|pi_private_fixture|provider-secret-fixture/
  )
})
