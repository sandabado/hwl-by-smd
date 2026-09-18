import "server-only"

import { NextResponse } from "next/server"

import { isSameOriginMutation } from "@/lib/relationships/request"
import { safeInternalPath } from "@/lib/safe-path"

export const PASSWORD_RECOVERY_TOKEN_COOKIE = "hwl-recovery-token"
export const PASSWORD_RECOVERY_NEXT_COOKIE = "hwl-recovery-next"

const PASSWORD_RECOVERY_COOKIE_PATH = "/auth/recovery"
const PASSWORD_RECOVERY_MAX_AGE_SECONDS = 15 * 60
const PASSWORD_RECOVERY_DESTINATION = "/update-password?flow=recovery"
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/

type PasswordRecoveryClient = {
  auth: {
    verifyOtp: (parameters: {
      token_hash: string
      type: "recovery"
    }) => Promise<{ error: unknown | null }>
  }
}

type PasswordRecoveryCookieStore = {
  get: (name: string) => { value: string } | undefined
}

export type PasswordRecoveryDependencies = {
  createClient: () => Promise<PasswordRecoveryClient | null>
  getCookieStore: () => Promise<PasswordRecoveryCookieStore>
}

function recoveryCookieOptions(url: URL, maxAge: number) {
  return {
    httpOnly: true,
    maxAge,
    path: PASSWORD_RECOVERY_COOKIE_PATH,
    sameSite: "lax" as const,
    secure: url.protocol === "https:",
  }
}

function secureResponse<T extends Response>(response: T) {
  response.headers.set("Cache-Control", "no-store")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Referrer-Policy", "no-referrer")
  response.headers.set("X-Robots-Tag", "noindex, nofollow")
  return response
}

function recoveryFailure(url: URL) {
  const destination = new URL("/reset-password", url.origin)
  destination.searchParams.set("error", "auth_link_failed")
  return secureResponse(NextResponse.redirect(destination, { status: 303 }))
}

function validTokenHash(value: string | null) {
  return Boolean(
    value && value.length <= 2048 && !CONTROL_CHARACTERS.test(value)
  )
}

function clearRecoveryCookies(response: NextResponse, url: URL) {
  const options = recoveryCookieOptions(url, 0)
  response.cookies.set(PASSWORD_RECOVERY_TOKEN_COOKIE, "", options)
  response.cookies.set(PASSWORD_RECOVERY_NEXT_COOKIE, "", options)
  return response
}

/**
 * Stages a password-recovery token without consuming it. Email security
 * scanners commonly follow GET links, so verification happens only after the
 * person deliberately submits the confirmation form.
 */
export function stagePasswordRecovery(request: Request) {
  const url = new URL(request.url)
  const tokenHash = url.searchParams.get("token_hash")
  const type = url.searchParams.get("type")

  if (type !== "recovery" || !validTokenHash(tokenHash)) {
    return recoveryFailure(url)
  }

  const destination = safeInternalPath(
    url.searchParams.get("next"),
    PASSWORD_RECOVERY_DESTINATION
  )
  const response = secureResponse(
    NextResponse.redirect(new URL("/auth/recovery/confirm", url.origin), {
      status: 303,
    })
  )
  const options = recoveryCookieOptions(url, PASSWORD_RECOVERY_MAX_AGE_SECONDS)

  response.cookies.set(PASSWORD_RECOVERY_TOKEN_COOKIE, tokenHash!, options)
  response.cookies.set(PASSWORD_RECOVERY_NEXT_COOKIE, destination, options)
  return response
}

/** Completes a staged recovery only after a same-origin form submission. */
export async function completePasswordRecovery(
  request: Request,
  dependencies: PasswordRecoveryDependencies
) {
  const url = new URL(request.url)
  if (!isSameOriginMutation(request, { requireOrigin: true })) {
    return secureResponse(
      new NextResponse(null, {
        status: 403,
      })
    )
  }

  let cookieStore: PasswordRecoveryCookieStore
  try {
    cookieStore = await dependencies.getCookieStore()
  } catch {
    return recoveryFailure(url)
  }

  const tokenHash = cookieStore.get(PASSWORD_RECOVERY_TOKEN_COOKIE)?.value
  const destination = safeInternalPath(
    cookieStore.get(PASSWORD_RECOVERY_NEXT_COOKIE)?.value,
    PASSWORD_RECOVERY_DESTINATION
  )

  if (!validTokenHash(tokenHash ?? null)) {
    return clearRecoveryCookies(recoveryFailure(url), url)
  }

  try {
    const supabase = await dependencies.createClient()
    if (supabase) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash!,
        type: "recovery",
      })

      if (!error) {
        const response = secureResponse(
          NextResponse.redirect(new URL(destination, url.origin), {
            status: 303,
          })
        )
        return clearRecoveryCookies(response, url)
      }
    }
  } catch {
    // Provider details stay server-side; users receive one stable error state.
  }

  return clearRecoveryCookies(recoveryFailure(url), url)
}
