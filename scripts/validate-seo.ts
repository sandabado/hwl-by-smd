import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative, resolve } from "node:path"

import { LOCATION_PAGES } from "../lib/location-pages.ts"
import { seoJournalArticleList } from "../lib/seo-journal-articles.ts"

const projectRoot = process.cwd()

const seoPages = [
  ["/", "app/page.tsx"],
  ["/about", "app/about/page.tsx"],
  ["/experiences", "app/experiences/page.tsx"],
  ["/beauty", "app/beauty/page.tsx"],
  ["/yoga", "app/yoga/page.tsx"],
  ["/tarot", "app/tarot/page.tsx"],
  ["/retreats", "app/retreats/page.tsx"],
  ["/journal", "app/journal/page.tsx"],
  ["/beauty/lift", "app/beauty/lift/page.tsx"],
  ["/store", "app/store/page.tsx"],
  ["/book", "app/book/page.tsx"],
  ["/contact", "app/contact/page.tsx"],
  ["/privacy", "app/privacy/page.tsx"],
  ["/terms", "app/terms/page.tsx"],
  ["/palm-springs", "app/palm-springs/page.tsx"],
  ["/joshua-tree", "app/joshua-tree/page.tsx"],
  ["/yucca-valley", "app/yucca-valley/page.tsx"],
  ["/desert-hot-springs", "app/desert-hot-springs/page.tsx"],
  ["/journal/tarot-palm-springs", "app/journal/tarot-palm-springs/page.tsx"],
  [
    "/journal/sound-bath-joshua-tree",
    "app/journal/sound-bath-joshua-tree/page.tsx",
  ],
  ["/journal/desert-skincare", "app/journal/desert-skincare/page.tsx"],
] as const

const coreMetadataSources = [
  ["/", "app/page.tsx"],
  ["/about", "app/about/page.tsx"],
  ["/experiences", "app/experiences/page.tsx"],
  ["/beauty", "app/experiences/beauty/page.tsx"],
  ["/yoga", "app/experiences/movement/page.tsx"],
  ["/tarot", "app/experiences/ritual/page.tsx"],
  ["/retreats", "app/experiences/retreats/page.tsx"],
  ["/journal", "app/journal/page.tsx"],
  ["/beauty/lift", "app/lift/page.tsx"],
  ["/store", "app/store/page.tsx"],
  ["/book", "app/book/page.tsx"],
  ["/contact", "app/contact/page.tsx"],
  ["/privacy", "app/privacy/page.tsx"],
  ["/terms", "app/terms/page.tsx"],
] as const

type MetadataRecord = {
  description: string
  route: string
  title: string
}

function filesBelow(directory: string, extensions: readonly string[]) {
  const output: string[] = []

  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry)
    const details = statSync(path)

    if (details.isDirectory()) {
      output.push(...filesBelow(path, extensions))
    } else if (extensions.some((extension) => path.endsWith(extension))) {
      output.push(path)
    }
  }

  return output
}

function routeFromAppFile(file: string) {
  const appRelative = relative(resolve(projectRoot, "app"), file)
  const routeRelative = /^(page|route)\.ts(x)?$/.test(appRelative)
    ? ""
    : appRelative.replace(/\/(page\.tsx|route\.ts)$/, "")
  const segments = routeRelative
    .split("/")
    .filter((segment) => segment && !/^\(.+\)$/.test(segment))

  return segments.length ? `/${segments.join("/")}` : "/"
}

function dynamicRoutePattern(route: string) {
  const escaped = route
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\\[\\\[\\\.\\\.\\\.(.+?)\\\]\\\]/g, ".*")
    .replace(/\\\[\\\.\\\.\\\.(.+?)\\\]/g, ".+")
    .replace(/\\\[(.+?)\\\]/g, "[^/]+")

  return new RegExp(`^${escaped}$`)
}

