import type Stripe from "stripe"
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
  COMMERCE_APPLICATION,
  getCommerceDeploymentTarget,
  getExpectedStripeAccountId,
  getPriceId,
  getExpectedStripeLivemode,
  getProductId,
  getStripe,
  isExpectedStripeAccount,
  isExpectedStripePrice,
  isLiftCheckoutCommerceMetadata,
  isProductCheckoutReady,
  isProductId,
  PRODUCTS,
  type DeploymentTarget,
  type ProductId,
} from "@/lib/stripe"

const CHECKOUT_RETURN_PATHS = new Set(["/beauty/lift", "/lift", "/store"])
const CHECKOUT_ATTEMPT_PATTERN = /^[a-zA-Z0-9-]{16,80}$/
const CHECKOUT_SESSION_SECONDS = 60 * 60

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>
type StripeClient = NonNullable<ReturnType<typeof getStripe>>

type CheckoutOrder = {
  catalog_version: string
  checkout_attempt_id: string
  customer_email: string
  deployment_target: DeploymentTarget
  expires_at: string
  id: string
  product_type: ProductId
  site_url: string
  status: "creating" | "open"
  stripe_account_id: string
  stripe_checkout_session_id: string | null
  stripe_customer_id: string | null
  stripe_livemode: boolean
  stripe_price_id: string
  stripe_product_id: string
  user_id: string
}

const CHECKOUT_ORDER_FIELDS =
  "catalog_version, checkout_attempt_id, customer_email, deployment_target, expires_at, id, product_type, site_url, status, stripe_account_id, stripe_checkout_session_id, stripe_customer_id, stripe_livemode, stripe_price_id, stripe_product_id, user_id"

