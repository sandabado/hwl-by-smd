import "server-only"

import Stripe from "stripe"

export type ProductId = "lift_guide" | "pdf_download" | "membership"

export const PRODUCTS: Record<
  ProductId,
  {
    amount: string
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
    amount: "$3.33",
    expectedCurrency: "usd",
    expectedPriceType: "one_time",
    expectedUnitAmount: 333,
    envKey: "STRIPE_PDF_PRICE_ID",
    mode: "payment",
    name: "LIFT PDF Guide",
  },
  lift_guide: {
    amount: "$11.11",
    expectedCurrency: "usd",
    expectedPriceType: "one_time",
    expectedUnitAmount: 1111,
    envKey: "STRIPE_LIFT_GUIDE_PRICE_ID",
    mode: "payment",
    name: "Complete LIFT — Video + PDF",
  },
  membership: {
    amount: "$11.11/month",
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
  return key ? new Stripe(key) : null
}

export function getPriceId(productId: ProductId) {
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
  return Boolean(
    isCommerceSalesReady() &&
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_WEBHOOK_SECRET &&
    getPriceId(productId)
  )
}

export function isExpectedStripePrice(
  productId: ProductId,
  price: Pick<
    Stripe.Price,
    "active" | "currency" | "recurring" | "type" | "unit_amount"
  >
) {
  const product = PRODUCTS[productId]

  if (
    !price.active ||
    price.currency !== product.expectedCurrency ||
    price.unit_amount !== product.expectedUnitAmount ||
    price.type !== product.expectedPriceType
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

export function isProductId(value: unknown): value is ProductId {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(PRODUCTS, value)
  )
}
