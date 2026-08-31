import "server-only"

import { requireAdmin } from "@/lib/admin-auth"
import {
  getCommerceDeploymentTarget,
  getExpectedStripeAccountId,
  getExpectedStripeLivemode,
} from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/server"

export type AdminReconciliationJob = {
  order_id: string
  state:
    | "pending"
    | "leased"
    | "retry_wait"
    | "monitoring"
    | "complete"
    | "manual_review"
  claim_count: number
  consecutive_failure_count: number
  next_attempt_at: string | null
  last_attempt_at: string | null
  last_provider_checked_at: string | null
  last_outcome: string | null
  last_error_code: string | null
  alert_pending: boolean
  alert_required_at: string | null
  manual_review_reason: string | null
  updated_at: string
}

export type AdminReconciliationStatus =
  | { status: "local_preview" }
  | { status: "not_configured" }
  | { status: "unavailable" }
  | { status: "ready"; jobs: AdminReconciliationJob[] }

/**
 * Reads only the sanitized operations DTO exposed by migration 014. The RPC
 * returns queue state and machine error categories, never customer details or
 * Stripe object identifiers. A demo administrator cannot read hosted records.
 */
export async function getAdminReconciliationStatus(): Promise<AdminReconciliationStatus> {
  const access = await requireAdmin()
  if (access.source !== "supabase") return { status: "local_preview" }

  const admin = createAdminClient()
  const deploymentTarget = getCommerceDeploymentTarget()
  const stripeAccountId = getExpectedStripeAccountId()
  const stripeLivemode = getExpectedStripeLivemode()

  if (
    !admin ||
    !deploymentTarget ||
    !stripeAccountId ||
    stripeLivemode === null
  ) {
    return { status: "not_configured" }
  }

  const { data, error } = await admin.rpc(
    "get_checkout_reconciliation_status",
    {
      p_deployment_target: deploymentTarget,
      p_limit: 50,
      p_stripe_account_id: stripeAccountId,
      p_stripe_livemode: stripeLivemode,
    }
  )

  if (error) {
    console.error("[admin/commerce] Reconciliation status query failed.", {
      code: error.code,
    })
    return { status: "unavailable" }
  }

  return {
    jobs: (data ?? []) as AdminReconciliationJob[],
    status: "ready",
  }
}
