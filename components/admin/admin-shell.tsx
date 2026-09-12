"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarDays,
  CreditCard,
  ExternalLink,
  House,
  Inbox,
  Menu,
  Monitor,
  Settings,
  UsersRound,
  X,
} from "lucide-react"

import { AdminLogoutButton } from "@/components/admin/admin-logout-button"
import { cn } from "@/lib/utils"

const navigation = [
  { icon: House, label: "Today", href: "/admin" },
  { icon: CalendarDays, label: "Bookings", href: "/admin/bookings" },
  { icon: UsersRound, label: "Clients", href: "/admin/clients" },
  { icon: Inbox, label: "Inbox", href: "/admin/inquiries" },
  { icon: CreditCard, label: "Money", href: "/admin/store" },
  { icon: Monitor, label: "Studio", href: "/admin/website" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
] as const

export type AdminPrincipalSource = "local-preview" | "supabase"
export type AdminPrincipalRole = "administrator" | "super_admin"

export type AdminDeploymentTarget =
  | "production"
  | "preview"
  | "development"
  | "local"
  | "test"
  | "production-runtime"
  | "unknown"

export type AdminAuthorityMode = "live-write" | "live-read" | "sample"

type AdminShellContext = {
  badge: string
  banner: string
  environmentLabel: string
  mode: AdminAuthorityMode
  modeLabel: string
}

const deploymentLabels: Record<AdminDeploymentTarget, string> = {
  production: "Production",
  preview: "Preview",
  development: "Development",
  local: "Local development",
  test: "Test",
  "production-runtime": "Production runtime",
  unknown: "Unverified runtime",
}

function routeMatches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function getPrincipalInitial(email: string) {
  const localPart = email.trim().split("@", 1)[0]
  return Array.from(localPart)[0]?.toUpperCase() ?? "?"
}

export function getAdminRoleLabel(role: AdminPrincipalRole) {
  return role === "super_admin" ? "Super administrator" : "Administrator"
}

export function getAdminShellContext(
  pathname: string,
  adminSource: AdminPrincipalSource,
  deploymentTarget: AdminDeploymentTarget
): AdminShellContext {
  const environmentLabel = deploymentLabels[deploymentTarget]

  if (adminSource === "local-preview" && pathname === "/admin") {
    return {
      badge: "Local status",
      banner:
        "This read-only local summary checks public service status and local configuration presence. It cannot read hosted customer records, move money, or publish changes.",
      environmentLabel,
      mode: "live-read",
      modeLabel: "Today · Local status",
    }
  }

  if (
    adminSource === "local-preview" &&
    routeMatches(pathname, "/admin/bookings")
  ) {
    return {
      badge: "Public catalog",
      banner:
        "This read-only local view may check Shannon's public Cal.com service catalog. It cannot read private appointments or make scheduling changes.",
      environmentLabel,
      mode: "live-read",
      modeLabel: "Bookings · Provider managed",
    }
  }

  if (
    adminSource === "local-preview" &&
    routeMatches(pathname, "/admin/inquiries")
  ) {
    return {
      badge: "Private inbox locked",
      banner:
        "Local preview cannot read real inquiries or client messages. Sign in through a connected environment to review the private inquiry ledger.",
      environmentLabel,
      mode: "live-read",
      modeLabel: "Inbox · Inquiries locked",
    }
  }

  if (
    adminSource === "local-preview" &&
    routeMatches(pathname, "/admin/messages")
  ) {
    return {
      badge: "Private messages locked",
      banner:
        "Local preview cannot read real client conversations. Sign in through a connected environment to review Shannon's private message queue.",
      environmentLabel,
      mode: "live-read",
      modeLabel: "Inbox · Client messages locked",
    }
  }

  if (
    adminSource === "local-preview" &&
    routeMatches(pathname, "/admin/clients")
  ) {
    return {
      badge: "Private records locked",
      banner:
        "Local preview cannot read real client records. Sign in through a connected environment to review the private client directory.",
      environmentLabel,
      mode: "live-read",
      modeLabel: "Clients · Records locked",
    }
  }

  if (
    adminSource === "local-preview" &&
    routeMatches(pathname, "/admin/store")
  ) {
    return {
      badge: "Private money locked",
      banner:
        "Local preview cannot read Stripe or hosted commerce records. Use a connected environment to review sanitized payment operations.",
      environmentLabel,
      mode: "live-read",
      modeLabel: "Money · Provider data locked",
    }
  }

  if (
    adminSource === "local-preview" &&
    routeMatches(pathname, "/admin/website")
  ) {
    return {
      badge: "Local editorial preview",
      banner:
        "Studio is read-only in the local preview. Its publishing workflow becomes available only to a verified hosted administrator when the editorial schema and publication gates are connected.",
      environmentLabel,
      mode: "sample",
      modeLabel: "Studio · Local preview",
    }
  }

  if (
    adminSource === "local-preview" &&
    routeMatches(pathname, "/admin/settings")
  ) {
    return {
      badge: "Local configuration",
      banner:
        "Settings reports configuration presence and provider authority for this local environment. It never displays credentials or changes provider settings.",
      environmentLabel,
      mode: "live-read",
      modeLabel: "Settings · Read only",
    }
  }

  if (adminSource === "local-preview") {
    return {
      badge: "Sample only",
      banner:
        "Local preview is read-only. Records and controls on this route are sample-only; nothing here can publish or write to a connected environment.",
      environmentLabel,
      mode: "sample",
      modeLabel: "Sample workspace · Read only",
    }
  }

  if (pathname === "/admin") {
    return {
      badge: "Operational summary",
      banner: `Today shows a safe, live status summary for the connected ${environmentLabel} environment. Customer records, payment details, and credentials are not displayed here.`,
      environmentLabel,
      mode: "live-read",
      modeLabel: "Today · Live status",
    }
  }

  if (routeMatches(pathname, "/admin/bookings")) {
    return {
      badge: "Cal.com authority",
      banner: `This ${environmentLabel} view can read Shannon's private Cal.com queues when its server connection is configured. Scheduling changes remain in Cal.com; durable client history requires the separate HWL ledger.`,
      environmentLabel,
      mode: "live-read",
      modeLabel: "Bookings · Provider managed",
    }
  }

  if (routeMatches(pathname, "/admin/website")) {
    return {
      badge: "Governed publishing",
      banner: `Studio is connected to the ${environmentLabel} environment, but editing and publishing remain available only when the page's schema, media, and write gates all report ready.`,
      environmentLabel,
      mode: "live-read",
      modeLabel: "Studio · Gate controlled",
    }
  }

  if (routeMatches(pathname, "/admin/inquiries")) {
    return {
      badge: "Restricted PII",
      banner: `This live, read-only inquiry view contains restricted customer PII from the connected ${environmentLabel} environment. Use it only for authorized client follow-up.`,
      environmentLabel,
      mode: "live-read",
      modeLabel: "Inbox · Inquiries",
    }
  }

  if (routeMatches(pathname, "/admin/messages")) {
    return {
      badge: "Restricted PII",
      banner: `This live, read-only conversation view contains restricted customer PII from relationships assigned to the signed-in practitioner in the connected ${environmentLabel} environment.`,
      environmentLabel,
      mode: "live-read",
      modeLabel: "Inbox · Client messages",
    }
  }

  if (routeMatches(pathname, "/admin/clients")) {
    return {
      badge: "Restricted PII",
      banner: `This live, read-only client directory contains restricted customer PII from the connected ${environmentLabel} environment. Use it only for authorized client care.`,
      environmentLabel,
      mode: "live-read",
      modeLabel: "Clients · Live read",
    }
  }

  if (routeMatches(pathname, "/admin/store")) {
    return {
      badge: "Sanitized operations",
      banner: `Money contains sanitized, read-only operational data from the connected ${environmentLabel} environment. Payment credentials and full payment details are not displayed.`,
      environmentLabel,
      mode: "live-read",
      modeLabel: "Money · Live read",
    }
  }

  if (routeMatches(pathname, "/admin/settings/access")) {
    return {
      badge: "Restricted role handoff",
      banner: `This one-time ${environmentLabel} control changes only Shannon’s administrator role after rechecking the exact human actor, owner-approved deployment, and database audit boundary.`,
      environmentLabel,
      mode: "live-write",
      modeLabel: "Settings · Audited handoff",
    }
  }

  if (routeMatches(pathname, "/admin/settings")) {
    return {
      badge: "Operational configuration",
      banner: `Settings is a read-only authority and configuration-presence map for the connected ${environmentLabel} environment. It never displays credentials or changes provider settings.`,
      environmentLabel,
      mode: "live-read",
      modeLabel: "Settings · Read only",
    }
  }

  return {
    badge: "Sample only",
    banner:
      "This route uses sample data and read-only controls. A verified administrator session does not make this section live.",
    environmentLabel,
    mode: "sample",
    modeLabel: "Sample workspace · Read only",
  }
}

function activeFor(pathname: string, href: string) {
  if (
    href === "/admin/inquiries" &&
    routeMatches(pathname, "/admin/messages")
  ) {
    return true
  }

  return href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`)
}

function Sidebar({
  adminEmail,
  adminRole,
  adminSource,
  pathname,
  onNavigate,
}: {
  adminEmail: string
  adminRole: AdminPrincipalRole
  adminSource: AdminPrincipalSource
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <>
      <div className="border-b border-white/10 px-5 py-6">
        <Link href="/admin" onClick={onNavigate}>
          <span className="block font-serif text-2xl font-medium text-white">
            HWL by SMD
          </span>
          <span className="mt-1 block text-[9px] font-semibold tracking-[0.3em] text-[#c9ae88] uppercase">
            Whole Body OS
          </span>
        </Link>
      </div>

      <nav
        aria-label="Whole Body OS"
        className="flex-1 space-y-1 overflow-y-auto px-3 py-5"
      >
        {navigation.map(({ href, icon: Icon, label }) => {
          const active = activeFor(pathname, href)
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm transition",
                active
                  ? "bg-white/11 text-white"
                  : "text-white/52 hover:bg-white/7 hover:text-white"
              )}
              href={href}
              key={href}
              onClick={onNavigate}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white/6 p-3">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-[#c9ae88] font-serif text-lg text-[#273029]"
          >
            {getPrincipalInitial(adminEmail)}
          </span>
          <div className="min-w-0">
            <p
              className="truncate text-sm font-medium text-white"
              title={adminEmail}
            >
              {adminEmail}
            </p>
            <p className="truncate text-[10px] text-white/65">
              {getAdminRoleLabel(adminRole)}
              {adminSource === "local-preview" ? " · Local read only" : ""}
            </p>
          </div>
        </div>
        <AdminLogoutButton />
      </div>
    </>
  )
}

export function AdminShell({
  adminEmail,
  adminRole,
  adminSource,
  children,
  deploymentTarget,
}: {
  adminEmail: string
  adminRole: AdminPrincipalRole
  adminSource: AdminPrincipalSource
  children: React.ReactNode
  deploymentTarget: AdminDeploymentTarget
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)
  const mobilePanelRef = useRef<HTMLElement>(null)
  const context = getAdminShellContext(pathname, adminSource, deploymentTarget)
  const currentLabel =
    navigation.find(({ href }) => activeFor(pathname, href))?.label ??
    "Sample workspace"

  useEffect(() => {
    if (!mobileOpen) return

    const desktopMedia = window.matchMedia("(min-width: 1024px)")
    if (desktopMedia.matches) {
      const animationFrame = window.requestAnimationFrame(() => {
        setMobileOpen(false)
      })
      return () => window.cancelAnimationFrame(animationFrame)
    }

    const previousOverflow = document.body.style.overflow
    const mobileMenuButton = mobileMenuButtonRef.current
    const panel = mobilePanelRef.current
    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

    document.body.style.overflow = "hidden"
    panel?.querySelector<HTMLElement>(focusableSelector)?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setMobileOpen(false)
        return
      }

      if (event.key !== "Tab" || !panel) return

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((element) => !element.hasAttribute("disabled"))
      const first = focusable[0]
      const last = focusable.at(-1)
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const handleDesktopChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileOpen(false)
    }

    document.addEventListener("keydown", handleKeyDown)
    desktopMedia.addEventListener("change", handleDesktopChange)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
      desktopMedia.removeEventListener("change", handleDesktopChange)
      mobileMenuButton?.focus()
    }
  }, [mobileOpen])

  return (
    <div className="min-h-screen bg-[#e9e3d9] text-[#273029]" data-admin-shell>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-[#273029] lg:flex">
        <Sidebar
          adminEmail={adminEmail}
          adminRole={adminRole}
          adminSource={adminSource}
          pathname={pathname}
        />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-[#1f2821]/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            tabIndex={-1}
            type="button"
          />
          <aside
            aria-label="Admin navigation"
            aria-modal="true"
            className="relative flex h-full w-[min(19rem,86vw)] flex-col bg-[#273029] shadow-2xl"
            id="admin-mobile-navigation"
            ref={mobilePanelRef}
            role="dialog"
          >
            <button
              aria-label="Close navigation"
              className="absolute top-5 right-4 grid size-9 place-items-center rounded-full bg-white/8 text-white"
              onClick={() => setMobileOpen(false)}
              type="button"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
            <Sidebar
              adminEmail={adminEmail}
              adminRole={adminRole}
              adminSource={adminSource}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="min-w-0 lg:pl-60">
        <header className="sticky top-0 z-30 border-b border-[#d7d0c4] bg-[#eee9df]/92 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-h-11 items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                aria-controls="admin-mobile-navigation"
                aria-expanded={mobileOpen}
                aria-label="Open navigation"
                className="grid size-10 shrink-0 place-items-center rounded-full border border-[#d2cabd] bg-white/45 text-[#4f5b51] lg:hidden"
                onClick={() => setMobileOpen(true)}
                ref={mobileMenuButtonRef}
                type="button"
              >
                <Menu className="size-4" aria-hidden="true" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{currentLabel}</p>
                <p className="truncate text-[9px] font-medium tracking-[0.18em] text-[#6f573d] uppercase">
                  {context.environmentLabel} · {context.modeLabel}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full bg-[#9d8464]/10 px-3 py-2 text-[9px] font-semibold tracking-[0.16em] text-[#856846] uppercase sm:inline-flex">
                {context.badge}
              </span>
              <Link
                aria-label="View public site"
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d2cabd] bg-white/48 px-3.5 text-xs font-medium text-[#566158] transition hover:bg-white/70"
                href="/"
              >
                <span className="hidden sm:inline">View site</span>
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          <aside
            aria-label="Admin data authority"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-[#d9cfbe] bg-[#f7f1e7]/65 px-4 py-3 text-xs leading-5 text-[#655b4e]"
            data-authority-mode={context.mode}
          >
            <span
              aria-hidden="true"
              className="mt-1 size-1.5 shrink-0 rounded-full bg-[#9d8464]"
            />
            <p>{context.banner}</p>
          </aside>
          {children}
        </div>
      </div>
    </div>
  )
}
