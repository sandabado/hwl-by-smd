import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/access"
import { createClient } from "@/lib/supabase/server"

const allowedCadences = new Set(["daily", "weekly", "relevant"])

export async function POST(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as {
    bookingInvites?: unknown
    guidanceCadence?: unknown
    shareProgress?: unknown
  } | null

  if (
    typeof body?.guidanceCadence !== "string" ||
    !allowedCadences.has(body.guidanceCadence) ||
    typeof body.bookingInvites !== "boolean" ||
    typeof body.shareProgress !== "boolean"
  ) {
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
      guidance_cadence: body.guidanceCadence,
      share_progress: body.shareProgress,
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
