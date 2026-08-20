import { NextResponse } from "next/server"

import { getAuthenticatedUser, getMemberAccess } from "@/lib/access"
import { isRelationshipSchemaUnavailable } from "@/lib/relationships/conversations"
import {
  hasAcceptableBodySize,
  isSameOriginMutation,
  isUuid,
} from "@/lib/relationships/request"
import { createClient } from "@/lib/supabase/server"

const PARTICIPATING_ENROLLMENT_STATUSES = ["pending", "active", "paused"]

export async function POST(
  request: Request,
  { params }: { params: Promise<{ journeyId: string }> }
) {
  if (
    !isSameOriginMutation(request) ||
    !hasAcceptableBodySize(request, 1_000)
  ) {
    return NextResponse.json({ error: "Request not allowed." }, { status: 403 })
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

  const { journeyId } = await params
  if (!isUuid(journeyId)) {
    return NextResponse.json({ error: "Journey not found." }, { status: 404 })
  }

  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json(
      { error: "Guided journeys are not configured yet." },
      { status: 503 }
    )
  }

  const { data: journey, error: journeyError } = await supabase
    .from("journeys")
    .select("id, name, status, enrollment_mode")
    .eq("id", journeyId)
    .eq("enrollment_mode", "opt_in")
    .in("status", ["scheduled", "active"])
    .maybeSingle()

  if (journeyError) {
    return NextResponse.json(
      {
        error: isRelationshipSchemaUnavailable(journeyError)
          ? "Guided journeys are being prepared."
          : "The journey could not be opened.",
      },
      { status: isRelationshipSchemaUnavailable(journeyError) ? 503 : 500 }
    )
  }
  if (!journey) {
    return NextResponse.json({ error: "Journey not found." }, { status: 404 })
  }

  const { data: existing, error: existingError } = await supabase
    .from("journey_enrollments")
    .select("id, status")
    .eq("journey_id", journeyId)
    .eq("member_id", user.id)
    .maybeSingle()

  if (existingError) {
    return NextResponse.json(
      { error: "Your journey status could not be checked." },
      { status: 500 }
    )
  }

  if (existing) {
    if (PARTICIPATING_ENROLLMENT_STATUSES.includes(existing.status)) {
      return NextResponse.json(
        {
          enrollment: {
            id: existing.id,
            journeyId,
            status: existing.status,
          },
          success: true,
        },
        { headers: { "Cache-Control": "no-store" } }
      )
    }
  }

  const { count, error: countError } = await supabase
    .from("journey_enrollments")
    .select("id", { count: "exact", head: true })
    .eq("member_id", user.id)
    .in("status", PARTICIPATING_ENROLLMENT_STATUSES)

  if (countError) {
    return NextResponse.json(
      { error: "Your active journeys could not be checked." },
      { status: 500 }
    )
  }
  if ((count ?? 0) >= 2) {
    return NextResponse.json(
      {
        error:
          "You already have two active journeys. Complete or leave one before joining another.",
      },
      { status: 409 }
    )
  }

  const { data: latestCompletion, error: completionError } = await supabase
    .from("journey_enrollments")
    .select("completed_at")
    .eq("member_id", user.id)
    .eq("status", "completed")
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (completionError) {
    return NextResponse.json(
      { error: "Your journey rhythm could not be checked." },
      { status: 500 }
    )
  }

  if (latestCompletion?.completed_at) {
    const retryAt = new Date(
      new Date(latestCompletion.completed_at).getTime() + 24 * 60 * 60 * 1000
    )
    if (retryAt.getTime() > Date.now()) {
      return NextResponse.json(
        {
          error:
            "Your integration day is still in progress. This journey can begin after a full day of quiet.",
          retryAt: retryAt.toISOString(),
        },
        { status: 409 }
      )
    }
  }

  if (existing) {
    const { data: nextStatus, error: participationError } = await supabase.rpc(
      "set_journey_participation",
      {
        p_enrollment_id: existing.id,
        p_participating: true,
      }
    )
    if (participationError) {
      return NextResponse.json(
        { error: "This journey could not be rejoined." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        enrollment: {
          id: existing.id,
          journeyId,
          status: typeof nextStatus === "string" ? nextStatus : "pending",
        },
        success: true,
      },
      { headers: { "Cache-Control": "no-store" } }
    )
  }

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("journey_enrollments")
    .insert({
      journey_id: journeyId,
      member_id: user.id,
    })
    .select("id, status")
    .single()

  if (enrollmentError) {
    return NextResponse.json(
      {
        error: isRelationshipSchemaUnavailable(enrollmentError)
          ? "Guided journeys are being prepared."
          : "You could not be added to this journey.",
      },
      { status: isRelationshipSchemaUnavailable(enrollmentError) ? 503 : 500 }
    )
  }

  return NextResponse.json(
    {
      enrollment: {
        id: enrollment.id,
        journeyId,
        status: enrollment.status,
      },
      success: true,
    },
    {
      headers: { "Cache-Control": "no-store" },
      status: 201,
    }
  )
}
