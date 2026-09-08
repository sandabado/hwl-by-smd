"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays } from "lucide-react"

import { useBookingShelf } from "@/components/booking/booking-shelf-provider"
import { Button } from "@/components/ui/button"
import { BOOKING_NAV_ITEM, isCurrentPath } from "@/lib/nav-config"
import { cn } from "@/lib/utils"

export function BookingTrigger({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  const pathname = usePathname()
  const { isOpen, selected, setBookingShelfOpen } = useBookingShelf()
  const hasSelection = Boolean(selected)
  const accessibleLabel = hasSelection
    ? `Review selected session: ${selected?.service.title}`
    : BOOKING_NAV_ITEM.label
  const triggerClassName = cn(
    "min-h-11 rounded-full",
    compact
      ? "w-11 border border-[var(--accent)]/35 bg-transparent px-0 text-[var(--foreground)] hover:bg-[var(--accent)]/14 hover:text-[var(--foreground)]"
      : "bg-[var(--accent)] px-5 py-2 text-sm text-[var(--background)] hover:bg-[var(--primary)]",
    className
  )

  if (hasSelection) {
    return (
      <Button
        aria-controls="site-booking-sheet"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={accessibleLabel}
        className={triggerClassName}
        data-booking-trigger=""
        onClick={() => setBookingShelfOpen(true)}
        title={accessibleLabel}
        type="button"
        variant={compact ? "ghost" : "default"}
      >
        {compact ? (
          <CalendarDays aria-hidden="true" className="size-4.5" />
        ) : (
          "Review Session"
        )}
      </Button>
    )
  }

  return (
    <Button
      asChild
      className={triggerClassName}
      variant={compact ? "ghost" : "default"}
    >
      <Link
        aria-current={
          isCurrentPath(pathname, BOOKING_NAV_ITEM.href) ? "page" : undefined
        }
        aria-label={compact ? accessibleLabel : undefined}
        href={BOOKING_NAV_ITEM.href}
        title={compact ? accessibleLabel : undefined}
      >
        {compact ? (
          <CalendarDays aria-hidden="true" className="size-4.5" />
        ) : (
          BOOKING_NAV_ITEM.label
        )}
      </Link>
    </Button>
  )
}
