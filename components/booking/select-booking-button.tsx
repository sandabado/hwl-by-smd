"use client"

import type { MouseEvent } from "react"
import Link from "next/link"
import { ArrowRight, CalendarDays } from "lucide-react"

import { useBookingShelf } from "@/components/booking/booking-shelf-provider"
import { Button } from "@/components/ui/button"
import {
  getBookingServiceAction,
  type BookingPillarId,
  type BookingService,
} from "@/lib/booking-services"
import { cn } from "@/lib/utils"

const CATEGORY_LABELS: Record<BookingPillarId, string> = {
  beauty: "Beauty",
  movement: "Body",
  ritual: "Being",
}

export function SelectBookingButton({
  categoryLabel,
  className,
  label,
  pillarId,
  service,
  variant = "default",
}: {
  categoryLabel?: string
  className?: string
  label?: string
  pillarId: BookingPillarId
  service: BookingService
  variant?: "default" | "outline"
}) {
  const { isOpen, selectService, selected } = useBookingShelf()
  const action = getBookingServiceAction(service)
  const visibleLabel =
    label ??
    (action.kind === "book"
      ? "Select this session"
      : "Select this group ritual")
  const isCurrentSelection = selected?.service.slug === service.slug

  function openReviewShelf(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    selectService({
      categoryLabel: categoryLabel ?? CATEGORY_LABELS[pillarId],
      pillarId,
      service,
    })
  }

  return (
    <Button
      asChild
      className={cn("min-h-12 w-full rounded-full px-6", className)}
      variant={variant}
    >
      <Link
        aria-controls="site-booking-sheet"
        aria-expanded={isCurrentSelection ? isOpen : false}
        aria-haspopup="dialog"
        aria-label={`${visibleLabel}: ${service.title}`}
        data-booking-service={service.slug}
        data-booking-trigger=""
        href={action.href}
        onClick={openReviewShelf}
      >
        {action.kind === "book" ? (
          <CalendarDays aria-hidden="true" className="size-4" />
        ) : null}
        {visibleLabel}
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </Button>
  )
}
