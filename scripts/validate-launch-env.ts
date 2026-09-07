const TARGETS = ["development", "preview", "production"] as const
const SALES_EXPECTATIONS = ["closed", "open"] as const

type Target = (typeof TARGETS)[number]
type SalesExpectation = (typeof SALES_EXPECTATIONS)[number]

const CANONICAL_STRIPE_ACCOUNT = {
  development: "acct_1U9cEQAdcj2oNOF4",
  preview: "acct_1U9cEQAdcj2oNOF4",
  production: "acct_1U9cEIPTLuM8Maxa",
} satisfies Record<Target, string>

const CANONICAL_STRIPE_PRODUCT = {
  development: "prod_VACTsFboJAEOF0",
  preview: "prod_VACTsFboJAEOF0",
  production: "prod_VCotDELRoHDnox",
} satisfies Record<Target, string>
const CANONICAL_STRIPE_PRICE = {
  development: "price_1U9s49Adcj2oNOF4jcyMjyDB",
  preview: "price_1U9s49Adcj2oNOF4jcyMjyDB",
  production: "price_1UCPFjPTLuM8MaxaTY48RO9e",
} satisfies Record<Target, string>
const CANONICAL_PRODUCTION_URL = "https://www.hwlbysmd.com"
const CANONICAL_PREVIEW_URL = "https://preview.hwlbysmd.com"
const CANONICAL_CALCOM_PROFILE_URL = "https://cal.com/hwlbysmd"
const CANONICAL_EMAIL_DOMAIN = "hwlbysmd.com"
const SINGLE_EMAIL_PATTERN =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/
const CANONICAL_SUPABASE_PROJECT_REF = {
  development: "lkxppynmdfzljuptauxf",
  preview: "lkxppynmdfzljuptauxf",
  // Owner-approved dedicated Production project. Production must never
  // silently inherit the staging database.
  production: "qwprhsrwiihfllmgallr",
} satisfies Record<Target, string | null>

const PLACEHOLDERS = new Set([
  "[SENSITIVE]",
  "changeme",
  "null",
  "placeholder",
  "required",
  "todo",
  "undefined",
])

function option(name: string) {
  const prefix = `--${name}=`
  return process.argv
    .slice(2)
    .find((argument) => argument.startsWith(prefix))
    ?.slice(prefix.length)
    .trim()
}

function isTarget(value: string | undefined): value is Target {
  return TARGETS.includes(value as Target)
}

function isSalesExpectation(
  value: string | undefined
): value is SalesExpectation {
  return SALES_EXPECTATIONS.includes(value as SalesExpectation)
}

const cliTarget = option("target")
const explicitDeploymentTarget = process.env.HWL_DEPLOYMENT_TARGET?.trim()
const platformDeploymentTarget = process.env.VERCEL_ENV?.trim()
const requestedTarget =
  cliTarget ?? explicitDeploymentTarget ?? platformDeploymentTarget
const requestedSales =
  option("expect-sales") ??
  (requestedTarget
    ? process.env.COMMERCE_SALES_READY === "true"
      ? "open"
      : "closed"
    : undefined)
const requireExplicitTarget = process.argv.includes("--require-explicit-target")
const allowLocalSkip = process.argv.includes("--allow-local-skip")

if (explicitDeploymentTarget && !isTarget(explicitDeploymentTarget)) {
  console.error(
    "HWL_DEPLOYMENT_TARGET must be development, preview, or production."
  )
  process.exit(1)
}

if (platformDeploymentTarget && !isTarget(platformDeploymentTarget)) {
  console.error(
    "VERCEL_ENV must be development, preview, or production when present."
  )
  process.exit(1)
}

const targetSignals = [
  cliTarget,
  explicitDeploymentTarget,
  platformDeploymentTarget,
].filter(isTarget)

if (new Set(targetSignals).size > 1) {
  console.error(
    "Deployment target signals disagree; --target, HWL_DEPLOYMENT_TARGET, and VERCEL_ENV must identify the same environment."
  )
  process.exit(1)
}

if (requireExplicitTarget && !isTarget(explicitDeploymentTarget)) {
  console.error(
    "HWL_DEPLOYMENT_TARGET is required for every build so deployment identity never depends on optional platform system variables."
  )
  process.exit(1)
}

const platformBuildDetected =
  Boolean(platformDeploymentTarget) ||
  process.env.VERCEL === "1" ||
  /^(?:1|true)$/i.test(process.env.CI?.trim() ?? "")
