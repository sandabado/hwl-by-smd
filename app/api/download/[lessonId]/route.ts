import { NextResponse } from "next/server"

import { getMemberAccess, getAuthenticatedUser } from "@/lib/access"
import { getLessonById } from "@/lib/member-content"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.redirect(
      new URL("/login?redirectTo=/library", request.url)
    )
  }

  const { lessonId } = await params
  const result = await getLessonById(lessonId)
  if (!result) return new Response("Not found.", { status: 404 })

  const access = await getMemberAccess(user.id)
  const allowed =
    result.course.access_tier === "membership"
      ? access.isMember
      : access.canDownloadLift
  if (!allowed) return new Response("Forbidden.", { status: 403 })

  const storagePath =
    result.lesson.pdf_storage_path ??
    (result.course.access_tier === "lift"
      ? process.env.LIFT_PDF_STORAGE_PATH
      : null)
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
