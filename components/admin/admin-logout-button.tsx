"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export function AdminLogoutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function logout() {
    setPending(true)
    await fetch("/admin/api/logout", { method: "POST" })
    router.replace("/admin/login")
    router.refresh()
  }

  return (
    <button
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/55 transition hover:bg-white/8 hover:text-white"
      disabled={pending}
      onClick={logout}
      type="button"
    >
      <LogOut className="size-4" aria-hidden="true" />
      {pending ? "Leaving…" : "Sign out"}
    </button>
  )
}
