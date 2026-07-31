import {
  CircleDollarSign,
  Download,
  Landmark,
  ReceiptText,
  RotateCcw,
} from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  EmptyState,
  MetricCard,
  PanelHeading,
  PreviewPill,
  ReadOnlyButton,
  StatusPill,
} from "@/components/admin/admin-ui"
import { adminTransactions } from "@/lib/admin-preview-data"
import { requireAdmin } from "@/lib/admin-auth"
import { isStripeConfigured } from "@/lib/env"

export const dynamic = "force-dynamic"

const months = [
  { label: "Aug", value: 25 },
  { label: "Sep", value: 30 },
  { label: "Oct", value: 36 },
  { label: "Nov", value: 32 },
  { label: "Dec", value: 45 },
  { label: "Jan", value: 49 },
  { label: "Feb", value: 43 },
  { label: "Mar", value: 54 },
  { label: "Apr", value: 62 },
  { label: "May", value: 68 },
  { label: "Jun", value: 77 },
  { label: "Jul", value: 92 },
] as const

export default async function AdminRevenuePage() {
  await requireAdmin()
  const stripeConnected = isStripeConfigured()

  return (
    <>
      <AdminPageHeader
        description="Follow recurring membership and one-time ritual purchases without losing the human scale of the business."
        eyebrow="Financial rhythm"
        title="Revenue"
      >
        <ReadOnlyButton>
          <Download className="mr-2 inline size-3.5" aria-hidden="true" />
          Export CSV
        </ReadOnlyButton>
      </AdminPageHeader>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <MetricCard
          icon={CircleDollarSign}
          label="This month"
          note="Illustrative revenue"
          value="$2,847"
        />
        <MetricCard
          icon={ReceiptText}
          label="Last month"
          note="Illustrative revenue"
          tone="#6e806b"
          value="$2,331"
        />
        <MetricCard
          icon={Landmark}
          label="Year to date"
          note="Illustrative revenue"
          tone="#8b6c79"
          value="$14,920"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <AdminPanel>
          <div className="flex items-start justify-between gap-3">
            <PanelHeading
              detail="Twelve-month sample view"
              eyebrow="Monthly revenue"
              title="Growth over time"
            />
            <PreviewPill label="Illustrative" />
          </div>
          <div
            aria-label="Illustrative monthly revenue bar chart"
            className="mt-8 flex h-64 items-end gap-2 border-b border-[#d8d1c5]"
            role="img"
          >
            {months.map(({ label, value }) => (
              <div
                className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2"
                key={label}
              >
                <div
                  className="min-h-2 rounded-t-lg bg-[#89725a]"
                  style={{ height: `${value}%`, opacity: 0.35 + value / 150 }}
                />
                <span className="pb-2 text-center text-[8px] text-[#868d86]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel>
          <PanelHeading
            detail="Illustrative product mix"
            eyebrow="By product"
            title="How revenue arrives"
          />
          <div className="mt-7 flex flex-col items-center gap-7 sm:flex-row xl:flex-col">
            <div
              aria-label="Sample revenue mix: 58 percent membership, 29 percent LIFT guide, 13 percent PDF"
              className="grid size-44 shrink-0 place-items-center rounded-full"
              role="img"
              style={{
                background:
                  "conic-gradient(#6e806b 0 58%, #9d8464 58% 87%, #c9bca8 87% 100%)",
              }}
            >
              <div className="grid size-28 place-items-center rounded-full bg-[#f2ede4] text-center">
                <div>
                  <p className="font-serif text-3xl">58%</p>
                  <p className="text-[9px] tracking-[0.15em] text-[#7e867e] uppercase">
                    Recurring
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full space-y-3 text-xs text-[#697369]">
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#6e806b]" />
                  The Den
                </span>
                <span>58%</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#9d8464]" />
                  LIFT Guide
                </span>
                <span>29%</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#c9bca8]" />
                  LIFT PDF
                </span>
                <span>13%</span>
              </div>
            </div>
          </div>
        </AdminPanel>
      </div>

      <AdminPanel className="mt-5">
        <div className="flex flex-col justify-between gap-3 border-b border-[#d9d3c8] pb-5 sm:flex-row sm:items-center">
          <PanelHeading
            detail="Sample records — no live payment data is displayed"
            eyebrow="Ledger"
            title="Transactions"
          />
          <div className="flex gap-2">
            <ReadOnlyButton compact>Date range</ReadOnlyButton>
            <ReadOnlyButton compact>Product</ReadOnlyButton>
            <PreviewPill />
          </div>
        </div>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#d9d3c8] text-[9px] font-semibold tracking-[0.16em] text-[#868d86] uppercase">
                <th className="px-3 py-4">Date</th>
                <th className="px-3 py-4">Customer</th>
                <th className="px-3 py-4">Product</th>
                <th className="px-3 py-4">Amount</th>
                <th className="px-3 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {adminTransactions.map((transaction) => (
                <tr
                  className="border-b border-[#e0dbd1] last:border-0"
                  key={transaction.id}
                >
                  <td className="px-3 py-4 text-sm text-[#707970]">
                    {transaction.date}
                  </td>
                  <td className="px-3 py-4 text-sm font-medium">
                    {transaction.customer}
                  </td>
                  <td className="px-3 py-4 text-sm text-[#566158]">
                    {transaction.product}
                  </td>
                  <td className="px-3 py-4 text-sm font-medium">
                    {transaction.amount}
                  </td>
                  <td className="px-3 py-4">
                    <StatusPill tone="positive">
                      {transaction.status}
                    </StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <AdminPanel>
          <PanelHeading
            detail="Stripe determines actual payout timing."
            eyebrow="Payouts"
            title="Bank settlement"
          />
          <div className="mt-5">
            <EmptyState
              description={
                stripeConnected
                  ? "Stripe configuration is present, but this preview does not request live payout data."
                  : "Connect the production Stripe account to display verified payout timing."
              }
              icon={Landmark}
              title={
                stripeConnected
                  ? "Live data intentionally off"
                  : "Stripe is waiting"
              }
            />
          </div>
        </AdminPanel>
        <AdminPanel>
          <PanelHeading
            detail="Refunds require an authenticated, audited server action."
            eyebrow="Refund management"
            title="Protected by design"
          />
          <div className="mt-5">
            <EmptyState
              description="No refund control is exposed in this read-only build. This prevents a preview interaction from changing a real payment."
              icon={RotateCcw}
              title="No preview actions"
            />
          </div>
        </AdminPanel>
      </div>
    </>
  )
}
