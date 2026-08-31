import Link from "next/link"

import { cn } from "@/lib/utils"

export function InquiryPrivacyNotice({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "text-xs leading-5 text-[var(--muted-foreground)]",
        className
      )}
    >
      Your details are stored in Shannon&apos;s restricted private inbox so she
      can respond. Optional email alerts omit your submitted details. Read the{" "}
      <Link
        className="underline underline-offset-2 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:outline-none"
        href="/privacy"
      >
        privacy policy
      </Link>
      .
    </p>
  )
}
