import assert from "node:assert/strict"
import test from "node:test"

import {
  auditRootHtml,
  createHostedRootHeaders,
  extractFirstFlightRouteSegments,
  extractRootFlightSegments,
  HOSTED_ROOT_ORIGIN_ENV,
  MAX_HOSTED_ROOT_HTML_BYTES,
  normalizePublicOrigin,
  parseHostedRootOrigin,
  PROTECTED_PREVIEW_ORIGIN,
  readBoundedHtml,
  ROOT_CANARY_QUERY,
  runHostedRootCli,
  verifyHostedRoot,
} from "./verify-hosted-root.ts"

const ORIGIN = "https://preview.example.com"
const BYPASS_SECRET = "fixture-bypass-secret-never-print"

const CANONICAL_HOME_HTML = String.raw`<!doctype html>
<html lang="en">
  <body>
    <div data-app-shell="">
      <header class="top-0 fixed inset-x-0" data-site-header-variant="home"></header>
      <span data-hwl-hydration-sentinel=""></span>
      <main>
        <div data-homepage="">
          <h1 id="home-hero-heading">Come back to your whole body.</h1>
          <a data-home-hero-lift-cta="" href="/beauty/lift">Meet LIFT</a>
        </div>
      </main>
    </div>
    <script>(self.__next_f=self.__next_f||[]).push([0])</script>
    <script>self.__next_f.push([1,"0:{\"P\":null,\"c\":[\"\",\"\"],\"q\":\"\",\"i\":false,\"f\":[[[\"\",{\"children\":[\"__PAGE__\",{}]}]]]}\n"])</script>
  </body>
</html>`

const INDEX_POISONED_HOME_HTML = String.raw`<!doctype html>
<html lang="en">
  <body>
    <div data-app-shell="">
      <div class="scroll-breath" data-scrolling="false"></div>
      <header class="top-0 sticky"></header>
      <span data-hwl-hydration-sentinel=""></span>
      <nav aria-label="Breadcrumb"><span>Index</span></nav>
      <main>
        <div data-homepage="">
          <h1 id="home-hero-heading">Come back to your whole body.</h1>
          <a data-home-hero-lift-cta="" href="/beauty/lift">Meet LIFT</a>
        </div>
      </main>
    </div>
    <script>(self.__next_f=self.__next_f||[]).push([0])</script>
    <script>self.__next_f.push([1,"0:{\"P\":null,\"c\":[\"\",\"index\"],\"q\":\"\",\"i\":false,\"f\":[[[\"index\",{\"children\":[\"__PAGE__\",{}]}]]]}\n"])</script>
  </body>
</html>`

const CANONICAL_FLIGHT_BOOTSTRAP = JSON.stringify({
  P: null,
  c: ["", ""],
  f: [[["", { children: ["__PAGE__", {}] }]]],
  i: false,
  q: "",
})
const INDEX_POISONED_FLIGHT_BOOTSTRAP = JSON.stringify({
  P: null,
  c: ["", "index"],
  f: [[["index", { children: ["__PAGE__", {}] }]]],
  i: false,
  q: "",
})
const CANONICAL_ROOT_ROW = `0:${CANONICAL_FLIGHT_BOOTSTRAP}`
const INDEX_POISONED_ROOT_ROW = `0:${INDEX_POISONED_FLIGHT_BOOTSTRAP}`

type FlightInstruction = readonly unknown[]

