import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/access"
import { getSiteUrl } from "@/lib/env"
import { createAdminClient } from "@/lib/supabase/server"
import {
  getExpectedStripeAccountId,
  getExpectedStripeLivemode,
  getCommerceDeploymentTarget,
  getStripe,
  isExpectedStripeAccount,
  isStripeModeConfigured,
} from "@/lib/stripe"
import { isSameOriginMutation } from "@/lib/relationships/request"

export async function POST(request: Request) {
  if (!isSameOriginMutation(request, { requireOrigin: true })) {
    return NextResponse.json({ error: "Request not allowed." }, { status: 403 })
  }
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 })
  }

  const stripe = getStripe()
  const deploymentTarget = getCommerceDeploymentTarget()
  const stripeAccountId = getExpectedStripeAccountId()
  const stripeLivemode = getExpectedStripeLivemode()
  const supabase = createAdminClient()
  if (
    !stripe ||
    !deploymentTarget ||
    !stripeAccountId ||
    stripeLivemode === null ||
    !isStripeModeConfigured() ||
    !supabase
  ) {
    return NextResponse.json(
      { error: "Billing is not configured yet." },
      { status: 503 }
    )
  }

  try {
    if (!(await isExpectedStripeAccount(stripe))) {
      return NextResponse.json(
        { error: "Billing is connected to the wrong Stripe account." },
        { status: 503 }
      )
    }
  } catch {
    return NextResponse.json(
      { error: "The Stripe account could not be verified." },
      { status: 503 }
    )
  }

  const { data: stripeCustomer } = await supabase
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .eq("deployment_target", deploymentTarget)
    .eq("stripe_account_id", stripeAccountId)
    .eq("stripe_livemode", stripeLivemode)
    .maybeSingle()
  if (!stripeCustomer?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No billing profile was found." },
      { status: 404 }
    )
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomer.stripe_customer_id,
    return_url: `${getSiteUrl(request.url)}/account`,
  })

  return NextResponse.json({ url: session.url })
}
