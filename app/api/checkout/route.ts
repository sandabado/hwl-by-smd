import { NextResponse } from "next/server"

import { getSiteUrl } from "@/lib/env"
import { getAuthenticatedUser } from "@/lib/access"
import { createAdminClient } from "@/lib/supabase/server"
import {
  hasJsonContentType,
  isSameOriginMutation,
  readLimitedJson,
} from "@/lib/relationships/request"
import {
  getPriceId,
  getStripe,
  isExpectedStripePrice,
  isProductCheckoutReady,
  isProductId,
  PRODUCTS,
  type ProductId,
} from "@/lib/stripe"

const CHECKOUT_RETURN_PATHS = new Set(["/beauty/lift", "/lift", "/store"])

function getOwnedProductDestination(productId: ProductId) {
  if (productId === "pdf_download") return "/api/download/lift"
  if (productId === "lift_guide") {
    return "/course/lift-daily-facial-ritual"
  }
  return "/the-den"
}

function getRequiredStoragePaths(productId: ProductId) {
  if (productId === "pdf_download") {
    return [process.env.LIFT_PDF_STORAGE_PATH]
  }
  if (productId === "lift_guide") {
    return [
      process.env.LIFT_PDF_STORAGE_PATH,
      process.env.LIFT_VIDEO_STORAGE_PATH,
    ]
  }
  return []
}

function getCheckoutReturnPath(request: Request) {
  const fallback = "/store"
  const referrer = request.headers.get("referer")
  if (!referrer) return fallback

  try {
    const requestUrl = new URL(request.url)
    const referrerUrl = new URL(referrer)

    return requestUrl.origin === referrerUrl.origin &&
      CHECKOUT_RETURN_PATHS.has(referrerUrl.pathname)
      ? referrerUrl.pathname
      : fallback
  } catch {
    return fallback
  }
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: "Request not allowed." }, { status: 403 })
  }
  if (!hasJsonContentType(request)) {
    return NextResponse.json(
      { error: "A valid JSON request is required." },
      { status: 400 }
    )
  }
  const parsedBody = await readLimitedJson<{
    productId?: unknown
  }>(request, 2_000)
  if (!parsedBody.ok) {
    return NextResponse.json(
      {
        error:
          parsedBody.reason === "too_large"
            ? "The checkout request is too large."
            : "A valid JSON request is required.",
      },
      { status: parsedBody.reason === "too_large" ? 413 : 400 }
    )
  }
  if (!isProductId(parsedBody.value.productId)) {
    return NextResponse.json({ error: "Unknown offering." }, { status: 400 })
  }
  const body = { productId: parsedBody.value.productId }

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
  const returnPath = getCheckoutReturnPath(request)
  if (!user?.email) {
    return NextResponse.json(
      { loginUrl: `/login?redirectTo=${encodeURIComponent(returnPath)}` },
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

  const supabase = createAdminClient()
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Secure fulfillment is not connected yet. Checkout remains closed.",
      },
      { status: 503 }
    )
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle()
  if (profileError || !profile) {
    return NextResponse.json(
      {
        error:
          "Your secure account record is still being prepared. Checkout remains closed.",
      },
      { status: 503 }
    )
  }

  const { data: existingPurchase, error: purchaseLookupError } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_type", body.productId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle()
  if (purchaseLookupError) {
    return NextResponse.json(
      {
        error:
          "Your existing access could not be verified. Checkout remains closed.",
      },
      { status: 503 }
    )
  }
  if (existingPurchase) {
    return NextResponse.json({
      url: getOwnedProductDestination(body.productId),
    })
  }

  const storagePaths = getRequiredStoragePaths(body.productId)
  if (
    !storagePaths.length ||
    storagePaths.some((storagePath) => !storagePath)
  ) {
    return NextResponse.json(
      {
        error:
          "The private files for this offering have not passed their delivery check. Checkout remains closed.",
      },
      { status: 503 }
    )
  }
  const signedAssets = await Promise.all(
    storagePaths.map((storagePath) =>
      supabase.storage.from("member-content").createSignedUrl(storagePath!, 60)
    )
  )
  if (signedAssets.some(({ data, error }) => error || !data?.signedUrl)) {
    return NextResponse.json(
      {
        error:
          "The private files for this offering have not passed their delivery check. Checkout remains closed.",
      },
      { status: 503 }
    )
  }
  const siteUrl = getSiteUrl(request.url)
  const product = PRODUCTS[body.productId]
  const catalogVersion = product.catalogVersion
  if (!catalogVersion) {
    return NextResponse.json(
      { error: "This offering is not enabled for launch." },
      { status: 503 }
    )
  }

  let configuredPriceId: string
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
    configuredPriceId = configuredPrice.id
  } catch {
    return NextResponse.json(
      {
        error:
          "This offering's secure price could not be verified. Checkout remains closed.",
      },
      { status: 503 }
    )
  }

  const metadata = {
    catalog_version: catalogVersion,
    price_id: configuredPriceId,
    product_type: body.productId,
    user_id: user.id,
  }

  const session = await stripe.checkout.sessions.create(
    {
      allow_promotion_codes: false,
      billing_address_collection: "auto",
      cancel_url: `${siteUrl}/beauty/lift?checkout=cancelled`,
      client_reference_id: user.id,
      customer: profile.stripe_customer_id ?? undefined,
      customer_email: profile.stripe_customer_id ? undefined : user.email,
      line_items: [{ price: configuredPriceId, quantity: 1 }],
      metadata,
      mode: product.mode,
      payment_method_types: ["card"],
      payment_intent_data:
        product.mode === "payment" ? { metadata } : undefined,
      subscription_data:
        product.mode === "subscription" ? { metadata } : undefined,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    },
    { idempotencyKey: `hwl:${catalogVersion}:${user.id}` }
  )

  return NextResponse.json({ url: session.url })
}