function withFlightInstructions(
  source: string,
  instructions: readonly FlightInstruction[]
) {
  const scripts = instructions
    .map(
      (instruction, index) =>
        `<script>${
          index === 0 && instruction[0] === 0
            ? "(self.__next_f=self.__next_f||[]).push"
            : "self.__next_f.push"
        }(${JSON.stringify(instruction)})</script>`
    )
    .join("")

  return source.replace(
    /<script>\(self\.__next_f=self\.__next_f\|\|\[\]\)\.push\(\[0\]\)<\/script>\s*<script>self\.__next_f\.push\([\s\S]*?<\/script>/,
    scripts
  )
}

function withFlightPayloads(source: string, payloads: readonly string[]) {
  return withFlightInstructions(source, [
    [0],
    ...payloads.map((payload) => [1, payload]),
  ])
}

const COALESCED_CANONICAL_HOME_HTML = withFlightPayloads(CANONICAL_HOME_HTML, [
  `1:I[7121,[],"LoadingBoundaryProvider"]\n2:"$Sreact.fragment"\n${CANONICAL_ROOT_ROW}\n`,
])
const COALESCED_INDEX_POISONED_HOME_HTML = withFlightPayloads(
  INDEX_POISONED_HOME_HTML,
  [
    `1:I[7121,[],"LoadingBoundaryProvider"]\n2:"$Sreact.fragment"\n${INDEX_POISONED_ROOT_ROW}\n`,
  ]
)

const PREFIX_TEXT_RECORD = JSON.stringify({
  "@context": "https://schema.org",
  canonicalDecoy: CANONICAL_ROOT_ROW,
  copy: "A luminous multibyte ritual ✨",
  poisonedDecoy: INDEX_POISONED_ROOT_ROW,
})
const PREFIX_TEXT_RECORD_LENGTH = new TextEncoder()
  .encode(PREFIX_TEXT_RECORD)
  .byteLength.toString(16)
const LENGTH_PREFIXED_STREAM = `1:I[7121,[],"LoadingBoundaryProvider"]\n:HL["/_next/static/css/app.css","style"]\n3:T${PREFIX_TEXT_RECORD_LENGTH},${PREFIX_TEXT_RECORD}${CANONICAL_ROOT_ROW}\n`
const LENGTH_PREFIXED_CANONICAL_HOME_HTML = withFlightPayloads(
  CANONICAL_HOME_HTML,
  [LENGTH_PREFIXED_STREAM]
)
const LENGTH_PREFIXED_DECOY_ONLY_HOME_HTML = withFlightPayloads(
  CANONICAL_HOME_HTML,
  [`3:T${PREFIX_TEXT_RECORD_LENGTH},${PREFIX_TEXT_RECORD}`]
)

type FetchCall = {
  headers: Headers
  redirect: RequestRedirect | undefined
  url: URL
}

function asUrl(input: RequestInfo | URL) {
  return new URL(input instanceof Request ? input.url : String(input))
}

function fixtureFetch({
  calls = [],
  indexLocation = "/",
  indexStatus = 308,
  queryLocation = `/?${ROOT_CANARY_QUERY}`,
  rootContentType = "text/html; charset=utf-8",
  rootHtml = CANONICAL_HOME_HTML,
  rootStatus = 200,
}: {
  calls?: FetchCall[]
  indexLocation?: string
  indexStatus?: number
  queryLocation?: string
  rootContentType?: string
  rootHtml?: string
  rootStatus?: number
} = {}) {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = asUrl(input)
    calls.push({
      headers: new Headers(init?.headers),
      redirect: init?.redirect,
      url,
    })

    if (url.pathname === "/index") {
      const location = url.search ? queryLocation : indexLocation
      return new Response(null, {
        headers: { location },
        status: indexStatus,
      })
    }

    if (url.pathname === "/") {
      return new Response(rootHtml, {
        headers: { "content-type": rootContentType },
        status: rootStatus,
      })
    }

    return new Response("Not found", { status: 404 })
  }) as typeof fetch
}

function failures(checks: ReturnType<typeof auditRootHtml>) {
  return checks.filter(({ status }) => status === "fail")
}

function assertMissingFlightBootstrap(html: string) {
  assert.deepEqual(extractRootFlightSegments(html), [])
  assert.deepEqual(extractFirstFlightRouteSegments(html), [])
  const failedNames = failures(auditRootHtml(html)).map(({ name }) => name)
  assert.ok(failedNames.includes("Root Flight state is canonical"))
  assert.ok(failedNames.includes("Root Flight route tree is canonical"))
}

test("a canonical hosted root passes the complete read-only contract", async () => {
  const calls: FetchCall[] = []
  const result = await verifyHostedRoot({
    environment: { VERCEL_AUTOMATION_BYPASS_SECRET: BYPASS_SECRET },
    fetchImpl: fixtureFetch({ calls }),
    origin: PROTECTED_PREVIEW_ORIGIN,
  })

  assert.equal(result.ok, true)
  assert.equal(result.origin, PROTECTED_PREVIEW_ORIGIN)
  assert.equal(calls.length, 3)
  assert.deepEqual(
    calls.map(({ url }) => `${url.pathname}${url.search}`),
    ["/index", `/index?${ROOT_CANARY_QUERY}`, "/"]
  )
  for (const call of calls) {
    assert.equal(call.redirect, "manual")
    assert.equal(call.headers.get("x-vercel-protection-bypass"), BYPASS_SECRET)
  }
  assert.doesNotMatch(JSON.stringify(result), new RegExp(BYPASS_SECRET))
})

test("the verifier rejects the observed root-as-index Flight and markup defect", async () => {
  const result = await verifyHostedRoot({
    environment: {},
    fetchImpl: fixtureFetch({ rootHtml: INDEX_POISONED_HOME_HTML }),
    origin: ORIGIN,
  })
  const failedNames = result.checks
    .filter(({ status }) => status === "fail")
    .map(({ name }) => name)

  assert.equal(result.ok, false)
  assert.ok(failedNames.includes("Root Flight state excludes index"))
  assert.ok(failedNames.includes("Root Flight state is canonical"))
  assert.ok(failedNames.includes("Root Flight route tree is canonical"))
  assert.ok(failedNames.includes("Homepage breadcrumb state"))
  assert.ok(failedNames.includes("Homepage ambient effects state"))
  assert.ok(failedNames.includes("Homepage header state"))
})

