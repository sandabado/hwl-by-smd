import { NextResponse } from "next/server"

import { getAuthenticatedUser, getMemberAccess } from "@/lib/access"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

const SIGNED_CAPTIONS_SECONDS = 60 * 60

export async function GET() {
  const user = await getAuthenticatedUser()
  if (!user) {
    return new Response("Authentication required.", { status: 401 })
  }

  const access = await getMemberAccess(user.id)
  if (!access.canAccessLift) {
    return new Response("This account does not have Complete LIFT access.", {
      status: 403,
    })
  }

  const storagePath = process.env.LIFT_VIDEO_CAPTIONS_STORAGE_PATH
  const supabase = createAdminClient()
  if (!storagePath || !supabase) {
    return new Response("LIFT captions are not configured.", { status: 503 })
  }

  const { data, error } = await supabase.storage
    .from("member-content")
    .createSignedUrl(storagePath, SIGNED_CAPTIONS_SECONDS)
  if (error || !data.signedUrl) {
    return new Response("The private captions could not be prepared.", {
      status: 503,
    })
  }

  return NextResponse.redirect(data.signedUrl, {
    headers: { "Cache-Control": "private, no-store" },
    status: 307,
  })
}
