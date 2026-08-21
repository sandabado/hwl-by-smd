import { BadgePercent, PackageOpen, Plus, ShoppingBag } from "lucide-react"
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
import { requireAdmin } from "@/lib/admin-auth"
import { isStripeConfigured } from "@/lib/env"

export const dynamic = "force-dynamic"

const priceKeys = [
  process.env.STRIPE_PDF_PRICE_ID,
  process.env.STRIPE_LIFT_GUIDE_PRICE_ID,
  process.env.STRIPE_MEMBERSHIP_PRICE_ID,
]

const present = (value: string | undefined) =>
  Boolean(value && !value.startsWith("your_"))

export default async function AdminStorePage() {
  await requireAdmin()
  const stripeReady = isStripeConfigured()

  return (
    <>
      <AdminPageHeader
        description="The three offers stay focused: a printable ritual, the complete guided practice, and the private member sanctuary."
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
              <p className="text-xs text-[#7d847c]">
                Three defined launch offers
              </p>
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
              {adminProducts.map((product, index) => {
                const priceConfigured = stripeReady && present(priceKeys[index])
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
                        {priceConfigured ? "Price ID present" : product.status}
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
                {stripeReady ? "Configured" : "Waiting"}
              </StatusPill>
            </div>
            <div className="flex items-center justify-between border-b border-[#ddd7cd] pb-3">
              <span className="text-sm text-[#5d675e]">Price IDs</span>
              <StatusPill
                tone={priceKeys.every(present) ? "positive" : "warning"}
              >
                {priceKeys.filter(present).length} of 3
              </StatusPill>
            </div>
            <p className="text-xs leading-5 text-[#7a827a]">
              Secret values are never rendered. This panel reports only whether
              the expected configuration is present. Checkout independently
              verifies each Stripe Price amount, currency, and billing cadence
              before it can open.
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
