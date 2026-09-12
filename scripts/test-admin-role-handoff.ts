import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

import {
  getShannonAdminHandoffConfig,
  GHOSTHAND_SUPER_ADMIN_EMAIL,
  handoffShannonAdministratorWithDependencies,
  SHANNON_ADMIN_EMAIL,
  type ShannonAdminHandoffDependencies,
} from "../lib/admin-role-handoff.ts"

const ACTOR_ID = "d41943f5-133d-47e1-b2fe-c105762207e9"
const SHANNON_ID = "5fa5e8b3-2579-400d-a98c-43ea5f4bb9c6"
const GIT_SHA = "1039e0e2d6c58f2f4eba19036bf03f9c736227b5"

const productionEnvironment = {
  ADMIN_SHANNON_HANDOFF_ACTOR_USER_ID: ACTOR_ID,
  ADMIN_SHANNON_HANDOFF_APPROVAL_REFERENCE:
    "owner-approval:2026-09-12:shannon-admin",
  ADMIN_SHANNON_HANDOFF_EXPECTED_GIT_SHA: GIT_SHA,
  ADMIN_SHANNON_HANDOFF_MODE: "grant",
  ADMIN_SHANNON_HANDOFF_TARGET_USER_ID: SHANNON_ID,
  COMMERCE_SALES_READY: "false",
  HWL_DEPLOYMENT_TARGET: "production",
  NEXT_PUBLIC_SITE_URL: "https://www.hwlbysmd.com",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_abcdefghijklmnop",
  NEXT_PUBLIC_SUPABASE_URL: "https://qwprhsrwiihfllmgallr.supabase.co",
  NODE_ENV: "production",
  VERCEL: "1",
  VERCEL_ENV: "production",
  VERCEL_GIT_COMMIT_SHA: GIT_SHA,
} as const

function setup({
  access = {
    email: GHOSTHAND_SUPER_ADMIN_EMAIL,
    role: "super_admin" as const,
    source: "supabase" as const,
    userId: ACTOR_ID,
  },
  changeResult = {
    isAdmin: true,
    role: "administrator",
    targetUserId: SHANNON_ID,
  },
  environment = productionEnvironment,
  initialTarget = {
    email: SHANNON_ADMIN_EMAIL,
    id: SHANNON_ID,
    isAdmin: false,
    role: "member" as const,
  },
  verifiedTarget = {
    email: SHANNON_ADMIN_EMAIL,
    id: SHANNON_ID,
    isAdmin: true,
    role: "administrator" as const,
  },
  throwOnChange = false,
  throwOnRead = false,
}: {
  access?: {
    email: string
    role: "super_admin"
    source: "supabase"
    userId: string
  }
  changeResult?: {
    isAdmin: boolean
    role: string
    targetUserId: string
  } | null
  environment?: Readonly<Record<string, string | undefined>>
  initialTarget?: {
    email: string
    id: string
    isAdmin: boolean
    role: "member" | "administrator" | "super_admin" | "invalid"
  } | null
  verifiedTarget?: {
    email: string
    id: string
    isAdmin: boolean
    role: "member" | "administrator" | "super_admin" | "invalid"
  } | null
  throwOnChange?: boolean
  throwOnRead?: boolean
} = {}) {
  let authorized = 0
  let changed = 0
  let reads = 0
  let roleInput:
    Parameters<ShannonAdminHandoffDependencies["changeRole"]>[0] | null = null

  const dependencies: ShannonAdminHandoffDependencies = {
    authorizeSuperAdmin: async () => {
      authorized += 1
      return access
    },
    changeRole: async (input) => {
      changed += 1
      roleInput = input
      if (throwOnChange) throw new Error("provider detail must stay private")
      return changeResult
    },
    environment,
    readTarget: async () => {
      reads += 1
      if (throwOnRead) throw new Error("provider detail must stay private")
      return reads === 1 ? initialTarget : verifiedTarget
    },
  }

  return {
    authorized: () => authorized,
    changed: () => changed,
    dependencies,
    reads: () => reads,
    roleInput: () => roleInput,
  }
}

