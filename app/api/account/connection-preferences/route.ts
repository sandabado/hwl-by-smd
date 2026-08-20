import { NextResponse } from "next/server"

import { getAuthenticatedUser, getMemberAccess } from "@/lib/access"
import {
  hasAcceptableBodySize,
  hasJsonContentType,
  isSameOriginMutation,
} from "@/lib/relationships/request"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: "Request not allowed." }, { status: 403 })
  }
  if (!hasJsonContentType(request) || !hasAcceptableBodySize(request, 1_000)) {
    return NextResponse.json(
      { error: "A valid JSON request is required." },
      { status: 400 }
    )
  }

  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 })
  }
  const access = await getMemberAccess(user.id)
  if (!access.isMember) {
    return NextResponse.json(
      { error: "An active Den membership is required." },
      { status: 403 }
    )
  }

  const body = (await request.json().catch(() => null)) as {
    bookingInvites?: unknown
  } | null

  if (typeof body?.bookingInvites !== "boolean") {
    return NextResponse.json(
      { error: "Invalid connection preferences." },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json(
      { error: "Member accounts are not configured." },
      { status: 503 }
    )
  }

  const { error } = await supabase.from("connection_preferences").upsert(
    {
      booking_invites: body.bookingInvites,
      user_id: user.id,
    },
    { onConflict: "user_id" }
  )

  if (error) {
    return NextResponse.json(
      { error: "Your preferences could not be saved." },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
