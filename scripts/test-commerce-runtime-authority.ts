import assert from "node:assert/strict"
import test from "node:test"

import {
  CANONICAL_LAUNCH_AUTHORITY,
  getCanonicalStripeAccountId,
  getCanonicalStripeLivemode,
  getCanonicalStripePriceId,
  getCanonicalStripeProductId,
  getCanonicalSiteUrl,
  getCommerceDeploymentTarget,
  getDeploymentTargetBoundary,
  isCanonicalSupabaseAdminConfiguration,
  isCanonicalSupabasePublicConfiguration,
  isCanonicalSupabaseRuntime,
  isCommerceRuntimeAuthorityConfigured,
} from "../lib/commerce/launch-authority.ts"
import {
  getCommerceDeploymentTarget as getRuntimeCommerceDeploymentTarget,
  getExpectedStripeAccountId,
  getExpectedStripeLivemode,
  getPriceId,
  getProductId,
  isProductCheckoutReady,
  isStripeModeConfigured,
} from "../lib/stripe.ts"

const productionEnvironment = {
  COMMERCE_ALERT_TO_EMAIL: "admin@ghosthand.studio",
  COMMERCE_SALES_READY: "true",
  CONTACT_FROM_EMAIL: "HWL by SMD <hello@hwlbysmd.com>",
  CRON_SECRET: "fixture-cron-secret-32-characters-minimum",
  HWL_DEPLOYMENT_TARGET: "production",
  INQUIRY_RATE_LIMIT_SECRET: "fixture-inquiry-secret-32-characters-minimum",
  LIFT_PDF_STORAGE_PATH: "lift/lift-guide.pdf",
  LIFT_VIDEO_STORAGE_PATH: "lift/complete-lift-v1.mp4",
  NEXT_PUBLIC_SITE_URL: "https://www.hwlbysmd.com",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_fixture_public_value",
  NEXT_PUBLIC_SUPABASE_URL: "https://qwprhsrwiihfllmgallr.supabase.co",
  NODE_ENV: "production",
  RESEND_API_KEY: "re_fixture_private_value",
  STRIPE_ACCOUNT_ID: "acct_1U9cEIPTLuM8Maxa",
  STRIPE_LIFT_GUIDE_PRICE_ID: "price_1UCPFjPTLuM8MaxaTY48RO9e",
  STRIPE_LIFT_PRODUCT_ID: "prod_VCotDELRoHDnox",
  STRIPE_LIVEMODE: "true",
  STRIPE_SECRET_KEY: "sk_live_fixture_private_value",
  STRIPE_WEBHOOK_SECRET: "whsec_fixture_private_value",
  SUPABASE_SERVICE_ROLE_KEY: "sb_secret_fixture_private_value",
  VERCEL: "1",
  VERCEL_ENV: "production",
} as const

test("canonical Production runtime authority opens only the one LIFT catalog", () => {
  assert.equal(getCommerceDeploymentTarget(productionEnvironment), "production")
  assert.equal(getCanonicalStripeLivemode(productionEnvironment), true)
  assert.equal(
    getCanonicalStripeAccountId(productionEnvironment),
    CANONICAL_LAUNCH_AUTHORITY.production.stripeAccountId
  )
  assert.equal(
    getCanonicalStripeProductId(productionEnvironment),
    CANONICAL_LAUNCH_AUTHORITY.production.stripeProductId
  )
  assert.equal(
    getCanonicalStripePriceId(productionEnvironment),
    CANONICAL_LAUNCH_AUTHORITY.production.stripePriceId
  )
  assert.equal(isCanonicalSupabaseRuntime(productionEnvironment), true)
  assert.equal(
    getCanonicalSiteUrl(productionEnvironment),
    CANONICAL_LAUNCH_AUTHORITY.production.siteUrl
  )
  assert.equal(
    isCanonicalSupabasePublicConfiguration(productionEnvironment),
    true
  )
  assert.equal(
    isCanonicalSupabaseAdminConfiguration(productionEnvironment),
    true
  )
  assert.equal(
    isCommerceRuntimeAuthorityConfigured(productionEnvironment),
    true
  )
})

