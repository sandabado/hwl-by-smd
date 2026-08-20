import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"

import type {
  ConnectionPreferences,
  JourneyDeliveryRecord,
  JourneyEnrollmentRecord,
  JourneyMilestoneRecord,
  JourneyRecord,
  MessageBodyFormat,
  RelationshipRecord,
} from "@/lib/connection-engine/types"
import { DEFAULT_CONNECTION_PREFERENCES } from "@/lib/connection-engine/types"
import { getSiteUrl } from "@/lib/env"
import { createAdminClient } from "@/lib/supabase/server"

type MemberIdentity = {
  email: string
  full_name: string | null
  id: string
}

type DeliveryContext = {
  delivery: JourneyDeliveryRecord
  enrollment: JourneyEnrollmentRecord
  journey: JourneyRecord
  member: MemberIdentity
  milestone: JourneyMilestoneRecord
  preferences: Pick<
    ConnectionPreferences,
    "guidance_cadence" | "booking_invites" | "share_progress"
  >
}

class InactiveMembershipError extends Error {
  constructor() {
    super("Journey delivery cancelled because membership is not active.")
    this.name = "InactiveMembershipError"
  }
}

export type JourneyDeliveryEmail = {
  bodyHtml: string
  idempotencyKey: string
  replyTo?: string
  subject: string
  to: string
}

export type JourneyMessageSender = (
  email: JourneyDeliveryEmail
) => Promise<{ providerMessageId: string | null }>

export type JourneySchedulerResult = {
  activatedEnrollments: number
  activatedJourneys: number
  claimed: number
  completedJourneys: number
  configured: boolean
  failed: number
  sent: number
}

const DELIVERY_SELECT =
  "id, enrollment_id, milestone_id, scheduled_for, status, attempts, last_attempt_at, sent_at, provider_message_id, conversation_message_id, error_message, created_at, updated_at"

const MILESTONE_SELECT =
  "id, journey_id, position, delay_hours, subject, body, body_format, human_touchpoint, intent, cta_kind, cta_label, cta_link, opt_out_text, created_at, updated_at"

const ENROLLMENT_SELECT =
  "id, journey_id, member_id, status, enrolled_at, started_at, paused_at, pause_until, completed_at, next_milestone_position, reply_count, booking_count, created_at, updated_at"

const JOURNEY_SELECT =
  "id, name, kind, entry_point, frequency, enrollment_mode, status, start_at, end_at, allow_milestone_override, pause_after_hours, created_by, created_at, updated_at"

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function replaceTokens(
  value: string,
  tokens: { firstName: string; journeyName: string },
  escapeValues: boolean
) {
  const firstName = escapeValues
    ? escapeHtml(tokens.firstName)
    : tokens.firstName
  const journeyName = escapeValues
    ? escapeHtml(tokens.journeyName)
    : tokens.journeyName

  return value
    .replaceAll("{{first_name}}", firstName)
    .replaceAll("{{journey_name}}", journeyName)
}

export function renderJourneyBody({
  body,
  firstName,
  journeyName,
}: {
  body: string
  bodyFormat: MessageBodyFormat
  firstName: string
  journeyName: string
}) {
  const personalized = replaceTokens(body, { firstName, journeyName }, false)

  return escapeHtml(personalized).replaceAll("\n", "<br />")
}

function plainConversationBody({
  body,
  bodyFormat,
  firstName,
  journeyName,
}: {
  body: string
  bodyFormat: MessageBodyFormat
  firstName: string
  journeyName: string
}) {
  return replaceTokens(
    body,
    { firstName, journeyName },
    bodyFormat === "sanitized_html"
  )
}

function firstName(member: MemberIdentity) {
  return member.full_name?.trim().split(/\s+/)[0] || "love"
}

function absoluteHref(href: string) {
  if (href.startsWith("https://")) return href
  return new URL(href, `${getSiteUrl()}/`).toString()
}

