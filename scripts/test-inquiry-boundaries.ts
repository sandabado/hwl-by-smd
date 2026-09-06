import assert from "node:assert/strict"
import { createHmac } from "node:crypto"
import { after, test } from "node:test"

import { POST as submitInquiry } from "../app/api/contact/route.ts"
import { resolveInquiryClientIdentity } from "../lib/inquiries/client-address.ts"
import {
  createInquiryPayloadDigest,
  prepareInquirySubmissionClaim,
} from "../lib/inquiries/rate-limit.ts"
import { isInquiryCollectionReady } from "../lib/inquiries/readiness.ts"

const ENVIRONMENT_KEYS = [
  "HWL_DEPLOYMENT_TARGET",
  "INQUIRY_RATE_LIMIT_MAX",
  "INQUIRY_RATE_LIMIT_SECRET",
  "NEXT_PUBLIC_INQUIRY_COLLECTION_READY",
  "NODE_ENV",
  "VERCEL",
] as const

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

function resetEnvironment() {
  for (const key of ENVIRONMENT_KEYS) {
    Reflect.deleteProperty(process.env, key)
  }
}

function setEnvironment(key: (typeof ENVIRONMENT_KEYS)[number], value: string) {
  Reflect.set(process.env, key, value)
}

function expectedFingerprint(secret: string, identity: string) {
  return createHmac("sha256", secret)
    .update(`hwl-inquiry-v1\u0000${identity}`)
    .digest("hex")
}

test("inquiry abuse controls preserve the trusted-address and secret boundaries", async (t) => {
  await t.test(
    "deployed traffic trusts only Vercel's protected address",
    () => {
      const trustedAddress = "198.51.100.14"
      const spoofedAddress = "203.0.113.27"
      const request = new Request("https://preview.hwlbysmd.com/api/contact", {
        headers: {
          "x-forwarded-for": spoofedAddress,
          "x-real-ip": spoofedAddress,
          "x-vercel-forwarded-for": trustedAddress,
        },
      })

      assert.equal(
        resolveInquiryClientIdentity(request, {
          HWL_DEPLOYMENT_TARGET: "preview",
          NODE_ENV: "production",
          VERCEL: "1",
        }),
        trustedAddress
      )

      const genericHeadersOnly = new Request(
        "https://preview.hwlbysmd.com/api/contact",
        { headers: { "x-forwarded-for": spoofedAddress } }
      )
      assert.equal(
        resolveInquiryClientIdentity(genericHeadersOnly, {
          HWL_DEPLOYMENT_TARGET: "preview",
          NODE_ENV: "production",
          VERCEL: "1",
        }),
        null
      )
    }
  )

  await t.test(
    "a deployed claim fails closed without a trusted address",
    () => {
      resetEnvironment()
      setEnvironment("HWL_DEPLOYMENT_TARGET", "preview")
      setEnvironment(
        "INQUIRY_RATE_LIMIT_SECRET",
        "fixture-inquiry-boundary-secret-32-characters"
      )
      setEnvironment("NODE_ENV", "production")
      setEnvironment("VERCEL", "1")

      const result = prepareInquirySubmissionClaim(
        new Request("https://preview.hwlbysmd.com/api/contact", {
          headers: { "x-forwarded-for": "203.0.113.27" },
        })
      )

      assert.deepEqual(result, {
        reason: "missing_client_address",
        status: "unavailable",
      })
    }
  )

  await t.test("a short or missing HMAC secret fails closed", () => {
    resetEnvironment()
    setEnvironment("HWL_DEPLOYMENT_TARGET", "preview")
    setEnvironment("INQUIRY_RATE_LIMIT_SECRET", "too-short")
    setEnvironment("NODE_ENV", "production")
    setEnvironment("VERCEL", "1")

    const request = new Request("https://preview.hwlbysmd.com/api/contact", {
      headers: { "x-vercel-forwarded-for": "198.51.100.14" },
    })

    assert.deepEqual(prepareInquirySubmissionClaim(request), {
      reason: "missing_secret",
      status: "unavailable",
    })
    assert.equal(createInquiryPayloadDigest("canonical-payload"), null)
  })

  await t.test(
    "ready claims use a keyed fingerprint and the approved fixed limit",
    () => {
      resetEnvironment()
      const secret = "fixture-inquiry-boundary-secret-32-characters"
      const trustedAddress = "198.51.100.14"
      setEnvironment("HWL_DEPLOYMENT_TARGET", "preview")
      setEnvironment("INQUIRY_RATE_LIMIT_MAX", "999")
      setEnvironment("INQUIRY_RATE_LIMIT_SECRET", secret)
      setEnvironment("NODE_ENV", "production")
      setEnvironment("VERCEL", "1")

      const result = prepareInquirySubmissionClaim(
        new Request("https://preview.hwlbysmd.com/api/contact", {
          headers: { "x-vercel-forwarded-for": trustedAddress },
        })
      )

      assert.deepEqual(result, {
        fingerprint: expectedFingerprint(secret, trustedAddress),
        limit: 5,
        status: "ready",
      })

      setEnvironment("INQUIRY_RATE_LIMIT_MAX", "0")
      const minimum = prepareInquirySubmissionClaim(
        new Request("https://preview.hwlbysmd.com/api/contact", {
          headers: { "x-vercel-forwarded-for": trustedAddress },
        })
      )
      assert.equal(minimum.status === "ready" ? minimum.limit : null, 5)

      setEnvironment("INQUIRY_RATE_LIMIT_MAX", "not-a-number")
      const fallback = prepareInquirySubmissionClaim(
        new Request("https://preview.hwlbysmd.com/api/contact", {
          headers: { "x-vercel-forwarded-for": trustedAddress },
        })
      )
      assert.equal(fallback.status === "ready" ? fallback.limit : null, 5)
    }
  )

  await t.test("payload evidence is deterministic and secret keyed", () => {
    resetEnvironment()
    const payload = '{"email":"guest@example.com","source":"contact-page"}'
    const firstSecret = "fixture-inquiry-boundary-secret-32-characters"
    setEnvironment("INQUIRY_RATE_LIMIT_SECRET", firstSecret)

    const first = createInquiryPayloadDigest(payload)
    const repeated = createInquiryPayloadDigest(payload)
    assert.match(first ?? "", /^[0-9a-f]{64}$/)
    assert.equal(first, repeated)

    setEnvironment(
      "INQUIRY_RATE_LIMIT_SECRET",
      "different-inquiry-boundary-secret-32-characters"
    )
    assert.notEqual(createInquiryPayloadDigest(payload), first)
  })

  await t.test("local development has an explicit non-IP fallback", () => {
    resetEnvironment()
    const secret = "fixture-inquiry-boundary-secret-32-characters"
    setEnvironment("HWL_DEPLOYMENT_TARGET", "development")
    setEnvironment("INQUIRY_RATE_LIMIT_SECRET", secret)
    setEnvironment("NODE_ENV", "development")

    const result = prepareInquirySubmissionClaim(
      new Request("http://localhost:3000/api/contact")
    )
    assert.deepEqual(result, {
      fingerprint: expectedFingerprint(secret, "local-development"),
      limit: 5,
      status: "ready",
    })
  })
})

