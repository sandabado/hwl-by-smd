import { NextResponse } from "next/server"

import {
  demoAdminCookie,
  hasDemoAdminSession,
  isDemoAdminEnabled,
  isLocalRequest,
} from "@/lib/demo-admin"

export async function POST(request: Request) {
  if (
    !isDemoAdminEnabled() ||
    !isLocalRequest(request) ||
    !(await hasDemoAdminSession())
  ) {
    return new Response("Not found.", { status: 404 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(demoAdminCookie.name, "", {
    ...demoAdminCookie.options,
    maxAge: 0,
  })
  return response
}
