import type { Metadata } from "next"

import { LoginForm } from "@/components/auth/login-form"
import { safeInternalPath } from "@/lib/safe-path"

export const metadata: Metadata = {
  title: "Sign In to The Den | HWL by SMD",
  description: "Enter your private HWL by SMD ritual library.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const { redirectTo } = await searchParams

  return (
    <section className="member-atmosphere px-6 py-20 md:py-28">
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1fr_0.85fr]">
        <div>
          <p className="text-xs font-medium tracking-[0.3em] text-[var(--accent)] uppercase">
            Your private sanctuary
          </p>
          <h1 className="mt-5 text-6xl leading-[0.9] font-medium text-[var(--primary)] md:text-8xl">
            Welcome
            <br />
            <em className="font-normal">back.</em>
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-relaxed text-[var(--muted-foreground)]">
            Return to your practices, continue your courses, and reconnect with
            the rituals Shannon has created for you.
          </p>
        </div>
        <LoginForm redirectTo={safeInternalPath(redirectTo, "/the-den")} />
      </div>
    </section>
  )
}
