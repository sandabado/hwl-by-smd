import "server-only"

import { createHmac } from "node:crypto"

import { resolveInquiryClientIdentity } from "@/lib/inquiries/client-address"

const APPROVED_MAXIMUM_SUBMISSIONS = 5
const MINIMUM_SECRET_LENGTH = 32

export type InquiryRateLimitResult =
  | { fingerprint: string; limit: number; status: "ready" }
  | {
      status: "unavailable"
      reason: "missing_client_address" | "missing_secret"
    }

export function createInquiryPayloadDigest(serializedPayload: string) {
  const secret = process.env.INQUIRY_RATE_LIMIT_SECRET
  if (!secret || secret.length < MINIMUM_SECRET_LENGTH) return null

  return createHmac("sha256", secret)
    .update(`hwl-inquiry-payload-v1\u0000${serializedPayload}`)
    .digest("hex")
}

/**
 * Prepares the privacy-preserving inputs for the database-atomic inquiry RPC.
 *
 * The database stores only an HMAC fingerprint. Raw client addresses are never
 * logged or persisted. The RPC claims the rate slot and inserts the inquiry in
 * one transaction so a failed insert cannot consume a submission slot.
 */
export function prepareInquirySubmissionClaim(
  request: Request
): InquiryRateLimitResult {
  const secret = process.env.INQUIRY_RATE_LIMIT_SECRET
  if (!secret || secret.length < MINIMUM_SECRET_LENGTH) {
    return { status: "unavailable", reason: "missing_secret" }
  }

  const addressIdentity = resolveInquiryClientIdentity(request)

  if (!addressIdentity) {
    return { status: "unavailable", reason: "missing_client_address" }
  }

  const fingerprint = createHmac("sha256", secret)
    .update(`hwl-inquiry-v1\u0000${addressIdentity}`)
    .digest("hex")

  return {
    fingerprint,
    limit: APPROVED_MAXIMUM_SUBMISSIONS,
    status: "ready",
  }
}
