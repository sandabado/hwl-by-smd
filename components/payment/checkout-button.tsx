"use client"

import { useRef, useState } from "react"
import { LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ProductId } from "@/lib/stripe"
import { cn } from "@/lib/utils"

export function CheckoutButton({
  attemptId,
  className,
  label,
  onInternalRedirect,
  onPendingChange,
  productId,
  variant = "default",
}: {
  attemptId: string
  className?: string
  label: string
  onInternalRedirect?: () => void
  onPendingChange?: (pending: boolean) => void
  productId: ProductId
  variant?: "default" | "outline"
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const pendingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const cancelledByUserRef = useRef(false)

  function cancelCheckout() {
    cancelledByUserRef.current = true
    abortControllerRef.current?.abort()
  }

  async function checkout() {
    if (pendingRef.current) return
    pendingRef.current = true
    setPending(true)
    onPendingChange?.(true)
    setError("")
    cancelledByUserRef.current = false
    const abortController = new AbortController()
    abortControllerRef.current = abortController
    const timeoutId = window.setTimeout(() => abortController.abort(), 20_000)

    try {
      const response = await fetch("/api/checkout", {
        body: JSON.stringify({ attemptId, productId }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
        signal: abortController.signal,
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

      if (data.url.startsWith("/")) {
        onInternalRedirect?.()
      }
      window.location.assign(data.url)
    } catch (caught) {
      pendingRef.current = false
      setError(
        caught instanceof DOMException && caught.name === "AbortError"
          ? cancelledByUserRef.current
            ? "Checkout preparation canceled. Nothing was charged; your cart is saved."
            : "Secure checkout took too long to respond. Nothing was charged; your cart is saved—please try again."
          : caught instanceof Error
            ? caught.message
            : "Checkout is not available yet."
      )
      setPending(false)
      onPendingChange?.(false)
    } finally {
      window.clearTimeout(timeoutId)
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null
      }
    }
  }

  return (
    <div>
      <Button
        aria-busy={pending}
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
        {pending ? "Preparing secure checkout…" : label}
      </Button>
      {pending ? (
        <button
          className="mt-2 min-h-11 w-full text-xs font-medium text-[#675b4d] underline decoration-[#675b4d]/35 underline-offset-4 hover:decoration-[#675b4d]"
          onClick={cancelCheckout}
          type="button"
        >
          Cancel checkout preparation
        </button>
      ) : null}
      {error && (
        <p
          className="mt-3 text-center text-xs leading-relaxed text-[#9c4b40]"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