test("the one-time config opens only on an exact closed Production SHA", () => {
  const config = getShannonAdminHandoffConfig(productionEnvironment)
  assert.deepEqual(config, {
    actorUserId: ACTOR_ID,
    approvalReference: "owner-approval:2026-09-12:shannon-admin",
    confirmationPhrase: "GRANT SHANNON ADMINISTRATOR",
    expectedGitSha: GIT_SHA,
    expectedRole: "member",
    mode: "grant",
    newRole: "administrator",
    targetUserId: SHANNON_ID,
  })
})

test("every drifted runtime or pinned value closes the gate", async (t) => {
  for (const [name, change] of [
    ["disabled", { ADMIN_SHANNON_HANDOFF_MODE: "disabled" }],
    ["preview", { HWL_DEPLOYMENT_TARGET: "preview", VERCEL_ENV: "preview" }],
    ["sales open", { COMMERCE_SALES_READY: "true" }],
    ["wrong domain", { NEXT_PUBLIC_SITE_URL: "https://hwlbysmd.com" }],
    [
      "wrong Supabase",
      { NEXT_PUBLIC_SUPABASE_URL: "https://lkxppynmdfzljuptauxf.supabase.co" },
    ],
    ["invalid actor", { ADMIN_SHANNON_HANDOFF_ACTOR_USER_ID: "not-a-uuid" }],
    ["same UUID", { ADMIN_SHANNON_HANDOFF_ACTOR_USER_ID: SHANNON_ID }],
    ["SHA mismatch", { VERCEL_GIT_COMMIT_SHA: "a".repeat(40) }],
    [
      "secret-shaped reference",
      { ADMIN_SHANNON_HANDOFF_APPROVAL_REFERENCE: "sk_live_not_an_approval" },
    ],
    [
      "prefixed secret-shaped reference",
      {
        ADMIN_SHANNON_HANDOFF_APPROVAL_REFERENCE:
          "owner-approval:github_pat_not_an_approval",
      },
    ],
  ] as const) {
    await t.test(name, async () => {
      const environment = { ...productionEnvironment, ...change }
      assert.equal(getShannonAdminHandoffConfig(environment), null)
      const harness = setup({ environment })
      const result = await handoffShannonAdministratorWithDependencies(
        "GRANT SHANNON ADMINISTRATOR",
        harness.dependencies
      )
      assert.equal(result.status, "unavailable")
      assert.equal(harness.reads(), 0)
      assert.equal(harness.changed(), 0)
    })
  }
})

test("the exact Ghosthand actor and confirmation phrase are mandatory", async (t) => {
  for (const [name, options, confirmation] of [
    [
      "wrong actor email",
      {
        access: {
          email: "other@example.com",
          role: "super_admin" as const,
          source: "supabase" as const,
          userId: ACTOR_ID,
        },
      },
      "GRANT SHANNON ADMINISTRATOR",
    ],
    [
      "wrong actor UUID",
      {
        access: {
          email: GHOSTHAND_SUPER_ADMIN_EMAIL,
          role: "super_admin" as const,
          source: "supabase" as const,
          userId: "01f75df6-25f4-4fe8-a17a-e17cd1eb9194",
        },
      },
      "GRANT SHANNON ADMINISTRATOR",
    ],
    ["wrong phrase", {}, "grant shannon administrator"],
  ] as const) {
    await t.test(name, async () => {
      const harness = setup(options)
      const result = await handoffShannonAdministratorWithDependencies(
        confirmation,
        harness.dependencies
      )
      assert.notEqual(result.status, "success")
      assert.equal(harness.reads(), 0)
      assert.equal(harness.changed(), 0)
    })
  }
})

test("only the pinned member-to-administrator RPC is submitted", async () => {
  const harness = setup()

  const result = await handoffShannonAdministratorWithDependencies(
    "GRANT SHANNON ADMINISTRATOR",
    harness.dependencies
  )

  assert.equal(result.status, "success")
  assert.deepEqual(harness.roleInput(), {
    approvalReference: "owner-approval:2026-09-12:shannon-admin",
    expectedRole: "member",
    newRole: "administrator",
    targetEmail: SHANNON_ADMIN_EMAIL,
    targetUserId: SHANNON_ID,
  })
  assert.equal(harness.changed(), 1)
  assert.equal(harness.reads(), 2)
})

