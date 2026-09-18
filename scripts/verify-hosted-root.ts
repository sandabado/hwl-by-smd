import { createHash } from "node:crypto"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { isIP } from "node:net"
import {
  html as parse5Html,
  parse as parseHtml,
  type DefaultTreeAdapterTypes,
} from "parse5"

export const HOSTED_ROOT_ORIGIN_ENV = "HOSTED_ROOT_ORIGIN"
export const MAX_HOSTED_ROOT_HTML_BYTES = 2 * 1024 * 1024
export const PROTECTED_PREVIEW_ORIGIN = "https://preview.hwlbysmd.com"
export const ROOT_CANARY_QUERY = "__hwl_root_canary=1"
export const BROWSER_POST_HYDRATION_REQUIREMENT =
  'Separate browser post-hydration verification remains required: require data-site-header-variant="home", data-hwl-hydrated="true", and zero React hydration errors.'

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
  ancestors: readonly HtmlStartTag[]
  attributes: Map<string, string | null>
  hasExplicitEndTag: boolean
  hasReviewedReactBoundary: boolean
  name: string
  sourceEnd: number | null
  sourceStart: number | null
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

const ACTIVE_EMBEDDING_ELEMENTS = new Set([
  "base",
  "embed",
  "frame",
  "iframe",
  "object",
])

const ACTIVE_SVG_SMIL_ELEMENTS = new Set([
  "animate",
  "animatemotion",
  "animatetransform",
  "discard",
  "set",
])

const EXECUTABLE_URL_ATTRIBUTES = new Set([
  "action",
  "formaction",
  "href",
  "src",
  "xlink:href",
])

function isCommentNode(
  node: DefaultTreeAdapterTypes.Node | undefined
): node is DefaultTreeAdapterTypes.CommentNode {
  return node?.nodeName === "#comment"
}

function hasReviewedReactBoundary(element: DefaultTreeAdapterTypes.Element) {
  if (element.tagName.toLowerCase() !== "template") return false
  const elementLocation = element.sourceCodeLocation
  const elementStart = elementLocation?.startTag?.startOffset
  const elementEnd = elementLocation?.endTag?.endOffset
  if (elementStart === undefined || elementEnd === undefined) return false
  const parent = element.parentNode
  if (!parent || !("childNodes" in parent)) return false

  const siblings = parent.childNodes
  const index = siblings.indexOf(element)
  const opening = siblings[index - 1]
  if (
    !isCommentNode(opening) ||
    opening.data !== "$?" ||
    opening.sourceCodeLocation?.endOffset !== elementStart
  ) {
    return false
  }

  let nestedBoundaries = 0
  for (const sibling of siblings.slice(index + 1)) {
    if (!isCommentNode(sibling)) continue
    if (sibling.data === "/$" || sibling.data === "/&") {
      if (nestedBoundaries === 0) {
        return (
          sibling.data === "/$" &&
          sibling.sourceCodeLocation !== null &&
          sibling.sourceCodeLocation !== undefined &&
          sibling.sourceCodeLocation.startOffset >= elementEnd
        )
      }
      nestedBoundaries -= 1
    } else if (["$", "$?", "$~", "$!", "&"].includes(sibling.data)) {
      nestedBoundaries += 1
    }
  }

  return false
}

function toHtmlStartTag(
  element: DefaultTreeAdapterTypes.Element,
  ancestors: readonly HtmlStartTag[]
) {
  const sourceCodeLocation = element.sourceCodeLocation

  return {
    ancestors,
    attributes: new Map(
      element.attrs.map(({ name, value }) => [name.toLowerCase(), value])
    ),
    hasExplicitEndTag: sourceCodeLocation?.endTag !== undefined,
    hasReviewedReactBoundary: hasReviewedReactBoundary(element),
    name: element.tagName.toLowerCase(),
    sourceEnd:
      sourceCodeLocation?.endTag?.endOffset ??
      sourceCodeLocation?.endOffset ??
      null,
    sourceStart:
      sourceCodeLocation?.startTag?.startOffset ??
      sourceCodeLocation?.startOffset ??
      null,
  } satisfies HtmlStartTag
}

function hasOnlyAttributes(tag: HtmlStartTag, allowed: ReadonlySet<string>) {
  return [...tag.attributes.keys()].every((name) => allowed.has(name))
}

function isReviewedInlineFlightScriptTag(tag: HtmlStartTag) {
  return (
    tag.name === "script" &&
    hasOnlyAttributes(tag, new Set(["nonce"])) &&
    (!tag.attributes.has("nonce") ||
      typeof tag.attributes.get("nonce") === "string")
  )
}

// Next 16.3.4's root timing bootstrap.
const REVIEWED_NEXT_TIMING_SCRIPT_SHA256 =
  "ee6bb81f4e9fc030a39a7c71affc4d1f2b900baa4b4c7af83361388d7c39599b"
// React 19.2.4's streamed-Suspense reveal bootstrap for this root. This exact
// program moves the children of S:0 to the B:0 placeholder.
const REVIEWED_REACT_REVEAL_SCRIPT_SHA256 =
  "4009527b06902e2fcd3c2ce78c0652caf43bda1783d1577198d0c3919782c607"

const REVIEWED_NEXT_RUNTIME_SCRIPT_SHA256 = new Set([
  REVIEWED_NEXT_TIMING_SCRIPT_SHA256,
  REVIEWED_REACT_REVEAL_SCRIPT_SHA256,
])

