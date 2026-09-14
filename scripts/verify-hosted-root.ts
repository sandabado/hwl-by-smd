import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { isIP } from "node:net"

export const HOSTED_ROOT_ORIGIN_ENV = "HOSTED_ROOT_ORIGIN"
export const MAX_HOSTED_ROOT_HTML_BYTES = 2 * 1024 * 1024
export const PROTECTED_PREVIEW_ORIGIN = "https://preview.hwlbysmd.com"
export const ROOT_CANARY_QUERY = "__hwl_root_canary=1"

type Environment = Readonly<Record<string, string | undefined>>

export type HostedRootCheck = {
  detail: string
  name: string
  status: "fail" | "pass"
}

export type HostedRootVerification = {
  checks: HostedRootCheck[]
  ok: boolean
  origin: string
}

export type VerifyHostedRootOptions = {
  environment?: Environment
  fetchImpl?: typeof fetch
  origin: string
  timeoutMs?: number
}

export type HostedRootCliDependencies = {
  environment?: Environment
  fetchImpl?: typeof fetch
  stderr?: (message: string) => void
  stdout?: (message: string) => void
}

function check(
  status: HostedRootCheck["status"],
  name: string,
  detail: string
): HostedRootCheck {
  return { detail, name, status }
}

function isLocalHostname(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "")

  return (
    isIP(normalized) !== 0 ||
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local")
  )
}

export function normalizePublicOrigin(input: string) {
  let url: URL

  try {
    url = new URL(input.trim())
  } catch {
    throw new Error("Hosted root origin must be an absolute HTTPS origin.")
  }

  if (url.protocol !== "https:") {
    throw new Error("Hosted root origin must use HTTPS.")
  }
  if (url.username || url.password) {
    throw new Error("Hosted root origin must not contain credentials.")
  }
  if (url.pathname !== "/" || url.search || url.hash) {
    throw new Error(
      "Hosted root origin must not contain a path, query, or hash."
    )
  }
  if (isLocalHostname(url.hostname)) {
    throw new Error(
      "Hosted root origin must use a public hostname, not a local or IP-literal host."
    )
  }

  return url.origin
}

export function createHostedRootHeaders({
  environment = process.env,
  origin,
}: {
  environment?: Environment
  origin: string
}) {
  const normalizedOrigin = normalizePublicOrigin(origin)
  const requestHeaders = new Headers()
  requestHeaders.set(
    "accept",
    "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8"
  )

  const bypassSecret = environment.VERCEL_AUTOMATION_BYPASS_SECRET?.trim()
  if (bypassSecret) {
    if (normalizedOrigin !== PROTECTED_PREVIEW_ORIGIN) {
      throw new Error(
        "The environment-derived Vercel bypass may only be sent to the canonical HWL Preview origin."
      )
    }
    requestHeaders.set("x-vercel-protection-bypass", bypassSecret)
  }

  return requestHeaders
}

type HtmlStartTag = {
  attributes: Map<string, string | null>
  name: string
}

type JavaScriptLexState =
  "block-comment" | "double" | "line-comment" | "normal" | "single" | "template"

const INERT_MARKUP_CONTAINERS = new Set([
  "iframe",
  "noembed",
  "noframes",
  "noscript",
  "script",
  "style",
  "template",
  "textarea",
  "title",
  "xmp",
])

function findHtmlTagEnd(html: string, start: number) {
  let quote: '"' | "'" | null = null

  for (let cursor = start; cursor < html.length; cursor += 1) {
    const character = html[cursor]
    if (quote) {
      if (character === quote) quote = null
      continue
    }
    if (character === '"' || character === "'") {
      quote = character
      continue
    }
    if (character === ">") return cursor
  }

  return -1
}

