import {
  AlertCircle,
  BadgePercent,
  PackageOpen,
  Plus,
  RefreshCw,
  ShoppingBag,
} from "lucide-react"
import Link from "next/link"

import {
  AdminPageHeader,
  AdminPanel,
  EmptyState,
  PanelHeading,
  PreviewPill,
  ReadOnlyButton,
  StatusPill,
} from "@/components/admin/admin-ui"
import { adminProducts } from "@/lib/admin-preview-data"
import { getAdminReconciliationStatus } from "@/lib/commerce/admin-reconciliation"
import { requireAdmin } from "@/lib/admin-auth"
import { isStripeConfigured } from "@/lib/env"

export const dynamic = "force-dynamic"

const launchPrice = process.env.STRIPE_LIFT_GUIDE_PRICE_ID

const present = (value: string | undefined) =>
  Boolean(value && !value.startsWith("your_"))

export default async function AdminStorePage() {
  await requireAdmin()
  const reconciliation = await getAdminReconciliationStatus()
  const stripeReady = isStripeConfigured()
  const priceConfigured = stripeReady && present(launchPrice)
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
        description="LIFT launches as one $11.11 product containing the complete guided video and downloadable PDF. No PDF-only or membership checkout is offered."
        eyebrow="Commerce"
        title="Store"
      >
        <ReadOnlyButton>
          <Plus className="mr-2 inline size-3.5" aria-hidden="true" />
          Create product
        </ReadOnlyButton>
      </AdminPageHeader>

      <AdminPanel className="mt-8">
        <div className="flex flex-col justify-between gap-3 border-b border-[#d9d3c8] pb-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-[#9d8464]/10 text-[#876947]">
              <ShoppingBag className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium">Product catalog</p>
              <p className="text-xs text-[#7d847c]">One launch product</p>
            </div>
          </div>
          <PreviewPill />
        </div>

        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#d9d3c8] text-[9px] font-semibold tracking-[0.16em] text-[#868d86] uppercase">
                <th className="px-3 py-4">Product</th>
                <th className="px-3 py-4">Price</th>
                <th className="px-3 py-4">Type</th>
                <th className="px-3 py-4">Access</th>
                <th className="px-3 py-4">Stripe sync</th>
                <th className="px-3 py-4">Sales</th>
                <th className="px-3 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {adminProducts.map((product) => {
                return (
                  <tr
                    className="border-b border-[#e0dbd1] last:border-0"
                    key={product.id}
                  >
                    <td className="px-3 py-4">
                      <p className="text-sm font-medium">{product.name}</p>
                    </td>
                    <td className="px-3 py-4 font-serif text-lg">
                      {product.price}
                    </td>
                    <td className="px-3 py-4 text-sm text-[#687168]">
                      {product.cadence}
                    </td>
                    <td className="max-w-xs px-3 py-4 text-sm text-[#687168]">
                      {product.access}
                    </td>
                    <td className="px-3 py-4">
                      <StatusPill tone={priceConfigured ? "quiet" : "warning"}>
                        {priceConfigured
                          ? "Values present · unverified"
                          : product.status}
                      </StatusPill>
                    </td>
                    <td className="px-3 py-4 text-sm text-[#7b837b]">
                      {product.sales}
                    </td>
                    <td className="px-3 py-4 text-right">
                      <Link
                        className="text-xs font-medium text-[#876947] underline-offset-4 hover:underline"
                        href={`/admin/store/${product.id}`}
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </AdminPanel>

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
                      <td className="px-3 py-4 font-mono text-xs text-[#707970]">
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
            detail="Read-only connection status"
            eyebrow="Stripe"
            title="Catalog sync"
          />
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[#ddd7cd] pb-3">
              <span className="text-sm text-[#5d675e]">Account keys</span>
              <StatusPill tone={stripeReady ? "positive" : "warning"}>
                {stripeReady ? "Values present" : "Waiting"}
              </StatusPill>
            </div>
            <div className="flex items-center justify-between border-b border-[#ddd7cd] pb-3">
              <span className="text-sm text-[#5d675e]">Price IDs</span>
              <StatusPill tone={priceConfigured ? "positive" : "warning"}>
                {priceConfigured ? "1 of 1" : "0 of 1"}
              </StatusPill>
            </div>
            <p className="text-xs leading-5 text-[#7a827a]">
              Secret values are never rendered. This panel reports only whether
              the expected configuration is present, not whether Stripe has
              accepted it. Checkout independently verifies the launch Price,
              account profile, private asset, currency, and amount before it can
              open.
            </p>
          </div>
        </AdminPanel>

        <AdminPanel>
          <div className="flex items-center justify-between gap-3">
            <PanelHeading
              detail="Codes, limits, and expiry"
              eyebrow="Promotions"
              title="Discount codes"
            />
            <ReadOnlyButton compact>
              <BadgePercent
                className="mr-1 inline size-3.5"
                aria-hidden="true"
              />
              New code
            </ReadOnlyButton>
          </div>
          <div className="mt-5">
            <EmptyState
              description="No codes are invented for the preview. Production codes will be created through an authenticated Stripe workflow with clear limits and expiry."
              icon={PackageOpen}
              title="No active discount codes"
            />
          </div>
        </AdminPanel>
      </div>
    </>
  )
}
