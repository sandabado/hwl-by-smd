import Link from "next/link"
import { AlertCircle, Check, Clock3 } from "lucide-react"

import { ClearCartOnSuccess } from "@/components/cart/clear-cart-on-success"
import { ContentLicenseNote } from "@/components/member/content-license-note"
import { PaidCheckoutReconciler } from "@/components/payment/paid-checkout-reconciler"
import { Button } from "@/components/ui/button"
import { getAuthenticatedUser } from "@/lib/access"
import { isCheckoutSessionId } from "@/lib/commerce/checkout-reconciliation-policy"
import { createAdminClient } from "@/lib/supabase/server"
import {
  getCommerceDeploymentTarget,
  getExpectedStripeAccountId,
  getExpectedStripeLivemode,
  getPriceId,
  getProductId,
  isProductId,
  LAUNCH_PRODUCT_ID,
  PRODUCTS,
  type ProductId,
} from "@/lib/stripe"

export const dynamic = "force-dynamic"

type CheckoutState =
  | { kind: "invalid" }
  | { kind: "paid_pending"; sessionId: string }
  | { kind: "ready"; productType: ProductId }
  | { kind: "revoked"; status: "cancelled" | "disputed" | "refunded" }
  | { kind: "sign_in"; sessionId: string }
  | { kind: "verification_unavailable" }

