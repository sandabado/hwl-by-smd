import {
  AlertCircle,
  BellRing,
  CalendarPlus,
  Clock3,
  HeartHandshake,
  Link2,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  StickyNote,
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
import { ChatCtaGenerator } from "@/components/shared/chat-cta-generator"
import { journeyConversations } from "@/lib/admin-preview-data"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

const queueGroups = [
  {
    label: "Urgent",
    tone: "bg-[#a9554e]",
    items: [
      {
        member: "Talia Reed",
        journey: "Direct support",
        preview: "I’m struggling with pressure near my jaw.",
        time: "12m",
        count: 1,
      },
    ],
  },
  {
    label: "Waiting on Shannon",
    tone: "bg-[#b58b54]",
    items: journeyConversations.slice(0, 2),
  },
  {
    label: "Open",
    tone: "bg-[#70806c]",
    items: journeyConversations.slice(2),
  },
] as const

export default async function AdminConnectionPage() {
  await requireAdmin()

  return (
    <>
      <AdminPageHeader
        description="A relationship command center that surfaces who needs care, preserves context, and keeps every response human."
        eyebrow="Relational operating system"
        title="Connection"
      >
        <PreviewPill />
      </AdminPageHeader>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <MetricCard
          icon={UsersRound}
          label="Active relationships"
          note="Illustrative engaged circle"
          tone="#8b6c79"
          value="47"
        />
        <MetricCard
          icon={BellRing}
          label="Awaiting reply"
          note="One support flag · sample"
          tone="#a9554e"
          value="4"
        />
        <MetricCard
          icon={CalendarPlus}
          label="Conversation bookings"
          note="This month · illustrative"
          tone="#6e806b"
          value="8"
        />
        <MetricCard
          icon={Clock3}
          label="Average response"
          note="Care goal · under 12 hours"
          tone="#a37c51"
          value="4.2h"
        />
      </div>

      <div className="mt-5 grid gap-5 2xl:grid-cols-[0.72fr_1.35fr_0.72fr]">
        <AdminPanel className="p-0">
          <div className="border-b border-[#ddd7cd] p-5">
            <PanelHeading
              detail="Grouped by care priority"
              eyebrow="Queue"
              title="Who needs you"
            />
            <label className="relative mt-4 block">
              <span className="sr-only">Search relationships</span>
              <Search
                className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#899089]"
                aria-hidden="true"
              />
              <input
                className="h-10 w-full rounded-full border border-[#d4cdc1] bg-white/45 pr-4 pl-9 text-xs"
                disabled
                placeholder="Search people"
              />
            </label>
          </div>

          <div className="max-h-[720px] overflow-y-auto p-3">
            {queueGroups.map((group) => (
              <section className="mb-5 last:mb-0" key={group.label}>
                <div className="flex items-center gap-2 px-2 py-2">
                  <span className={`size-1.5 rounded-full ${group.tone}`} />
                  <h2 className="text-[9px] font-semibold tracking-[0.16em] text-[#7f877f] uppercase">
                    {group.label}
                  </h2>
                </div>
                <div className="space-y-1">
                  {group.items.map((conversation, index) => (
                    <button
                      className={
                        group.label === "Waiting on Shannon" && index === 0
                          ? "w-full rounded-2xl bg-[#273029] p-4 text-left text-white"
                          : "w-full rounded-2xl p-4 text-left transition hover:bg-white/40"
                      }
                      key={`${group.label}-${conversation.member}`}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {conversation.member}
                          </p>
                          <p
                            className={
                              group.label === "Waiting on Shannon" &&
                              index === 0
                                ? "mt-1 truncate text-[9px] text-[#c9ae88]"
                                : "mt-1 truncate text-[9px] text-[#8a918a]"
                            }
                          >
                            {conversation.journey}
                          </p>
                        </div>
                        <span
                          className={
                            group.label === "Waiting on Shannon" && index === 0
                              ? "text-[9px] text-white/35"
                              : "text-[9px] text-[#949a94]"
                          }
                        >
                          {conversation.time}
                        </span>
                      </div>
                      <p
                        className={
                          group.label === "Waiting on Shannon" && index === 0
                            ? "mt-3 line-clamp-2 text-xs leading-5 text-white/52"
                            : "mt-3 line-clamp-2 text-xs leading-5 text-[#707970]"
                        }
                      >
                        {conversation.preview}
                      </p>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel className="flex min-h-[760px] flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-[#ddd7cd] pb-4">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.16em] text-[#9d8464] uppercase">
                Summer Skin Reset
              </p>
              <h2 className="mt-1 text-2xl">Maya Chen</h2>
            </div>
            <StatusPill tone="warning">Waiting on Shannon</StatusPill>
          </div>

          <div className="flex-1 space-y-5 py-7">
            <div className="max-w-[84%] rounded-[1.3rem] rounded-tl-sm bg-[#273029]/7 px-5 py-4">
              <p className="font-serif text-lg leading-7 text-[#455047]">
                How&apos;s the massage feeling? Did the lymphatic sweep feel
                supportive? Reply and tell me what you noticed—I read every
                message.
              </p>
              <p className="mt-3 text-[9px] text-[#8b928b]">
                Shannon · Yesterday, 9:00 AM
              </p>
            </div>

            <div className="ml-auto max-w-[84%] rounded-[1.3rem] rounded-tr-sm bg-[#9d8464]/17 px-5 py-4">
              <p className="text-sm leading-6 text-[#4e584f]">
                The lymphatic sweep felt amazing—can I do it twice? My jaw still
                feels a little tense.
              </p>
              <p className="mt-3 text-[9px] text-[#8a7a66]">
                Maya · Today, 10:42 AM
              </p>
            </div>

            <div className="max-w-[84%] rounded-[1.3rem] rounded-tl-sm border border-dashed border-[#d1c7b8] bg-[#f6f1e8]/55 px-5 py-4">
              <p className="text-[9px] font-semibold tracking-[0.15em] text-[#8d765a] uppercase">
                Suggested context · never auto-send
              </p>
              <p className="mt-2 text-sm leading-6 text-[#657066]">
                Acknowledge what felt good, then offer gentler jaw guidance or a
                short check-in if she wants you to watch her technique.
              </p>
            </div>
          </div>

          <div className="border-t border-[#ddd7cd] pt-4">
            <div
              aria-label="Conversation tools"
              className="mb-3 flex flex-wrap gap-2"
            >
              <ChatCtaGenerator conversationId="00000000-0000-4000-8000-000000000106" />
              <ReadOnlyButton compact>
                <Link2 className="mr-1 inline size-3" aria-hidden="true" />
                Add resource
              </ReadOnlyButton>
            </div>
            <label className="text-[10px] font-semibold tracking-[0.15em] text-[#818981] uppercase">
              Reply with care
              <textarea
                className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-[#d7d0c4] bg-white/45 p-4 text-sm text-[#747d74]"
                disabled
                placeholder="Secure replies activate after the conversation backend is connected."
              />
            </label>
            <div className="mt-3 flex flex-wrap justify-between gap-2">
              <ReadOnlyButton compact>
                <StickyNote
                  className="mr-1 inline size-3.5"
                  aria-hidden="true"
                />
                Add private note
              </ReadOnlyButton>
              <div className="flex gap-2">
                <ReadOnlyButton compact>Resolve</ReadOnlyButton>
                <ReadOnlyButton compact>
                  <Send className="mr-1 inline size-3.5" aria-hidden="true" />
                  Send
                </ReadOnlyButton>
              </div>
            </div>
          </div>
        </AdminPanel>

        <div className="space-y-5">
          <AdminPanel>
            <div className="flex items-center justify-between gap-3">
              <PanelHeading eyebrow="Context" title="Maya Chen" />
              <HeartHandshake
                className="size-4 text-[#8b6c79]"
                aria-hidden="true"
              />
            </div>
            <dl className="mt-5 space-y-4 text-xs">
              <div>
                <dt className="text-[#8a918a]">Membership</dt>
                <dd className="mt-1 font-medium text-[#4f5a51]">The Den</dd>
              </div>
              <div>
                <dt className="text-[#8a918a]">Joined</dt>
                <dd className="mt-1 font-medium text-[#4f5a51]">
                  July 18, 2026
                </dd>
              </div>
              <div>
                <dt className="text-[#8a918a]">Current focus</dt>
                <dd className="mt-1 font-medium text-[#4f5a51]">
                  Jaw softness · lymphatic care
                </dd>
              </div>
              <div>
                <dt className="text-[#8a918a]">Upcoming session</dt>
                <dd className="mt-1 font-medium text-[#4f5a51]">
                  No verified booking
                </dd>
              </div>
            </dl>
          </AdminPanel>

          <AdminPanel>
            <div className="flex items-center gap-3">
              <ShieldCheck
                className="size-4 text-[#6e806b]"
                aria-hidden="true"
              />
              <PanelHeading eyebrow="Safeguards" title="Human first" />
            </div>
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#ddd7cd] p-3">
                <span className="text-xs text-[#5d675e]">
                  Pause all journey sends
                </span>
                <input disabled type="checkbox" />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#ddd7cd] p-3">
                <span className="text-xs text-[#5d675e]">
                  Never auto-reply to support flags
                </span>
                <input checked disabled readOnly type="checkbox" />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#ddd7cd] p-3">
                <span className="text-xs text-[#5d675e]">
                  “Urgent” human handoff
                </span>
                <input checked disabled readOnly type="checkbox" />
              </div>
            </div>
          </AdminPanel>

          <AdminPanel className="border-[#a9554e]/25 bg-[#a9554e]/6">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="mt-0.5 size-4 shrink-0 text-[#a9554e]"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-medium text-[#754b47]">
                  One support flag
                </p>
                <p className="mt-2 text-xs leading-5 text-[#79625f]">
                  Talia used “struggling.” Her journey remains paused until
                  Shannon reviews the conversation.
                </p>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel className="bg-[#273029] text-white">
            <Sparkles className="size-4 text-[#c9ae88]" aria-hidden="true" />
            <p className="mt-4 font-serif text-xl text-white">
              Presence is the measure.
            </p>
            <p className="mt-2 text-xs leading-5 text-white/45">
              The queue optimizes for being present—not clearing tickets.
            </p>
          </AdminPanel>
        </div>
      </div>
    </>
  )
}
