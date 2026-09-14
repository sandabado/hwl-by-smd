import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import {
  requiresSupabaseSession,
  supabaseLoginUrl,
} from "@/lib/auth-route-policy"
import { isDemoAdminEnabled } from "@/lib/demo-admin"
import { isSupabaseConfigured, publicEnv } from "@/lib/env"

const deferredConnectionPaths = new Set([
  "/den/connection",
  "/den/messages",
  "/the-den/connection",
  "/the-den/messages",
])

export async function updateSession(request: NextRequest) {
  if (deferredConnectionPaths.has(request.nextUrl.pathname)) {
    const contactUrl = request.nextUrl.clone()
    contactUrl.pathname = "/contact"
    contactUrl.search = ""
    contactUrl.searchParams.set("notice", "connection")
    return NextResponse.redirect(contactUrl)
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    publicEnv.supabaseUrl!,
    publicEnv.supabaseKey!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data } = await supabase.auth.getClaims()
  const isProtected = requiresSupabaseSession(request.nextUrl.pathname, {
    demoAdminEnabled: isDemoAdminEnabled(),
  })

  if (!data?.claims && isProtected) {
    return NextResponse.redirect(supabaseLoginUrl(request.nextUrl))
  }

  return response
}