export const REVIEWED_NEXT_EXTERNAL_SCRIPT_SOURCES = [
  "/_next/static/chunks/4bd1b696-93bf506b236d6248.js",
  "/_next/static/chunks/3794-3679f1c05160977c.js",
  "/_next/static/chunks/main-app-d601664cda3e88ab.js",
  "/_next/static/chunks/44530001-78d9977d0e16ef0a.js",
  "/_next/static/chunks/8500-f4d7bfbe7500f274.js",
  "/_next/static/chunks/875-2dd0ff8986908486.js",
  "/_next/static/chunks/8409-0049b4923afd3ae8.js",
  "/_next/static/chunks/3146-197f68d67b173252.js",
  "/_next/static/chunks/8437-977886ddbe77cb93.js",
  "/_next/static/chunks/8954-2fe9e490e7785b71.js",
  "/_next/static/chunks/4749-c5e5d9439ddd3afc.js",
  "/_next/static/chunks/6541-e1aa21669a80a57f.js",
  "/_next/static/chunks/app/layout-928de93dccfc5119.js",
  "/_next/static/chunks/app/error-fabed4a4230b6e36.js",
  "/_next/static/chunks/9670-235729f76b0767a5.js",
  "/_next/static/chunks/1161-ae80ea21d03402d2.js",
  "/_next/static/chunks/app/not-found-01ef9718fea3fe09.js",
  "/_next/static/chunks/app/page-535693eedf285425.js",
  "/_next/static/chunks/polyfills-42372ed130431b0a.js",
  "/_next/static/chunks/webpack-d6025aca8d9fda69.js",
] as const

const REVIEWED_NEXT_EXTERNAL_SCRIPT_SOURCE_PATTERNS =
  REVIEWED_NEXT_EXTERNAL_SCRIPT_SOURCES.map((source) => {
    const match = source.match(/^(.*-)[0-9a-f]{16}(\.js)$/)
    if (!match)
      throw new Error(`Invalid reviewed Next script source: ${source}`)
    return { prefix: match[1] ?? "", suffix: match[2] ?? "" }
  })

function matchesReviewedNextScriptSource(source: string, index?: number) {
  const candidates =
    index === undefined
      ? REVIEWED_NEXT_EXTERNAL_SCRIPT_SOURCE_PATTERNS
      : [REVIEWED_NEXT_EXTERNAL_SCRIPT_SOURCE_PATTERNS[index]]

  return candidates.some(
    (pattern) =>
      pattern !== undefined &&
      source.startsWith(pattern.prefix) &&
      source.endsWith(pattern.suffix) &&
      /^[0-9a-f]{16}$/.test(
        source.slice(pattern.prefix.length, -pattern.suffix.length)
      )
  )
}

function isReviewedNextRuntimeScript(script: string) {
  const digest = createHash("sha256").update(script).digest("hex")
  return REVIEWED_NEXT_RUNTIME_SCRIPT_SHA256.has(digest)
}

function isReviewedReactRevealScript(script: string) {
  const digest = createHash("sha256").update(script).digest("hex")
  return digest === REVIEWED_REACT_REVEAL_SCRIPT_SHA256
}

function isReviewedInertScriptTag(tag: HtmlStartTag) {
  const type = tag.attributes.get("type")?.trim().toLowerCase()

  // These MIME data blocks are not executed as JavaScript by the browser. Keep
  // the allowlist deliberately narrow; an unknown or executable type remains
  // release-blocking even when its text merely looks harmless.
  return (
    hasOnlyAttributes(tag, new Set(["id", "nonce", "type"])) &&
    (type === "application/json" || type === "application/ld+json")
  )
}

function isReviewedExternalNextScriptTag(tag: HtmlStartTag, body: string) {
  if (tag.name !== "script" || body.trim()) return false

  const source = tag.attributes.get("src")
  if (
    typeof source !== "string" ||
    !matchesReviewedNextScriptSource(source) ||
    !/^\/_next\/static\/chunks\/(?:[a-z0-9_.-]+\/)*[a-z0-9_.-]+\.js$/i.test(
      source
    ) ||
    source.split("/").some((segment) => segment === "." || segment === "..")
  ) {
    return false
  }

  const sourceIndex = REVIEWED_NEXT_EXTERNAL_SCRIPT_SOURCE_PATTERNS.findIndex(
    (_, index) => matchesReviewedNextScriptSource(source, index)
  )
  const reviewedSource = REVIEWED_NEXT_EXTERNAL_SCRIPT_SOURCES[sourceIndex]
  if (!reviewedSource) return false

  const asyncValue = tag.attributes.get("async")
  const noModuleValue = tag.attributes.get("nomodule")
  const hasAsync = tag.attributes.has("async")
  const hasNoModule = tag.attributes.has("nomodule")
  const validBooleanValue = (value: string | null | undefined) => value === ""
  if (
    (hasAsync && !validBooleanValue(asyncValue)) ||
    (hasNoModule && !validBooleanValue(noModuleValue))
  ) {
    return false
  }

  const id = tag.attributes.get("id")
  if (reviewedSource.includes("/polyfills-")) {
    return (
      hasOnlyAttributes(tag, new Set(["nomodule", "nonce", "src"])) &&
      hasNoModule &&
      !hasAsync &&
      !tag.attributes.has("id")
    )
  }
  if (reviewedSource.includes("/webpack-")) {
    return (
      hasOnlyAttributes(tag, new Set(["async", "id", "nonce", "src"])) &&
      hasAsync &&
      !hasNoModule &&
      id === "_R_"
    )
  }

  return (
    hasOnlyAttributes(tag, new Set(["async", "nonce", "src"])) &&
    hasAsync &&
    !hasNoModule &&
    !tag.attributes.has("id")
  )
}

