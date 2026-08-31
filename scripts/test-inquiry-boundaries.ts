import assert from "node:assert/strict"
import { createHmac } from "node:crypto"
import { after, test } from "node:test"

import { resolveInquiryClientIdentity } from "../lib/inquiries/client-address.ts"
import {
  createInquiryPayloadDigest,
  prepareInquirySubmissionClaim,
} from "../lib/inquiries/rate-limit.ts"

const ENVIRONMENT_KEYS = [
  "HWL_DEPLOYMENT_TARGET",
  "INQUIRY_RATE_LIMIT_MAX",
  "INQUIRY_RATE_LIMIT_SECRET",
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
      const request = new Request("https://preview.howlbysmd.com/api/contact", {
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
        "https://preview.howlbysmd.com/api/contact",
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
        new Request("https://preview.howlbysmd.com/api/contact", {
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

    const request = new Request("https://preview.howlbysmd.com/api/contact", {
      headers: { "x-vercel-forwarded-for": "198.51.100.14" },
    })

    assert.deepEqual(prepareInquirySubmissionClaim(request), {
      reason: "missing_secret",
      status: "unavailable",
    })
    assert.equal(createInquiryPayloadDigest("canonical-payload"), null)
  })

  await t.test(
    "ready claims use a keyed fingerprint and clamp their limit",
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
        new Request("https://preview.howlbysmd.com/api/contact", {
          headers: { "x-vercel-forwarded-for": trustedAddress },
        })
      )

      assert.deepEqual(result, {
        fingerprint: expectedFingerprint(secret, trustedAddress),
        limit: 20,
        status: "ready",
      })

      setEnvironment("INQUIRY_RATE_LIMIT_MAX", "0")
      const minimum = prepareInquirySubmissionClaim(
        new Request("https://preview.howlbysmd.com/api/contact", {
          headers: { "x-vercel-forwarded-for": trustedAddress },
        })
      )
      assert.equal(minimum.status === "ready" ? minimum.limit : null, 1)

      setEnvironment("INQUIRY_RATE_LIMIT_MAX", "not-a-number")
      const fallback = prepareInquirySubmissionClaim(
        new Request("https://preview.howlbysmd.com/api/contact", {
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
