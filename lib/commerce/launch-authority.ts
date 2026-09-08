export const DEPLOYMENT_TARGETS = [
  "development",
  "preview",
  "production",
] as const

export type DeploymentTarget = (typeof DEPLOYMENT_TARGETS)[number]

type RuntimeEnvironment = Readonly<Record<string, string | undefined>>

export const CANONICAL_EMAIL_DOMAIN = "hwlbysmd.com"
export const CANONICAL_COMMERCE_ALERT_TO_EMAIL = "admin@ghosthand.studio"

export const CANONICAL_LAUNCH_AUTHORITY = {
  development: {
    siteUrl: null,
    stripeAccountId: "acct_1U9cEQAdcj2oNOF4",
    stripeLivemode: false,
    stripePriceId: "price_1U9s49Adcj2oNOF4jcyMjyDB",
    stripeProductId: "prod_VACTsFboJAEOF0",
    supabaseProjectRef: "lkxppynmdfzljuptauxf",
    supabaseUrl: "https://lkxppynmdfzljuptauxf.supabase.co",
  },
  preview: {
    siteUrl: "https://preview.hwlbysmd.com",
    stripeAccountId: "acct_1U9cEQAdcj2oNOF4",
    stripeLivemode: false,
    stripePriceId: "price_1U9s49Adcj2oNOF4jcyMjyDB",
    stripeProductId: "prod_VACTsFboJAEOF0",
    supabaseProjectRef: "lkxppynmdfzljuptauxf",
    supabaseUrl: "https://lkxppynmdfzljuptauxf.supabase.co",
  },
  production: {
    siteUrl: "https://www.hwlbysmd.com",
    stripeAccountId: "acct_1U9cEIPTLuM8Maxa",
    stripeLivemode: true,
    stripePriceId: "price_1UCPFjPTLuM8MaxaTY48RO9e",
    stripeProductId: "prod_VCotDELRoHDnox",
    supabaseProjectRef: "qwprhsrwiihfllmgallr",
    supabaseUrl: "https://qwprhsrwiihfllmgallr.supabase.co",
  },
} as const satisfies Record<
  DeploymentTarget,
  {
    siteUrl: string | null
    stripeAccountId: string
    stripeLivemode: boolean
    stripePriceId: string
    stripeProductId: string
    supabaseProjectRef: string
    supabaseUrl: string
  }
>

const SAFE_STORAGE_PATH = /^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/
export const MODERN_SUPABASE_PUBLISHABLE_KEY =
  /^sb_publishable_[A-Za-z0-9_-]{16,}$/
export const MODERN_SUPABASE_SECRET_KEY = /^sb_secret_[A-Za-z0-9_-]{16,}$/
const RESEND_API_KEY = /^re_[a-zA-Z0-9_]+$/
const STRIPE_SECRET_KEY = /^(?:sk|rk)_(?:test|live)_[a-zA-Z0-9_]+$/
const SINGLE_EMAIL_PATTERN =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/
const PLACEHOLDER_VALUES = new Set([
  "[sensitive]",
  "changeme",
  "null",
  "placeholder",
  "required",
  "todo",
  "undefined",
])

function exactValue(environment: RuntimeEnvironment, key: string) {
  const value = environment[key] ?? ""
  return value === value.trim() ? value : ""
}

function hasInvalidEdgeWhitespace(
  environment: RuntimeEnvironment,
  key: string
) {
  const value = environment[key]
  return value !== undefined && value !== value.trim()
}

function isDeploymentTarget(value: string): value is DeploymentTarget {
  return DEPLOYMENT_TARGETS.includes(value as DeploymentTarget)
}

function isTrustedProductionRuntime(environment: RuntimeEnvironment) {
  return (
    exactValue(environment, "HWL_DEPLOYMENT_TARGET") === "production" &&
    exactValue(environment, "VERCEL_ENV") === "production" &&
    exactValue(environment, "VERCEL") === "1" &&
    exactValue(environment, "NODE_ENV") === "production"
  )
}

