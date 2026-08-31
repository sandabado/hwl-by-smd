"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type ReconciliationStatus = "checking" | "failed" | "pending" | "refreshing"

type ReconciliationAttempt = {
  promise: Promise<boolean>
  refreshIssued: boolean
}

const reconciliationAttempts = new Map<string, ReconciliationAttempt>()

function getReconciliationAttempt(sessionId: string) {
  const existing = reconciliationAttempts.get(sessionId)
  if (existing) return existing

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 15_000)
  const attempt: ReconciliationAttempt = {
    promise: fetch("/api/checkout/reconcile", {
      body: JSON.stringify({ sessionId }),
      cache: "no-store",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      method: "POST",
      signal: controller.signal,
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => window.clearTimeout(timeoutId)),
    refreshIssued: false,
  }
  reconciliationAttempts.set(sessionId, attempt)
  return attempt
}

export function PaidCheckoutReconciler({ sessionId }: { sessionId: string }) {
  const router = useRouter()
  const [status, setStatus] = useState<ReconciliationStatus>("checking")

  useEffect(() => {
    let active = true
    const attempt = getReconciliationAttempt(sessionId)

    void attempt.promise.then((reconciled) => {
      if (!active) return
      if (!reconciled) {
        setStatus("failed")
        return
      }
      if (!attempt.refreshIssued) {
        attempt.refreshIssued = true
        setStatus("refreshing")
        router.refresh()
        return
      }
      setStatus("pending")
    })

    return () => {
      active = false
    }
  }, [router, sessionId])

  return (
    <p
      aria-live="polite"
      className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)]"
      role="status"
    >
      {status === "checking"
        ? "Securely checking the payment and entitlement…"
        : status === "refreshing"
          ? "Verification finished. Refreshing your access status…"
          : status === "pending"
            ? "Automatic verification finished, but access is not active yet. Check your account or contact Shannon."
            : "Automatic verification could not finish. This page did not grant access; check your account or contact Shannon."}
    </p>
  )
}
