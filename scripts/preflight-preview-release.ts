import { spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

export const PREVIEW_BRANCH = "checkpoint/platform-overhaul-2026-08-20"
export const PREVIEW_ORIGIN = "https://preview.hwlbysmd.com"
export const RECONCILIATION_CRON_PATH = "/api/cron/commerce-reconciliation"
export const RECONCILIATION_CRON_SCHEDULE = "17 15 * * *"

const PRODUCTION_HOSTNAMES = new Set([
  "hwlbysmd.com",
  "www.hwlbysmd.com",
  // Retired domains remain outside Preview's deployment authority.
  "howlbysmd.com",
  "www.howlbysmd.com",
])

type CheckStatus = "fail" | "pass" | "warning"

export type PreviewCheck = {
  detail: string
  name: string
  status: CheckStatus
}

export type PreviewRepositoryFiles = {
  ci: string
  envExample: string
  packageJson: string
  vercelJson: string
}

export type PreviewGitSnapshot = {
  branch: string | null
  divergence: { ahead: number; behind: number } | null
  head: string | null
  statusLines: string[]
  upstream: string | null
}

export type PreviewGitAuditOptions = {
  requireUpstreamSync?: boolean
}

const REQUIRED_TEMPLATE_KEYS = [
  "ADMIN_CLIENT_MESSAGING_READY",
  "CALCOM_API_KEY",
  "CALCOM_BOOKING_LEDGER_READY",
  "CALCOM_PROFILE_URL",
  "CALCOM_WEBHOOK_SECRET",
  "COMMERCE_ALERT_TO_EMAIL",
  "COMMERCE_SALES_READY",
  "CONTACT_FROM_EMAIL",
  "CONTACT_TO_EMAIL",
  "CRON_SECRET",
  "HWL_DEPLOYMENT_TARGET",
  "HWL_LOCAL_BUILD",
  "INQUIRY_RATE_LIMIT_MAX",
  "INQUIRY_RATE_LIMIT_SECRET",
  "LIFT_PDF_STORAGE_PATH",
  "LIFT_VIDEO_STORAGE_PATH",
  "NEXT_PUBLIC_INQUIRY_COLLECTION_READY",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "RESEND_API_KEY",
  "STRIPE_ACCOUNT_ID",
  "STRIPE_LIFT_GUIDE_PRICE_ID",
  "STRIPE_LIFT_PRODUCT_ID",
  "STRIPE_LIVEMODE",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const

const SENSITIVE_TEMPLATE_KEYS = [
  "CALCOM_API_KEY",
  "CALCOM_WEBHOOK_SECRET",
  "CRON_SECRET",
  "INQUIRY_RATE_LIMIT_SECRET",
  "MUX_ACCESS_TOKEN",
  "MUX_PRIVATE_KEY",
  "MUX_SECRET_KEY",
  "RESEND_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const

function check(
  status: CheckStatus,
  name: string,
  detail: string
): PreviewCheck {
  return { detail, name, status }
}

function parseEnvironmentTemplate(source: string) {
  const values = new Map<string, string>()

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue

    const separator = line.indexOf("=")
    if (separator <= 0) continue
    values.set(line.slice(0, separator), line.slice(separator + 1))
  }

  return values
}

function parseJsonObject(source: string, label: string) {
  try {
    const value = JSON.parse(source) as unknown
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { error: `${label} must contain a JSON object`, value: null }
    }
    return { error: null, value: value as Record<string, unknown> }
  } catch {
    return { error: `${label} is not valid JSON`, value: null }
  }
}

function containsProductionHostname(value: unknown): boolean {
  if (typeof value === "string") {
    const reference = value.trim()
    const explicitUrl = /^[a-z][a-z0-9+.-]*:\/\//i.test(reference)
    const protocolRelativeUrl = reference.startsWith("//")
    // A bare email address is informational data, not URL userinfo. Actual
    // URLs with userinfo still resolve to and block their Production hostname.
    if (!explicitUrl && !protocolRelativeUrl && reference.includes("@")) {
      return false
    }
    try {
      const hostname = new URL(
        explicitUrl
          ? reference
          : protocolRelativeUrl
            ? `https:${reference}`
            : `https://${reference}`
      ).hostname.replace(/\.$/, "")
      return PRODUCTION_HOSTNAMES.has(hostname)
    } catch {
      return false
    }
  }
  if (Array.isArray(value)) return value.some(containsProductionHostname)
  if (value && typeof value === "object") {
    return Object.values(value).some(containsProductionHostname)
  }
  return false
}

export function auditPreviewRepositoryFiles(
  files: PreviewRepositoryFiles
): PreviewCheck[] {
  const checks: PreviewCheck[] = []
  const vercel = parseJsonObject(files.vercelJson, "vercel.json")

  if (vercel.error || !vercel.value) {
    checks.push(
      check("fail", "Vercel configuration", vercel.error ?? "invalid")
    )
  } else {
    const crons = vercel.value.crons
    const exactCron =
      Array.isArray(crons) &&
      crons.length === 1 &&
      crons[0] &&
      typeof crons[0] === "object" &&
      !Array.isArray(crons[0]) &&
      (crons[0] as Record<string, unknown>).path === RECONCILIATION_CRON_PATH &&
      (crons[0] as Record<string, unknown>).schedule ===
        RECONCILIATION_CRON_SCHEDULE

    checks.push(
      exactCron
        ? check(
            "pass",
            "Vercel cron declaration",
            `${RECONCILIATION_CRON_PATH} is declared once at ${RECONCILIATION_CRON_SCHEDULE}`
          )
        : check(
            "fail",
            "Vercel cron declaration",
            "vercel.json must declare exactly the reviewed daily commerce reconciliation route and schedule"
          )
    )

    checks.push(
      containsProductionHostname(vercel.value) ||
        Object.hasOwn(vercel.value, "alias")
        ? check(
            "fail",
            "Vercel Production alias isolation",
            "vercel.json must not install a Production hostname or alias as part of Preview preparation"
          )
        : check(
            "pass",
            "Vercel Production alias isolation",
            "vercel.json contains no Production hostname or alias"
          )
    )
  }

  checks.push(
    check(
      "warning",
      "Preview cron execution",
      "Vercel invokes project cron jobs only on Production deployments; Preview must exercise this authenticated route manually after owner approval"
    )
  )

  const packageFile = parseJsonObject(files.packageJson, "package.json")
  if (packageFile.error || !packageFile.value) {
    checks.push(
      check("fail", "Package release scripts", packageFile.error ?? "invalid")
    )
  } else {
    const scripts = packageFile.value.scripts
    const scriptMap =
      scripts && typeof scripts === "object" && !Array.isArray(scripts)
        ? (scripts as Record<string, unknown>)
        : {}
    const build = typeof scriptMap.build === "string" ? scriptMap.build : ""
    const gateIndex = build.indexOf("validate:deploy-env")
    const nextBuildIndex = build.indexOf("next build")

    checks.push(
      gateIndex >= 0 && nextBuildIndex > gateIndex
        ? check(
            "pass",
            "Build gate ordering",
            "validate:deploy-env runs before the Next.js deployment build"
          )
        : check(
            "fail",
            "Build gate ordering",
            "the deployment build must run validate:deploy-env before next build"
          )
    )

    const requiredScripts = [
      "preflight:preview",
      "preflight:preview:post-push",
      "preflight:preview:repository",
      "test:admin",
      "test:auth",
      "test:launch-env",
      "test:preview-release",
      "test:relationships",
    ]
    const missingScripts = requiredScripts.filter(
      (name) => typeof scriptMap[name] !== "string"
    )
    checks.push(
      missingScripts.length === 0
        ? check(
            "pass",
            "Preview scripts",
            "repository and environment Preview preflights are installed"
          )
        : check(
            "fail",
            "Preview scripts",
            `missing package scripts: ${missingScripts.join(", ")}`
          )
    )
  }

  const executableCi = files.ci
    .split(/\r?\n/)
    .filter((line) => !line.trimStart().startsWith("#"))
    .join("\n")
  const forbiddenDeployment = [
    /\bvercel\s+deploy\b/i,
    /\bvercel\s+promote\b/i,
    /\bvercel\s+--prod\b/i,
    /\bvercel-action\b/i,
  ].some((pattern) => pattern.test(executableCi))

  checks.push(
    forbiddenDeployment
      ? check(
          "fail",
          "CI deployment authority",
          "CI contains a Vercel deploy, promote, Production, or deployment-action command"
        )
      : check(
          "pass",
          "CI deployment authority",
          "CI verifies code and contains no Vercel deploy or promote command"
        )
  )

  const requiredCiCommands = [
    "npm run test:admin",
    "npm run test:auth",
    "npm run test:launch-env",
    "npm run test:preview-release",
    "npm run test:relationships",
    "npm run build:ci",
  ]
  const missingCiCommands = requiredCiCommands.filter(
    (command) => !executableCi.includes(command)
  )
  checks.push(
    missingCiCommands.length === 0
      ? check(
          "pass",
          "CI Preview coverage",
          "CI exercises Auth boundaries, environment fixtures, Preview repository policy, and the provider-free build"
        )
      : check(
          "fail",
          "CI Preview coverage",
          `CI is missing: ${missingCiCommands.join(", ")}`
        )
  )

  const template = parseEnvironmentTemplate(files.envExample)
  const missingTemplateKeys = REQUIRED_TEMPLATE_KEYS.filter(
    (key) => !template.has(key)
  )
  checks.push(
    missingTemplateKeys.length === 0
      ? check(
          "pass",
          "Environment template contract",
          "the Preview-required variable names are documented"
        )
      : check(
          "fail",
          "Environment template contract",
          `missing variable names: ${missingTemplateKeys.join(", ")}`
        )
  )

  const populatedSecrets = SENSITIVE_TEMPLATE_KEYS.filter(
    (key) => (template.get(key) ?? "").trim().length > 0
  )
  const secretShape =
    /(?:sk|rk)_(?:test|live)_[A-Za-z0-9_]{12,}|whsec_[A-Za-z0-9_]{12,}|sb_secret_[A-Za-z0-9_-]{12,}|re_[A-Za-z0-9_-]{20,}|cal_[A-Za-z0-9_-]{16,}/.test(
      files.envExample
    )
  checks.push(
    populatedSecrets.length === 0 && !secretShape
      ? check(
          "pass",
          "Environment template secrecy",
          "the committed template contains no populated secret fields or provider-secret-shaped values"
        )
      : check(
          "fail",
          "Environment template secrecy",
          "the committed template appears to contain a populated secret field or provider-secret-shaped value"
        )
  )

  const safeDefaults =
    template.get("ADMIN_CLIENT_MESSAGING_READY") === "false" &&
    template.get("HWL_LOCAL_BUILD") === "false" &&
    template.get("CALCOM_BOOKING_LEDGER_READY") === "false" &&
    template.get("COMMERCE_SALES_READY") === "false" &&
    template.get("NEXT_PUBLIC_INQUIRY_COLLECTION_READY") === "false" &&
    template.get("STRIPE_LIVEMODE") === "false"
  checks.push(
    safeDefaults
      ? check(
          "pass",
          "Template fail-closed defaults",
          "admin message writes, local bypass, booking history, commerce sales, inquiry collection, and Stripe live mode default to false"
        )
      : check(
          "fail",
          "Template fail-closed defaults",
          "ADMIN_CLIENT_MESSAGING_READY, HWL_LOCAL_BUILD, CALCOM_BOOKING_LEDGER_READY, COMMERCE_SALES_READY, NEXT_PUBLIC_INQUIRY_COLLECTION_READY, and STRIPE_LIVEMODE must all default to false"
        )
  )

  return checks
}

export function auditPreviewGitSnapshot(
  snapshot: PreviewGitSnapshot,
  { requireUpstreamSync = false }: PreviewGitAuditOptions = {}
): PreviewCheck[] {
  const checks: PreviewCheck[] = []

  checks.push(
    snapshot.branch === PREVIEW_BRANCH
      ? check("pass", "Preview branch", `current branch is ${PREVIEW_BRANCH}`)
      : check(
          "fail",
          "Preview branch",
          `expected ${PREVIEW_BRANCH}; received ${snapshot.branch ?? "detached/unknown"}`
        )
  )

  checks.push(
    snapshot.statusLines.length === 0
      ? check("pass", "Candidate worktree", "worktree and index are clean")
      : check(
          "fail",
          "Candidate worktree",
          `${snapshot.statusLines.length} changed or untracked path records remain; Preview cannot be tied to an immutable commit yet`
        )
  )

  checks.push(
    snapshot.upstream
      ? check(
          "pass",
          "Preview upstream",
          `local upstream is ${snapshot.upstream}`
        )
      : check(
          "fail",
          "Preview upstream",
          "the checkpoint branch has no local upstream tracking ref"
        )
  )

  const divergence = snapshot.divergence
  if (requireUpstreamSync) {
    checks.push(
      divergence && divergence.ahead === 0 && divergence.behind === 0
        ? check(
            "pass",
            "Post-push upstream synchronization",
            "HEAD matches the current local upstream tracking ref"
          )
        : check(
            "fail",
            "Post-push upstream synchronization",
            divergence
              ? `local tracking evidence reports ahead ${divergence.ahead}, behind ${divergence.behind}`
              : "local upstream divergence could not be determined"
          )
    )
  } else {
    checks.push(
      divergence && divergence.behind === 0
        ? check(
            "pass",
            "Pre-push upstream position",
            divergence.ahead === 0
              ? "HEAD matches the current local upstream tracking ref"
              : `candidate is ahead ${divergence.ahead} commit(s) and is not behind the current local upstream tracking ref`
          )
        : check(
            "fail",
            "Pre-push upstream position",
            divergence
              ? `candidate is behind the current local upstream tracking ref by ${divergence.behind} commit(s)`
              : "local upstream divergence could not be determined"
          )
    )
  }

  checks.push(
    check(
      "warning",
      "Remote freshness",
      "this offline preflight does not fetch; upstream evidence is limited to the current local remote-tracking ref"
    )
  )

  return checks
}

function runGit(root: string, args: string[]) {
  return spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  })
}

