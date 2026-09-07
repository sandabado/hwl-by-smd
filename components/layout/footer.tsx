"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { useAuth } from "@/components/auth/auth-provider"
import { SITE_CONFIG } from "@/lib/constants"
import {
  ACCOUNT_NAV_LABEL,
  BOOKING_NAV_ITEM,
  getActiveMainNavHref,
  isCurrentPath,
  MAIN_NAV,
} from "@/lib/nav-config"
import { cn } from "@/lib/utils"

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Health Disclaimer", href: "/health-disclaimer" },
  { label: "Contact", href: "/contact" },
] as const

const footerLinkClass =
  "text-sm text-[#f7f3ec]/72 transition-colors duration-200 hover:text-[#f7f3ec]"

export function Footer() {
  const pathname = usePathname()
  const { loading, user } = useAuth()
  const activeMainHref = getActiveMainNavHref(pathname)
  const actionLinks = [
    BOOKING_NAV_ITEM,
    loading
      ? { label: ACCOUNT_NAV_LABEL, href: "/login" }
      : user
        ? { label: ACCOUNT_NAV_LABEL, href: "/account" }
        : { label: ACCOUNT_NAV_LABEL, href: "/login" },
  ]

  if (pathname.startsWith("/admin")) return null

  return (
    <footer className="bg-[#20251f] text-[#f7f3ec]">
      <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
        <div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.35fr_0.8fr_0.8fr_1fr]">
          <div>
            <Link
              aria-label="HWL by SMD home"
              className="font-serif text-3xl font-medium tracking-[0.1em]"
              href="/"
            >
              HWL BY SMD
            </Link>
            <p className="mt-4 text-xs font-medium tracking-[0.24em] text-[#d8b98e] uppercase">
              Body · Beauty · Being
            </p>
            <p className="mt-7 max-w-sm text-sm leading-7 text-[#f7f3ec]/62">
              Beauty, movement and ritual practices, products + experiences by
              Shannon Mary Dixon.
            </p>
            <p className="mt-5 text-sm text-[#f7f3ec]/76">
              Palm Springs · Joshua Tree · California
            </p>
          </div>

          <nav aria-label="Explore footer links">
            <h2 className="text-xs font-semibold tracking-[0.22em] text-[#d8b98e] uppercase">
              Explore
            </h2>
            <div className="mt-5 flex flex-col items-start gap-3">
              {MAIN_NAV.map((item) => (
                <Link
                  aria-current={
                    activeMainHref === item.href ? "page" : undefined
                  }
                  className={cn(
                    footerLinkClass,
                    activeMainHref === item.href &&
                      "text-[#f7f3ec] underline underline-offset-4"
                  )}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <nav aria-label="Action footer links">
            <h2 className="text-xs font-semibold tracking-[0.22em] text-[#d8b98e] uppercase">
              Begin
            </h2>
            <div className="mt-5 flex flex-col items-start gap-3">
              {actionLinks.map((item) => (
                <Link
                  aria-current={
                    isCurrentPath(pathname, item.href) ? "page" : undefined
                  }
                  className={cn(
                    footerLinkClass,
                    isCurrentPath(pathname, item.href) &&
                      "text-[#f7f3ec] underline underline-offset-4"
                  )}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <div>
            <h2 className="text-xs font-semibold tracking-[0.22em] text-[#d8b98e] uppercase">
              Stay in touch
            </h2>
            <address className="mt-5 flex flex-col items-start gap-3 not-italic">
              <a
                className={footerLinkClass}
                href={`mailto:${SITE_CONFIG.email}`}
              >
                {SITE_CONFIG.email}
              </a>
              <a
                className={footerLinkClass}
                href={`tel:${SITE_CONFIG.phone.replace(/\D/g, "")}`}
              >
                {SITE_CONFIG.phone}
              </a>
              <a
                className={footerLinkClass}
                href={SITE_CONFIG.instagramBrandUrl}
                rel="noreferrer"
                target="_blank"
              >
                Instagram · {SITE_CONFIG.instagramBrand}
              </a>
            </address>
          </div>
        </div>

        <div className="flex flex-col gap-5 pt-7 text-xs text-[#f7f3ec]/58 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p>© 2026 Shannon Mary Dixon. All rights reserved.</p>
            <p>HWL by SMD™ · LIFT™</p>
          </div>
          <nav
            aria-label="Legal footer links"
            className="flex flex-wrap gap-x-5 gap-y-2"
          >
            {legalLinks.map((item) => (
              <Link
                className="transition-colors duration-200 hover:text-[#f7f3ec]"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
