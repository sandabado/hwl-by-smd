import "server-only"

import { createAdminClient } from "@/lib/supabase/server"

export const editorialStatuses = [
  "draft",
  "review",
  "published",
  "archived",
] as const

export type EditorialStatus = (typeof editorialStatuses)[number]

export type SectionReadiness =
  "ready" | "copy-draft" | "media-needed" | "verification-needed"

export type MediaReviewStatus = "draft" | "review" | "ready" | "archived"

export type MediaRightsStatus =
  "unverified" | "owned" | "licensed" | "permission-granted" | "restricted"

export type ModelReleaseStatus =
  "not-reviewed" | "not-applicable" | "not-required" | "required" | "obtained"

export type AiUsage = "none" | "ai-assisted" | "ai-generated"

export interface WebsiteSectionPreview {
  key: string
  label: string
  type:
    | "hero"
    | "featured-story"
    | "path-cards"
    | "booking-invitation"
    | "editorial-chapter"
    | "credentials"
    | "call-to-action"
  readiness: SectionReadiness
  summary: string
  designLocked: boolean
}

export interface WebsiteEntryPreview {
  key: string
  title: string
  path: string
  template: "landing-pad" | "editorial-profile"
  status: EditorialStatus
  description: string
  sections: readonly WebsiteSectionPreview[]
}

export interface FeaturedSlotPreview {
  key: string
  slot: string
  status: EditorialStatus
  eyebrow: string
  headline: string
  description: string
  ctaLabel: string
  ctaHref: string
  mediaKey: string | null
}

export interface MediaAssetPreview {
  key: string
  title: string
  kind: "image" | "video"
  status: MediaReviewStatus
  sourcePath: string | null
  altText: string | null
  accessibilityDescription: string | null
  focalPoint: { x: number; y: number }
  rightsStatus: MediaRightsStatus
  modelReleaseStatus: ModelReleaseStatus
  aiUsage: AiUsage
  aiDisclosure: string | null
}

export interface WebsiteEditorWorkspace {
  source: "code-defaults" | "database"
  schemaVersion: 1
  entries: readonly WebsiteEntryPreview[]
  featuredSlots: readonly FeaturedSlotPreview[]
  mediaAssets: readonly MediaAssetPreview[]
}

export interface PublishedHomepageFeature {
  source: "code-default" | "database"
  key: string
  eyebrow: string
  headline: string
  description: string
  ctaLabel: string
  ctaHref: string
  media: {
    kind: "image" | "video"
    src: string
    altText: string | null
    accessibilityDescription: string | null
    focalPoint: { x: number; y: number }
  }
}

export const homepageFeatureFieldNames = [
  "eyebrow",
  "headline",
  "description",
  "ctaLabel",
  "ctaHref",
] as const

export type HomepageFeatureField = (typeof homepageFeatureFieldNames)[number]

export interface HomepageFeatureInput {
  eyebrow: string
  headline: string
  description: string
  ctaLabel: string
  ctaHref: string
}

export interface FeatureFormState {
  status: "idle" | "success" | "error" | "unavailable"
  message: string
  fieldErrors?: Partial<Record<HomepageFeatureField, string[]>>
}

export const homepageFeatureInitialState: FeatureFormState = {
  status: "idle",
  message: "",
}

export interface WebsiteContentIssue {
  scope: string
  message: string
  severity: "blocking" | "warning"
}

const homepageSections = [
  {
    key: "hero",
    label: "Hero experience",
    type: "hero",
    readiness: "ready",
    summary: "Headline, supporting line, and Shannon-first hero media.",
    designLocked: true,
  },
  {
    key: "primary-feature",
    label: "LIFT door",
    type: "featured-story",
    readiness: "verification-needed",
    summary:
      "Managed LIFT invitation, complete product truth, and destination.",
    designLocked: true,
  },
  {
    key: "practice-paths",
    label: "Four entry doors",
    type: "path-cards",
    readiness: "ready",
    summary: "LIFT, private sessions, The Den, and retreat invitations.",
    designLocked: true,
  },
  {
    key: "booking-invitation",
    label: "Contact edge",
    type: "booking-invitation",
    readiness: "ready",
    summary: "Palm Springs location, email address, and telephone link.",
    designLocked: true,
  },
] as const satisfies readonly WebsiteSectionPreview[]

