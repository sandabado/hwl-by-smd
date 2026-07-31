"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarDays,
  CircleDollarSign,
  ExternalLink,
  HeartHandshake,
  LayoutDashboard,
  LibraryBig,
  Menu,
  Newspaper,
  Settings,
  ShoppingBag,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react"

import { AdminLogoutButton } from "@/components/admin/admin-logout-button"
import { cn } from "@/lib/utils"

const navigation = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: HeartHandshake, label: "Connection", href: "/admin/connection" },
  { icon: UsersRound, label: "Members", href: "/admin/members" },
  { icon: CalendarDays, label: "Bookings", href: "/admin/bookings" },
  { icon: CircleDollarSign, label: "Revenue", href: "/admin/revenue" },
  { icon: LibraryBig, label: "Courses", href: "/admin/courses" },
  { icon: Newspaper, label: "Content", href: "/admin/content" },
  { icon: Sparkles, label: "Journeys", href: "/admin/journeys" },
  { icon: ShoppingBag, label: "Store", href: "/admin/store" },
  { icon: CalendarDays, label: "Calendar", href: "/admin/calendar" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
] as const

function activeFor(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`)
}

function Sidebar({
  pathname,
  onNavigate,
}: {
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
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#c9ae88] font-serif text-lg text-[#273029]">
            S
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              Shannon Dixon
            </p>
            <p className="truncate text-[10px] text-white/35">
              Owner · Administrator
            </p>
          </div>
        </div>
        <AdminLogoutButton />
      </div>
    </>
  )
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const current =
    navigation.find(({ href }) => activeFor(pathname, href)) ?? navigation[0]

  return (
    <div className="min-h-screen bg-[#e9e3d9] text-[#273029]" data-admin-shell>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-[#273029] lg:flex">
        <Sidebar pathname={pathname} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-[#1f2821]/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            type="button"
          />
          <aside className="relative flex h-full w-[min(19rem,86vw)] flex-col bg-[#273029] shadow-2xl">
            <button
              aria-label="Close navigation"
              className="absolute top-5 right-4 grid size-9 place-items-center rounded-full bg-white/8 text-white"
              onClick={() => setMobileOpen(false)}
              type="button"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
            <Sidebar
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
                aria-label="Open navigation"
                className="grid size-10 shrink-0 place-items-center rounded-full border border-[#d2cabd] bg-white/45 text-[#4f5b51] lg:hidden"
                onClick={() => setMobileOpen(true)}
                type="button"
              >
                <Menu className="size-4" aria-hidden="true" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{current.label}</p>
                <p className="truncate text-[9px] tracking-[0.18em] text-[#8d7559] uppercase">
                  Private preview · Read only
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full bg-[#9d8464]/10 px-3 py-2 text-[9px] font-semibold tracking-[0.16em] text-[#856846] uppercase sm:inline-flex">
                Sample data
              </span>
              <Link
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
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#d9cfbe] bg-[#f7f1e7]/65 px-4 py-3 text-xs leading-5 text-[#766b5c]">
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#9d8464]" />
            This is a private, read-only design preview. Business records shown
            here are sample data; connection indicators reflect this
            environment.
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
