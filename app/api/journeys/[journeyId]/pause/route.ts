import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/access"
import {
  hasAcceptableBodySize,
  hasJsonContentType,
  isSameOriginMutation,
  isUuid,
} from "@/lib/relationships/request"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ journeyId: string }> }
) {
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

  const { journeyId } = await params
  const payload = (await request.json().catch(() => null)) as {
    paused?: unknown
  } | null
  if (!isUuid(journeyId) || typeof payload?.paused !== "boolean") {
    return NextResponse.json(
      { error: "Invalid journey update." },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json(
      { error: "Guided journeys are not configured yet." },
      { status: 503 }
    )
  }

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("journey_enrollments")
    .select("id, status")
    .eq("journey_id", journeyId)
    .eq("member_id", user.id)
    .maybeSingle()

  if (enrollmentError) {
    return NextResponse.json(
      { error: "Your journey could not be updated." },
      { status: 500 }
    )
  }
  if (!enrollment) {
    return NextResponse.json(
      { error: "Journey enrollment not found." },
      { status: 404 }
    )
  }

  const { data: nextStatus, error } = await supabase.rpc("set_journey_pause", {
    p_enrollment_id: enrollment.id,
    p_paused: payload.paused,
  })
  if (error) {
    return NextResponse.json(
      { error: "Your journey could not be updated." },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      enrollment: {
        id: enrollment.id,
        journeyId,
        status:
          typeof nextStatus === "string"
            ? nextStatus
            : payload.paused
              ? "paused"
              : "pending",
      },
      success: true,
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}
