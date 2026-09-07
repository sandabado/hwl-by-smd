"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserRound } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { ACCOUNT_NAV_LABEL, isCurrentPath } from "@/lib/nav-config"
import { cn } from "@/lib/utils"

export function AuthLinks({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean
  onNavigate?: () => void
}) {
  const { loading, user } = useAuth()
  const pathname = usePathname()

  if (loading) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "block animate-pulse rounded-full bg-[var(--muted)]",
          mobile ? "h-11 w-full" : "size-11"
        )}
      />
    )
  }

  const href = user ? "/account" : "/login"
  const isCurrent = isCurrentPath(pathname, href)

  return (
    <Link
      aria-current={isCurrent ? "page" : undefined}
      aria-label={mobile ? undefined : ACCOUNT_NAV_LABEL}
      href={href}
      onClick={onNavigate}
      title={mobile ? undefined : ACCOUNT_NAV_LABEL}
      className={cn(
        "inline-flex min-h-8 items-center justify-center rounded-full border border-[var(--accent)] px-4 py-1.5 text-sm text-[var(--primary)] transition-colors duration-200 hover:bg-[var(--accent)] hover:text-[var(--background)]",
        mobile ? "min-h-11 w-full py-2" : "size-11 p-0",
        isCurrent && "bg-[var(--accent)] text-[var(--background)]"
      )}
    >
      {mobile ? (
        ACCOUNT_NAV_LABEL
      ) : (
        <UserRound className="size-4.5" aria-hidden="true" />
      )}
    </Link>
  )
}