function parseHtmlStartTag(source: string): HtmlStartTag | null {
  const match = source.match(/^<([a-z][a-z0-9:-]*)([\s\S]*?)\/?\s*>$/i)
  if (!match) return null

  const attributes = new Map<string, string | null>()
  const attributeText = match[2] ?? ""
  const attributePattern =
    /(?:^|\s)([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

  for (const attribute of attributeText.matchAll(attributePattern)) {
    const name = (attribute[1] ?? "").toLowerCase()
    if (!name || attributes.has(name)) continue
    attributes.set(name, attribute[2] ?? attribute[3] ?? attribute[4] ?? null)
  }

  return { attributes, name: (match[1] ?? "").toLowerCase() }
}

function findHtmlClosingTagStart(
  lowercaseHtml: string,
  name: string,
  start: number
) {
  const prefix = `</${name}`
  let cursor = lowercaseHtml.indexOf(prefix, start)

  while (cursor !== -1) {
    const boundary = lowercaseHtml[cursor + prefix.length]
    if (!boundary || /[\s/>]/.test(boundary)) return cursor
    cursor = lowercaseHtml.indexOf(prefix, cursor + prefix.length)
  }

  return -1
}

function scanHtmlDocument(html: string) {
  const scriptBodies: string[] = []
  const tags: HtmlStartTag[] = []
  const lowercaseHtml = html.toLowerCase()
  let cursor = 0

  while (cursor < html.length) {
    const tagStart = html.indexOf("<", cursor)
    if (tagStart === -1) break

    if (html.startsWith("<!--", tagStart)) {
      const commentEnd = html.indexOf("-->", tagStart + 4)
      cursor = commentEnd === -1 ? html.length : commentEnd + 3
      continue
    }

    const tagEnd = findHtmlTagEnd(html, tagStart + 1)
    if (tagEnd === -1) break
    const tag = parseHtmlStartTag(html.slice(tagStart, tagEnd + 1))
    if (!tag) {
      cursor = tagEnd + 1
      continue
    }

    if (tag.name === "plaintext") {
      cursor = html.length
      continue
    }

    if (INERT_MARKUP_CONTAINERS.has(tag.name)) {
      const closingStart = findHtmlClosingTagStart(
        lowercaseHtml,
        tag.name,
        tagEnd + 1
      )
      if (closingStart === -1) {
        cursor = html.length
        continue
      }
      if (tag.name === "script") {
        scriptBodies.push(html.slice(tagEnd + 1, closingStart))
      }
      const closingEnd = findHtmlTagEnd(html, closingStart + 2)
      cursor = closingEnd === -1 ? html.length : closingEnd + 1
      continue
    }

    tags.push(tag)
    cursor = tagEnd + 1
  }

  return { scriptBodies, tags }
}

function extractInlineScriptBodies(html: string) {
  return scanHtmlDocument(html).scriptBodies
}

function findJsonNextFlightPushes(script: string) {
  const calls: unknown[][] = []
  const callName = "self.__next_f.push"
  let cursor = 0
  let state: JavaScriptLexState = "normal"

  while (cursor < script.length) {
    const character = script[cursor]
    const nextCharacter = script[cursor + 1]

    if (state === "line-comment") {
      if (character === "\n" || character === "\r") state = "normal"
      cursor += 1
      continue
    }
    if (state === "block-comment") {
      if (character === "*" && nextCharacter === "/") {
        state = "normal"
        cursor += 2
      } else {
        cursor += 1
      }
      continue
    }
    if (state !== "normal") {
      if (character === "\\") {
        cursor += 2
        continue
      }
      const closingCharacter =
        state === "single" ? "'" : state === "double" ? '"' : "`"
      if (character === closingCharacter) state = "normal"
      cursor += 1
      continue
    }

    if (character === "/" && nextCharacter === "/") {
      state = "line-comment"
      cursor += 2
      continue
    }
    if (character === "/" && nextCharacter === "*") {
      state = "block-comment"
      cursor += 2
      continue
    }
    if (character === "'" || character === '"' || character === "`") {
      state =
        character === "'" ? "single" : character === '"' ? "double" : "template"
      cursor += 1
      continue
    }

    if (!script.startsWith(callName, cursor)) {
      cursor += 1
      continue
    }

    const previousCharacter = script[cursor - 1]
    if (previousCharacter && /[\w$.]/.test(previousCharacter)) {
      cursor += callName.length
      continue
    }

    let openParenthesis = cursor + callName.length
    while (/\s/.test(script[openParenthesis] ?? "")) openParenthesis += 1
    if (script[openParenthesis] !== "(") {
      cursor += callName.length
      continue
    }

    let nestedState: JavaScriptLexState = "normal"
    let depth = 1
    let endParenthesis = openParenthesis + 1
    for (; endParenthesis < script.length; endParenthesis += 1) {
      const nestedCharacter = script[endParenthesis]
      const nestedNextCharacter = script[endParenthesis + 1]

      if (nestedState === "line-comment") {
        if (nestedCharacter === "\n" || nestedCharacter === "\r") {
          nestedState = "normal"
        }
        continue
      }
      if (nestedState === "block-comment") {
        if (nestedCharacter === "*" && nestedNextCharacter === "/") {
          nestedState = "normal"
          endParenthesis += 1
        }
        continue
      }
      if (nestedState !== "normal") {
        if (nestedCharacter === "\\") {
          endParenthesis += 1
          continue
        }
        const nestedClosingCharacter =
          nestedState === "single" ? "'" : nestedState === "double" ? '"' : "`"
        if (nestedCharacter === nestedClosingCharacter) nestedState = "normal"
        continue
      }

      if (nestedCharacter === "/" && nestedNextCharacter === "/") {
        nestedState = "line-comment"
        endParenthesis += 1
        continue
      }
      if (nestedCharacter === "/" && nestedNextCharacter === "*") {
        nestedState = "block-comment"
        endParenthesis += 1
        continue
      }
      if (
        nestedCharacter === "'" ||
        nestedCharacter === '"' ||
        nestedCharacter === "`"
      ) {
        nestedState =
          nestedCharacter === "'"
            ? "single"
            : nestedCharacter === '"'
              ? "double"
              : "template"
        continue
      }
      if (nestedCharacter === "(") depth += 1
      if (nestedCharacter === ")") {
        depth -= 1
        if (depth === 0) break
      }
    }

    if (depth !== 0) break

    const argument = script.slice(openParenthesis + 1, endParenthesis).trim()
    try {
      const parsed = JSON.parse(argument)
      if (Array.isArray(parsed)) calls.push(parsed)
    } catch {
      // Next.js emits JSON-compatible push arguments. A lookalike JavaScript
      // expression is not release evidence and is deliberately ignored.
    }
    cursor = endParenthesis + 1
  }

  return calls
}

function extractFirstJsonObject(input: string) {
  let cursor = 0
  while (/\s/.test(input[cursor] ?? "")) cursor += 1
  if (input[cursor] !== "{") return null

  const start = cursor
  let depth = 0
  let inString = false
  for (; cursor < input.length; cursor += 1) {
    const character = input[cursor]
    if (inString) {
      if (character === "\\") {
        cursor += 1
      } else if (character === '"') {
        inString = false
      }
      continue
    }
    if (character === '"') {
      inString = true
      continue
    }
    if (character === "{") depth += 1
    if (character === "}") {
      depth -= 1
      if (depth === 0) return input.slice(start, cursor + 1)
    }
  }

  return null
}

function extractNextFlightBootstraps(html: string) {
  const bootstraps: Record<string, unknown>[] = []

  for (const script of extractInlineScriptBodies(html)) {
    for (const call of findJsonNextFlightPushes(script)) {
      const [channel, payload] = call
      if (
        channel !== 1 ||
        typeof payload !== "string" ||
        !payload.startsWith("0:")
      ) {
        continue
      }

      const objectText = extractFirstJsonObject(payload.slice(2))
      if (!objectText) continue
      try {
        const parsed = JSON.parse(objectText)
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          bootstraps.push(parsed as Record<string, unknown>)
        }
      } catch {
        // Malformed bootstrap data is treated as missing by the exact checks.
      }
    }
  }

  return bootstraps
}

export function extractRootFlightSegments(html: string) {
  const segments = new Set<string>()

  for (const bootstrap of extractNextFlightBootstraps(html)) {
    const root = bootstrap.c
    if (
      Array.isArray(root) &&
      root.length >= 2 &&
      root[0] === "" &&
      typeof root[1] === "string"
    ) {
      segments.add(root[1])
    }
  }

  return [...segments]
}

export function extractFirstFlightRouteSegments(html: string) {
  const segments = new Set<string>()

  for (const bootstrap of extractNextFlightBootstraps(html)) {
    const flight = bootstrap.f
    const firstRoute =
      Array.isArray(flight) &&
      Array.isArray(flight[0]) &&
      Array.isArray(flight[0][0])
        ? flight[0][0]
        : null
    if (firstRoute && typeof firstRoute[0] === "string") {
      segments.add(firstRoute[0])
    }
  }

  return [...segments]
}

function extractMarkupStartTags(html: string) {
  return scanHtmlDocument(html).tags
}

function hasExactAttribute(
  tags: readonly HtmlStartTag[],
  name: string,
  value: string
) {
  return tags.some((tag) => tag.attributes.get(name) === value)
}

export function auditRootHtml(html: string) {
  const checks: HostedRootCheck[] = []
  const tags = extractMarkupStartTags(html)
  const rootSegments = extractRootFlightSegments(html)
  const firstRouteSegments = extractFirstFlightRouteSegments(html)
  const hasIndexSegment = rootSegments.includes("index")
  const hasCanonicalRootSegments =
    rootSegments.length > 0 && rootSegments.every((segment) => segment === "")
  const hasIndexRouteSegment = firstRouteSegments.includes("index")
  const hasCanonicalRouteSegments =
    firstRouteSegments.length > 0 &&
    firstRouteSegments.every((segment) => segment === "")

  // These Flight checks intentionally remain release-blocking while Next.js is
  // pinned to 16.3.4. The root segment drives usePathname() during hydration;
  // accepting `index` here recreates the proven server/client route mismatch.
  checks.push(
    check(
      hasIndexSegment ? "fail" : "pass",
      "Root Flight state excludes index",
      hasIndexSegment
        ? 'the raw root response embeds c:["","index"]'
        : "the raw root response does not embed an index root segment"
    )
  )
  checks.push(
    check(
      hasCanonicalRootSegments ? "pass" : "fail",
      "Root Flight state is canonical",
      hasCanonicalRootSegments
        ? 'the raw root response embeds c:["",""]'
        : "the raw root response has a missing or unexpected root segment"
    )
  )
  checks.push(
    check(
      !hasIndexRouteSegment && hasCanonicalRouteSegments ? "pass" : "fail",
      "Root Flight route tree is canonical",
      hasIndexRouteSegment
        ? "the first Flight route-tree segment is index"
        : hasCanonicalRouteSegments
          ? "the first Flight route-tree segment is empty"
          : "the first Flight route-tree segment is missing or unexpected"
    )
  )

  const hasAppShell = hasExactAttribute(tags, "data-app-shell", "")
  checks.push(
    check(
      hasAppShell ? "pass" : "fail",
      "Homepage app shell",
      hasAppShell
        ? "the raw response contains the HWL application shell"
        : "the raw response does not contain the HWL application shell"
    )
  )

  const hasBreadcrumb = tags.some(
    (tag) =>
      tag.name === "nav" &&
      tag.attributes.get("aria-label")?.toLowerCase() === "breadcrumb"
  )
  checks.push(
    check(
      hasBreadcrumb ? "fail" : "pass",
      "Homepage breadcrumb state",
      hasBreadcrumb
        ? "the raw homepage response renders a non-home breadcrumb"
        : "the raw homepage response does not render a breadcrumb"
    )
  )

  const hasScrollBreathClass = tags.some((tag) =>
    (tag.attributes.get("class") ?? "")
      .split(/\s+/)
      .some((token) => token === "scroll-breath")
  )
  const hasNonHomeEffects =
    hasScrollBreathClass ||
    tags.some((tag) => tag.attributes.has("data-scrolling"))
  checks.push(
    check(
      hasNonHomeEffects ? "fail" : "pass",
      "Homepage ambient effects state",
      hasNonHomeEffects
        ? "the raw homepage response renders effects reserved for non-home routes"
        : "the raw homepage response omits non-home route effects"
    )
  )

  const hasHomeHeader = hasExactAttribute(
    tags,
    "data-site-header-variant",
    "home"
  )
  checks.push(
    check(
      hasHomeHeader ? "pass" : "fail",
      "Homepage header state",
      hasHomeHeader
        ? "the raw homepage response renders the home header mode"
        : "the raw homepage response does not render the home header mode"
    )
  )

  const hasHomepageMarkers = [
    ["data-homepage", ""],
    ["id", "home-hero-heading"],
    ["data-home-hero-lift-cta", ""],
  ].every(([name, value]) => hasExactAttribute(tags, name, value))
  checks.push(
    check(
      hasHomepageMarkers ? "pass" : "fail",
      "Homepage identity markers",
      hasHomepageMarkers
        ? "the raw response contains the homepage, hero heading, and LIFT CTA markers"
        : "the raw response is missing a required homepage identity marker"
    )
  )

  const hasHydrationSentinel = hasExactAttribute(
    tags,
    "data-hwl-hydration-sentinel",
    ""
  )
  checks.push(
    check(
      hasHydrationSentinel ? "pass" : "fail",
      "Hydration sentinel marker",
      hasHydrationSentinel
        ? "the raw response contains the inert hydration sentinel marker"
        : "the raw response is missing the hydration sentinel marker"
    )
  )

  return checks
}

function redirectCheck({
  expectedLocation,
  name,
  request,
  response,
}: {
  expectedLocation: string
  name: string
  request: URL
  response: Response
}) {
  if (response.status !== 308) {
    return check(
      "fail",
      name,
      `${request.pathname}${request.search} returned ${response.status} instead of 308`
    )
  }

  const location = response.headers.get("location")
  if (!location) {
    return check("fail", name, "the redirect response has no Location header")
  }

  const matches = location === expectedLocation

  return check(
    matches ? "pass" : "fail",
    name,
    matches
      ? `${request.pathname}${request.search} returned ${response.status} to ${location}`
      : `the redirect Location must equal ${expectedLocation} exactly`
  )
}

async function safeFetch(
  fetchImpl: typeof fetch,
  url: URL,
  headers: Headers,
  timeoutMs: number
) {
  try {
    return await fetchImpl(url, {
      headers,
      method: "GET",
      redirect: "manual",
      // AbortSignal.timeout remains attached to the response stream, so the
      // same deadline covers headers and bounded body consumption.
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch {
    return null
  }
}

export async function readBoundedHtml(
  response: Response,
  maximumBytes = MAX_HOSTED_ROOT_HTML_BYTES
) {
  if (!Number.isFinite(maximumBytes) || maximumBytes <= 0) {
    throw new Error("HTML byte limit must be a positive number.")
  }

  const declaredLength = response.headers.get("content-length")
  if (declaredLength) {
    const parsedLength = Number(declaredLength)
    if (Number.isFinite(parsedLength) && parsedLength > maximumBytes) {
      throw new Error("The HTML response exceeds the verifier byte limit.")
    }
  }

  if (!response.body) return ""

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  const parts: string[] = []
  let receivedBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      receivedBytes += value.byteLength
      if (receivedBytes > maximumBytes) {
        try {
          await reader.cancel()
        } catch {
          // The bounded failure below remains authoritative if cancellation is
          // unsupported or the remote peer has already closed the stream.
        }
        throw new Error("The HTML response exceeds the verifier byte limit.")
      }
      parts.push(decoder.decode(value, { stream: true }))
    }
    parts.push(decoder.decode())
    return parts.join("")
  } finally {
    reader.releaseLock()
  }
}

export async function verifyHostedRoot({
  environment = process.env,
  fetchImpl = fetch,
  origin: inputOrigin,
  timeoutMs = 15_000,
}: VerifyHostedRootOptions): Promise<HostedRootVerification> {
  const origin = normalizePublicOrigin(inputOrigin)
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error("Hosted root timeout must be a positive integer.")
  }

  const requestHeaders = createHostedRootHeaders({
    environment,
    origin,
  })
  const checks: HostedRootCheck[] = []
  const indexUrl = new URL("/index", origin)
  const indexResponse = await safeFetch(
    fetchImpl,
    indexUrl,
    requestHeaders,
    timeoutMs
  )

  checks.push(
    indexResponse
      ? redirectCheck({
          expectedLocation: "/",
          name: "/index canonical redirect",
          request: indexUrl,
          response: indexResponse,
        })
      : check(
          "fail",
          "/index canonical redirect",
          "the request failed before receiving a response"
        )
  )
  if (checks.at(-1)?.status === "fail") {
    return { checks, ok: false, origin }
  }

  const queryIndexUrl = new URL(`/index?${ROOT_CANARY_QUERY}`, origin)
  const queryIndexResponse = await safeFetch(
    fetchImpl,
    queryIndexUrl,
    requestHeaders,
    timeoutMs
  )
  checks.push(
    queryIndexResponse
      ? redirectCheck({
          expectedLocation: `/?${ROOT_CANARY_QUERY}`,
          name: "/index query-preserving redirect",
          request: queryIndexUrl,
          response: queryIndexResponse,
        })
      : check(
          "fail",
          "/index query-preserving redirect",
          "the request failed before receiving a response"
        )
  )
  if (checks.at(-1)?.status === "fail") {
    return { checks, ok: false, origin }
  }

  const rootUrl = new URL("/", origin)
  const rootResponse = await safeFetch(
    fetchImpl,
    rootUrl,
    requestHeaders,
    timeoutMs
  )

  if (!rootResponse) {
    checks.push(
      check(
        "fail",
        "/ response",
        "the request failed before receiving a response"
      )
    )
  } else if (rootResponse.status !== 200) {
    checks.push(
      check(
        "fail",
        "/ response",
        `/ returned ${rootResponse.status} instead of 200`
      )
    )
  } else {
    checks.push(check("pass", "/ response", "/ returned 200"))
    const contentType = rootResponse.headers.get("content-type") ?? ""
    const contentTypeEssence = contentType
      .split(";", 1)[0]
      ?.trim()
      .toLowerCase()
    const htmlContentType = contentTypeEssence === "text/html"
    checks.push(
      check(
        htmlContentType ? "pass" : "fail",
        "/ content type",
        htmlContentType
          ? "/ returned HTML"
          : "/ did not return an HTML content type"
      )
    )
    if (!htmlContentType) {
      return { checks, ok: false, origin }
    }

    try {
      checks.push(...auditRootHtml(await readBoundedHtml(rootResponse)))
    } catch {
      checks.push(
        check("fail", "/ response body", "the HTML response could not be read")
      )
    }
  }

  return {
    checks,
    ok: checks.every(({ status }) => status === "pass"),
    origin,
  }
}

export function parseHostedRootOrigin(
  argv: readonly string[],
  environment: Environment = process.env
) {
  let cliOrigin: string | undefined

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === "--help" || argument === "-h") return null

    if (argument === "--origin") {
      const value = argv[index + 1]
      if (!value || value.startsWith("-")) {
        throw new Error("--origin requires a value.")
      }
      cliOrigin = value
      index += 1
      continue
    }

    if (argument.startsWith("--origin=")) {
      cliOrigin = argument.slice("--origin=".length)
      continue
    }

    if (argument.startsWith("-")) {
      throw new Error("Unknown hosted root verifier option.")
    }
    if (cliOrigin) {
      throw new Error("Provide exactly one hosted root origin.")
    }
    cliOrigin = argument
  }

  const inputOrigin = cliOrigin ?? environment[HOSTED_ROOT_ORIGIN_ENV]
  if (!inputOrigin) {
    throw new Error(`Provide --origin or set ${HOSTED_ROOT_ORIGIN_ENV}.`)
  }

  return normalizePublicOrigin(inputOrigin)
}