function collectGitSnapshot(root: string): PreviewGitSnapshot {
  const branchResult = runGit(root, ["branch", "--show-current"])
  const statusResult = runGit(root, [
    "status",
    "--porcelain=v1",
    "--untracked-files=all",
  ])
  const headResult = runGit(root, ["rev-parse", "HEAD"])
  const upstreamResult = runGit(root, [
    "rev-parse",
    "--abbrev-ref",
    "--symbolic-full-name",
    "@{upstream}",
  ])
  const divergenceResult =
    upstreamResult.status === 0
      ? runGit(root, [
          "rev-list",
          "--left-right",
          "--count",
          "@{upstream}...HEAD",
        ])
      : null

  const [behindText, aheadText] =
    divergenceResult?.status === 0
      ? divergenceResult.stdout.trim().split(/\s+/)
      : []
  const behind = Number(behindText)
  const ahead = Number(aheadText)

  return {
    branch:
      branchResult.status === 0 && branchResult.stdout.trim()
        ? branchResult.stdout.trim()
        : null,
    divergence:
      Number.isInteger(ahead) && Number.isInteger(behind)
        ? { ahead, behind }
        : null,
    head:
      headResult.status === 0 && headResult.stdout.trim()
        ? headResult.stdout.trim()
        : null,
    statusLines:
      statusResult.status === 0 && statusResult.stdout.trim()
        ? statusResult.stdout.trim().split(/\r?\n/)
        : statusResult.status === 0
          ? []
          : ["git status failed"],
    upstream:
      upstreamResult.status === 0 && upstreamResult.stdout.trim()
        ? upstreamResult.stdout.trim()
        : null,
  }
}

