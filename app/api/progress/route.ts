import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/access"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as {
    completed?: unknown
    lessonId?: unknown
    watchedUntilSecond?: unknown
  } | null
  if (
    typeof body?.lessonId !== "string" ||
    typeof body.completed !== "boolean"
  ) {
    return NextResponse.json(
      { error: "Invalid progress update." },
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