function hasUnsupportedExecutableAttributes(tag: HtmlStartTag) {
  const hasJavascriptUrl = [...tag.attributes].some(([name, value]) => {
    if (!EXECUTABLE_URL_ATTRIBUTES.has(name) || typeof value !== "string") {
      return false
    }

    // HTML parsing has already decoded character references. Removing ASCII
    // controls and spaces makes this at least as strict as browser URL-scheme
    // preprocessing and rejects obfuscated executable navigation schemes.
    return value
      .replace(/[\u0000-\u0020]+/g, "")
      .toLowerCase()
      .startsWith("javascript:")
  })

  return (
    tag.attributes.has("srcdoc") ||
    hasJavascriptUrl ||
    [...tag.attributes.keys()].some((name) => name.startsWith("on")) ||
    [tag.attributes.get("id"), tag.attributes.get("name")].some(
      (value) => value === "__next_f"
    )
  )
}

function elementTextContent(element: DefaultTreeAdapterTypes.Element) {
  return element.childNodes
    .filter(
      (child): child is DefaultTreeAdapterTypes.TextNode =>
        child.nodeName === "#text"
    )
    .map((child) => child.value)
    .join("")
}

function isElementNode(
  node: DefaultTreeAdapterTypes.Node
): node is DefaultTreeAdapterTypes.Element {
  return "tagName" in node && "attrs" in node
}

function scanHtmlDocument(html: string) {
  let hasUnsupportedExecutableMarkup = false
  const allElementTags: HtmlStartTag[] = []
  const externalScripts: { source: string; tag: HtmlStartTag }[] = []
  const inlineScripts: { body: string; tag: HtmlStartTag }[] = []
  const liveTags: HtmlStartTag[] = []
  const tags: HtmlStartTag[] = []
  const templates: HtmlStartTag[] = []
  const document = parseHtml(html, {
    scriptingEnabled: true,
    sourceCodeLocationInfo: true,
  })
  const documentTypes = document.childNodes.filter(
    (node): node is DefaultTreeAdapterTypes.DocumentType =>
      node.nodeName === "#documentType"
  )
  const hasCanonicalDoctype =
    document.mode === "no-quirks" &&
    documentTypes.length === 1 &&
    documentTypes[0]?.name.toLowerCase() === "html" &&
    documentTypes[0].publicId === "" &&
    documentTypes[0].systemId === ""

  const visit = (
    node: DefaultTreeAdapterTypes.Node,
    insideForeignContent = false,
    htmlAncestors: readonly HtmlStartTag[] = []
  ) => {
    if (isElementNode(node)) {
      const tag = toHtmlStartTag(node, htmlAncestors)
      allElementTags.push(tag)
      const isHtmlElement = node.namespaceURI === parse5Html.NS.HTML
      const isInsideForeignContent = insideForeignContent || !isHtmlElement

      if (
        hasUnsupportedExecutableAttributes(tag) ||
        ACTIVE_EMBEDDING_ELEMENTS.has(tag.name) ||
        ACTIVE_SVG_SMIL_ELEMENTS.has(tag.name) ||
        (tag.name === "meta" && tag.attributes.has("http-equiv"))
      ) {
        hasUnsupportedExecutableMarkup = true
      }

      if (tag.name === "script") {
        const body = elementTextContent(node)
        const hasExternalSource = tag.attributes.has("src")

        if (tag.sourceStart === null || !tag.hasExplicitEndTag) {
          hasUnsupportedExecutableMarkup = true
        }

        if (!isHtmlElement) {
          // Script semantics vary across SVG and MathML integration points.
          // The root contract has no foreign-namespace scripts, so reject them.
          hasUnsupportedExecutableMarkup = true
        } else if (hasExternalSource) {
          if (!isReviewedExternalNextScriptTag(tag, body)) {
            hasUnsupportedExecutableMarkup = true
          } else {
            externalScripts.push({
              source: tag.attributes.get("src") as string,
              tag,
            })
          }
        } else if (isReviewedInlineFlightScriptTag(tag)) {
          inlineScripts.push({ body, tag })
        } else if (body.trim() && !isReviewedInertScriptTag(tag)) {
          // Every executable inline HTML script must be either a canonical
          // Flight instruction sequence or one of the pinned Next/React
          // bootstraps checked below.
          hasUnsupportedExecutableMarkup = true
        }
        return
      }

      const isHtmlTemplate = isHtmlElement && tag.name === "template"
      if (isHtmlTemplate) {
        if (
          [...tag.attributes.keys()].some((name) =>
            name.startsWith("shadowroot")
          )
        ) {
          // Declarative Shadow DOM attaches template content during parsing;
          // Chrome executes scripts within it. Ordinary HTML template content
          // remains inert and is deliberately not traversed.
          hasUnsupportedExecutableMarkup = true
        }
        // Keep the template element itself as structural evidence without
        // traversing its inert contents. React's reviewed streamed-Suspense
        // bootstrap uses the real B:0 template as its insertion boundary.
        templates.push(tag)
        return
      }

      if (!isHtmlElement && tag.name === "template") {
        // A `template` token in foreign content is not an inert HTML template.
        hasUnsupportedExecutableMarkup = true
      }

      // Negative evidence must cover the entire live DOM, including HTML
      // integration points beneath SVG/MathML. Positive HWL identity markers
      // remain restricted to ordinary HTML ancestry in `tags` below.
      liveTags.push(tag)

      if (!isInsideForeignContent && !INERT_MARKUP_CONTAINERS.has(tag.name)) {
        tags.push(tag)
      }

      if ("childNodes" in node) {
        const childHtmlAncestors = isInsideForeignContent
          ? htmlAncestors
          : [...htmlAncestors, tag]
        for (const child of node.childNodes) {
          visit(child, isInsideForeignContent, childHtmlAncestors)
        }
      }
      return
    }

    if ("childNodes" in node) {
      for (const child of node.childNodes) {
        visit(child, insideForeignContent, htmlAncestors)
      }
    }
  }

  visit(document)

  const bySourceStart = (
    left: { tag: HtmlStartTag },
    right: { tag: HtmlStartTag }
  ) => (left.tag.sourceStart as number) - (right.tag.sourceStart as number)
  externalScripts.sort(bySourceStart)
  inlineScripts.sort(bySourceStart)
  const externalScriptSources = externalScripts.map(({ source }) => source)
  const scriptBodies = inlineScripts.map(({ body }) => body)
  const reviewedReactRevealScripts = inlineScripts
    .filter(({ body }) => isReviewedReactRevealScript(body))
    .map(({ tag }) => tag)

  if (
    externalScriptSources.length !==
      REVIEWED_NEXT_EXTERNAL_SCRIPT_SOURCES.length ||
    externalScriptSources.some(
      (source, index) => !matchesReviewedNextScriptSource(source, index)
    )
  ) {
    // The deployed root must reference the exact executable chunk inventory
    // emitted by the reviewed candidate build, once each and in order. Only
    // each chunk's build-environment-specific 16-hex content hash may vary.
    hasUnsupportedExecutableMarkup = true
  }

  return {
    allElementTags,
    hasCanonicalDoctype,
    hasUnsupportedExecutableMarkup,
    liveTags,
    reviewedReactRevealScripts,
    scriptBodies,
    tags,
    templates,
  }
}

