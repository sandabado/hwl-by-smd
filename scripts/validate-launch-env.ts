import {
  CANONICAL_CONTACT_TO_EMAIL,
  CANONICAL_COMMERCE_ALERT_TO_EMAIL,
  CANONICAL_EMAIL_DOMAIN,
  CANONICAL_LAUNCH_AUTHORITY,
  DEPLOYMENT_TARGETS as TARGETS,
  type DeploymentTarget as Target,
} from "../lib/commerce/launch-authority.ts"

const SALES_EXPECTATIONS = ["closed", "open"] as const

type SalesExpectation = (typeof SALES_EXPECTATIONS)[number]
const CANONICAL_CALCOM_PROFILE_URL = "https://cal.com/hwlbysmd"
const SINGLE_EMAIL_PATTERN =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/

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

if (
  process.env.HWL_DEPLOYMENT_TARGET &&
  process.env.HWL_DEPLOYMENT_TARGET !== explicitDeploymentTarget
) {
  console.error(
    "HWL_DEPLOYMENT_TARGET must not contain leading or trailing whitespace."
  )
  process.exit(1)
}

if (
  process.env.VERCEL_ENV &&
  process.env.VERCEL_ENV !== platformDeploymentTarget
) {
  console.error("VERCEL_ENV must not contain leading or trailing whitespace.")
  process.exit(1)
}
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
const whitespaceErrors = new Set<string>()

function read(key: string) {
  const rawValue = process.env[key]
  const value = rawValue?.trim()
  if (!value) return null

  if (rawValue !== value && !whitespaceErrors.has(key)) {
    whitespaceErrors.add(key)
    errors.push(`${key}: must not contain leading or trailing whitespace`)
  }

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
      ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname)
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
  const segments = value?.split("/") ?? []
  if (
    value &&
    (value.startsWith("/") ||
      segments.some(
        (segment) => !segment || segment === "." || segment === ".."
      ) ||
      !/^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/.test(value))
  ) {
    errors.push(`${key}: must be a safe bucket-relative object path`)
  }
  return value
}

const siteUrl = requireUrl("NEXT_PUBLIC_SITE_URL", {
  allowLocalHttp: target === "development",
})
if (target === "development" && siteUrl) {
  const localSiteUrl = new URL(siteUrl)
  const localHost = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(
    localSiteUrl.hostname
  )
  if (
    localSiteUrl.protocol !== "http:" ||
    !localHost ||
    localSiteUrl.pathname !== "/" ||
    localSiteUrl.search ||
    localSiteUrl.hash
  ) {
    errors.push(
      "NEXT_PUBLIC_SITE_URL: development must use a root localhost HTTP origin"
    )
  }
}
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
  const expectedProjectRef =
    CANONICAL_LAUNCH_AUTHORITY[target].supabaseProjectRef

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
  } else if (supabaseUrl !== CANONICAL_LAUNCH_AUTHORITY[target].supabaseUrl) {
    errors.push(
      `NEXT_PUBLIC_SUPABASE_URL: must use the exact canonical ${target} Supabase URL without a path, query, or fragment`
    )
  }
}

const liftPdfStoragePath = requireStoragePath("LIFT_PDF_STORAGE_PATH")
const liftVideoStoragePath = requireStoragePath("LIFT_VIDEO_STORAGE_PATH")
if (
  liftPdfStoragePath &&
  liftVideoStoragePath &&
  liftPdfStoragePath === liftVideoStoragePath
) {
  errors.push(
    "LIFT_VIDEO_STORAGE_PATH: must differ from LIFT_PDF_STORAGE_PATH so the complete bundle contains both assets"
  )
}

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

const adminClientMessagingReady = process.env.ADMIN_CLIENT_MESSAGING_READY
if (adminClientMessagingReady !== "false") {
  errors.push(
    "ADMIN_CLIENT_MESSAGING_READY: must be exactly false for this read-only launch candidate"
  )
}

