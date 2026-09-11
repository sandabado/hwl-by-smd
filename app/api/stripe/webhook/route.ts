import type Stripe from "stripe"

import {
  fulfillCompletedCheckout,
  markCheckoutExpired,
  reconcileFullRefund,
  revokeDisputedCharge,
} from "@/lib/commerce/stripe-fulfillment"
import { readLimitedBytes } from "@/lib/relationships/request"
import {
  COMMERCE_APPLICATION,
  getCommerceDeploymentTarget,
  getExpectedStripeAccountId,
  getExpectedStripeLivemode,
  getStripe,
  isExpectedStripeAccount,
  isLiftCheckoutCommerceMetadata,
  isServiceInvoiceCommerceMetadata,
  isStripeModeConfigured,
} from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/server"

const MAXIMUM_WEBHOOK_BYTES = 1_000_000

function paymentIntentId(paymentIntent: string | Stripe.PaymentIntent | null) {
  return typeof paymentIntent === "string"
    ? paymentIntent
    : (paymentIntent?.id ?? null)
}

async function retrieveTerminalPaymentIntent(
  stripe: NonNullable<ReturnType<typeof getStripe>>,
  paymentIntent: string | Stripe.PaymentIntent | null
) {
  const id = paymentIntentId(paymentIntent)
  if (!id) return null

  return stripe.paymentIntents.retrieve(id, {
    expand: ["latest_charge"],
  })
}

function deferredServiceFlowResponse() {
  return new Response("Service commerce flow is not active.", { status: 503 })
}

function terminalCommerceFlowMismatchResponse() {
  return new Response("Stripe commerce flow metadata did not match.", {
    status: 500,
  })
}

function claimsHwlCommerce(metadata: Stripe.Metadata | null | undefined) {
  return metadata?.application === COMMERCE_APPLICATION
}

function claimsUnknownHwlCommerceFlow(
  metadata: Stripe.Metadata | null | undefined
) {
  return (
    claimsHwlCommerce(metadata) &&
    !isLiftCheckoutCommerceMetadata(metadata) &&
    !isServiceInvoiceCommerceMetadata(metadata)
  )
}

