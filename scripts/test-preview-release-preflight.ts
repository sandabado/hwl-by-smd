import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import {
  auditPreviewGitSnapshot,
  auditPreviewRepositoryFiles,
  PREVIEW_BRANCH,
  PREVIEW_ORIGIN,
  type PreviewCheck,
  type PreviewRepositoryFiles,
} from "./preflight-preview-release.ts"

function repositoryFixture(): PreviewRepositoryFiles {
  return {
    ci: `
      - run: npm run test:auth
      - run: npm run test:launch-env
      - run: npm run test:preview-release
      - run: npm run build:ci
    `,
    envExample: `
HWL_DEPLOYMENT_TARGET=development
HWL_LOCAL_BUILD=false
NEXT_PUBLIC_SITE_URL=https://www.hwlbysmd.com
NEXT_PUBLIC_INQUIRY_COLLECTION_READY=false
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
COMMERCE_SALES_READY=false
STRIPE_LIVEMODE=false
STRIPE_ACCOUNT_ID=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_LIFT_PRODUCT_ID=
STRIPE_LIFT_GUIDE_PRICE_ID=
LIFT_PDF_STORAGE_PATH=lift/lift-guide.pdf
LIFT_VIDEO_STORAGE_PATH=lift/complete-lift-v1.mp4
RESEND_API_KEY=
COMMERCE_ALERT_TO_EMAIL=
CONTACT_TO_EMAIL=owner@example.com
CONTACT_FROM_EMAIL=HWL <hello@hwlbysmd.com>
INQUIRY_RATE_LIMIT_SECRET=
INQUIRY_RATE_LIMIT_MAX=5
CALCOM_PROFILE_URL=https://cal.com/hwlbysmd
CRON_SECRET=
MUX_ACCESS_TOKEN=
MUX_SECRET_KEY=
MUX_PRIVATE_KEY=
    `,
    packageJson: JSON.stringify({
      scripts: {
        build:
          "npm run validate:deploy-env && npm run validate:seo && next build --webpack",
        "preflight:preview": "node scripts/preflight-preview-release.ts",
        "preflight:preview:post-push":
          "node scripts/preflight-preview-release.ts --repository-only --require-upstream-sync",
        "preflight:preview:repository":
          "node scripts/preflight-preview-release.ts --repository-only",
        "test:auth": "node --test scripts/test-auth-boundaries.ts",
        "test:launch-env": "node scripts/test-launch-env.ts",
        "test:preview-release":
          "node --test scripts/test-preview-release-preflight.ts",
      },
    }),
    vercelJson: JSON.stringify({
      $schema: "https://openapi.vercel.sh/vercel.json",
      crons: [
        {
          path: "/api/cron/commerce-reconciliation",
          schedule: "17 15 * * *",
        },
      ],
    }),
  }
}

function failures(checks: PreviewCheck[]) {
  return checks.filter((item) => item.status === "fail")
}

function readRepositoryFile(relativePath: string) {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8")
}

test("reviewed Preview repository policy passes", () => {
  assert.deepEqual(
    failures(auditPreviewRepositoryFiles(repositoryFixture())),
    []
  )
})

test("current repository files satisfy reviewed Preview policy", () => {
  assert.deepEqual(
    failures(
      auditPreviewRepositoryFiles({
        ci: readRepositoryFile(".github/workflows/ci.yml"),
        envExample: readRepositoryFile(".env.example"),
        packageJson: readRepositoryFile("package.json"),
        vercelJson: readRepositoryFile("vercel.json"),
      })
    ),
    []
  )
})

test("proposed custom Preview origin uses the new canonical domain", () => {
  assert.equal(PREVIEW_ORIGIN, "https://preview.hwlbysmd.com")
})

test("new and retired Production host references fail Preview isolation", () => {
  for (const hostname of [
    "hwlbysmd.com",
    "www.hwlbysmd.com",
    "howlbysmd.com",
    "www.howlbysmd.com",
  ]) {
    for (const value of [
      hostname,
      `https://${hostname}/checkout/success`,
      `http://${hostname}`,
      `//${hostname}`,
      `https://operator@${hostname}/path`,
      `//operator@${hostname}/path`,
      `https://${hostname.toUpperCase()}:443/path`,
      `https://${hostname}./path`,
    ]) {
      const fixture = repositoryFixture()
      const parsed = JSON.parse(fixture.vercelJson) as Record<string, unknown>
      parsed.redirects = [{ source: "/legacy", destination: value }]
      fixture.vercelJson = JSON.stringify(parsed)

      assert.ok(
        failures(auditPreviewRepositoryFiles(fixture)).some(
          (item) => item.name === "Vercel Production alias isolation"
        ),
        `Production hostname reference must be rejected: ${value}`
      )
    }
  }
})

