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

const developmentFixture: NodeJS.ProcessEnv = {
  CALCOM_PROFILE_URL: "https://cal.com/hwlbysmd",
  COMMERCE_SALES_READY: "false",
  CONTACT_FROM_EMAIL: "HWL by SMD <hello@howlbysmd.com>",
  CONTACT_TO_EMAIL: "shannonmarydixon@gmail.com",
  HWL_DEPLOYMENT_TARGET: "development",
  INQUIRY_RATE_LIMIT_MAX: "5",
  LIFT_PDF_STORAGE_PATH: "lift/lift-guide.pdf",
  LIFT_VIDEO_STORAGE_PATH: "lift/complete-lift-v1.mp4",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_fixture_public_value",
  NEXT_PUBLIC_SUPABASE_URL: "https://lkxppynmdfzljuptauxf.supabase.co",
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
}

const previewFixture: NodeJS.ProcessEnv = {
  ...developmentFixture,
  HWL_DEPLOYMENT_TARGET: "preview",
  NEXT_PUBLIC_SITE_URL: "https://preview.howlbysmd.com",
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
    args: ["--target=preview", "--expect-sales=closed"],
    env: previewFixture,
    expectedExit: 0,
    expectedText:
      "Launch environment preflight passed for preview (closed sales).",
    name: "preview closed without Stripe provider values",
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
      "STRIPE_LIFT_GUIDE_PRICE_ID: does not match the verified canonical HWL sandbox Price",
    name: "wrong Preview Stripe price fails",
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
    env: {
      ...previewFixture,
      CONTACT_FROM_EMAIL: "HWL by SMD <hello@example.com>",
    },
    expectedExit: 1,
    expectedText:
      "CONTACT_FROM_EMAIL: must use the owner-controlled howlbysmd.com sender domain",
    name: "unapproved sender domain fails",
  },
  {
    args: ["--target=production", "--expect-sales=open"],
    env: {
      ...previewStripeFixture,
      COMMERCE_SALES_READY: "true",
      HWL_DEPLOYMENT_TARGET: "production",
      NEXT_PUBLIC_SITE_URL: "https://www.howlbysmd.com",
      STRIPE_ACCOUNT_ID: "acct_1U9cEIPTLuM8Maxa",
      STRIPE_LIFT_GUIDE_PRICE_ID: "price_fixtureLivePrice",
      STRIPE_LIFT_PRODUCT_ID: "prod_fixtureLiveProduct",
      STRIPE_LIVEMODE: "true",
      STRIPE_SECRET_KEY: "sk_live_fixture_private_value",
      VERCEL_ENV: "production",
    },
    expectedExit: 1,
    expectedText:
      "the canonical Production Supabase project has not been owner-approved",
    name: "Production remains closed without approved database",
  },
]

const inheritedEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(
    ([key]) =>
      !key.startsWith("STRIPE_") &&
      !key.startsWith("SUPABASE_") &&
      !key.startsWith("NEXT_PUBLIC_SUPABASE_") &&
      !key.startsWith("CONTACT_") &&
      !key.startsWith("RESEND_") &&
      !key.startsWith("INQUIRY_") &&
      !key.startsWith("CRON_") &&
      !key.startsWith("HWL_") &&
      key !== "VERCEL" &&
      key !== "VERCEL_ENV"
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
