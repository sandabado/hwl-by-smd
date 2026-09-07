"use client"

import Link from "next/link"
import { UserRound } from "lucide-react"

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
          mobile ? "h-11 w-full" : "size-11"
        )}
      />
    )
  }

  return (
    <Link
      aria-label={mobile ? undefined : "My Account"}
      href={user ? "/account" : "/login"}
      onClick={onNavigate}
      className={cn(
        "inline-flex min-h-8 items-center justify-center rounded-full border border-[var(--accent)] px-4 py-1.5 text-sm text-[var(--primary)] transition-colors duration-200 hover:bg-[var(--accent)] hover:text-[var(--background)]",
        mobile ? "min-h-11 w-full py-2" : "size-11 p-0"
      )}
    >
      {mobile ? (
        "My Account"
      ) : (
        <UserRound className="size-4.5" aria-hidden="true" />
      )}
    </Link>
  )
}
