"use client"

import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function ResetPasswordForm() {
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setMessage("")

    const supabase = createClient()
    if (!supabase) {
      setError("The secure account connection is temporarily unavailable.")
      return
    }

    setPending(true)
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase()
    const callbackUrl = new URL("/auth/callback", window.location.origin)
    callbackUrl.searchParams.set("next", "/update-password?flow=recovery")

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo: callbackUrl.toString() }
      )

      if (resetError) {
        setError(
          "We couldn’t send the secure email just yet. Please try again in a moment."
        )
        return
      }

      setMessage(
        "Email sent. Open the newest message from HWL by SMD and choose your new password. For your security, use only the newest link."
      )
    } catch {
      setError(
        "We couldn’t send the secure email just yet. Please try again in a moment."
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <form
      aria-busy={pending}
      className="mt-8 space-y-4"
      onSubmit={handleSubmit}
    >
      <label
        className="block text-sm text-[var(--primary)]"
        htmlFor="reset-email"
      >
        Account email
      </label>
      <input
        required
        autoComplete="email"
        id="reset-email"
        name="email"
        type="email"
        className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white/80 px-4 outline-none focus:border-[var(--accent)]"
        placeholder="you@example.com"
      />
      {error ? (
        <p role="alert" className="text-sm leading-relaxed text-[#9c4b40]">
          {error}
        </p>
      ) : null}
      {message ? (
        <p
          role="status"
          className="rounded-2xl border border-[#52694d]/20 bg-[#52694d]/8 p-4 text-sm leading-relaxed text-[#40523c]"
        >
          {message}
        </p>
      ) : null}
      <Button
        className="h-12 w-full rounded-full bg-[var(--primary)] text-white"
        disabled={pending}
        type="submit"
      >
        {pending
          ? "Sending…"
          : message
            ? "Send Another Link"
            : "Email My Secure Link"}
      </Button>
    </form>
  )
}
