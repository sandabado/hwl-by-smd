import "server-only"

import { cache } from "react"

import type { AdminRole } from "@/lib/admin-auth"
import { createClient } from "@/lib/supabase/server"

type CurrentAdminRoleClient = {
  rpc: (name: "current_admin_role") => PromiseLike<{
    data: string | null
    error: unknown | null
  }>
}

export type CurrentAdminRoleDependencies = {
  createClient: () => Promise<CurrentAdminRoleClient | null>
}

const runtimeDependencies: CurrentAdminRoleDependencies = {
  createClient: async () =>
    (await createClient()) as CurrentAdminRoleClient | null,
}

function normalizeAdminRole(value: string | null): AdminRole | null {
  return value === "administrator" || value === "super_admin" ? value : null
}

/**
 * Reads the current confirmed administrator tier for optional server-rendered
 * navigation. Failures return null; the protected /admin layout remains the
 * final authorization boundary.
 */
export async function getCurrentAdminRoleWithDependencies(
  dependencies: CurrentAdminRoleDependencies = runtimeDependencies
): Promise<AdminRole | null> {
  try {
    const supabase = await dependencies.createClient()
    if (!supabase) return null

    const { data, error } = await supabase.rpc("current_admin_role")
    return error ? null : normalizeAdminRole(data)
  } catch {
    return null
  }
}

export const getCurrentAdminRole = cache(() =>
  getCurrentAdminRoleWithDependencies()
)
