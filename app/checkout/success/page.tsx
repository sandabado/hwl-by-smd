import Link from "next/link"
import { AlertCircle, Check, Clock3 } from "lucide-react"

import { ContentLicenseNote } from "@/components/member/content-license-note"
import { Button } from "@/components/ui/button"
import { getAuthenticatedUser } from "@/lib/access"
import { createAdminClient } from "@/lib/supabase/server"
import { getStripe, isProductId, type ProductId } from "@/lib/stripe"

export const dynamic = "force-dynamic"

type CheckoutState =
  | { kind: "invalid" }
  | { kind: "paid_pending"; sessionId: string }
  | { kind: "ready"; productType: ProductId }
  | { kind: "sign_in"; sessionId: string }
  | { kind: "verification_unavailable" }

async function getCheckoutState(sessionId: string): Promise<CheckoutState> {
  const user = await getAuthenticatedUser()
  if (!user) return { kind: "sign_in", sessionId }

  const supabase = createAdminClient()
  if (!supabase) return { kind: "verification_unavailable" }

  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .select("product_type")
    .eq("stripe_checkout_session_id", sessionId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle()
  if (purchaseError) return { kind: "verification_unavailable" }

  if (isProductId(purchase?.product_type)) {
    return { kind: "ready", productType: purchase.product_type }
  }

  const stripe = getStripe()
  if (!stripe) return { kind: "verification_unavailable" }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const sessionUserId =
      session.metadata?.user_id ?? session.client_reference_id
    const productType = session.metadata?.product_type

    if (
      sessionUserId !== user.id ||
      session.payment_status !== "paid" ||
      !isProductId(productType)
    ) {
      return { kind: "invalid" }
    }

    return { kind: "paid_pending", sessionId }
  } catch {
    return { kind: "invalid" }
  }
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
  const verificationUnavailable = state.kind === "verification_unavailable"
  const Icon = ready ? Check : paidPending ? Clock3 : AlertCircle

  return (
    <section className="member-atmosphere px-6 py-24">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-white/60 bg-white/65 p-10 text-center shadow-xl backdrop-blur md:p-14">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#52694d] text-white">
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <p className="mt-7 text-xs tracking-[0.3em] text-[var(--accent)] uppercase">
          {ready
            ? "Purchase verified"
            : paidPending
              ? "Payment received"
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
              ? "Your access is being prepared."
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
              ? "Stripe confirmed the payment. The secure entitlement is still processing; check your account again in a moment."
              : signIn
                ? "Sign in with the same email used for checkout so we can verify your private access."
                : verificationUnavailable
                  ? "This page has not granted access or claimed that payment succeeded. Keep your Stripe receipt and contact Shannon so the purchase can be checked safely."
                  : "No access was granted from this page. Return to the store or contact Shannon if you completed a payment."}
        </p>
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
              <Link href="/course/lift-daily-facial-ritual">
                Begin Complete LIFT
              </Link>
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
