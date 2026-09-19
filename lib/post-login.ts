import "server-only"

import { NextResponse } from "next/server"

import { isHostedAdminPage } from "@/lib/auth-route-policy"
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
const ADMIN_DEFAULT_DESTINATIONS = new Set(["/library", "/the-den", "/account"])

function noStoreRedirect(url: URL) {
  const response = NextResponse.redirect(url)
  response.headers.set("Cache-Control", "no-store")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Referrer-Policy", "no-referrer")
  return response
}

function loginRedirect(origin: string, destination: string) {
  const loginUrl = new URL("/login", origin)
  loginUrl.searchParams.set("redirectTo", destination)
  return noStoreRedirect(loginUrl)
}

function destinationForAdmin(destination: string, origin: string) {
  const requestedUrl = new URL(destination, origin)
  const { pathname } = requestedUrl

  if (isHostedAdminPage(pathname)) return destination
  if (
    pathname === "/account" &&
    requestedUrl.searchParams.get("notice") === "password-updated"
  ) {
    return destination
  }
  if (ADMIN_DEFAULT_DESTINATIONS.has(pathname)) return "/admin"

  // High-intent destinations such as checkout completion, course content, or
  // password setup remain intact. Only the ordinary member hubs become the
  // Admin Center default.
  return destination
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
      return loginRedirect(url.origin, memberDestination)
    }

    const { data: role, error: roleError } =
      await supabase.rpc("current_admin_role")

    const destination =
      !roleError && role && ADMIN_ROLES.has(role)
        ? destinationForAdmin(memberDestination, url.origin)
        : memberDestination

    return noStoreRedirect(new URL(destination, url.origin))
  } catch {
    // Provider details stay server-side. Role lookup failures never elevate a
    // member; any explicit protected destination still enforces its own guard.
    return noStoreRedirect(new URL(memberDestination, url.origin))
  }
}