const localBuildBypass = process.env.HWL_LOCAL_BUILD === "true"

if (
  localBuildBypass &&
  (explicitDeploymentTarget !== "development" || platformBuildDetected)
) {
  console.error(
    "HWL_LOCAL_BUILD may be true only for an explicitly identified local development build and must never be enabled in CI or Vercel."
  )
  process.exit(1)
}

if (allowLocalSkip && localBuildBypass) {
  console.log(
    "Launch provider preflight skipped for the explicitly identified local development build; run validate:launch-env for a full local audit."
  )
  process.exit(0)
}

if (!isTarget(requestedTarget)) {
  console.error(
    "Launch environment preflight requires --target=development, preview, or production."
  )
  process.exit(1)
}

if (!isSalesExpectation(requestedSales)) {
  console.error(
    "Launch environment preflight requires --expect-sales=closed or open."
  )
  process.exit(1)
}

const target = requestedTarget
const salesExpectation = requestedSales
const errors: string[] = []
const warnings: string[] = []

function read(key: string) {
  const value = process.env[key]?.trim()
  if (!value) return null

  const normalized = value.toLowerCase()
  if (PLACEHOLDERS.has(value) || PLACEHOLDERS.has(normalized)) return null
  if (normalized.startsWith("your_")) return null

  return value
}

function requireValue(key: string) {
  const value = read(key)
  if (!value) errors.push(`${key}: missing or placeholder value`)
  return value
}

function requirePattern(key: string, pattern: RegExp, description: string) {
  const value = requireValue(key)
  if (value && !pattern.test(value)) {
    errors.push(`${key}: ${description}`)
  }
  return value
}

function requireUrl(key: string, options: { allowLocalHttp?: boolean } = {}) {
  const value = requireValue(key)
  if (!value) return null

  try {
    const url = new URL(value)
    const localHttp =
      options.allowLocalHttp === true &&
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1", "::1"].includes(url.hostname)
    if (
      (url.protocol !== "https:" && !localHttp) ||
      url.username ||
      url.password
    ) {
      errors.push(
        `${key}: must be an HTTPS URL without embedded credentials${
          options.allowLocalHttp
            ? " (localhost HTTP is allowed in development)"
            : ""
        }`
      )
      return null
    }
    return url.toString().replace(/\/$/, "")
  } catch {
    errors.push(`${key}: must be a valid HTTPS URL`)
    return null
  }
}

function requireEmail(key: string) {
  const value = requireValue(key)
  if (!value) return null

  const address = value.match(/^[^<>]+<([^<>]+)>$/)?.[1]?.trim() ?? value
  if (/[,;\r\n]/.test(value) || !SINGLE_EMAIL_PATTERN.test(address)) {
    errors.push(`${key}: must contain a valid email address`)
  }
  return value
}

function requireCanonicalSenderEmail(key: string) {
  const value = requireEmail(key)
  if (!value) return null

  const address = value.match(/^[^<>]+<([^<>]+)>$/)?.[1]?.trim() ?? value
  const domain = address.split("@").at(-1)?.toLowerCase()
  if (domain !== CANONICAL_EMAIL_DOMAIN) {
    errors.push(
      `${key}: must use the owner-controlled ${CANONICAL_EMAIL_DOMAIN} sender domain`
    )
  }

  return value
}

function requireStoragePath(key: string) {
  const value = requireValue(key)
  if (
    value &&
    (value.startsWith("/") ||
      value.includes("..") ||
      !/^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/.test(value))
  ) {
    errors.push(`${key}: must be a safe bucket-relative object path`)
  }
  return value
}

const siteUrl = requireUrl("NEXT_PUBLIC_SITE_URL", {
  allowLocalHttp: target === "development",
})
const supabaseUrl = requireUrl("NEXT_PUBLIC_SUPABASE_URL")
const publicSupabaseKey = requirePattern(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  /^sb_publishable_[A-Za-z0-9_-]{16,}$/,
  "must use a modern sb_publishable_ key"
)
if (read("NEXT_PUBLIC_SUPABASE_ANON_KEY")) {
  errors.push(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY: legacy keys are forbidden; remove it and use NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  )
}

