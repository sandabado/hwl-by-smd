import { NextResponse } from "next/server"

import { getSiteUrl } from "@/lib/env"
import { getAuthenticatedUser } from "@/lib/access"
import { createClient } from "@/lib/supabase/server"
import {
  hasAcceptableBodySize,
  hasJsonContentType,
  isSameOriginMutation,
} from "@/lib/relationships/request"
import {
  getPriceId,
  getStripe,
  isExpectedStripePrice,
  isProductCheckoutReady,
  isProductId,
  PRODUCTS,
} from "@/lib/stripe"

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
  const body = (await request.json().catch(() => null)) as {
    productId?: unknown
  } | null
  if (!isProductId(body?.productId)) {
    return NextResponse.json({ error: "Unknown offering." }, { status: 400 })
  }

  if (!isProductCheckoutReady(body.productId)) {
    return NextResponse.json(
      {
        error:
          "This offering is still being prepared. Sales will open after its content and delivery are fully verified.",
      },
      { status: 503 }
    )
  }

  const user = await getAuthenticatedUser()
  if (!user?.email) {
    return NextResponse.json(
      { loginUrl: "/login?redirectTo=/store" },
      { status: 401 }
    )
  }

  const stripe = getStripe()
  const price = getPriceId(body.productId)
  if (!stripe || !price) {
    return NextResponse.json(
      {
        error:
          "Secure checkout is built and waiting for the Stripe product keys.",
      },
      { status: 503 }
    )
  }

  const supabase = await createClient()
  const { data: profile } =
    (await supabase
      ?.from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle()) ?? {}
  const siteUrl = getSiteUrl(request.url)
  const product = PRODUCTS[body.productId]
  const metadata = {
    product_type: body.productId,
    user_id: user.id,
  }

  try {
    const configuredPrice = await stripe.prices.retrieve(price)
    if (!isExpectedStripePrice(body.productId, configuredPrice)) {
      return NextResponse.json(
        {
          error:
            "This offering's secure price could not be verified. Checkout remains closed.",
        },
        { status: 503 }
      )
    }
  } catch {
    return NextResponse.json(
      {
        error:
          "This offering's secure price could not be verified. Checkout remains closed.",
      },
      { status: 503 }
    )
  }

  const session = await stripe.checkout.sessions.create({
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    cancel_url: `${siteUrl}/store?checkout=cancelled`,
    client_reference_id: user.id,
    customer: profile?.stripe_customer_id ?? undefined,
    customer_email: profile?.stripe_customer_id ? undefined : user.email,
    line_items: [{ price, quantity: 1 }],
    metadata,
    mode: product.mode,
    payment_method_types: ["card"],
    payment_intent_data: product.mode === "payment" ? { metadata } : undefined,
    subscription_data:
      product.mode === "subscription" ? { metadata } : undefined,
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  })

  return NextResponse.json({ url: session.url })
}