const aboutSections = [
  {
    key: "opening-portrait",
    label: "Opening portrait",
    type: "editorial-chapter",
    readiness: "copy-draft",
    summary: "Present-day portrait, introduction, and point of view.",
    designLocked: true,
  },
  {
    key: "skating",
    label: "Skating chapter",
    type: "editorial-chapter",
    readiness: "media-needed",
    summary: "Original archival or newly commissioned skating photography.",
    designLocked: true,
  },
  {
    key: "yoga",
    label: "Yoga chapter",
    type: "editorial-chapter",
    readiness: "media-needed",
    summary: "Outdoor movement with a grounded, unperformed quality.",
    designLocked: true,
  },
  {
    key: "motorcycle",
    label: "Motorcycle chapter",
    type: "editorial-chapter",
    readiness: "media-needed",
    summary: "An original or commissioned portrait of Shannon riding.",
    designLocked: true,
  },
  {
    key: "beauty-work",
    label: "Beauty work chapter",
    type: "editorial-chapter",
    readiness: "media-needed",
    summary: "Shannon performing facial work with documented client release.",
    designLocked: true,
  },
  {
    key: "desert-life",
    label: "Desert life chapter",
    type: "editorial-chapter",
    readiness: "media-needed",
    summary: "A relaxed Palm Springs portrait that brings her world forward.",
    designLocked: true,
  },
  {
    key: "credentials",
    label: "Verified credentials",
    type: "credentials",
    readiness: "verification-needed",
    summary:
      "Only source-verified licenses, training, and credentials publish.",
    designLocked: true,
  },
  {
    key: "closing-invitation",
    label: "Closing invitation",
    type: "call-to-action",
    readiness: "copy-draft",
    summary: "Warm close, final portrait, and booking invitation.",
    designLocked: true,
  },
] as const satisfies readonly WebsiteSectionPreview[]

export const websiteEditorDefaults = {
  source: "code-defaults",
  schemaVersion: 1,
  entries: [
    {
      key: "homepage",
      title: "Homepage",
      path: "/",
      template: "landing-pad",
      status: "draft",
      description:
        "A one-screen threshold with Shannon first and four explicit ways in.",
      sections: homepageSections,
    },
    {
      key: "about-shannon",
      title: "About Shannon",
      path: "/about",
      template: "editorial-profile",
      status: "draft",
      description:
        "An image-led profile of Shannon across skating, yoga, motorcycles, beauty work, and desert life.",
      sections: aboutSections,
    },
  ],
  featuredSlots: [
    {
      key: "lift-daily-ritual",
      slot: "homepage.primary-feature",
      status: "draft",
      eyebrow: "LIFT · Guided facial massage",
      headline: "A five-minute facial ritual.",
      description:
        "LIFT Guide · $11.11 one time. Complete video + guide · $33.33.",
      ctaLabel: "Experience LIFT",
      ctaHref: "/beauty/lift",
      mediaKey: "lift-video-preview",
    },
  ],
  mediaAssets: [
    {
      key: "lift-video-preview",
      title: "LIFT homepage preview",
      kind: "video",
      status: "ready",
      sourcePath: "/video/lift/facial-lift-preview.mp4",
      altText: null,
      accessibilityDescription:
        "A quiet close-up preview of Shannon demonstrating her LIFT facial massage.",
      focalPoint: { x: 0.5, y: 0.42 },
      rightsStatus: "owned",
      modelReleaseStatus: "not-required",
      aiUsage: "none",
      aiDisclosure: null,
    },
  ],
} as const satisfies WebsiteEditorWorkspace

export function isSafeInternalSitePath(value: string) {
  return (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\") &&
    !/[\u0000-\u001f]/.test(value)
  )
}