function redactProviderSecrets(value: string) {
  return value.replace(
    /(?:sk|rk)_(?:test|live)_[A-Za-z0-9_]+|whsec_[A-Za-z0-9_]+|sb_secret_[A-Za-z0-9_-]+|re_[A-Za-z0-9_-]+|cal_[A-Za-z0-9_-]+/g,
    "[REDACTED]"
  )
}

function environmentCheck(root: string, expectedSales: "closed" | "open") {
  const validator = resolve(root, "scripts/validate-launch-env.ts")
  const result = spawnSync(
    process.execPath,
    [
      "--experimental-strip-types",
      validator,
      "--target=preview",
      `--expect-sales=${expectedSales}`,
      "--require-explicit-target",
    ],
    {
      cwd: root,
      encoding: "utf8",
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    }
  )
  const output = redactProviderSecrets(
    `${result.stdout ?? ""}${result.stderr ?? ""}`.trim()
  )

  return result.status === 0
    ? check(
        "pass",
        "Preview environment shape",
        `validator accepted the local Preview snapshot for ${expectedSales} sandbox sales`
      )
    : check(
        "fail",
        "Preview environment shape",
        output || "launch environment validator did not complete successfully"
      )
}

function option(name: string) {
  const prefix = `--${name}=`
  return process.argv
    .slice(2)
    .find((argument) => argument.startsWith(prefix))
    ?.slice(prefix.length)
    .trim()
}

