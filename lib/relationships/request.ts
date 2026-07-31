import "server-only"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value)
}

export function isSameOriginMutation(request: Request) {
  const origin = request.headers.get("origin")
  if (!origin) return true

  try {
    return new URL(origin).origin === new URL(request.url).origin
  } catch {
    return false
  }
}

export function hasJsonContentType(request: Request) {
  return request.headers
    .get("content-type")
    ?.toLowerCase()
    .startsWith("application/json")
}

export function hasAcceptableBodySize(request: Request, maximumBytes: number) {
  const contentLength = request.headers.get("content-length")
  if (!contentLength) return true

  const parsed = Number(contentLength)
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= maximumBytes
}
