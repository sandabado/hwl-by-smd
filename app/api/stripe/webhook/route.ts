import type Stripe from "stripe"

import { sendTransactionalEmail } from "@/lib/email"
import { createAdminClient } from "@/lib/supabase/server"
import { getStripe, isProductId } from "@/lib/stripe"

function membershipStatus(status: Stripe.Subscription.Status) {
  if (
    [
      "active",
      "canceled",
      "past_due",
      "trialing",
      "incomplete",
      "unpaid",
    ].includes(status)
  ) {
    return status
  }
  return "incomplete"
}

function customerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
) {
  return typeof customer === "string" ? customer : (customer?.id ?? null)
}

function subscriptionId(subscription: string | Stripe.Subscription | null) {
  return typeof subscription === "string"
    ? subscription
    : (subscription?.id ?? null)
}

async function syncSubscription(
  subscription: Stripe.Subscription,
  fallbackUserId?: string | null
) {
  const supabase = createAdminClient()
  if (!supabase) throw new Error("Supabase admin connection is missing.")

  let userId = subscription.metadata.user_id || fallbackUserId || null
  const stripeCustomerId = customerId(subscription.customer)

  if (!userId && stripeCustomerId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", stripeCustomerId)
      .maybeSingle()
    userId = profile?.id ?? null
  }
  if (!userId) throw new Error("Subscription is missing its member identity.")

  const currentPeriodEnd = Math.max(
    ...subscription.items.data.map((item) => item.current_period_end),
    0
  )

  const { error } = await supabase.from("memberships").upsert(
    {
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_end: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000).toISOString()
        : null,
      status: membershipStatus(subscription.status),
      stripe_subscription_id: subscription.id,
      user_id: userId,
    },
    { onConflict: "stripe_subscription_id" }
  )
  if (error) throw error
}

export async function POST(request: Request) {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const supabase = createAdminClient()
  if (!stripe || !secret || !supabase) {
    return new Response("Commerce is not configured.", { status: 503 })
  }

  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return new Response("Missing Stripe signature.", { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      secret
    )
  } catch {
    return new Response("Invalid Stripe signature.", { status: 400 })
  }

  const { data: existing } = await supabase
    .from("stripe_events")
    .select("id")
    .eq("id", event.id)
    .maybeSingle()
  if (existing) return new Response("Already processed.", { status: 200 })

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object
      const userId = session.metadata?.user_id ?? session.client_reference_id
      const productType = session.metadata?.product_type
      if (!userId || !isProductId(productType)) {
        throw new Error("Checkout metadata is incomplete.")
      }

      const stripeCustomerId = customerId(session.customer)
      if (stripeCustomerId) {
        const { error } = await supabase
          .from("profiles")
          .update({ stripe_customer_id: stripeCustomerId })
          .eq("id", userId)
        if (error) throw error
      }

      const paymentIntent =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null)

      const { error: purchaseError } = await supabase.from("purchases").upsert(
        {
          amount_paid: (session.amount_total ?? 0) / 100,
          product_type: productType,
          status: "active",
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: paymentIntent,
          user_id: userId,
        },
        { onConflict: "stripe_checkout_session_id" }
      )
      if (purchaseError) throw purchaseError

      if (productType === "membership" && session.subscription) {
        const id =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id
        await syncSubscription(await stripe.subscriptions.retrieve(id), userId)
      }

      const email =
        session.customer_details?.email ?? session.customer_email ?? null
      if (email) {
        await sendTransactionalEmail({
          html: `<div style="font-family:Arial,sans-serif;color:#5a4a3f;line-height:1.7"><h1 style="font-family:Georgia,serif">Your ritual is ready.</h1><p>Thank you for choosing HWL by SMD. Your purchase is now waiting inside your private library.</p><p><a href="${new URL("/the-den", request.url).toString()}">Enter The Den</a></p></div>`,
          template: "purchase_confirmation",
          to: email,
        })
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await syncSubscription(event.data.object)
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice & {
        parent?: {
          subscription_details?: {
            subscription?: string | Stripe.Subscription | null
          }
        }
      }
      const id = subscriptionId(
        invoice.parent?.subscription_details?.subscription ?? null
      )
      if (id) {
        const { error } = await supabase
          .from("memberships")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", id)
        if (error) throw error
      }
    }

    const { error: eventError } = await supabase.from("stripe_events").insert({
      event_type: event.type,
      id: event.id,
    })
    if (eventError && eventError.code !== "23505") throw eventError
  } catch (error) {
    console.error("Stripe webhook processing failed", error)
    return new Response("Webhook processing failed.", { status: 500 })
  }

  return new Response("ok", { status: 200 })
}
