import "server-only"

import { cache } from "react"
import { notFound, redirect } from "next/navigation"

import { hasDemoAdminSession, isDemoAdminEnabled } from "@/lib/demo-admin"
import { createClient } from "@/lib/supabase/server"

export const ADMIN_ROLES = ["administrator", "super_admin"] as const

export type AdminRole = (typeof ADMIN_ROLES)[number]

export type AdminAccess =
  | {
      source: "local-preview"
      userId: null
      email: string
      role: "administrator"
    }
  | {
      source: "supabase"
      userId: string
      email: string
      role: AdminRole
    }

export type SuperAdminAccess = Extract<AdminAccess, { source: "supabase" }> & {
  role: "super_admin"
}

type AdminAuthUser = {
  email?: string | null
  email_confirmed_at?: string | null
  id: string
}

type AdminProfile = {
  admin_role: string | null
  id: string
  is_admin: boolean
}

type AdminAuthClient = {
  auth: {
    getUser: () => Promise<{
      data: { user: AdminAuthUser | null }
      error: unknown | null
    }>
  }
  from: (table: "profiles") => {
    select: (columns: "id, is_admin, admin_role") => {
      eq: (
        column: "id",
        value: string
      ) => {
        maybeSingle: () => Promise<{
          data: AdminProfile | null
          error: unknown | null
        }>
      }
    }
  }
}

export type AdminAuthorizationDependencies = {
  createClient: () => Promise<AdminAuthClient | null>
  hasDemoAdminSession: () => Promise<boolean>
  isDemoAdminEnabled: () => boolean
  notFound: () => never
  redirect: (path: string) => never
}

const runtimeDependencies: AdminAuthorizationDependencies = {
  createClient: async () => (await createClient()) as AdminAuthClient | null,
  hasDemoAdminSession,
  isDemoAdminEnabled,
  notFound,
  redirect,
}

function normalizedEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? ""
}

function adminRole(value: string | null | undefined): AdminRole | null {
  return value === "administrator" || value === "super_admin" ? value : null
}

/**
 * Server-only admin authorization.
 *
 * The signed local preview session is accepted only when the existing
 * development-only gate is enabled. In every other environment, authorization
 * requires a valid Supabase user whose own profile has is_admin = true.
 */
export async function requireAdminWithDependencies(
  dependencies: AdminAuthorizationDependencies = runtimeDependencies
): Promise<AdminAccess> {
  if (
    dependencies.isDemoAdminEnabled() &&
    (await dependencies.hasDemoAdminSession())
  ) {
    return {
      source: "local-preview",
      userId: null,
      email: process.env.DEMO_ADMIN_EMAIL ?? "local-preview",
      role: "administrator",
    }
  }

  const supabase = await dependencies.createClient()
  if (!supabase) {
    if (dependencies.isDemoAdminEnabled()) {
      dependencies.redirect("/admin/login")
    }
    dependencies.notFound()
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    if (dependencies.isDemoAdminEnabled()) {
      dependencies.redirect("/admin/login")
    }
    dependencies.redirect("/login?redirectTo=/admin")
  }

  const userEmail = normalizedEmail(user.email)
  if (!user.email_confirmed_at || !userEmail) dependencies.notFound()

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, is_admin, admin_role")
    .eq("id", user.id)
    .maybeSingle()

  const role = adminRole(profile?.admin_role)
  if (profileError || !profile?.is_admin || !role || profile.id !== user.id) {
    dependencies.notFound()
  }

  return {
    source: "supabase",
    userId: user.id,
    email: userEmail,
    role,
  }
}

export const requireAdmin = cache(() => requireAdminWithDependencies())

export async function requireSuperAdminWithDependencies(
  dependencies: AdminAuthorizationDependencies = runtimeDependencies
): Promise<SuperAdminAccess> {
  const access = await requireAdminWithDependencies(dependencies)

  if (access.source !== "supabase" || access.role !== "super_admin") {
    dependencies.notFound()
  }

  return { ...access, role: "super_admin" }
}

export const requireSuperAdmin = cache(() =>
  requireSuperAdminWithDependencies()
)
