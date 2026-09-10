import {
  AlertCircle,
  CreditCard,
  ExternalLink,
  PackageOpen,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
} from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  EmptyState,
  PanelHeading,
  StatusPill,
} from "@/components/admin/admin-ui"
import { getAdminReconciliationStatus } from "@/lib/commerce/admin-reconciliation"
import { requireAdmin } from "@/lib/admin-auth"
import { getAdminStripeOverview } from "@/lib/commerce/stripe-admin"
import { isCommerceSalesReady } from "@/lib/stripe"

export const dynamic = "force-dynamic"

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    currency: currency.toUpperCase(),
    style: "currency",
  }).format(amount / 100)

const date = (created: number) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "America/Los_Angeles",
  }).format(new Date(created * 1000))

const readableStatus = (status: string) => status.replaceAll("_", " ")

export default async function AdminStorePage() {
  await requireAdmin()
  const [reconciliation, stripeOverview] = await Promise.all([
    getAdminReconciliationStatus(),
    getAdminStripeOverview(),
  ])
  const dashboardBaseUrl =
    stripeOverview.status === "ready" ||
    stripeOverview.status === "account_mismatch"
      ? stripeOverview.dashboardBaseUrl
      : null
  const reconciliationJobs =
    reconciliation.status === "ready" ? reconciliation.jobs : []
  const manualReviewCount = reconciliationJobs.filter(
    ({ state }) => state === "manual_review"
  ).length
  const recoveryCount = reconciliationJobs.filter(({ state }) =>
    ["leased", "pending", "retry_wait"].includes(state)
  ).length
  const monitoringCount = reconciliationJobs.filter(
    ({ state }) => state === "monitoring"
  ).length

  return (
    <>
      <AdminPageHeader
        description="See HWL's verified Stripe catalog and recent money activity here. Product edits, invoices, refunds, disputes, customers, and payouts stay in Stripe's protected dashboard."
        eyebrow="Money and fulfillment"
        title="Payments"
      >
        {dashboardBaseUrl && (
          <>
            <a
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#bfb5a7] bg-white/55 px-4 text-xs font-medium text-[#4f4438] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f4438]"
              href={`${dashboardBaseUrl}/products`}
              rel="noreferrer"
              target="_blank"
            >
              Manage products
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
            <a
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#273029] px-4 text-xs font-medium text-white transition hover:bg-[#48544b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#273029]"
              href={`${dashboardBaseUrl}/payments`}
              rel="noreferrer"
              target="_blank"
            >
              Manage payments
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </>
        )}
      </AdminPageHeader>

      <AdminPanel className="mt-8">
        <div className="flex flex-col justify-between gap-3 border-b border-[#d9d3c8] pb-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-[#9d8464]/10 text-[#876947]">
              <ShoppingBag className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium">Stripe account</p>
              <p className="text-xs text-[#59645b]">
                Verified before any product or payment data is shown
              </p>
            </div>
          </div>
          {stripeOverview.status === "ready" ? (
            <StatusPill tone="positive">
              {stripeOverview.livemode ? "Live" : "Test"} ·{" "}
              {stripeOverview.accountId}
            </StatusPill>
          ) : stripeOverview.status === "account_mismatch" ? (
            <StatusPill tone="warning">Account mismatch</StatusPill>
          ) : (
            <StatusPill tone="warning">Not connected</StatusPill>
          )}
        </div>

        {stripeOverview.status === "local_preview" ? (
          <div className="mt-5">
            <EmptyState
              description="The signed local design preview never reads hosted Stripe records. Sign in to the deployed HWL admin to see the verified account."
              icon={ShoppingBag}
              title="Stripe data stays private"
            />
          </div>
        ) : stripeOverview.status === "account_mismatch" ? (
          <div className="mt-5">
            <EmptyState
              description={`The connected key did not belong to the expected ${stripeOverview.livemode ? "live" : "test"} HWL account (${stripeOverview.expectedAccountId}). No catalog or payment records were read.`}
              icon={AlertCircle}
              title="Wrong Stripe account"
            />
          </div>
        ) : stripeOverview.status === "not_configured" ? (
          <div className="mt-5">
            <EmptyState
              description="This environment does not have one complete, mode-matched HWL Stripe configuration. No generic Stripe links are shown because they could open the wrong account."
              icon={ShoppingBag}
              title="Stripe is not configured here"
            />
          </div>
        ) : stripeOverview.status === "unavailable" ? (
          <div className="mt-5">
            <EmptyState
              description="HWL could not verify the current Stripe account, so it stopped before reading any product or payment records."
              icon={AlertCircle}
              title="Stripe verification unavailable"
            />
          </div>
        ) : (
          <>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#ddd7cd] bg-[#f6f2ea]/55 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[#455047]">
                  HWLbySMD ·{" "}
                  {stripeOverview.livemode ? "Live mode" : "Test mode"}
                </p>
                <p className="mt-1 text-xs text-[#59645b]">
                  Account {stripeOverview.accountId}. Customer identity and
                  payment methods are intentionally omitted.
                </p>
              </div>
              <StatusPill
                tone={isCommerceSalesReady() ? "positive" : "warning"}
              >
                {isCommerceSalesReady()
                  ? "Website sales open"
                  : "Website sales closed"}
              </StatusPill>
            </div>

            <div className="mt-7 flex items-end justify-between gap-3">
              <PanelHeading
                detail="Active products and active prices from the verified account"
                eyebrow="Live provider read"
                title="Products"
              />
              <a
                className="inline-flex min-h-10 items-center gap-2 text-xs font-medium text-[#70583e] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#70583e]"
                href={`${stripeOverview.dashboardBaseUrl}/products`}
                rel="noreferrer"
                target="_blank"
              >
                Edit in Stripe
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </div>

            {stripeOverview.catalog.status === "unavailable" ? (
              <div className="mt-4">
                <EmptyState
                  description="The account is verified, but this key cannot currently read both products and prices. Manage the catalog in Stripe."
                  icon={AlertCircle}
                  title="Catalog read unavailable"
                />
              </div>
            ) : stripeOverview.catalog.items.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  description="Stripe returned no active products for this verified account and mode."
                  icon={PackageOpen}
                  title="No active products"
                />
              </div>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[680px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#d9d3c8] text-[9px] font-semibold tracking-[0.16em] text-[#6b736b] uppercase">
                      <th className="px-3 py-4">Product</th>
                      <th className="px-3 py-4">Price</th>
                      <th className="px-3 py-4">Billing</th>
                      <th className="px-3 py-4">Provider status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stripeOverview.catalog.items.flatMap((product) =>
                      product.prices.length ? (
                        product.prices.map((price) => (
                          <tr
                            className="border-b border-[#e0dbd1] last:border-0"
                            key={price.id}
                          >
                            <td className="px-3 py-4">
                              <p className="text-sm font-medium text-[#354039]">
                                {product.name}
                              </p>
                              <p className="mt-1 font-mono text-[10px] text-[#667068]">
                                {product.id}
                              </p>
                            </td>
                            <td className="px-3 py-4 font-serif text-lg text-[#273029]">
                              {price.unitAmount === null
                                ? "Custom"
                                : money(price.unitAmount, price.currency)}
                            </td>
                            <td className="px-3 py-4 text-sm text-[#59645b]">
                              {price.cadence}
                            </td>
                            <td className="px-3 py-4">
                              <StatusPill tone="positive">Active</StatusPill>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr
                          className="border-b border-[#e0dbd1] last:border-0"
                          key={product.id}
                        >
                          <td className="px-3 py-4 text-sm font-medium text-[#354039]">
                            {product.name}
                          </td>
                          <td className="px-3 py-4 text-sm text-[#59645b]">
                            —
                          </td>
                          <td className="px-3 py-4 text-sm text-[#59645b]">
                            No active price
                          </td>
                          <td className="px-3 py-4">
                            <StatusPill tone="warning">Needs price</StatusPill>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </AdminPanel>

      {stripeOverview.status === "ready" && (
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <AdminPanel>
            <div className="flex items-end justify-between gap-3 border-b border-[#d9d3c8] pb-5">
              <PanelHeading
                detail="Eight most recent records · no customer or card data"
                eyebrow="Read only"
                title="Recent payments"
              />
              <a
                className="inline-flex min-h-10 shrink-0 items-center gap-2 text-xs font-medium text-[#70583e] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#70583e]"
                href={`${stripeOverview.dashboardBaseUrl}/payments`}
                rel="noreferrer"
                target="_blank"
              >
                Manage
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </div>
            {stripeOverview.payments.status === "unavailable" ? (
              <div className="mt-5">
                <EmptyState
                  description="The verified key cannot currently read payment summaries. Open Stripe to review the full ledger."
                  icon={AlertCircle}
                  title="Payment read unavailable"
                />
              </div>
            ) : stripeOverview.payments.items.length === 0 ? (
              <div className="mt-5">
                <EmptyState
                  description="No PaymentIntent records were returned for this account and mode."
                  icon={CreditCard}
                  title="No recent payments"
                />
              </div>
            ) : (
              <ul className="mt-3 divide-y divide-[#e0dbd1]">
                {stripeOverview.payments.items.map((payment) => (
                  <li
                    className="flex items-center justify-between gap-4 px-1 py-3"
                    key={payment.id}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#354039]">
                        {money(payment.amount, payment.currency)}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-[#667068]">
                        {payment.id.slice(0, 18)}… · {date(payment.created)}
                      </p>
                    </div>
                    <StatusPill
                      tone={
                        payment.status === "succeeded" ? "positive" : "warning"
                      }
                    >
                      {readableStatus(payment.status)}
                    </StatusPill>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>

          <AdminPanel>
            <div className="flex items-end justify-between gap-3 border-b border-[#d9d3c8] pb-5">
              <PanelHeading
                detail="Eight most recent records · no customer or card data"
                eyebrow="Read only"
                title="Recent invoices"
              />
              <a
                className="inline-flex min-h-10 shrink-0 items-center gap-2 text-xs font-medium text-[#70583e] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#70583e]"
                href={`${stripeOverview.dashboardBaseUrl}/invoices`}
                rel="noreferrer"
                target="_blank"
              >
                Manage
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </div>
            {stripeOverview.invoices.status === "unavailable" ? (
              <div className="mt-5">
                <EmptyState
                  description="The verified key cannot currently read invoice summaries. Open Stripe to create or review invoices."
                  icon={AlertCircle}
                  title="Invoice read unavailable"
                />
              </div>
            ) : stripeOverview.invoices.items.length === 0 ? (
              <div className="mt-5">
                <EmptyState
                  description="No invoice records were returned for this account and mode."
                  icon={ReceiptText}
                  title="No recent invoices"
                />
              </div>
            ) : (
              <ul className="mt-3 divide-y divide-[#e0dbd1]">
                {stripeOverview.invoices.items.map((invoice) => (
                  <li
                    className="flex items-center justify-between gap-4 px-1 py-3"
                    key={invoice.id}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#354039]">
                        {money(invoice.amount, invoice.currency)}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-[#667068]">
                        {invoice.id.slice(0, 18)}… · {date(invoice.created)}
                      </p>
                    </div>
                    <StatusPill
                      tone={invoice.status === "paid" ? "positive" : "warning"}
                    >
                      {readableStatus(invoice.status)}
                    </StatusPill>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>
        </div>
      )}

      <AdminPanel className="mt-5">
        <div className="flex flex-col justify-between gap-3 border-b border-[#d9d3c8] pb-5 sm:flex-row sm:items-center">
          <PanelHeading
            detail="Durable webhook and checkout recovery — read only"
            eyebrow="Payment operations"
            title="Reconciliation queue"
          />
          {reconciliation.status === "ready" && (
            <StatusPill tone={manualReviewCount ? "warning" : "positive"}>
              {manualReviewCount
                ? `${manualReviewCount} need manual review`
                : "No manual review alerts"}
            </StatusPill>
          )}
        </div>

        {reconciliation.status === "local_preview" ? (
          <div className="mt-5">
            <EmptyState
              description="The signed local design preview cannot read hosted payment operations. Sign in as a verified Supabase administrator to inspect the queue."
              icon={RefreshCw}
              title="Operational queue stays private"
            />
          </div>
        ) : reconciliation.status === "not_configured" ? (
          <div className="mt-5">
            <EmptyState
              description="The exact deployment, Stripe account, mode, and Supabase administrator connection must all be configured before queue status can be read."
              icon={RefreshCw}
              title="Recovery boundary is not configured"
            />
          </div>
        ) : reconciliation.status === "unavailable" ? (
          <div className="mt-5">
            <EmptyState
              description="Queue status could not be read safely. No cached or sample substitute is shown; checkout remains governed by the fail-closed payment boundary."
              icon={AlertCircle}
              title="Recovery status is temporarily unavailable"
            />
          </div>
        ) : reconciliationJobs.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              description="No Checkout Session has entered the durable recovery queue in this environment."
              icon={RefreshCw}
              title="No reconciliation work"
            />
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[#f4efe7]/75 px-4 py-3">
                <p className="text-[9px] font-semibold tracking-[0.15em] text-[#858b84] uppercase">
                  Recovering
                </p>
                <p className="mt-1 font-serif text-2xl">{recoveryCount}</p>
              </div>
              <div className="rounded-xl bg-[#f4efe7]/75 px-4 py-3">
                <p className="text-[9px] font-semibold tracking-[0.15em] text-[#858b84] uppercase">
                  Monitoring
                </p>
                <p className="mt-1 font-serif text-2xl">{monitoringCount}</p>
              </div>
              <div className="rounded-xl bg-[#f4efe7]/75 px-4 py-3">
                <p className="text-[9px] font-semibold tracking-[0.15em] text-[#858b84] uppercase">
                  Manual review
                </p>
                <p className="mt-1 font-serif text-2xl">{manualReviewCount}</p>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#d9d3c8] text-[9px] font-semibold tracking-[0.16em] text-[#868d86] uppercase">
                    <th className="px-3 py-4">Order reference</th>
                    <th className="px-3 py-4">State</th>
                    <th className="px-3 py-4">Claims</th>
                    <th className="px-3 py-4">Last outcome</th>
                    <th className="px-3 py-4">Machine reason</th>
                  </tr>
                </thead>
                <tbody>
                  {reconciliationJobs.map((job) => (
                    <tr
                      className="border-b border-[#e0dbd1] last:border-0"
                      key={job.order_id}
                    >
                      <td className="px-3 py-4 font-mono text-xs text-[#59645b]">
                        {job.order_id.slice(0, 8)}
                      </td>
                      <td className="px-3 py-4">
                        <StatusPill
                          tone={
                            job.state === "manual_review"
                              ? "warning"
                              : job.state === "monitoring" ||
                                  job.state === "complete"
                                ? "positive"
                                : "quiet"
                          }
                        >
                          {job.state.replace("_", " ")}
                        </StatusPill>
                      </td>
                      <td className="px-3 py-4 text-sm text-[#687168]">
                        {job.claim_count}
                      </td>
                      <td className="px-3 py-4 text-sm text-[#687168]">
                        {job.last_outcome?.replaceAll("_", " ") ?? "—"}
                      </td>
                      <td className="px-3 py-4 text-sm text-[#687168]">
                        {(
                          job.manual_review_reason ?? job.last_error_code
                        )?.replaceAll("_", " ") ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </AdminPanel>

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <AdminPanel>
          <PanelHeading
            detail="What Shannon can do from this workspace"
            eyebrow="Clear ownership"
            title="HWL + Stripe"
          />
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[#ddd7cd] pb-3">
              <span className="text-sm text-[#5d675e]">
                See products and prices
              </span>
              <StatusPill
                tone={
                  stripeOverview.status === "ready" ? "positive" : "warning"
                }
              >
                {stripeOverview.status === "ready" ? "In HWL" : "Waiting"}
              </StatusPill>
            </div>
            <div className="flex items-center justify-between border-b border-[#ddd7cd] pb-3">
              <span className="text-sm text-[#5d675e]">
                See recent money activity
              </span>
              <StatusPill
                tone={
                  stripeOverview.status === "ready" ? "positive" : "warning"
                }
              >
                {stripeOverview.status === "ready" ? "In HWL" : "Waiting"}
              </StatusPill>
            </div>
            <div className="flex items-center justify-between border-b border-[#ddd7cd] pb-3">
              <span className="text-sm text-[#5d675e]">
                Edit, refund, invoice, payout
              </span>
              <StatusPill tone="quiet">In Stripe</StatusPill>
            </div>
            <p className="text-xs leading-5 text-[#59645b]">
              HWL is a calm operational window. Stripe remains the money system
              of record and provides the audited controls for catalog edits,
              refunds, disputes, invoices, taxes, bank details, and payouts.
            </p>
          </div>
        </AdminPanel>

        <AdminPanel>
          <PanelHeading
            detail="Booking first, payment after Shannon completes the appointment."
            eyebrow="Service payments"
            title="Post-session invoices"
          />
          <div className="mt-5 rounded-2xl border border-[#ddd7cd] bg-white/25 p-5">
            <div className="flex gap-3">
              <ReceiptText
                className="mt-0.5 size-4 shrink-0 text-[#876947]"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-medium text-[#455047]">
                  Create and send from Stripe
                </p>
                <p className="mt-1 text-xs leading-5 text-[#59645b]">
                  Automatic post-appointment invoicing is not active yet. For
                  launch, Shannon sends the invoice or payment link after the
                  service is complete, then Stripe retains the payment record.
                </p>
                {dashboardBaseUrl && (
                  <a
                    className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-[#cfc5b6] bg-white/65 px-4 text-xs font-medium text-[#5f503f] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5f503f]"
                    href={`${dashboardBaseUrl}/invoices`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open Stripe invoices
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </AdminPanel>
      </div>
    </>
  )
}
