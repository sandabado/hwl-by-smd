"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { SITE_CONFIG } from "@/lib/constants"

const footerColumns = [
  {
    title: "Explore",
    links: [
      { label: "About", href: "/about" },
      { label: "Beauty", href: "/beauty" },
      { label: "Body", href: "/body" },
      { label: "Being", href: "/being" },
      { label: "Retreats", href: "/retreats" },
      { label: "Journal", href: "/journal" },
    ],
  },
  {
    title: "Shop",
    links: [
      { label: "LIFT Guide ($5.55)", href: "/beauty/lift" },
      { label: "LIFT PDF ($3.33)", href: "/beauty/lift#download" },
      { label: "The Den Membership ($11.11/mo)", href: "/store#the-den" },
      { label: "All Products", href: "/store" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In", href: "/login" },
      { label: "The Den", href: "/the-den" },
      { label: "Book a Session", href: "/book" },
      { label: "Contact", href: "/contact" },
    ],
  },
] as const

const footerLinkClass =
  "text-sm text-[var(--background)]/80 transition-colors duration-200 hover:text-[var(--background)]"

export function Footer() {
  const pathname = usePathname()

  if (pathname.startsWith("/admin")) return null

  return (
    <footer className="bg-[var(--primary)] text-[var(--background)]">
      <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
        <div className="flex flex-col gap-8 border-b border-[var(--background)]/10 pb-10 md:flex-row md:items-start md:justify-between">
          <div>
            <Link
              href="/"
              aria-label="HWL by SMD home"
              className="font-serif text-2xl font-medium tracking-[0.12em]"
            >
              HWL·SMD
            </Link>
            <p className="mt-3 text-sm tracking-[0.14em] text-[var(--background)]/80">
              Beauty · Body · Being
            </p>
          </div>

          <address className="flex flex-col gap-2 text-sm text-[var(--background)]/80 not-italic md:items-end">
            <a
              href="mailto:hello@howlbysmd.com"
              className="transition-colors duration-200 hover:text-[var(--background)]"
            >
              hello@howlbysmd.com
            </a>
            <a
              href={SITE_CONFIG.instagramBrandUrl}
              rel="noreferrer"
              target="_blank"
              className="transition-colors duration-200 hover:text-[var(--background)]"
            >
              {SITE_CONFIG.instagramBrand}
            </a>
            <span>{SITE_CONFIG.location}</span>
          </address>
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3">
          {footerColumns.map((column) => (
            <section key={column.title}>
              <h2 className="text-xs font-medium tracking-[0.24em] text-[var(--background)]/70 uppercase">
                {column.title}
              </h2>
              <nav
                aria-label={`${column.title} footer links`}
                className="mt-5 flex flex-col items-start gap-3"
              >
                {column.links.map((item) => (
                  <Link
                    className={footerLinkClass}
                    href={item.href}
                    key={item.label}
                  >
                    {item.label}
                  </Link>
                ))}
                {column.title === "Account" ? (
                  <span className={footerLinkClass}>
                    <Link href="/terms">Terms</Link>
                    <span aria-hidden="true"> &amp; </span>
                    <Link href="/privacy">Privacy</Link>
                  </span>
                ) : null}
              </nav>
            </section>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-[var(--background)]/10 pt-6 text-xs text-[var(--background)]/75 md:flex-row md:items-center md:justify-between">
          <p>© 2026 HWL by SMD. Built on Whole Body OS.</p>
          <div className="flex gap-5">
            <Link
              className="transition-colors duration-200 hover:text-[var(--background)]"
              href="/terms"
            >
              Terms
            </Link>
            <Link
              className="transition-colors duration-200 hover:text-[var(--background)]"
              href="/privacy"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
