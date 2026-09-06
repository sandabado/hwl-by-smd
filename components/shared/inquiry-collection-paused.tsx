import Link from "next/link"

import { cn } from "@/lib/utils"

export function InquiryCollectionPaused({
  actionHref,
  actionLabel,
  className,
  description = "Shannon’s private inquiry inbox is not accepting online notes yet. Published appointment times remain available on the Book page.",
  showBookingLink = true,
  title = "Online inquiries are paused.",
}: {
  actionHref?: string
  actionLabel?: string
  className?: string
  description?: string
  showBookingLink?: boolean
  title?: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-white/72 p-5 text-left",
        className
      )}
      role="status"
    >
      <p className="font-serif text-xl text-[var(--primary)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
        {description}
      </p>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
        {actionHref && actionLabel ? (
          <a
            className="text-[var(--accent)] underline underline-offset-4 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:outline-none"
            href={actionHref}
          >
            {actionLabel}
          </a>
        ) : null}
        {showBookingLink ? (
          <Link
            className="text-[var(--accent)] underline underline-offset-4 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:outline-none"
            href="/book"
          >
            View live booking times
          </Link>
        ) : null}
        <Link
          className="text-[var(--primary)] underline decoration-[var(--border)] underline-offset-4 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:outline-none"
          href="/privacy"
        >
          Read the privacy policy
        </Link>
      </div>
    </div>
  )
}
