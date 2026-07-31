"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    const supabase = createClient()
    if (!supabase) {
      setError("The secure account connection has not been added yet.")
      return
    }

    setPending(true)
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "")
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      }
    )
    setPending(false)

    if (resetError) setError(resetError.message)
    else setMessage("Check your email for a private reset link.")
  }

  return (
    <section className="member-atmosphere px-6 py-24">
      <div className="mx-auto max-w-lg rounded-[2rem] border border-white/60 bg-white/65 p-8 shadow-xl backdrop-blur md:p-12">
        <p className="text-xs tracking-[0.3em] text-[var(--accent)] uppercase">
          Account care
        </p>
        <h1 className="mt-4 text-5xl font-medium text-[var(--primary)]">
          Reset your password
        </h1>
        <p className="mt-4 leading-relaxed text-[var(--muted-foreground)]">
          Enter your email and we&apos;ll send a secure link.
        </p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            required
            autoComplete="email"
            name="email"
            type="email"
            className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white/80 px-4 outline-none focus:border-[var(--accent)]"
            placeholder="you@example.com"
          />
          {error && <p className="text-sm text-[#9c4b40]">{error}</p>}
          {message && <p className="text-sm text-[#52694d]">{message}</p>}
          <Button
            className="h-12 w-full rounded-full bg-[var(--primary)] text-white"
            disabled={pending}
          >
            {pending ? "Sending…" : "Send Reset Link"}
          </Button>
        </form>
        <Link
          className="mt-6 block text-center text-sm text-[var(--muted-foreground)] hover:underline"
          href="/login"
        >
          Return to sign in
        </Link>
      </div>
    </section>
  )
}
