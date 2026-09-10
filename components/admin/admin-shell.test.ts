import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import ts from "typescript"

type ShellContext = {
  badge: string
  banner: string
  environmentLabel: string
  mode: "live-write" | "live-read" | "sample"
  modeLabel: string
}

type LoadedAdminShell = {
  getAdminShellContext: (
    pathname: string,
    source: "local-preview" | "supabase",
    deploymentTarget:
      | "production"
      | "preview"
      | "development"
      | "local"
      | "test"
      | "production-runtime"
      | "unknown"
  ) => ShellContext
  getPrincipalInitial: (email: string) => string
}

function source(path: string) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8")
}

function loadAdminShell(): LoadedAdminShell {
  const compiled = ts.transpileModule(
    source("components/admin/admin-shell.tsx"),
    {
      compilerOptions: {
        esModuleInterop: true,
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }
  ).outputText
  const loadedModule: { exports: Partial<LoadedAdminShell> } = { exports: {} }
  const emptyComponent = () => null

  new Function("require", "module", "exports", compiled)(
    (specifier: string) => {
      if (specifier === "react") {
        return {
          useEffect: () => undefined,
          useRef: () => ({ current: null }),
          useState: () => [false, () => undefined],
        }
      }
      if (specifier === "react/jsx-runtime") {
        return {
          Fragment: Symbol("Fragment"),
          jsx: emptyComponent,
          jsxs: emptyComponent,
        }
      }
      if (specifier === "next/link") return emptyComponent
      if (specifier === "next/navigation") {
        return { usePathname: () => "/admin" }
      }
      if (specifier === "lucide-react") {
        return {
          CalendarDays: emptyComponent,
          CreditCard: emptyComponent,
          ExternalLink: emptyComponent,
          House: emptyComponent,
          Inbox: emptyComponent,
          Menu: emptyComponent,
          Monitor: emptyComponent,
          Settings: emptyComponent,
          UsersRound: emptyComponent,
          X: emptyComponent,
        }
      }
      if (specifier === "@/components/admin/admin-logout-button") {
        return { AdminLogoutButton: emptyComponent }
      }
      if (specifier === "@/lib/utils") return { cn: emptyComponent }
      throw new Error(`Unexpected admin shell test import: ${specifier}`)
    },
    loadedModule,
    loadedModule.exports
  )

  assert.equal(typeof loadedModule.exports.getAdminShellContext, "function")
  assert.equal(typeof loadedModule.exports.getPrincipalInitial, "function")

  return loadedModule.exports as LoadedAdminShell
}

test("admin navigation exposes only the seven daily-work destinations", () => {
  const shellSource = source("components/admin/admin-shell.tsx")
  const navigationSource = shellSource.match(
    /const navigation = \[([\s\S]*?)\] as const/
  )?.[1]

  assert.ok(navigationSource)
  assert.deepEqual(
    Array.from(
      navigationSource.matchAll(/label: "([^"]+)", href: "([^"]+)"/g),
      ([, label, href]) => ({ href, label })
    ),
    [
      { href: "/admin", label: "Today" },
      { href: "/admin/bookings", label: "Bookings" },
      { href: "/admin/clients", label: "Clients" },
      { href: "/admin/inquiries", label: "Inbox" },
      { href: "/admin/store", label: "Money" },
      { href: "/admin/website", label: "Studio" },
      { href: "/admin/settings", label: "Settings" },
    ]
  )
  assert.doesNotMatch(shellSource, /Shannon Dixon/)
})

test("authenticated identity supplies the visible principal and derived initial", () => {
  const shell = loadAdminShell()

  assert.equal(shell.getPrincipalInitial("admin@ghosthand.studio"), "A")
  assert.equal(shell.getPrincipalInitial(" shannon@hwlbysmd.com "), "S")
  assert.equal(shell.getPrincipalInitial(""), "?")

  const shellSource = source("components/admin/admin-shell.tsx")
  const layoutSource = source("app/admin/(protected)/layout.tsx")

  assert.match(shellSource, /\{adminEmail\}/)
  assert.match(shellSource, /getPrincipalInitial\(adminEmail\)/)
  assert.match(layoutSource, /const access = await requireAdmin\(\)/)
  assert.match(layoutSource, /adminEmail=\{access\.email\}/)
  assert.match(layoutSource, /adminSource=\{access\.source\}/)
  assert.match(
    layoutSource,
    /deploymentTarget=\{getAdminDeploymentTarget\(\)\}/
  )
})

test("route authority is live only where the connected source supports it", () => {
  const shell = loadAdminShell()

  const localHome = shell.getAdminShellContext(
    "/admin",
    "local-preview",
    "local"
  )
  assert.equal(localHome.mode, "live-read")
  assert.equal(localHome.badge, "Local status")

  const localBookings = shell.getAdminShellContext(
    "/admin/bookings",
    "local-preview",
    "local"
  )
  assert.equal(localBookings.mode, "live-read")
  assert.equal(localBookings.badge, "Public catalog")
  assert.match(localBookings.banner, /cannot read private appointments/i)

  const localInbox = shell.getAdminShellContext(
    "/admin/inquiries",
    "local-preview",
    "local"
  )
  assert.equal(localInbox.mode, "live-read")
  assert.equal(localInbox.badge, "Private inbox locked")
  assert.equal(localInbox.modeLabel, "Inbox · Inquiries locked")
  assert.match(localInbox.banner, /cannot read real inquiries/i)

  const localMessages = shell.getAdminShellContext(
    "/admin/messages",
    "local-preview",
    "local"
  )
  assert.equal(localMessages.mode, "live-read")
  assert.equal(localMessages.badge, "Private messages locked")
  assert.equal(localMessages.modeLabel, "Inbox · Client messages locked")
  assert.match(localMessages.banner, /cannot read real client conversations/i)

  const localClients = shell.getAdminShellContext(
    "/admin/clients",
    "local-preview",
    "local"
  )
  assert.equal(localClients.mode, "live-read")
  assert.equal(localClients.badge, "Private records locked")
  assert.equal(localClients.modeLabel, "Clients · Records locked")

  const localWebsite = shell.getAdminShellContext(
    "/admin/website",
    "local-preview",
    "local"
  )
  assert.equal(localWebsite.mode, "sample")
  assert.equal(localWebsite.badge, "Local editorial preview")
  assert.equal(localWebsite.modeLabel, "Studio · Local preview")
  assert.match(localWebsite.banner, /read-only/i)

  const localStore = shell.getAdminShellContext(
    "/admin/store",
    "local-preview",
    "local"
  )
  assert.equal(localStore.mode, "live-read")
  assert.equal(localStore.badge, "Private money locked")
  assert.match(localStore.banner, /cannot read Stripe or hosted commerce/i)

  const localSettings = shell.getAdminShellContext(
    "/admin/settings",
    "local-preview",
    "local"
  )
  assert.equal(localSettings.mode, "live-read")
  assert.equal(localSettings.badge, "Local configuration")
  assert.equal(localSettings.modeLabel, "Settings · Read only")

  const home = shell.getAdminShellContext("/admin", "supabase", "production")
  assert.equal(home.mode, "live-read")
  assert.equal(home.badge, "Operational summary")
  assert.equal(home.modeLabel, "Today · Live status")
  assert.match(home.banner, /safe, live status summary/)
  assert.match(
    home.banner,
    /payment details, and credentials are not displayed/
  )

  const website = shell.getAdminShellContext(
    "/admin/website/home",
    "supabase",
    "production"
  )
  assert.equal(website.mode, "live-read")
  assert.equal(website.environmentLabel, "Production")
  assert.equal(website.modeLabel, "Studio · Gate controlled")
  assert.match(
    website.banner,
    /editing and publishing remain available only when the page's schema, media, and write gates all report ready/
  )

  const bookings = shell.getAdminShellContext(
    "/admin/bookings",
    "supabase",
    "production"
  )
  assert.equal(bookings.mode, "live-read")
  assert.equal(bookings.badge, "Cal.com authority")
  assert.match(bookings.banner, /Scheduling changes remain in Cal\.com/)

  const inquiries = shell.getAdminShellContext(
    "/admin/inquiries/record",
    "supabase",
    "preview"
  )
  assert.equal(inquiries.mode, "live-read")
  assert.equal(inquiries.badge, "Restricted PII")
  assert.match(inquiries.banner, /restricted customer PII/)
  assert.equal(inquiries.modeLabel, "Inbox · Inquiries")

  const messages = shell.getAdminShellContext(
    "/admin/messages/record",
    "supabase",
    "preview"
  )
  assert.equal(messages.mode, "live-read")
  assert.equal(messages.badge, "Restricted PII")
  assert.match(
    messages.banner,
    /relationships assigned to the signed-in practitioner/
  )
  assert.equal(messages.modeLabel, "Inbox · Client messages")

  const clients = shell.getAdminShellContext(
    "/admin/clients",
    "supabase",
    "production"
  )
  assert.equal(clients.mode, "live-read")
  assert.equal(clients.badge, "Restricted PII")
  assert.equal(clients.modeLabel, "Clients · Live read")

  const store = shell.getAdminShellContext(
    "/admin/store/order",
    "supabase",
    "production"
  )
  assert.equal(store.mode, "live-read")
  assert.equal(store.badge, "Sanitized operations")
  assert.match(store.banner, /sanitized, read-only operational data/)
  assert.equal(store.modeLabel, "Money · Live read")

  const settings = shell.getAdminShellContext(
    "/admin/settings",
    "supabase",
    "production"
  )
  assert.equal(settings.mode, "live-read")
  assert.equal(settings.badge, "Operational configuration")
  assert.equal(settings.modeLabel, "Settings · Read only")

  assert.equal(
    shell.getAdminShellContext("/admin/revenue", "supabase", "production").mode,
    "sample"
  )
})

test("authority banner remains an explicitly named landmark", () => {
  const shellSource = source("components/admin/admin-shell.tsx")

  assert.match(shellSource, /aria-label="Admin data authority"/)
  assert.match(shellSource, /data-authority-mode=\{context\.mode\}/)
  assert.match(shellSource, /aria-current=\{active \? "page" : undefined\}/)
  assert.match(shellSource, /aria-label="Open navigation"/)
  assert.match(shellSource, /aria-label="Close navigation"/)
})

test("mobile navigation behaves as a modal with focus and keyboard recovery", () => {
  const shellSource = source("components/admin/admin-shell.tsx")

  assert.match(shellSource, /aria-modal="true"/)
  assert.match(shellSource, /role="dialog"/)
  assert.match(shellSource, /aria-controls="admin-mobile-navigation"/)
  assert.match(shellSource, /aria-expanded=\{mobileOpen\}/)
  assert.match(shellSource, /event\.key === "Escape"/)
  assert.match(shellSource, /document\.body\.style\.overflow = "hidden"/)
  assert.match(shellSource, /window\.matchMedia\("\(min-width: 1024px\)"\)/)
  assert.match(shellSource, /desktopMedia\.addEventListener\("change"/)
  assert.match(shellSource, /if \(event\.matches\) setMobileOpen\(false\)/)
  assert.match(
    shellSource,
    /const mobileMenuButton = mobileMenuButtonRef\.current/
  )
  assert.match(shellSource, /mobileMenuButton\?\.focus\(\)/)
})
