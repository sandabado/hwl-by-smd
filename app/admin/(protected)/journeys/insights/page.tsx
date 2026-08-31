import {
  CalendarPlus,
  Clock3,
  Download,
  HeartHandshake,
  MessageCircle,
  Sparkles,
  Star,
  UsersRound,
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
import { JourneySubnav } from "@/components/admin/journey-subnav"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

const dailyCare = [
  { day: "Mon", replies: 42, bookings: 12 },
  { day: "Tue", replies: 66, bookings: 28 },
  { day: "Wed", replies: 51, bookings: 18 },
  { day: "Thu", replies: 78, bookings: 35 },
  { day: "Fri", replies: 58, bookings: 24 },
  { day: "Sat", replies: 34, bookings: 8 },
  { day: "Sun", replies: 26, bookings: 5 },
] as const

export default async function AdminJourneyInsightsPage() {
  await requireAdmin()

  return (
    <>
      <AdminPageHeader
        description="Notice trust, responsiveness, continuity, and the moments when care naturally becomes a booking."
        eyebrow="Relationship health"
        title="Journey insights"
      >
        <ReadOnlyButton>
          <Download className="mr-2 inline size-3.5" aria-hidden="true" />
          Export activity
        </ReadOnlyButton>
      </AdminPageHeader>

      <JourneySubnav current="insights" />

      <div className="mt-4 grid gap-4 sm:grid-cols-2 2xl:grid-cols-5">
        <MetricCard
          icon={MessageCircle}
          label="Reply rate"
          note="Members who answer"
          tone="#8b6c79"
          value="49%"
        />
        <MetricCard
          icon={Clock3}
          label="Response time"
          note="Goal · under 12h"
          tone="#6d7d85"
          value="4.2h"
        />
        <MetricCard
          icon={UsersRound}
          label="90-day continuity"
          note="Illustrative member presence"
          tone="#6e806b"
          value="82%"
        />
        <MetricCard
          icon={CalendarPlus}
          label="Dialogue bookings"
          note="Eight this month"
          tone="#a37c51"
          value="$1,264"
        />
        <MetricCard
          icon={Star}
          label="Member reflection"
          note="Post-journey sample"
          tone="#a37c51"
          value="4.8"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <AdminPanel>
          <div className="flex items-start justify-between gap-3">
            <PanelHeading
              detail="Sample replies and relationship-led bookings"
              eyebrow="Care rhythm"
              title="Where dialogue deepens"
            />
            <PreviewPill />
          </div>
          <div
            aria-label="Illustrative daily replies and bookings"
            className="mt-8 flex h-64 items-end gap-4 border-b border-[#d8d1c5]"
            role="img"
          >
            {dailyCare.map((item) => (
              <div
                className="flex h-full min-w-0 flex-1 flex-col justify-end"
                key={item.day}
              >
                <div className="flex flex-1 items-end justify-center gap-1">
                  <div
                    className="w-2/5 rounded-t-lg bg-[#8b6c79]/70"
                    style={{ height: `${item.replies}%` }}
                    title={`${item.day}: sample replies`}
                  />
                  <div
                    className="w-2/5 rounded-t-lg bg-[#6e806b]/65"
                    style={{ height: `${item.bookings}%` }}
                    title={`${item.day}: sample bookings`}
                  />
                </div>
                <span className="py-3 text-center text-[9px] text-[#858c85]">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-5 text-[10px] text-[#747d74]">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#8b6c79]" />
              Replies
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#6e806b]" />
              Bookings from dialogue
            </span>
          </div>
        </AdminPanel>

        <AdminPanel>
          <div className="flex items-center justify-between gap-3">
            <PanelHeading
              detail="Summer Skin Reset · sample circle"
              eyebrow="Participation"
              title="Relationship circle"
            />
            <HeartHandshake
              className="size-4 text-[#8b6c79]"
              aria-hidden="true"
            />
          </div>
          <div className="mt-7 space-y-5">
            {[
              ["Joined", 47, 100, "neutral"],
              ["Practicing", 39, 83, "positive"],
              ["Replied", 23, 49, "quiet"],
              ["Booked", 8, 17, "warning"],
            ].map(([label, count, width, tone]) => (
              <div key={String(label)}>
                <div className="flex items-center justify-between text-xs text-[#647064]">
                  <span>{label}</span>
                  <span>{count}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#ddd7cd]">
                  <div
                    className="h-full rounded-full bg-[#8b7256]"
                    style={{ width: `${width}%` }}
                  />
                </div>
                <div className="sr-only">
                  <StatusPill
                    tone={tone as "neutral" | "positive" | "quiet" | "warning"}
                  >
                    {width} percent
                  </StatusPill>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs leading-5 text-[#747d74]">
            Participation can deepen through practice, replies, rest, or a
            booking. Each is a valid expression of trust.
          </p>
        </AdminPanel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <AdminPanel>
          <PanelHeading
            detail="Sample purchase context"
            eyebrow="Library makeup"
            title="Who is participating"
          />
          <div className="mt-6 space-y-4">
            {[["LIFT — Video + PDF", "100%", "#6e806b"]].map(
              ([label, value, color]) => (
                <div className="flex items-center justify-between" key={label}>
                  <span className="flex items-center gap-2 text-sm text-[#5c675d]">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {label}
                  </span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              )
            )}
          </div>
        </AdminPanel>

        <AdminPanel className="bg-[#273029] text-white">
          <div className="flex items-start gap-4">
            <Sparkles
              className="mt-1 size-4 shrink-0 text-[#c9ae88]"
              aria-hidden="true"
            />
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[#c9ae88] uppercase">
                Consent-led insight
              </p>
              <h2 className="mt-2 text-3xl text-white">
                Count what helps Shannon care.
              </h2>
              <p className="mt-3 max-w-2xl text-xs leading-5 text-white/48">
                Individual activity logs remain unavailable in this preview.
                Production reporting should collect only what members consent to
                share, retain it briefly, and keep member vulnerability private
                and outside commercial reporting.
              </p>
            </div>
          </div>
        </AdminPanel>
      </div>
    </>
  )
}
