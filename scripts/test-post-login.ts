import assert from "node:assert/strict"
import { test } from "node:test"

import {
  handlePostLogin,
  type PostLoginDependencies,
} from "../lib/post-login.ts"

function dependencies(
  overrides: {
    role?: string | null
    roleError?: unknown | null
    user?: { id: string } | null
    userError?: unknown | null
  } = {}
): PostLoginDependencies {
  return {
    createClient: async () => ({
      auth: {
        getUser: async () => ({
          data: {
            user:
              overrides.user === undefined ? { id: "user-1" } : overrides.user,
          },
          error: overrides.userError ?? null,
        }),
      },
      rpc: async (name) => {
        assert.equal(name, "current_admin_role")
        return {
          data: overrides.role ?? null,
          error: overrides.roleError ?? null,
        }
      },
    }),
  }
}

test("administrator sign-ins always land in the Admin Center", async (t) => {
  for (const role of ["administrator", "super_admin"]) {
    await t.test(role, async () => {
      for (const next of ["/library", "/the-den", "/account"]) {
        const response = await handlePostLogin(
          new Request(
            `https://preview.hwlbysmd.com/auth/post-login?next=${encodeURIComponent(next)}`
          ),
          dependencies({ role })
        )

        assert.equal(response.status, 307)
        assert.equal(
          response.headers.get("location"),
          "https://preview.hwlbysmd.com/admin"
        )
        assert.equal(response.headers.get("cache-control"), "no-store")
        assert.equal(response.headers.get("pragma"), "no-cache")
        assert.equal(response.headers.get("referrer-policy"), "no-referrer")
      }
    })
  }
})

test("both administrator tiers preserve explicit Admin Center destinations", async (t) => {
  for (const role of ["administrator", "super_admin"]) {
    await t.test(role, async () => {
      for (const next of [
        "/admin",
        "/admin/clients?status=active",
        "/admin/settings/access",
      ]) {
        const response = await handlePostLogin(
          new Request(
            `https://www.hwlbysmd.com/auth/post-login?next=${encodeURIComponent(next)}`
          ),
          dependencies({ role })
        )

        assert.equal(
          response.headers.get("location"),
          `https://www.hwlbysmd.com${next}`
        )
      }
    })
  }
})

test("administrators preserve high-intent destinations", async (t) => {
  for (const next of [
    "/checkout/success?session_id=cs_test_123",
    "/course/lift",
    "/lesson/jawline-lift",
    "/beauty/lift?cart=open",
    "/account?notice=password-updated",
  ]) {
    await t.test(next, async () => {
      const response = await handlePostLogin(
        new Request(
          `https://www.hwlbysmd.com/auth/post-login?next=${encodeURIComponent(next)}`
        ),
        dependencies({ role: "super_admin" })
      )

      assert.equal(
        response.headers.get("location"),
        `https://www.hwlbysmd.com${next}`
      )
    })
  }
})

test("members preserve every safe requested destination", async (t) => {
  for (const next of [
    "/library",
    "/the-den",
    "/account",
    "/beauty/lift?cart=open",
    "/admin/clients",
  ]) {
    await t.test(next, async () => {
      const response = await handlePostLogin(
        new Request(
          `https://www.hwlbysmd.com/auth/post-login?next=${encodeURIComponent(next)}`
        ),
        dependencies()
      )

      assert.equal(
        response.headers.get("location"),
        `https://www.hwlbysmd.com${next}`
      )
    })
  }
})

test("unknown, inconsistent, and failed role lookups cannot grant admin routing", async (t) => {
  for (const overrides of [
    { role: "owner" },
    { role: "super_admin", roleError: new Error("private provider detail") },
  ]) {
    await t.test(
      JSON.stringify({
        role: overrides.role,
        roleError: Boolean(overrides.roleError),
      }),
      async () => {
        const response = await handlePostLogin(
          new Request(
            "https://www.hwlbysmd.com/auth/post-login?next=%2Flibrary"
          ),
          dependencies(overrides)
        )

        assert.equal(
          response.headers.get("location"),
          "https://www.hwlbysmd.com/library"
        )
        assert.equal(
          response.headers.get("location")?.includes("private"),
          false
        )
      }
    )
  }
})

test("external and malformed destinations fall back to the library", async (t) => {
  for (const next of [
    "https://evil.example/steal",
    "//evil.example/steal",
    "%2Fa%2F..%2F%2Fevil.example%2Fsteal",
  ]) {
    await t.test(next, async () => {
      const response = await handlePostLogin(
        new Request(
          `https://www.hwlbysmd.com/auth/post-login?next=${encodeURIComponent(next)}`
        ),
        dependencies()
      )

      assert.equal(
        response.headers.get("location"),
        "https://www.hwlbysmd.com/library"
      )
    })
  }
})

test("missing or failed sessions preserve the safe destination on login", async (t) => {
  for (const overrides of [
    { user: null },
    { userError: new Error("private provider detail") },
  ]) {
    await t.test(JSON.stringify(Object.keys(overrides)), async () => {
      const response = await handlePostLogin(
        new Request(
          "https://www.hwlbysmd.com/auth/post-login?next=%2Fadmin%2Fclients%3Fstatus%3Dactive"
        ),
        dependencies(overrides)
      )

      assert.equal(
        response.headers.get("location"),
        "https://www.hwlbysmd.com/login?redirectTo=%2Fadmin%2Fclients%3Fstatus%3Dactive"
      )
      assert.equal(response.headers.get("location")?.includes("private"), false)
    })
  }
})

test("unexpected provider failures fall back without exposing details", async () => {
  const response = await handlePostLogin(
    new Request("https://www.hwlbysmd.com/auth/post-login?next=%2Flibrary"),
    {
      createClient: async () => {
        throw new Error("private provider detail")
      },
    }
  )

  assert.equal(
    response.headers.get("location"),
    "https://www.hwlbysmd.com/library"
  )
  assert.equal(response.headers.get("location")?.includes("private"), false)
})

test("an explicit protected destination never bypasses its own final guard", async () => {
  const response = await handlePostLogin(
    new Request(
      "https://www.hwlbysmd.com/auth/post-login?next=%2Fadmin%2Fclients"
    ),
    {
      createClient: async () => {
        throw new Error("private provider detail")
      },
    }
  )

  assert.equal(
    response.headers.get("location"),
    "https://www.hwlbysmd.com/admin/clients"
  )
  assert.equal(response.headers.get("cache-control"), "no-store")
})