test("raw Flight parsers distinguish the canonical and poisoned states", () => {
  assert.deepEqual(extractRootFlightSegments(CANONICAL_HOME_HTML), [""])
  assert.deepEqual(extractFirstFlightRouteSegments(CANONICAL_HOME_HTML), [""])
  assert.deepEqual(extractRootFlightSegments(INDEX_POISONED_HOME_HTML), [
    "index",
  ])
  assert.deepEqual(extractFirstFlightRouteSegments(INDEX_POISONED_HOME_HTML), [
    "index",
  ])
})

test("nonce-bearing inline Flight instructions remain executable evidence", () => {
  const nonceHtml = CANONICAL_HOME_HTML.replaceAll(
    "<script>",
    '<script nonce="fixture-nonce">'
  )

  assert.deepEqual(extractRootFlightSegments(nonceHtml), [""])
  assert.deepEqual(extractFirstFlightRouteSegments(nonceHtml), [""])
})

test("Flight extraction accepts a newline-delimited root record after earlier channel-1 records", () => {
  assert.deepEqual(extractRootFlightSegments(COALESCED_CANONICAL_HOME_HTML), [
    "",
  ])
  assert.deepEqual(
    extractFirstFlightRouteSegments(COALESCED_CANONICAL_HOME_HTML),
    [""]
  )
  assert.deepEqual(
    extractRootFlightSegments(COALESCED_INDEX_POISONED_HOME_HTML),
    ["index"]
  )
  assert.deepEqual(
    extractFirstFlightRouteSegments(COALESCED_INDEX_POISONED_HOME_HTML),
    ["index"]
  )
  assert.equal(failures(auditRootHtml(COALESCED_CANONICAL_HOME_HTML)).length, 0)
})

test("Flight extraction advances past byte-length-prefixed text before the root record", () => {
  assert.deepEqual(
    extractRootFlightSegments(LENGTH_PREFIXED_CANONICAL_HOME_HTML),
    [""]
  )
  assert.deepEqual(
    extractFirstFlightRouteSegments(LENGTH_PREFIXED_CANONICAL_HOME_HTML),
    [""]
  )
  assert.equal(
    failures(auditRootHtml(LENGTH_PREFIXED_CANONICAL_HOME_HTML)).length,
    0
  )
  assertMissingFlightBootstrap(LENGTH_PREFIXED_DECOY_ONLY_HOME_HTML)
})

test("Flight extraction preserves framing across split channel-1 pushes", () => {
  const headerSplit = LENGTH_PREFIXED_STREAM.indexOf("T") + 1
  const textSplit = LENGTH_PREFIXED_STREAM.indexOf("✨")
  const rootStart = LENGTH_PREFIXED_STREAM.lastIndexOf(CANONICAL_ROOT_ROW)
  const rootSplit = rootStart + 24
  const splitHtml = withFlightPayloads(CANONICAL_HOME_HTML, [
    LENGTH_PREFIXED_STREAM.slice(0, headerSplit),
    LENGTH_PREFIXED_STREAM.slice(headerSplit, textSplit),
    LENGTH_PREFIXED_STREAM.slice(textSplit, rootSplit),
    LENGTH_PREFIXED_STREAM.slice(rootSplit),
  ])

  assert.deepEqual(extractRootFlightSegments(splitHtml), [""])
  assert.deepEqual(extractFirstFlightRouteSegments(splitHtml), [""])
  assert.equal(failures(auditRootHtml(splitHtml)).length, 0)

  const astralText = "😀"
  const astralStream = `3:T4,${astralText}${CANONICAL_ROOT_ROW}\n`
  assert.deepEqual(
    extractRootFlightSegments(
      withFlightPayloads(CANONICAL_HOME_HTML, [astralStream])
    ),
    [""]
  )
  const surrogateBoundary = astralStream.indexOf(astralText) + 1
  assertMissingFlightBootstrap(
    withFlightPayloads(CANONICAL_HOME_HTML, [
      astralStream.slice(0, surrogateBoundary),
      astralStream.slice(surrogateBoundary),
    ])
  )
})

test("ordinary Flight rows require an LF terminator", () => {
  assertMissingFlightBootstrap(
    withFlightPayloads(CANONICAL_HOME_HTML, [CANONICAL_ROOT_ROW])
  )
  const split = Math.floor(CANONICAL_ROOT_ROW.length / 2)
  assertMissingFlightBootstrap(
    withFlightPayloads(CANONICAL_HOME_HTML, [
      CANONICAL_ROOT_ROW.slice(0, split),
      CANONICAL_ROOT_ROW.slice(split),
    ])
  )
})

