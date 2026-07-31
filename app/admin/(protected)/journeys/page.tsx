import Link from "next/link"
import {
  ArrowRight,
  CirclePause,
  HeartHandshake,
  MessageCircle,
  Milestone,
  Plus,
  Sparkles,
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
import { adminJourneys } from "@/lib/admin-preview-data"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export default async function AdminJourneysPage() {
  await requireAdmin()

  return (
    <>
      <AdminPageHeader
        description="Human-paced guidance built around milestones, replies, and intentional moments of personal care."
        eyebrow="Relational journeys"
        title="Journeys"
      >
        <ReadOnlyButton>
          <Plus className="mr-2 inline size-3.5" aria-hidden="true" />
          Create journey
        </ReadOnlyButton>
        <Link
          className="inline-flex min-h-10 items-center rounded-full bg-[#273029] px-4 text-xs font-medium text-white transition hover:bg-[#4f5d52]"
          href="/admin/journeys/composer"
        >
          Preview composer
        </Link>
      </AdminPageHeader>

      <JourneySubnav current="overview" />

      <div className="mt-4 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <MetricCard
          icon={Sparkles}
          label="Active journeys"
          note="One active · one scheduled"
          tone="#8b6c79"
          value="2"
        />
        <MetricCard
          icon={UsersRound}
          label="Members in circle"
          note="Illustrative enrollment"
          tone="#6d7d85"
          value="47"
        />
        <MetricCard
          icon={MessageCircle}
          label="Reply rate"
          note="Trust signal · sample"
          tone="#6e806b"
          value="49%"
        />
        <MetricCard
          icon={CirclePause}
          label="Paused with care"
          note="Individual member pauses"
          tone="#a37c51"
          value="3"
        />
      </div>

      <AdminPanel className="mt-5 bg-[#273029] text-white">
        <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
          <div>
            <HeartHandshake
              className="size-5 text-[#c9ae88]"
              aria-hidden="true"
            />
            <p className="mt-5 text-[10px] font-semibold tracking-[0.2em] text-[#c9ae88] uppercase">
              Value before invitation
            </p>
            <h2 className="mt-2 text-3xl text-white">
              Guidance with room to breathe.
            </h2>
            <p className="mt-3 text-xs leading-5 text-white/48">
              Every journey begins with care, leaves room for quiet, and keeps
              the first three messages devoted to support.
            </p>
          </div>
          <ol className="grid gap-3 sm:grid-cols-4">
            {[
              ["01", "Name", "Set a caring intention."],
              ["02", "Entry", "Signup, purchase, or manual."],
              ["03", "Milestones", "Day 1, Day 3, Day 7."],
              ["04", "Human touch", "Mark where Shannon replies."],
            ].map(([number, label, detail]) => (
              <li
                className="rounded-2xl border border-white/10 bg-white/6 p-4"
                key={label}
              >
                <span className="text-[9px] text-[#c9ae88]">{number}</span>
                <p className="mt-3 text-sm font-medium text-white">{label}</p>
                <p className="mt-1 text-[10px] leading-4 text-white/42">
                  {detail}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </AdminPanel>

      <AdminPanel className="mt-5">
        <div className="flex flex-col justify-between gap-3 border-b border-[#d9d3c8] pb-5 sm:flex-row sm:items-center">
          <PanelHeading
            detail="Active, scheduled, and draft sample journeys"
            eyebrow="Journey library"
            title="Relationships in motion"
          />
          <PreviewPill />
        </div>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[940px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#d9d3c8] text-[9px] font-semibold tracking-[0.16em] text-[#868d86] uppercase">
                <th className="px-3 py-4">Journey</th>
                <th className="px-3 py-4">Entry</th>
                <th className="px-3 py-4">Milestones</th>
                <th className="px-3 py-4">Circle</th>
                <th className="px-3 py-4">Replies</th>
                <th className="px-3 py-4">Bookings</th>
                <th className="px-3 py-4">Status</th>
                <th className="px-3 py-4 text-right">Review</th>
              </tr>
            </thead>
            <tbody>
              {adminJourneys.map((journey) => (
                <tr
                  className="border-b border-[#e0dbd1] last:border-0"
                  key={journey.id}
                >
                  <td className="px-3 py-4">
                    <p className="text-sm font-medium">{journey.title}</p>
                    <p className="mt-1 text-xs text-[#7b837b]">
                      {journey.type}
                    </p>
                  </td>
                  <td className="px-3 py-4 text-sm text-[#687168]">
                    {journey.id === "summer-skin-reset"
                      ? "LIFT purchase"
                      : "Member opt-in"}
                  </td>
                  <td className="px-3 py-4 text-sm text-[#687168]">
                    {journey.progress}
                  </td>
                  <td className="px-3 py-4 text-sm">{journey.enrolled}</td>
                  <td className="px-3 py-4 text-sm">{journey.replies}</td>
                  <td className="px-3 py-4 text-sm">{journey.bookings}</td>
                  <td className="px-3 py-4">
                    <StatusPill
                      tone={
                        journey.status === "Active"
                          ? "positive"
                          : journey.status === "Scheduled"
                            ? "warning"
                            : "quiet"
                      }
                    >
                      {journey.status}
                    </StatusPill>
                  </td>
                  <td className="px-3 py-4 text-right">
                    <Link
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#876947]"
                      href={
                        journey.status === "Active"
                          ? "/admin/connection"
                          : "/admin/journeys/composer"
                      }
                    >
                      {journey.status === "Active"
                        ? "See dialogue"
                        : "Review journey"}
                      <ArrowRight className="size-3" aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <AdminPanel>
          <div className="flex items-center gap-3">
            <Milestone className="size-4 text-[#9d8464]" aria-hidden="true" />
            <PanelHeading
              detail="Care-centered pacing rules shown in the composer"
              eyebrow="Guardrails"
              title="Respect their energy"
            />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              "Maximum seven messages per journey",
              "Maximum two simultaneous journeys",
              "Twenty-four hours of silence at the end",
              "Clear frequency and opt-out language",
            ].map((rule) => (
              <div
                className="rounded-xl border border-[#ddd7cd] bg-white/25 p-3 text-xs leading-5 text-[#637064]"
                key={rule}
              >
                {rule}
              </div>
            ))}
          </div>
        </AdminPanel>
        <AdminPanel>
          <PanelHeading
            detail="Individual pacing"
            eyebrow="Pause"
            title="Three members resting"
          />
          <div className="mt-5 space-y-3">
            {["Talia Reed", "June Martin", "Nora James"].map((name) => (
              <div
                className="flex items-center justify-between gap-3 rounded-xl border border-[#ddd7cd] p-3"
                key={name}
              >
                <span className="text-sm text-[#59645a]">{name}</span>
                <StatusPill tone="quiet">Paused with care</StatusPill>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>
    </>
  )
}
