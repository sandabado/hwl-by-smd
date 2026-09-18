import "server-only"

import { NextResponse } from "next/server"

import { safeInternalPath } from "@/lib/safe-path"
import { createClient } from "@/lib/supabase/server"

type PostLoginUser = {
  id: string
}

type PostLoginClient = {
  auth: {
    getUser: () => Promise<{
      data: { user: PostLoginUser | null }
      error: unknown | null
    }>
  }
  rpc: (name: "current_admin_role") => PromiseLike<{
    data: string | null
    error: unknown | null
  }>
}

export type PostLoginDependencies = {
  createClient: () => Promise<PostLoginClient | null>
}

const runtimeDependencies: PostLoginDependencies = { createClient }
const ADMIN_ROLES = new Set(["administrator", "super_admin"])

function noStoreRedirect(url: URL) {
  const response = NextResponse.redirect(url)
  response.headers.set("Cache-Control", "no-store")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Referrer-Policy", "no-referrer")
  return response
}

/**
 * Resolves the default destination after authentication without exposing role
 * data to the browser. The protected /admin layout remains the final authority.
 */
export async function handlePostLogin(
  request: Request,
  dependencies: PostLoginDependencies = runtimeDependencies
) {
  const url = new URL(request.url)
  const memberDestination = safeInternalPath(
    url.searchParams.get("next"),
    "/library"
  )

  try {
    const supabase = await dependencies.createClient()
    if (!supabase) {
      return noStoreRedirect(new URL(memberDestination, url.origin))
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return noStoreRedirect(new URL("/login", url.origin))
    }

    const { data: role, error: roleError } =
      await supabase.rpc("current_admin_role")

    const destination =
      !roleError && role && ADMIN_ROLES.has(role) ? "/admin" : memberDestination

    return noStoreRedirect(new URL(destination, url.origin))
  } catch {
    // Provider details stay server-side. Role lookup failures never elevate a
    // member; any explicit protected destination still enforces its own guard.
    return noStoreRedirect(new URL(memberDestination, url.origin))
  }
}
