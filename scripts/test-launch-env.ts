import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const validatorPath = fileURLToPath(
  new URL("./validate-launch-env.ts", import.meta.url)
)

const sharedFixtureSecrets = {
  CRON_SECRET: "fixture-cron-secret-32-characters-minimum",
  INQUIRY_RATE_LIMIT_SECRET: "fixture-inquiry-secret-32-characters-minimum",
  RESEND_API_KEY: "re_fixture_private_value",
  SUPABASE_SERVICE_ROLE_KEY: "sb_secret_fixture_private_value",
} as const

const stripeFixtureSecrets = {
  STRIPE_SECRET_KEY: "sk_test_fixture_private_value",
  STRIPE_WEBHOOK_SECRET: "whsec_fixture_private_value",
} as const

const legacySupabaseFixtureSecrets = {
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    "eyJ_fixture_legacy_anon_key_must_never_be_accepted",
  SUPABASE_SERVICE_ROLE_KEY:
    "eyJ_fixture_legacy_service_role_must_never_be_accepted",
} as const

const STAGING_SUPABASE_URL = "https://lkxppynmdfzljuptauxf.supabase.co"
const PRODUCTION_SUPABASE_URL = "https://qwprhsrwiihfllmgallr.supabase.co"
const HANDOFF_ACTOR_ID = "d41943f5-133d-47e1-b2fe-c105762207e9"
const HANDOFF_TARGET_ID = "5fa5e8b3-2579-400d-a98c-43ea5f4bb9c6"
const HANDOFF_GIT_SHA = "1039e0e2d6c58f2f4eba19036bf03f9c736227b5"

const developmentFixture: NodeJS.ProcessEnv = {
  ADMIN_CLIENT_MESSAGING_READY: "false",
  CALCOM_BOOKING_LEDGER_READY: "false",
  CALCOM_PROFILE_URL: "https://cal.com/hwlbysmd",
  COMMERCE_SALES_READY: "false",
  CONTACT_FROM_EMAIL: "HWL by SMD <hello@hwlbysmd.com>",
  CONTACT_TO_EMAIL: "shannon@hwlbysmd.com",
  HWL_DEPLOYMENT_TARGET: "development",
  INQUIRY_RATE_LIMIT_MAX: "5",
  LIFT_PDF_STORAGE_PATH: "lift/lift-guide.pdf",
  LIFT_VIDEO_STORAGE_PATH: "lift/complete-lift-v1.mp4",
  NEXT_PUBLIC_INQUIRY_COLLECTION_READY: "false",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_fixture_public_value",
  NEXT_PUBLIC_SUPABASE_URL: STAGING_SUPABASE_URL,
  NODE_ENV: "development",
  STRIPE_LIVEMODE: "false",
  ...sharedFixtureSecrets,
}

type Fixture = {
  args?: string[]
  env: NodeJS.ProcessEnv
  expectedExit: 0 | 1
  expectedText: string
  name: string
  unexpectedText?: string[]
}

const previewFixture: NodeJS.ProcessEnv = {
  ...developmentFixture,
  HWL_DEPLOYMENT_TARGET: "preview",
  NEXT_PUBLIC_SITE_URL: "https://preview.hwlbysmd.com",
  VERCEL: "1",
  VERCEL_ENV: "preview",
}

const previewStripeFixture: NodeJS.ProcessEnv = {
  ...previewFixture,
  COMMERCE_SALES_READY: "true",
  STRIPE_ACCOUNT_ID: "acct_1U9cEQAdcj2oNOF4",
  STRIPE_LIFT_GUIDE_PRICE_ID: "price_1U9s49Adcj2oNOF4jcyMjyDB",
  STRIPE_LIFT_PRODUCT_ID: "prod_VACTsFboJAEOF0",
  ...stripeFixtureSecrets,
}