function printChecks(checks: PreviewCheck[]) {
  for (const result of checks) {
    const marker =
      result.status === "pass"
        ? "PASS"
        : result.status === "fail"
          ? "FAIL"
          : "WARN"
    console.log(`[${marker}] ${result.name}: ${result.detail}`)
  }
}

function main() {
  const root = process.cwd()
  const repositoryOnly = process.argv.includes("--repository-only")
  const requireUpstreamSync = process.argv.includes("--require-upstream-sync")
  const expectedSalesOption = option("expect-sales") ?? "closed"

  if (expectedSalesOption !== "closed" && expectedSalesOption !== "open") {
    console.error("--expect-sales must be closed or open")
    process.exit(1)
  }

  const files: PreviewRepositoryFiles = {
    ci: readFileSync(resolve(root, ".github/workflows/ci.yml"), "utf8"),
    envExample: readFileSync(resolve(root, ".env.example"), "utf8"),
    packageJson: readFileSync(resolve(root, "package.json"), "utf8"),
    vercelJson: readFileSync(resolve(root, "vercel.json"), "utf8"),
  }
  const gitSnapshot = collectGitSnapshot(root)
  const checks = [
    ...auditPreviewRepositoryFiles(files),
    ...auditPreviewGitSnapshot(gitSnapshot, { requireUpstreamSync }),
  ]

  if (repositoryOnly) {
    checks.push(
      check(
        "warning",
        "Environment scope",
        "repository-only mode does not inspect a Preview variable snapshot and cannot approve a deployment"
      )
    )
  } else {
    checks.push(environmentCheck(root, expectedSalesOption))
    checks.push(
      check(
        "warning",
        "Provider evidence",
        "this preflight is offline and cannot prove Vercel branch scoping, hostname assignment, provider objects, webhook reachability, storage delivery, or end-to-end behavior"
      )
    )
  }

  console.log(
    `HWL Preview preflight for ${gitSnapshot.head?.slice(0, 12) ?? "unknown HEAD"} (${expectedSalesOption} sandbox sales)`
  )
  printChecks(checks)

  const failures = checks.filter((result) => result.status === "fail")
  if (failures.length) {
    console.error(
      `Preview preflight failed with ${failures.length} blocking check(s).`
    )
    process.exit(1)
  }

  console.log(
    "Preview preflight passed offline. Owner-approved provider configuration and hosted E2E verification remain mandatory."
  )
}

const executedPath = process.argv[1] ? resolve(process.argv[1]) : null
if (executedPath === fileURLToPath(import.meta.url)) main()
