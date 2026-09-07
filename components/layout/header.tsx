"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { AuthLinks } from "@/components/auth/auth-links"
import { CartTrigger } from "@/components/cart/cart-trigger"
import { MainNav } from "@/components/layout/main-nav"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const isHome = pathname === "/"
  const isAdmin = pathname.startsWith("/admin")

  useEffect(() => {
    if (isAdmin) return

    const onScroll = () => setScrolled(window.scrollY > 100)

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => window.removeEventListener("scroll", onScroll)
  }, [isAdmin])

  if (isAdmin) return null

  return (
    <header
      className={cn(
        "top-0 z-50 max-h-[72px] border-b transition-[height,background-color,box-shadow,backdrop-filter] duration-300",
        isHome
          ? "fixed inset-x-0 border-white/15 bg-[rgba(24,32,27,0.9)] shadow-none backdrop-blur-md [--accent:#d9c19f] [--background:#20251f] [--foreground:#f7f3ec] [--muted-foreground:#f7f3ecd1] [--primary:#f7f3ec]"
          : "sticky border-[var(--border)]/50 bg-[var(--background)]/80 backdrop-blur-md",
        scrolled &&
          (isHome
            ? "max-h-14 bg-[#18201b]/96 shadow-[0_8px_24px_rgba(20,25,21,0.14)] backdrop-blur-xl"
            : "max-h-14 bg-[var(--background)]/90 shadow-[0_8px_24px_rgba(43,39,36,0.06)] backdrop-blur-xl")
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
            Body · Beauty · Being
          </span>
        </Link>

        <MainNav />

        <div className="hidden items-center gap-3 lg:flex">
          <CartTrigger compact />
          <Button
            asChild
            size="sm"
            className="h-auto rounded-full bg-[var(--accent)] px-5 py-2 text-sm text-[var(--background)] hover:bg-[var(--primary)]"
          >
            <Link href="/book">Book</Link>
          </Button>
          <AuthLinks />
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <MobileNav />
          <CartTrigger compact />
        </div>
      </div>
    </header>
  )
}
