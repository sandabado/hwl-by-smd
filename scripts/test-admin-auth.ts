import assert from "node:assert/strict"
import { test } from "node:test"

import {
  requireAdminWithDependencies,
  requireSuperAdminWithDependencies,
  type AdminAuthorizationDependencies,
} from "../lib/admin-auth.ts"
import {
  getCurrentAdminRoleWithDependencies,
  type CurrentAdminRoleDependencies,
} from "../lib/current-admin-role.ts"

const USER_ID = "2db86e10-4c97-45c3-a8b6-0ef074881091"

class NavigationDenied extends Error {
  readonly destination: string

  constructor(destination: string) {
    super(destination)
    this.destination = destination
  }
}

function dependencies({
  confirmedAt = "2026-09-06T20:00:00.000Z",
  demo = false,
  profileAdmin = true,
  profileId = USER_ID,
  profileRole = "administrator",
  user = true,
  userEmail = "admin@ghosthand.studio",
}: {
  confirmedAt?: string | null
  demo?: boolean
  profileAdmin?: boolean
  profileId?: string
  profileRole?: string | null
  user?: boolean
  userEmail?: string
} = {}) {
  let profileReads = 0

  const deps: AdminAuthorizationDependencies = {
    createClient: async () => ({
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
    }),
    hasDemoAdminSession: async () => demo,
    isDemoAdminEnabled: () => demo,
    notFound: () => {
      throw new NavigationDenied("not-found")
    },
    redirect: (path) => {
      throw new NavigationDenied(path)
    },
  }

  return { deps, profileReadCount: () => profileReads }
}

test("signed-out users are redirected before an administrator profile read", async () => {
  const setup = dependencies({ user: false })

  await assert.rejects(
    requireAdminWithDependencies(setup.deps),
    (error) =>
      error instanceof NavigationDenied &&
      error.destination === "/login?redirectTo=/admin"
  )
  assert.equal(setup.profileReadCount(), 0)
})

test("unconfirmed and non-administrator identities fail closed", async (t) => {
  await t.test("unconfirmed user", async () => {
    const setup = dependencies({ confirmedAt: null })
    await assert.rejects(
      requireAdminWithDependencies(setup.deps),
      (error) =>
        error instanceof NavigationDenied && error.destination === "not-found"
    )
    assert.equal(setup.profileReadCount(), 0)
  })

  await t.test("non-administrator profile", async () => {
    const setup = dependencies({ profileAdmin: false })
    await assert.rejects(
      requireAdminWithDependencies(setup.deps),
      (error) =>
        error instanceof NavigationDenied && error.destination === "not-found"
    )
    assert.equal(setup.profileReadCount(), 1)
  })

  await t.test("mismatched profile identity", async () => {
    const setup = dependencies({
      profileId: "ef49969e-133e-45ae-95c0-c31af90a4660",
    })
    await assert.rejects(
      requireAdminWithDependencies(setup.deps),
      (error) =>
        error instanceof NavigationDenied && error.destination === "not-found"
    )
    assert.equal(setup.profileReadCount(), 1)
  })

  await t.test("administrator flag without an explicit role", async () => {
    const setup = dependencies({ profileRole: null })
    await assert.rejects(
      requireAdminWithDependencies(setup.deps),
      (error) =>
        error instanceof NavigationDenied && error.destination === "not-found"
    )
    assert.equal(setup.profileReadCount(), 1)
  })

  await t.test("unknown administrator role", async () => {
    const setup = dependencies({ profileRole: "owner" })
    await assert.rejects(
      requireAdminWithDependencies(setup.deps),
      (error) =>
        error instanceof NavigationDenied && error.destination === "not-found"
    )
    assert.equal(setup.profileReadCount(), 1)
  })
})

test("an exact confirmed administrator receives the minimal access identity", async () => {
  const setup = dependencies({ userEmail: "  Admin@Ghosthand.Studio  " })

  assert.deepEqual(await requireAdminWithDependencies(setup.deps), {
    email: "admin@ghosthand.studio",
    role: "administrator",
    source: "supabase",
    userId: USER_ID,
  })
  assert.equal(setup.profileReadCount(), 1)
})

test("a super administrator receives the explicit higher tier", async () => {
  const setup = dependencies({ profileRole: "super_admin" })

  assert.deepEqual(await requireAdminWithDependencies(setup.deps), {
    email: "admin@ghosthand.studio",
    role: "super_admin",
    source: "supabase",
    userId: USER_ID,
  })
})

test("the super-admin guard rejects every lower-trust principal", async (t) => {
  await t.test("ordinary administrator", async () => {
    const setup = dependencies({ profileRole: "administrator" })
    await assert.rejects(
      requireSuperAdminWithDependencies(setup.deps),
      (error) =>
        error instanceof NavigationDenied && error.destination === "not-found"
    )
  })

  await t.test("local preview administrator", async () => {
    const setup = dependencies({ demo: true })
    await assert.rejects(
      requireSuperAdminWithDependencies(setup.deps),
      (error) =>
        error instanceof NavigationDenied && error.destination === "not-found"
    )
    assert.equal(setup.profileReadCount(), 0)
  })
})

test("the super-admin guard accepts only an explicit hosted super-admin role", async () => {
  const setup = dependencies({ profileRole: "super_admin" })

  assert.deepEqual(await requireSuperAdminWithDependencies(setup.deps), {
    email: "admin@ghosthand.studio",
    role: "super_admin",
    source: "supabase",
    userId: USER_ID,
  })
})

test("optional administrator navigation recognizes both hosted tiers", async (t) => {
  for (const role of ["administrator", "super_admin"] as const) {
    await t.test(role, async () => {
      const dependencies: CurrentAdminRoleDependencies = {
        createClient: async () => ({
          rpc: async (name) => {
            assert.equal(name, "current_admin_role")
            return { data: role, error: null }
          },
        }),
      }

      assert.equal(
        await getCurrentAdminRoleWithDependencies(dependencies),
        role
      )
    })
  }
})

test("optional administrator navigation fails closed", async (t) => {
  const cases: Array<{
    name: string
    dependencies: CurrentAdminRoleDependencies
  }> = [
    {
      name: "missing client",
      dependencies: { createClient: async () => null },
    },
    {
      name: "ordinary member",
      dependencies: {
        createClient: async () => ({
          rpc: async () => ({ data: null, error: null }),
        }),
      },
    },
    {
      name: "unknown role",
      dependencies: {
        createClient: async () => ({
          rpc: async () => ({ data: "owner", error: null }),
        }),
      },
    },
    {
      name: "provider error",
      dependencies: {
        createClient: async () => ({
          rpc: async () => ({ data: "super_admin", error: new Error("no") }),
        }),
      },
    },
    {
      name: "provider RPC exception",
      dependencies: {
        createClient: async () => ({
          rpc: async () => {
            throw new Error("private provider detail")
          },
        }),
      },
    },
    {
      name: "provider exception",
      dependencies: {
        createClient: async () => {
          throw new Error("private provider detail")
        },
      },
    },
  ]

  for (const item of cases) {
    await t.test(item.name, async () => {
      assert.equal(
        await getCurrentAdminRoleWithDependencies(item.dependencies),
        null
      )
    })
  }
})