test("Flight data requires exactly one ordered bootstrap", () => {
  const canonicalPayload = `${CANONICAL_ROOT_ROW}\n`
  const poisonedPayload = `${INDEX_POISONED_ROOT_ROW}\n`

  const invalidInstructions: readonly (readonly FlightInstruction[])[] = [
    [[1, canonicalPayload]],
    [[1, canonicalPayload], [0], [1, canonicalPayload]],
    [
      [2, { form: "state" }],
      [1, canonicalPayload],
    ],
    [
      [0, "extra"],
      [1, canonicalPayload],
    ],
    [[0], [0], [1, canonicalPayload]],
    [[0], [1, canonicalPayload], [0]],
    [[0], [1, poisonedPayload], [0], [1, canonicalPayload]],
  ]

  for (const instructions of invalidInstructions) {
    assertMissingFlightBootstrap(
      withFlightInstructions(CANONICAL_HOME_HTML, instructions)
    )
  }

  assertMissingFlightBootstrap(
    CANONICAL_HOME_HTML.replace(
      "(self.__next_f=self.__next_f||[]).push([0])",
      "self.__next_f.push([0])"
    )
  )
})

test("malformed and mis-sized length-prefixed rows fail closed", () => {
  const body = "prefix"
  const length = new TextEncoder().encode(body).byteLength
  const malformedStreams = [
    `z:${CANONICAL_FLIGHT_BOOTSTRAP}\n${CANONICAL_ROOT_ROW}\n`,
    `3:T${length.toString(16)}${body}${CANONICAL_ROOT_ROW}\n`,
    `3:Tnot-hex,${body}${CANONICAL_ROOT_ROW}\n`,
    `3:Tffffffffffffffff,${body}${CANONICAL_ROOT_ROW}\n`,
    `3:T${(length + 20).toString(16)},${body}`,
    `3:T${(length - 1).toString(16)},${body}${CANONICAL_ROOT_ROW}\n`,
    `3:T${(length + 1).toString(16)},${body}${CANONICAL_ROOT_ROW}\n`,
  ]

  for (const stream of malformedStreams) {
    assertMissingFlightBootstrap(
      withFlightPayloads(CANONICAL_HOME_HTML, [stream])
    )
  }
})

test("record zero must be a complete JSON row with no trailing data", () => {
  for (const suffix of ["garbage", INDEX_POISONED_FLIGHT_BOOTSTRAP]) {
    assertMissingFlightBootstrap(
      withFlightPayloads(CANONICAL_HOME_HTML, [
        `${CANONICAL_ROOT_ROW}${suffix}\n`,
      ])
    )
  }
})

test("Flight extraction requires exactly one record-zero row", () => {
  const incompleteRoot = `0:${JSON.stringify({ P: null })}`
  for (const payload of [
    `${incompleteRoot}\n${CANONICAL_ROOT_ROW}\n`,
    `0:null\n${CANONICAL_ROOT_ROW}\n`,
    `00:null\n${CANONICAL_ROOT_ROW}\n`,
    `000:null\n${CANONICAL_ROOT_ROW}\n`,
    `100000000:null\n${CANONICAL_ROOT_ROW}\n`,
    `:${CANONICAL_FLIGHT_BOOTSTRAP}\n${CANONICAL_ROOT_ROW}\n`,
    `0:T4,null${CANONICAL_ROOT_ROW}\n`,
    `${CANONICAL_ROOT_ROW}\n${INDEX_POISONED_ROOT_ROW}\n`,
    `${CANONICAL_ROOT_ROW}\n${CANONICAL_ROOT_ROW}\n`,
  ]) {
    assertMissingFlightBootstrap(
      withFlightPayloads(CANONICAL_HOME_HTML, [payload])
    )
  }

  for (const aliasedRootId of ["00", "000", "100000000"]) {
    assertMissingFlightBootstrap(
      withFlightPayloads(CANONICAL_HOME_HTML, [
        `${aliasedRootId}:${CANONICAL_FLIGHT_BOOTSTRAP}\n`,
      ])
    )
  }
})

test("nonzero record IDs and escaped record text cannot impersonate record zero", () => {
  const ordinaryRow = `1:${JSON.stringify(`copy\\n${CANONICAL_ROOT_ROW}`)}\n`
  for (const payload of [
    `10:${CANONICAL_FLIGHT_BOOTSTRAP}\n`,
    `a0:${CANONICAL_FLIGHT_BOOTSTRAP}\n`,
    ordinaryRow,
  ]) {
    assertMissingFlightBootstrap(
      withFlightPayloads(CANONICAL_HOME_HTML, [payload])
    )
  }
})

