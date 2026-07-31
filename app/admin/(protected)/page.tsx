import Link from "next/link"
import {
  CalendarCheck,
  CalendarDays,
  Clock3,
  FileText,
  HeartHandshake,
  Mail,
  MessageCircle,
  Plus,
  ShoppingBag,
  Tag,
  TrendingUp,
  UserPlus,
  Video,
} from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  MetricCard,
  PanelHeading,
  PreviewPill,
  ReadOnlyButton,
  StatusPill,
} from "@/components/admin/admin-ui"
import { adminBookings, adminTransactions } from "@/lib/admin-preview-data"
import { requireAdmin } from "@/lib/admin-auth"
import { isStripeConfigured, isSupabaseAdminConfigured } from "@/lib/env"

export const dynamic = "force-dynamic"

const monthlyRevenue = [
  { month: "Feb", value: 33 },
  { month: "Mar", value: 48 },
  { month: "Apr", value: 41 },
  { month: "May", value: 64 },
  { month: "Jun", value: 72 },
  { month: "Jul", value: 88 },
]

const activity = [
  {
    icon: UserPlus,
    title: "New member",
    detail: "Maya Chen joined The Den",
    ago: "14m",
  },
  {
    icon: ShoppingBag,
    title: "LIFT purchase",
    detail: "Elena Brooks · Video + PDF",
    ago: "42m",
  },
  {
    icon: CalendarCheck,
    title: "New booking",
    detail: "Private sound bath · four guests",
    ago: "2h",
  },
  {
    icon: MessageCircle,
    title: "Private message",
    detail: "Nora shared a session reflection",
    ago: "4h",
  },
] as const

const quickActions = [
  { icon: Video, label: "Upload video" },
  { icon: FileText, label: "Add article" },
  { icon: Tag, label: "Add resource" },
  { icon: Mail, label: "Write member note" },
  { icon: CalendarDays, label: "Block calendar" },
] as const

function ConnectionRow({
  label,
  connected,
}: {
  label: string
  connected: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#dad4c8] py-3 last:border-0">
      <span className="text-sm text-[#4e5950]">{label}</span>
      <StatusPill tone={connected ? "positive" : "warning"}>
        {connected ? "Configured" : "Waiting"}
      </StatusPill>
    </div>
  )
}

