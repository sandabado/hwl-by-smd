"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const items = [
  ["Today", "/the-den"],
  ["Library", "/library"],
  ["Connection", "/the-den/connection"],
  ["Book Shannon", "/book"],
  ["Account", "/account"],
]

export function MemberNavigation({
  hasMembership,
}: {
  hasMembership: boolean
}) {
  const pathname = usePathname()
  const visibleItems = hasMembership
    ? items
    : items.filter(([, href]) => href !== "/the-den/connection")

  return (
    <nav
      className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-white/60 bg-white/45 p-1 backdrop-blur"
      aria-label="Member area"
    >
      {visibleItems.map(([label, href]) => {
        const isCurrent =
          pathname === href ||
          (href !== "/the-den" && pathname.startsWith(`${href}/`))

        return (
          <Link
            aria-current={isCurrent ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-xs font-medium tracking-wide text-[var(--primary)] transition hover:bg-white/70",
              isCurrent && "bg-white/80 shadow-sm"
            )}
            href={href}
            key={href}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
