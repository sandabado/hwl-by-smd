import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
}

const redirects = [
  ["app/admin/(protected)/calendar/page.tsx", "/admin/bookings"],
  ["app/admin/(protected)/bookings/[id]/page.tsx", "/admin/bookings"],
  ["app/admin/(protected)/revenue/page.tsx", "/admin/store"],
  ["app/admin/(protected)/content/page.tsx", "/admin/website"],
  ["app/admin/(protected)/content/[id]/page.tsx", "/admin/website"],
  ["app/admin/(protected)/courses/page.tsx", "/admin/website"],
  ["app/admin/(protected)/courses/[id]/page.tsx", "/admin/website"],
  [
    "app/admin/(protected)/courses/[id]/lessons/[lesson]/page.tsx",
    "/admin/website",
  ],
  ["app/admin/(protected)/journeys/page.tsx", "/admin/website"],
  ["app/admin/(protected)/journeys/composer/page.tsx", "/admin/website"],
  ["app/admin/(protected)/journeys/insights/page.tsx", "/admin/website"],
  ["app/admin/(protected)/journeys/templates/page.tsx", "/admin/website"],
  ["app/admin/(protected)/connection/page.tsx", "/admin/messages"],
  ["app/admin/(protected)/campaigns/page.tsx", "/admin/website"],
  ["app/admin/(protected)/campaigns/analytics/page.tsx", "/admin/website"],
  ["app/admin/(protected)/campaigns/composer/page.tsx", "/admin/website"],
  ["app/admin/(protected)/campaigns/templates/page.tsx", "/admin/website"],
  ["app/admin/(protected)/campaigns/conversations/page.tsx", "/admin/messages"],
] as const

test("legacy fixture routes redirect to truthful protected operations", () => {
  for (const [path, destination] of redirects) {
    const page = source(path)

    assert.ok(page.includes(`redirect("${destination}")`), path)
    assert.doesNotMatch(page, /admin-preview-data|Sample|Illustrative/, path)
  }
})

test("settings is a read-only configuration and authority view", () => {
  const page = source("app/admin/(protected)/settings/page.tsx")

  assert.match(page, /await requireAdmin\(\)/)
  assert.match(page, /Configuration presence is not a provider test\./)
  assert.match(page, /Secret values are never rendered/)
  assert.match(page, /getStripeDashboardBaseUrl/)
  assert.match(page, /getCalcomPublicEventTypes/)
  assert.doesNotMatch(
    page,
    /ReadOnlyButton|FieldPreview|Save changes|Add person|type="checkbox"/
  )
  assert.doesNotMatch(page, /admin-preview-data|Sample preview|Illustrative/)
})

test("booking invoice handoff is scoped to the expected Stripe account and mode", () => {
  const page = source("app/admin/(protected)/bookings/page.tsx")

  assert.match(page, /getExpectedStripeAccountId/)
  assert.match(page, /getExpectedStripeLivemode/)
  assert.match(page, /getStripeDashboardBaseUrl/)
  assert.doesNotMatch(
    page,
    /const STRIPE_INVOICES_URL = "https:\/\/dashboard\.stripe\.com\/invoices"/
  )
})
