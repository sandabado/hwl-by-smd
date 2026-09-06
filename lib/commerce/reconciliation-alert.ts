import "server-only"

import { createHash } from "node:crypto"

import type { DeploymentTarget } from "@/lib/stripe"

const RESEND_EMAIL_ENDPOINT = "https://api.resend.com/emails"
const COMMERCE_ALERT_TIMEOUT_MS = 10_000
const RECONCILIATION_REPORT_BATCH_LIMIT = 100
const SINGLE_EMAIL_PATTERN =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/

const CANONICAL_ADMIN_ORIGINS: Record<DeploymentTarget, string> = {
  development: "http://localhost:3000",
  preview: "https://preview.hwlbysmd.com",
  production: "https://www.hwlbysmd.com",
}

type CommerceRecoveryAlertConfiguration = {
  apiKey: string | undefined
  from: string | undefined
  to: string | undefined
}

type CommerceRecoveryAlertFetch = (
  input: string | URL | Request,
  init?: RequestInit
) => Promise<Response>

export type CommerceRecoveryAlertResult =
  | { kind: "accepted" }
  | { kind: "network_outcome_unknown" }
  | { kind: "not_configured" }
  | { kind: "not_required" }
  | { kind: "provider_rejected" }

export type CommerceRecoveryAlertInput = {
  alertsPending: number
  deploymentTarget: DeploymentTarget
  manualReview: number
  occurredAt: Date
  statusUncertain?: boolean
  timeoutMs?: number
}

type CommerceRecoveryAlertOptions = {
  configuration?: CommerceRecoveryAlertConfiguration
  fetchImpl?: CommerceRecoveryAlertFetch
}

function configured(value: string | undefined) {
  const candidate = value?.trim()
  return candidate && !candidate.toLowerCase().startsWith("your_")
    ? candidate
    : null
}

function configuredEmail(
  value: string | undefined,
  { allowDisplayName = false }: { allowDisplayName?: boolean } = {}
) {
  const candidate = configured(value)
  if (!candidate || /[,;\r\n]/.test(candidate)) return null

  const address = allowDisplayName
    ? (candidate.match(/^[^<>]+<([^<>]+)>$/)?.[1]?.trim() ?? candidate)
    : candidate

  return SINGLE_EMAIL_PATTERN.test(address) ? candidate : null
}

function safeCount(value: number) {
  return Number.isSafeInteger(value) && value >= 0 ? value : 0
}

function reportedCount(value: number) {
  return value >= RECONCILIATION_REPORT_BATCH_LIMIT
    ? `at least ${value}`
    : String(value)
}

function adminReviewUrl(deploymentTarget: DeploymentTarget) {
  const url = new URL("/login", CANONICAL_ADMIN_ORIGINS[deploymentTarget])
  url.searchParams.set("redirectTo", "/admin/store")
  return url.toString()
}

export function commerceRecoveryAlertIdempotencyKey(
  deploymentTarget: DeploymentTarget,
  occurredAt: Date,
  canonicalPayload: string
) {
  const utcDay = Number.isFinite(occurredAt.getTime())
    ? occurredAt.toISOString().slice(0, 10)
    : new Date(0).toISOString().slice(0, 10)
  const payloadDigest = createHash("sha256")
    .update(canonicalPayload)
    .digest("hex")
    .slice(0, 24)

  return `hwl-commerce-recovery-${deploymentTarget}-${utcDay}-${payloadDigest}`
}

/**
 * Sends one aggregate operational reminder per canonical payload, UTC day, and
 * environment. Identical concurrent/retried requests deduplicate; any changed
 * address, copy, or alert state receives its own valid Resend idempotency key.
 * Customer, order, Stripe, and provider identifiers are intentionally absent
 * from both the input contract and the message body.
 */
export async function sendCommerceRecoveryAlert(
  input: CommerceRecoveryAlertInput,
  {
    configuration = {
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.CONTACT_FROM_EMAIL,
      to: process.env.COMMERCE_ALERT_TO_EMAIL,
    },
    fetchImpl = fetch,
  }: CommerceRecoveryAlertOptions = {}
): Promise<CommerceRecoveryAlertResult> {
  const alertsPending = safeCount(input.alertsPending)
  const manualReview = safeCount(input.manualReview)
  const statusUncertain = input.statusUncertain === true

  if (alertsPending + manualReview === 0 && !statusUncertain) {
    return { kind: "not_required" }
  }

  const apiKey = configured(configuration.apiKey)
  const from = configuredEmail(configuration.from, { allowDisplayName: true })
  const to = configuredEmail(configuration.to)
  if (!apiKey || !/^re_[a-zA-Z0-9_]+$/.test(apiKey) || !from || !to) {
    return { kind: "not_configured" }
  }

  const reviewUrl = adminReviewUrl(input.deploymentTarget)
  const text = [
    "HWL by SMD commerce recovery needs human review.",
    `Environment: ${input.deploymentTarget}`,
    `Recovery alerts pending now: ${reportedCount(alertsPending)}`,
    `Worker-classified manual-review outcomes this run: ${manualReview}`,
    statusUncertain
      ? "Recovery status refresh: unavailable; inspect the durable queue."
      : "Recovery status refresh: current.",
    `Review securely: ${reviewUrl}`,
    "Customer, order, payment, and provider identifiers are intentionally omitted.",
  ].join("\n\n")

  const payload = JSON.stringify({
    from,
    subject: `HWL by SMD · ${input.deploymentTarget} commerce recovery needs attention`,
    text,
    to: [to],
  })

  let response: Response
  try {
    response = await fetchImpl(RESEND_EMAIL_ENDPOINT, {
      body: payload,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": commerceRecoveryAlertIdempotencyKey(
          input.deploymentTarget,
          input.occurredAt,
          payload
        ),
      },
      method: "POST",
      signal: AbortSignal.timeout(
        Number.isFinite(input.timeoutMs) && Number(input.timeoutMs) > 0
          ? Math.max(
              1,
              Math.min(
                COMMERCE_ALERT_TIMEOUT_MS,
                Math.floor(Number(input.timeoutMs))
              )
            )
          : COMMERCE_ALERT_TIMEOUT_MS
      ),
    })
  } catch {
    return { kind: "network_outcome_unknown" }
  }

  return response.ok ? { kind: "accepted" } : { kind: "provider_rejected" }
}
