import "server-only"

import Stripe from "stripe"

import {
  getCanonicalStripeAccountId,
  getCanonicalStripeLivemode,
  getCanonicalStripePriceId,
  getCanonicalStripeProductId,
  getCommerceDeploymentTarget as resolveCommerceDeploymentTarget,
  isCommerceRuntimeAuthorityConfigured,
  type DeploymentTarget,
} from "@/lib/commerce/launch-authority"

export type { DeploymentTarget } from "@/lib/commerce/launch-authority"

export type ProductId = "lift_guide" | "pdf_download" | "membership"

export const COMMERCE_APPLICATION = "hwl-by-smd"
export const LAUNCH_PRODUCT_ID = "lift_guide" as const

const STRIPE_REQUEST_TIMEOUT_MS = 10_000

const LIFT_METADATA = {
  catalog_version: "lift-complete-v2",
  delivery: "video_and_pdf",
  hwl_product_id: LAUNCH_PRODUCT_ID,
} as const

export const CHECKOUT_CATALOG = {
  "lift-complete-v2": {
    expectedCurrency: "usd",
    expectedPriceType: "one_time",
    expectedUnitAmount: 1111,
    mode: "payment",
    productId: "lift_guide",
  },
  "pdf-download-v1": {
    expectedCurrency: "usd",
    expectedPriceType: "one_time",
    expectedUnitAmount: 1111,
    mode: "payment",
    productId: "pdf_download",
  },
  "lift-guide-v1": {
    expectedCurrency: "usd",
    expectedPriceType: "one_time",
    expectedUnitAmount: 3333,
    mode: "payment",
    productId: "lift_guide",
  },
} as const

export type CheckoutCatalogVersion = keyof typeof CHECKOUT_CATALOG

export const PRODUCTS: Record<
  ProductId,
  {
    amount: string
    catalogVersion: CheckoutCatalogVersion | null
    expectedCurrency: "usd"
    expectedPriceType: "one_time" | "recurring"
    expectedRecurringInterval?: "month"
    expectedUnitAmount: number
    envKey:
      | "STRIPE_LIFT_GUIDE_PRICE_ID"
      | "STRIPE_PDF_PRICE_ID"
      | "STRIPE_MEMBERSHIP_PRICE_ID"
    mode: "payment" | "subscription"
    name: string
  }
> = {
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
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  return key
    ? new Stripe(key, {
        maxNetworkRetries: 2,
        timeout: STRIPE_REQUEST_TIMEOUT_MS,
      })
    : null
}

export function getCommerceDeploymentTarget(): DeploymentTarget | null {
  return resolveCommerceDeploymentTarget(process.env)
}

export function getExpectedStripeLivemode() {
  return getCanonicalStripeLivemode(process.env)
}

export function getExpectedStripeAccountId() {
  return getCanonicalStripeAccountId(process.env)
}

export function getProductId(productId: ProductId) {
  if (productId !== LAUNCH_PRODUCT_ID) return undefined
  return getCanonicalStripeProductId(process.env)
}

function getStripeKeyLivemode() {
  const key = process.env.STRIPE_SECRET_KEY
  if (key?.startsWith("sk_live_") || key?.startsWith("rk_live_")) return true
  if (key?.startsWith("sk_test_") || key?.startsWith("rk_test_")) return false
  return null
}

export function isStripeModeConfigured() {
  const expectedLivemode = getExpectedStripeLivemode()
  const keyLivemode = getStripeKeyLivemode()

  return Boolean(
    getExpectedStripeAccountId() &&
    getCommerceDeploymentTarget() &&
    expectedLivemode !== null &&
    keyLivemode === expectedLivemode
  )
}

export async function isExpectedStripeAccount(stripe: Stripe) {
  const expectedAccountId = getExpectedStripeAccountId()
  if (!expectedAccountId) return false

  const account = await stripe.accounts.retrieveCurrent()
  return account.id === expectedAccountId
}