test("Flight extraction accepts only the executed channel-1 record-0 bootstrap", () => {
  const arbitraryJson = CANONICAL_HOME_HTML.replace(
    /<script>self\.__next_f\.push\([\s\S]*?<\/script>/,
    '<script>window.unrelated = {"c":["",""],"f":[[["",{"children":[]}]]]};</script>'
  )
  const commentedBootstrap = CANONICAL_HOME_HTML.replace(
    "<script>self.__next_f.push",
    "<!-- <script>self.__next_f.push"
  ).replace("</script>", "</script> -->")
  const templatedBootstrap = CANONICAL_HOME_HTML.replace(
    "<script>self.__next_f.push",
    "<template><script>self.__next_f.push"
  ).replace("</script>", "</script></template>")
  const nestedTemplateBootstrap = CANONICAL_HOME_HTML.replace(
    /<script>\(self\.__next_f=self\.__next_f\|\|\[\]\)\.push\(\[0\]\)<\/script>\s*<script>self\.__next_f\.push\([\s\S]*?<\/script>/,
    (flightScripts) =>
      `<template><template></template>${flightScripts}</template>`
  )
  const stringLookalike = CANONICAL_HOME_HTML.replace(
    "self.__next_f.push",
    'const ignored = "self.__next_f.push"; ignored'
  )
  const wrongChannel = CANONICAL_HOME_HTML.replace(
    "self.__next_f.push([1,",
    "self.__next_f.push([2,"
  )
  const wrongRecord = CANONICAL_HOME_HTML.replace(
    'self.__next_f.push([1,"0:',
    'self.__next_f.push([1,"1:'
  )
  const inertType = CANONICAL_HOME_HTML.replace(
    "<script>(self.__next_f=self.__next_f||[]).push([0])</script>",
    '<script type="application/json">(self.__next_f=self.__next_f||[]).push([0])</script>'
  )
  const externalSource = CANONICAL_HOME_HTML.replace(
    "<script>(self.__next_f=self.__next_f||[]).push([0])</script>",
    '<script src="/ignored.js">(self.__next_f=self.__next_f||[]).push([0])</script>'
  )
  const slashAdjacentInertType = CANONICAL_HOME_HTML.replace(
    "<script>(self.__next_f=self.__next_f||[]).push([0])</script>",
    '<script/type="application/json">(self.__next_f=self.__next_f||[]).push([0])</script>'
  )
  const slashAdjacentSource = CANONICAL_HOME_HTML.replace(
    "<script>(self.__next_f=self.__next_f||[]).push([0])</script>",
    '<script/src="/ignored.js">(self.__next_f=self.__next_f||[]).push([0])</script>'
  )
  const adjacentNonceAndInertType = CANONICAL_HOME_HTML.replace(
    "<script>(self.__next_f=self.__next_f||[]).push([0])</script>",
    '<script nonce="fixture"type="application/json">(self.__next_f=self.__next_f||[]).push([0])</script>'
  )
  const noModule = CANONICAL_HOME_HTML.replace(
    "<script>(self.__next_f=self.__next_f||[]).push([0])</script>",
    "<script nomodule>(self.__next_f=self.__next_f||[]).push([0])</script>"
  )
  const legacyLanguage = CANONICAL_HOME_HTML.replace(
    "<script>(self.__next_f=self.__next_f||[]).push([0])</script>",
    '<script language="vbscript">(self.__next_f=self.__next_f||[]).push([0])</script>'
  )
  const deadBranch = CANONICAL_HOME_HTML.replace(
    "(self.__next_f=self.__next_f||[]).push([0])",
    "if (false) { (self.__next_f=self.__next_f||[]).push([0]) }"
  )
  const additionalWrappedCall = CANONICAL_HOME_HTML.replace(
    "</body>",
    "<script>if (true) { self.__next_f.push([0]) }</script></body>"
  )
  const additionalPrefixedCall = CANONICAL_HOME_HTML.replace(
    "</body>",
    "<script>window.self.__next_f.push([0])</script></body>"
  )
  const additionalMalformedCall = CANONICAL_HOME_HTML.replace(
    "</body>",
    "<script>self.__next_f.push(notJson)</script></body>"
  )
  const additionalIdScriptCall = CANONICAL_HOME_HTML.replace(
    "</body>",
    '<script id="flight">self.__next_f.push([0])</script></body>'
  )
  const additionalClassicTypeCall = CANONICAL_HOME_HTML.replace(
    "</body>",
    '<script type="text/javascript">self.__next_f.push([0])</script></body>'
  )
  const additionalBracketCall = CANONICAL_HOME_HTML.replace(
    "</body>",
    '<script>self["__next_f"].push([0])</script></body>'
  )
  const additionalTemplateCall = CANONICAL_HOME_HTML.replace(
    "</body>",
    "<script>`${self.__next_f.push([0])}`</script></body>"
  )
  const adjacentCalls = CANONICAL_HOME_HTML.replace(
    "</script>\n    <script>self.__next_f.push",
    "self.__next_f.push"
  )
  const spaceSeparatedCalls = CANONICAL_HOME_HTML.replace(
    "</script>\n    <script>self.__next_f.push",
    " self.__next_f.push"
  )

  for (const invalidBootstrap of [
    arbitraryJson,
    commentedBootstrap,
    templatedBootstrap,
    nestedTemplateBootstrap,
    stringLookalike,
    wrongChannel,
    wrongRecord,
    inertType,
    externalSource,
    slashAdjacentInertType,
    slashAdjacentSource,
    adjacentNonceAndInertType,
    noModule,
    legacyLanguage,
    deadBranch,
    additionalWrappedCall,
    additionalPrefixedCall,
    additionalMalformedCall,
    additionalIdScriptCall,
    additionalClassicTypeCall,
    additionalBracketCall,
    additionalTemplateCall,
    adjacentCalls,
    spaceSeparatedCalls,
  ]) {
    assert.deepEqual(extractRootFlightSegments(invalidBootstrap), [])
    assert.deepEqual(extractFirstFlightRouteSegments(invalidBootstrap), [])
    const failedNames = failures(auditRootHtml(invalidBootstrap)).map(
      ({ name }) => name
    )
    assert.ok(failedNames.includes("Root Flight state is canonical"))
    assert.ok(failedNames.includes("Root Flight route tree is canonical"))
  }

  for (const validSeparator of [";", "\n"]) {
    const combinedCalls = CANONICAL_HOME_HTML.replace(
      "</script>\n    <script>self.__next_f.push",
      `${validSeparator}self.__next_f.push`
    )
    assert.deepEqual(extractRootFlightSegments(combinedCalls), [""])
    assert.deepEqual(extractFirstFlightRouteSegments(combinedCalls), [""])
  }
})

test("unexpected non-index Flight segments also fail exact canonical checks", () => {
  const unexpectedSegmentHtml = CANONICAL_HOME_HTML.replace(
    String.raw`\"c\":[\"\",\"\"]`,
    String.raw`\"c\":[\"\",\"other\"]`
  ).replace(String.raw`\"f\":[[[\"\"`, String.raw`\"f\":[[[\"other\"`)
  const failedNames = failures(auditRootHtml(unexpectedSegmentHtml)).map(
    ({ name }) => name
  )

  assert.ok(failedNames.includes("Root Flight state is canonical"))
  assert.ok(failedNames.includes("Root Flight route tree is canonical"))
})

test("homepage identity markers are required without relying on copy", () => {
  const missingLiftMarker = CANONICAL_HOME_HTML.replace(
    ' data-home-hero-lift-cta=""',
    ""
  )

  assert.ok(
    failures(auditRootHtml(missingLiftMarker)).some(
      ({ name }) => name === "Homepage identity markers"
    )
  )
})

test("raw hydration sentinel markup is required", () => {
  const missingSentinel = CANONICAL_HOME_HTML.replace(
    '      <span data-hwl-hydration-sentinel=""></span>\n',
    ""
  )

  assert.ok(
    failures(auditRootHtml(missingSentinel)).some(
      ({ name }) => name === "Hydration sentinel marker"
    )
  )
})

test("lookalike attributes and script or style strings are not markup evidence", () => {
  const lookalikeHtml = CANONICAL_HOME_HTML.replace(
    'data-app-shell=""',
    'data-app-shell-copy=""'
  )
    .replace(
      'data-site-header-variant="home"',
      'data-site-header-variant-copy="home"'
    )
    .replace(
      'data-hwl-hydration-sentinel=""',
      'data-hwl-hydration-sentinel-copy=""'
    )
    .replace('data-homepage=""', 'data-homepage-copy=""')
    .replace('id="home-hero-heading"', 'id="home-hero-heading-copy"')
    .replace('data-home-hero-lift-cta=""', 'data-home-hero-lift-cta-copy=""')
    .replace(
      "<body>",
      `<body>
    <!-- <div data-app-shell="" data-homepage="" data-hwl-hydration-sentinel="" data-site-header-variant="home" id="home-hero-heading" data-home-hero-lift-cta=""></div> -->
    <div title='<span data-app-shell="" data-homepage="" data-hwl-hydration-sentinel="" data-site-header-variant="home" id="home-hero-heading" data-home-hero-lift-cta=""></span>'></div>
    <template><div data-app-shell="" data-homepage="" data-hwl-hydration-sentinel="" data-site-header-variant="home" id="home-hero-heading" data-home-hero-lift-cta=""></div></template>
    <textarea><div data-app-shell="" data-homepage="" data-hwl-hydration-sentinel="" data-site-header-variant="home" id="home-hero-heading" data-home-hero-lift-cta=""></div></textarea>
    <script>const markerCopy = '<div data-app-shell="" data-homepage="" data-hwl-hydration-sentinel="" data-site-header-variant="home" id="home-hero-heading" data-home-hero-lift-cta=""></div>';</script>
    <style>.marker-copy { content: '<div data-app-shell="" data-homepage=""></div>'; }</style>`
    )
  const failedNames = failures(auditRootHtml(lookalikeHtml)).map(
    ({ name }) => name
  )

  assert.ok(failedNames.includes("Homepage app shell"))
  assert.ok(failedNames.includes("Homepage header state"))
  assert.ok(failedNames.includes("Homepage identity markers"))
  assert.ok(failedNames.includes("Hydration sentinel marker"))
})

test("script and style strings cannot create false breadcrumb or effects failures", () => {
  const inertLookalikes = CANONICAL_HOME_HTML.replace(
    "<body>",
    `<body>
    <script>const inert = '<nav aria-label="Breadcrumb" class="scroll-breath" data-scrolling="false"></nav>';</script>
    <style>.inert { content: '<nav aria-label="Breadcrumb"></nav>'; }</style>`
  )
  const failedNames = failures(auditRootHtml(inertLookalikes)).map(
    ({ name }) => name
  )

  assert.ok(!failedNames.includes("Homepage breadcrumb state"))
  assert.ok(!failedNames.includes("Homepage ambient effects state"))
})

test("/index must redirect instead of resolving the root page", async () => {
  const calls: FetchCall[] = []
  const result = await verifyHostedRoot({
    environment: {},
    fetchImpl: fixtureFetch({ calls, indexStatus: 200 }),
    origin: ORIGIN,
  })

  assert.equal(result.ok, false)
  assert.equal(calls.length, 1)
  assert.ok(
    result.checks.some(
      ({ name, status }) =>
        name === "/index canonical redirect" && status === "fail"
    )
  )
})

test("/index requires the deterministic permanent 308 status", async () => {
  const calls: FetchCall[] = []
  const result = await verifyHostedRoot({
    environment: {},
    fetchImpl: fixtureFetch({ calls, indexStatus: 307 }),
    origin: ORIGIN,
  })

  assert.equal(result.ok, false)
  assert.equal(calls.length, 1)
  assert.match(result.checks[0]?.detail ?? "", /instead of 308/)
})

test("the /index redirect must preserve its query exactly", async () => {
  const calls: FetchCall[] = []
  const result = await verifyHostedRoot({
    environment: {},
    fetchImpl: fixtureFetch({ calls, queryLocation: "/" }),
    origin: ORIGIN,
  })

  assert.equal(result.ok, false)
  assert.equal(calls.length, 2)
  assert.ok(
    result.checks.some(
      ({ name, status }) =>
        name === "/index query-preserving redirect" && status === "fail"
    )
  )
})

test("the /index redirect cannot cross origins", async () => {
  const result = await verifyHostedRoot({
    environment: {},
    fetchImpl: fixtureFetch({
      indexLocation: "https://other.example.com/",
    }),
    origin: ORIGIN,
  })

  assert.equal(result.ok, false)
  assert.ok(
    result.checks.some(
      ({ detail, name, status }) =>
        name === "/index canonical redirect" &&
        status === "fail" &&
        detail.includes("must equal / exactly")
    )
  )
})

test("the /index Location value must be the exact raw relative target", async (t) => {
  for (const [name, indexLocation] of [
    ["same-origin absolute URL", `${ORIGIN}/`],
    ["fragment suffix", "/#home"],
    ["empty query suffix", "/?"],
    ["dot-segment spelling", "/./"],
  ] as const) {
    await t.test(name, async () => {
      const calls: FetchCall[] = []
      const result = await verifyHostedRoot({
        environment: {},
        fetchImpl: fixtureFetch({ calls, indexLocation }),
        origin: ORIGIN,
      })

      assert.equal(result.ok, false)
      assert.equal(calls.length, 1)
      assert.equal(result.checks[0]?.status, "fail")
    })
  }
})

test("the query canary Location value must also be exact raw text", async () => {
  const calls: FetchCall[] = []
  const result = await verifyHostedRoot({
    environment: {},
    fetchImpl: fixtureFetch({
      calls,
      queryLocation: `${ORIGIN}/?${ROOT_CANARY_QUERY}`,
    }),
    origin: ORIGIN,
  })

  assert.equal(result.ok, false)
  assert.equal(calls.length, 2)
  assert.equal(result.checks.at(-1)?.status, "fail")
})

test("the canonical root must return 200 HTML", async (t) => {
  await t.test("non-200 response", async () => {
    const result = await verifyHostedRoot({
      environment: {},
      fetchImpl: fixtureFetch({ rootStatus: 503 }),
      origin: ORIGIN,
    })
    assert.equal(result.ok, false)
    assert.ok(
      result.checks.some(
        ({ name, status }) => name === "/ response" && status === "fail"
      )
    )
  })

  await t.test("non-HTML response", async () => {
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = asUrl(input)
      if (url.pathname === "/index") {
        return new Response(null, {
          headers: {
            location: url.search ? `/?${ROOT_CANARY_QUERY}` : "/",
          },
          status: 308,
        })
      }
      return new Response(CANONICAL_HOME_HTML, {
        headers: { "content-type": "application/json" },
        status: 200,
      })
    }) as typeof fetch

    const result = await verifyHostedRoot({
      environment: {},
      fetchImpl,
      origin: ORIGIN,
    })
    assert.equal(result.ok, false)
    assert.ok(
      result.checks.some(
        ({ name, status }) => name === "/ content type" && status === "fail"
      )
    )
  })

  await t.test("lookalike HTML MIME essence", async () => {
    for (const rootContentType of [
      "text/html+json",
      "application/text/html",
      "text/htmlish",
    ]) {
      const result = await verifyHostedRoot({
        environment: {},
        fetchImpl: fixtureFetch({ rootContentType }),
        origin: ORIGIN,
      })

      assert.equal(result.ok, false)
      assert.ok(
        result.checks.some(
          ({ name, status }) => name === "/ content type" && status === "fail"
        )
      )
    }
  })

  await t.test(
    "case and parameters do not change the text/html essence",
    async () => {
      const result = await verifyHostedRoot({
        environment: {},
        fetchImpl: fixtureFetch({
          rootContentType: " Text/HTML ; charset=utf-8",
        }),
        origin: ORIGIN,
      })

      assert.equal(result.ok, true)
    }
  )
})

