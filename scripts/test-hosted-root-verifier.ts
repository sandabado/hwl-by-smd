import assert from "node:assert/strict"
import test from "node:test"

import {
  auditRootHtml,
  BROWSER_POST_HYDRATION_REQUIREMENT,
  createHostedRootHeaders,
  extractFirstFlightRouteSegments,
  extractRootFlightSegments,
  HOSTED_ROOT_ORIGIN_ENV,
  MAX_HOSTED_ROOT_HTML_BYTES,
  normalizePublicOrigin,
  parseHostedRootOrigin,
  PROTECTED_PREVIEW_ORIGIN,
  readBoundedHtml,
  REVIEWED_NEXT_EXTERNAL_SCRIPT_SOURCES,
  ROOT_CANARY_QUERY,
  runHostedRootCli,
  verifyHostedRoot,
} from "./verify-hosted-root.ts"

const ORIGIN = "https://preview.example.com"
const BYPASS_SECRET = "fixture-bypass-secret-never-print"

const REVIEWED_NEXT_TIMING_SCRIPT =
  "requestAnimationFrame(function(){$RT=performance.now()});"
const REVIEWED_REACT_REVEAL_SCRIPT = String.raw`$RB=[];$RV=function(a){$RT=performance.now();for(var b=0;b<a.length;b+=2){var c=a[b],e=a[b+1];null!==e.parentNode&&e.parentNode.removeChild(e);var f=c.parentNode;if(f){var g=c.previousSibling,h=0;do{if(c&&8===c.nodeType){var d=c.data;if("/$"===d||"/&"===d)if(0===h)break;else h--;else"$"!==d&&"$?"!==d&&"$~"!==d&&"$!"!==d&&"&"!==d||h++}d=c.nextSibling;f.removeChild(c);c=d}while(c);for(;e.firstChild;)f.insertBefore(e.firstChild,c);g.data="$";g._reactRetry&&requestAnimationFrame(g._reactRetry)}}a.length=0};
$RC=function(a,b){if(b=document.getElementById(b))(a=document.getElementById(a))?(a.previousSibling.data="$~",$RB.push(a,b),2===$RB.length&&("number"!==typeof $RT?requestAnimationFrame($RV.bind(null,$RB)):(a=performance.now(),setTimeout($RV.bind(null,$RB),2300>a&&2E3<a?2300-a:$RT+300-a)))):b.parentNode.removeChild(b)};$RC("B:0","S:0")`

const REVIEWED_NEXT_EXTERNAL_SCRIPT_MARKUP =
  REVIEWED_NEXT_EXTERNAL_SCRIPT_SOURCES.map((source) => {
    if (source.includes("/polyfills-")) {
      return `<script src="${source}" nomodule=""></script>`
    }
    if (source.includes("/webpack-")) {
      return `<script src="${source}" id="_R_" async=""></script>`
    }
    return `<script src="${source}" async=""></script>`
  }).join("\n    ")

const CANONICAL_HOME_HTML = String.raw`<!doctype html>
<html lang="en">
  <body>
    <div data-app-shell="">
      <header class="top-0 sticky" data-site-header-variant="pending"></header>
      <span aria-hidden="true" data-hwl-hydration-sentinel="" hidden=""></span>
      <main>
        <div data-homepage="">
          <h1 id="home-hero-heading">Come back to your whole body.</h1>
          <a data-home-hero-lift-cta="" href="/beauty/lift">Meet LIFT</a>
        </div>
      </main>
    </div>
    ${REVIEWED_NEXT_EXTERNAL_SCRIPT_MARKUP}
    <script>(self.__next_f=self.__next_f||[]).push([0])</script>
    <script>self.__next_f.push([1,"0:{\"P\":null,\"c\":[\"\",\"\"],\"q\":\"\",\"i\":false,\"f\":[[[\"\",{\"children\":[\"__PAGE__\",{}]}],null,null,false]]}\n"])</script>
  </body>
</html>`

const CANONICAL_HOME_WITH_REVIEWED_RUNTIME_HTML = CANONICAL_HOME_HTML.replace(
  "    <script>(self.__next_f=self.__next_f||[]).push([0])</script>",
  `    <script>${REVIEWED_NEXT_TIMING_SCRIPT}</script>
    <script>(self.__next_f=self.__next_f||[]).push([0])</script>`
)

const INDEX_POISONED_HOME_HTML = CANONICAL_HOME_HTML.replace(
  String.raw`\"c\":[\"\",\"\"]`,
  String.raw`\"c\":[\"\",\"index\"]`
).replace(String.raw`\"f\":[[[\"\"`, String.raw`\"f\":[[[\"index\"`)

const NESTED_INDEX_POISONED_HOME_HTML = CANONICAL_HOME_HTML.replace(
  String.raw`\"children\":[\"__PAGE__\",{}]`,
  String.raw`\"children\":[\"index\",{}]`
)

