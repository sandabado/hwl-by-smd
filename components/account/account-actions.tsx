"use client"

import { useState } from "react"
import { CreditCard, LogOut } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"

export function AccountActions({ hasBilling }: { hasBilling: boolean }) {
  const { signOut } = useAuth()
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function manageBilling() {
    setPending(true)
    setError("")
    const response = await fetch("/api/portal", { method: "POST" })
    const data = (await response.json()) as { error?: string; url?: string }
    if (data.url) window.location.assign(data.url)
    else {
      setError(data.error ?? "The billing portal is unavailable.")
      setPending(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        {hasBilling && (
          <Button
            className="h-11 rounded-full bg-[var(--primary)] px-6 text-white"
            disabled={pending}
            onClick={manageBilling}
          >
            <CreditCard aria-hidden="true" />
            {pending ? "Opening…" : "Manage Billing"}
          </Button>
        )}
        <Button
          className="h-11 rounded-full border-[var(--border)] bg-transparent px-6 text-[var(--primary)]"
          onClick={signOut}
          variant="outline"
        >
          <LogOut aria-hidden="true" />
          Sign Out
        </Button>
      </div>
      {error && <p className="mt-3 text-sm text-[#9c4b40]">{error}</p>}
    </div>
  )
}
