"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const RECOVERY_ERROR =
  "Your secure reset session is no longer available. Please request a fresh reset link."

export function UpdatePasswordForm() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    const supabase = createClient()
    if (!supabase) {
      setError("The secure account connection is temporarily unavailable.")
      return
    }

    const formData = new FormData(event.currentTarget)
    const password = String(formData.get("password") ?? "")
    const confirmation = String(formData.get("passwordConfirmation") ?? "")
    if (password.length < 8) {
      setError("Please use at least 8 characters.")
      return
    }
    if (password !== confirmation) {
      setError("The passwords do not match.")
      return
    }

    setPending(true)
    try {
      const { data, error: sessionError } = await supabase.auth.getUser()
      if (sessionError || !data.user) {
        setError(RECOVERY_ERROR)
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })
      if (updateError) {
        setError(
          "We couldn’t save your new password. Please request a fresh reset link and try again."
        )
        return
      }

      router.replace("/account")
      router.refresh()
    } catch {
      setError(RECOVERY_ERROR)
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
        htmlFor="new-password"
      >
        New password
      </label>
      <input
        required
        minLength={8}
        autoComplete="new-password"
        aria-describedby="password-requirements"
        id="new-password"
        name="password"
        type="password"
        className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white/80 px-4 outline-none focus:border-[var(--accent)]"
        placeholder="At least 8 characters"
      />
      <p
        className="text-xs text-[var(--muted-foreground)]"
        id="password-requirements"
      >
        Use at least 8 characters.
      </p>
      <label
        className="block text-sm text-[var(--primary)]"
        htmlFor="confirm-password"
      >
        Confirm new password
      </label>
      <input
        required
        minLength={8}
        autoComplete="new-password"
        className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white/80 px-4 outline-none focus:border-[var(--accent)]"
        id="confirm-password"
        name="passwordConfirmation"
        type="password"
      />
      {error && (
        <p role="alert" className="text-sm text-[#9c4b40]">
          {error}
        </p>
      )}
      <Button
        className="h-12 w-full rounded-full bg-[var(--primary)] text-white"
        disabled={pending}
        type="submit"
      >
        {pending ? "Saving…" : "Save New Password"}
      </Button>
    </form>
  )
}
