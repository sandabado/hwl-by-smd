import "server-only"

import { timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { jwtVerify, SignJWT } from "jose"

const COOKIE_NAME = "hwl-demo-admin"

function secret() {
  const value = process.env.DEMO_ADMIN_SECRET
  return value ? new TextEncoder().encode(value) : null
}

export function isDemoAdminEnabled() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_DEV_ADMIN === "true" &&
    Boolean(
      process.env.DEMO_ADMIN_EMAIL &&
      process.env.DEMO_ADMIN_PASSWORD &&
      process.env.DEMO_ADMIN_SECRET
    )
  )
}

export function isLocalRequest(request: Request) {
  const hostname = new URL(request.url).hostname
  const origin = request.headers.get("origin")
  let originHostname = hostname
  try {
    originHostname = origin ? new URL(origin).hostname : hostname
  } catch {
    return false
  }
  return (
    (hostname === "localhost" || hostname === "127.0.0.1") &&
    (originHostname === "localhost" || originHostname === "127.0.0.1")
  )
}

function safeEqual(value: string, expected: string) {
  const valueBuffer = Buffer.from(value)
  const expectedBuffer = Buffer.from(expected)
  return (
    valueBuffer.length === expectedBuffer.length &&
    timingSafeEqual(valueBuffer, expectedBuffer)
  )
}

export function verifyDemoAdminCredentials(email: string, password: string) {
  if (!isDemoAdminEnabled()) return false

  return (
    safeEqual(
      email.toLowerCase(),
      process.env.DEMO_ADMIN_EMAIL!.toLowerCase()
    ) && safeEqual(password, process.env.DEMO_ADMIN_PASSWORD!)
  )
}

export async function createDemoAdminToken() {
  const signingSecret = secret()
  if (!isDemoAdminEnabled() || !signingSecret) return null

  return new SignJWT({ role: "admin-preview" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("hwl-by-smd-local")
    .setAudience("hwl-admin-preview")
    .setExpirationTime("1h")
    .sign(signingSecret)
}

export async function hasDemoAdminSession() {
  if (!isDemoAdminEnabled()) return false

  const token = (await cookies()).get(COOKIE_NAME)?.value
  const signingSecret = secret()
  if (!token || !signingSecret) return false

  try {
    const { payload } = await jwtVerify(token, signingSecret, {
      audience: "hwl-admin-preview",
      issuer: "hwl-by-smd-local",
    })
    return payload.role === "admin-preview"
  } catch {
    return false
  }
}

export async function requireDemoAdmin() {
  if (!isDemoAdminEnabled()) notFound()
  if (!(await hasDemoAdminSession())) {
    redirect("/admin/login")
  }
}

export const demoAdminCookie = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    maxAge: 60 * 60,
    path: "/admin",
    sameSite: "strict" as const,
    secure: false,
  },
}
