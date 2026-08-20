import { NextResponse } from "next/server"

import { getAuthenticatedUser, getMemberAccess } from "@/lib/access"
import { getLessonById } from "@/lib/member-content"
import { createClient } from "@/lib/supabase/server"
import {
  hasAcceptableBodySize,
  hasJsonContentType,
  isSameOriginMutation,
  isUuid,
} from "@/lib/relationships/request"

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: "Request not allowed." }, { status: 403 })
  }
  if (!hasJsonContentType(request) || !hasAcceptableBodySize(request, 2_000)) {
    return NextResponse.json(
      { error: "A valid JSON request is required." },
      { status: 400 }
    )
  }
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as {
    completed?: unknown
    lessonId?: unknown
    watchedUntilSecond?: unknown
  } | null
  if (!isUuid(body?.lessonId) || typeof body.completed !== "boolean") {
    return NextResponse.json(
      { error: "Invalid progress update." },
      { status: 400 }
    )
  }

  const lesson = await getLessonById(body.lessonId)
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 })
  }
  const access = await getMemberAccess(user.id)
  const canAccessLesson =
    lesson.course.access_tier === "membership"
      ? access.isMember
      : access.canAccessLift
  if (!canAccessLesson) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 })
  }

  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json(
      { error: "Member accounts are not configured." },
      { status: 503 }
    )
  }

  const watchedUntilSecond =
    typeof body.watchedUntilSecond === "number"
      ? Math.max(0, Math.floor(body.watchedUntilSecond))
      : 0

  const { error } = await supabase.from("user_progress").upsert(
    {
      completed: body.completed,
      lesson_id: body.lessonId,
      user_id: user.id,
      watched_until_second: watchedUntilSecond,
    },
    { onConflict: "user_id,lesson_id" }
  )

  if (error) {
    return NextResponse.json(
      { error: "Progress could not be saved." },
      { status: 500 }
    )
  }
  return NextResponse.json({ success: true })
}
