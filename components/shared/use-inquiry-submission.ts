"use client"

import { useCallback, useRef } from "react"

export type InquiryNotificationStatus =
  | "accepted"
  | "attempting"
  | "audit_unknown"
  | "failed"
  | "not_configured"
  | "unattempted"

export type InquiryReceipt = {
  message?: string
  notification: InquiryNotificationStatus
  ok: true
  received: true
}

type SubmissionAttempt = {
  id: string
  serializedPayload: string
}

/**
 * Keeps one logical submission ID across network retries. If the visitor edits
 * the payload after an error, the changed submission receives a new ID.
 */
export function useInquirySubmission() {
  const attemptRef = useRef<SubmissionAttempt | null>(null)

  return useCallback(
    async (
      payload: Record<string, unknown>,
      fallbackError: string
    ): Promise<InquiryReceipt> => {
      const serializedPayload = JSON.stringify(payload)
      let attempt = attemptRef.current

      if (!attempt || attempt.serializedPayload !== serializedPayload) {
        attempt = {
          id: window.crypto.randomUUID(),
          serializedPayload,
        }
        attemptRef.current = attempt
      }

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          submissionId: attempt.id,
        }),
      })

      let result: Partial<InquiryReceipt>
      try {
        result = (await response.json()) as Partial<InquiryReceipt>
      } catch {
        throw new Error(fallbackError)
      }

      if (!response.ok) {
        throw new Error(result.message ?? fallbackError)
      }

      if (result.received !== true) {
        throw new Error(
          result.message ??
            "We could not confirm that your note was received. Please try again."
        )
      }

      attemptRef.current = null
      return result as InquiryReceipt
    },
    []
  )
}

export function inquiryReceiptMessage(
  receipt: InquiryReceipt,
  acceptedMessage: string
) {
  return receipt.notification === "accepted"
    ? acceptedMessage
    : (receipt.message ??
        "Your note is safely received in Shannon’s private inbox.")
}