const serviceRoleKey = requirePattern(
  "SUPABASE_SERVICE_ROLE_KEY",
  /^sb_secret_[A-Za-z0-9_-]{16,}$/,
  "must use a modern sb_secret_ key"
)
if (serviceRoleKey && publicSupabaseKey === serviceRoleKey) {
  errors.push(
    "SUPABASE_SERVICE_ROLE_KEY: must differ from the browser publishable key"
  )
}
if (supabaseUrl) {
  const projectRef = new URL(supabaseUrl).hostname.match(
    /^([a-z0-9-]+)\.supabase\.co$/
  )?.[1]
  const expectedProjectRef = CANONICAL_SUPABASE_PROJECT_REF[target]

  if (!projectRef) {
    errors.push(
      "NEXT_PUBLIC_SUPABASE_URL: must use the exact approved hosted Supabase project domain"
    )
  } else if (!expectedProjectRef) {
    errors.push(
      "NEXT_PUBLIC_SUPABASE_URL: the canonical Production Supabase project has not been owner-approved"
    )
  } else if (projectRef !== expectedProjectRef) {
    errors.push(
      `NEXT_PUBLIC_SUPABASE_URL: does not match the canonical ${target} Supabase project`
    )
  }
}

requireStoragePath("LIFT_PDF_STORAGE_PATH")
requireStoragePath("LIFT_VIDEO_STORAGE_PATH")

const captionsPath = read("LIFT_VIDEO_CAPTIONS_STORAGE_PATH")
if (captionsPath) requireStoragePath("LIFT_VIDEO_CAPTIONS_STORAGE_PATH")

const rateLimitSecret = requireValue("INQUIRY_RATE_LIMIT_SECRET")
if (rateLimitSecret && rateLimitSecret.length < 32) {
  errors.push("INQUIRY_RATE_LIMIT_SECRET: must contain at least 32 characters")
}

const inquiryCollectionReady = process.env.NEXT_PUBLIC_INQUIRY_COLLECTION_READY
if (inquiryCollectionReady !== "true" && inquiryCollectionReady !== "false") {
  errors.push(
    "NEXT_PUBLIC_INQUIRY_COLLECTION_READY: must be exactly true or false"
  )
}

const cronSecret = requireValue("CRON_SECRET")
if (cronSecret && cronSecret.length < 32) {
  errors.push("CRON_SECRET: must contain at least 32 characters")
}
if (rateLimitSecret && cronSecret && rateLimitSecret === cronSecret) {
  errors.push("CRON_SECRET: must be distinct from INQUIRY_RATE_LIMIT_SECRET")
}

requireEmail("CONTACT_TO_EMAIL")
requireCanonicalSenderEmail("CONTACT_FROM_EMAIL")
const commerceAlertDestination = read("COMMERCE_ALERT_TO_EMAIL")
if (target === "production" && salesExpectation === "open") {
  requireEmail("COMMERCE_ALERT_TO_EMAIL")
} else if (commerceAlertDestination) {
  requireEmail("COMMERCE_ALERT_TO_EMAIL")
}
// DB-first persistence remains the runtime receipt boundary. For the launch
// candidate, however, Shannon explicitly chose Resend notifications, so the
// release preflight requires the provider configuration as a policy gate.
requirePattern(
  "RESEND_API_KEY",
  /^re_[a-zA-Z0-9_]+$/,
  "must be a Resend API key"
)

const rateLimitMaximum = read("INQUIRY_RATE_LIMIT_MAX")
if (rateLimitMaximum !== "5") {
  errors.push("INQUIRY_RATE_LIMIT_MAX: must be exactly 5")
}

const calcomProfile =
  read("CALCOM_PROFILE_URL") ?? read("NEXT_PUBLIC_CALCOM_URL")
if (calcomProfile) {
  try {
    const url = new URL(calcomProfile)
    const normalized = url.toString().replace(/\/$/, "")
    if (normalized !== CANONICAL_CALCOM_PROFILE_URL) {
      errors.push(
        `CALCOM_PROFILE_URL: must use the canonical ${CANONICAL_CALCOM_PROFILE_URL} profile`
      )
    }
  } catch {
    errors.push("CALCOM_PROFILE_URL: must be a valid URL")
  }
}

if (target === "production" && siteUrl !== CANONICAL_PRODUCTION_URL) {
  errors.push(
    `NEXT_PUBLIC_SITE_URL: Production must use ${CANONICAL_PRODUCTION_URL}`
  )
}
if (target === "preview" && siteUrl !== CANONICAL_PREVIEW_URL) {
  errors.push(
    `NEXT_PUBLIC_SITE_URL: launch Preview must use ${CANONICAL_PREVIEW_URL} so Stripe can reach a stable non-Production webhook`
  )
}