function extractInlineScriptBodies(html: string) {
  const { hasUnsupportedExecutableMarkup, scriptBodies } =
    scanHtmlDocument(html)
  return hasUnsupportedExecutableMarkup ? null : scriptBodies
}

function findJsonNextFlightPushes(script: string) {
  const calls: { initializes: boolean; value: unknown[] }[] = []
  const initializerCallName = "(self.__next_f=self.__next_f||[]).push"
  const callNames = [initializerCallName, "self.__next_f.push"]
  let cursor = 0
  let instructionBoundary = 0
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

    const callName = callNames.find((candidate) =>
      script.startsWith(candidate, cursor)
    )
    if (!callName) {
      cursor += 1
      continue
    }

    // Next's inlined Flight scripts are a direct top-level sequence of these
    // calls. Do not treat instructions hidden in branches, functions, or other
    // executable wrappers as data the browser necessarily delivered.
    const instructionSeparator = script.slice(instructionBoundary, cursor)
    if (!/^[\s;]*$/.test(instructionSeparator)) return null
    if (
      calls.length > 0 &&
      !instructionSeparator.includes(";") &&
      !/[\n\r\u2028\u2029]/.test(instructionSeparator)
    ) {
      // Two call expressions cannot be adjacent (or space-separated) in valid
      // JavaScript. A semicolon or line terminator is required between them.
      return null
    }

    const previousCharacter = script[cursor - 1]
    if (previousCharacter && /[\w$.]/.test(previousCharacter)) {
      return null
    }

    let openParenthesis = cursor + callName.length
    while (/\s/.test(script[openParenthesis] ?? "")) openParenthesis += 1
    if (script[openParenthesis] !== "(") {
      return null
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

    if (depth !== 0) return null

    const argument = script.slice(openParenthesis + 1, endParenthesis).trim()
    try {
      const parsed = JSON.parse(argument)
      if (!Array.isArray(parsed)) return null
      calls.push({
        initializes: callName === initializerCallName,
        value: parsed,
      })
    } catch {
      // Next.js emits JSON-compatible push arguments. A lookalike JavaScript
      // expression is not release evidence. If it can execute beside a valid
      // stream, silently ignoring it could conceal a queue mutation.
      return null
    }
    cursor = endParenthesis + 1
    instructionBoundary = cursor
  }

  if (calls.length > 0 && !/^[\s;]*$/.test(script.slice(instructionBoundary))) {
    return null
  }

  return calls
}