function extractMetadata(route: string, source: string): MetadataRecord {
  const contents = readFileSync(resolve(projectRoot, source), "utf8")
  const call = contents.match(/createPageMetadata\(\{([\s\S]*?)\}\)/)?.[1]
  const title = call?.match(/title:\s*["'`]([^"'`]+)["'`]/)?.[1]
  const description = call?.match(/description:\s*["'`]([^"'`]+)["'`]/)?.[1]

  if (!title || !description) {
    throw new Error(`Could not read title and description from ${source}`)
  }

  return { route, title, description }
}

function normalizedTokens(text: string) {
  const ignored = new Set([
    "a",
    "and",
    "as",
    "at",
    "for",
    "in",
    "is",
    "of",
    "on",
    "or",
    "the",
    "to",
    "with",
    "you",
    "your",
  ])

  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2 && !ignored.has(token))
  )
}

function similarity(left: string, right: string) {
  const a = normalizedTokens(left)
  const b = normalizedTokens(right)
  const intersection = [...a].filter((token) => b.has(token)).length
  const union = new Set([...a, ...b]).size

  return union ? intersection / union : 0
}

const errors: string[] = []

for (const [route, source] of seoPages) {
  const absoluteSource = resolve(projectRoot, source)

  try {
    const contents = readFileSync(absoluteSource, "utf8")
    const exportsMetadata =
      /export const metadata\s*=/.test(contents) ||
      /export \{\s*default,\s*metadata\s*\}/.test(contents)

    if (!exportsMetadata) {
      errors.push(`${route}: ${source} does not export metadata`)
    }
  } catch {
    errors.push(`${route}: missing page file ${source}`)
  }
}

const routeFiles = filesBelow(resolve(projectRoot, "app"), [
  "/page.tsx",
  "/route.ts",
])
const appRoutes = routeFiles.map(routeFromAppFile)
const staticRoutes = new Set(appRoutes.filter((route) => !route.includes("[")))
const dynamicRoutes = appRoutes
  .filter((route) => route.includes("["))
  .map(dynamicRoutePattern)
const publicFiles = new Set(
  filesBelow(resolve(projectRoot, "public"), [
    ".avif",
    ".css",
    ".gif",
    ".ico",
    ".jpeg",
    ".jpg",
    ".js",
    ".pdf",
    ".png",
    ".svg",
    ".webp",
  ]).map((file) => `/${relative(resolve(projectRoot, "public"), file)}`)
)

const sourceFiles = ["app", "components", "lib"].flatMap((directory) =>
  filesBelow(resolve(projectRoot, directory), [".ts", ".tsx"])
)
const hrefPatterns = [
  /href\s*=\s*["'](\/[^"']*)["']/g,
  /href\s*=\s*\{\s*["'](\/[^"']*)["']\s*\}/g,
  /href\s*:\s*["'](\/[^"']*)["']/g,
]

for (const source of sourceFiles) {
  const contents = readFileSync(source, "utf8")

  for (const pattern of hrefPatterns) {
    for (const match of contents.matchAll(pattern)) {
      const href = match[1]
      const path = href.split(/[?#]/)[0] || "/"
      const exists =
        staticRoutes.has(path) ||
        publicFiles.has(path) ||
        dynamicRoutes.some((routePattern) => routePattern.test(path))

      if (!exists) {
        errors.push(
          `${relative(projectRoot, source)}: broken internal link ${href}`
        )
      }
    }
  }
}

const metadataRecords: MetadataRecord[] = []

for (const [route, source] of coreMetadataSources) {
  try {
    metadataRecords.push(extractMetadata(route, source))
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
  }
}

for (const location of Object.values(LOCATION_PAGES)) {
  metadataRecords.push({ route: location.path, ...location.metadata })
}

for (const article of seoJournalArticleList) {
  metadataRecords.push({
    route: `/journal/${article.slug}`,
    ...article.metadata,
  })
}

for (const field of ["title", "description"] as const) {
  const owners = new Map<string, string[]>()

  for (const item of metadataRecords) {
    const normalized = item[field].trim().toLowerCase()
    owners.set(normalized, [...(owners.get(normalized) ?? []), item.route])
  }

  for (const routes of owners.values()) {
    if (routes.length > 1) {
      errors.push(`Duplicate metadata ${field}: ${routes.join(", ")}`)
    }
  }
}

const contentDocuments = [
  ...Object.values(LOCATION_PAGES).map((location) => ({
    route: location.path,
    text: [
      location.heroTitle,
      ...location.introParagraphs,
      location.placeHeading,
      ...location.placeParagraphs,
      ...location.services.map((service) => service.description),
      location.closing.heading,
      location.closing.body,
    ].join(" "),
  })),
  ...seoJournalArticleList.map((article) => ({
    route: `/journal/${article.slug}`,
    text: [
      article.h1,
      article.dek,
      ...article.sections.flatMap((section) => [
        section.heading,
        ...section.paragraphs,
      ]),
      ...article.faqs.flatMap((faq) => [faq.question, faq.answer]),
    ].join(" "),
  })),
]

for (let left = 0; left < contentDocuments.length; left += 1) {
  for (let right = left + 1; right < contentDocuments.length; right += 1) {
    const score = similarity(
      contentDocuments[left].text,
      contentDocuments[right].text
    )

    if (score >= 0.72) {
      errors.push(
        `Substantially duplicate content (${score.toFixed(2)}): ${contentDocuments[left].route}, ${contentDocuments[right].route}`
      )
    }
  }
}

if (errors.length) {
  console.error(`SEO validation failed with ${errors.length} issue(s):`)
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log(
    `SEO validation passed: ${seoPages.length} pages, ${metadataRecords.length} metadata records, ${contentDocuments.length} long-form documents.`
  )
}
