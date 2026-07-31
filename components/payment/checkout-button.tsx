"use client"

import { useState } from "react"
import { LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ProductId } from "@/lib/stripe"
import { cn } from "@/lib/utils"

export function CheckoutButton({
  className,
  label,
  productId,
  variant = "default",
}: {
  className?: string
  label: string
  productId: ProductId
  variant?: "default" | "outline"
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")

  async function checkout() {
    setPending(true)
    setError("")

    try {
      const response = await fetch("/api/checkout", {
        body: JSON.stringify({ productId }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      })
      const data = (await response.json()) as {
        error?: string
        loginUrl?: string
        url?: string
      }

      if (response.status === 401 && data.loginUrl) {
        window.location.assign(data.loginUrl)
        return
      }
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Checkout is not available yet.")
      }

      window.location.assign(data.url)
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Checkout is not available yet."
      )
      setPending(false)
    }
  }

  return (
    <div>
      <Button
        className={cn(
          "h-11 w-full rounded-full px-6",
          variant === "default"
            ? "bg-[var(--primary)] text-white hover:bg-[var(--accent)]"
            : "border-[var(--border)] bg-transparent text-[var(--primary)] hover:bg-[var(--muted)]",
          className
        )}
        disabled={pending}
        onClick={checkout}
        type="button"
        variant={variant}
      >
        {pending && (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        )}
        {pending ? "Opening secure checkout…" : label}
      </Button>
      {error && (
        <p className="mt-3 text-center text-xs leading-relaxed text-[#9c4b40]">
          {error}
        </p>
      )}
    </div>
  )
}
