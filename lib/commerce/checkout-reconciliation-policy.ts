export const CHECKOUT_RECONCILIATION_MAXIMUM_BYTES = 512
export const CHECKOUT_RECONCILIATION_MAXIMUM_ATTEMPTS = 3
export const CHECKOUT_RECONCILIATION_COOLDOWN_MS = 60_000

const CHECKOUT_SESSION_ID_PATTERN = /^cs_(?:live|test)_[a-zA-Z0-9]{16,200}$/

type CheckoutNamespaceIdentity = {
  deploymentTarget: string
  stripeAccountId: string
  stripeMode: string
}

export function getCheckoutIdentityRuntimeDisposition(
  identity: CheckoutNamespaceIdentity,
  expected: {
    deploymentTarget: string
    stripeAccountId: string
    stripeLivemode: boolean
  }
) {
  if (
    identity.stripeAccountId !== expected.stripeAccountId ||
    identity.stripeMode !== (expected.stripeLivemode ? "live" : "test")
  ) {
    return "invalid" as const
  }

  return identity.deploymentTarget === expected.deploymentTarget
    ? ("current" as const)
    : ("foreign_target" as const)
}

export function isCheckoutSessionId(value: unknown): value is string {
  return typeof value === "string" && CHECKOUT_SESSION_ID_PATTERN.test(value)
}

export function parseCheckoutReconciliationBody(
  value: unknown
): { ok: true; sessionId: string } | { ok: false } {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    Object.keys(value).length !== 1 ||
    !("sessionId" in value) ||
    !isCheckoutSessionId(value.sessionId)
  ) {
    return { ok: false }
  }

  return { ok: true, sessionId: value.sessionId }
}

export function getCheckoutReconciliationAvailability({
  attemptCount,
  lastAttemptAt,
  now,
}: {
  attemptCount: number
  lastAttemptAt: string | null
  now: number
}):
  | { available: true }
  | { available: false; reason: "cooldown" | "exhausted" | "invalid" } {
  if (
    !Number.isInteger(attemptCount) ||
    attemptCount < 0 ||
    !Number.isFinite(now)
  ) {
    return { available: false, reason: "invalid" }
  }
  if (attemptCount >= CHECKOUT_RECONCILIATION_MAXIMUM_ATTEMPTS) {
    return { available: false, reason: "exhausted" }
  }
  if (lastAttemptAt !== null) {
    const lastAttemptTime = new Date(lastAttemptAt).getTime()
    if (!Number.isFinite(lastAttemptTime)) {
      return { available: false, reason: "invalid" }
    }
    if (now - lastAttemptTime < CHECKOUT_RECONCILIATION_COOLDOWN_MS) {
      return { available: false, reason: "cooldown" }
    }
  }

  return { available: true }
}
