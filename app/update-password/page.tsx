import type { Metadata } from "next"
import Link from "next/link"

import { UpdatePasswordForm } from "@/components/auth/update-password-form"
import { Button } from "@/components/ui/button"
import { PRIVATE_ROUTE_ROBOTS } from "@/lib/private-route-metadata"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Choose a New Password | HWL by SMD",
  description: "Securely choose a new password for your HWL by SMD account.",
  robots: PRIVATE_ROUTE_ROBOTS,
}

async function hasAuthenticatedUser() {
  try {
    const supabase = await createClient()
    if (!supabase) return false

    const { data, error } = await supabase.auth.getUser()
    return !error && Boolean(data.user)
  } catch {
    return false
  }
}

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ flow?: string | string[] }>
}) {
  const params = await searchParams
  const authenticated = await hasAuthenticatedUser()
  const flow = typeof params.flow === "string" ? params.flow : undefined
  const changingFromAccount = flow === "account"

  return (
    <section className="member-atmosphere px-6 py-24">
      <div className="mx-auto max-w-lg rounded-[2rem] border border-white/60 bg-white/65 p-8 shadow-xl backdrop-blur md:p-12">
        {authenticated ? (
          <>
            <p className="text-xs tracking-[0.3em] text-[var(--accent)] uppercase">
              {changingFromAccount
                ? "Password & security"
                : "A fresh beginning"}
            </p>
            <h1 className="mt-4 text-5xl font-medium text-[var(--primary)]">
              {changingFromAccount
                ? "Change your password"
                : "Choose your new password"}
            </h1>
            <p className="mt-4 leading-relaxed text-[var(--muted-foreground)]">
              Use at least 8 characters. Saving replaces the password currently
              connected to this account.
            </p>
            <UpdatePasswordForm />
          </>
        ) : (
          <div aria-labelledby="recovery-expired-title" role="alert">
            <p className="text-xs tracking-[0.3em] text-[var(--accent)] uppercase">
              Account care
            </p>
            <h1
              className="mt-4 text-5xl font-medium text-[var(--primary)]"
              id="recovery-expired-title"
            >
              This reset link has expired.
            </h1>
            <p className="mt-5 leading-relaxed text-[var(--muted-foreground)]">
              For your security, password links can only be used for a limited
              time. Request a fresh email to continue.
            </p>
            <Button
              asChild
              className="mt-8 h-12 w-full rounded-full bg-[var(--primary)] text-white"
            >
              <Link href="/reset-password">Request a New Reset Link</Link>
            </Button>
            <Link
              className="mt-6 block text-center text-sm text-[var(--muted-foreground)] underline-offset-4 hover:underline"
              href="/login"
            >
              Return to sign in
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