test("inquiry collection readiness fails closed and preserves request boundaries", async (t) => {
  await t.test("only exact lowercase true opens collection", () => {
    for (const value of [undefined, "", "false", "TRUE", "1", " true "]) {
      assert.equal(isInquiryCollectionReady(value), false)
    }
    assert.equal(isInquiryCollectionReady("true"), true)
  })

  await t.test(
    "missing, false, and malformed flags stop before persistence",
    async () => {
      for (const value of [undefined, "false", "TRUE"]) {
        resetEnvironment()
        if (value !== undefined) {
          setEnvironment("NEXT_PUBLIC_INQUIRY_COLLECTION_READY", value)
        }

        const request = new Request(
          "https://preview.hwlbysmd.com/api/contact",
          {
            body: JSON.stringify({
              email: "guest@example.com",
              message: "A valid message that must not be persisted.",
              submissionId: "4f3d86c6-4da6-4ef6-8929-d66d11a9443c",
            }),
            headers: {
              "Content-Type": "application/json",
              Origin: "https://preview.hwlbysmd.com",
            },
            method: "POST",
          }
        )
        const response = await submitInquiry(request)
        const body = (await response.json()) as {
          message?: string
          received?: boolean
        }

        assert.equal(response.status, 503)
        assert.equal(request.bodyUsed, false)
        assert.equal(response.headers.get("cache-control"), "no-store")
        assert.equal(body.received, false)
        assert.match(body.message ?? "", /collection is not open yet/i)
      }
    }
  )

  await t.test(
    "origin and content-type checks still run before the gate",
    async () => {
      resetEnvironment()
      setEnvironment("NEXT_PUBLIC_INQUIRY_COLLECTION_READY", "false")

      const foreignOrigin = await submitInquiry(
        new Request("https://preview.hwlbysmd.com/api/contact", {
          body: "{}",
          headers: {
            "Content-Type": "application/json",
            Origin: "https://attacker.example",
          },
          method: "POST",
        })
      )
      assert.equal(foreignOrigin.status, 403)

      const wrongContentType = await submitInquiry(
        new Request("https://preview.hwlbysmd.com/api/contact", {
          body: "email=guest%40example.com",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Origin: "https://preview.hwlbysmd.com",
          },
          method: "POST",
        })
      )
      assert.equal(wrongContentType.status, 415)

      const oversized = await submitInquiry(
        new Request("https://preview.hwlbysmd.com/api/contact", {
          body: "{}",
          headers: {
            "Content-Length": "16001",
            "Content-Type": "application/json",
            Origin: "https://preview.hwlbysmd.com",
          },
          method: "POST",
        })
      )
      assert.equal(oversized.status, 413)
    }
  )

  await t.test(
    "exact true continues into the existing persistence path",
    async () => {
      resetEnvironment()
      setEnvironment("NEXT_PUBLIC_INQUIRY_COLLECTION_READY", "true")

      const response = await submitInquiry(
        new Request("https://preview.hwlbysmd.com/api/contact", {
          body: JSON.stringify({
            email: "guest@example.com",
            message: "A valid inquiry.",
            submissionId: "4f3d86c6-4da6-4ef6-8929-d66d11a9443c",
          }),
          headers: {
            "Content-Type": "application/json",
            Origin: "https://preview.hwlbysmd.com",
          },
          method: "POST",
        })
      )
      const body = (await response.json()) as { message?: string }

      // The test loader intentionally supplies no Supabase admin client. Reaching
      // this established response proves exact true passed the new gate without
      // making a database or provider call.
      assert.equal(response.status, 503)
      assert.equal(
        body.message,
        "Online notes are being prepared. Please email Shannon directly for now."
      )
    }
  )
})