export const homepageFeatureLimits = {
  eyebrow: 48,
  headline: 72,
  description: 100,
  ctaLabel: 32,
  ctaHref: 160,
} as const satisfies Record<HomepageFeatureField, number>

function formString(formData: FormData, field: HomepageFeatureField) {
  const value = formData.get(field)
  return typeof value === "string" ? value.trim() : null
}

/**
 * Validates the only fields the homepage feature form is allowed to change.
 * Feature identity, slot identity, media selection, and publication state are
 * always re-read by the trusted database function instead of accepted from the
 * browser.
 */
export function parseHomepageFeatureFormData(formData: FormData):
  | { ok: true; value: HomepageFeatureInput }
  | {
      ok: false
      fieldErrors: Partial<Record<HomepageFeatureField, string[]>>
    } {
  const fieldErrors: Partial<Record<HomepageFeatureField, string[]>> = {}
  const values = Object.fromEntries(
    homepageFeatureFieldNames.map((field) => [
      field,
      formString(formData, field),
    ])
  ) as Record<HomepageFeatureField, string | null>

  for (const field of homepageFeatureFieldNames) {
    const value = values[field]
    if (value === null) {
      fieldErrors[field] = ["Use plain text for this field."]
      continue
    }

    if (value.length > homepageFeatureLimits[field]) {
      fieldErrors[field] = [
        `Keep this to ${homepageFeatureLimits[field]} characters or fewer.`,
      ]
    }
  }

  for (const requiredField of ["headline", "ctaLabel", "ctaHref"] as const) {
    if (values[requiredField] === "") {
      fieldErrors[requiredField] = ["This field is required."]
    }
  }

  const ctaHref = values.ctaHref
  if (ctaHref && !isSafeInternalSitePath(ctaHref)) {
    fieldErrors.ctaHref = [
      "Use a safe internal route beginning with one slash, such as /beauty/lift.",
    ]
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors }
  }

  return {
    ok: true,
    value: values as HomepageFeatureInput,
  }
}

export function isWebsiteEditorSchemaUnavailableError(error: {
  code?: string
  message?: string
}) {
  if (
    error.code &&
    ["42P01", "42883", "3F000", "PGRST202", "PGRST205"].includes(error.code)
  ) {
    return true
  }

  const message = error.message?.toLowerCase() ?? ""
  return (
    message.includes("schema cache") ||
    message.includes("persist_homepage_feature") ||
    message.includes("content_entries") ||
    message.includes("featured_slots")
  )
}

