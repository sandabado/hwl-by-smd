const INTERNAL_ORIGIN = "https://hwl.internal"
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/

export function safeInternalPath(
  value: string | null | undefined,
  fallback = "/"
) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback
  }

  let decoded: string
  try {
    decoded = decodeURIComponent(value)
  } catch {
    return fallback
  }

  if (
    decoded.startsWith("//") ||
    decoded.includes("\\") ||
    CONTROL_CHARACTERS.test(decoded)
  ) {
    return fallback
  }

  try {
    const resolved = new URL(value, INTERNAL_ORIGIN)
    if (
      resolved.origin !== INTERNAL_ORIGIN ||
      resolved.pathname.startsWith("//")
    ) {
      return fallback
    }
    return `${resolved.pathname}${resolved.search}${resolved.hash}`
  } catch {
    return fallback
  }
}