function advanceUtf8Bytes(input: string, start: number, byteLength: number) {
  let cursor = start
  let consumedBytes = 0

  while (cursor < input.length && consumedBytes < byteLength) {
    const codePoint = input.codePointAt(cursor)
    if (codePoint === undefined) return null

    const codePointBytes =
      codePoint <= 0x7f
        ? 1
        : codePoint <= 0x7ff
          ? 2
          : codePoint <= 0xffff
            ? 3
            : 4
    if (consumedBytes + codePointBytes > byteLength) return null

    consumedBytes += codePointBytes
    cursor += codePoint > 0xffff ? 2 : 1
  }

  return consumedBytes === byteLength ? cursor : null
}

const LENGTH_PREFIXED_FLIGHT_TAGS = new Set([
  "T",
  "A",
  "O",
  "o",
  "b",
  "U",
  "S",
  "s",
  "L",
  "l",
  "G",
  "g",
  "M",
  "m",
  "V",
])

function decodeFlightRecordId(recordId: string) {
  let decoded = 0

  // React's Flight client accumulates record IDs with 32-bit bitwise shifts.
  // Preserve those semantics so aliases such as `00` and the overflowing
  // `100000000` cannot hide a prior resolution of numeric record 0.
  for (const character of recordId) {
    const code = character.charCodeAt(0)
    const nibble = code > 96 ? code - 87 : code - 48
    decoded = (decoded << 4) | nibble
  }

  return decoded
}

function findRootFlightRows(payload: string) {
  const rows: string[] = []
  let rootRecordCount = 0
  let cursor = 0

  while (cursor < payload.length) {
    const colon = payload.indexOf(":", cursor)
    if (colon === -1) return null
    const recordId = payload.slice(cursor, colon)
    // Hint rows such as `:HL[...]` intentionally have an empty record ID.
    if (!/^[0-9a-f]*$/.test(recordId)) return null
    const valueStart = colon + 1
    const tag = payload[valueStart]
    const isEmptyIdHint = recordId === "" && tag === "H"
    const isNumericRootRecord =
      !isEmptyIdHint && decodeFlightRecordId(recordId) === 0

    // React accumulates the hexadecimal record ID numerically with 32-bit
    // shifts. `00`, overflow aliases such as `100000000`, and an empty
    // untagged ID all address record 0 in the browser. Only the canonical `0`
    // spelling is acceptable release evidence; otherwise an earlier alias
    // could resolve or poison root before the later canonical row.
    if (isNumericRootRecord) {
      rootRecordCount += 1
      if (recordId !== "0") return null
    }

    if (tag && LENGTH_PREFIXED_FLIGHT_TAGS.has(tag)) {
      const comma = payload.indexOf(",", valueStart + 1)
      if (comma === -1) return null
      const lengthText = payload.slice(valueStart + 1, comma)
      if (!/^[0-9a-f]+$/.test(lengthText)) return null
      const byteLength = Number.parseInt(lengthText, 16)
      if (!Number.isSafeInteger(byteLength)) return null
      const nextRecord = advanceUtf8Bytes(payload, comma + 1, byteLength)
      if (nextRecord === null) return null
      cursor = nextRecord
      continue
    }

    const newline = payload.indexOf("\n", valueStart)
    // React buffers ordinary rows until their LF delimiter arrives. Closing
    // the stream does not turn an unterminated final fragment into a row.
    if (newline === -1) return null
    if (isNumericRootRecord && payload[valueStart] === "{") {
      rows.push(payload.slice(valueStart, newline))
    }
    cursor = newline + 1
  }

  return { rootRecordCount, rows }
}

function collectOrderedFlightPayload(html: string) {
  const payloads: string[] = []
  let bootstrapped = false
  let previousPayloadEnd: number | null = null
  const reviewedRuntimeDigests = new Set<string>()
  const scriptBodies = extractInlineScriptBodies(html)
  if (scriptBodies === null) return null

  for (const script of scriptBodies) {
    const instructions = findJsonNextFlightPushes(script)
    if (instructions === null) return null
    if (instructions.length === 0) {
      if (!script.trim()) continue
      if (isReviewedNextRuntimeScript(script)) {
        const digest = createHash("sha256").update(script).digest("hex")
        if (reviewedRuntimeDigests.has(digest)) return null
        reviewedRuntimeDigests.add(digest)
        continue
      }

      // A nonempty classic inline program outside the two pinned Next/React
      // runtime bootstraps is not part of the reviewed root transport. Reject
      // it wholesale: static alias heuristics cannot safely establish that an
      // arbitrary program will leave `self.__next_f` untouched.
      return null
    }
    for (const { initializes, value: call } of instructions) {
      const [channel, payload] = call
      if (channel === 0) {
        // Next emits exactly one [0]. A repeated bootstrap can either discard
        // buffered chunks or leave already-enqueued bytes intact depending on
        // client timing, so static release evidence must reject that ambiguity.
        if (!initializes || bootstrapped || call.length !== 1) return null
        bootstrapped = true
      } else if (channel === 1) {
        // Next throws rather than accepting data before its bootstrap.
        if (initializes || !bootstrapped) return null
        if (typeof payload !== "string") return null
        if (payload.length > 0) {
          const firstCodeUnit = payload.charCodeAt(0)
          // Next TextEncodes each channel-1 push independently. Joining raw
          // JavaScript strings first would combine a high/low surrogate pair
          // split across pushes into one code point and change the byte stream.
          if (
            previousPayloadEnd !== null &&
            previousPayloadEnd >= 0xd800 &&
            previousPayloadEnd <= 0xdbff &&
            firstCodeUnit >= 0xdc00 &&
            firstCodeUnit <= 0xdfff
          ) {
            return null
          }
          previousPayloadEnd = payload.charCodeAt(payload.length - 1)
        }
        payloads.push(payload)
      } else if (channel === 3) {
        // Binary Flight chunks are not currently emitted by this root. Do not
        // discard their bytes and risk treating a continuation as a new row.
        return null
      } else {
        // Form-state and unknown instructions execute in Next's bootstrap but
        // are outside this root verifier's reviewed transport. Never ignore a
        // recognized push beside otherwise canonical evidence.
        return null
      }
    }
  }

  return bootstrapped ? payloads.join("") : null
}