function emailShell({
  bodyHtml,
  ctaHref,
  ctaLabel,
  optOutText,
}: {
  bodyHtml: string
  ctaHref: string | null
  ctaLabel: string | null
  optOutText: string
}) {
  const preferencesUrl = new URL(
    "/account/preferences/communication",
    `${getSiteUrl()}/`
  ).toString()
  const cta =
    ctaHref && ctaLabel
      ? `<p style="margin:28px 0"><a href="${escapeHtml(
          absoluteHref(ctaHref)
        )}" style="display:inline-block;border-radius:999px;background:#5a4a3f;color:#faf7f2;padding:12px 22px;text-decoration:none">${escapeHtml(
          ctaLabel
        )}</a></p>`
      : ""

  return `<div style="margin:0 auto;max-width:640px;background:#faf7f2;color:#2b2724;font-family:Arial,sans-serif;font-size:16px;line-height:1.7;padding:32px"><div>${bodyHtml}</div>${cta}<hr style="margin:32px 0;border:0;border-top:1px solid #e8dfd3"><p style="color:#8b7e6d;font-size:12px">${escapeHtml(
    optOutText
  )} <a href="${escapeHtml(
    preferencesUrl
  )}" style="color:#5a4a3f">Adjust frequency</a>.</p></div>`
}

function defaultSender(): JourneyMessageSender | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null

  return async (email) => {
    const response = await fetch("https://api.resend.com/emails", {
      body: JSON.stringify({
        from:
          process.env.CONTACT_FROM_EMAIL ?? "HWL by SMD <hello@howlbysmd.com>",
        html: email.bodyHtml,
        reply_to: email.replyTo,
        subject: email.subject,
        to: [email.to],
      }),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": email.idempotencyKey,
      },
      method: "POST",
    })

    if (!response.ok) {
      throw new Error(`Journey delivery provider returned ${response.status}.`)
    }

    const data = (await response.json()) as { id?: unknown }
    return {
      providerMessageId:
        typeof data.id === "string" && data.id ? data.id : null,
    }
  }
}

async function advanceJourneyClock(
  supabase: SupabaseClient,
  now: Date
): Promise<{
  activatedEnrollments: number
  activatedJourneys: number
  completedJourneys: number
}> {
  const nowIso = now.toISOString()
  const { data: startingJourneys } = await supabase
    .from("journeys")
    .select("id")
    .eq("status", "scheduled")
    .lte("start_at", nowIso)

  const startingIds = (startingJourneys ?? []).map((journey) =>
    String(journey.id)
  )
  let activatedJourneys = 0
  if (startingIds.length) {
    const { data } = await supabase
      .from("journeys")
      .update({ status: "active" })
      .in("id", startingIds)
      .eq("status", "scheduled")
      .select("id")
    activatedJourneys = data?.length ?? 0
  }

  const { data: endingJourneys } = await supabase
    .from("journeys")
    .select("id")
    .eq("status", "active")
    .not("end_at", "is", null)
    .lte("end_at", nowIso)
  const endingIds = (endingJourneys ?? []).map((journey) => String(journey.id))
  let completedJourneys = 0
  if (endingIds.length) {
    const { data } = await supabase
      .from("journeys")
      .update({ status: "completed" })
      .in("id", endingIds)
      .eq("status", "active")
      .select("id")
    completedJourneys = data?.length ?? 0

    await supabase
      .from("journey_enrollments")
      .update({ completed_at: nowIso, status: "completed" })
      .in("journey_id", endingIds)
      .in("status", ["active", "paused", "pending"])
  }

  const { data: activeJourneys } = await supabase
    .from("journeys")
    .select("id")
    .eq("status", "active")
    .lte("start_at", nowIso)
    .or(`end_at.is.null,end_at.gt.${nowIso}`)
  const activeIds = (activeJourneys ?? []).map((journey) => String(journey.id))
  if (!activeIds.length) {
    return { activatedEnrollments: 0, activatedJourneys, completedJourneys }
  }

  const { data: pendingEnrollments } = await supabase
    .from("journey_enrollments")
    .select("id")
    .in("journey_id", activeIds)
    .eq("status", "pending")

  let activatedEnrollments = 0
  for (const enrollment of pendingEnrollments ?? []) {
    // Run one transition per transaction so one member's cooldown does not
    // prevent eligible members from beginning their journeys.
    const { data } = await supabase
      .from("journey_enrollments")
      .update({ started_at: nowIso, status: "active" })
      .eq("id", enrollment.id)
      .eq("status", "pending")
      .select("id")
    activatedEnrollments += data?.length ?? 0
  }

  return { activatedEnrollments, activatedJourneys, completedJourneys }
}

