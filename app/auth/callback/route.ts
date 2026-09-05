import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { safeInternalPath } from "@/lib/safe-path"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const redirectTo = safeInternalPath(url.searchParams.get("next"), "/library")
  const supabase = await createClient()

  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(redirectTo, url.origin))
    }
  }

  const loginUrl = new URL("/login", url.origin)
  loginUrl.searchParams.set("error", "auth_link_failed")
  loginUrl.searchParams.set("redirectTo", redirectTo)

  return NextResponse.redirect(loginUrl)
}
