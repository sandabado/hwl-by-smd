"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const primaryItems = [
  ["Today", "/the-den"],
  ["Library", "/library"],
  ["Book Shannon", "/book"],
  ["Account", "/account"],
]

export function MemberNavigation({
  showSessions = false,
}: {
  showSessions?: boolean
}) {
  const pathname = usePathname()
  const items = showSessions
    ? [
        primaryItems[0],
        ["Sessions", "/the-den/sessions"],
        ...primaryItems.slice(1),
      ]
    : primaryItems

  return (
    <nav
      className="grid w-full grid-cols-2 gap-1 rounded-[1.5rem] border border-white/60 bg-white/45 p-1 backdrop-blur sm:flex sm:w-auto sm:flex-wrap sm:rounded-full"
      aria-label="Member area"
    >
      {items.map(([label, href]) => {
        const isCurrent =
          pathname === href ||
          (href !== "/the-den" && pathname.startsWith(`${href}/`))

        return (
          <Link
            aria-current={isCurrent ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 min-w-0 items-center justify-center rounded-full px-3 py-2 text-center text-xs font-medium tracking-wide text-[var(--primary)] transition hover:bg-white/70 sm:px-4",
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