test("origin input supports CLI or environment and rejects non-public shapes", () => {
  assert.equal(
    parseHostedRootOrigin([], { [HOSTED_ROOT_ORIGIN_ENV]: ORIGIN }),
    ORIGIN
  )
  assert.equal(
    parseHostedRootOrigin(["--origin", ORIGIN], {
      [HOSTED_ROOT_ORIGIN_ENV]: "https://ignored.example.com",
    }),
    ORIGIN
  )
  assert.equal(parseHostedRootOrigin([`--origin=${ORIGIN}`], {}), ORIGIN)
  assert.equal(normalizePublicOrigin(`${ORIGIN}/`), ORIGIN)

  for (const invalid of [
    "http://example.com",
    "https://localhost:3000",
    "https://user@example.com",
    "https://example.com/path",
    "https://example.com/?query=1",
    "https://10.0.0.1",
    "https://169.254.169.254",
    "https://[fe80::1]",
  ]) {
    assert.throws(() => normalizePublicOrigin(invalid))
  }
})

test("an environment bypass fails closed for every non-HWL origin", () => {
  assert.throws(
    () =>
      createHostedRootHeaders({
        environment: {
          VERCEL_AUTOMATION_BYPASS_SECRET: BYPASS_SECRET,
        },
        origin: ORIGIN,
      }),
    (error: unknown) => {
      assert.ok(error instanceof Error)
      assert.doesNotMatch(error.message, new RegExp(BYPASS_SECRET))
      assert.match(error.message, /canonical HWL Preview origin/)
      return true
    }
  )
})