export function validateWebsiteEditorWorkspace(
  workspace: WebsiteEditorWorkspace
): WebsiteContentIssue[] {
  const issues: WebsiteContentIssue[] = []
  const entryKeys = new Set<string>()
  const mediaByKey = new Map(
    workspace.mediaAssets.map((asset) => [asset.key, asset])
  )

  for (const entry of workspace.entries) {
    if (entryKeys.has(entry.key)) {
      issues.push({
        scope: entry.title,
        message: `Duplicate entry key: ${entry.key}`,
        severity: "blocking",
      })
    }
    entryKeys.add(entry.key)

    if (!isSafeInternalSitePath(entry.path)) {
      issues.push({
        scope: entry.title,
        message: "The page path must remain an internal site route.",
        severity: "blocking",
      })
    }

    const sectionKeys = new Set<string>()
    for (const section of entry.sections) {
      if (sectionKeys.has(section.key)) {
        issues.push({
          scope: entry.title,
          message: `Duplicate section key: ${section.key}`,
          severity: "blocking",
        })
      }
      sectionKeys.add(section.key)
    }
  }

  for (const feature of workspace.featuredSlots) {
    if (!isSafeInternalSitePath(feature.ctaHref)) {
      issues.push({
        scope: feature.headline,
        message: "The featured CTA must lead to an internal site route.",
        severity: "blocking",
      })
    }

    if (feature.mediaKey && !mediaByKey.has(feature.mediaKey)) {
      issues.push({
        scope: feature.headline,
        message: `Featured media is missing: ${feature.mediaKey}`,
        severity: "blocking",
      })
    }
  }

  for (const asset of workspace.mediaAssets) {
    if (asset.focalPoint.x < 0 || asset.focalPoint.x > 1) {
      issues.push({
        scope: asset.title,
        message: "Horizontal focal point must be between 0 and 1.",
        severity: "blocking",
      })
    }
    if (asset.focalPoint.y < 0 || asset.focalPoint.y > 1) {
      issues.push({
        scope: asset.title,
        message: "Vertical focal point must be between 0 and 1.",
        severity: "blocking",
      })
    }

    if (asset.rightsStatus === "unverified") {
      issues.push({
        scope: asset.title,
        message: "Usage rights must be recorded before this asset can publish.",
        severity: "blocking",
      })
    }
    if (
      asset.modelReleaseStatus === "not-reviewed" ||
      asset.modelReleaseStatus === "required"
    ) {
      issues.push({
        scope: asset.title,
        message: "Model-release requirements still need review.",
        severity: "blocking",
      })
    }
    if (asset.aiUsage !== "none" && !asset.aiDisclosure?.trim()) {
      issues.push({
        scope: asset.title,
        message: "AI-created or AI-assisted media requires a disclosure.",
        severity: "blocking",
      })
    }
    if (asset.kind === "image" && !asset.altText?.trim()) {
      issues.push({
        scope: asset.title,
        message: "Image alt text is required before publishing.",
        severity: "blocking",
      })
    }
    if (asset.kind === "video" && !asset.accessibilityDescription?.trim()) {
      issues.push({
        scope: asset.title,
        message:
          "Video accessibility description is required before publishing.",
        severity: "blocking",
      })
    }
  }

  return issues
}

export const homepageFeatureCodeDefault: PublishedHomepageFeature = {
  source: "code-default",
  key: "lift-daily-ritual",
  eyebrow: "LIFT · Guided facial massage",
  headline: "A five-minute facial ritual.",
  description: "LIFT Guide · $11.11 one time. Complete video + guide · $33.33.",
  ctaLabel: "Experience LIFT",
  ctaHref: "/beauty/lift",
  media: {
    kind: "video",
    src: "/video/lift/facial-lift-preview.mp4",
    altText: null,
    accessibilityDescription:
      "A quiet close-up preview of Shannon demonstrating her LIFT facial massage.",
    focalPoint: { x: 0.5, y: 0.42 },
  },
}

type EditorAccess = { source: "local-preview" | "supabase" }
type DatabaseRecord = Record<string, unknown>

function record(value: unknown): DatabaseRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as DatabaseRecord)
    : null
}

function textValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback
}

function focalPointValue(value: unknown, fallback: number) {
  return typeof value === "number" && value >= 0 && value <= 1
    ? value
    : fallback
}

function mediaRightsValue(value: unknown): MediaRightsStatus {
  const normalized = textValue(value).replaceAll("_", "-")
  return [
    "unverified",
    "owned",
    "licensed",
    "permission-granted",
    "restricted",
  ].includes(normalized)
    ? (normalized as MediaRightsStatus)
    : "unverified"
}

function modelReleaseValue(value: unknown): ModelReleaseStatus {
  const normalized = textValue(value).replaceAll("_", "-")
  return [
    "not-reviewed",
    "not-applicable",
    "not-required",
    "required",
    "obtained",
  ].includes(normalized)
    ? (normalized as ModelReleaseStatus)
    : "not-reviewed"
}

function aiUsageValue(value: unknown): AiUsage {
  const normalized = textValue(value).replaceAll("_", "-")
  return ["none", "ai-assisted", "ai-generated"].includes(normalized)
    ? (normalized as AiUsage)
    : "ai-generated"
}

function safeMediaSource(media: DatabaseRecord) {
  const publicPath = textValue(media.public_path)
  if (publicPath && isSafeInternalSitePath(publicPath)) return publicPath

  const externalUrl = textValue(media.external_url)
  if (externalUrl) {
    try {
      const url = new URL(externalUrl)
      if (url.protocol === "https:") return url.toString()
    } catch {
      return null
    }
  }

  return null
}

