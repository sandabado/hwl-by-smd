const present = (value: string | undefined) =>
  Boolean(value && !value.startsWith("your_"))

export const publicEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
}

export function isSupabaseConfigured() {
  return (
    present(publicEnv.supabaseUrl) &&
    present(publicEnv.supabaseKey) &&
    publicEnv.supabaseKey?.startsWith("sb_publishable_") === true
  )
}

export function isSupabaseAdminConfigured() {
  return (
    isSupabaseConfigured() &&
    present(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
    process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith("sb_secret_") === true
  )
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