const adminHandoffMode = read("ADMIN_SHANNON_HANDOFF_MODE")
const adminHandoffConfigurationKeys = [
  "ADMIN_SHANNON_HANDOFF_ACTOR_USER_ID",
  "ADMIN_SHANNON_HANDOFF_TARGET_USER_ID",
  "ADMIN_SHANNON_HANDOFF_APPROVAL_REFERENCE",
  "ADMIN_SHANNON_HANDOFF_EXPECTED_GIT_SHA",
] as const
const configuredAdminHandoffKeys = adminHandoffConfigurationKeys.filter((key) =>
  read(key)
)

if (
  adminHandoffMode !== null &&
  adminHandoffMode !== "disabled" &&
  adminHandoffMode !== "grant" &&
  adminHandoffMode !== "revoke"
) {
  errors.push(
    "ADMIN_SHANNON_HANDOFF_MODE: must be exactly disabled, grant, or revoke"
  )
}

if (!adminHandoffMode || adminHandoffMode === "disabled") {
  if (configuredAdminHandoffKeys.length > 0) {
    errors.push(
      "ADMIN_SHANNON_HANDOFF_MODE: disabled handoff must omit every pinned actor, target, approval, and SHA value"
    )
  }
} else if (adminHandoffMode === "grant" || adminHandoffMode === "revoke") {
  if (target !== "production" || salesExpectation !== "closed") {
    errors.push(
      "ADMIN_SHANNON_HANDOFF_MODE: role handoff is allowed only in a closed-sales Production candidate"
    )
  }
  if (
    process.env.VERCEL !== "1" ||
    process.env.VERCEL_ENV !== "production" ||
    process.env.NODE_ENV !== "production"
  ) {
    errors.push(
      "ADMIN_SHANNON_HANDOFF_MODE: role handoff requires the trusted Vercel Production runtime signals"
    )
  }

  const actorUserId = requirePattern(
    "ADMIN_SHANNON_HANDOFF_ACTOR_USER_ID",
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    "must be the exact lower-case Ghosthand Auth UUID"
  )
  const targetUserId = requirePattern(
    "ADMIN_SHANNON_HANDOFF_TARGET_USER_ID",
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    "must be the exact lower-case Shannon Auth UUID"
  )
  if (actorUserId && targetUserId && actorUserId === targetUserId) {
    errors.push(
      "ADMIN_SHANNON_HANDOFF_TARGET_USER_ID: must differ from the Ghosthand actor UUID"
    )
  }

  const approvalReference = requirePattern(
    "ADMIN_SHANNON_HANDOFF_APPROVAL_REFERENCE",
    /^[A-Za-z0-9][A-Za-z0-9._:/#-]{7,119}$/,
    "must be an 8-120 character non-secret approval reference"
  )
  if (
    approvalReference &&
    /(?:(?:sk|rk)_(?:live|test)_|whsec_|re_|sb_(?:secret|publishable)_|eyJ|gh[pousr]_|github_pat_|vercel_(?:token|access_token)|bearer[:_-])/i.test(
      approvalReference
    )
  ) {
    errors.push(
      "ADMIN_SHANNON_HANDOFF_APPROVAL_REFERENCE: must not contain a secret-shaped value"
    )
  }

  const expectedGitSha = requirePattern(
    "ADMIN_SHANNON_HANDOFF_EXPECTED_GIT_SHA",
    /^[0-9a-f]{40}$/,
    "must be the exact lower-case 40-character approved Git SHA"
  )
  const deployedGitSha = requirePattern(
    "VERCEL_GIT_COMMIT_SHA",
    /^[0-9a-f]{40}$/,
    "must be the exact lower-case 40-character deployed Git SHA"
  )
  if (expectedGitSha && deployedGitSha && expectedGitSha !== deployedGitSha) {
    errors.push(
      "ADMIN_SHANNON_HANDOFF_EXPECTED_GIT_SHA: must match VERCEL_GIT_COMMIT_SHA"
    )
  }
}

const cronSecret = requireValue("CRON_SECRET")
if (cronSecret && cronSecret.length < 32) {
  errors.push("CRON_SECRET: must contain at least 32 characters")
}
if (rateLimitSecret && cronSecret && rateLimitSecret === cronSecret) {
  errors.push("CRON_SECRET: must be distinct from INQUIRY_RATE_LIMIT_SECRET")
}

const contactDestination = requireEmail("CONTACT_TO_EMAIL")
if (
  contactDestination &&
  contactDestination.toLowerCase() !== CANONICAL_CONTACT_TO_EMAIL
) {
  errors.push(
    `CONTACT_TO_EMAIL: must use the canonical ${CANONICAL_CONTACT_TO_EMAIL} recipient`
  )
}
requireCanonicalSenderEmail("CONTACT_FROM_EMAIL")
const commerceAlertDestination = read("COMMERCE_ALERT_TO_EMAIL")
if (target === "production" && salesExpectation === "open") {
  const validatedCommerceAlertDestination = requireEmail(
    "COMMERCE_ALERT_TO_EMAIL"
  )
  if (
    validatedCommerceAlertDestination &&
    validatedCommerceAlertDestination.toLowerCase() !==
      CANONICAL_COMMERCE_ALERT_TO_EMAIL
  ) {
    errors.push(
      `COMMERCE_ALERT_TO_EMAIL: must use the canonical ${CANONICAL_COMMERCE_ALERT_TO_EMAIL} operations recipient`
    )
  }
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

const bookingLedgerReady = process.env.CALCOM_BOOKING_LEDGER_READY
if (bookingLedgerReady !== "true" && bookingLedgerReady !== "false") {
  errors.push("CALCOM_BOOKING_LEDGER_READY: must be exactly true or false")
}
const calcomWebhookSecret = read("CALCOM_WEBHOOK_SECRET")
if (bookingLedgerReady === "true" && !calcomWebhookSecret) {
  errors.push(
    "CALCOM_WEBHOOK_SECRET: required when the booking ledger is enabled"
  )
}
if (calcomWebhookSecret && calcomWebhookSecret.length < 32) {
  errors.push("CALCOM_WEBHOOK_SECRET: must contain at least 32 characters")
}
for (const [otherName, otherSecret] of [
  ["CRON_SECRET", cronSecret],
  ["INQUIRY_RATE_LIMIT_SECRET", rateLimitSecret],
] as const) {
  if (
    calcomWebhookSecret &&
    otherSecret &&
    calcomWebhookSecret === otherSecret
  ) {
    errors.push(`CALCOM_WEBHOOK_SECRET: must be distinct from ${otherName}`)
  }
}

if (
  target === "production" &&
  siteUrl !== CANONICAL_LAUNCH_AUTHORITY.production.siteUrl
) {
  errors.push(
    `NEXT_PUBLIC_SITE_URL: Production must use ${CANONICAL_LAUNCH_AUTHORITY.production.siteUrl}`
  )
}
if (
  target === "preview" &&
  siteUrl !== CANONICAL_LAUNCH_AUTHORITY.preview.siteUrl
) {
  errors.push(
    `NEXT_PUBLIC_SITE_URL: launch Preview must use ${CANONICAL_LAUNCH_AUTHORITY.preview.siteUrl} so Stripe can reach a stable non-Production webhook`
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
  if (
    stripeAccount &&
    stripeAccount !== CANONICAL_LAUNCH_AUTHORITY[target].stripeAccountId
  ) {
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

  if (
    productId &&
    productId !== CANONICAL_LAUNCH_AUTHORITY[target].stripeProductId
  ) {
    errors.push(
      `STRIPE_LIFT_PRODUCT_ID: does not match the verified canonical ${target} HWL Product`
    )
  }
  if (priceId && priceId !== CANONICAL_LAUNCH_AUTHORITY[target].stripePriceId) {
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
console.log(
  "Admin client messaging: read only (ADMIN_CLIENT_MESSAGING_READY=false)."
)
console.log(
  `Shannon administrator handoff: ${adminHandoffMode === "grant" || adminHandoffMode === "revoke" ? adminHandoffMode : "disabled"}.`
)
console.log(
  `Booking history: ${bookingLedgerReady === "true" ? "enabled" : "disabled"} (CALCOM_BOOKING_LEDGER_READY=${bookingLedgerReady}).`
)
for (const warning of warnings) console.warn(`- Warning: ${warning}`)
console.log(
  "Configuration shape only: provider objects, storage, webhooks, Cal.com availability, and end-to-end delivery still require live verification."
)
