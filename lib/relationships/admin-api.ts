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

export async function authenticateAdminApi(
  request: Request
): Promise<ApiAdminAuthResult> {
  if (
    isDemoAdminEnabled() &&
    isLocalRequest(request) &&
    (await hasDemoAdminSession())
  ) {
    return {
      access: { source: "local-preview", userId: null },
      ok: true,
    }
  }

  const supabase = await createClient()
  if (!supabase) return { ok: false, status: 503 }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return { ok: false, status: 401 }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError || !profile?.is_admin) {
    return { ok: false, status: 403 }
  }

  return {
    access: { source: "supabase", userId: user.id },
    ok: true,
  }
}