export async function POST(request: Request) {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const deploymentTarget = getCommerceDeploymentTarget()
  const stripeAccountId = getExpectedStripeAccountId()
  const stripeLivemode = getExpectedStripeLivemode()
  const supabase = createAdminClient()
  if (
    !stripe ||
    !secret ||
    !deploymentTarget ||
    !stripeAccountId ||
    stripeLivemode === null ||
    !isStripeModeConfigured() ||
    !supabase
  ) {
    return new Response("Commerce is not configured.", { status: 503 })
  }

  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return new Response("Missing Stripe signature.", { status: 400 })
  }

  const rawBody = await readLimitedBytes(request, MAXIMUM_WEBHOOK_BYTES)
  if (!rawBody.ok) {
    return new Response(
      rawBody.reason === "too_large"
        ? "Stripe webhook payload is too large."
        : "Stripe webhook payload could not be read.",
      { status: rawBody.reason === "too_large" ? 413 : 400 }
    )
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(rawBody.value),
      signature,
      secret
    )
  } catch {
    return new Response("Invalid Stripe signature.", { status: 400 })
  }

  if (event.livemode !== stripeLivemode) {
    return new Response("Stripe event mode did not match this environment.", {
      status: 400,
    })
  }

  try {
    if (!(await isExpectedStripeAccount(stripe))) {
      return new Response(
        "Stripe API key did not match the configured account.",
        { status: 503 }
      )
    }
  } catch {
    return new Response("Stripe account could not be verified.", {
      status: 503,
    })
  }

  const { data: existingEvent, error: eventLookupError } = await supabase
    .from("stripe_events")
    .select("id")
    .eq("id", event.id)
    .eq("deployment_target", deploymentTarget)
    .eq("stripe_account_id", stripeAccountId)
    .eq("stripe_livemode", stripeLivemode)
    .maybeSingle()
  if (eventLookupError) {
    return new Response("Webhook state could not be checked.", { status: 500 })
  }
  if (existingEvent) {
    return new Response("Already processed.", { status: 200 })
  }

  try {
    let ignoredForeignNamespace = false

    if (
      (event.type === "checkout.session.completed" ||
        event.type === "checkout.session.expired") &&
      claimsUnknownHwlCommerceFlow(event.data.object.metadata)
    ) {
      return terminalCommerceFlowMismatchResponse()
    }

    if (
      (event.type === "checkout.session.completed" ||
        event.type === "checkout.session.expired") &&
      isServiceInvoiceCommerceMetadata(event.data.object.metadata)
    ) {
      return deferredServiceFlowResponse()
    }

    if (
      event.type === "checkout.session.completed" &&
      isLiftCheckoutCommerceMetadata(event.data.object.metadata)
    ) {
      const result = await fulfillCompletedCheckout({
        deploymentTarget,
        sessionId: event.data.object.id,
        source: "webhook",
        stripe,
        stripeAccountId,
        stripeLivemode,
        supabase,
      })
      ignoredForeignNamespace = result.state === "ignored"
    }

    if (
      event.type === "checkout.session.expired" &&
      isLiftCheckoutCommerceMetadata(event.data.object.metadata)
    ) {
      const result = await markCheckoutExpired(
        supabase,
        event.data.object,
        deploymentTarget,
        stripeAccountId,
        stripeLivemode
      )
      ignoredForeignNamespace = result === "ignored_foreign"
    }

    if (event.type === "charge.refunded") {
      const paymentIntent = await retrieveTerminalPaymentIntent(
        stripe,
        event.data.object.payment_intent
      )
      if (
        claimsUnknownHwlCommerceFlow(event.data.object.metadata) ||
        claimsUnknownHwlCommerceFlow(paymentIntent?.metadata)
      ) {
        return terminalCommerceFlowMismatchResponse()
      }
      if (
        claimsHwlCommerce(event.data.object.metadata) &&
        (isServiceInvoiceCommerceMetadata(event.data.object.metadata) !==
          isServiceInvoiceCommerceMetadata(paymentIntent?.metadata) ||
          isLiftCheckoutCommerceMetadata(event.data.object.metadata) !==
            isLiftCheckoutCommerceMetadata(paymentIntent?.metadata))
      ) {
        return terminalCommerceFlowMismatchResponse()
      }
      if (isServiceInvoiceCommerceMetadata(paymentIntent?.metadata)) {
        return deferredServiceFlowResponse()
      }
      const result = await reconcileFullRefund(
        stripe,
        supabase,
        event.data.object,
        deploymentTarget,
        stripeAccountId,
        stripeLivemode,
        paymentIntent ?? undefined
      )
      ignoredForeignNamespace = result === "ignored_foreign"
    }

    if (event.type === "charge.dispute.created") {
      const paymentIntent = await retrieveTerminalPaymentIntent(
        stripe,
        event.data.object.payment_intent
      )
      if (
        claimsUnknownHwlCommerceFlow(event.data.object.metadata) ||
        claimsUnknownHwlCommerceFlow(paymentIntent?.metadata)
      ) {
        return terminalCommerceFlowMismatchResponse()
      }
      if (
        claimsHwlCommerce(event.data.object.metadata) &&
        (isServiceInvoiceCommerceMetadata(event.data.object.metadata) !==
          isServiceInvoiceCommerceMetadata(paymentIntent?.metadata) ||
          isLiftCheckoutCommerceMetadata(event.data.object.metadata) !==
            isLiftCheckoutCommerceMetadata(paymentIntent?.metadata))
      ) {
        return terminalCommerceFlowMismatchResponse()
      }
      if (isServiceInvoiceCommerceMetadata(paymentIntent?.metadata)) {
        return deferredServiceFlowResponse()
      }
      const result = await revokeDisputedCharge(
        stripe,
        supabase,
        event.data.object,
        deploymentTarget,
        stripeAccountId,
        stripeLivemode,
        paymentIntent ?? undefined
      )
      ignoredForeignNamespace = result === "ignored_foreign"
    }

    if (ignoredForeignNamespace) {
      return new Response("Ignored foreign commerce namespace.", {
        status: 200,
      })
    }

    const { error: processedEventError } = await supabase
      .from("stripe_events")
      .insert({
        deployment_target: deploymentTarget,
        event_type: event.type,
        id: event.id,
        stripe_account_id: stripeAccountId,
        stripe_livemode: stripeLivemode,
      })
    if (processedEventError && processedEventError.code !== "23505") {
      throw processedEventError
    }
  } catch {
    console.error("Stripe webhook processing failed", {
      stage: "event_process",
    })
    return new Response("Webhook processing failed.", { status: 500 })
  }

  return new Response("ok", { status: 200 })
}
