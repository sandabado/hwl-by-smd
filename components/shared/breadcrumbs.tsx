import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  href?: string
  label: string
}

interface BreadcrumbsProps {
  className?: string
  homeHref?: string
  homeLabel?: string
  items: BreadcrumbItem[]
}

export function Breadcrumbs({
  className,
  homeHref = "/",
  homeLabel = "Home",
  items,
}: BreadcrumbsProps) {
  if (items.length === 0) return null

  const firstItem = items[0]
  const trail =
    firstItem.href === homeHref
      ? items
      : [{ href: homeHref, label: homeLabel }, ...items]
  const currentItem = trail[trail.length - 1]

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("text-xs text-[var(--muted-foreground)]", className)}
    >
      <span aria-current="page" className="sm:hidden">
        {currentItem.label}
      </span>

      <ol className="hidden flex-wrap items-center gap-2 sm:flex">
        {trail.map((item, index) => {
          const isCurrent = index === trail.length - 1

          return (
            <li
              className="flex items-center gap-2"
              key={`${item.label}-${index}`}
            >
              {index > 0 ? (
                <ChevronRight
                  aria-hidden="true"
                  className="size-3 opacity-60"
                />
              ) : null}
              {isCurrent ? (
                <span
                  aria-current="page"
                  className="font-medium text-[var(--primary)]"
                >
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  className="rounded-sm underline-offset-4 transition-colors outline-none hover:text-[var(--primary)] hover:underline focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ) : (
                <span>{item.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
