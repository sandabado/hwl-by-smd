import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/access"
import {
  CHECKOUT_RECONCILIATION_MAXIMUM_BYTES,
  getCheckoutReconciliationAvailability,
  parseCheckoutReconciliationBody,
} from "@/lib/commerce/checkout-reconciliation-policy"
import { fulfillCompletedCheckout } from "@/lib/commerce/stripe-fulfillment"
import {
  hasJsonContentType,
  isSameOriginMutation,
  readLimitedJson,
} from "@/lib/relationships/request"
import {
  getCommerceDeploymentTarget,
  getExpectedStripeAccountId,
  getExpectedStripeLivemode,
  getPriceId,
  getProductId,
  getStripe,
  isExpectedStripeAccount,
  isStripeModeConfigured,
  LAUNCH_PRODUCT_ID,
  PRODUCTS,
} from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/server"

type ReconciliationOrder = {
  id: string
  last_reconciliation_attempt_at: string | null
  reconciliation_attempt_count: number
  status: string
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request, { requireOrigin: true })) {
    return NextResponse.json({ error: "Request not allowed." }, { status: 403 })
  }
  if (!hasJsonContentType(request)) {
    return NextResponse.json(
      { error: "A valid JSON request is required." },
      { status: 400 }
    )
  }

  const parsedJson = await readLimitedJson<unknown>(
    request,
    CHECKOUT_RECONCILIATION_MAXIMUM_BYTES
  )
  if (!parsedJson.ok) {
    return NextResponse.json(
      {
        error:
          parsedJson.reason === "too_large"
            ? "The reconciliation request is too large."
            : "A valid JSON request is required.",
      },
      { status: parsedJson.reason === "too_large" ? 413 : 400 }
    )
  }
  const body = parseCheckoutReconciliationBody(parsedJson.value)
  if (!body.ok) {
    return NextResponse.json(
      { error: "A valid checkout Session is required." },
      { status: 400 }
    )
  }

  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 })
  }

  const deploymentTarget = getCommerceDeploymentTarget()
  const stripeAccountId = getExpectedStripeAccountId()
  const stripeLivemode = getExpectedStripeLivemode()
  const stripe = getStripe()
  const priceId = getPriceId(LAUNCH_PRODUCT_ID)
  const stripeProductId = getProductId(LAUNCH_PRODUCT_ID)
  const catalogVersion = PRODUCTS[LAUNCH_PRODUCT_ID].catalogVersion
  const supabase = createAdminClient()
  if (
    !deploymentTarget ||
    !stripeAccountId ||
    stripeLivemode === null ||
    !stripe ||
    !priceId ||
    !stripeProductId ||
    !catalogVersion ||
    !isStripeModeConfigured() ||
    !supabase
  ) {
    return NextResponse.json(
      { error: "Payment verification is not configured." },
      { status: 503 }
    )
  }

  // Bind the opaque Session ID to an order already created for this exact user
  // and commerce namespace before making any provider request.
  const { data: order, error: orderError } = await supabase
    .from("checkout_orders")
    .select(
      "id, last_reconciliation_attempt_at, reconciliation_attempt_count, status"
    )
    .eq("stripe_checkout_session_id", body.sessionId)
    .eq("user_id", user.id)
    .eq("product_type", LAUNCH_PRODUCT_ID)
    .eq("catalog_version", catalogVersion)
    .eq("deployment_target", deploymentTarget)
    .eq("stripe_account_id", stripeAccountId)
    .eq("stripe_livemode", stripeLivemode)
    .eq("stripe_price_id", priceId)
    .eq("stripe_product_id", stripeProductId)
    .in("status", ["creating", "open", "paid", "refunded", "disputed"])
    .maybeSingle<ReconciliationOrder>()
  if (orderError) {
    return NextResponse.json(
      { error: "Payment verification state is unavailable." },
      { status: 503 }
    )
  }
  if (!order) {
    return NextResponse.json(
      { error: "This checkout could not be verified." },
      { status: 404 }
    )
  }

  if (order.status === "disputed" || order.status === "refunded") {
    return NextResponse.json({ state: "terminal" })
  }

  const now = Date.now()
  const availability = getCheckoutReconciliationAvailability({
    attemptCount: order.reconciliation_attempt_count,
    lastAttemptAt: order.last_reconciliation_attempt_at,
    now,
  })
  if (!availability.available) {
    return NextResponse.json(
      {
        error:
          availability.reason === "cooldown"
            ? "Payment verification was already requested."
            : "Automatic payment verification is unavailable.",
      },
      { status: availability.reason === "invalid" ? 503 : 429 }
    )
  }

  // Compare-and-swap on the attempt count admits only one concurrent request.
  const attemptedAt = new Date(now).toISOString()
  const { data: claimedOrder, error: claimError } = await supabase
    .from("checkout_orders")
    .update({
      last_reconciliation_attempt_at: attemptedAt,
      reconciliation_attempt_count: order.reconciliation_attempt_count + 1,
    })
    .eq("id", order.id)
    .eq("user_id", user.id)
    .eq("stripe_checkout_session_id", body.sessionId)
    .eq("product_type", LAUNCH_PRODUCT_ID)
    .eq("catalog_version", catalogVersion)
    .eq("deployment_target", deploymentTarget)
    .eq("stripe_account_id", stripeAccountId)
    .eq("stripe_livemode", stripeLivemode)
    .eq("stripe_price_id", priceId)
    .eq("stripe_product_id", stripeProductId)
    .eq("reconciliation_attempt_count", order.reconciliation_attempt_count)
    .in("status", ["creating", "open", "paid"])
    .select("id")
    .maybeSingle()
  if (claimError) {
    return NextResponse.json(
      { error: "Payment verification could not be reserved." },
      { status: 503 }
    )
  }
  if (!claimedOrder) {
    return NextResponse.json(
      { error: "Payment verification was already requested." },
      { status: 429 }
    )
  }

  try {
    if (!(await isExpectedStripeAccount(stripe))) {
      return NextResponse.json(
        { error: "Payment verification is connected to the wrong account." },
        { status: 503 }
      )
    }
  } catch {
    return NextResponse.json(
      { error: "The payment account could not be verified." },
      { status: 503 }
    )
  }

  try {
    const result = await fulfillCompletedCheckout({
      deploymentTarget,
      expectation: {
        catalogVersion,
        deploymentTarget,
        orderId: order.id,
        priceId,
        productType: LAUNCH_PRODUCT_ID,
        stripeProductId,
        userId: user.id,
      },
      sessionId: body.sessionId,
      source: "authenticated_reconciliation",
      stripe,
      stripeAccountId,
      stripeLivemode,
      supabase,
    })

    if (result.state === "ignored") {
      throw new Error("Authenticated reconciliation rejected its namespace.")
    }

    return NextResponse.json({ state: result.state })
  } catch (error) {
    console.error("Authenticated checkout reconciliation failed", error)
    return NextResponse.json(
      {
        error:
          "Payment could not be safely reconciled. No access was granted from this request.",
      },
      { status: 503 }
    )
  }
}
