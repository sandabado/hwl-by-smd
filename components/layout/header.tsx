"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { AuthLinks } from "@/components/auth/auth-links"
import { MainNav } from "@/components/layout/main-nav"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const isHomeThreshold = pathname === "/" && !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (pathname.startsWith("/admin")) return null

  return (
    <header
      className={cn(
        "sticky top-0 z-50 max-h-[72px] border-b border-[var(--border)]/50 bg-[var(--background)]/80 backdrop-blur-md transition-[height,background-color,box-shadow,backdrop-filter] duration-300",
        isHomeThreshold &&
          "border-white/15 bg-[#0a2119]/20 shadow-none [--accent:#d7e6d2] [--background:#102a20] [--foreground:#f6f4e9] [--muted-foreground:#f6f4e9c7] [--primary:#f6f4e9]",
        scrolled &&
          "max-h-14 bg-[var(--background)]/90 shadow-[0_8px_24px_rgba(43,39,36,0.06)] backdrop-blur-xl"
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 transition-[height] duration-300 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-8 xl:gap-12",
          scrolled && "h-14"
        )}
      >
        <Link
          href="/"
          aria-label="HWL by SMD home"
          className="flex shrink-0 flex-col font-serif text-xl leading-none font-medium tracking-[0.12em] text-[var(--primary)] md:text-2xl"
        >
          <span aria-hidden="true">HWL·SMD</span>
          <span className="sr-only">HWL by SMD</span>
          <span
            aria-hidden="true"
            className="mt-1.5 font-serif text-xs font-medium tracking-[0.2em] text-[var(--muted-foreground)] uppercase"
          >
            Beauty · Body · Being
          </span>
        </Link>

        <MainNav />

        <div className="hidden items-center gap-4 lg:flex">
          <Button
            asChild
            size="sm"
            className="h-auto rounded-full bg-[var(--accent)] px-5 py-2 text-sm text-[var(--background)] hover:bg-[var(--primary)]"
          >
            <Link href="/book">Book</Link>
          </Button>
          <AuthLinks />
        </div>

        <MobileNav />
      </div>
    </header>
  )
}
