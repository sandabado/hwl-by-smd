import { NextResponse } from "next/server"

import { getAuthenticatedUser, getMemberAccess } from "@/lib/access"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.redirect(
      new URL("/login?redirectTo=/library", request.url)
    )
  }

  const access = await getMemberAccess(user.id)
  if (!access.canDownloadLift) {
    return NextResponse.redirect(
      new URL("/beauty/lift?access=lift_guide_only", request.url)
    )
  }

  const storagePath = process.env.LIFT_PDF_STORAGE_PATH
  const supabase = createAdminClient()
  if (!storagePath || !supabase) {
    return new Response("The guide has not been uploaded yet.", { status: 404 })
  }

  const { data, error } = await supabase.storage
    .from("member-content")
    .createSignedUrl(storagePath, 60, { download: true })
  if (error || !data.signedUrl) {
    return new Response("The private download could not be prepared.", {
      status: 500,
    })
  }

  return NextResponse.redirect(data.signedUrl, {
    headers: { "Cache-Control": "private, no-store" },
  })
}
