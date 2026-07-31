import "server-only"

import { cache } from "react"
import { notFound, redirect } from "next/navigation"

import { hasDemoAdminSession, isDemoAdminEnabled } from "@/lib/demo-admin"
import { createClient } from "@/lib/supabase/server"

export type AdminAccess =
  | {
      source: "local-preview"
      userId: null
      email: string
    }
  | {
      source: "supabase"
      userId: string
      email: string
    }

/**
 * Server-only admin authorization.
 *
 * The signed local preview session is accepted only when the existing
 * development-only gate is enabled. In every other environment, authorization
 * requires a valid Supabase user whose own profile has is_admin = true.
 */
export const requireAdmin = cache(async (): Promise<AdminAccess> => {
  if (isDemoAdminEnabled() && (await hasDemoAdminSession())) {
    return {
      source: "local-preview",
      userId: null,
      email: process.env.DEMO_ADMIN_EMAIL ?? "local-preview",
    }
  }

  const supabase = await createClient()
  if (!supabase) {
    if (isDemoAdminEnabled()) redirect("/admin/login")
    notFound()
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    if (isDemoAdminEnabled()) redirect("/admin/login")
    redirect("/login?redirectTo=/admin")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, is_admin")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError || !profile?.is_admin) notFound()

  return {
    source: "supabase",
    userId: user.id,
    email: profile.email || user.email || "",
  }
})
