import "server-only"

import {
  hasDemoAdminSession,
  isDemoAdminEnabled,
  isLocalRequest,
} from "@/lib/demo-admin"
import { createClient } from "@/lib/supabase/server"

export type ApiAdminAccess =
  | {
      source: "local-preview"
      userId: null
    }
  | {
      source: "supabase"
      userId: string
    }

export type ApiAdminAuthResult =
  { access: ApiAdminAccess; ok: true } | { ok: false; status: 401 | 403 | 503 }

type ApiAdminAuthUser = {
  email?: string | null
  email_confirmed_at?: string | null
  id: string
}

type ApiAdminProfile = {
  id: string
  is_admin: boolean
}

type ApiAdminAuthClient = {
  auth: {
    getUser: () => Promise<{
      data: { user: ApiAdminAuthUser | null }
      error: unknown | null
    }>
  }
  from: (table: "profiles") => {
    select: (columns: "id, is_admin") => {
      eq: (
        column: "id",
        value: string
      ) => {
        maybeSingle: () => Promise<{
          data: ApiAdminProfile | null
          error: unknown | null
        }>
      }
    }
  }
}

export type ApiAdminAuthorizationDependencies = {
  createClient: () => Promise<ApiAdminAuthClient | null>
  hasDemoAdminSession: () => Promise<boolean>
  isDemoAdminEnabled: () => boolean
  isLocalRequest: (request: Request) => boolean
}

const runtimeDependencies: ApiAdminAuthorizationDependencies = {
  createClient: async () => (await createClient()) as ApiAdminAuthClient | null,
  hasDemoAdminSession,
  isDemoAdminEnabled,
  isLocalRequest,
}

function normalizedEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? ""
}

export async function authenticateAdminApiWithDependencies(
  request: Request,
  dependencies: ApiAdminAuthorizationDependencies = runtimeDependencies
): Promise<ApiAdminAuthResult> {
  if (
    dependencies.isDemoAdminEnabled() &&
    dependencies.isLocalRequest(request) &&
    (await dependencies.hasDemoAdminSession())
  ) {
    return {
      access: { source: "local-preview", userId: null },
      ok: true,
    }
  }

  const supabase = await dependencies.createClient()
  if (!supabase) return { ok: false, status: 503 }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return { ok: false, status: 401 }
  if (!user.email_confirmed_at || !normalizedEmail(user.email)) {
    return { ok: false, status: 403 }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, is_admin")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError || !profile?.is_admin || profile.id !== user.id) {
    return { ok: false, status: 403 }
  }

  return {
    access: { source: "supabase", userId: user.id },
    ok: true,
  }
}

export async function authenticateAdminApi(request: Request) {
  return authenticateAdminApiWithDependencies(request)
}