test("all top-level aliases remain outside Preview preparation authority", () => {
  const fixture = repositoryFixture()
  const parsed = JSON.parse(fixture.vercelJson) as Record<string, unknown>
  parsed.alias = ["preview.example.com"]
  fixture.vercelJson = JSON.stringify(parsed)

  assert.ok(
    failures(auditPreviewRepositoryFiles(fixture)).some(
      (item) => item.name === "Vercel Production alias isolation"
    )
  )
})

test("non-Production references are not mistaken for Production hostnames", () => {
  for (const destination of [
    PREVIEW_ORIGIN,
    "https://preview.howlbysmd.com",
    "https://hwl-fixture-checkpoint.vercel.app",
    "https://nothwlbysmd.com",
    "https://hwlbysmd.com.example.org",
  ]) {
    const fixture = repositoryFixture()
    const parsed = JSON.parse(fixture.vercelJson) as Record<string, unknown>
    parsed.redirects = [{ source: "/preview", destination }]
    fixture.vercelJson = JSON.stringify(parsed)

    assert.deepEqual(failures(auditPreviewRepositoryFiles(fixture)), [])
  }
})

test("informational email and prose header values are not Production aliases", () => {
  const fixture = repositoryFixture()
  const parsed = JSON.parse(fixture.vercelJson) as Record<string, unknown>
  parsed.headers = [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Support", value: "hello@hwlbysmd.com" },
        { key: "X-Legacy-Support", value: "hello@howlbysmd.com" },
        { key: "X-Support-Name", value: "HWL <hello@hwlbysmd.com>" },
        {
          key: "X-Support-Notice",
          value: "Visit https://www.hwlbysmd.com for help.",
        },
      ],
    },
  ]
  fixture.vercelJson = JSON.stringify(parsed)

  assert.deepEqual(failures(auditPreviewRepositoryFiles(fixture)), [])
})

test("Production deployment command in CI fails", () => {
  const fixture = repositoryFixture()
  fixture.ci += "\n- run: vercel deploy --prod\n"

  assert.match(
    failures(auditPreviewRepositoryFiles(fixture))
      .map((item) => item.name)
      .join("\n"),
    /CI deployment authority/
  )
})

test("Next build without the deployment gate fails", () => {
  const fixture = repositoryFixture()
  const parsed = JSON.parse(fixture.packageJson) as {
    scripts: Record<string, string>
  }
  parsed.scripts.build = "next build --webpack"
  fixture.packageJson = JSON.stringify(parsed)

  assert.match(
    failures(auditPreviewRepositoryFiles(fixture))
      .map((item) => item.name)
      .join("\n"),
    /Build gate ordering/
  )
})

test("missing Auth boundary coverage fails Preview policy", () => {
  const fixture = repositoryFixture()
  const parsed = JSON.parse(fixture.packageJson) as {
    scripts: Record<string, string>
  }
  delete parsed.scripts["test:auth"]
  fixture.packageJson = JSON.stringify(parsed)
  fixture.ci = fixture.ci.replace("- run: npm run test:auth", "")

  const failuresForFixture = failures(auditPreviewRepositoryFiles(fixture))
  assert.ok(failuresForFixture.some((item) => item.name === "Preview scripts"))
  assert.ok(
    failuresForFixture.some((item) => item.name === "CI Preview coverage")
  )
})

test("wrong reconciliation cron fails", () => {
  const fixture = repositoryFixture()
  fixture.vercelJson = JSON.stringify({
    crons: [
      {
        path: "/api/cron/commerce-reconciliation",
        schedule: "* * * * *",
      },
    ],
  })

  assert.match(
    failures(auditPreviewRepositoryFiles(fixture))
      .map((item) => item.name)
      .join("\n"),
    /Vercel cron declaration/
  )
})

test("populated secret in the committed template fails", () => {
  const fixture = repositoryFixture()
  fixture.envExample = fixture.envExample.replace(
    "STRIPE_SECRET_KEY=",
    "STRIPE_SECRET_KEY=sk_live_this_must_not_ship"
  )

  assert.match(
    failures(auditPreviewRepositoryFiles(fixture))
      .map((item) => item.name)
      .join("\n"),
    /Environment template secrecy/
  )
})

