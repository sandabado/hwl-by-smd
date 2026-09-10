import "server-only"

import type Stripe from "stripe"

import { requireAdmin, type AdminAccess } from "@/lib/admin-auth"
import {
  getExpectedStripeAccountId,
  getExpectedStripeLivemode,
  getStripe,
  isStripeModeConfigured,
} from "@/lib/stripe"

const STRIPE_ACCOUNT_ID = /^acct_[A-Za-z0-9]+$/
const PRODUCT_LIMIT = 20
const PRICE_LIMIT = 50
const ACTIVITY_LIMIT = 8

type StripeList<T> = Promise<{ data: T[] }>

type StripeAdminClient = {
  accounts: {
    retrieveCurrent: () => Promise<{ id: string }>
  }
  invoices: {
    list: (params: { limit: number }) => StripeList<Stripe.Invoice>
  }
  paymentIntents: {
    list: (params: { limit: number }) => StripeList<Stripe.PaymentIntent>
  }
  prices: {
    list: (params: {
      active: boolean
      limit: number
    }) => StripeList<Stripe.Price>
  }
  products: {
    list: (params: {
      active: boolean
      limit: number
    }) => StripeList<Stripe.Product>
  }
}

export type AdminStripePrice = {
  id: string
  currency: string
  cadence: string
  unitAmount: number | null
}

export type AdminStripeProduct = {
  id: string
  name: string
  prices: AdminStripePrice[]
}

export type AdminStripeActivity = {
  id: string
  amount: number
  created: number
  currency: string
  status: string
}

type AdminStripeSection<T> =
  { status: "ready"; items: T[] } | { status: "unavailable"; items: [] }

export type AdminStripeOverview =
  | { status: "local_preview" }
  | { status: "not_configured" }
  | {
      status: "account_mismatch"
      expectedAccountId: string
      livemode: boolean
      dashboardBaseUrl: string
    }
  | { status: "unavailable" }
  | {
      status: "ready"
      accountId: string
      livemode: boolean
      dashboardBaseUrl: string
      catalog: AdminStripeSection<AdminStripeProduct>
      payments: AdminStripeSection<AdminStripeActivity>
      invoices: AdminStripeSection<AdminStripeActivity>
    }

export type AdminStripeDependencies = {
  authorizeAdmin: () => Promise<AdminAccess>
  createStripeClient: () => StripeAdminClient | null
  getExpectedAccountId: () => string | null
  getExpectedLivemode: () => boolean | null
  isModeConfigured: () => boolean
}

const runtimeDependencies: AdminStripeDependencies = {
  authorizeAdmin: requireAdmin,
  createStripeClient: () => getStripe() as StripeAdminClient | null,
  getExpectedAccountId: getExpectedStripeAccountId,
  getExpectedLivemode: getExpectedStripeLivemode,
  isModeConfigured: isStripeModeConfigured,
}

export function getStripeDashboardBaseUrl(
  accountId: string,
  livemode: boolean
) {
  if (!STRIPE_ACCOUNT_ID.test(accountId)) return null

  return `https://dashboard.stripe.com/${accountId}${livemode ? "" : "/test"}`
}

function productIdFromPrice(price: Stripe.Price) {
  if (typeof price.product === "string") return price.product
  if ("deleted" in price.product && price.product.deleted) return null
  return price.product.id
}

function sanitizeCatalog(
  products: Stripe.Product[],
  prices: Stripe.Price[],
  livemode: boolean
): AdminStripeProduct[] {
  const activeProducts = products
    .filter((product) => product.active && product.livemode === livemode)
    .slice(0, PRODUCT_LIMIT)

  return activeProducts.map((product) => ({
    id: product.id,
    name: product.name,
    prices: prices
      .filter(
        (price) =>
          price.active &&
          price.livemode === livemode &&
          productIdFromPrice(price) === product.id
      )
      .slice(0, PRICE_LIMIT)
      .map((price) => ({
        cadence:
          price.type === "recurring" && price.recurring
            ? `Every ${price.recurring.interval_count > 1 ? `${price.recurring.interval_count} ` : ""}${price.recurring.interval}${price.recurring.interval_count > 1 ? "s" : ""}`
            : "One-time",
        currency: price.currency,
        id: price.id,
        unitAmount: price.unit_amount,
      })),
  }))
}

