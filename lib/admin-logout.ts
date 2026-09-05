import "server-only"

import { NextResponse } from "next/server"

import {
  demoAdminCookie,
  hasDemoAdminSession,
  isDemoAdminEnabled,
  isLocalRequest,
} from "@/lib/demo-admin"
import { isSameOriginMutation } from "@/lib/relationships/request"
import { createClient } from "@/lib/supabase/server"

type SignOutClient = {
  auth: {
    signOut: () => Promise<{ error: unknown | null }>
  }
}

export type AdminLogoutDependencies = {
  createClient: () => Promise<SignOutClient | null>
  hasDemoAdminSession: () => Promise<boolean>
  isDemoAdminEnabled: () => boolean
  isLocalRequest: (request: Request) => boolean
}

const runtimeDependencies: AdminLogoutDependencies = {
  createClient,
  hasDemoAdminSession,
  isDemoAdminEnabled,
  isLocalRequest,
}

function errorResponse(status: 403 | 503) {
  return NextResponse.json(
    {
      error:
        status === 403
          ? "Request not allowed."
          : "Secure sign out is temporarily unavailable.",
    },
    {
      headers: { "Cache-Control": "no-store" },
      status,
    }
  )
}

function successResponse(
  redirectTo: "/admin/login" | "/login?redirectTo=/admin"
) {
  return NextResponse.json(
    { redirectTo, success: true },
    { headers: { "Cache-Control": "no-store" } }
  )
}

export async function handleAdminLogout(
  request: Request,
  dependencies: AdminLogoutDependencies = runtimeDependencies
) {
  if (!isSameOriginMutation(request, { requireOrigin: true })) {
    return errorResponse(403)
  }

  const demoSession =
    dependencies.isDemoAdminEnabled() &&
    dependencies.isLocalRequest(request) &&
    (await dependencies.hasDemoAdminSession())

  if (demoSession) {
    const response = successResponse("/admin/login")
    response.cookies.set(demoAdminCookie.name, "", {
      ...demoAdminCookie.options,
      maxAge: 0,
    })
    return response
  }

  try {
    const supabase = await dependencies.createClient()
    if (!supabase) return errorResponse(503)

    const { error } = await supabase.auth.signOut()
    if (error) return errorResponse(503)
  } catch {
    return errorResponse(503)
  }

  return successResponse("/login?redirectTo=/admin")
}
