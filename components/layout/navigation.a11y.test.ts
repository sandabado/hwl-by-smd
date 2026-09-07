import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import ts from "typescript"

interface LoadedNavConfig {
  ACCOUNT_NAV_LABEL: string
  BOOKING_NAV_ITEM: { href: string; label: string }
  getActiveMainNavHref: (pathname: string) => string | undefined
  isCurrentPath: (pathname: string, href: string) => boolean
}

const navItems = [
  { label: "Beauty", href: "/beauty" },
  { label: "Body", href: "/yoga" },
  { label: "Being", href: "/astrology" },
  { label: "LIFT", href: "/beauty/lift" },
  { label: "Retreats", href: "/retreats" },
  { label: "About", href: "/about" },
]

function source(path: string) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8")
}

function loadNavConfig(): LoadedNavConfig {
  const compiled = ts.transpileModule(source("lib/nav-config.ts"), {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText
  const loadedModule: { exports: Partial<LoadedNavConfig> } = { exports: {} }

  new Function("require", "module", "exports", compiled)(
    (specifier: string) => {
      if (specifier === "./constants") return { NAV_ITEMS: navItems }
      throw new Error(`Unexpected navigation test import: ${specifier}`)
    },
    loadedModule,
    loadedModule.exports
  )

  const loaded = loadedModule.exports
  assert.equal(typeof loaded.getActiveMainNavHref, "function")
  assert.equal(typeof loaded.isCurrentPath, "function")
  assert.ok(loaded.BOOKING_NAV_ITEM)
  assert.ok(loaded.ACCOUNT_NAV_LABEL)

  return loaded as LoadedNavConfig
}

test("navigation has one canonical action vocabulary", () => {
  const nav = loadNavConfig()

  assert.deepEqual(nav.BOOKING_NAV_ITEM, {
    href: "/book",
    label: "Book a Session",
  })
  assert.equal(nav.ACCOUNT_NAV_LABEL, "My Account")
})

test("the most specific main navigation item owns aria-current", () => {
  const nav = loadNavConfig()

  assert.equal(nav.getActiveMainNavHref("/beauty"), "/beauty")
  assert.equal(nav.getActiveMainNavHref("/beauty/lift"), "/beauty/lift")
  assert.equal(nav.getActiveMainNavHref("/beauty/lift/welcome"), "/beauty/lift")
  assert.equal(nav.getActiveMainNavHref("/book"), undefined)
  assert.equal(nav.isCurrentPath("/book/confirmation", "/book"), true)
  assert.equal(nav.isCurrentPath("/booking", "/book"), false)
})

test("global navigation keeps landmarks, current state, and named utility controls", () => {
  const mainNav = source("components/layout/main-nav.tsx")
  const mobileNav = source("components/layout/mobile-nav.tsx")
  const header = source("components/layout/header.tsx")
  const auth = source("components/auth/auth-links.tsx")
  const cart = source("components/cart/cart-trigger.tsx")
  const layout = source("app/layout.tsx")

  assert.match(mainNav, /aria-label="Main"/)
  assert.match(mainNav, /aria-current=\{isActive \? "page" : undefined\}/)
  assert.match(mobileNav, /aria-label="Mobile main"/)
  assert.match(mobileNav, /aria-label="Open navigation menu"/)
  assert.match(header, /aria-label="HWL by SMD home"/)
  assert.match(auth, /aria-label=\{mobile \? undefined : ACCOUNT_NAV_LABEL\}/)
  assert.match(cart, /aria-controls="site-cart-sheet"/)
  assert.match(cart, /aria-expanded=\{isOpen\}/)
  assert.match(cart, /aria-haspopup="dialog"/)
  assert.match(layout, /<SkipLink \/>/)
  assert.match(layout, /id="main-content"/)
})

test("persistent header actions retain generous pointer targets", () => {
  const mainNav = source("components/layout/main-nav.tsx")
  const mobileNav = source("components/layout/mobile-nav.tsx")
  const header = source("components/layout/header.tsx")
  const auth = source("components/auth/auth-links.tsx")
  const cart = source("components/cart/cart-trigger.tsx")

  assert.match(mainNav, /min-h-11/)
  assert.match(mobileNav, /className="size-11/)
  assert.match(header, /className="min-h-11 rounded-full/)
  assert.match(auth, /"size-11 p-0"/)
  assert.match(cart, /"w-11 px-0"/)
})
