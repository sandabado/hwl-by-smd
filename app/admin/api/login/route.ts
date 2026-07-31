import { NextResponse } from "next/server"

import {
  createDemoAdminToken,
  demoAdminCookie,
  isDemoAdminEnabled,
  isLocalRequest,
  verifyDemoAdminCredentials,
} from "@/lib/demo-admin"

export async function POST(request: Request) {
  if (!isDemoAdminEnabled() || !isLocalRequest(request)) {
    return new Response("Not found.", { status: 404 })
  }

  const body = (await request.json().catch(() => null)) as {
    email?: unknown
    password?: unknown
  } | null
  if (typeof body?.email !== "string" || typeof body.password !== "string") {
    return NextResponse.json({ error: "Enter both fields." }, { status: 400 })
  }

  if (!verifyDemoAdminCredentials(body.email.trim(), body.password)) {
    return NextResponse.json(
      { error: "That preview login does not match." },
      { status: 401 }
    )
  }

  const token = await createDemoAdminToken()
  if (!token) {
    return NextResponse.json(
      { error: "Preview access is unavailable." },
      { status: 503 }
    )
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(demoAdminCookie.name, token, demoAdminCookie.options)
  return response
}