async function loadDeliveryContext(
  supabase: SupabaseClient,
  delivery: JourneyDeliveryRecord
): Promise<DeliveryContext> {
  const [{ data: milestone }, { data: enrollment }] = await Promise.all([
    supabase
      .from("journey_milestones")
      .select(MILESTONE_SELECT)
      .eq("id", delivery.milestone_id)
      .single(),
    supabase
      .from("journey_enrollments")
      .select(ENROLLMENT_SELECT)
      .eq("id", delivery.enrollment_id)
      .single(),
  ])
  if (!milestone || !enrollment) throw new Error("Delivery context is missing.")

  const typedMilestone = milestone as JourneyMilestoneRecord
  const typedEnrollment = enrollment as JourneyEnrollmentRecord
  const [
    { data: journey },
    { data: member },
    { data: preferences },
    { data: authIdentity },
    { data: membership },
  ] = await Promise.all([
    supabase
      .from("journeys")
      .select(JOURNEY_SELECT)
      .eq("id", typedEnrollment.journey_id)
      .single(),
    supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("id", typedEnrollment.member_id)
      .single(),
    supabase
      .from("connection_preferences")
      .select("guidance_cadence, booking_invites, share_progress")
      .eq("user_id", typedEnrollment.member_id)
      .maybeSingle(),
    supabase.auth.admin.getUserById(typedEnrollment.member_id),
    supabase
      .from("memberships")
      .select("current_period_end, status")
      .eq("user_id", typedEnrollment.member_id)
      .in("status", ["active", "trialing"])
      .order("current_period_end", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const membershipEnd = membership?.current_period_end
    ? new Date(membership.current_period_end).getTime()
    : Number.NaN
  if (!Number.isFinite(membershipEnd) || membershipEnd <= Date.now()) {
    throw new InactiveMembershipError()
  }

  if (
    !journey ||
    !member ||
    !authIdentity.user?.email ||
    typedMilestone.journey_id !== journey.id
  ) {
    throw new Error("Journey delivery relationships are inconsistent.")
  }

  return {
    delivery,
    enrollment: typedEnrollment,
    journey: journey as JourneyRecord,
    member: {
      email: authIdentity.user.email,
      full_name: member.full_name ? String(member.full_name) : null,
      id: String(member.id),
    },
    milestone: typedMilestone,
    preferences: preferences
      ? {
          guidance_cadence: preferences.guidance_cadence,
          booking_invites: Boolean(preferences.booking_invites),
          share_progress: Boolean(preferences.share_progress),
        }
      : DEFAULT_CONNECTION_PREFERENCES,
  }
}

async function ensureRelationship(
  supabase: SupabaseClient,
  memberId: string,
  practitionerId: string
) {
  const { data: existing } = await supabase
    .from("relationships")
    .select(
      "id, member_id, practitioner_id, status, created_at, last_interaction, intimacy_score"
    )
    .eq("member_id", memberId)
    .eq("practitioner_id", practitionerId)
    .maybeSingle()
  if (existing) return existing as RelationshipRecord

  const { data, error } = await supabase
    .from("relationships")
    .insert({ member_id: memberId, practitioner_id: practitionerId })
    .select(
      "id, member_id, practitioner_id, status, created_at, last_interaction, intimacy_score"
    )
    .single()
  if (data) return data as RelationshipRecord

  // A concurrent worker may have created the unique pair first.
  if (error?.code === "23505") {
    const { data: raced } = await supabase
      .from("relationships")
      .select(
        "id, member_id, practitioner_id, status, created_at, last_interaction, intimacy_score"
      )
      .eq("member_id", memberId)
      .eq("practitioner_id", practitionerId)
      .single()
    if (raced) return raced as RelationshipRecord
  }

  throw new Error("Relationship could not be prepared.")
}

async function ensureJourneyConversation(
  supabase: SupabaseClient,
  context: DeliveryContext
) {
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("journey_enrollment_id", context.enrollment.id)
    .maybeSingle()
  if (existing?.id) return String(existing.id)

  const relationship = await ensureRelationship(
    supabase,
    context.member.id,
    context.journey.created_by
  )
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      journey_enrollment_id: context.enrollment.id,
      relationship_id: relationship.id,
      subject: context.journey.name,
      type: "journey",
    })
    .select("id")
    .single()
  if (data?.id) return String(data.id)

  if (error?.code === "23505") {
    const { data: raced } = await supabase
      .from("conversations")
      .select("id")
      .eq("journey_enrollment_id", context.enrollment.id)
      .single()
    if (raced?.id) return String(raced.id)
  }

  throw new Error("Journey conversation could not be prepared.")
}

async function ensureConversationMessage(
  supabase: SupabaseClient,
  context: DeliveryContext,
  conversationId: string,
  renderedBody: string,
  cta: { href: string | null; label: string | null }
) {
  if (context.delivery.conversation_message_id) {
    return context.delivery.conversation_message_id
  }

  const { data, error } = await supabase
    .from("conversation_messages")
    .insert({
      body: renderedBody,
      body_format: context.milestone.body_format,
      conversation_id: conversationId,
      cta_label: cta.label,
      cta_link: cta.href,
      sender_id: context.journey.created_by,
    })
    .select("id")
    .single()
  if (error || !data?.id) throw new Error("Journey message could not be saved.")

  const messageId = String(data.id)
  const { error: linkError } = await supabase
    .from("journey_deliveries")
    .update({ conversation_message_id: messageId })
    .eq("id", context.delivery.id)
  if (linkError) throw new Error("Journey message could not be linked.")

  return messageId
}

async function deliverOne(
  supabase: SupabaseClient,
  delivery: JourneyDeliveryRecord,
  sender: JourneyMessageSender
) {
  const context = await loadDeliveryContext(supabase, delivery)
  if (!context.member.email) throw new Error("Member email is unavailable.")

  const memberFirstName = firstName(context.member)
  const allowBookingCta =
    context.milestone.cta_kind !== "booking" ||
    context.preferences.booking_invites
  const cta = {
    href: allowBookingCta ? context.milestone.cta_link : null,
    label: allowBookingCta ? context.milestone.cta_label : null,
  }
  const conversationBody = plainConversationBody({
    body: context.milestone.body,
    bodyFormat: context.milestone.body_format,
    firstName: memberFirstName,
    journeyName: context.journey.name,
  })
  const emailBody = renderJourneyBody({
    body: context.milestone.body,
    bodyFormat: context.milestone.body_format,
    firstName: memberFirstName,
    journeyName: context.journey.name,
  })
  const conversationId = await ensureJourneyConversation(supabase, context)
  const conversationMessageId = await ensureConversationMessage(
    supabase,
    context,
    conversationId,
    conversationBody,
    cta
  )
  const subject = replaceTokens(
    context.milestone.subject,
    { firstName: memberFirstName, journeyName: context.journey.name },
    false
  )
  const providerResult = await sender({
    bodyHtml: emailShell({
      bodyHtml: emailBody,
      ctaHref: cta.href,
      ctaLabel: cta.label,
      optOutText: context.milestone.opt_out_text,
    }),
    idempotencyKey: `journey-delivery-${delivery.id}`,
    replyTo: process.env.CONTACT_TO_EMAIL,
    subject,
    to: context.member.email,
  })

  const { error } = await supabase
    .from("journey_deliveries")
    .update({
      conversation_message_id: conversationMessageId,
      error_message: null,
      provider_message_id: providerResult.providerMessageId,
      sent_at: new Date().toISOString(),
      status: "sent",
    })
    .eq("id", delivery.id)
    .eq("status", "processing")
  if (error) throw new Error("Journey delivery could not be finalized.")
}

function safeErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Delivery failed."
  return message.slice(0, 1000)
}