test("Supabase public and admin authority reject legacy, placeholder, and crossed keys", () => {
  assert.equal(
    isCanonicalSupabasePublicConfiguration({
      ...productionEnvironment,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_",
    }),
    false
  )
  assert.equal(
    isCanonicalSupabasePublicConfiguration({
      ...productionEnvironment,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "legacy-anon",
    }),
    false
  )
  assert.equal(
    isCanonicalSupabaseAdminConfiguration({
      ...productionEnvironment,
      SUPABASE_SERVICE_ROLE_KEY:
        productionEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    }),
    false
  )
  assert.equal(
    isCanonicalSupabaseAdminConfiguration({
      ...productionEnvironment,
      NEXT_PUBLIC_SUPABASE_URL: CANONICAL_LAUNCH_AUTHORITY.preview.supabaseUrl,
    }),
    false
  )
  assert.equal(
    isCanonicalSupabasePublicConfiguration(
      {
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          productionEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      },
      { allowUnscopedLocal: true }
    ),
    false
  )
  assert.equal(
    isCanonicalSupabasePublicConfiguration(
      {
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          productionEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
      },
      { allowUnscopedLocal: true }
    ),
    false
  )
  assert.equal(
    isCanonicalSupabasePublicConfiguration(
      {
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          productionEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      },
      { allowUnscopedLocal: true }
    ),
    true
  )
  assert.equal(
    getDeploymentTargetBoundary({
      HWL_DEPLOYMENT_TARGET: " development ",
    }),
    null
  )
})

const authorityDriftCases = [
  ["COMMERCE_SALES_READY", " true "],
  ["COMMERCE_ALERT_TO_EMAIL", "operator@example.com"],
  ["CONTACT_FROM_EMAIL", "HWL by SMD <hello@example.com>"],
  ["CRON_SECRET", "too-short"],
  ["CRON_SECRET", productionEnvironment.INQUIRY_RATE_LIMIT_SECRET],
  ["INQUIRY_RATE_LIMIT_SECRET", "too-short"],
  ["HWL_DEPLOYMENT_TARGET", " production "],
  ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "legacy-anon-key-must-be-absent"],
  ["NEXT_PUBLIC_SUPABASE_ANON_KEY", " legacy-anon-key-must-be-absent "],
  ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_"],
  ["NEXT_PUBLIC_SITE_URL", "https://attacker.example"],
  ["NEXT_PUBLIC_SITE_URL", " https://www.hwlbysmd.com"],
  ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "eyJ_legacy_anon"],
  ["NEXT_PUBLIC_SUPABASE_URL", "https://lkxppynmdfzljuptauxf.supabase.co"],
  ["RESEND_API_KEY", "missing-provider-prefix"],
  ["RESEND_API_KEY", "re_"],
  ["STRIPE_ACCOUNT_ID", "acct_1WrongButWellShaped"],
  ["STRIPE_LIFT_GUIDE_PRICE_ID", "price_1WrongButWellShaped"],
  ["STRIPE_LIFT_PRODUCT_ID", "prod_1WrongButWellShaped"],
  ["STRIPE_LIVEMODE", "false"],
  ["STRIPE_LIVEMODE", "true "],
  ["STRIPE_SECRET_KEY", "sk_test_wrong_mode"],
  ["STRIPE_SECRET_KEY", "sk_live_"],
  ["STRIPE_WEBHOOK_SECRET", "missing-webhook-prefix"],
  ["STRIPE_WEBHOOK_SECRET", "whsec_fixture_private_value "],
  ["SUPABASE_SERVICE_ROLE_KEY", "eyJ_legacy_service_role"],
  ["SUPABASE_SERVICE_ROLE_KEY", "sb_secret_"],
  ["LIFT_PDF_STORAGE_PATH", "../lift-guide.pdf"],
  ["LIFT_PDF_STORAGE_PATH", "placeholder"],
  ["LIFT_PDF_STORAGE_PATH", "lift/./lift-guide.pdf"],
  ["LIFT_PDF_STORAGE_PATH", "lift//lift-guide.pdf"],
  ["LIFT_VIDEO_STORAGE_PATH", "/lift/complete-lift-v1.mp4"],
  ["LIFT_VIDEO_STORAGE_PATH", "todo"],
  ["LIFT_VIDEO_STORAGE_PATH", productionEnvironment.LIFT_PDF_STORAGE_PATH],
  ["VERCEL_ENV", "preview"],
  ["VERCEL_ENV", " production "],
] as const

for (const [key, value] of authorityDriftCases) {
  test(`Production runtime fails closed when ${key} drifts`, () => {
    assert.equal(
      isCommerceRuntimeAuthorityConfigured({
        ...productionEnvironment,
        [key]: value,
      }),
      false
    )
  })
}

