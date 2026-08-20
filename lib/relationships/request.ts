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
    const requestUrl = new URL(request.url)
    const allowedOrigins = new Set([requestUrl.origin])
    const host = request.headers.get("host")

    // Next can canonicalize localhost in request.url even when the browser used
    // 127.0.0.1. The Host header preserves the origin the browser actually saw.
    if (host) {
      allowedOrigins.add(new URL(`${requestUrl.protocol}//${host}`).origin)
    }

    return allowedOrigins.has(new URL(origin).origin)
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

export async function readLimitedJson<T>(
  request: Request,
  maximumBytes: number
): Promise<
  { ok: true; value: T } | { ok: false; reason: "invalid" | "too_large" }
> {
  if (!hasAcceptableBodySize(request, maximumBytes)) {
    return { ok: false, reason: "too_large" }
  }

  const reader = request.body?.getReader()
  if (!reader) return { ok: false, reason: "invalid" }

  const chunks: Uint8Array[] = []
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      totalBytes += value.byteLength
      if (totalBytes > maximumBytes) {
        await reader.cancel()
        return { ok: false, reason: "too_large" }
      }
      chunks.push(value)
    }

    const bytes = new Uint8Array(totalBytes)
    let offset = 0
    for (const chunk of chunks) {
      bytes.set(chunk, offset)
      offset += chunk.byteLength
    }

    return {
      ok: true,
      value: JSON.parse(
        new TextDecoder("utf-8", { fatal: true }).decode(bytes)
      ) as T,
    }
  } catch {
    return { ok: false, reason: "invalid" }
  }
}