test("the separately gated revoke path derives its inverse transition", async () => {
  const environment = {
    ...productionEnvironment,
    ADMIN_SHANNON_HANDOFF_APPROVAL_REFERENCE:
      "owner-approval:2026-09-12:shannon-revoke",
    ADMIN_SHANNON_HANDOFF_MODE: "revoke",
  }
  const harness = setup({
    changeResult: {
      isAdmin: false,
      role: "member",
      targetUserId: SHANNON_ID,
    },
    environment,
    initialTarget: {
      email: SHANNON_ADMIN_EMAIL,
      id: SHANNON_ID,
      isAdmin: true,
      role: "administrator",
    },
    verifiedTarget: {
      email: SHANNON_ADMIN_EMAIL,
      id: SHANNON_ID,
      isAdmin: false,
      role: "member",
    },
  })

  const result = await handoffShannonAdministratorWithDependencies(
    "REVOKE SHANNON ADMINISTRATOR",
    harness.dependencies
  )

  assert.equal(result.status, "success")
  assert.deepEqual(harness.roleInput(), {
    approvalReference: "owner-approval:2026-09-12:shannon-revoke",
    expectedRole: "administrator",
    newRole: "member",
    targetEmail: SHANNON_ADMIN_EMAIL,
    targetUserId: SHANNON_ID,
  })
})

test("role drift and ambiguous provider outcomes fail closed without detail", async (t) => {
  await t.test("current role drift", async () => {
    const harness = setup({
      initialTarget: {
        email: SHANNON_ADMIN_EMAIL,
        id: SHANNON_ID,
        isAdmin: true,
        role: "administrator",
      },
    })
    const result = await handoffShannonAdministratorWithDependencies(
      "GRANT SHANNON ADMINISTRATOR",
      harness.dependencies
    )
    assert.equal(result.status, "error")
    assert.equal(harness.changed(), 0)
  })

  for (const [name, options] of [
    ["RPC error", { changeResult: null }],
    ["RPC throw", { throwOnChange: true }],
    [
      "post-read mismatch",
      {
        verifiedTarget: {
          email: SHANNON_ADMIN_EMAIL,
          id: SHANNON_ID,
          isAdmin: false,
          role: "member" as const,
        },
      },
    ],
  ] as const) {
    await t.test(name, async () => {
      const harness = setup(options)
      const result = await handoffShannonAdministratorWithDependencies(
        "GRANT SHANNON ADMINISTRATOR",
        harness.dependencies
      )
      assert.equal(result.status, "unverified")
      assert.doesNotMatch(result.message, /provider detail/i)
    })
  }
})

test("the handoff implementation never imports the service-role client", () => {
  const source = readFileSync("lib/admin-role-handoff.ts", "utf8")
  assert.doesNotMatch(source, /createAdminClient|SUPABASE_SERVICE_ROLE_KEY/)
  assert.match(source, /createClient/)
  assert.match(source, /requireSuperAdmin/)
})

test("ambiguous completion is announced as an alert and success stays evidence-accurate", () => {
  const formSource = readFileSync(
    "app/admin/(protected)/settings/access/shannon-admin-handoff-form.tsx",
    "utf8"
  )
  const implementationSource = readFileSync("lib/admin-role-handoff.ts", "utf8")

  assert.match(
    formSource,
    /state\.status === "error" \|\| state\.status === "unverified"/
  )
  assert.match(
    formSource,
    /state\.status === "success" \|\| state\.status === "unverified"/
  )
  assert.match(formSource, /disabled=\{pending \|\| terminal\}/)
  assert.match(formSource, /aria-busy=\{pending\}/)
  assert.match(implementationSource, /profile is verified/)
  assert.match(
    implementationSource,
    /verify the matching append-only audit row/
  )
  assert.doesNotMatch(implementationSource, /is the recorded actor/)
})
