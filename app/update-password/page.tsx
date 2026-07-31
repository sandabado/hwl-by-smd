"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const supabase = createClient()
    if (!supabase) {
      setError("The secure account connection has not been added yet.")
      return
    }

    const formData = new FormData(event.currentTarget)
    const password = String(formData.get("password") ?? "")
    if (password.length < 8) {
      setError("Please use at least 8 characters.")
      return
    }

    setPending(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setPending(false)
    if (updateError) setError(updateError.message)
    else router.replace("/the-den")
  }

  return (
    <section className="member-atmosphere px-6 py-24">
      <div className="mx-auto max-w-lg rounded-[2rem] border border-white/60 bg-white/65 p-8 shadow-xl backdrop-blur md:p-12">
        <p className="text-xs tracking-[0.3em] text-[var(--accent)] uppercase">
          A fresh beginning
        </p>
        <h1 className="mt-4 text-5xl font-medium text-[var(--primary)]">
          Choose a new password
        </h1>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            required
            minLength={8}
            autoComplete="new-password"
            name="password"
            type="password"
            className="h-12 w-full rounded-2xl border border-[var(--border)] bg-white/80 px-4 outline-none focus:border-[var(--accent)]"
            placeholder="At least 8 characters"
          />
          {error && <p className="text-sm text-[#9c4b40]">{error}</p>}
          <Button
            className="h-12 w-full rounded-full bg-[var(--primary)] text-white"
            disabled={pending}
          >
            {pending ? "Saving…" : "Save New Password"}
          </Button>
        </form>
      </div>
    </section>
  )
}
