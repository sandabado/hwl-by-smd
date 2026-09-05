import type { Metadata } from "next"

import { LoginForm } from "@/components/auth/login-form"
import { loginAuthFeedback } from "@/lib/auth-feedback"
import { safeInternalPath } from "@/lib/safe-path"

export const metadata: Metadata = {
  title: "Sign In | HWL by SMD",
  description: "Sign in to your private HWL by SMD ritual library.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string | string[]
    error_code?: string | string[]
    redirectTo?: string | string[]
  }>
}) {
  const params = await searchParams
  const firstValue = (value: string | string[] | undefined) =>
    typeof value === "string" ? value : undefined
  const feedback = loginAuthFeedback({
    errorCode: firstValue(params.error_code),
    legacyOrNormalizedError: firstValue(params.error),
  })
  const redirectTo = safeInternalPath(firstValue(params.redirectTo), "/library")

  return (
    <section className="member-atmosphere px-6 py-20 md:py-28">
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1fr_0.85fr]">
        <div>
          <p className="text-xs font-medium tracking-[0.3em] text-[var(--accent)] uppercase">
            Your private library
          </p>
          <h1 className="mt-5 text-6xl leading-[0.9] font-medium text-[var(--primary)] md:text-8xl">
            Welcome
            <br />
            <em className="font-normal">back.</em>
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-relaxed text-[var(--muted-foreground)]">
            Sign in or create your account to complete checkout, receive LIFT,
            and return to every practice you own.
          </p>
        </div>
        <LoginForm feedback={feedback} redirectTo={redirectTo} />
      </div>
    </section>
  )
}
