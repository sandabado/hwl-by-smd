import Link from "next/link"

import { ResetPasswordForm } from "@/components/auth/reset-password-form"

function firstValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>
}) {
  const params = await searchParams
  const linkFailed = firstValue(params.error) === "auth_link_failed"

  return (
    <section className="member-atmosphere px-6 py-24">
      <div className="mx-auto max-w-lg rounded-[2rem] border border-white/60 bg-white/65 p-8 shadow-xl backdrop-blur md:p-12">
        <p className="text-xs tracking-[0.3em] text-[var(--accent)] uppercase">
          Account care
        </p>
        <h1 className="mt-4 text-5xl font-medium text-[var(--primary)]">
          Set or change your password
        </h1>
        <p className="mt-4 leading-relaxed text-[var(--muted-foreground)]">
          Enter the email for your HWL account. We&apos;ll send a private,
          one-time link so you can create your first password or replace the
          current one.
        </p>
        {linkFailed ? (
          <div
            className="mt-6 rounded-2xl border border-[#9c4b40]/25 bg-[#9c4b40]/8 p-4 text-sm leading-relaxed text-[var(--primary)]"
            role="alert"
          >
            <p className="font-medium">That reset link can&apos;t be used.</p>
            <p className="mt-1 text-[var(--muted-foreground)]">
              It may have expired or been replaced by a newer email. Send a
              fresh link below and use the newest message.
            </p>
          </div>
        ) : null}
        <ResetPasswordForm />
        <Link
          className="mt-6 block text-center text-sm text-[var(--muted-foreground)] hover:underline"
          href="/login"
        >
          I already have a password — return to sign in
        </Link>
      </div>
    </section>
  )
}
