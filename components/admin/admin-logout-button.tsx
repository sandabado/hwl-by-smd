"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

const LOGOUT_DESTINATIONS = new Set([
  "/admin/login",
  "/login?redirectTo=/admin",
])

export function AdminLogoutButton() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function logout() {
    setError("")
    setPending(true)

    try {
      const response = await fetch("/admin/api/logout", { method: "POST" })
      const result = (await response.json().catch(() => null)) as {
        redirectTo?: unknown
      } | null

      if (
        !response.ok ||
        typeof result?.redirectTo !== "string" ||
        !LOGOUT_DESTINATIONS.has(result.redirectTo)
      ) {
        throw new Error("logout_failed")
      }

      router.replace(result.redirectTo)
      router.refresh()
    } catch {
      setError("Secure sign out is temporarily unavailable. Please try again.")
      setPending(false)
    }
  }

  return (
    <div>
      <button
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/55 transition hover:bg-white/8 hover:text-white"
        disabled={pending}
        onClick={logout}
        type="button"
      >
        <LogOut className="size-4" aria-hidden="true" />
        {pending ? "Leaving…" : "Sign out"}
      </button>
      {error ? (
        <p className="mt-2 px-3 text-xs leading-5 text-[#e1b9af]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