test("HTML reading fails closed on declared and streamed overflow", async (t) => {
  await t.test("declared Content-Length", async () => {
    const response = new Response("small body", {
      headers: {
        "content-length": String(MAX_HOSTED_ROOT_HTML_BYTES + 1),
      },
    })

    await assert.rejects(() => readBoundedHtml(response), /byte limit/)
  })

  await t.test("streamed bytes", async () => {
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2, 3]))
        controller.enqueue(new Uint8Array([4, 5]))
        controller.close()
      },
    })
    const response = new Response(body)

    await assert.rejects(() => readBoundedHtml(response, 4), /byte limit/)
  })
})

test(
  "the request deadline remains active through a stalled HTML body",
  { timeout: 1_000 },
  async () => {
    const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = asUrl(input)
      if (url.pathname === "/index") {
        return new Response(null, {
          headers: {
            location: url.search ? `/?${ROOT_CANARY_QUERY}` : "/",
          },
          status: 308,
        })
      }

      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          const signal = init?.signal
          const abort = () => controller.error(new Error("aborted"))
          if (signal?.aborted) abort()
          else signal?.addEventListener("abort", abort, { once: true })
        },
      })
      return new Response(body, {
        headers: { "content-type": "text/html; charset=utf-8" },
        status: 200,
      })
    }) as typeof fetch

    const result = await verifyHostedRoot({
      environment: {},
      fetchImpl,
      origin: ORIGIN,
      timeoutMs: 20,
    })

    assert.equal(result.ok, false)
    assert.ok(
      result.checks.some(
        ({ name, status }) => name === "/ response body" && status === "fail"
      )
    )
  }
)

test("CLI sends the official bypass header without printing its secret", async () => {
  const stdout: string[] = []
  const stderr: string[] = []
  const calls: FetchCall[] = []
  const exitCode = await runHostedRootCli(
    ["--origin", PROTECTED_PREVIEW_ORIGIN],
    {
      environment: { VERCEL_AUTOMATION_BYPASS_SECRET: BYPASS_SECRET },
      fetchImpl: fixtureFetch({ calls }),
      stderr: (message) => stderr.push(message),
      stdout: (message) => stdout.push(message),
    }
  )
  const output = [...stdout, ...stderr].join("\n")

  assert.equal(exitCode, 0)
  assert.ok(
    calls.every(
      ({ headers }) =>
        headers.get("x-vercel-protection-bypass") === BYPASS_SECRET
    )
  )
  assert.doesNotMatch(output, new RegExp(BYPASS_SECRET))
  assert.match(output, /Hosted root verification passed/)
})
