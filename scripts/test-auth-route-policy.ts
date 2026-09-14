import assert from "node:assert/strict"
import { test } from "node:test"

import {
  isHostedAdminPage,
  requiresSupabaseSession,
  supabaseLoginUrl,
} from "../lib/auth-route-policy.ts"

test("hosted admin pages require a Supabase session", async (t) => {
  for (const pathname of [
    "/admin",
    "/admin/clients",
    "/admin/settings/access",
  ]) {
    await t.test(pathname, () => {
      assert.equal(isHostedAdminPage(pathname), true)
      assert.equal(requiresSupabaseSession(pathname), true)
    })
  }
})

test("admin login, admin APIs, and lookalike paths stay outside the page gate", async (t) => {
  for (const pathname of [
    "/admin/login",
    "/admin/api",
    "/admin/api/logout",
    "/administration",
  ]) {
    await t.test(pathname, () => {
      assert.equal(isHostedAdminPage(pathname), false)
      assert.equal(requiresSupabaseSession(pathname), false)
    })
  }
})

test("local demo-admin pages keep their dedicated login flow", () => {
  assert.equal(
    requiresSupabaseSession("/admin/clients", { demoAdminEnabled: true }),
    false
  )
  assert.equal(
    requiresSupabaseSession("/library", { demoAdminEnabled: true }),
    true
  )
})

test("login redirects preserve the exact admin deep link and query", () => {
  const requestUrl = new URL(
    "https://preview.hwlbysmd.com/admin/clients?status=active&sort=recent"
  )
  const loginUrl = supabaseLoginUrl(requestUrl)

  assert.equal(loginUrl.origin, requestUrl.origin)
  assert.equal(loginUrl.pathname, "/login")
  assert.equal(
    loginUrl.searchParams.get("redirectTo"),
    "/admin/clients?status=active&sort=recent"
  )
  assert.deepEqual([...loginUrl.searchParams.keys()], ["redirectTo"])
  assert.equal(
    requestUrl.href,
    "https://preview.hwlbysmd.com/admin/clients?status=active&sort=recent"
  )
})

test("member route matching is segment-aware", () => {
  assert.equal(requiresSupabaseSession("/account"), true)
  assert.equal(requiresSupabaseSession("/account/profile"), true)
  assert.equal(requiresSupabaseSession("/accounting"), false)
})
