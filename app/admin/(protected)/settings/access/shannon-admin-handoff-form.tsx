"use client"

import { useActionState } from "react"
import { LoaderCircle, ShieldCheck } from "lucide-react"

import type { ShannonAdminHandoffState } from "@/lib/admin-role-handoff"

type HandoffAction = (
  previousState: ShannonAdminHandoffState,
  formData: FormData
) => Promise<ShannonAdminHandoffState>

const initialState: ShannonAdminHandoffState = {
  status: "idle",
  message: "",
}

const inputClassName =
  "min-h-11 w-full rounded-xl border border-[#d3ccc0] bg-white/72 px-3.5 py-2.5 text-sm text-[#38433a] outline-none transition placeholder:text-[#9ca19c] focus:border-[#809176] focus:ring-3 focus:ring-[#809176]/15 disabled:cursor-not-allowed disabled:bg-[#f3efe8]/75"

function messageClassName(status: ShannonAdminHandoffState["status"]) {
  if (status === "success") {
    return "border-[#aebda9] bg-[#edf3ea] text-[#4f684d]"
  }
  if (status === "error" || status === "unverified") {
    return "border-[#d9b7af] bg-[#f7ebe8] text-[#7d463e]"
  }
  return "border-[#dacdbb] bg-[#f5ede0] text-[#74644f]"
}

export function ShannonAdminHandoffForm({
  action,
  confirmationPhrase,
  mode,
}: {
  action: HandoffAction
  confirmationPhrase: string
  mode: "grant" | "revoke"
}) {
  const [state, formAction, pending] = useActionState(action, initialState)
  const terminal = state.status === "success" || state.status === "unverified"

  return (
    <form action={formAction} aria-busy={pending} className="mt-6">
      <div>
        <label
          className="mb-1.5 block text-[10px] font-semibold tracking-[0.15em] text-[#747d75] uppercase"
          htmlFor="handoff-confirmation"
        >
          Type to confirm
        </label>
        <input
          aria-describedby="handoff-confirmation-help"
          autoComplete="off"
          className={inputClassName}
          disabled={pending || terminal}
          id="handoff-confirmation"
          maxLength={40}
          name="confirmation"
          placeholder={confirmationPhrase}
          required
          spellCheck={false}
          type="text"
        />
        <p
          className="mt-2 text-xs leading-5 text-[#6f786f]"
          id="handoff-confirmation-help"
        >
          Type <strong>{confirmationPhrase}</strong>. The approved reference,
          actor, target, role transition, and exact deployment are pinned on the
          server and cannot be changed from this form.
        </p>
      </div>

      {state.status !== "idle" && (
        <p
          aria-live="polite"
          className={`mt-4 rounded-xl border px-4 py-3 text-xs leading-5 ${messageClassName(state.status)}`}
          role={
            state.status === "error" || state.status === "unverified"
              ? "alert"
              : "status"
          }
        >
          {state.message}
        </p>
      )}

      <button
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#273029] px-5 text-xs font-semibold text-white transition hover:bg-[#38443a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#273029] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending || terminal}
        type="submit"
      >
        {pending ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <ShieldCheck className="size-4" aria-hidden="true" />
        )}
        {pending
          ? "Verifying handoff…"
          : state.status === "success"
            ? "Profile change verified"
            : state.status === "unverified"
              ? "Audit verification required"
              : mode === "grant"
                ? "Grant Shannon administrator access"
                : "Revoke Shannon administrator access"}
      </button>
    </form>
  )
}