function extractNextFlightBootstraps(html: string) {
  const bootstraps: Record<string, unknown>[] = []
  const payload = collectOrderedFlightPayload(html)
  if (payload === null) return bootstraps
  const result = findRootFlightRows(payload)
  // A valid root stream resolves record 0 exactly once. Accepting a later
  // duplicate could hide the first value React actually resolves.
  if (!result || result.rootRecordCount !== 1 || result.rows.length !== 1) {
    return bootstraps
  }

  // Channel-1 pushes are chunks of one ordered Flight byte stream, not
  // independent rows. Parsing the complete row also rejects a valid-looking
  // object followed by trailing data that React itself would reject.
  for (const row of result.rows) {
    try {
      const parsed = JSON.parse(row)
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        bootstraps.push(parsed as Record<string, unknown>)
      }
    } catch {
      return []
    }
  }

  return bootstraps
}

function isCanonicalRootBootstrapEnvelope(bootstrap: Record<string, unknown>) {
  const allowedKeys = new Set([
    "G",
    "P",
    "S",
    "a",
    "b",
    "c",
    "d",
    "f",
    "h",
    "i",
    "l",
    "m",
    "p",
    "q",
    "r",
    "s",
  ])
  const optionalUndefinedReferences = ["a", "d", "l", "m", "p", "r", "s"]

  return (
    ["P", "c", "f", "i", "q"].every((key) => Object.hasOwn(bootstrap, key)) &&
    Object.keys(bootstrap).every((key) => allowedKeys.has(key)) &&
    bootstrap.P === null &&
    bootstrap.i === false &&
    bootstrap.q === "" &&
    (!Object.hasOwn(bootstrap, "S") || bootstrap.S === true) &&
    (!Object.hasOwn(bootstrap, "h") || bootstrap.h === null) &&
    (!Object.hasOwn(bootstrap, "b") ||
      (typeof bootstrap.b === "string" && bootstrap.b.length > 0)) &&
    (!Object.hasOwn(bootstrap, "G") ||
      (Array.isArray(bootstrap.G) &&
        bootstrap.G.length === 2 &&
        typeof bootstrap.G[0] === "string" &&
        Array.isArray(bootstrap.G[1]))) &&
    optionalUndefinedReferences.every(
      (key) => !Object.hasOwn(bootstrap, key) || bootstrap[key] === "$undefined"
    )
  )
}

export function extractRootFlightSegments(html: string) {
  const segments = new Set<string>()

  for (const bootstrap of extractNextFlightBootstraps(html)) {
    if (!isCanonicalRootBootstrapEnvelope(bootstrap)) return []
    const root = bootstrap.c
    if (
      Array.isArray(root) &&
      root.length === 2 &&
      root[0] === "" &&
      typeof root[1] === "string"
    ) {
      segments.add(root[1])
    }
  }

  return [...segments]
}

export function extractFirstFlightRouteSegments(html: string) {
  const segments: string[] = []

  const collectRouteSegments = (initialRoute: unknown) => {
    const routes = [{ depth: 0, value: initialRoute }]
    let visited = 0

    while (routes.length > 0) {
      const route = routes.pop()
      if (!route || route.depth > 64 || ++visited > 256) return false
      if (
        !Array.isArray(route.value) ||
        route.value.length < 2 ||
        route.value.length > 5
      ) {
        return false
      }

      const rawSegment = route.value[0]
      let segment: string
      if (typeof rawSegment === "string") {
        segment = rawSegment
      } else {
        // The canonical static homepage has no dynamic segment tuple. An empty
        // dynamic cache key could otherwise alias the root path.
        return false
      }

      // This static root's canonical leaf is exactly `__PAGE__`. A suffixed
      // page segment carries search state (or can impersonate another route)
      // and is inconsistent with the separately pinned empty `q` value.
      const isStaticRootPage = segment === "__PAGE__"
      if (!isStaticRootPage) segments.push(segment)

      const parallelRoutes = route.value[1]
      if (
        parallelRoutes === null ||
        typeof parallelRoutes !== "object" ||
        Array.isArray(parallelRoutes)
      ) {
        return false
      }

      const parallelRouteKeys = Object.keys(parallelRoutes)
      if (
        (isStaticRootPage && parallelRouteKeys.length !== 0) ||
        (!isStaticRootPage &&
          (parallelRouteKeys.length !== 1 ||
            parallelRouteKeys[0] !== "children"))
      ) {
        // This application has no homepage parallel-route slots. Requiring the
        // exact children-only spine prevents a second branch from hiding state
        // that this release gate did not review.
        return false
      }

      const refreshState = route.value[2]
      if (
        refreshState !== undefined &&
        refreshState !== "$undefined" &&
        refreshState !== null &&
        (!Array.isArray(refreshState) ||
          refreshState.length !== 2 ||
          !refreshState.every((entry) => typeof entry === "string"))
      ) {
        return false
      }

      const refresh = route.value[3]
      if (
        refresh !== undefined &&
        refresh !== "$undefined" &&
        refresh !== null &&
        refresh !== "refetch" &&
        refresh !== "inside-shared-layout" &&
        refresh !== "metadata-only"
      ) {
        return false
      }

      const prefetchHints = route.value[4]
      if (
        prefetchHints !== undefined &&
        prefetchHints !== "$undefined" &&
        (!Number.isSafeInteger(prefetchHints) || Number(prefetchHints) < 0)
      ) {
        return false
      }

      for (const child of Object.values(parallelRoutes)) {
        routes.push({ depth: route.depth + 1, value: child })
      }
    }

    return true
  }

  for (const bootstrap of extractNextFlightBootstraps(html)) {
    if (!isCanonicalRootBootstrapEnvelope(bootstrap)) return []
    const flight = bootstrap.f
    const firstRoute =
      Array.isArray(flight) &&
      flight.length === 1 &&
      Array.isArray(flight[0]) &&
      flight[0].length === 4 &&
      Array.isArray(flight[0][0])
        ? flight[0][0]
        : null
    if (!firstRoute || !collectRouteSegments(firstRoute)) return []
  }

  return segments
}