const productionFixture: NodeJS.ProcessEnv = {
  ...previewFixture,
  HWL_DEPLOYMENT_TARGET: "production",
  NEXT_PUBLIC_SITE_URL: "https://www.hwlbysmd.com",
  NEXT_PUBLIC_SUPABASE_URL: PRODUCTION_SUPABASE_URL,
  STRIPE_LIVEMODE: "true",
  VERCEL_ENV: "production",
}

const productionStripeFixture: NodeJS.ProcessEnv = {
  ...productionFixture,
  COMMERCE_ALERT_TO_EMAIL: "admin@ghosthand.studio",
  COMMERCE_SALES_READY: "true",
  STRIPE_ACCOUNT_ID: "acct_1U9cEIPTLuM8Maxa",
  STRIPE_LIFT_GUIDE_PRICE_ID: "price_1UCPFjPTLuM8MaxaTY48RO9e",
  STRIPE_LIFT_PRODUCT_ID: "prod_VCotDELRoHDnox",
  STRIPE_SECRET_KEY: "sk_live_fixture_private_value",
  STRIPE_WEBHOOK_SECRET: "whsec_fixture_private_value",
}

const productionClosedStripeFixture: NodeJS.ProcessEnv = {
  ...productionStripeFixture,
  COMMERCE_SALES_READY: "false",
}