async function readHomepageFeatureRows() {
  const supabase = createAdminClient()
  if (!supabase) return { ok: false as const, reason: "configuration" }
  const signal = AbortSignal.timeout(4_500)

  try {
    const { data: featureData, error: featureError } = await supabase
      .from("featured_slots")
      .select(
        "feature_key, slot_key, status, eyebrow, headline, description, cta_label, cta_href, media_asset_id, starts_at, ends_at, published_at, content"
      )
      .eq("feature_key", "lift-daily-ritual")
      .eq("slot_key", "homepage.primary-feature")
      .abortSignal(signal)
      .maybeSingle()

    if (featureError) {
      return { ok: false as const, reason: "query", error: featureError }
    }

    const feature = record(featureData)
    if (!feature) return { ok: false as const, reason: "record" }

    const mediaAssetId = textValue(feature.media_asset_id)
    if (!mediaAssetId) {
      return { ok: true as const, feature, media: null }
    }

    const { data: mediaData, error: mediaError } = await supabase
      .from("media_assets")
      .select(
        "asset_key, title, media_kind, status, public_path, external_url, alt_text, accessibility_description, has_meaningful_audio, captions_path, transcript_path, focal_point_x, focal_point_y, rights_status, rights_expires_at, model_release_status, ai_usage, ai_disclosure"
      )
      .eq("id", mediaAssetId)
      .abortSignal(signal)
      .maybeSingle()

    if (mediaError) {
      return { ok: false as const, reason: "query", error: mediaError }
    }

    return { ok: true as const, feature, media: record(mediaData) }
  } catch {
    return { ok: false as const, reason: "network" }
  }
}

function codeBackedEditorPreview(message: string) {
  return {
    workspace: websiteEditorDefaults,
    issues: validateWebsiteEditorWorkspace(websiteEditorDefaults),
    persistence: { connected: false, writable: false, message },
  } as const
}

/**
 * Loads the private editor DTO through the service role only after the page has
 * established which kind of administrator is viewing it. Local preview remains
 * deliberately read-only.
 */
export async function getWebsiteEditorPreview(access: EditorAccess) {
  if (access.source === "local-preview") {
    return codeBackedEditorPreview(
      "Local preview is read-only. Sign in as a verified Supabase administrator to save."
    )
  }

  const rows = await readHomepageFeatureRows()
  if (!rows.ok) {
    return codeBackedEditorPreview(
      rows.reason === "configuration"
        ? "Website persistence is not configured on this server."
        : "Migration 007 is not available yet. Save and publish remain disabled."
    )
  }

  const { feature, media } = rows
  const draft = record(record(feature.content)?.draft)
  const editable = draft ?? feature
  const ctaHref = textValue(editable.cta_href, "/beauty/lift")
  const rawStatus = draft ? "draft" : textValue(feature.status, "draft")
  const status = editorialStatuses.some((value) => value === rawStatus)
    ? (rawStatus as EditorialStatus)
    : "draft"

  const mediaPreview: MediaAssetPreview = media
    ? {
        key: textValue(media.asset_key, "lift-video-preview"),
        title: textValue(media.title, "LIFT homepage preview"),
        kind: media.media_kind === "image" ? "image" : "video",
        status: ["draft", "review", "ready", "archived"].includes(
          textValue(media.status)
        )
          ? (textValue(media.status) as MediaReviewStatus)
          : "review",
        sourcePath: safeMediaSource(media),
        altText: textValue(media.alt_text) || null,
        accessibilityDescription:
          textValue(media.accessibility_description) || null,
        focalPoint: {
          x: focalPointValue(media.focal_point_x, 0.5),
          y: focalPointValue(media.focal_point_y, 0.42),
        },
        rightsStatus: mediaRightsValue(media.rights_status),
        modelReleaseStatus: modelReleaseValue(media.model_release_status),
        aiUsage: aiUsageValue(media.ai_usage),
        aiDisclosure: textValue(media.ai_disclosure) || null,
      }
    : websiteEditorDefaults.mediaAssets[0]

  const workspace: WebsiteEditorWorkspace = {
    ...websiteEditorDefaults,
    source: "database",
    featuredSlots: [
      {
        ...websiteEditorDefaults.featuredSlots[0],
        status,
        eyebrow: textValue(editable.eyebrow),
        headline: textValue(editable.headline),
        description: textValue(editable.description),
        ctaLabel: textValue(editable.cta_label),
        ctaHref: isSafeInternalSitePath(ctaHref)
          ? ctaHref
          : websiteEditorDefaults.featuredSlots[0].ctaHref,
        mediaKey: mediaPreview.key,
      },
    ],
    mediaAssets: [mediaPreview],
  }

  return {
    workspace,
    issues: validateWebsiteEditorWorkspace(workspace),
    persistence: {
      connected: true,
      writable: true,
      message:
        "Migration 007 is connected. Drafts remain private until an authorized publish passes every media gate.",
    },
  } as const
}