function isDescendantOf(tag: HtmlStartTag, ancestor: HtmlStartTag) {
  return tag.ancestors.includes(ancestor)
}

function isExactRawHydrationSentinel(tag: HtmlStartTag) {
  return (
    tag.name === "span" &&
    tag.hasExplicitEndTag &&
    hasOnlyAttributes(
      tag,
      new Set(["aria-hidden", "data-hwl-hydration-sentinel", "hidden"])
    ) &&
    tag.attributes.get("aria-hidden") === "true" &&
    tag.attributes.get("data-hwl-hydration-sentinel") === "" &&
    tag.attributes.get("hidden") === ""
  )
}

export function auditRootHtml(html: string) {
  const checks: HostedRootCheck[] = []
  const {
    allElementTags,
    hasCanonicalDoctype,
    liveTags,
    reviewedReactRevealScripts,
    tags,
    templates,
  } = scanHtmlDocument(html)
  const rootSegments = extractRootFlightSegments(html)
  const firstRouteSegments = extractFirstFlightRouteSegments(html)
  const hasIndexSegment = rootSegments.includes("index")
  const hasCanonicalRootSegments =
    rootSegments.length > 0 && rootSegments.every((segment) => segment === "")
  const hasIndexRouteSegment = firstRouteSegments.includes("index")
  const hasCanonicalRouteSegments =
    firstRouteSegments.length === 1 && firstRouteSegments[0] === ""

  checks.push(
    check(
      hasCanonicalDoctype ? "pass" : "fail",
      "Standards document mode",
      hasCanonicalDoctype
        ? "the raw root response has one canonical HTML doctype"
        : "the raw root response is missing its canonical HTML doctype or enters a quirks mode"
    )
  )

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

  const appShells = tags.filter(
    (tag) => tag.name === "div" && tag.attributes.get("data-app-shell") === ""
  )
  const hasAppShell = appShells.length > 0
  checks.push(
    check(
      hasAppShell ? "pass" : "fail",
      "Homepage app shell",
      hasAppShell
        ? "the raw response contains the HWL application shell"
        : "the raw response does not contain the HWL application shell"
    )
  )

  const hasBreadcrumb = liveTags.some(
    (tag) =>
      tag.name === "nav" &&
      tag.attributes.get("aria-label")?.trim().toLowerCase() === "breadcrumb"
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

  const hasScrollBreathClass = liveTags.some((tag) =>
    (tag.attributes.get("class") ?? "")
      .split(/[\t\n\f\r ]+/)
      .some((token) => token === "scroll-breath")
  )
  const hasNonHomeEffects =
    hasScrollBreathClass ||
    liveTags.some((tag) => tag.attributes.has("data-scrolling"))
  checks.push(
    check(
      hasNonHomeEffects ? "fail" : "pass",
      "Homepage ambient effects state",
      hasNonHomeEffects
        ? "the raw homepage response renders effects reserved for non-home routes"
        : "the raw homepage response omits non-home route effects"
    )
  )

  const rawHeaderVariantMarkers = allElementTags.filter((tag) =>
    tag.attributes.has("data-site-header-variant")
  )
  const pendingRootHeaders = tags.filter(
    (tag) =>
      tag.name === "header" &&
      tag.attributes.get("data-site-header-variant") === "pending"
  )
  const pendingRootHeader = pendingRootHeaders[0]
  const hasPendingRootHeader =
    rawHeaderVariantMarkers.length === 1 &&
    pendingRootHeaders.length === 1 &&
    pendingRootHeader !== undefined &&
    pendingRootHeader.hasExplicitEndTag &&
    appShells.some((appShell) => isDescendantOf(pendingRootHeader, appShell))

  const rawHydrationSentinelMarkers = allElementTags.filter((tag) =>
    tag.attributes.has("data-hwl-hydration-sentinel")
  )
  const exactRawHydrationSentinels = tags.filter(isExactRawHydrationSentinel)
  const hasUniquePristineHydrationSentinel =
    rawHydrationSentinelMarkers.length === 1 &&
    exactRawHydrationSentinels.length === 1 &&
    !allElementTags.some((tag) => tag.attributes.has("data-hwl-hydrated"))
  checks.push(
    check(
      hasPendingRootHeader ? "pass" : "fail",
      "Homepage header state",
      hasPendingRootHeader
        ? "the raw root renders one intentional pending header before hydration"
        : "the raw root must render exactly one pending header inside the application shell"
    )
  )

  // Preserve parser-node identity through the whole witness chain. Matching
  // independent attributes is insufficient: separate lookalike subtrees could
  // otherwise satisfy each predicate without one coherent HWL home document.
  const hasHomepageMarkers = appShells.some((appShell) => {
    const hasHeaderInShell =
      hasPendingRootHeader &&
      pendingRootHeader !== undefined &&
      isDescendantOf(pendingRootHeader, appShell)
    const hasSentinelInShell =
      hasUniquePristineHydrationSentinel &&
      exactRawHydrationSentinels[0] !== undefined &&
      isDescendantOf(exactRawHydrationSentinels[0], appShell)

    const hasDirectHomepage = tags.some(
      (homepage) =>
        homepage.name === "div" &&
        homepage.attributes.get("data-homepage") === "" &&
        isDescendantOf(homepage, appShell) &&
        tags.some(
          (tag) =>
            tag.name === "h1" &&
            tag.attributes.get("id") === "home-hero-heading" &&
            isDescendantOf(tag, homepage)
        ) &&
        tags.some(
          (tag) =>
            tag.name === "a" &&
            tag.attributes.get("data-home-hero-lift-cta") === "" &&
            tag.attributes.get("href") === "/beauty/lift" &&
            isDescendantOf(tag, homepage)
        )
    )
    const suspenseBoundaries = templates.filter(
      (tag) =>
        tag.name === "template" &&
        tag.attributes.get("id") === "B:0" &&
        isDescendantOf(tag, appShell)
    )
    const suspenseSources = tags.filter(
      (tag) =>
        tag.name === "div" &&
        tag.attributes.get("id") === "S:0" &&
        tag.attributes.get("hidden") === ""
    )
    const suspenseBoundary = suspenseBoundaries[0]
    const suspenseSource = suspenseSources[0]
    const revealScript = reviewedReactRevealScripts[0]
    const body = suspenseSource?.ancestors.at(-1)
    const hasReviewedSuspenseHomepage =
      suspenseBoundaries.length === 1 &&
      suspenseSources.length === 1 &&
      allElementTags.filter((tag) => tag.attributes.get("id") === "B:0")
        .length === 1 &&
      allElementTags.filter((tag) => tag.attributes.get("id") === "S:0")
        .length === 1 &&
      suspenseBoundary?.hasReviewedReactBoundary === true &&
      suspenseBoundary.hasExplicitEndTag &&
      suspenseSource?.hasExplicitEndTag === true &&
      reviewedReactRevealScripts.length === 1 &&
      body?.name === "body" &&
      revealScript?.ancestors.at(-1) === body &&
      suspenseBoundary.sourceEnd !== null &&
      suspenseSource.sourceStart !== null &&
      suspenseSource.sourceEnd !== null &&
      revealScript.sourceStart !== null &&
      suspenseBoundary.sourceEnd < suspenseSource.sourceStart &&
      suspenseSource.sourceEnd <= revealScript.sourceStart &&
      tags.some(
        (homepage) =>
          homepage.name === "div" &&
          homepage.attributes.get("data-homepage") === "" &&
          isDescendantOf(homepage, suspenseSource as HtmlStartTag) &&
          tags.some(
            (tag) =>
              tag.name === "h1" &&
              tag.attributes.get("id") === "home-hero-heading" &&
              isDescendantOf(tag, homepage)
          ) &&
          tags.some(
            (tag) =>
              tag.name === "a" &&
              tag.attributes.get("data-home-hero-lift-cta") === "" &&
              tag.attributes.get("href") === "/beauty/lift" &&
              isDescendantOf(tag, homepage)
          )
      )

    return (
      hasHeaderInShell &&
      hasSentinelInShell &&
      ((hasDirectHomepage && reviewedReactRevealScripts.length === 0) ||
        hasReviewedSuspenseHomepage)
    )
  })
  checks.push(
    check(
      hasHomepageMarkers ? "pass" : "fail",
      "Homepage identity markers",
      hasHomepageMarkers
        ? "the raw response contains one pending root header plus the homepage, hero heading, and LIFT CTA markers"
        : "the raw response is missing a required pending-root homepage identity marker"
    )
  )

  const hasHydrationSentinel =
    hasUniquePristineHydrationSentinel &&
    exactRawHydrationSentinels[0] !== undefined &&
    appShells.some((appShell) =>
      isDescendantOf(exactRawHydrationSentinels[0] as HtmlStartTag, appShell)
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
  stdout(BROWSER_POST_HYDRATION_REQUIREMENT)

  return result.ok ? 0 : 1
}

const executedPath = process.argv[1] ? resolve(process.argv[1]) : null
if (executedPath === fileURLToPath(import.meta.url)) {
  process.exitCode = await runHostedRootCli(process.argv.slice(2))
}
