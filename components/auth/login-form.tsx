"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

type Mode = "signin" | "signup"

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("signin")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [pending, setPending] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace(redirectTo)
    })
  }, [redirectTo, router, supabase])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setMessage("")

    if (!supabase) {
      setError("Member access is waiting for the secure account connection.")
      return
    }

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")
    const fullName = String(formData.get("fullName") ?? "").trim()

    if (password.length < 8) {
      setError("Please use a password with at least 8 characters.")
      return
    }

    setPending(true)
    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        router.replace(redirectTo)
        router.refresh()
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
          },
        })
        if (signUpError) throw signUpError
        setMessage(
          "Your sanctuary is almost ready. Check your email to confirm your account."
        )
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Something interrupted the ritual. Please try again."
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="rounded-[2rem] border border-white/60 bg-white/65 p-7 shadow-[0_30px_80px_rgba(90,74,63,0.12)] backdrop-blur md:p-10">
      <div
        className="grid grid-cols-2 rounded-full bg-[var(--muted)]/70 p-1"
        aria-label="Account action"
      >
        {(["signin", "signup"] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={mode === item}
            onClick={() => {
              setMode(item)
              setError("")
              setMessage("")
            }}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition",
              mode === item
                ? "bg-white text-[var(--primary)] shadow-sm"
                : "text-[var(--muted-foreground)]"
            )}
          >
            {item === "signin" ? "Sign In" : "Create Account"}
          </button>
        ))}
      </div>

      {!supabase && (
        <p className="mt-5 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-4 text-sm leading-relaxed text-[var(--primary)]">
          Secure library access is waiting for its Supabase connection. Account
          creation will open as soon as the project keys are added.
        </p>
      )}

      <form
        aria-busy={pending}
        className="mt-7 space-y-5"
        onSubmit={handleSubmit}
      >
        {mode === "signup" && (
          <label className="block text-sm text-[var(--primary)]">
            Your name
            <input
              required
              autoComplete="name"
              name="fullName"
              className="mt-2 h-12 w-full rounded-2xl border border-[var(--border)] bg-white/75 px-4 transition outline-none focus:border-[var(--accent)]"
              placeholder="What should Shannon call you?"
            />
          </label>
        )}
        <label className="block text-sm text-[var(--primary)]">
          Email
          <input
            required
            autoComplete="email"
            name="email"
            type="email"
            className="mt-2 h-12 w-full rounded-2xl border border-[var(--border)] bg-white/75 px-4 transition outline-none focus:border-[var(--accent)]"
            placeholder="you@example.com"
          />
        </label>
        <label className="block text-sm text-[var(--primary)]">
          Password
          <input
            required
            minLength={8}
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            name="password"
            type="password"
            className="mt-2 h-12 w-full rounded-2xl border border-[var(--border)] bg-white/75 px-4 transition outline-none focus:border-[var(--accent)]"
            placeholder="At least 8 characters"
          />
        </label>

        {error && (
          <p role="alert" className="text-sm leading-relaxed text-[#9c4b40]">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="text-sm leading-relaxed text-[#52694d]">
            {message}
          </p>
        )}

        <Button
          className="h-12 w-full rounded-full bg-[var(--primary)] text-white hover:bg-[var(--accent)]"
          disabled={pending}
          type="submit"
        >
          {pending && (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          )}
          {mode === "signin" ? "Sign In to Continue" : "Create My Account"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
        {mode === "signin" ? (
          <Link
            className="underline-offset-4 hover:underline"
            href="/reset-password"
          >
            Forgot your password?
          </Link>
        ) : (
          <p>
            By joining, you agree to the{" "}
            <Link className="underline underline-offset-4" href="/privacy">
              privacy policy
            </Link>{" "}
            and{" "}
            <Link className="underline underline-offset-4" href="/terms">
              terms
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  )
}
