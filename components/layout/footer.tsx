"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { SITE_CONFIG } from "@/lib/constants"

const footerColumns = [
  {
    title: "Explore",
    links: [
      { label: "About", href: "/about" },
      { label: "All Experiences", href: "/experiences" },
      { label: "Beauty", href: "/beauty" },
      { label: "Yoga", href: "/yoga" },
      { label: "Astrology", href: "/astrology" },
      { label: "Retreats", href: "/retreats" },
      { label: "Journal", href: "/journal" },
    ],
  },
  {
    title: "Shop",
    links: [
      { label: "Store", href: "/store" },
      { label: "Beauty Products", href: "/store#beauty-products" },
      { label: "Magical Tools", href: "/store#magical-tools" },
      { label: "LIFT Guide", href: "/beauty/lift" },
      { label: "LIFT PDF", href: "/beauty/lift#download" },
      { label: "Membership", href: "/store#the-den" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In", href: "/login" },
      { label: "The Den", href: "/the-den" },
      { label: "Book", href: "/book" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Service Areas",
    links: [
      { label: "Palm Springs, CA", href: "/palm-springs" },
      { label: "Joshua Tree, CA", href: "/joshua-tree" },
      { label: "Yucca Valley, CA", href: "/yucca-valley" },
      { label: "Desert Hot Springs, CA", href: "/desert-hot-springs" },
      { label: "Morongo Valley, CA" },
    ],
  },
] as const

const footerLinkClass =
  "text-sm text-[var(--background)]/80 transition-colors duration-200 hover:text-[var(--background)]"

export function Footer() {
  const pathname = usePathname()

  if (pathname === "/" || pathname.startsWith("/admin")) return null

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
              href={`mailto:${SITE_CONFIG.email}`}
              className="transition-colors duration-200 hover:text-[var(--background)]"
            >
              {SITE_CONFIG.email}
            </a>
            <a
              href={`tel:${SITE_CONFIG.phone.replace(/\D/g, "")}`}
              className="transition-colors duration-200 hover:text-[var(--background)]"
            >
              {SITE_CONFIG.phone}
            </a>
            <a
              href={SITE_CONFIG.instagramPersonalUrl}
              rel="noreferrer"
              target="_blank"
              className="transition-colors duration-200 hover:text-[var(--background)]"
            >
              {SITE_CONFIG.instagramPersonal}
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

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {footerColumns.map((column) => (
            <section key={column.title}>
              <h2 className="text-xs font-medium tracking-[0.24em] text-[var(--background)]/70 uppercase">
                {column.title}
              </h2>
              {column.title === "Service Areas" ? (
                <>
                  <div className="mt-5 flex flex-col items-start gap-3">
                    {column.links.map((item) =>
                      "href" in item ? (
                        <Link
                          className={footerLinkClass}
                          href={item.href}
                          key={item.label}
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span
                          className="text-sm text-[var(--background)]/65"
                          key={item.label}
                        >
                          {item.label}
                        </span>
                      )
                    )}
                  </div>
                  <p className="mt-5 max-w-56 text-xs leading-relaxed text-[var(--background)]/60">
                    Based in Palm Springs. Serving the Coachella Valley and
                    Hi-Desert.
                  </p>
                </>
              ) : (
                <nav
                  aria-label={`${column.title} footer links`}
                  className="mt-5 flex flex-col items-start gap-3"
                >
                  {column.links.map((item) =>
                    "href" in item ? (
                      <Link
                        className={footerLinkClass}
                        href={item.href}
                        key={item.label}
                      >
                        {item.label}
                      </Link>
                    ) : null
                  )}
                  {column.title === "Account" ? (
                    <span className={footerLinkClass}>
                      <Link href="/terms">Terms</Link>
                      <span aria-hidden="true"> &amp; </span>
                      <Link href="/privacy">Privacy</Link>
                    </span>
                  ) : null}
                </nav>
              )}
            </section>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-[var(--background)]/10 pt-6 text-xs text-[var(--background)]/75 md:flex-row md:items-center md:justify-between">
          <p>© 2026 HWL by SMD. Built on Whole Body OS.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
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
            <Link
              className="transition-colors duration-200 hover:text-[var(--background)]"
              href="/refund-policy"
            >
              Refund Policy
            </Link>
            <Link
              className="transition-colors duration-200 hover:text-[var(--background)]"
              href="/health-disclaimer"
            >
              Health Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
