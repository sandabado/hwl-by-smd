import "server-only"

import Stripe from "stripe"

export type ProductId = "lift_guide" | "pdf_download" | "membership"

export const PRODUCTS: Record<
  ProductId,
  {
    amount: string
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
    envKey: "STRIPE_PDF_PRICE_ID",
    mode: "payment",
    name: "LIFT PDF Guide",
  },
  lift_guide: {
    amount: "$5.55",
    envKey: "STRIPE_LIFT_GUIDE_PRICE_ID",
    mode: "payment",
    name: "LIFT Video + PDF",
  },
  membership: {
    amount: "$11.11/month",
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

export function isProductId(value: unknown): value is ProductId {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(PRODUCTS, value)
  )
}
