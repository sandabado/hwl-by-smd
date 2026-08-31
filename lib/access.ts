import "server-only"

import { redirect } from "next/navigation"

import { createAdminClient, createClient } from "@/lib/supabase/server"
import {
  getCommerceDeploymentTarget,
  getExpectedStripeAccountId,
  getExpectedStripeLivemode,
} from "@/lib/stripe"

export type AccessRequirement =
  "authenticated" | "any_purchase" | "membership_only" | "lift_guide_only"

export type MemberAccess = {
  canDownloadLift: boolean
  canAccessLift: boolean
  hasAnyPurchase: boolean
  isMember: boolean
  membership: {
    cancel_at_period_end: boolean
    current_period_end: string | null
    status: string
  } | null
  purchases: Array<{
    amount_paid: number
    product_type: string
    purchased_at: string
    status: string
  }>
}

export async function getAuthenticatedUser() {
  const supabase = await createClient()
  if (!supabase) return null

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export async function getMemberAccess(userId: string): Promise<MemberAccess> {
  // Every caller first authenticates the current user and passes that exact ID.
  // Keep financial rows behind the server boundary so a browser session cannot
  // enumerate its development and Preview records from the shared staging DB.
  const supabase = createAdminClient()
  const deploymentTarget = getCommerceDeploymentTarget()
  const stripeAccountId = getExpectedStripeAccountId()
  const stripeLivemode = getExpectedStripeLivemode()
  if (
    !supabase ||
    !deploymentTarget ||
    !stripeAccountId ||
    stripeLivemode === null
  ) {
    return {
      canDownloadLift: false,
      canAccessLift: false,
      hasAnyPurchase: false,
      isMember: false,
      membership: null,
      purchases: [],
    }
  }

  const [{ data: purchases }, { data: memberships }] = await Promise.all([
    supabase
      .from("purchases")
      .select("amount_paid, product_type, purchased_at, status")
      .eq("user_id", userId)
      .eq("deployment_target", deploymentTarget)
      .eq("stripe_account_id", stripeAccountId)
      .eq("stripe_livemode", stripeLivemode)
      .eq("status", "active")
      .order("purchased_at", { ascending: false }),
    supabase
      .from("memberships")
      .select("cancel_at_period_end, current_period_end, status")
      .eq("user_id", userId)
      .eq("deployment_target", deploymentTarget)
      .eq("stripe_account_id", stripeAccountId)
      .eq("stripe_livemode", stripeLivemode)
      .in("status", ["active", "trialing"])
      .order("current_period_end", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const purchaseList = purchases ?? []
  const membershipRecord = memberships ?? null
  const membershipEndsAt = membershipRecord?.current_period_end
    ? new Date(membershipRecord.current_period_end).getTime()
    : Number.NaN
  const isMember =
    Number.isFinite(membershipEndsAt) && membershipEndsAt > Date.now()
  const membership = isMember ? membershipRecord : null
  const canAccessLift =
    isMember ||
    purchaseList.some((purchase) => purchase.product_type === "lift_guide")
  const canDownloadLift =
    canAccessLift ||
    purchaseList.some((purchase) => purchase.product_type === "pdf_download")

  return {
    canDownloadLift,
    canAccessLift,
    hasAnyPurchase:
      isMember ||
      purchaseList.some((purchase) => purchase.product_type !== "membership"),
    isMember,
    membership,
    purchases: purchaseList,
  }
}

export async function requireAccess(
  requirement: AccessRequirement,
  returnTo: string
) {
  const user = await getAuthenticatedUser()
  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(returnTo)}`)
  }

  if (requirement === "authenticated") {
    return {
      access: await getMemberAccess(user.id),
      user,
    }
  }

  const access = await getMemberAccess(user.id)
  const allowed =
    requirement === "any_purchase"
      ? access.hasAnyPurchase
      : requirement === "membership_only"
        ? access.isMember
        : access.canAccessLift

  if (!allowed) {
    const destination =
      requirement === "lift_guide_only" ? "/beauty/lift" : "/store"
    redirect(`${destination}?access=${requirement}`)
  }

  return { access, user }
}