test("a runtime-only sales override cannot bypass missing operations authority", () => {
  const closedBuildEnvironment: Record<string, string | undefined> = {
    ...productionEnvironment,
  }
  delete closedBuildEnvironment.COMMERCE_ALERT_TO_EMAIL
  delete closedBuildEnvironment.CRON_SECRET
  delete closedBuildEnvironment.RESEND_API_KEY

  assert.equal(
    isCommerceRuntimeAuthorityConfigured({
      ...closedBuildEnvironment,
      COMMERCE_SALES_READY: "true",
    }),
    false
  )
})

test("closed sales remain closed even when every provider authority matches", () => {
  assert.equal(
    isCommerceRuntimeAuthorityConfigured({
      ...productionEnvironment,
      COMMERCE_SALES_READY: "false",
    }),
    false
  )
})

test("Preview retains its exact sandbox and staging authority", () => {
  const previewEnvironment = {
    ...productionEnvironment,
    COMMERCE_ALERT_TO_EMAIL: "",
    HWL_DEPLOYMENT_TARGET: "preview",
    NEXT_PUBLIC_SITE_URL: "https://preview.hwlbysmd.com",
    NEXT_PUBLIC_SUPABASE_URL: "https://lkxppynmdfzljuptauxf.supabase.co",
    NODE_ENV: "production",
    STRIPE_ACCOUNT_ID: "acct_1U9cEQAdcj2oNOF4",
    STRIPE_LIFT_GUIDE_PRICE_ID: "price_1U9s49Adcj2oNOF4jcyMjyDB",
    STRIPE_LIFT_PRODUCT_ID: "prod_VACTsFboJAEOF0",
    STRIPE_LIVEMODE: "false",
    STRIPE_SECRET_KEY: "sk_test_fixture_private_value",
    VERCEL_ENV: "preview",
  }

  assert.equal(getCommerceDeploymentTarget(previewEnvironment), "preview")
  assert.equal(isCommerceRuntimeAuthorityConfigured(previewEnvironment), true)
  assert.equal(
    isCommerceRuntimeAuthorityConfigured({
      ...previewEnvironment,
      STRIPE_ACCOUNT_ID: productionEnvironment.STRIPE_ACCOUNT_ID,
    }),
    false
  )
})

test("the checkout runtime is wired to the canonical authority boundary", () => {
  const originalEnvironment = new Map(
    Object.keys(productionEnvironment).map((key) => [key, process.env[key]])
  )

  try {
    Object.assign(process.env, productionEnvironment)

    assert.equal(getRuntimeCommerceDeploymentTarget(), "production")
    assert.equal(
      getExpectedStripeAccountId(),
      CANONICAL_LAUNCH_AUTHORITY.production.stripeAccountId
    )
    assert.equal(
      getProductId("lift_guide"),
      CANONICAL_LAUNCH_AUTHORITY.production.stripeProductId
    )
    assert.equal(
      getPriceId("lift_guide"),
      CANONICAL_LAUNCH_AUTHORITY.production.stripePriceId
    )
    assert.equal(isProductCheckoutReady("lift_guide"), true)
    assert.equal(isProductCheckoutReady("pdf_download"), false)
    assert.equal(isProductCheckoutReady("membership"), false)

    process.env.COMMERCE_SALES_READY = "false"
    assert.equal(getRuntimeCommerceDeploymentTarget(), "production")
    assert.equal(getExpectedStripeLivemode(), true)
    assert.equal(
      getExpectedStripeAccountId(),
      CANONICAL_LAUNCH_AUTHORITY.production.stripeAccountId
    )
    assert.equal(
      getProductId("lift_guide"),
      CANONICAL_LAUNCH_AUTHORITY.production.stripeProductId
    )
    assert.equal(
      getPriceId("lift_guide"),
      CANONICAL_LAUNCH_AUTHORITY.production.stripePriceId
    )
    assert.equal(isStripeModeConfigured(), true)
    assert.equal(isProductCheckoutReady("lift_guide"), false)

    process.env.COMMERCE_SALES_READY = "true"

    process.env.STRIPE_ACCOUNT_ID = "acct_1WrongButWellShaped"
    assert.equal(getExpectedStripeAccountId(), null)
    assert.equal(isProductCheckoutReady("lift_guide"), false)

    process.env.STRIPE_ACCOUNT_ID = productionEnvironment.STRIPE_ACCOUNT_ID
    delete process.env.RESEND_API_KEY
    assert.equal(isProductCheckoutReady("lift_guide"), false)
  } finally {
    for (const [key, value] of originalEnvironment) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
})