const salesReady = read("COMMERCE_SALES_READY")
const expectedSalesReady = salesExpectation === "open" ? "true" : "false"
if (salesReady !== expectedSalesReady) {
  errors.push(
    `COMMERCE_SALES_READY: expected ${expectedSalesReady} for this preflight`
  )
}

const expectedLivemode = target === "production" ? "true" : "false"
const stripeLivemode = requireValue("STRIPE_LIVEMODE")
if (stripeLivemode !== expectedLivemode) {
  errors.push(`STRIPE_LIVEMODE: ${target} requires ${expectedLivemode}`)
}

const stripeProviderKeys = [
  "STRIPE_ACCOUNT_ID",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_LIFT_PRODUCT_ID",
  "STRIPE_LIFT_GUIDE_PRICE_ID",
] as const
const configuredStripeProviderKeys = stripeProviderKeys.filter((key) =>
  read(key)
)
const mustValidateStripeProvider =
  salesExpectation === "open" || configuredStripeProviderKeys.length > 0

if (mustValidateStripeProvider) {
  if (
    salesExpectation === "closed" &&
    configuredStripeProviderKeys.length !== stripeProviderKeys.length
  ) {
    errors.push(
      "Stripe provider configuration: closed sales must omit all provider variables or install one complete coherent target-mode set"
    )
  }

  const stripeAccount = requirePattern(
    "STRIPE_ACCOUNT_ID",
    /^acct_[a-zA-Z0-9]{8,}$/,
    "must be a Stripe acct_ identifier"
  )
  if (stripeAccount && stripeAccount !== CANONICAL_STRIPE_ACCOUNT[target]) {
    errors.push(
      `STRIPE_ACCOUNT_ID: does not match the canonical ${target} HWL account`
    )
  }

  const stripeKey = requirePattern(
    "STRIPE_SECRET_KEY",
    /^(?:sk|rk)_(?:test|live)_[a-zA-Z0-9_]+$/,
    "must be a Stripe secret or restricted key"
  )
  const requiredKeyMode = target === "production" ? "_live_" : "_test_"
  if (stripeKey && !stripeKey.includes(requiredKeyMode)) {
    errors.push(`STRIPE_SECRET_KEY: mode does not match ${target}`)
  }

  requirePattern(
    "STRIPE_WEBHOOK_SECRET",
    /^whsec_[a-zA-Z0-9_]+$/,
    "must be a Stripe webhook signing secret"
  )
  const productId = requirePattern(
    "STRIPE_LIFT_PRODUCT_ID",
    /^prod_[a-zA-Z0-9]{8,}$/,
    "must be a Stripe prod_ identifier"
  )
  const priceId = requirePattern(
    "STRIPE_LIFT_GUIDE_PRICE_ID",
    /^price_[a-zA-Z0-9]{8,}$/,
    "must be a Stripe price_ identifier"
  )

  if (productId && productId !== CANONICAL_STRIPE_PRODUCT[target]) {
    errors.push(
      `STRIPE_LIFT_PRODUCT_ID: does not match the verified canonical ${target} HWL Product`
    )
  }
  if (priceId && priceId !== CANONICAL_STRIPE_PRICE[target]) {
    errors.push(
      `STRIPE_LIFT_GUIDE_PRICE_ID: does not match the verified canonical ${target} HWL Price`
    )
  }
}

if (!captionsPath) {
  warnings.push(
    "LIFT_VIDEO_CAPTIONS_STORAGE_PATH is optional for checkout but remains an accessibility follow-up."
  )
}
if (!calcomProfile) {
  warnings.push(
    "CALCOM_PROFILE_URL is unset; the application will use its canonical hwlbysmd fallback."
  )
}

if (errors.length) {
  console.error(
    `Launch environment preflight failed for ${target} (${salesExpectation} sales):`
  )
  for (const error of errors) console.error(`- ${error}`)
  for (const warning of warnings) console.warn(`- Warning: ${warning}`)
  process.exit(1)
}

console.log(
  `Launch environment preflight passed for ${target} (${salesExpectation} sales).`
)
console.log(
  `Inquiry collection: ${inquiryCollectionReady === "true" ? "open" : "closed"} (NEXT_PUBLIC_INQUIRY_COLLECTION_READY=${inquiryCollectionReady}).`
)
for (const warning of warnings) console.warn(`- Warning: ${warning}`)
console.log(
  "Configuration shape only: provider objects, storage, webhooks, Cal.com availability, and end-to-end delivery still require live verification."
)
