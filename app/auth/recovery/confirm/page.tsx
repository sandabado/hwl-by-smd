import type { Metadata } from "next"
import { cookies } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  PASSWORD_RECOVERY_NEXT_COOKIE,
  PASSWORD_RECOVERY_TOKEN_COOKIE,
} from "@/lib/password-recovery"
import { PRIVATE_ROUTE_ROBOTS } from "@/lib/private-route-metadata"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Continue Password Setup | HWL by SMD",
  description: "Securely continue setting your HWL by SMD account password.",
  robots: PRIVATE_ROUTE_ROBOTS,
}

export default async function ConfirmPasswordRecoveryPage() {
  const cookieStore = await cookies()
  const hasRecovery =
    cookieStore.has(PASSWORD_RECOVERY_TOKEN_COOKIE) &&
    cookieStore.has(PASSWORD_RECOVERY_NEXT_COOKIE)

  if (!hasRecovery) {
    redirect("/reset-password?error=auth_link_failed")
  }

  return (
    <section className="member-atmosphere px-6 py-24">
      <div className="mx-auto max-w-lg rounded-[2rem] border border-white/60 bg-white/65 p-8 shadow-xl backdrop-blur md:p-12">
        <p className="text-xs tracking-[0.3em] text-[var(--accent)] uppercase">
          Account care
        </p>
        <h1 className="mt-4 text-5xl font-medium text-[var(--primary)]">
          Your secure link is ready.
        </h1>
        <p className="mt-4 leading-relaxed text-[var(--muted-foreground)]">
          Continue once to verify this link, then choose the password for your
          HWL account.
        </p>
        <form action="/auth/recovery/complete" method="post">
          <Button
            className="mt-8 h-12 w-full rounded-full bg-[var(--primary)] text-white"
            type="submit"
          >
            Continue to Choose My Password
          </Button>
        </form>
        <Link
          className="mt-6 block text-center text-sm text-[var(--muted-foreground)] underline-offset-4 hover:underline"
          href="/reset-password"
        >
          Send a different secure link
        </Link>
      </div>
    </section>
  )
}
