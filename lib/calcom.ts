import "server-only"

const CALCOM_API_VERSION = "2024-06-14"
const CALCOM_EVENT_TYPES_ENDPOINT = "https://api.cal.com/v2/event-types"
const CALCOM_USERNAME = "hwlbysmd"
const DEFAULT_CALCOM_PROFILE_URL = "https://cal.com/hwlbysmd"

export type CalcomPublicEventType = Readonly<{
  id: number
  lengthInMinutes: number
  slug: string
  title: string
  url: string
}>

export type CalcomPublicEventTypesResult =
  | Readonly<{
      eventTypes: readonly CalcomPublicEventType[]
      status: "available"
    }>
  | Readonly<{
      eventTypes: readonly []
      reason: "http-error" | "invalid-response" | "request-error"
      status: "unavailable"
    }>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && typeof value === "number" && value > 0
}

function readNonEmptyString(value: unknown) {
  if (typeof value !== "string") return null

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function normalizeProfileUrl(value: string | undefined) {
  if (!value?.trim()) return DEFAULT_CALCOM_PROFILE_URL

  try {
    const url = new URL(value.trim())

    if (
      (url.protocol !== "https:" && url.protocol !== "http:") ||
      url.username ||
      url.password
    ) {
      return DEFAULT_CALCOM_PROFILE_URL
    }

    url.hash = ""
    url.search = ""
    url.pathname = url.pathname.replace(/\/+$/, "") || "/"

    return url.toString().replace(/\/$/, "")
  } catch {
    return DEFAULT_CALCOM_PROFILE_URL
  }
}

export const CALCOM_PROFILE_URL = normalizeProfileUrl(
  process.env.CALCOM_PROFILE_URL ?? process.env.NEXT_PUBLIC_CALCOM_URL
)

export function buildCalcomEventUrl(eventSlug: string) {
  const slug = eventSlug.trim().replace(/^\/+|\/+$/g, "")
  if (!slug || slug.includes("/")) return null

  const url = new URL(CALCOM_PROFILE_URL)
  const profilePath = url.pathname.replace(/\/+$/, "")

  url.pathname = `${profilePath}/${encodeURIComponent(slug)}`
  return url.toString()
}

function parsePublicEventType(value: unknown): CalcomPublicEventType | null {
  if (!isRecord(value) || value.hidden === true) return null
  if (value.hidden !== undefined && typeof value.hidden !== "boolean")
    return null

  const slug = readNonEmptyString(value.slug)
  const title = readNonEmptyString(value.title)

  if (
    !isPositiveInteger(value.id) ||
    !isPositiveInteger(value.lengthInMinutes) ||
    !slug ||
    !title
  ) {
    return null
  }

  const url = buildCalcomEventUrl(slug)
  if (!url) return null

  return {
    id: value.id,
    lengthInMinutes: value.lengthInMinutes,
    slug,
    title,
    url,
  }
}

const unavailable = (
  reason: Extract<
    CalcomPublicEventTypesResult,
    { status: "unavailable" }
  >["reason"]
): CalcomPublicEventTypesResult => ({
  eventTypes: [],
  reason,
  status: "unavailable",
})

export async function getCalcomPublicEventTypes(): Promise<CalcomPublicEventTypesResult> {
  try {
    const url = new URL(CALCOM_EVENT_TYPES_ENDPOINT)
    url.searchParams.set("username", CALCOM_USERNAME)

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "cal-api-version": CALCOM_API_VERSION,
      },
      next: {
        revalidate: 300,
        tags: ["calcom-public-event-types"],
      },
      signal: AbortSignal.timeout(5_000),
    })

    if (!response.ok) return unavailable("http-error")

    const payload: unknown = await response.json()
    if (
      !isRecord(payload) ||
      payload.status !== "success" ||
      !Array.isArray(payload.data)
    ) {
      return unavailable("invalid-response")
    }

    const eventTypes: CalcomPublicEventType[] = []

    for (const value of payload.data) {
      if (isRecord(value) && value.hidden === true) continue

      const eventType = parsePublicEventType(value)
      if (!eventType) return unavailable("invalid-response")

      eventTypes.push(eventType)
    }

    return { eventTypes, status: "available" }
  } catch {
    return unavailable("request-error")
  }
}