export function getDeploymentTargetBoundary(
  environment: RuntimeEnvironment
): DeploymentTarget | "local" | null {
  if (
    hasInvalidEdgeWhitespace(environment, "HWL_DEPLOYMENT_TARGET") ||
    hasInvalidEdgeWhitespace(environment, "VERCEL_ENV")
  ) {
    return null
  }

  const explicitTarget = exactValue(environment, "HWL_DEPLOYMENT_TARGET")
  const platformTarget = exactValue(environment, "VERCEL_ENV")

  if (explicitTarget && !isDeploymentTarget(explicitTarget)) return null
  if (platformTarget && !isDeploymentTarget(platformTarget)) return null
  if (explicitTarget && platformTarget && explicitTarget !== platformTarget) {
    return null
  }

  const deployedRuntime =
    exactValue(environment, "NODE_ENV") === "production" ||
    exactValue(environment, "VERCEL") === "1" ||
    Boolean(platformTarget)

  if (deployedRuntime && !isDeploymentTarget(explicitTarget)) return null
  if (isDeploymentTarget(explicitTarget)) return explicitTarget

  return "local"
}

export function getCommerceDeploymentTarget(
  environment: RuntimeEnvironment
): DeploymentTarget | null {
  const target = getDeploymentTargetBoundary(environment)
  if (target === null || target === "local") return null
  if (target === "production" && !isTrustedProductionRuntime(environment)) {
    return null
  }

  return target
}

export function getCanonicalStripeLivemode(environment: RuntimeEnvironment) {
  const configuredMode =
    exactValue(environment, "STRIPE_LIVEMODE") === "true"
      ? true
      : exactValue(environment, "STRIPE_LIVEMODE") === "false"
        ? false
        : null
  if (configuredMode === null) return null

  const target = getDeploymentTargetBoundary(environment)
  if (target === null) return null
  if (target === "local") return configuredMode ? null : false
  if (target === "production" && !isTrustedProductionRuntime(environment)) {
    return null
  }

  return configuredMode === CANONICAL_LAUNCH_AUTHORITY[target].stripeLivemode
    ? configuredMode
    : null
}

export function getCanonicalStripeAccountId(
  environment: RuntimeEnvironment
): string | null {
  const target = getCommerceDeploymentTarget(environment)
  if (!target) return null

  const configured = exactValue(environment, "STRIPE_ACCOUNT_ID")
  return configured === CANONICAL_LAUNCH_AUTHORITY[target].stripeAccountId
    ? configured
    : null
}

export function getCanonicalStripeProductId(
  environment: RuntimeEnvironment
): string | undefined {
  const target = getCommerceDeploymentTarget(environment)
  if (!target) return undefined

  const configured = exactValue(environment, "STRIPE_LIFT_PRODUCT_ID")
  return configured === CANONICAL_LAUNCH_AUTHORITY[target].stripeProductId
    ? configured
    : undefined
}

export function getCanonicalStripePriceId(
  environment: RuntimeEnvironment
): string | undefined {
  const target = getCommerceDeploymentTarget(environment)
  if (!target) return undefined

  const configured = exactValue(environment, "STRIPE_LIFT_GUIDE_PRICE_ID")
  return configured === CANONICAL_LAUNCH_AUTHORITY[target].stripePriceId
    ? configured
    : undefined
}

export function isCanonicalSupabaseRuntime(
  environment: RuntimeEnvironment,
  options: { allowUnscopedLocal?: boolean } = {}
) {
  const target = getDeploymentTargetBoundary(environment)
  const configuredUrl = exactValue(environment, "NEXT_PUBLIC_SUPABASE_URL")

  if (target === null) return false

  try {
    const url = new URL(configuredUrl)
    if (target === "local") {
      const localHttp =
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname)
      return (
        options.allowUnscopedLocal === true &&
        (url.protocol === "https:" || localHttp) &&
        !url.username &&
        !url.password &&
        url.pathname === "/" &&
        !url.search &&
        !url.hash
      )
    }

    return (
      url.toString().replace(/\/$/, "") ===
        CANONICAL_LAUNCH_AUTHORITY[target].supabaseUrl &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash
    )
  } catch {
    return false
  }
}

