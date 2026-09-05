import "server-only"

import { NextResponse } from "next/server"

import { safeInternalPath } from "@/lib/safe-path"
import { createClient } from "@/lib/supabase/server"

type AuthCallbackClient = {
  auth: {
    exchangeCodeForSession: (code: string) => Promise<{ error: unknown | null }>
    verifyOtp: (parameters: {
      token_hash: string
      type: "invite"
    }) => Promise<{ error: unknown | null }>
  }
}

export type AuthCallbackDependencies = {
  createClient: () => Promise<AuthCallbackClient | null>
}

const runtimeDependencies: AuthCallbackDependencies = { createClient }

function noStoreRedirect(url: URL) {
  const response = NextResponse.redirect(url)
  response.headers.set("Cache-Control", "no-store")
  return response
}

function failureRedirect(url: URL, redirectTo: string) {
  const loginUrl = new URL("/login", url.origin)
  loginUrl.searchParams.set("error", "auth_link_failed")
  loginUrl.searchParams.set("redirectTo", redirectTo)
  return noStoreRedirect(loginUrl)
}

/**
 * Completes browser-initiated PKCE callbacks and server-verifiable admin
 * invitations. Admin invitations cannot share the sender's PKCE verifier, so
 * their email template must deliver a token hash with type=invite instead.
 */
export async function handleAuthCallback(
  request: Request,
  dependencies: AuthCallbackDependencies = runtimeDependencies
) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const tokenHash = url.searchParams.get("token_hash")
  const type = url.searchParams.get("type")
  const redirectTo = safeInternalPath(
    url.searchParams.get("next"),
    tokenHash && type === "invite" ? "/update-password" : "/library"
  )

  try {
    const supabase = await dependencies.createClient()
    if (!supabase) return failureRedirect(url, redirectTo)

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        return noStoreRedirect(new URL(redirectTo, url.origin))
      }
    } else if (tokenHash && type === "invite") {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: "invite",
      })
      if (!error) {
        return noStoreRedirect(new URL(redirectTo, url.origin))
      }
    }
  } catch {
    // Provider details stay server-side; users receive one stable error state.
  }

  return failureRedirect(url, redirectTo)
}
