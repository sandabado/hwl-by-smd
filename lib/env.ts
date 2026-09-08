import {
  getDeploymentTargetBoundary,
  isCanonicalSupabaseAdminConfiguration,
  isCanonicalSupabasePublicConfiguration,
} from "@/lib/commerce/launch-authority"

const present = (value: string | undefined) =>
  Boolean(value && !value.startsWith("your_"))

export const publicEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
}

export function isSupabaseConfigured() {
  const target = getDeploymentTargetBoundary(process.env)
  return isCanonicalSupabasePublicConfiguration(process.env, {
    allowUnscopedLocal: target === "local",
  })
}

export function isSupabaseAdminConfigured() {
  const target = getDeploymentTargetBoundary(process.env)
  return isCanonicalSupabaseAdminConfiguration(process.env, {
    allowUnscopedLocal: target === "local",
  })
}

export function isStripeConfigured() {
  return (
    present(process.env.STRIPE_SECRET_KEY) &&
    present(process.env.STRIPE_WEBHOOK_SECRET)
  )
}

export function getSiteUrl(requestUrl?: string) {
  if (present(process.env.NEXT_PUBLIC_SITE_URL)) {
    return process.env.NEXT_PUBLIC_SITE_URL!.replace(/\/$/, "")
  }

  return requestUrl ? new URL(requestUrl).origin : "http://localhost:3000"
}