/**
 * Returns a database feature only when both the slot and its media are fully
 * publishable. Any missing configuration, schema/query failure, expired
 * schedule, malformed route, or incomplete media governance fails closed to
 * the reviewed code default.
 */
export async function getPublishedHomepageFeature(): Promise<PublishedHomepageFeature> {
  const rows = await readHomepageFeatureRows()
  if (!rows.ok || !rows.media) return homepageFeatureCodeDefault

  const { feature, media } = rows
  const now = Date.now()
  const startsAt = textValue(feature.starts_at)
  const endsAt = textValue(feature.ends_at)
  const rightsExpiresAt = textValue(media.rights_expires_at)
  const ctaHref = textValue(feature.cta_href)
  const mediaSource = safeMediaSource(media)
  const mediaKind = media.media_kind === "image" ? "image" : "video"
  const rightsStatus = textValue(media.rights_status)
  const releaseStatus = textValue(media.model_release_status)

  const scheduleInvalid =
    (startsAt !== "" &&
      (!Number.isFinite(Date.parse(startsAt)) || Date.parse(startsAt) > now)) ||
    (endsAt !== "" &&
      (!Number.isFinite(Date.parse(endsAt)) || Date.parse(endsAt) <= now))

  const mediaInvalid =
    media.status !== "ready" ||
    !["owned", "licensed", "permission_granted"].includes(rightsStatus) ||
    (rightsExpiresAt !== "" &&
      (!Number.isFinite(Date.parse(rightsExpiresAt)) ||
        Date.parse(rightsExpiresAt) <= now)) ||
    !["not_applicable", "not_required", "obtained"].includes(releaseStatus) ||
    (mediaKind === "image" && textValue(media.alt_text).trim() === "") ||
    (mediaKind === "video" &&
      textValue(media.accessibility_description).trim() === "") ||
    (media.has_meaningful_audio === true &&
      !textValue(media.captions_path) &&
      !textValue(media.transcript_path)) ||
    (media.ai_usage !== "none" &&
      textValue(media.ai_disclosure).trim() === "") ||
    !mediaSource

  if (
    feature.status !== "published" ||
    !feature.published_at ||
    scheduleInvalid ||
    mediaInvalid ||
    !isSafeInternalSitePath(ctaHref)
  ) {
    return homepageFeatureCodeDefault
  }

  return {
    source: "database",
    key: textValue(feature.feature_key, "lift-daily-ritual"),
    eyebrow: textValue(feature.eyebrow),
    headline: textValue(feature.headline),
    description: textValue(feature.description),
    ctaLabel: textValue(feature.cta_label),
    ctaHref,
    media: {
      kind: mediaKind,
      src: mediaSource,
      altText: textValue(media.alt_text) || null,
      accessibilityDescription:
        textValue(media.accessibility_description) || null,
      focalPoint: {
        x: focalPointValue(media.focal_point_x, 0.5),
        y: focalPointValue(media.focal_point_y, 0.42),
      },
    },
  }
}