async function findActiveCheckoutOrder(
  supabase: AdminClient,
  userId: string,
  productId: ProductId,
  deploymentTarget: DeploymentTarget,
  stripeAccountId: string,
  stripeLivemode: boolean
) {
  return supabase
    .from("checkout_orders")
    .select(CHECKOUT_ORDER_FIELDS)
    .eq("user_id", userId)
    .eq("product_type", productId)
    .eq("deployment_target", deploymentTarget)
    .eq("stripe_account_id", stripeAccountId)
    .eq("stripe_livemode", stripeLivemode)
    .in("status", ["creating", "open"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<CheckoutOrder>()
}

async function reserveCheckoutOrder(
  supabase: AdminClient,
  values: {
    attemptId: string
    catalogVersion: string
    customerEmail: string
    deploymentTarget: DeploymentTarget
    productId: ProductId
    siteUrl: string
    stripeAccountId: string
    stripeCustomerId: string | null
    stripeLivemode: boolean
    stripePriceId: string
    stripeProductId: string
    userId: string
  }
) {
  const expiresAt = new Date(
    Date.now() + CHECKOUT_SESSION_SECONDS * 1_000
  ).toISOString()

  return supabase
    .from("checkout_orders")
    .insert({
      catalog_version: values.catalogVersion,
      checkout_attempt_id: values.attemptId,
      customer_email: values.customerEmail,
      deployment_target: values.deploymentTarget,
      expires_at: expiresAt,
      id: crypto.randomUUID(),
      product_type: values.productId,
      site_url: values.siteUrl,
      status: "creating",
      stripe_account_id: values.stripeAccountId,
      stripe_customer_id: values.stripeCustomerId,
      stripe_livemode: values.stripeLivemode,
      stripe_price_id: values.stripePriceId,
      stripe_product_id: values.stripeProductId,
      user_id: values.userId,
    })
    .select(CHECKOUT_ORDER_FIELDS)
    .single<CheckoutOrder>()
}

function getPaymentIntentId(
  paymentIntent: string | Stripe.PaymentIntent | null
) {
  return typeof paymentIntent === "string"
    ? paymentIntent
    : (paymentIntent?.id ?? null)
}

function getCheckoutMetadata(order: CheckoutOrder) {
  return {
    application: COMMERCE_APPLICATION,
    catalog_version: order.catalog_version,
    checkout_attempt_id: order.checkout_attempt_id,
    checkout_order_id: order.id,
    deployment_target: order.deployment_target,
    price_id: order.stripe_price_id,
    product_type: order.product_type,
    stripe_account_id: order.stripe_account_id,
    stripe_mode: order.stripe_livemode ? "live" : "test",
    stripe_product_id: order.stripe_product_id,
    user_id: order.user_id,
  }
}

async function createOrRecoverStripeSession(
  stripe: StripeClient,
  order: CheckoutOrder
) {
  const product = PRODUCTS[order.product_type]
  const metadata = getCheckoutMetadata(order)
  const expiresAt = Math.floor(new Date(order.expires_at).getTime() / 1_000)

  const created = await stripe.checkout.sessions.create(
    {
      allow_promotion_codes: false,
      billing_address_collection: "auto",
      cancel_url: `${order.site_url}/beauty/lift?cart=open&checkout=cancelled`,
      client_reference_id: order.user_id,
      customer: order.stripe_customer_id ?? undefined,
      customer_creation: order.stripe_customer_id ? undefined : "always",
      customer_email: order.stripe_customer_id
        ? undefined
        : order.customer_email,
      expires_at: expiresAt,
      line_items: [{ price: order.stripe_price_id, quantity: 1 }],
      metadata,
      mode: product.mode,
      payment_intent_data:
        product.mode === "payment" ? { metadata } : undefined,
      // The launch webhook grants access synchronously. Restrict the first
      // release to immediate card confirmation rather than silently offering a
      // delayed method whose payment can settle after the return page.
      payment_method_types: ["card"],
      subscription_data:
        product.mode === "subscription" ? { metadata } : undefined,
      success_url: `${order.site_url}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    },
    {
      idempotencyKey: `hwl:checkout:${order.deployment_target}:${order.stripe_account_id}:${order.stripe_livemode ? "live" : "test"}:${order.id}`,
    }
  )

  // Idempotent replays can return the originally saved response. Retrieve the
  // Session again so its current open/complete/expired state is authoritative.
  return stripe.checkout.sessions.retrieve(created.id)
}

function sessionMatchesOrder(
  session: Stripe.Checkout.Session,
  order: CheckoutOrder
) {
  return (
    isLiftCheckoutCommerceMetadata(session.metadata) &&
    session.client_reference_id === order.user_id &&
    session.livemode === order.stripe_livemode &&
    session.metadata?.checkout_order_id === order.id &&
    session.metadata?.deployment_target === order.deployment_target &&
    session.metadata?.catalog_version === order.catalog_version &&
    session.metadata?.price_id === order.stripe_price_id &&
    session.metadata?.product_type === order.product_type &&
    session.metadata?.stripe_account_id === order.stripe_account_id &&
    session.metadata?.stripe_mode ===
      (order.stripe_livemode ? "live" : "test") &&
    session.metadata?.stripe_product_id === order.stripe_product_id &&
    session.metadata?.user_id === order.user_id
  )
}

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
  const fallback = "/beauty/lift"
  const referrer = request.headers.get("referer")
  if (!referrer) return `${fallback}?cart=open`

  try {
    const requestUrl = new URL(request.url)
    const referrerUrl = new URL(referrer)

    const returnPath =
      requestUrl.origin === referrerUrl.origin &&
      CHECKOUT_RETURN_PATHS.has(referrerUrl.pathname)
        ? referrerUrl.pathname
        : fallback
    return `${returnPath}?cart=open`
  } catch {
    return `${fallback}?cart=open`
  }
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
  const parsedBody = await readLimitedJson<{
    attemptId?: unknown
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
  if (
    typeof parsedBody.value !== "object" ||
    parsedBody.value === null ||
    Array.isArray(parsedBody.value)
  ) {
    return NextResponse.json(
      { error: "A valid JSON request is required." },
      { status: 400 }
    )
  }
  if (!isProductId(parsedBody.value.productId)) {
    return NextResponse.json({ error: "Unknown offering." }, { status: 400 })
  }
  if (
    typeof parsedBody.value.attemptId !== "string" ||
    !CHECKOUT_ATTEMPT_PATTERN.test(parsedBody.value.attemptId)
  ) {
    return NextResponse.json(
      { error: "A valid checkout attempt is required." },
      { status: 400 }
    )
  }
  const body = {
    attemptId: parsedBody.value.attemptId,
    productId: parsedBody.value.productId,
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
  const returnPath = getCheckoutReturnPath(request)
  if (!user?.email) {
    return NextResponse.json(
      { loginUrl: `/login?redirectTo=${encodeURIComponent(returnPath)}` },
      { status: 401 }
    )
  }

  const deploymentTarget = getCommerceDeploymentTarget()
  const stripeLivemode = getExpectedStripeLivemode()
  const stripeAccountId = getExpectedStripeAccountId()
  const stripe = getStripe()
  const price = getPriceId(body.productId)
  const stripeProductId = getProductId(body.productId)
  if (
    !deploymentTarget ||
    stripeLivemode === null ||
    !stripeAccountId ||
    !stripe ||
    !price ||
    !stripeProductId
  ) {
    return NextResponse.json(
      {
        error:
          "Secure checkout is built and waiting for the Stripe product keys.",
      },
      { status: 503 }
    )
  }

  try {
    if (!(await isExpectedStripeAccount(stripe))) {
      return NextResponse.json(
        {
          error:
            "The configured Stripe account does not match this site. Checkout remains closed.",
        },
        { status: 503 }
      )
    }
  } catch {
    return NextResponse.json(
      {
        error:
          "The configured Stripe account could not be verified. Checkout remains closed.",
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
    .select("id")
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

  const { data: stripeCustomer, error: stripeCustomerError } = await supabase
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .eq("deployment_target", deploymentTarget)
    .eq("stripe_account_id", stripeAccountId)
    .eq("stripe_livemode", stripeLivemode)
    .maybeSingle()
  if (stripeCustomerError) {
    return NextResponse.json(
      {
        error:
          "Your secure payment identity could not be verified. Checkout remains closed.",
      },
      { status: 503 }
    )
  }

  const { data: existingPurchase, error: purchaseLookupError } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_type", body.productId)
    .eq("deployment_target", deploymentTarget)
    .eq("stripe_account_id", stripeAccountId)
    .eq("stripe_livemode", stripeLivemode)
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
    const configuredPrice = await stripe.prices.retrieve(price, {
      expand: ["product"],
    })
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

  const orderValues = {
    attemptId: body.attemptId,
    catalogVersion,
    customerEmail: user.email,
    deploymentTarget,
    productId: body.productId,
    siteUrl,
    stripeAccountId,
    stripeCustomerId: stripeCustomer?.stripe_customer_id ?? null,
    stripeLivemode,
    stripePriceId: configuredPriceId,
    stripeProductId,
    userId: user.id,
  }

  const initialOrderLookup = await findActiveCheckoutOrder(
    supabase,
    user.id,
    body.productId,
    deploymentTarget,
    stripeAccountId,
    stripeLivemode
  )
  if (initialOrderLookup.error) {
    return NextResponse.json(
      {
        error:
          "Your secure checkout state could not be verified. Checkout remains closed.",
      },
      { status: 503 }
    )
  }

  let order = initialOrderLookup.data

  // A partial unique index permits only one creating/open order for this
  // user/product/deployment/account/mode. If another device wins the insert
  // race, re-read and reuse that server-owned order instead of creating a
  // second Session.
  if (!order) {
    const reservation = await reserveCheckoutOrder(supabase, orderValues)
    if (reservation.error?.code === "23505") {
      const concurrentOrder = await findActiveCheckoutOrder(
        supabase,
        user.id,
        body.productId,
        deploymentTarget,
        stripeAccountId,
        stripeLivemode
      )
      if (concurrentOrder.error || !concurrentOrder.data) {
        return NextResponse.json(
          {
            error:
              "Another secure checkout is being prepared. Please try again in a moment.",
          },
          { status: 409 }
        )
      }
      order = concurrentOrder.data
    } else if (reservation.error || !reservation.data) {
      return NextResponse.json(
        {
          error:
            "A secure checkout could not be reserved. Nothing was charged; please try again.",
        },
        { status: 503 }
      )
    } else {
      order = reservation.data
    }
  }

  for (let attempt = 0; attempt < 2 && order; attempt += 1) {
    if (
      order.catalog_version !== catalogVersion ||
      order.deployment_target !== deploymentTarget ||
      order.site_url !== siteUrl ||
      order.stripe_account_id !== stripeAccountId ||
      order.stripe_price_id !== configuredPriceId ||
      order.stripe_product_id !== stripeProductId
    ) {
      return NextResponse.json(
        {
          error:
            "An earlier checkout uses a different verified catalog. Contact Shannon before trying again.",
        },
        { status: 409 }
      )
    }

    let session: Stripe.Checkout.Session
    try {
      if (order.stripe_checkout_session_id) {
        session = await stripe.checkout.sessions.retrieve(
          order.stripe_checkout_session_id
        )
      } else {
        if (new Date(order.expires_at).getTime() <= Date.now()) {
          const { error } = await supabase
            .from("checkout_orders")
            .update({ status: "expired" })
            .eq("id", order.id)
            .eq("deployment_target", deploymentTarget)
            .eq("stripe_account_id", stripeAccountId)
            .eq("stripe_livemode", stripeLivemode)
            .in("status", ["creating", "open"])
          if (error) throw error

          const replacement = await reserveCheckoutOrder(supabase, orderValues)
          if (replacement.error || !replacement.data) throw replacement.error
          order = replacement.data
          continue
        }
        session = await createOrRecoverStripeSession(stripe, order)
      }
    } catch {
      console.error("Stripe Checkout Session preparation failed", {
        stage: "session_prepare",
      })
      return NextResponse.json(
        {
          error:
            "We could not verify your payment status. Check your email and account before trying again; your cart is saved.",
        },
        { status: 503 }
      )
    }

    if (!sessionMatchesOrder(session, order)) {
      return NextResponse.json(
        {
          error:
            "The secure checkout identity did not match this account. Check your email and account before trying again.",
        },
        { status: 503 }
      )
    }

    if (session.status === "expired") {
      const { error } = await supabase
        .from("checkout_orders")
        .update({ status: "expired" })
        .eq("id", order.id)
        .eq("deployment_target", deploymentTarget)
        .eq("stripe_account_id", stripeAccountId)
        .eq("stripe_livemode", stripeLivemode)
        .in("status", ["creating", "open"])
      if (error) {
        return NextResponse.json(
          { error: "The expired checkout could not be safely replaced." },
          { status: 503 }
        )
      }

      const replacement = await reserveCheckoutOrder(supabase, orderValues)
      if (replacement.error || !replacement.data) {
        return NextResponse.json(
          {
            error:
              "A new secure checkout could not be reserved. Nothing was charged.",
          },
          { status: 503 }
        )
      }
      order = replacement.data
      continue
    }

    if (session.status === "complete") {
      return NextResponse.json({
        url: `${siteUrl}/checkout/success?session_id=${encodeURIComponent(session.id)}`,
      })
    }

    if (session.status !== "open" || !session.url) {
      return NextResponse.json(
        { error: "Secure checkout is not available for this order." },
        { status: 503 }
      )
    }

    const { error: orderUpdateError } = await supabase
      .from("checkout_orders")
      .update({
        expires_at: new Date(session.expires_at * 1_000).toISOString(),
        status: "open",
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: getPaymentIntentId(session.payment_intent),
      })
      .eq("id", order.id)
      .eq("deployment_target", deploymentTarget)
      .eq("stripe_account_id", stripeAccountId)
      .eq("stripe_livemode", stripeLivemode)
      .in("status", ["creating", "open"])
    if (orderUpdateError) {
      return NextResponse.json(
        {
          error:
            "Secure checkout was prepared but could not be safely recorded. Nothing has been charged; please try again.",
        },
        { status: 503 }
      )
    }

    return NextResponse.json({ url: session.url })
  }

  return NextResponse.json(
    {
      error:
        "We could not verify your payment status. Check your email and account before trying again; your cart is saved.",
    },
    { status: 503 }
  )
}
