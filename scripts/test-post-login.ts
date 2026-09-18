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

test("generic administrator sign-ins land in the Control Room", async (t) => {
  for (const role of ["administrator", "super_admin"]) {
    await t.test(role, async () => {
      const response = await handlePostLogin(
        new Request(
          "https://preview.hwlbysmd.com/auth/post-login?next=%2Flibrary"
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
    })
  }
})

test("members preserve the safe member destination", async () => {
  const response = await handlePostLogin(
    new Request(
      "https://www.hwlbysmd.com/auth/post-login?next=%2Fbeauty%2Flift%3Fcart%3Dopen"
    ),
    dependencies()
  )

  assert.equal(
    response.headers.get("location"),
    "https://www.hwlbysmd.com/beauty/lift?cart=open"
  )
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

test("missing sessions return to the generic role-aware login", async () => {
  const response = await handlePostLogin(
    new Request("https://www.hwlbysmd.com/auth/post-login?next=%2Flibrary"),
    dependencies({ user: null })
  )

  assert.equal(
    response.headers.get("location"),
    "https://www.hwlbysmd.com/login"
  )
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
