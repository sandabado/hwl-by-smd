import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import test from "node:test"

import { createElement, type ComponentType, type ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"

interface LoadedNavConfig {
  ACCOUNT_NAV_LABEL: string
  BOOKING_NAV_ITEM: { href: string; label: string }
  getActiveMainNavHref: (pathname: string) => string | undefined
  isCurrentPath: (pathname: string, href: string) => boolean
}

interface LoadedHydratedPathname {
  resolveHydratedPathname: (
    pathname: string,
    committedPathname: string | null
  ) => string | null
}

interface LoadedDenLinks {
  BackToDenLink: ComponentType<{ showAdminCenter?: boolean }>
  DenShortcuts: ComponentType<{ showAdminCenter?: boolean }>
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

function loadHydratedPathname(): LoadedHydratedPathname {
  const compiled = ts.transpileModule(
    source("components/layout/use-hydrated-pathname.ts"),
    {
      compilerOptions: {
        esModuleInterop: true,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }
  ).outputText
  const loadedModule: { exports: Partial<LoadedHydratedPathname> } = {
    exports: {},
  }

  new Function("require", "module", "exports", compiled)(
    (specifier: string) => {
      if (specifier === "react") {
        return { useEffect: () => undefined, useState: () => [null, () => {}] }
      }
      if (specifier === "next/navigation") {
        return { usePathname: () => "/" }
      }
      throw new Error(`Unexpected hydrated pathname test import: ${specifier}`)
    },
    loadedModule,
    loadedModule.exports
  )

  assert.equal(typeof loadedModule.exports.resolveHydratedPathname, "function")
  return loadedModule.exports as LoadedHydratedPathname
}

function loadDenLinks(): LoadedDenLinks {
  const compiled = ts.transpileModule(
    source("components/member/den-links.tsx"),
    {
      compilerOptions: {
        esModuleInterop: true,
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }
  ).outputText
  const loadedModule: { exports: Partial<LoadedDenLinks> } = { exports: {} }
  const projectRequire = createRequire(import.meta.url)
  const Icon = (props: Record<string, unknown>) => createElement("svg", props)
  const Link = ({
    children,
    href,
    ...props
  }: {
    children?: ReactNode
    href: string
  }) => createElement("a", { ...props, href }, children)

  new Function("require", "module", "exports", compiled)(
    (specifier: string) => {
      if (specifier === "next/link") return Link
      if (specifier === "lucide-react") {
        return {
          ArrowLeft: Icon,
          ArrowUpRight: Icon,
          BookOpenText: Icon,
          CalendarHeart: Icon,
          LayoutDashboard: Icon,
          UserRound: Icon,
        }
      }
      return projectRequire(specifier)
    },
    loadedModule,
    loadedModule.exports
  )

  assert.ok(loadedModule.exports.DenShortcuts)
  assert.ok(loadedModule.exports.BackToDenLink)
  return loadedModule.exports as LoadedDenLinks
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

test("pathname-dependent shells keep a stable hydration fallback", () => {
  const { resolveHydratedPathname } = loadHydratedPathname()

  assert.equal(resolveHydratedPathname("/index", null), null)
  assert.equal(resolveHydratedPathname("/", null), null)
  assert.equal(resolveHydratedPathname("/", "/"), "/")
  assert.equal(resolveHydratedPathname("/book", "/"), null)
  assert.equal(resolveHydratedPathname("/book", "/book"), "/book")

  const hook = source("components/layout/use-hydrated-pathname.ts")
  const header = source("components/layout/header.tsx")
  const effects = source("components/layout/site-effects.tsx")
  const breadcrumbs = source("components/layout/site-breadcrumbs.tsx")

  assert.match(hook, /useState<string \| null>\(\s*null\s*\)/)
  assert.match(hook, /setCommittedPathname\(pathname\)/)
  assert.match(header, /const pathname = useHydratedPathname\(\)/)
  assert.match(header, /isPending \? "pending"/)
  assert.match(effects, /if \(pathname === null\) return null/)
  assert.match(breadcrumbs, /if \(pathname === null\) return null/)
  assert.doesNotMatch(header, /isHomePath|usePathname/)
  assert.doesNotMatch(effects, /isHomePath|usePathname/)
  assert.doesNotMatch(breadcrumbs, /isHomePath|usePathname/)
})

test("global navigation keeps landmarks, current state, and named utility controls", () => {
  const mainNav = source("components/layout/main-nav.tsx")
  const mobileNav = source("components/layout/mobile-nav.tsx")
  const header = source("components/layout/header.tsx")
  const auth = source("components/auth/auth-links.tsx")
  const booking = source("components/booking/booking-trigger.tsx")
  const cart = source("components/cart/cart-trigger.tsx")
  const layout = source("app/layout.tsx")

  assert.match(mainNav, /aria-label="Main"/)
  assert.match(mainNav, /aria-current=\{isActive \? "page" : undefined\}/)
  assert.match(mobileNav, /aria-label="Mobile main"/)
  assert.match(mobileNav, /aria-label="Open navigation menu"/)
  assert.match(header, /aria-label="HWL by SMD home"/)
  assert.match(header, /data-site-header-variant=\{headerVariant\}/)
  assert.match(auth, /aria-label=\{mobile \? undefined : ACCOUNT_NAV_LABEL\}/)
  assert.match(booking, /aria-controls="site-booking-sheet"/)
  assert.match(booking, /aria-expanded=\{isOpen\}/)
  assert.match(booking, /aria-haspopup="dialog"/)
  assert.match(cart, /aria-controls="site-cart-sheet"/)
  assert.match(cart, /aria-expanded=\{isOpen\}/)
  assert.match(cart, /aria-haspopup="dialog"/)
  assert.match(layout, /<SkipLink \/>/)
  assert.match(layout, /id="main-content"/)
})

test("the app shell exposes a nonvisual post-hydration canary", () => {
  const sentinel = source("components/layout/hydration-sentinel.tsx")
  const layout = source("app/layout.tsx")

  assert.match(sentinel, /data-hwl-hydration-sentinel=""/)
  assert.match(sentinel, /setAttribute\("data-hwl-hydrated", "true"\)/)
  assert.match(sentinel, /aria-hidden="true"/)
  assert.match(sentinel, /hidden/)
  assert.match(layout, /<HydrationSentinel \/>/)
})

test("persistent header actions retain generous pointer targets", () => {
  const mainNav = source("components/layout/main-nav.tsx")
  const mobileNav = source("components/layout/mobile-nav.tsx")
  const auth = source("components/auth/auth-links.tsx")
  const booking = source("components/booking/booking-trigger.tsx")
  const cart = source("components/cart/cart-trigger.tsx")

  assert.match(mainNav, /min-h-11/)
  assert.match(mobileNav, /className="size-11/)
  assert.match(auth, /"size-11 p-0"/)
  assert.match(booking, /"min-h-11 rounded-full"/)
  assert.match(booking, /"w-11 border/)
  assert.match(cart, /"w-11 px-0"/)
})

test("the Den keeps its member shortcuts and a role-gated Admin Center gateway", () => {
  const denLinks = source("components/member/den-links.tsx")
  const denPage = source("app/the-den/page.tsx")
  const accountPage = source("app/account/page.tsx")
  const libraryPage = source("app/library/page.tsx")

  assert.match(denLinks, /aria-label="The Den shortcuts"/)
  assert.match(denLinks, /label: "Library"/)
  assert.match(denLinks, /label: "Book a Session"/)
  assert.match(denLinks, /label: "Manage Account"/)
  assert.match(denLinks, /href: "\/library"/)
  assert.match(denLinks, /href: "\/book"/)
  assert.match(denLinks, /href: "\/account"/)
  assert.match(denLinks, /showAdminCenter \? \(/)
  assert.match(denLinks, /href="\/admin"/)
  assert.match(denLinks, /Admin Center/)
  assert.doesNotMatch(denLinks, /usePathname|aria-current|Today|Sessions/)
  assert.match(denLinks, /min-h-11/)
  assert.match(denPage, /requireAccess\("authenticated", "\/the-den"\)/)
  assert.match(
    denPage,
    /<DenShortcuts showAdminCenter=\{Boolean\(adminRole\)\} \/>/
  )
  assert.match(
    accountPage,
    /<BackToDenLink showAdminCenter=\{Boolean\(adminRole\)\} \/>/
  )
  assert.match(libraryPage, /requireAccess\("authenticated", "\/library"\)/)
})

test("Admin Center links render only for a verified administrator role", () => {
  const { BackToDenLink, DenShortcuts } = loadDenLinks()
  const memberShortcuts = renderToStaticMarkup(createElement(DenShortcuts))
  const adminShortcuts = renderToStaticMarkup(
    createElement(DenShortcuts, { showAdminCenter: true })
  )
  const memberAccountNav = renderToStaticMarkup(createElement(BackToDenLink))
  const adminAccountNav = renderToStaticMarkup(
    createElement(BackToDenLink, { showAdminCenter: true })
  )

  assert.doesNotMatch(memberShortcuts, /href="\/admin"/)
  assert.doesNotMatch(memberAccountNav, /href="\/admin"/)
  assert.match(adminShortcuts, /href="\/admin"/)
  assert.match(adminShortcuts, />Admin Center</)
  assert.match(adminAccountNav, /href="\/admin"/)
  assert.match(adminAccountNav, />Admin Center</)
})

test("the final cart action presents the complete purchase policy set", () => {
  const cartSheet = source("components/cart/cart-sheet.tsx")

  assert.match(cartSheet, /By continuing, you agree to the/)
  assert.match(cartSheet, /href="\/terms#digital-products-and-access"/)
  assert.match(cartSheet, /Terms &amp; personal-use license/)
  assert.match(cartSheet, /href="\/privacy"/)
  assert.match(cartSheet, /href="\/refund-policy"/)
  assert.match(cartSheet, /href="\/contact"/)
})
