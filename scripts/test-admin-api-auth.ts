import assert from "node:assert/strict"
import { test } from "node:test"

import {
  authenticateAdminApiWithDependencies,
  type ApiAdminAuthorizationDependencies,
} from "../lib/relationships/admin-api.ts"

const USER_ID = "2db86e10-4c97-45c3-a8b6-0ef074881091"
const request = new Request("https://www.hwlbysmd.com/admin/api/example")

function dependencies({
  confirmedAt = "2026-09-07T18:00:00.000Z",
  demoEnabled = false,
  demoSession = false,
  localRequest = false,
  profileAdmin = true,
  profileId = USER_ID,
  profileRole = "administrator",
  supabaseConfigured = true,
  user = true,
  userEmail = "admin@ghosthand.studio",
}: {
  confirmedAt?: string | null
  demoEnabled?: boolean
  demoSession?: boolean
  localRequest?: boolean
  profileAdmin?: boolean
  profileId?: string
  profileRole?: string | null
  supabaseConfigured?: boolean
  user?: boolean
  userEmail?: string | null
} = {}) {
  let profileReads = 0

  const deps: ApiAdminAuthorizationDependencies = {
    createClient: async () =>
      supabaseConfigured
        ? {
            auth: {
              getUser: async () => ({
                data: {
                  user: user
                    ? {
                        email: userEmail,
                        email_confirmed_at: confirmedAt,
                        id: USER_ID,
                      }
                    : null,
                },
                error: null,
              }),
            },
            from: () => ({
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => {
                    profileReads += 1
                    return {
                      data: {
                        admin_role: profileRole,
                        id: profileId,
                        is_admin: profileAdmin,
                      },
                      error: null,
                    }
                  },
                }),
              }),
            }),
          }
        : null,
    hasDemoAdminSession: async () => demoSession,
    isDemoAdminEnabled: () => demoEnabled,
    isLocalRequest: () => localRequest,
  }

  return { deps, profileReadCount: () => profileReads }
}

test("admin API rejects a missing session before reading a profile", async () => {
  const setup = dependencies({ user: false })

  assert.deepEqual(
    await authenticateAdminApiWithDependencies(request, setup.deps),
    { ok: false, status: 401 }
  )
  assert.equal(setup.profileReadCount(), 0)
})

test("admin API rejects unconfirmed or unidentified users before profile access", async (t) => {
  for (const [name, overrides] of [
    ["unconfirmed email", { confirmedAt: null }],
    ["missing email", { userEmail: null }],
    ["blank email", { userEmail: "   " }],
  ] as const) {
    await t.test(name, async () => {
      const setup = dependencies(overrides)
      assert.deepEqual(
        await authenticateAdminApiWithDependencies(request, setup.deps),
        { ok: false, status: 403 }
      )
      assert.equal(setup.profileReadCount(), 0)
    })
  }
})

test("an approved email alone never grants administrator API access", async (t) => {
  for (const userEmail of ["admin@ghosthand.studio", "shannon@hwlbysmd.com"]) {
    await t.test(userEmail, async () => {
      const setup = dependencies({ profileAdmin: false, userEmail })
      assert.deepEqual(
        await authenticateAdminApiWithDependencies(request, setup.deps),
        { ok: false, status: 403 }
      )
      assert.equal(setup.profileReadCount(), 1)
    })
  }
})

test("admin API rejects a mismatched profile identity", async () => {
  const setup = dependencies({
    profileId: "ef49969e-133e-45ae-95c0-c31af90a4660",
  })

  assert.deepEqual(
    await authenticateAdminApiWithDependencies(request, setup.deps),
    { ok: false, status: 403 }
  )
  assert.equal(setup.profileReadCount(), 1)
})

test("admin API rejects missing and unrecognized role tiers", async (t) => {
  for (const profileRole of [null, "owner"]) {
    await t.test(String(profileRole), async () => {
      const setup = dependencies({ profileRole })
      assert.deepEqual(
        await authenticateAdminApiWithDependencies(request, setup.deps),
        { ok: false, status: 403 }
      )
    })
  }
})

test("both confirmed owner-approved administrators pass the same technical guard", async (t) => {
  for (const userEmail of ["admin@ghosthand.studio", "shannon@hwlbysmd.com"]) {
    await t.test(userEmail, async () => {
      const setup = dependencies({ userEmail })
      assert.deepEqual(
        await authenticateAdminApiWithDependencies(request, setup.deps),
        {
          access: {
            role: "administrator",
            source: "supabase",
            userId: USER_ID,
          },
          ok: true,
        }
      )
      assert.equal(setup.profileReadCount(), 1)
    })
  }
})

test("the demo administrator bypass is local-only and otherwise fails closed", async (t) => {
  await t.test("enabled local preview", async () => {
    const setup = dependencies({
      demoEnabled: true,
      demoSession: true,
      localRequest: true,
      supabaseConfigured: false,
    })
    assert.deepEqual(
      await authenticateAdminApiWithDependencies(request, setup.deps),
      {
        access: {
          role: "administrator",
          source: "local-preview",
          userId: null,
        },
        ok: true,
      }
    )
  })

  await t.test("non-local request", async () => {
    const setup = dependencies({
      demoEnabled: true,
      demoSession: true,
      localRequest: false,
      supabaseConfigured: false,
    })
    assert.deepEqual(
      await authenticateAdminApiWithDependencies(request, setup.deps),
      { ok: false, status: 503 }
    )
  })
})

test("admin API returns an explicit hosted super-admin tier", async () => {
  const setup = dependencies({ profileRole: "super_admin" })

  assert.deepEqual(
    await authenticateAdminApiWithDependencies(request, setup.deps),
    {
      access: {
        role: "super_admin",
        source: "supabase",
        userId: USER_ID,
      },
      ok: true,
    }
  )
})
