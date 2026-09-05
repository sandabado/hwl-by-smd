import assert from "node:assert/strict"
import { test } from "node:test"

import {
  handleAdminLogout,
  type AdminLogoutDependencies,
} from "../lib/admin-logout.ts"

function request(
  url = "https://www.hwlbysmd.com/admin/api/logout",
  origin = "https://www.hwlbysmd.com"
) {
  return new Request(url, {
    headers: origin ? { origin } : undefined,
    method: "POST",
  })
}

function dependencies(
  overrides: Partial<AdminLogoutDependencies> = {}
): AdminLogoutDependencies {
  return {
    createClient: async () => ({
      auth: { signOut: async () => ({ error: null }) },
    }),
    hasDemoAdminSession: async () => false,
    isDemoAdminEnabled: () => false,
    isLocalRequest: () => false,
    ...overrides,
  }
}

test("admin logout signs out Supabase and redirects to the fixed login path", async () => {
  let signOutCalls = 0
  const response = await handleAdminLogout(
    request(
      "https://www.hwlbysmd.com/admin/api/logout?redirectTo=https://evil.example"
    ),
    dependencies({
      createClient: async () => ({
        auth: {
          signOut: async () => {
            signOutCalls += 1
            return { error: null }
          },
        },
      }),
    })
  )

  assert.equal(signOutCalls, 1)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    redirectTo: "/login?redirectTo=/admin",
    success: true,
  })
  assert.equal(response.headers.get("cache-control"), "no-store")
})

test("admin logout rejects cross-origin and originless mutations", async (t) => {
  let createClientCalls = 0
  const deps = dependencies({
    createClient: async () => {
      createClientCalls += 1
      return null
    },
  })

  await t.test("cross-origin request", async () => {
    const response = await handleAdminLogout(
      request(undefined, "https://evil.example"),
      deps
    )
    assert.equal(response.status, 403)
  })

  await t.test("missing Origin header", async () => {
    const response = await handleAdminLogout(request(undefined, ""), deps)
    assert.equal(response.status, 403)
  })

  assert.equal(createClientCalls, 0)
})

test("local demo logout expires only the demo cookie", async () => {
  let createClientCalls = 0
  const response = await handleAdminLogout(
    request("http://localhost:3000/admin/api/logout", "http://localhost:3000"),
    dependencies({
      createClient: async () => {
        createClientCalls += 1
        return null
      },
      hasDemoAdminSession: async () => true,
      isDemoAdminEnabled: () => true,
      isLocalRequest: () => true,
    })
  )

  assert.equal(createClientCalls, 0)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    redirectTo: "/admin/login",
    success: true,
  })
  assert.match(response.headers.get("set-cookie") ?? "", /hwl-demo-admin=/)
  assert.match(response.headers.get("set-cookie") ?? "", /Max-Age=0/i)
  assert.match(response.headers.get("set-cookie") ?? "", /Path=\/admin/i)
})

test("real logout fails closed when Supabase is unavailable", async (t) => {
  await t.test("missing client", async () => {
    const response = await handleAdminLogout(
      request(),
      dependencies({ createClient: async () => null })
    )
    assert.equal(response.status, 503)
    assert.equal(response.headers.get("location"), null)
  })

  await t.test("provider error", async () => {
    const response = await handleAdminLogout(
      request(),
      dependencies({
        createClient: async () => ({
          auth: { signOut: async () => ({ error: new Error("private") }) },
        }),
      })
    )
    assert.equal(response.status, 503)
    assert.equal(response.headers.get("location"), null)
    assert.equal((await response.json()).error.includes("private"), false)
  })

  await t.test("unexpected exception", async () => {
    const response = await handleAdminLogout(
      request(),
      dependencies({
        createClient: async () => {
          throw new Error("private")
        },
      })
    )
    assert.equal(response.status, 503)
    assert.equal(response.headers.get("location"), null)
  })
})
