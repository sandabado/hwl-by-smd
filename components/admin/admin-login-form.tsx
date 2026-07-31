"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

export function AdminLoginForm() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError("")
    const data = new FormData(event.currentTarget)

    const response = await fetch("/admin/api/login", {
      body: JSON.stringify({
        email: data.get("email"),
        password: data.get("password"),
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })
    const result = (await response.json().catch(() => null)) as {
      error?: string
    } | null

    if (response.ok) {
      router.replace("/admin")
      router.refresh()
      return
    }

    setError(result?.error ?? "Preview login is unavailable.")
    setPending(false)
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <label className="block text-sm text-[#4d594f]">
        Admin email
        <input
          required
          autoComplete="username"
          className="mt-2 h-12 w-full rounded-2xl border border-[#d7d0c3] bg-white/65 px-4 text-[#273029] transition outline-none focus:border-[#9d8464]"
          name="email"
          type="email"
        />
      </label>
      <label className="block text-sm text-[#4d594f]">
        Password
        <input
          required
          autoComplete="current-password"
          className="mt-2 h-12 w-full rounded-2xl border border-[#d7d0c3] bg-white/65 px-4 text-[#273029] transition outline-none focus:border-[#9d8464]"
          name="password"
          type="password"
        />
      </label>
      {error && (
        <p className="rounded-xl bg-[#9c4b40]/10 p-3 text-sm text-[#8b4037]">
          {error}
        </p>
      )}
      <Button
        className="h-12 w-full rounded-full bg-[#273029] text-white hover:bg-[#9d8464]"
        disabled={pending}
        type="submit"
      >
        {pending ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : (
          <ArrowRight aria-hidden="true" />
        )}
        {pending ? "Entering…" : "Enter the Control Room"}
      </Button>
    </form>
  )
}