async function failDelivery(
  supabase: SupabaseClient,
  deliveryId: string,
  error: unknown
) {
  await supabase
    .from("journey_deliveries")
    .update({ error_message: safeErrorMessage(error), status: "failed" })
    .eq("id", deliveryId)
    .eq("status", "processing")
}

async function cancelDelivery(
  supabase: SupabaseClient,
  deliveryId: string,
  reason: string
) {
  await supabase
    .from("journey_deliveries")
    .update({ error_message: reason.slice(0, 1000), status: "cancelled" })
    .eq("id", deliveryId)
    .eq("status", "processing")
}

export async function runJourneyScheduler({
  batchSize = 50,
  now = new Date(),
  sender = defaultSender(),
}: {
  batchSize?: number
  now?: Date
  sender?: JourneyMessageSender | null
} = {}): Promise<JourneySchedulerResult> {
  const supabase = createAdminClient()
  const empty = {
    activatedEnrollments: 0,
    activatedJourneys: 0,
    claimed: 0,
    completedJourneys: 0,
    configured: false,
    failed: 0,
    sent: 0,
  }
  if (!supabase || !sender) return empty

  const clock = await advanceJourneyClock(supabase, now)
  const { data, error } = await supabase.rpc("claim_due_journey_deliveries", {
    p_batch_size: Math.min(Math.max(batchSize, 1), 100),
  })
  if (error) return { ...empty, ...clock, configured: true, failed: 1 }

  const deliveries = (data ?? []) as JourneyDeliveryRecord[]
  let sent = 0
  let failed = 0
  for (const delivery of deliveries) {
    try {
      await deliverOne(supabase, delivery, sender)
      sent += 1
    } catch (deliveryError) {
      if (deliveryError instanceof InactiveMembershipError) {
        await cancelDelivery(supabase, delivery.id, deliveryError.message)
      } else {
        await failDelivery(supabase, delivery.id, deliveryError)
      }
      failed += 1
    }
  }

  return {
    ...clock,
    claimed: deliveries.length,
    configured: true,
    failed,
    sent,
  }
}

/** Manual test hook. It can advance a due or future delivery, but never resend. */
export async function sendJourneyDeliveryNow(
  deliveryId: string,
  sender: JourneyMessageSender | null = defaultSender()
) {
  const supabase = createAdminClient()
  if (!supabase || !sender) return { configured: false, sent: false }

  const { data, error } = await supabase
    .from("journey_deliveries")
    .update({
      attempts: 1,
      last_attempt_at: new Date().toISOString(),
      status: "processing",
    })
    .eq("id", deliveryId)
    .in("status", ["pending", "failed"])
    .select(DELIVERY_SELECT)
    .maybeSingle()
  if (error || !data) return { configured: true, sent: false }

  const delivery = data as JourneyDeliveryRecord
  try {
    await deliverOne(supabase, delivery, sender)
    return { configured: true, sent: true }
  } catch (deliveryError) {
    if (deliveryError instanceof InactiveMembershipError) {
      await cancelDelivery(supabase, delivery.id, deliveryError.message)
    } else {
      await failDelivery(supabase, delivery.id, deliveryError)
    }
    return { configured: true, sent: false }
  }
}
