export const AUTH_LINK_FAILURE = {
  message:
    "That secure email link is invalid or expired. Request a new link, or sign in if you’ve already confirmed your account.",
  title: "That secure link didn’t work.",
} as const

const ALLOWED_AUTH_ERROR_CODES = new Set([
  "access_denied",
  "auth_link_failed",
  "confirmation_failed",
  "otp_expired",
])

type LoginAuthFeedbackInput = {
  errorCode?: string | null
  legacyOrNormalizedError?: string | null
}

export function loginAuthFeedback({
  errorCode,
  legacyOrNormalizedError,
}: LoginAuthFeedbackInput) {
  const suppliedCodes = [errorCode, legacyOrNormalizedError]
    .map((value) => value?.trim().toLowerCase() ?? "")
    .filter(Boolean)

  return suppliedCodes.some((code) => ALLOWED_AUTH_ERROR_CODES.has(code))
    ? AUTH_LINK_FAILURE
    : null
}