async function getCheckoutState(sessionId: string): Promise<CheckoutState> {
  if (!isCheckoutSessionId(sessionId)) return { kind: "invalid" }

  const user = await getAuthenticatedUser()
  if (!user) return { kind: "sign_in", sessionId }

  const supabase = createAdminClient()
  const deploymentTarget = getCommerceDeploymentTarget()
  const stripeAccountId = getExpectedStripeAccountId()
  const stripeLivemode = getExpectedStripeLivemode()
  const catalogVersion = PRODUCTS[LAUNCH_PRODUCT_ID].catalogVersion
  const priceId = getPriceId(LAUNCH_PRODUCT_ID)
  const stripeProductId = getProductId(LAUNCH_PRODUCT_ID)
  if (
    !supabase ||
    !deploymentTarget ||
    !stripeAccountId ||
    stripeLivemode === null ||
    !catalogVersion ||
    !priceId ||
    !stripeProductId
  ) {
    return { kind: "verification_unavailable" }
  }

  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .select("product_type, status, stripe_payment_intent_id")
    .eq("stripe_checkout_session_id", sessionId)
    .eq("deployment_target", deploymentTarget)
    .eq("stripe_account_id", stripeAccountId)
    .eq("stripe_livemode", stripeLivemode)
    .eq("user_id", user.id)
    .eq("product_type", LAUNCH_PRODUCT_ID)
    .eq("catalog_version", catalogVersion)
    .eq("stripe_price_id", priceId)
    .eq("stripe_product_id", stripeProductId)
    .maybeSingle()
  if (purchaseError) return { kind: "verification_unavailable" }

  // The GET is display-only. It recognizes an owned, server-created launch
  // order but never calls Stripe or writes entitlement; the constrained POST
  // reconciler performs the one authoritative provider verification.
  const { data: order, error: orderError } = await supabase
    .from("checkout_orders")
    .select(
      "fulfilled_at, fulfillment_source, id, status, stripe_payment_intent_id"
    )
    .eq("stripe_checkout_session_id", sessionId)
    .eq("user_id", user.id)
    .eq("product_type", LAUNCH_PRODUCT_ID)
    .eq("catalog_version", catalogVersion)
    .eq("deployment_target", deploymentTarget)
    .eq("stripe_account_id", stripeAccountId)
    .eq("stripe_livemode", stripeLivemode)
    .eq("stripe_price_id", priceId)
    .eq("stripe_product_id", stripeProductId)
    .in("status", ["creating", "open", "paid", "refunded", "disputed"])
    .maybeSingle()
  if (orderError) return { kind: "verification_unavailable" }

  if (
    purchase?.status === "cancelled" ||
    purchase?.status === "disputed" ||
    purchase?.status === "refunded"
  ) {
    return { kind: "revoked", status: purchase.status }
  }
  if (
    !purchase &&
    (order?.status === "disputed" || order?.status === "refunded")
  ) {
    return { kind: "revoked", status: order.status }
  }
  if (purchase) {
    if (purchase.status !== "active" || !isProductId(purchase.product_type)) {
      return { kind: "verification_unavailable" }
    }

    const orderIsComplete =
      order?.status === "paid" &&
      order.stripe_payment_intent_id === purchase.stripe_payment_intent_id &&
      (order.fulfillment_source === "webhook" ||
        order.fulfillment_source === "authenticated_reconciliation" ||
        order.fulfillment_source === "scheduled_reconciliation") &&
      Boolean(order.fulfilled_at)
    if (orderIsComplete) {
      return { kind: "ready", productType: purchase.product_type }
    }
    if (order && ["creating", "open", "paid"].includes(order.status)) {
      return { kind: "paid_pending", sessionId }
    }
    return { kind: "verification_unavailable" }
  }

  return order ? { kind: "paid_pending", sessionId } : { kind: "invalid" }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id: sessionId } = await searchParams
  const state = sessionId
    ? await getCheckoutState(sessionId)
    : ({ kind: "invalid" } as const)
  const ready = state.kind === "ready"
  const signIn = state.kind === "sign_in"
  const paidPending = state.kind === "paid_pending"
  const revoked = state.kind === "revoked"
  const verificationUnavailable = state.kind === "verification_unavailable"
  const Icon = ready ? Check : paidPending ? Clock3 : AlertCircle

  return (
    <section className="member-atmosphere px-6 py-24">
      {ready ? <ClearCartOnSuccess /> : null}
      <div className="mx-auto max-w-xl rounded-[2rem] border border-white/60 bg-white/65 p-10 text-center shadow-xl backdrop-blur md:p-14">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#52694d] text-white">
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <p className="mt-7 text-xs tracking-[0.3em] text-[var(--accent)] uppercase">
          {ready
            ? "Purchase verified"
            : paidPending
              ? "Payment verification"
              : revoked
                ? "Access revoked"
                : signIn
                  ? "Sign in to continue"
                  : verificationUnavailable
                    ? "Verification unavailable"
                    : "Unable to verify"}
        </p>
        <h1 className="mt-4 text-5xl font-medium text-[var(--primary)]">
          {ready
            ? "Your ritual is ready."
            : paidPending
              ? "Your access is being verified."
              : revoked
                ? "This purchase is no longer active."
                : signIn
                  ? "Return to your account."
                  : verificationUnavailable
                    ? "We cannot safely confirm this payment yet."
                    : "This checkout could not be confirmed."}
        </h1>
        <p className="mt-5 leading-relaxed text-[var(--muted-foreground)]">
          {ready
            ? "Your purchase is safely recorded in your private library."
            : paidPending
              ? "This page does not grant access. We are checking the recorded checkout against Stripe and finishing the protected order record; only server-side verification can change entitlement."
              : revoked
                ? state.status === "disputed"
                  ? "This charge is disputed, so private access has been closed. Contact Shannon if you believe this needs review."
                  : "This payment was refunded or cancelled, so private access remains closed. Contact Shannon if you believe this needs review."
                : signIn
                  ? "Sign in with the same email used for checkout so we can verify your private access."
                  : verificationUnavailable
                    ? "This page has not granted access or claimed that payment succeeded. Keep your Stripe receipt and contact Shannon so the purchase can be checked safely."
                    : "No access was granted from this page. Return to the store or contact Shannon if you completed a payment."}
        </p>
        {paidPending ? (
          <PaidCheckoutReconciler sessionId={state.sessionId} />
        ) : null}
        {ready &&
        (state.productType === "pdf_download" ||
          state.productType === "lift_guide") ? (
          <ContentLicenseNote className="mt-7 text-left" />
        ) : null}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {ready && state.productType === "pdf_download" ? (
            <Button
              asChild
              className="h-11 rounded-full bg-[var(--primary)] px-7 text-white"
            >
              <Link href="/api/download/lift" prefetch={false}>
                Download LIFT PDF
              </Link>
            </Button>
          ) : ready && state.productType === "lift_guide" ? (
            <Button
              asChild
              className="h-11 rounded-full bg-[var(--primary)] px-7 text-white"
            >
              <Link href="/course/lift-daily-facial-ritual">Begin LIFT</Link>
            </Button>
          ) : ready ? (
            <Button
              asChild
              className="h-11 rounded-full bg-[var(--primary)] px-7 text-white"
            >
              <Link href="/the-den">Enter The Den</Link>
            </Button>
          ) : signIn ? (
            <Button
              asChild
              className="h-11 rounded-full bg-[var(--primary)] px-7 text-white"
            >
              <Link
                href={`/login?redirectTo=${encodeURIComponent(`/checkout/success?session_id=${state.sessionId}`)}`}
              >
                Sign In
              </Link>
            </Button>
          ) : paidPending ? (
            <Button
              asChild
              className="h-11 rounded-full bg-[var(--primary)] px-7 text-white"
            >
              <Link href="/account">Check My Account</Link>
            </Button>
          ) : (
            <Button
              asChild
              className="h-11 rounded-full bg-[var(--primary)] px-7 text-white"
            >
              <Link href="/store">Return to Store</Link>
            </Button>
          )}
          <Button asChild className="h-11 rounded-full px-7" variant="outline">
            <Link href="/contact">Contact Shannon</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