const USAGE = `Usage:
  npm run verify:hosted-root -- --origin https://preview.hwlbysmd.com
  HOSTED_ROOT_ORIGIN=https://preview.hwlbysmd.com npm run verify:hosted-root

Optional Vercel protection bypass:
  Set VERCEL_AUTOMATION_BYPASS_SECRET for https://preview.hwlbysmd.com only.
  The secret is sent only in x-vercel-protection-bypass and is never printed.`

export async function runHostedRootCli(
  argv: readonly string[],
  {
    environment = process.env,
    fetchImpl = fetch,
    stderr = console.error,
    stdout = console.log,
  }: HostedRootCliDependencies = {}
) {
  let origin: string | null
  try {
    origin = parseHostedRootOrigin(argv, environment)
  } catch (error) {
    stderr(error instanceof Error ? error.message : "Invalid verifier input.")
    stderr(USAGE)
    return 1
  }

  if (!origin) {
    stdout(USAGE)
    return 0
  }

  let result: HostedRootVerification
  try {
    result = await verifyHostedRoot({ environment, fetchImpl, origin })
  } catch (error) {
    stderr(error instanceof Error ? error.message : "Verification failed.")
    return 1
  }

  stdout(`Hosted root verification: ${result.origin}`)
  for (const item of result.checks) {
    stdout(`${item.status.toUpperCase()} ${item.name}: ${item.detail}`)
  }
  stdout(
    result.ok
      ? "Hosted root verification passed."
      : "Hosted root verification failed."
  )

  return result.ok ? 0 : 1
}

const executedPath = process.argv[1] ? resolve(process.argv[1]) : null
if (executedPath === fileURLToPath(import.meta.url)) {
  process.exitCode = await runHostedRootCli(process.argv.slice(2))
}