const fixtures: Fixture[] = [
  {
    args: ["--target=development", "--expect-sales=closed"],
    env: developmentFixture,
    expectedExit: 0,
    expectedText:
      "Launch environment preflight passed for development (closed sales).",
    name: "development closed",
  },
  {
    args: ["--target=development", "--expect-sales=closed"],
    env: {
      ...developmentFixture,
      NEXT_PUBLIC_SITE_URL: "https://development.example.com",
    },
    expectedExit: 1,
    expectedText:
      "NEXT_PUBLIC_SITE_URL: development must use a root localhost HTTP origin",
    name: "development rejects remote HTTPS origins",
  },
  {
    args: ["--target=development", "--expect-sales=closed"],
    env: {
      ...developmentFixture,
      NEXT_PUBLIC_SITE_URL: "http://[::1]:3000",
    },
    expectedExit: 0,
    expectedText:
      "Launch environment preflight passed for development (closed sales).",
    name: "development accepts IPv6 localhost",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: previewFixture,
    expectedExit: 0,
    expectedText: "Inquiry collection: closed",
    name: "preview closed without Stripe provider values",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: {
      ...previewFixture,
      CONTACT_TO_EMAIL: "other@example.com",
    },
    expectedExit: 1,
    expectedText:
      "CONTACT_TO_EMAIL: must use the canonical shannon@hwlbysmd.com recipient",
    name: "unapproved inquiry recipient fails",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: {
      ...previewFixture,
      ADMIN_CLIENT_MESSAGING_READY: "true",
    },
    expectedExit: 1,
    expectedText:
      "ADMIN_CLIENT_MESSAGING_READY: must be exactly false for this read-only launch candidate",
    name: "Preview rejects dormant admin message writes",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: {
      ...previewFixture,
      ADMIN_CLIENT_MESSAGING_READY: "",
    },
    expectedExit: 1,
    expectedText:
      "ADMIN_CLIENT_MESSAGING_READY: must be exactly false for this read-only launch candidate",
    name: "Preview requires an explicit admin message-write denial",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: {
      ...previewFixture,
      NEXT_PUBLIC_INQUIRY_COLLECTION_READY: "true",
    },
    expectedExit: 0,
    expectedText: "Inquiry collection: open",
    name: "preview inquiry collection explicitly open",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: {
      ...previewFixture,
      NEXT_PUBLIC_INQUIRY_COLLECTION_READY: "",
    },
    expectedExit: 1,
    expectedText:
      "NEXT_PUBLIC_INQUIRY_COLLECTION_READY: must be exactly true or false",
    name: "missing inquiry collection flag fails",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: {
      ...previewFixture,
      NEXT_PUBLIC_INQUIRY_COLLECTION_READY: "TRUE",
    },
    expectedExit: 1,
    expectedText:
      "NEXT_PUBLIC_INQUIRY_COLLECTION_READY: must be exactly true or false",
    name: "uppercase inquiry collection flag fails",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: {
      ...previewFixture,
      CALCOM_BOOKING_LEDGER_READY: "true",
    },
    expectedExit: 1,
    expectedText:
      "CALCOM_WEBHOOK_SECRET: required when the booking ledger is enabled",
    name: "enabled booking ledger without a webhook secret fails",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: {
      ...previewFixture,
      CALCOM_BOOKING_LEDGER_READY: "true",
      CALCOM_WEBHOOK_SECRET: "fixture-calcom-webhook-secret-32-characters",
    },
    expectedExit: 0,
    expectedText: "Booking history: enabled",
    name: "enabled booking ledger requires its private webhook secret",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: {
      ...previewFixture,
      NEXT_PUBLIC_INQUIRY_COLLECTION_READY: " true ",
    },
    expectedExit: 1,
    expectedText:
      "NEXT_PUBLIC_INQUIRY_COLLECTION_READY: must be exactly true or false",
    name: "whitespace-padded inquiry collection flag fails",
  },
  {
    args: ["--target=preview", "--expect-sales=open"],
    env: previewStripeFixture,
    expectedExit: 0,
    expectedText:
      "Launch environment preflight passed for preview (open sales).",
    name: "preview sandbox open",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: {
      ...previewFixture,
      COMMERCE_ALERT_TO_EMAIL: "not-an-email",
    },
    expectedExit: 1,
    expectedText: "COMMERCE_ALERT_TO_EMAIL: must contain a valid email address",
    name: "invalid optional commerce alert destination fails",
  },
  {
    args: ["--target=production", "--expect-sales=open"],
    env: {
      ...productionStripeFixture,
      COMMERCE_ALERT_TO_EMAIL: "operator@example.com,broken",
    },
    expectedExit: 1,
    expectedText: "COMMERCE_ALERT_TO_EMAIL: must contain a valid email address",
    name: "Production open sales reject a malformed recipient list",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: {
      ...previewFixture,
      NEXT_PUBLIC_SITE_URL: "https://preview.howlbysmd.com",
    },
    expectedExit: 1,
    expectedText:
      "NEXT_PUBLIC_SITE_URL: launch Preview must use https://preview.hwlbysmd.com",
    name: "retired Preview domain fails",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: {
      ...previewFixture,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        legacySupabaseFixtureSecrets.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    expectedExit: 1,
    expectedText: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: missing",
    name: "legacy browser fallback fails",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: {
      ...previewFixture,
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        legacySupabaseFixtureSecrets.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    expectedExit: 1,
    expectedText: "NEXT_PUBLIC_SUPABASE_ANON_KEY: legacy keys are forbidden",
    name: "legacy browser shadow fails",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: {
      ...previewFixture,
      SUPABASE_SERVICE_ROLE_KEY:
        legacySupabaseFixtureSecrets.SUPABASE_SERVICE_ROLE_KEY,
    },
    expectedExit: 1,
    expectedText: "SUPABASE_SERVICE_ROLE_KEY: must use a modern sb_secret_ key",
    name: "legacy server key fails",
  },
  {
    args: ["--require-explicit-target", "--expect-sales=closed"],
    env: { ...developmentFixture, HWL_DEPLOYMENT_TARGET: "" },
    expectedExit: 1,
    expectedText: "HWL_DEPLOYMENT_TARGET is required for every build",
    name: "missing explicit target fails",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: { ...previewFixture, VERCEL_ENV: "production" },
    expectedExit: 1,
    expectedText: "Deployment target signals disagree",
    name: "target mismatch fails",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: {
      ...previewFixture,
      STRIPE_ACCOUNT_ID: "acct_1U9cEQAdcj2oNOF4",
    },
    expectedExit: 1,
    expectedText:
      "closed sales must omit all provider variables or install one complete coherent target-mode set",
    name: "partial Stripe set fails",
  },
  {
    args: ["--target=preview", "--expect-sales=open"],
    env: {
      ...previewStripeFixture,
      STRIPE_SECRET_KEY: "sk_live_fixture_private_value",
    },
    expectedExit: 1,
    expectedText: "STRIPE_SECRET_KEY: mode does not match preview",
    name: "live Stripe key in Preview fails",
  },
  {
    args: ["--target=preview", "--expect-sales=open"],
    env: {
      ...previewStripeFixture,
      STRIPE_ACCOUNT_ID: "acct_wrongPreviewAccount",
    },
    expectedExit: 1,
    expectedText:
      "STRIPE_ACCOUNT_ID: does not match the canonical preview HWL account",
    name: "wrong Preview Stripe account fails",
  },
  {
    args: ["--target=preview", "--expect-sales=open"],
    env: {
      ...previewStripeFixture,
      STRIPE_LIFT_GUIDE_PRICE_ID: "price_wrongPreviewPrice",
    },
    expectedExit: 1,
    expectedText:
      "STRIPE_LIFT_GUIDE_PRICE_ID: does not match the verified canonical preview HWL Price",
    name: "wrong Preview Stripe price fails",
  },
  {
    args: ["--target=preview", "--expect-sales=open"],
    env: {
      ...previewStripeFixture,
      STRIPE_LIFT_PRODUCT_ID: "prod_wrongPreviewProduct",
    },
    expectedExit: 1,
    expectedText:
      "STRIPE_LIFT_PRODUCT_ID: does not match the verified canonical preview HWL Product",
    name: "wrong Preview Stripe product fails",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: { ...previewFixture, RESEND_API_KEY: "" },
    expectedExit: 1,
    expectedText: "RESEND_API_KEY: missing or placeholder value",
    name: "missing Resend key fails",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: { ...previewFixture, CRON_SECRET: "" },
    expectedExit: 1,
    expectedText: "CRON_SECRET: missing or placeholder value",
    name: "missing cron secret fails",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: { ...previewFixture, CRON_SECRET: "too-short" },
    expectedExit: 1,
    expectedText: "CRON_SECRET: must contain at least 32 characters",
    name: "short cron secret fails",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: {
      ...previewFixture,
      CRON_SECRET: sharedFixtureSecrets.INQUIRY_RATE_LIMIT_SECRET,
    },
    expectedExit: 1,
    expectedText:
      "CRON_SECRET: must be distinct from INQUIRY_RATE_LIMIT_SECRET",
    name: "shared cron and inquiry secrets fail",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: { ...previewFixture, INQUIRY_RATE_LIMIT_MAX: "6" },
    expectedExit: 1,
    expectedText: "INQUIRY_RATE_LIMIT_MAX: must be exactly 5",
    name: "unapproved inquiry submission limit fails",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: { ...previewFixture, INQUIRY_RATE_LIMIT_MAX: "" },
    expectedExit: 1,
    expectedText: "INQUIRY_RATE_LIMIT_MAX: must be exactly 5",
    name: "missing inquiry submission limit fails",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: {
      ...previewFixture,
      CONTACT_FROM_EMAIL: "HWL by SMD <hello@example.com>",
    },
    expectedExit: 1,
    expectedText:
      "CONTACT_FROM_EMAIL: must use the owner-controlled hwlbysmd.com sender domain",
    name: "unapproved sender domain fails",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: {
      ...previewFixture,
      CONTACT_FROM_EMAIL: "HWL by SMD <hello@howlbysmd.com>",
    },
    expectedExit: 1,
    expectedText:
      "CONTACT_FROM_EMAIL: must use the owner-controlled hwlbysmd.com sender domain",
    name: "retired sender domain fails",
  },
  ...[
    "https://howlbysmd.com",
    "https://www.howlbysmd.com",
    "https://hwlbysmd.com",
  ].map((siteUrl): Fixture => ({
    args: ["--target=production", "--expect-sales=open"],
    env: { ...productionStripeFixture, NEXT_PUBLIC_SITE_URL: siteUrl },
    expectedExit: 1,
    expectedText:
      "NEXT_PUBLIC_SITE_URL: Production must use https://www.hwlbysmd.com",
    name: `noncanonical Production origin fails: ${siteUrl}`,
  })),
  {
    args: ["--target=production", "--expect-sales=closed"],
    env: productionFixture,
    expectedExit: 0,
    expectedText:
      "Launch environment preflight passed for production (closed sales).",
    name: "canonical Production database passes with sales closed",
  },
  {
    args: ["--target=production", "--expect-sales=closed"],
    env: {
      ...productionFixture,
      NEXT_PUBLIC_INQUIRY_COLLECTION_READY: "true",
    },
    expectedExit: 0,
    expectedText:
      "Inquiry collection: open (NEXT_PUBLIC_INQUIRY_COLLECTION_READY=true).",
    name: "Production closed sales permit inquiry collection open",
  },
  {
    args: ["--target=production", "--expect-sales=closed"],
    env: {
      ...productionFixture,
      NEXT_PUBLIC_INQUIRY_COLLECTION_READY: "TRUE",
    },
    expectedExit: 1,
    expectedText:
      "NEXT_PUBLIC_INQUIRY_COLLECTION_READY: must be exactly true or false",
    name: "Production malformed inquiry collection readiness fails",
  },
  {
    args: ["--target=production", "--expect-sales=closed"],
    env: productionClosedStripeFixture,
    expectedExit: 0,
    expectedText:
      "Launch environment preflight passed for production (closed sales).",
    name: "canonical Production Stripe set passes with sales closed",
  },
  {
    args: ["--target=production", "--expect-sales=closed"],
    env: {
      ...productionClosedStripeFixture,
      STRIPE_LIFT_PRODUCT_ID: "prod_wrongProductionProduct",
    },
    expectedExit: 1,
    expectedText:
      "STRIPE_LIFT_PRODUCT_ID: does not match the verified canonical production HWL Product",
    name: "wrong Production Stripe product fails while sales are closed",
  },
  {
    args: ["--target=production", "--expect-sales=closed"],
    env: {
      ...productionClosedStripeFixture,
      STRIPE_LIFT_GUIDE_PRICE_ID: "price_wrongProductionPrice",
    },
    expectedExit: 1,
    expectedText:
      "STRIPE_LIFT_GUIDE_PRICE_ID: does not match the verified canonical production HWL Price",
    name: "wrong Production Stripe price fails while sales are closed",
  },
  {
    args: ["--target=production", "--expect-sales=open"],
    env: productionStripeFixture,
    expectedExit: 0,
    expectedText:
      "Launch environment preflight passed for production (open sales).",
    name: "canonical Production database and live Stripe fixture pass",
    unexpectedText: ["NEXT_PUBLIC_SITE_URL:", "CONTACT_FROM_EMAIL:"],
  },
  {
    args: ["--target=production", "--expect-sales=open"],
    env: {
      ...productionStripeFixture,
      NEXT_PUBLIC_INQUIRY_COLLECTION_READY: "true",
    },
    expectedExit: 0,
    expectedText:
      "Inquiry collection: open (NEXT_PUBLIC_INQUIRY_COLLECTION_READY=true).",
    name: "Production open sales permit inquiry collection open",
  },
  {
    args: ["--target=production", "--expect-sales=open"],
    env: { ...productionStripeFixture, COMMERCE_ALERT_TO_EMAIL: "" },
    expectedExit: 1,
    expectedText: "COMMERCE_ALERT_TO_EMAIL: missing or placeholder value",
    name: "Production open sales require a commerce alert destination",
  },
  {
    args: ["--target=production", "--expect-sales=open"],
    env: {
      ...productionStripeFixture,
      STRIPE_WEBHOOK_SECRET: "whsec_fixture_private_value ",
    },
    expectedExit: 1,
    expectedText:
      "STRIPE_WEBHOOK_SECRET: must not contain leading or trailing whitespace",
    name: "Production open sales reject whitespace-padded provider secrets",
  },
  {
    args: ["--target=production", "--expect-sales=open"],
    env: {
      ...productionStripeFixture,
      LIFT_VIDEO_STORAGE_PATH: productionStripeFixture.LIFT_PDF_STORAGE_PATH,
    },
    expectedExit: 1,
    expectedText:
      "LIFT_VIDEO_STORAGE_PATH: must differ from LIFT_PDF_STORAGE_PATH",
    name: "Production requires distinct LIFT video and guide objects",
  },
  {
    args: ["--target=production", "--expect-sales=open"],
    env: {
      ...productionStripeFixture,
      LIFT_PDF_STORAGE_PATH: "lift/./lift-guide.pdf",
    },
    expectedExit: 1,
    expectedText:
      "LIFT_PDF_STORAGE_PATH: must be a safe bucket-relative object path",
    name: "Production rejects noncanonical storage path segments",
  },
  {
    args: ["--target=production", "--expect-sales=open"],
    env: {
      ...productionStripeFixture,
      HWL_DEPLOYMENT_TARGET: " production ",
    },
    expectedExit: 1,
    expectedText:
      "HWL_DEPLOYMENT_TARGET must not contain leading or trailing whitespace.",
    name: "Production rejects a whitespace-padded deployment authority",
  },
  {
    args: ["--target=production", "--expect-sales=open"],
    env: {
      ...productionStripeFixture,
      COMMERCE_ALERT_TO_EMAIL: "commerce-operator@example.com",
    },
    expectedExit: 1,
    expectedText:
      "COMMERCE_ALERT_TO_EMAIL: must use the canonical admin@ghosthand.studio operations recipient",
    name: "Production open sales require the canonical operations recipient",
  },
  {
    args: ["--target=production", "--expect-sales=open"],
    env: { ...productionStripeFixture, CONTACT_FROM_EMAIL: "" },
    expectedExit: 1,
    expectedText: "CONTACT_FROM_EMAIL: missing or placeholder value",
    name: "Production open sales require an alert sender",
  },
  {
    args: ["--target=production", "--expect-sales=open"],
    env: { ...productionStripeFixture, RESEND_API_KEY: "" },
    expectedExit: 1,
    expectedText: "RESEND_API_KEY: missing or placeholder value",
    name: "Production open sales require the Resend sending key",
  },
  ...[STAGING_SUPABASE_URL, "https://mismatched-project.supabase.co"].map(
    (supabaseUrl): Fixture => ({
      args: ["--target=production", "--expect-sales=closed"],
      env: {
        ...productionFixture,
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      },
      expectedExit: 1,
      expectedText:
        "NEXT_PUBLIC_SUPABASE_URL: does not match the canonical production Supabase project",
      name: `noncanonical Production Supabase project fails: ${supabaseUrl}`,
    })
  ),
  {
    args: ["--target=production", "--expect-sales=closed"],
    env: {
      ...productionFixture,
      NEXT_PUBLIC_SUPABASE_URL: `${PRODUCTION_SUPABASE_URL}/rest/v1`,
    },
    expectedExit: 1,
    expectedText:
      "NEXT_PUBLIC_SUPABASE_URL: must use the exact canonical production Supabase URL without a path, query, or fragment",
    name: "canonical Production Supabase host rejects a path suffix",
  },
  {
    args: ["--target=production", "--expect-sales=closed"],
    env: {
      ...productionFixture,
      ADMIN_SHANNON_HANDOFF_ACTOR_USER_ID: HANDOFF_ACTOR_ID,
      ADMIN_SHANNON_HANDOFF_APPROVAL_REFERENCE:
        "owner-approval:2026-09-12:shannon-admin",
      ADMIN_SHANNON_HANDOFF_EXPECTED_GIT_SHA: HANDOFF_GIT_SHA,
      ADMIN_SHANNON_HANDOFF_MODE: "grant",
      ADMIN_SHANNON_HANDOFF_TARGET_USER_ID: HANDOFF_TARGET_ID,
      NODE_ENV: "production",
      VERCEL_GIT_COMMIT_SHA: HANDOFF_GIT_SHA,
    },
    expectedExit: 0,
    expectedText: "Shannon administrator handoff: grant.",
    name: "closed Production accepts the exact one-time administrator handoff",
  },
  {
    args: ["--target=preview", "--expect-sales=closed"],
    env: {
      ...previewFixture,
      ADMIN_SHANNON_HANDOFF_ACTOR_USER_ID: HANDOFF_ACTOR_ID,
      ADMIN_SHANNON_HANDOFF_APPROVAL_REFERENCE:
        "owner-approval:2026-09-12:shannon-admin",
      ADMIN_SHANNON_HANDOFF_EXPECTED_GIT_SHA: HANDOFF_GIT_SHA,
      ADMIN_SHANNON_HANDOFF_MODE: "grant",
      ADMIN_SHANNON_HANDOFF_TARGET_USER_ID: HANDOFF_TARGET_ID,
      NODE_ENV: "production",
      VERCEL_GIT_COMMIT_SHA: HANDOFF_GIT_SHA,
    },
    expectedExit: 1,
    expectedText:
      "ADMIN_SHANNON_HANDOFF_MODE: role handoff is allowed only in a closed-sales Production candidate",
    name: "Preview cannot activate the administrator handoff",
  },
  {
    args: ["--target=production", "--expect-sales=closed"],
    env: {
      ...productionFixture,
      ADMIN_SHANNON_HANDOFF_ACTOR_USER_ID: HANDOFF_ACTOR_ID,
      ADMIN_SHANNON_HANDOFF_MODE: "disabled",
    },
    expectedExit: 1,
    expectedText:
      "ADMIN_SHANNON_HANDOFF_MODE: disabled handoff must omit every pinned actor, target, approval, and SHA value",
    name: "disabled handoff rejects stale pinned authority",
  },
  {
    args: ["--target=production", "--expect-sales=closed"],
    env: {
      ...productionFixture,
      ADMIN_SHANNON_HANDOFF_ACTOR_USER_ID: HANDOFF_ACTOR_ID,
      ADMIN_SHANNON_HANDOFF_APPROVAL_REFERENCE:
        "owner-approval:2026-09-12:shannon-admin",
      ADMIN_SHANNON_HANDOFF_EXPECTED_GIT_SHA: HANDOFF_GIT_SHA,
      ADMIN_SHANNON_HANDOFF_MODE: "grant",
      ADMIN_SHANNON_HANDOFF_TARGET_USER_ID: HANDOFF_TARGET_ID,
      NODE_ENV: "production",
      VERCEL_GIT_COMMIT_SHA: "a".repeat(40),
    },
    expectedExit: 1,
    expectedText:
      "ADMIN_SHANNON_HANDOFF_EXPECTED_GIT_SHA: must match VERCEL_GIT_COMMIT_SHA",
    name: "administrator handoff rejects deployment SHA drift",
  },
  {
    args: ["--target=production", "--expect-sales=closed"],
    env: {
      ...productionFixture,
      ADMIN_SHANNON_HANDOFF_ACTOR_USER_ID: HANDOFF_ACTOR_ID,
      ADMIN_SHANNON_HANDOFF_APPROVAL_REFERENCE: "sk_live_not_an_approval",
      ADMIN_SHANNON_HANDOFF_EXPECTED_GIT_SHA: HANDOFF_GIT_SHA,
      ADMIN_SHANNON_HANDOFF_MODE: "grant",
      ADMIN_SHANNON_HANDOFF_TARGET_USER_ID: HANDOFF_TARGET_ID,
      NODE_ENV: "production",
      VERCEL_GIT_COMMIT_SHA: HANDOFF_GIT_SHA,
    },
    expectedExit: 1,
    expectedText:
      "ADMIN_SHANNON_HANDOFF_APPROVAL_REFERENCE: must not contain a secret-shaped value",
    name: "administrator handoff rejects a secret-shaped approval reference",
  },
  {
    args: ["--target=production", "--expect-sales=closed"],
    env: {
      ...productionFixture,
      ADMIN_SHANNON_HANDOFF_ACTOR_USER_ID: HANDOFF_ACTOR_ID,
      ADMIN_SHANNON_HANDOFF_APPROVAL_REFERENCE:
        "owner-approval:github_pat_not_an_approval",
      ADMIN_SHANNON_HANDOFF_EXPECTED_GIT_SHA: HANDOFF_GIT_SHA,
      ADMIN_SHANNON_HANDOFF_MODE: "grant",
      ADMIN_SHANNON_HANDOFF_TARGET_USER_ID: HANDOFF_TARGET_ID,
      NODE_ENV: "production",
      VERCEL_GIT_COMMIT_SHA: HANDOFF_GIT_SHA,
    },
    expectedExit: 1,
    expectedText:
      "ADMIN_SHANNON_HANDOFF_APPROVAL_REFERENCE: must not contain a secret-shaped value",
    name: "administrator handoff rejects a secret marker after a safe prefix",
  },
]

const inheritedEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(
    ([key]) =>
      !key.startsWith("STRIPE_") &&
      !key.startsWith("SUPABASE_") &&
      !key.startsWith("NEXT_PUBLIC_SUPABASE_") &&
      !key.startsWith("NEXT_PUBLIC_INQUIRY_") &&
      !key.startsWith("COMMERCE_") &&
      !key.startsWith("CONTACT_") &&
      !key.startsWith("RESEND_") &&
      !key.startsWith("INQUIRY_") &&
      !key.startsWith("CRON_") &&
      !key.startsWith("HWL_") &&
      !key.startsWith("ADMIN_SHANNON_HANDOFF_") &&
      key !== "VERCEL" &&
      key !== "VERCEL_ENV" &&
      key !== "VERCEL_GIT_COMMIT_SHA"
  )
)

const failures: string[] = []

for (const fixture of fixtures) {
  const result = spawnSync(
    process.execPath,
    ["--experimental-strip-types", validatorPath, ...(fixture.args ?? [])],
    {
      encoding: "utf8",
      env: { ...inheritedEnvironment, ...fixture.env },
    }
  )
  const combinedOutput = `${result.stdout ?? ""}${result.stderr ?? ""}`

  if (result.status !== fixture.expectedExit) {
    failures.push(
      `${fixture.name}: expected exit ${fixture.expectedExit}, received ${result.status ?? "null"}`
    )
  }
  if (!combinedOutput.includes(fixture.expectedText)) {
    failures.push(
      `${fixture.name}: expected output was not present (${fixture.expectedText})`
    )
  }
  for (const text of fixture.unexpectedText ?? []) {
    if (combinedOutput.includes(text)) {
      failures.push(`${fixture.name}: unexpected output was present (${text})`)
    }
  }

  for (const secret of [
    ...Object.values(sharedFixtureSecrets),
    ...Object.values(stripeFixtureSecrets),
    ...Object.values(legacySupabaseFixtureSecrets),
  ]) {
    if (combinedOutput.includes(secret)) {
      failures.push(
        `${fixture.name}: validator output exposed a fixture secret`
      )
      break
    }
  }
}

if (failures.length) {
  console.error("Launch environment verifier tests failed:")
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(
  `Launch environment verifier tests passed: ${fixtures.length} launch-boundary cases.`
)