export default async function AdminOverviewPage() {
  await requireAdmin()

  const today = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(new Date())
  const muxConnected = Boolean(
    process.env.MUX_ACCESS_TOKEN &&
    process.env.MUX_SECRET_KEY &&
    process.env.MUX_SIGNING_KEY_ID &&
    process.env.MUX_PRIVATE_KEY
  )
  const resendConnected = Boolean(process.env.RESEND_API_KEY)

  return (
    <>
      <AdminPageHeader
        description="A quiet view of the relationships inside your practice and what needs your human attention next."
        eyebrow={today}
        title="Welcome back, Shannon."
      >
        <PreviewPill />
        <Link
          className="inline-flex min-h-10 items-center rounded-full bg-[#273029] px-4 text-xs font-medium text-white transition hover:bg-[#4f5d52]"
          href="/admin/connection"
        >
          Open Connection
        </Link>
      </AdminPageHeader>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <MetricCard
          icon={HeartHandshake}
          label="Active relationships"
          note="Illustrative care circle"
          tone="#8b6c79"
          value="147"
        />
        <MetricCard
          icon={MessageCircle}
          label="Awaiting reply"
          note="Sample human-attention queue"
          tone="#a9554e"
          value="23"
        />
        <MetricCard
          icon={Clock3}
          label="Average response"
          note="Care goal · under 12 hours"
          tone="#6d7d85"
          value="8.5h"
        />
        <MetricCard
          icon={CalendarCheck}
          label="Dialogue bookings"
          note="From conversation · illustrative"
          tone="#6e806b"
          value="12"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <AdminPanel>
          <div className="flex items-start justify-between gap-4">
            <PanelHeading
              detail="Six-month sample visualization"
              eyebrow="Revenue"
              title="A gentle upward rhythm"
            />
            <PreviewPill label="Illustrative" />
          </div>
          <div
            aria-label="Sample monthly revenue increased from February through July"
            className="mt-8 flex h-56 items-end gap-3 border-b border-[#d8d1c5] px-2"
            role="img"
          >
            {monthlyRevenue.map(({ month, value }) => (
              <div
                className="flex h-full flex-1 flex-col justify-end gap-3"
                key={month}
              >
                <div
                  className="min-h-3 rounded-t-xl bg-gradient-to-t from-[#786755] to-[#c9ae88]"
                  style={{ height: `${value}%` }}
                />
                <span className="pb-3 text-center text-[10px] text-[#818981]">
                  {month}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-[#647063]">
            <TrendingUp className="size-3.5" aria-hidden="true" />
            Sample data shows the intended reporting experience. Live totals
            will come from Stripe.
          </div>
        </AdminPanel>

        <AdminPanel>
          <div className="flex items-start justify-between gap-3">
            <PanelHeading eyebrow="Today" title="Your schedule" />
            <Link
              className="text-xs font-medium text-[#8b6d4b] underline-offset-4 hover:underline"
              href="/admin/calendar"
            >
              Full calendar
            </Link>
          </div>
          <div className="mt-4 divide-y divide-[#d9d3c8]">
            {adminBookings.slice(0, 3).map((booking) => (
              <div
                className="grid grid-cols-[72px_1fr] gap-3 py-4"
                key={booking.id}
              >
                <p className="font-serif text-lg text-[#273029]">
                  {booking.time.replace(" ", "\u00a0")}
                </p>
                <div>
                  <p className="text-sm font-medium">{booking.service}</p>
                  <p className="mt-1 text-xs text-[#7d847c]">
                    {booking.client} · {booking.duration}
                  </p>
                  <div className="mt-2">
                    <StatusPill tone="positive">{booking.status}</StatusPill>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.7fr]">
        <AdminPanel>
          <PanelHeading
            detail="Recent sample events across membership, commerce, and care."
            eyebrow="In motion"
            title="Recent activity"
          />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {activity.map(({ ago, detail, icon: Icon, title }) => (
              <div className="flex gap-3" key={`${title}-${detail}`}>
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#273029]/6 text-[#5b685e]">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-medium">{title}</p>
                    <span className="text-[10px] text-[#9a9f99]">{ago}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#7b837b]">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel>
          <PanelHeading
            detail="Configuration presence only — no secret values are shown."
            eyebrow="Foundation"
            title="Connection health"
          />
          <div className="mt-4">
            <ConnectionRow
              connected={isSupabaseAdminConfigured()}
              label="Supabase"
            />
            <ConnectionRow connected={isStripeConfigured()} label="Stripe" />
            <ConnectionRow connected={muxConnected} label="Mux" />
            <ConnectionRow connected={resendConnected} label="Resend" />
          </div>
          <Link
            className="mt-4 inline-flex text-xs font-medium text-[#8b6d4b] underline-offset-4 hover:underline"
            href="/admin/settings#integrations"
          >
            Review integrations
          </Link>
        </AdminPanel>
      </div>

      <AdminPanel className="mt-5 bg-[#273029] text-white">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#c9ae88] uppercase">
              Quick actions
            </p>
            <h2 className="mt-1 text-3xl text-white">When you are ready.</h2>
            <p className="mt-2 max-w-xl text-xs leading-5 text-white/45">
              These controls stay intentionally disabled in the preview. They
              will activate only after secure production permissions and write
              workflows are implemented.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map(({ icon: Icon, label }) => (
              <button
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2.5 text-xs text-white/45"
                disabled
                key={label}
                title="Preview only"
                type="button"
              >
                <Plus className="size-3" aria-hidden="true" />
                <Icon className="size-3.5" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </AdminPanel>

      <div className="mt-5 flex justify-end">
        <ReadOnlyButton compact>
          {adminTransactions.length} sample transactions
        </ReadOnlyButton>
      </div>
    </>
  )
}