function sanitizePaymentIntents(
  payments: Stripe.PaymentIntent[],
  livemode: boolean
): AdminStripeActivity[] {
  return payments
    .filter((payment) => payment.livemode === livemode)
    .slice(0, ACTIVITY_LIMIT)
    .map((payment) => ({
      amount:
        payment.status === "succeeded"
          ? payment.amount_received
          : payment.amount,
      created: payment.created,
      currency: payment.currency,
      id: payment.id,
      status: payment.status,
    }))
}

function sanitizeInvoices(
  invoices: Stripe.Invoice[],
  livemode: boolean
): AdminStripeActivity[] {
  return invoices
    .filter((invoice) => invoice.livemode === livemode)
    .slice(0, ACTIVITY_LIMIT)
    .map((invoice) => ({
      amount:
        invoice.status === "paid" ? invoice.amount_paid : invoice.amount_due,
      created: invoice.created,
      currency: invoice.currency,
      id: invoice.id,
      status: invoice.status ?? "draft",
    }))
}

/**
 * Reads a deliberately narrow Stripe operations DTO for an authenticated HWL
 * administrator. The current account is verified before any catalog or money
 * activity is queried. Customer identity, email, payment methods, cards,
 * addresses, metadata, and provider secrets are never returned.
 */
export async function getAdminStripeOverview(
  dependencies: AdminStripeDependencies = runtimeDependencies
): Promise<AdminStripeOverview> {
  const access = await dependencies.authorizeAdmin()
  if (access.source !== "supabase") return { status: "local_preview" }

  const stripe = dependencies.createStripeClient()
  const expectedAccountId = dependencies.getExpectedAccountId()
  const livemode = dependencies.getExpectedLivemode()

  if (
    !stripe ||
    !expectedAccountId ||
    livemode === null ||
    !dependencies.isModeConfigured()
  ) {
    return { status: "not_configured" }
  }

  const dashboardBaseUrl = getStripeDashboardBaseUrl(
    expectedAccountId,
    livemode
  )
  if (!dashboardBaseUrl) return { status: "not_configured" }

  let account: { id: string }
  try {
    account = await stripe.accounts.retrieveCurrent()
  } catch {
    return { status: "unavailable" }
  }

  if (account.id !== expectedAccountId) {
    return {
      dashboardBaseUrl,
      expectedAccountId,
      livemode,
      status: "account_mismatch",
    }
  }

  const [products, prices, payments, invoices] = await Promise.allSettled([
    stripe.products.list({ active: true, limit: PRODUCT_LIMIT }),
    stripe.prices.list({ active: true, limit: PRICE_LIMIT }),
    stripe.paymentIntents.list({ limit: ACTIVITY_LIMIT }),
    stripe.invoices.list({ limit: ACTIVITY_LIMIT }),
  ])

  const catalog =
    products.status === "fulfilled" && prices.status === "fulfilled"
      ? {
          items: sanitizeCatalog(
            products.value.data,
            prices.value.data,
            livemode
          ),
          status: "ready" as const,
        }
      : { items: [] as [], status: "unavailable" as const }

  return {
    accountId: account.id,
    catalog,
    dashboardBaseUrl,
    invoices:
      invoices.status === "fulfilled"
        ? {
            items: sanitizeInvoices(invoices.value.data, livemode),
            status: "ready",
          }
        : { items: [], status: "unavailable" },
    livemode,
    payments:
      payments.status === "fulfilled"
        ? {
            items: sanitizePaymentIntents(payments.value.data, livemode),
            status: "ready",
          }
        : { items: [], status: "unavailable" },
    status: "ready",
  }
}