const CANONICAL_FLIGHT_BOOTSTRAP = JSON.stringify({
  P: null,
  c: ["", ""],
  f: [[["", { children: ["__PAGE__", {}] }], null, null, false]],
  i: false,
  q: "",
})
const INDEX_POISONED_FLIGHT_BOOTSTRAP = JSON.stringify({
  P: null,
  c: ["", "index"],
  f: [[["index", { children: ["__PAGE__", {}] }], null, null, false]],
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

function withMarkupBeforeBodyEnd(source: string, markup: string) {
  return source.replace("</body>", `${markup}</body>`)
}

test("a canonical pending hosted root passes the raw read-only contract", async () => {
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

test("raw root evidence accepts only one pending header in the application shell", () => {
  assert.deepEqual(failures(auditRootHtml(CANONICAL_HOME_HTML)), [])

  for (const variant of ["home", "interior", "unknown"]) {
    const wrongVariant = CANONICAL_HOME_HTML.replace(
      'data-site-header-variant="pending"',
      `data-site-header-variant="${variant}"`
    )
    const failedNames = failures(auditRootHtml(wrongVariant)).map(
      ({ name }) => name
    )

    assert.ok(failedNames.includes("Homepage header state"), variant)
    assert.ok(failedNames.includes("Homepage identity markers"), variant)
  }

  const duplicatePendingHeader = CANONICAL_HOME_HTML.replace(
    '<header class="top-0 sticky" data-site-header-variant="pending"></header>',
    '<header class="top-0 sticky" data-site-header-variant="pending"></header><header data-site-header-variant="pending"></header>'
  )
  const duplicateFailedNames = failures(
    auditRootHtml(duplicatePendingHeader)
  ).map(({ name }) => name)
  assert.ok(duplicateFailedNames.includes("Homepage header state"))
  assert.ok(duplicateFailedNames.includes("Homepage identity markers"))

  const unclosedPendingHeader = CANONICAL_HOME_HTML.replace("</header>", "")
  const unclosedFailedNames = failures(
    auditRootHtml(unclosedPendingHeader)
  ).map(({ name }) => name)
  assert.ok(unclosedFailedNames.includes("Homepage header state"))
  assert.ok(unclosedFailedNames.includes("Homepage identity markers"))
})

test("raw pending state does not replace the separate browser hydration gate", () => {
  assert.match(
    BROWSER_POST_HYDRATION_REQUIREMENT,
    /data-site-header-variant="home"/
  )
  assert.match(BROWSER_POST_HYDRATION_REQUIREMENT, /data-hwl-hydrated="true"/)
  assert.match(
    BROWSER_POST_HYDRATION_REQUIREMENT,
    /zero React hydration errors/
  )
  assert.match(BROWSER_POST_HYDRATION_REQUIREMENT, /Separate browser/)
})

test("the verifier rejects root-as-index Flight through a neutral pending shell", async () => {
  const result = await verifyHostedRoot({
    environment: {},
    fetchImpl: fixtureFetch({ rootHtml: INDEX_POISONED_HOME_HTML }),
    origin: ORIGIN,
  })
  const failedNames = result.checks
    .filter(({ status }) => status === "fail")
    .map(({ name }) => name)

  assert.equal(result.ok, false)
  assert.deepEqual(failedNames, [
    "Root Flight state excludes index",
    "Root Flight state is canonical",
    "Root Flight route tree is canonical",
  ])
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
  assert.deepEqual(
    extractFirstFlightRouteSegments(NESTED_INDEX_POISONED_HOME_HTML),
    []
  )
  assert.ok(
    failures(auditRootHtml(NESTED_INDEX_POISONED_HOME_HTML)).some(
      ({ name }) => name === "Root Flight route tree is canonical"
    )
  )
})

test("the pinned Next inline runtime bootstrap remains reviewed evidence", () => {
  assert.deepEqual(
    extractRootFlightSegments(CANONICAL_HOME_WITH_REVIEWED_RUNTIME_HTML),
    [""]
  )
  assert.deepEqual(
    extractFirstFlightRouteSegments(CANONICAL_HOME_WITH_REVIEWED_RUNTIME_HTML),
    [""]
  )
  assert.equal(
    failures(auditRootHtml(CANONICAL_HOME_WITH_REVIEWED_RUNTIME_HTML)).length,
    0
  )

  const duplicatedTimingRuntime =
    CANONICAL_HOME_WITH_REVIEWED_RUNTIME_HTML.replace(
      `<script>${REVIEWED_NEXT_TIMING_SCRIPT}</script>`,
      `<script>${REVIEWED_NEXT_TIMING_SCRIPT}</script><script>${REVIEWED_NEXT_TIMING_SCRIPT}</script>`
    )
  assert.deepEqual(extractRootFlightSegments(duplicatedTimingRuntime), [])
})

test("HTML parsing follows browser whitespace and comment boundaries", () => {
  const nonBreakingSpace = "\u00a0"
  const malformedFlightTags = CANONICAL_HOME_HTML.replaceAll(
    "<script>",
    `<script${nonBreakingSpace}nonce=x>`
  )
  const executableTypeDecoy = withMarkupBeforeBodyEnd(
    CANONICAL_HOME_HTML,
    `<script id="x"${nonBreakingSpace}type="application/json">self.unreviewedInlineProgramRan=true</script>`
  )
  const executableSourceDecoy = withMarkupBeforeBodyEnd(
    CANONICAL_HOME_HTML,
    `<script type="text/javascript"${nonBreakingSpace}src>self.unreviewedInlineProgramRan=true</script>`
  )
  const abruptlyClosedComment = CANONICAL_HOME_HTML.replace(
    "<body>",
    "<body><!--comment--!><script>self.unreviewedInlineProgramRan=true</script>-->"
  )

  for (const html of [
    malformedFlightTags,
    executableTypeDecoy,
    executableSourceDecoy,
    abruptlyClosedComment,
  ]) {
    assertMissingFlightBootstrap(html)
  }
})

test("the root requires one canonical standards-mode HTML doctype", () => {
  const missingDoctype = CANONICAL_HOME_HTML.replace("<!doctype html>\n", "")
  const legacyDoctype = CANONICAL_HOME_HTML.replace(
    "<!doctype html>",
    '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">'
  )

  for (const html of [missingDoctype, legacyDoctype]) {
    assert.ok(
      failures(auditRootHtml(html)).some(
        ({ name }) => name === "Standards document mode"
      )
    )
  }
})

test("foreign-content and declarative templates cannot hide executable scripts", () => {
  for (const markup of [
    "<svg><template><script>self.unreviewedInlineProgramRan=true</script></template></svg>",
    "<svg><title><script>self.unreviewedInlineProgramRan=true</script></title></svg>",
    "<svg><style><script>self.unreviewedInlineProgramRan=true</script></style></svg>",
    '<template shadowrootmode="open"><script>self.unreviewedInlineProgramRan=true</script></template>',
  ]) {
    assertMissingFlightBootstrap(
      withMarkupBeforeBodyEnd(CANONICAL_HOME_HTML, markup)
    )
  }
})

test("active embedding and inline event handlers fail the root contract", () => {
  for (const markup of [
    '<iframe srcdoc="&lt;script>parent.unreviewedInlineProgramRan=true&lt;/script>"></iframe>',
    '<svg onload="self.unreviewedInlineProgramRan=true"></svg>',
    '<base href="https://example.invalid/">',
    '<meta http-equiv="refresh" content="0;url=https://example.invalid/">',
    '<object data="https://example.invalid/"></object>',
    '<embed src="https://example.invalid/">',
  ]) {
    assertMissingFlightBootstrap(
      withMarkupBeforeBodyEnd(CANONICAL_HOME_HTML, markup)
    )
  }
})

test("DOM named properties cannot clobber the Next Flight queue", () => {
  for (const markup of [
    '<form id="__next_f"></form>',
    '<img id="__next_f" src="data:,">',
    '<a name="__next_f"></a>',
  ]) {
    assertMissingFlightBootstrap(
      CANONICAL_HOME_HTML.replace("<body>", `<body>${markup}`)
    )
  }
})

test("only the reviewed same-origin Next chunk script shapes are accepted", () => {
  const alternateEnvironmentBuild =
    REVIEWED_NEXT_EXTERNAL_SCRIPT_SOURCES.reduce(
      (html, source, index) =>
        html.replace(
          source,
          source.replace(
            /[0-9a-f]{16}\.js$/,
            `${index.toString(16).padStart(16, "0")}.js`
          )
        ),
      CANONICAL_HOME_HTML
    )

  for (const html of [CANONICAL_HOME_HTML, alternateEnvironmentBuild]) {
    assert.deepEqual(extractRootFlightSegments(html), [""])
    assert.deepEqual(extractFirstFlightRouteSegments(html), [""])
    assert.equal(failures(auditRootHtml(html)).length, 0)
  }
})

test("unreviewed external script sources, bodies, and attributes fail closed", () => {
  for (const markup of [
    '<script src="data:text/javascript,self.unreviewedInlineProgramRan=true" async=""></script>',
    '<script src="https://example.invalid/poison.js" async=""></script>',
    '<script src="//example.invalid/poison.js" async=""></script>',
    '<script src="/_next/static/chunks/../poison.js" async=""></script>',
    '<script src="/_next/static/chunks/app/page.js?poison=1" async=""></script>',
    '<script src="/_next/static/chunks/app/page.js" async="">self.unreviewedInlineProgramRan=true</script>',
    '<script src="/_next/static/chunks/app/page.js" async="" onload="self.unreviewedInlineProgramRan=true"></script>',
    '<script src="/_next/static/chunks/app/page.js" async="" integrity="fixture"></script>',
    '<script src="/_next/static/chunks/app/page.js" async="" id="unexpected"></script>',
    '<script src="/_next/static/chunks/unreviewed.js" async=""></script>',
    '<script src="/_next/static/chunks/app/page.js"></script>',
    '<script src="/_next/static/chunks/app/page.js" async="" nomodule=""></script>',
  ]) {
    assertMissingFlightBootstrap(
      withMarkupBeforeBodyEnd(CANONICAL_HOME_HTML, markup)
    )
  }

  for (const html of [
    CANONICAL_HOME_HTML.replaceAll(
      ' async=""></script>',
      ' nomodule=""></script>'
    ),
    CANONICAL_HOME_HTML.replace(
      'polyfills-42372ed130431b0a.js" nomodule=""',
      'polyfills-42372ed130431b0a.js" async=""'
    ),
    CANONICAL_HOME_HTML.replace(' id="_R_" async=""', ' async=""'),
    CANONICAL_HOME_HTML.replace(
      ' async=""></script>',
      ' id="_R_" async=""></script>'
    ),
  ]) {
    assertMissingFlightBootstrap(html)
  }
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

  const bootstrapScript = CANONICAL_HOME_HTML.match(
    /<script>\(self\.__next_f=self\.__next_f\|\|\[\]\)\.push\(\[0\]\)<\/script>/
  )?.[0]
  const payloadScript = CANONICAL_HOME_HTML.match(
    /<script>self\.__next_f\.push\(\[1,[\s\S]*?<\/script>/
  )?.[0]
  assert.ok(bootstrapScript)
  assert.ok(payloadScript)
  const fosterParentedWrongOrder = CANONICAL_HOME_HTML.replace(
    bootstrapScript,
    ""
  )
    .replace(payloadScript, "")
    .replace(
      "<body>",
      `<body><table>${payloadScript}<div>${bootstrapScript}</div></table>`
    )
  assertMissingFlightBootstrap(fosterParentedWrongOrder)
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

    for (const payload of [
      `${aliasedRootId}:${INDEX_POISONED_FLIGHT_BOOTSTRAP}\n${CANONICAL_ROOT_ROW}\n`,
      `${CANONICAL_ROOT_ROW}\n${aliasedRootId}:${INDEX_POISONED_FLIGHT_BOOTSTRAP}\n`,
    ]) {
      assertMissingFlightBootstrap(
        withFlightPayloads(CANONICAL_HOME_HTML, [payload])
      )
    }
  }

  for (const payload of [
    `:${INDEX_POISONED_FLIGHT_BOOTSTRAP}\n${CANONICAL_ROOT_ROW}\n`,
    `${CANONICAL_ROOT_ROW}\n:${INDEX_POISONED_FLIGHT_BOOTSTRAP}\n`,
  ]) {
    assertMissingFlightBootstrap(
      withFlightPayloads(CANONICAL_HOME_HTML, [payload])
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
  const additionalFormStateCall = CANONICAL_HOME_HTML.replace(
    "</body>",
    '<script>self.__next_f.push([2,{"state":"unreviewed"}])</script></body>'
  )
  const additionalUnknownChannelCall = CANONICAL_HOME_HTML.replace(
    "</body>",
    "<script>self.__next_f.push([4])</script></body>"
  )
  const additionalEmptyCall = CANONICAL_HOME_HTML.replace(
    "</body>",
    "<script>self.__next_f.push([])</script></body>"
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
  const additionalUnreviewedQueue = CANONICAL_HOME_HTML.replace(
    "</body>",
    '<script>self["unrelatedQueue"].push([1])</script></body>'
  )
  const additionalExecutableInertCopies = CANONICAL_HOME_HTML.replace(
    "</body>",
    `<script>
      const stringCopy = 'self["__ne"+"xt_f"].push([1])';
      // self["__ne"+"xt_f"].push([1])
      /* globalThis["__next"+"_f"].push([1]) */
      const templateCopy = \`this["__next"+"_f"].push([1])\`;
    </script></body>`
  )
  const poisonedInstruction = JSON.stringify([
    1,
    `${INDEX_POISONED_ROOT_ROW}\n`,
  ])
  const computedPoisonScripts = [
    `self["__next"+"_f"].push(${poisonedInstruction})`,
    `const q=self['__ne'+'xt_f'];q.push(${poisonedInstruction})`,
    `self[("__next_"+"f")].push.call(self.__next_f,${poisonedInstruction})`,
    `self["__next"+"_f"].push?.(${poisonedInstruction})`,
    `this["__next"+"_f"].push(${poisonedInstruction})`,
    `self["__ne"/* split */+"xt_f"].push(${poisonedInstruction})`,
    String.raw`self["__ne\u0078t_f"].push(${poisonedInstruction})`,
    `window["__next"+"_f"].push(${poisonedInstruction})`,
    `globalThis["__ne"+"xt_f"]["push"](${poisonedInstruction})`,
    `top["__next"+"_f"].push(${poisonedInstruction})`,
    `const g=self;g["__next"+"_f"].push(${poisonedInstruction})`,
    `Reflect.get(self,"__next_f").push(${poisonedInstruction})`,
    `\`${"${"}self["__next"+"_f"].push(${poisonedInstruction})}\``,
  ]
  const computedPoisonCalls = computedPoisonScripts.map((poisonScript) =>
    CANONICAL_HOME_HTML.replace(
      "<script>self.__next_f.push",
      `<script>${poisonScript}</script>\n    <script>self.__next_f.push`
    )
  )
  const attributeBearingComputedPoison = CANONICAL_HOME_HTML.replace(
    "<script>self.__next_f.push",
    `<script id="flight-poison">${computedPoisonScripts[0]}</script>\n    <script>self.__next_f.push`
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
    additionalFormStateCall,
    additionalUnknownChannelCall,
    additionalEmptyCall,
    additionalIdScriptCall,
    additionalClassicTypeCall,
    additionalBracketCall,
    additionalTemplateCall,
    additionalUnreviewedQueue,
    additionalExecutableInertCopies,
    ...computedPoisonCalls,
    attributeBearingComputedPoison,
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

  const inertDataReferences = CANONICAL_HOME_HTML.replace(
    "</body>",
    `<script id="inert-copies" type="application/json">
      {"string":"self[\\"__ne\\"+\\"xt_f\\"].push([1])","comment":"/* self.__next_f */","template":"\u0060this[__next_f]\u0060"}
    </script></body>`
  )
  assert.deepEqual(extractRootFlightSegments(inertDataReferences), [""])
  assert.deepEqual(extractFirstFlightRouteSegments(inertDataReferences), [""])

  const inertPayloadReference = withFlightPayloads(CANONICAL_HOME_HTML, [
    `0:${JSON.stringify({
      G: ["fixture", ['self["__ne"+"xt_f"].push([1])']],
      P: null,
      c: ["", ""],
      f: [[["", { children: ["__PAGE__", {}] }], null, null, false]],
      i: false,
      q: "",
    })}\n`,
  ])
  assert.deepEqual(extractRootFlightSegments(inertPayloadReference), [""])
  assert.deepEqual(extractFirstFlightRouteSegments(inertPayloadReference), [""])
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

test("the root Flight segment array must have exactly the canonical two entries", () => {
  const extraRootSegment = CANONICAL_HOME_HTML.replace(
    String.raw`\"c\":[\"\",\"\"]`,
    String.raw`\"c\":[\"\",\"\",\"index\"]`
  )

  assert.deepEqual(extractRootFlightSegments(extraRootSegment), [])
  assert.ok(
    failures(auditRootHtml(extraRootSegment)).some(
      ({ name }) => name === "Root Flight state is canonical"
    )
  )
})

test("the root Flight router state rejects trailing top-level entries", () => {
  const trailingFlightEntry = withFlightPayloads(CANONICAL_HOME_HTML, [
    `0:${JSON.stringify({
      P: null,
      c: ["", ""],
      f: [[["", { children: ["__PAGE__", {}] }], null, null, false], null],
      i: false,
      q: "",
    })}\n`,
  ])

  assert.deepEqual(extractRootFlightSegments(trailingFlightEntry), [""])
  assert.deepEqual(extractFirstFlightRouteSegments(trailingFlightEntry), [])
  assert.ok(
    failures(auditRootHtml(trailingFlightEntry)).some(
      ({ name }) => name === "Root Flight route tree is canonical"
    )
  )

  const poisonedInitialSearch = withFlightPayloads(CANONICAL_HOME_HTML, [
    `0:${JSON.stringify({
      P: null,
      c: ["", ""],
      f: [[["", { children: ["__PAGE__", {}] }], null, null, false]],
      i: false,
      q: "?poison",
    })}\n`,
  ])
  assert.deepEqual(extractRootFlightSegments(poisonedInitialSearch), [])
  assert.deepEqual(extractFirstFlightRouteSegments(poisonedInitialSearch), [])

  const prefixedFlightPath = withFlightPayloads(CANONICAL_HOME_HTML, [
    `0:${JSON.stringify({
      P: null,
      c: ["", ""],
      f: [
        [
          ["", { children: ["__PAGE__", {}] }],
          ["index", { children: ["__PAGE__", {}] }],
          null,
          null,
          false,
        ],
      ],
      i: false,
      q: "",
    })}\n`,
  ])
  assert.deepEqual(extractFirstFlightRouteSegments(prefixedFlightPath), [])

  const dynamicRootAlias = withFlightPayloads(CANONICAL_HOME_HTML, [
    `0:${JSON.stringify({
      P: null,
      c: ["", ""],
      f: [
        [
          [["slug", "", "d", null], { children: ["__PAGE__", {}] }],
          null,
          null,
          false,
        ],
      ],
      i: false,
      q: "",
    })}\n`,
  ])
  assert.deepEqual(extractFirstFlightRouteSegments(dynamicRootAlias), [])

  const extraParallelRoute = withFlightPayloads(CANONICAL_HOME_HTML, [
    `0:${JSON.stringify({
      P: null,
      c: ["", ""],
      f: [
        [
          [
            "",
            {
              children: ["__PAGE__", {}],
              copy: ["__PAGE__", {}],
            },
          ],
          null,
          null,
          false,
        ],
      ],
      i: false,
      q: "",
    })}\n`,
  ])
  assert.deepEqual(extractFirstFlightRouteSegments(extraParallelRoute), [])

  for (const pageAlias of ["__PAGE__index", '__PAGE__?{"query":"value"}']) {
    const aliasedPageLeaf = withFlightPayloads(CANONICAL_HOME_HTML, [
      `0:${JSON.stringify({
        P: null,
        c: ["", ""],
        f: [[["", { children: [pageAlias, {}] }], null, null, false]],
        i: false,
        q: "",
      })}\n`,
    ])
    assert.deepEqual(extractFirstFlightRouteSegments(aliasedPageLeaf), [])
    assert.ok(
      failures(auditRootHtml(aliasedPageLeaf)).some(
        ({ name }) => name === "Root Flight route tree is canonical"
      )
    )
  }
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
    '      <span aria-hidden="true" data-hwl-hydration-sentinel="" hidden=""></span>\n',
    ""
  )

  assert.ok(
    failures(auditRootHtml(missingSentinel)).some(
      ({ name }) => name === "Hydration sentinel marker"
    )
  )

  const unclosedSentinel = CANONICAL_HOME_HTML.replace("</span>", "")
  assert.ok(
    failures(auditRootHtml(unclosedSentinel)).some(
      ({ name }) => name === "Hydration sentinel marker"
    )
  )

  const prehydratedSentinel = CANONICAL_HOME_HTML.replace(
    'data-hwl-hydration-sentinel="" hidden=""',
    'data-hwl-hydration-sentinel="" data-hwl-hydrated="true" hidden=""'
  )
  const duplicatedSentinel = CANONICAL_HOME_HTML.replace(
    '      <span aria-hidden="true" data-hwl-hydration-sentinel="" hidden=""></span>',
    '      <span aria-hidden="true" data-hwl-hydration-sentinel="" hidden=""></span><span aria-hidden="true" data-hwl-hydration-sentinel="" hidden=""></span>'
  )
  for (const invalidSentinel of [prehydratedSentinel, duplicatedSentinel]) {
    assert.ok(
      failures(auditRootHtml(invalidSentinel)).some(
        ({ name }) => name === "Hydration sentinel marker"
      )
    )
  }
})

test("lookalike attributes and script or style strings are not markup evidence", () => {
  const lookalikeHtml = CANONICAL_HOME_HTML.replace(
    'data-app-shell=""',
    'data-app-shell-copy=""'
  )
    .replace(
      'data-site-header-variant="pending"',
      'data-site-header-variant-copy="pending"'
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
    <!-- <div data-app-shell="" data-homepage="" data-hwl-hydration-sentinel="" data-site-header-variant="pending" id="home-hero-heading" data-home-hero-lift-cta=""></div> -->
    <div title='<span data-app-shell="" data-homepage="" data-hwl-hydration-sentinel="" data-site-header-variant="pending" id="home-hero-heading" data-home-hero-lift-cta=""></span>'></div>
    <template><div data-app-shell="" data-homepage="" data-hwl-hydration-sentinel="" data-site-header-variant="pending" id="home-hero-heading" data-home-hero-lift-cta=""></div></template>
    <textarea><div data-app-shell="" data-homepage="" data-hwl-hydration-sentinel="" data-site-header-variant="pending" id="home-hero-heading" data-home-hero-lift-cta=""></div></textarea>
    <script>const markerCopy = '<div data-app-shell="" data-homepage="" data-hwl-hydration-sentinel="" data-site-header-variant="pending" id="home-hero-heading" data-home-hero-lift-cta=""></div>';</script>
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

test("foreign-content marker attributes are not homepage evidence", () => {
  const withoutRealMarkers = CANONICAL_HOME_HTML.replace(
    'data-app-shell=""',
    'data-app-shell-copy=""'
  )
    .replace(
      'data-site-header-variant="pending"',
      'data-site-header-variant-copy="pending"'
    )
    .replace(
      'data-hwl-hydration-sentinel=""',
      'data-hwl-hydration-sentinel-copy=""'
    )
    .replace('data-homepage=""', 'data-homepage-copy=""')
    .replace('id="home-hero-heading"', 'id="home-hero-heading-copy"')
    .replace('data-home-hero-lift-cta=""', 'data-home-hero-lift-cta-copy=""')
  const foreignMarkers = `<svg>
    <g data-app-shell="" data-site-header-variant="pending" data-hwl-hydration-sentinel="" data-homepage="" id="home-hero-heading" data-home-hero-lift-cta=""></g>
    <foreignObject><div data-app-shell="" data-site-header-variant="pending" data-hwl-hydration-sentinel="" data-homepage="" id="home-hero-heading" data-home-hero-lift-cta=""></div></foreignObject>
  </svg>`
  const failedNames = failures(
    auditRootHtml(withMarkupBeforeBodyEnd(withoutRealMarkers, foreignMarkers))
  ).map(({ name }) => name)

  assert.ok(failedNames.includes("Homepage app shell"))
  assert.ok(failedNames.includes("Homepage header state"))
  assert.ok(failedNames.includes("Homepage identity markers"))
  assert.ok(failedNames.includes("Hydration sentinel marker"))
})

test("foreign integration points cannot hide non-home negative evidence", () => {
  const foreignBreadcrumb = withMarkupBeforeBodyEnd(
    CANONICAL_HOME_HTML,
    '<svg><foreignObject><nav aria-label="Breadcrumb"></nav></foreignObject></svg>'
  )
  const foreignEffects = withMarkupBeforeBodyEnd(
    CANONICAL_HOME_HTML,
    '<svg><foreignObject><div class="scroll-breath" data-scrolling=""></div></foreignObject></svg>'
  )

  assert.ok(
    failures(auditRootHtml(foreignBreadcrumb)).some(
      ({ name }) => name === "Homepage breadcrumb state"
    )
  )
  assert.ok(
    failures(auditRootHtml(foreignEffects)).some(
      ({ name }) => name === "Homepage ambient effects state"
    )
  )
})

test("homepage identity markers require their exact semantic elements", () => {
  const wrongRoles = CANONICAL_HOME_HTML.replace(
    '<div data-app-shell="">',
    '<section data-app-shell="">'
  )
    .replace(
      '<header class="top-0 sticky" data-site-header-variant="pending"></header>',
      '<div class="top-0 sticky" data-site-header-variant="pending"></div>'
    )
    .replace(
      '<span aria-hidden="true" data-hwl-hydration-sentinel="" hidden=""></span>',
      '<div aria-hidden="true" data-hwl-hydration-sentinel="" hidden=""></div>'
    )
    .replace('<div data-homepage="">', '<section data-homepage="">')
    .replace(
      '<h1 id="home-hero-heading">Come back to your whole body.</h1>',
      '<h2 id="home-hero-heading">Come back to your whole body.</h2>'
    )
    .replace(
      '<a data-home-hero-lift-cta="" href="/beauty/lift">Meet LIFT</a>',
      '<span data-home-hero-lift-cta="">Meet LIFT</span>'
    )
  const failedNames = failures(auditRootHtml(wrongRoles)).map(
    ({ name }) => name
  )

  assert.ok(failedNames.includes("Homepage app shell"))
  assert.ok(failedNames.includes("Homepage header state"))
  assert.ok(failedNames.includes("Homepage identity markers"))
  assert.ok(failedNames.includes("Hydration sentinel marker"))
})

test("homepage identity markers require their expected ancestry", () => {
  const detachedMarkers = CANONICAL_HOME_HTML.replace(
    '<header class="top-0 sticky" data-site-header-variant="pending"></header>',
    ""
  )
    .replace(
      '<span aria-hidden="true" data-hwl-hydration-sentinel="" hidden=""></span>',
      ""
    )
    .replace('<div data-homepage="">', "<div>")
    .replace('id="home-hero-heading"', 'id="home-hero-heading-copy"')
    .replace('data-home-hero-lift-cta=""', 'data-home-hero-lift-cta-copy=""')
  const semanticButDetached = `<header data-site-header-variant="pending"></header>
    <span aria-hidden="true" data-hwl-hydration-sentinel="" hidden=""></span>
    <div data-homepage=""></div>
    <h1 id="home-hero-heading"></h1>
    <a data-home-hero-lift-cta="" href="/beauty/lift"></a>`
  const failedNames = failures(
    auditRootHtml(withMarkupBeforeBodyEnd(detachedMarkers, semanticButDetached))
  ).map(({ name }) => name)

  assert.ok(failedNames.includes("Homepage header state"))
  assert.ok(failedNames.includes("Homepage identity markers"))
  assert.ok(failedNames.includes("Hydration sentinel marker"))
})

test("homepage identity markers require one coherent app-shell subtree", () => {
  const withoutRealIdentity = CANONICAL_HOME_HTML.replace(
    'data-site-header-variant="pending"',
    'data-site-header-variant-copy="pending"'
  )
    .replace(
      'data-hwl-hydration-sentinel=""',
      'data-hwl-hydration-sentinel-copy=""'
    )
    .replace('data-homepage=""', 'data-homepage-copy=""')
    .replace('id="home-hero-heading"', 'id="home-hero-heading-copy"')
    .replace('data-home-hero-lift-cta=""', 'data-home-hero-lift-cta-copy=""')
  const splitWitnesses = `<div data-app-shell=""></div>
    <span data-app-shell="">
      <header data-site-header-variant="pending"></header>
      <span aria-hidden="true" data-hwl-hydration-sentinel="" hidden=""></span>
      <div data-homepage="">
        <h1 id="home-hero-heading"></h1>
        <a data-home-hero-lift-cta="" href="/beauty/lift"></a>
      </div>
    </span>`
  const failedNames = failures(
    auditRootHtml(withMarkupBeforeBodyEnd(withoutRealIdentity, splitWitnesses))
  ).map(({ name }) => name)

  assert.ok(failedNames.includes("Homepage identity markers"))
})

test("reviewed streamed-Suspense home markers retain one coherent witness", () => {
  const directHomepage = `      <main>
        <div data-homepage="">
          <h1 id="home-hero-heading">Come back to your whole body.</h1>
          <a data-home-hero-lift-cta="" href="/beauty/lift">Meet LIFT</a>
        </div>
      </main>`
  const streamedHomepage = `      <main><!--$?--><template id="B:0"></template><span>Loading</span><!--/$--></main>`
  const hiddenHomepage = `    <div hidden="" id="S:0">
      <div data-homepage="">
        <h1 id="home-hero-heading">Come back to your whole body.</h1>
        <a data-home-hero-lift-cta="" href="/beauty/lift">Meet LIFT</a>
      </div>
    </div>`
  const streamed = CANONICAL_HOME_HTML.replace(
    directHomepage,
    streamedHomepage
  ).replace(
    "    <script>(self.__next_f=self.__next_f||[]).push([0])</script>",
    `${hiddenHomepage}
    <script>${REVIEWED_REACT_REVEAL_SCRIPT}</script>
    <script>(self.__next_f=self.__next_f||[]).push([0])</script>`
  )

  assert.deepEqual(failures(auditRootHtml(streamed)), [])

  const brokenBoundary = streamed.replace('id="S:0"', 'id="S:1"')
  assert.ok(
    failures(auditRootHtml(brokenBoundary)).some(
      ({ name }) => name === "Homepage identity markers"
    )
  )

  for (const malformedBoundary of [
    streamed.replace("<!--$?-->", ""),
    streamed.replace("<!--$?-->", "<!--$-->"),
    streamed.replace("<!--/$-->", ""),
  ]) {
    assert.ok(
      failures(auditRootHtml(malformedBoundary)).some(
        ({ name }) => name === "Homepage identity markers"
      )
    )
  }

  const revealScript = `<script>${REVIEWED_REACT_REVEAL_SCRIPT}</script>`
  const earlyReveal = streamed
    .replace(revealScript, "")
    .replace("<body>", `<body>${revealScript}`)
  const revealBeforeSource = streamed
    .replace(revealScript, "")
    .replace("<!--/$-->", `<!--/$-->${revealScript}`)
  const fosterParentedEarlyReveal = streamed.replace(
    `${hiddenHomepage}
    ${revealScript}`,
    `<table>${revealScript}${hiddenHomepage}</table>`
  )
  const revealInsideSource = streamed
    .replace(revealScript, "")
    .replace(
      "    </div>\n    <script>(self.__next_f",
      `      ${revealScript}\n    </div>\n    <script>(self.__next_f`
    )
  for (const wrongOrder of [
    earlyReveal,
    revealBeforeSource,
    fosterParentedEarlyReveal,
    revealInsideSource,
  ]) {
    assert.ok(
      failures(auditRootHtml(wrongOrder)).some(
        ({ name }) => name === "Homepage identity markers"
      )
    )
  }
})

test("streamed-Suspense boundary IDs reject cross-kind and foreign decoys", () => {
  const directHomepage = `      <main>
        <div data-homepage="">
          <h1 id="home-hero-heading">Come back to your whole body.</h1>
          <a data-home-hero-lift-cta="" href="/beauty/lift">Meet LIFT</a>
        </div>
      </main>`
  const hiddenHomepage = `    <div hidden="" id="S:0">
      <div data-homepage="">
        <h1 id="home-hero-heading">Come back to your whole body.</h1>
        <a data-home-hero-lift-cta="" href="/beauty/lift">Meet LIFT</a>
      </div>
    </div>`
  const streamed = CANONICAL_HOME_HTML.replace(
    directHomepage,
    '      <main><!--$?--><template id="B:0"></template><span>Loading</span><!--/$--></main>'
  ).replace(
    "    <script>(self.__next_f=self.__next_f||[]).push([0])</script>",
    `${hiddenHomepage}
    <script>${REVIEWED_REACT_REVEAL_SCRIPT}</script>
    <script>(self.__next_f=self.__next_f||[]).push([0])</script>`
  )
  const decoys = [
    '<div id="B:0"></div>',
    '<template id="S:0"></template>',
    '<svg><g id="B:0"></g></svg>',
    '<svg><g id="S:0"></g></svg>',
    '<script id="B:0" type="application/json">{}</script>',
  ]

  for (const decoy of decoys) {
    const withDecoy = streamed.replace("<body>", `<body>${decoy}`)
    assert.ok(
      failures(auditRootHtml(withDecoy)).some(
        ({ name }) => name === "Homepage identity markers"
      ),
      decoy
    )
  }
})

test("executable URL schemes cannot hide in activation attributes", () => {
  const executableMarkup = [
    '<a href="javascript:self.PWNED=true">go</a>',
    '<form action="JaVaScRiPt:self.PWNED=true"><button>go</button></form>',
    '<button formaction="\tjava\nscript:self.PWNED=true">go</button>',
    '<a href="&#x6a;avascript:self.PWNED=true">go</a>',
    '<svg><a id="x"><set attributeName="href" to="javascript:self.PWNED=true"></set></a></svg>',
  ]

  for (const markup of executableMarkup) {
    assert.notDeepEqual(
      failures(
        auditRootHtml(withMarkupBeforeBodyEnd(CANONICAL_HOME_HTML, markup))
      ),
      [],
      markup
    )
  }
})

test("breadcrumb labels use browser-equivalent trimmed matching", () => {
  const withBreadcrumb = withMarkupBeforeBodyEnd(
    CANONICAL_HOME_HTML,
    '<nav aria-label=" Breadcrumb "></nav>'
  )

  assert.ok(
    failures(auditRootHtml(withBreadcrumb)).some(
      ({ name }) => name === "Homepage breadcrumb state"
    )
  )
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
  assert.ok(output.includes(BROWSER_POST_HYDRATION_REQUIREMENT))
})
