"use client"

import Link from "next/link"

import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"

export function AuthLinks({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean
  onNavigate?: () => void
}) {
  const { loading, user } = useAuth()

  if (loading) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "block animate-pulse rounded-full bg-[var(--muted)]",
          mobile ? "h-11 w-full" : "h-8 w-16"
        )}
      />
    )
  }

  if (!user) {
    return (
      <Link
        href="/login"
        onClick={onNavigate}
        className={cn(
          "text-sm text-[var(--muted-foreground)] transition-colors duration-200 hover:text-[var(--foreground)]",
          mobile &&
            "flex min-h-11 w-full items-center justify-center rounded-full border border-[var(--accent)] px-4 py-2 text-[var(--primary)]"
        )}
      >
        Sign In
      </Link>
    )
  }

  return (
    <Link
      href="/library"
      onClick={onNavigate}
      className={cn(
        "inline-flex min-h-8 items-center justify-center rounded-full border border-[var(--accent)] px-4 py-1.5 text-sm text-[var(--primary)] transition-colors duration-200 hover:bg-[var(--accent)] hover:text-[var(--background)]",
        mobile && "min-h-11 w-full py-2"
      )}
    >
      Library
    </Link>
  )
}
