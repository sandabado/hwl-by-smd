import assert from "node:assert/strict"
import { test } from "node:test"

import {
  requireAdminWithDependencies,
  type AdminAuthorizationDependencies,
} from "../lib/admin-auth.ts"

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
  user = true,
  userEmail = "admin@ghosthand.studio",
}: {
  confirmedAt?: string | null
  demo?: boolean
  profileAdmin?: boolean
  profileId?: string
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
})

test("an exact confirmed administrator receives the minimal access identity", async () => {
  const setup = dependencies({ userEmail: "  Admin@Ghosthand.Studio  " })

  assert.deepEqual(await requireAdminWithDependencies(setup.deps), {
    email: "admin@ghosthand.studio",
    source: "supabase",
    userId: USER_ID,
  })
  assert.equal(setup.profileReadCount(), 1)
})
