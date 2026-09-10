import { resolve as resolveWithProjectLoader } from "./test-module-loader.mjs"

const HARNESS_KEY = "__hwlCommerceRouteHarness"

function moduleSource(source) {
  return {
    shortCircuit: true,
    url: `data:text/javascript,${encodeURIComponent(source)}`,
  }
}

const accessStub = `
const harness = () => globalThis[${JSON.stringify(HARNESS_KEY)}];
export async function getAuthenticatedUser() {
  return harness().getAuthenticatedUser();
}
`

const environmentStub = `
const harness = () => globalThis[${JSON.stringify(HARNESS_KEY)}];
export function getSiteUrl(requestUrl) {
  return harness().getSiteUrl(requestUrl);
}
`

const supabaseStub = `
const harness = () => globalThis[${JSON.stringify(HARNESS_KEY)}];
export function createAdminClient() {
  return harness().createAdminClient();
}
export async function createClient() {
  return null;
}
`

const stripeStub = `
const harness = () => globalThis[${JSON.stringify(HARNESS_KEY)}];
export const COMMERCE_APPLICATION = "hwl-by-smd";
export const PRODUCTS = {
  lift_guide: {
    amount: "$11.11",
    catalogVersion: "lift-complete-v2",
    expectedCurrency: "usd",
    expectedPriceType: "one_time",
    expectedUnitAmount: 1111,
    envKey: "STRIPE_LIFT_GUIDE_PRICE_ID",
    mode: "payment",
    name: "LIFT — Video + PDF",
  },
  pdf_download: {
    amount: "$11.11",
    catalogVersion: "pdf-download-v1",
    expectedCurrency: "usd",
    expectedPriceType: "one_time",
    expectedUnitAmount: 1111,
    envKey: "STRIPE_PDF_PRICE_ID",
    mode: "payment",
    name: "LIFT PDF Guide",
  },
  membership: {
    amount: "$11.11/month",
    catalogVersion: null,
    expectedCurrency: "usd",
    expectedPriceType: "recurring",
    expectedRecurringInterval: "month",
    expectedUnitAmount: 1111,
    envKey: "STRIPE_MEMBERSHIP_PRICE_ID",
    mode: "subscription",
    name: "The Den Membership",
  },
};
export function getCommerceDeploymentTarget() {
  return harness().getCommerceDeploymentTarget();
}
export function getExpectedStripeAccountId() {
  return harness().getExpectedStripeAccountId();
}
export function getExpectedStripeLivemode() {
  return harness().getExpectedStripeLivemode();
}
export function getPriceId(productId) {
  return harness().getPriceId(productId);
}
export function getProductId(productId) {
  return harness().getProductId(productId);
}
export function getStripe() {
  return harness().getStripe();
}
export async function isExpectedStripeAccount(stripe) {
  return harness().isExpectedStripeAccount(stripe);
}
export function isExpectedStripePrice(productId, price) {
  return harness().isExpectedStripePrice(productId, price);
}
export function isProductCheckoutReady(productId) {
  return harness().isProductCheckoutReady(productId);
}
export function isProductId(value) {
  return value === "lift_guide" || value === "pdf_download" || value === "membership";
}
export function isStripeModeConfigured() {
  return harness().isStripeModeConfigured();
}
`

const fulfillmentStub = `
const harness = () => globalThis[${JSON.stringify(HARNESS_KEY)}];
export async function fulfillCompletedCheckout(args) {
  return harness().fulfillCompletedCheckout(args);
}
export async function markCheckoutExpired(...args) {
  return harness().markCheckoutExpired(...args);
}
export async function reconcileFullRefund(...args) {
  return harness().reconcileFullRefund(...args);
}
export async function revokeDisputedCharge(...args) {
  return harness().revokeDisputedCharge(...args);
}
`

export async function resolve(specifier, context, nextResolve) {
  const parentUrl = context.parentURL ?? ""
  const fromCheckoutRoute = parentUrl.endsWith("/app/api/checkout/route.ts")
  const fromWebhookRoute = parentUrl.endsWith(
    "/app/api/stripe/webhook/route.ts"
  )

  if (fromCheckoutRoute && specifier === "@/lib/access") {
    return moduleSource(accessStub)
  }
  if (fromCheckoutRoute && specifier === "@/lib/env") {
    return moduleSource(environmentStub)
  }
  if (
    (fromCheckoutRoute || fromWebhookRoute) &&
    specifier === "@/lib/supabase/server"
  ) {
    return moduleSource(supabaseStub)
  }
  if ((fromCheckoutRoute || fromWebhookRoute) && specifier === "@/lib/stripe") {
    return moduleSource(stripeStub)
  }
  if (fromWebhookRoute && specifier === "@/lib/commerce/stripe-fulfillment") {
    return moduleSource(fulfillmentStub)
  }

  return resolveWithProjectLoader(specifier, context, nextResolve)
}