export function getPriceId(productId: ProductId) {
  if (productId === LAUNCH_PRODUCT_ID) {
    return getCanonicalStripePriceId(process.env)
  }

  const price = process.env[PRODUCTS[productId].envKey]
  if (price) return price

  // Temporary compatibility with the first local Phase 2 template.
  return productId === "pdf_download"
    ? process.env.STRIPE_LIFT_PDF_PRICE_ID
    : undefined
}

export function isCommerceSalesReady() {
  return process.env.COMMERCE_SALES_READY === "true"
}

export function isProductCheckoutReady(productId: ProductId) {
  // LIFT launches as one product. Legacy PDF-only purchases remain readable,
  // and The Den remains in the data model for a later release, but neither can
  // create a new checkout session.
  if (productId !== "lift_guide") return false

  return isCommerceRuntimeAuthorityConfigured(process.env)
}

function hasExpectedLiftMetadata(metadata: Stripe.Metadata) {
  return Object.entries(LIFT_METADATA).every(
    ([key, value]) => metadata[key] === value
  )
}

function isExpandedActiveProduct(
  product: Stripe.Price["product"]
): product is Stripe.Product {
  return (
    typeof product === "object" &&
    !("deleted" in product && product.deleted) &&
    product.active
  )
}

export function isExpectedStripePrice(
  productId: ProductId,
  price: Pick<
    Stripe.Price,
    | "active"
    | "currency"
    | "id"
    | "livemode"
    | "metadata"
    | "product"
    | "recurring"
    | "type"
    | "unit_amount"
  >
) {
  const product = PRODUCTS[productId]
  const expectedLivemode = getExpectedStripeLivemode()
  const expectedPriceId = getPriceId(productId)
  const expectedProductId = getProductId(productId)
  const stripeProduct = price.product

  if (
    expectedLivemode === null ||
    !expectedPriceId ||
    !expectedProductId ||
    price.id !== expectedPriceId ||
    !price.active ||
    price.livemode !== expectedLivemode ||
    price.currency !== product.expectedCurrency ||
    price.unit_amount !== product.expectedUnitAmount ||
    price.type !== product.expectedPriceType ||
    !isExpandedActiveProduct(stripeProduct) ||
    stripeProduct.id !== expectedProductId ||
    stripeProduct.livemode !== expectedLivemode ||
    !hasExpectedLiftMetadata(price.metadata) ||
    !hasExpectedLiftMetadata(stripeProduct.metadata)
  ) {
    return false
  }

  if (product.expectedPriceType === "one_time") {
    return price.recurring === null
  }

  return (
    price.recurring?.interval === product.expectedRecurringInterval &&
    price.recurring?.interval_count === 1
  )
}

export function getCheckoutCatalog(value: unknown) {
  return typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(CHECKOUT_CATALOG, value)
    ? CHECKOUT_CATALOG[value as CheckoutCatalogVersion]
    : null
}

export function isExpectedCatalogPrice(
  catalogVersion: unknown,
  price: Pick<
    Stripe.Price,
    | "currency"
    | "id"
    | "livemode"
    | "product"
    | "recurring"
    | "type"
    | "unit_amount"
  >,
  expectedPriceId: string,
  expectedProductId: string
) {
  const catalog = getCheckoutCatalog(catalogVersion)
  const expectedLivemode = getExpectedStripeLivemode()
  const priceProductId =
    typeof price.product === "string" ? price.product : price.product.id

  if (
    !catalog ||
    expectedLivemode === null ||
    price.id !== expectedPriceId ||
    priceProductId !== expectedProductId ||
    price.livemode !== expectedLivemode ||
    price.currency !== catalog.expectedCurrency ||
    price.unit_amount !== catalog.expectedUnitAmount ||
    price.type !== catalog.expectedPriceType
  ) {
    return false
  }

  return price.recurring === null
}

export function isProductId(value: unknown): value is ProductId {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(PRODUCTS, value)
  )
}