test("missing inquiry collection readiness fails the template contract", () => {
  const fixture = repositoryFixture()
  fixture.envExample = fixture.envExample.replace(
    "NEXT_PUBLIC_INQUIRY_COLLECTION_READY=false\n",
    ""
  )

  const failedChecks = failures(auditPreviewRepositoryFiles(fixture))
  const templateContract = failedChecks.find(
    (item) => item.name === "Environment template contract"
  )
  assert.match(
    templateContract?.detail ?? "",
    /NEXT_PUBLIC_INQUIRY_COLLECTION_READY/
  )
  assert.ok(
    failedChecks.some((item) => item.name === "Template fail-closed defaults")
  )
})

test("inquiry collection must default fail closed in the committed template", () => {
  for (const unsafeValue of ["true", "TRUE", "FALSE", ""]) {
    const fixture = repositoryFixture()
    fixture.envExample = fixture.envExample.replace(
      "NEXT_PUBLIC_INQUIRY_COLLECTION_READY=false",
      `NEXT_PUBLIC_INQUIRY_COLLECTION_READY=${unsafeValue}`
    )

    const failedChecks = failures(auditPreviewRepositoryFiles(fixture))
    assert.ok(
      !failedChecks.some(
        (item) => item.name === "Environment template contract"
      ),
      `present inquiry readiness key must satisfy the template contract: ${JSON.stringify(unsafeValue)}`
    )
    assert.ok(
      failedChecks.some(
        (item) =>
          item.name === "Template fail-closed defaults" &&
          item.detail.includes("NEXT_PUBLIC_INQUIRY_COLLECTION_READY")
      ),
      `unsafe inquiry readiness default must fail: ${JSON.stringify(unsafeValue)}`
    )
  }
})

test("clean synchronized checkpoint snapshot passes Git policy", () => {
  const checks = auditPreviewGitSnapshot({
    branch: PREVIEW_BRANCH,
    divergence: { ahead: 0, behind: 0 },
    head: "555cead97245451e8e18eb628daf421e731beb41",
    statusLines: [],
    upstream: `origin/${PREVIEW_BRANCH}`,
  })

  assert.deepEqual(failures(checks), [])
  assert.ok(checks.some((item) => item.name === "Remote freshness"))
})

test("clean local candidate ahead of upstream passes pre-push policy", () => {
  const checks = auditPreviewGitSnapshot({
    branch: PREVIEW_BRANCH,
    divergence: { ahead: 1, behind: 0 },
    head: "666cead97245451e8e18eb628daf421e731beb42",
    statusLines: [],
    upstream: `origin/${PREVIEW_BRANCH}`,
  })

  assert.deepEqual(failures(checks), [])
  assert.match(
    checks.find((item) => item.name === "Pre-push upstream position")?.detail ??
      "",
    /ahead 1 commit/
  )
})

test("post-push policy requires exact local upstream synchronization", () => {
  const snapshot = {
    branch: PREVIEW_BRANCH,
    divergence: { ahead: 1, behind: 0 },
    head: "666cead97245451e8e18eb628daf421e731beb42",
    statusLines: [],
    upstream: `origin/${PREVIEW_BRANCH}`,
  }

  assert.match(
    failures(auditPreviewGitSnapshot(snapshot, { requireUpstreamSync: true }))
      .map((item) => item.name)
      .join("\n"),
    /Post-push upstream synchronization/
  )
})

test("dirty candidate fails explicitly", () => {
  const checks = auditPreviewGitSnapshot({
    branch: PREVIEW_BRANCH,
    divergence: { ahead: 0, behind: 0 },
    head: "555cead97245451e8e18eb628daf421e731beb41",
    statusLines: [" M package.json", "?? scripts/new-file.ts"],
    upstream: `origin/${PREVIEW_BRANCH}`,
  })

  assert.match(
    failures(checks)
      .map((item) => item.name)
      .join("\n"),
    /Candidate worktree/
  )
})

test("wrong branch and being behind local tracking fail", () => {
  const checks = auditPreviewGitSnapshot({
    branch: "main",
    divergence: { ahead: 1, behind: 2 },
    head: "555cead97245451e8e18eb628daf421e731beb41",
    statusLines: [],
    upstream: "origin/main",
  })
  const names = failures(checks)
    .map((item) => item.name)
    .join("\n")

  assert.match(names, /Preview branch/)
  assert.match(names, /Pre-push upstream position/)
})