export function isCanonicalSupabasePublicConfiguration(
  environment: RuntimeEnvironment,
  options: { allowUnscopedLocal?: boolean } = {}
) {
  return (
    isCanonicalSupabaseRuntime(environment, options) &&
    MODERN_SUPABASE_PUBLISHABLE_KEY.test(
      exactValue(environment, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
    ) &&
    !(environment.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "")
  )
}

export function isCanonicalSupabaseAdminConfiguration(
  environment: RuntimeEnvironment,
  options: { allowUnscopedLocal?: boolean } = {}
) {
  const publishableKey = exactValue(
    environment,
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  )
  const serviceRoleKey = exactValue(environment, "SUPABASE_SERVICE_ROLE_KEY")

  return (
    isCanonicalSupabasePublicConfiguration(environment, options) &&
    MODERN_SUPABASE_SECRET_KEY.test(serviceRoleKey) &&
    serviceRoleKey !== publishableKey
  )
}

export function getCanonicalSiteUrl(
  environment: RuntimeEnvironment
): string | null {
  const target = getCommerceDeploymentTarget(environment)
  if (!target) return null

  const siteUrl = exactValue(environment, "NEXT_PUBLIC_SITE_URL")
  const canonicalSiteUrl = CANONICAL_LAUNCH_AUTHORITY[target].siteUrl

  try {
    const url = new URL(siteUrl)
    if (canonicalSiteUrl) {
      return url.toString().replace(/\/$/, "") === canonicalSiteUrl
        ? canonicalSiteUrl
        : null
    }

    const isLocalHttp =
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname)
    return isLocalHttp && url.pathname === "/" && !url.search && !url.hash
      ? url.origin
      : null
  } catch {
    return null
  }
}

function hasSafeStoragePath(value: string) {
  const normalized = value.toLowerCase()
  const segments = value.split("/")
  return (
    Boolean(value) &&
    !PLACEHOLDER_VALUES.has(normalized) &&
    !normalized.startsWith("your_") &&
    !value.startsWith("/") &&
    !segments.some(
      (segment) => !segment || segment === "." || segment === ".."
    ) &&
    SAFE_STORAGE_PATH.test(value)
  )
}

function getEmailAddress(value: string) {
  return value.match(/^[^<>]+<([^<>]+)>$/)?.[1]?.trim() ?? value
}

function hasCanonicalSender(environment: RuntimeEnvironment) {
  const sender = exactValue(environment, "CONTACT_FROM_EMAIL")
  const address = getEmailAddress(sender)
  return (
    !/[,;\r\n]/.test(sender) &&
    SINGLE_EMAIL_PATTERN.test(address) &&
    address.split("@").at(-1)?.toLowerCase() === CANONICAL_EMAIL_DOMAIN
  )
}

function hasExpectedStripeKeyMode(
  environment: RuntimeEnvironment,
  livemode: boolean
) {
  const key = exactValue(environment, "STRIPE_SECRET_KEY")
  return (
    STRIPE_SECRET_KEY.test(key) &&
    (livemode ? key.includes("_live_") : key.includes("_test_"))
  )
}

export function isCommerceRuntimeAuthorityConfigured(
  environment: RuntimeEnvironment
) {
  const target = getCommerceDeploymentTarget(environment)
  if (!target || exactValue(environment, "COMMERCE_SALES_READY") !== "true") {
    return false
  }

  const authority = CANONICAL_LAUNCH_AUTHORITY[target]
  const pdfStoragePath = exactValue(environment, "LIFT_PDF_STORAGE_PATH")
  const videoStoragePath = exactValue(environment, "LIFT_VIDEO_STORAGE_PATH")
  if (
    !getCanonicalSiteUrl(environment) ||
    !isCanonicalSupabaseAdminConfiguration(environment) ||
    getCanonicalStripeLivemode(environment) !== authority.stripeLivemode ||
    getCanonicalStripeAccountId(environment) !== authority.stripeAccountId ||
    getCanonicalStripeProductId(environment) !== authority.stripeProductId ||
    getCanonicalStripePriceId(environment) !== authority.stripePriceId ||
    !hasExpectedStripeKeyMode(environment, authority.stripeLivemode) ||
    !/^whsec_[a-zA-Z0-9_]+$/.test(
      exactValue(environment, "STRIPE_WEBHOOK_SECRET")
    ) ||
    !hasSafeStoragePath(pdfStoragePath) ||
    !hasSafeStoragePath(videoStoragePath) ||
    pdfStoragePath === videoStoragePath
  ) {
    return false
  }

  if (target !== "production") return true

  const cronSecret = exactValue(environment, "CRON_SECRET")
  const rateLimitSecret = exactValue(environment, "INQUIRY_RATE_LIMIT_SECRET")

  return (
    exactValue(environment, "COMMERCE_ALERT_TO_EMAIL").toLowerCase() ===
      CANONICAL_COMMERCE_ALERT_TO_EMAIL &&
    RESEND_API_KEY.test(exactValue(environment, "RESEND_API_KEY")) &&
    cronSecret.length >= 32 &&
    rateLimitSecret.length >= 32 &&
    cronSecret !== rateLimitSecret &&
    hasCanonicalSender(environment)
  )
}
