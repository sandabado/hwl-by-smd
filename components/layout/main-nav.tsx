"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { MAIN_NAV } from "@/lib/nav-config"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav
      className="hidden items-center gap-5 justify-self-center lg:flex xl:gap-8"
      aria-label="Main"
    >
      {MAIN_NAV.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative py-2 text-xs font-medium tracking-[0.12em] text-[var(--muted-foreground)] uppercase transition-colors duration-200 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[var(--accent)] after:transition-transform after:duration-200 hover:text-[var(--foreground)]",
              isActive && "text-[var(--foreground)] after:scale-x-100"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
