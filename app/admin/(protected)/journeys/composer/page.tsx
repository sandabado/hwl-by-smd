import {
  CalendarClock,
  CirclePause,
  Eye,
  GripVertical,
  HeartHandshake,
  Link2,
  Plus,
  Search,
  Send,
  ShieldCheck,
  UsersRound,
} from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  FieldPreview,
  PanelHeading,
  PreviewPill,
  ReadOnlyButton,
  StatusPill,
} from "@/components/admin/admin-ui"
import { CopyTextButton } from "@/components/admin/copy-text-button"
import { JourneySubnav } from "@/components/admin/journey-subnav"
import { adminMembers, journeySequence } from "@/lib/admin-preview-data"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export default async function AdminJourneyComposerPage() {
  await requireAdmin()

  return (
    <>
      <AdminPageHeader
        description="Create a human-paced arc of guidance, milestones, and personal touchpoints before scheduling anything."
        eyebrow="Journey creator"
        title="7 Days to Radiance"
      >
        <ReadOnlyButton>Save draft</ReadOnlyButton>
        <ReadOnlyButton>Review</ReadOnlyButton>
        <ReadOnlyButton>
          <Send className="mr-2 inline size-3.5" aria-hidden="true" />
          Schedule journey
        </ReadOnlyButton>
      </AdminPageHeader>

      <JourneySubnav current="composer" />

      <div className="mt-4 grid gap-5 2xl:grid-cols-[0.7fr_1.35fr_0.75fr]">
        <div className="space-y-5">
          <AdminPanel>
            <div className="flex items-center justify-between gap-3">
              <PanelHeading eyebrow="Step 1" title="Name the journey" />
              <StatusPill tone="warning">Draft preview</StatusPill>
            </div>
            <div className="mt-5 space-y-4">
              <FieldPreview label="Journey name" value="7 Days to Radiance" />
              <FieldPreview label="Entry point" value="LIFT purchase" />
              <FieldPreview label="Starts" value="After member opts in" />
              <FieldPreview label="Rhythm" value="Day 1 · Day 3 · Day 7" />
              <FieldPreview
                label="Intention"
                multiline
                value="Help a member settle into the LIFT practice, notice what changes, and know Shannon is available when questions arise."
              />
            </div>
          </AdminPanel>

          <AdminPanel>
            <div className="flex items-center gap-3">
              <ShieldCheck
                className="size-4 text-[#6e806b]"
                aria-hidden="true"
              />
              <PanelHeading eyebrow="Guardrails" title="Energy check" />
            </div>
            <div className="mt-5 space-y-3 text-xs text-[#637064]">
              <div className="flex items-center justify-between rounded-xl border border-[#ddd7cd] p-3">
                <span>Messages in journey</span>
                <StatusPill tone="positive">3 of 7</StatusPill>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[#ddd7cd] p-3">
                <span>First 3 messages</span>
                <StatusPill tone="positive">Care only</StatusPill>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[#ddd7cd] p-3">
                <span>Quiet day after ending</span>
                <StatusPill tone="positive">Included</StatusPill>
              </div>
            </div>
          </AdminPanel>
        </div>

        <AdminPanel>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <PanelHeading
              detail="Milestones and human touchpoints"
              eyebrow="Steps 2–4"
              title="Shape the experience"
            />
            <div className="flex gap-2">
              <PreviewPill />
              <ReadOnlyButton compact>
                <Plus className="mr-1 inline size-3" aria-hidden="true" />
                Add milestone
              </ReadOnlyButton>
            </div>
          </div>

          <ol className="mt-6 space-y-4">
            {journeySequence.map((message, index) => (
              <li
                className="rounded-[1.3rem] border border-[#d9d3c8] bg-white/28 p-5"
                key={message.day}
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="flex items-start gap-3">
                    <GripVertical
                      className="mt-1 size-4 text-[#a0a59f]"
                      aria-hidden="true"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="grid size-7 place-items-center rounded-full bg-[#273029] text-[9px] text-white">
                          {index + 1}
                        </span>
                        <p className="font-serif text-xl">{message.day}</p>
                        {index === 1 && (
                          <StatusPill tone="quiet">
                            Shannon replies personally
                          </StatusPill>
                        )}
                      </div>
                      <p className="mt-2 flex items-center gap-1.5 text-[10px] text-[#7f877f]">
                        <CalendarClock className="size-3" aria-hidden="true" />
                        {message.delay} after entry
                      </p>
                    </div>
                  </div>
                  <CopyTextButton
                    label={`${message.day} message`}
                    text={`${message.subject}\n\n${message.body}`}
                  />
                </div>

                <div className="mt-5 space-y-4">
                  <FieldPreview label="Subject" value={message.subject} />
                  <FieldPreview
                    label="Message"
                    multiline
                    value={message.body}
                  />
                  <div className="flex flex-col justify-between gap-3 rounded-xl border border-[#d9d3c8] bg-[#f6f2ea]/70 px-4 py-3 sm:flex-row sm:items-center">
                    <p className="flex items-center gap-2 text-sm text-[#4f5a51]">
                      <Link2 className="size-3.5" aria-hidden="true" />
                      {message.cta}
                    </p>
                    <StatusPill tone={index < 2 ? "quiet" : "warning"}>
                      {index < 2 ? "Resource" : "Booking invitation"}
                    </StatusPill>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <ReadOnlyButton compact>
              <Eye className="mr-1 inline size-3.5" aria-hidden="true" />
              Member preview
            </ReadOnlyButton>
            <ReadOnlyButton compact>Remove milestone</ReadOnlyButton>
          </div>
        </AdminPanel>

        <div className="space-y-5">
          <AdminPanel>
            <div className="flex items-center justify-between gap-3">
              <PanelHeading eyebrow="Step 5" title="Invite the circle" />
              <UsersRound
                className="size-4 text-[#9d8464]"
                aria-hidden="true"
              />
            </div>
            <label className="relative mt-5 block">
              <span className="sr-only">Search sample members</span>
              <Search
                className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#899089]"
                aria-hidden="true"
              />
              <input
                className="h-10 w-full rounded-full border border-[#d4cdc1] bg-white/45 pr-4 pl-9 text-xs"
                disabled
                placeholder="Search members"
              />
            </label>
            <div className="mt-4 space-y-2">
              {adminMembers.slice(0, 4).map((member, index) => (
                <label
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#ddd7cd] px-3 py-2.5"
                  key={member.id}
                >
                  <span>
                    <span className="block text-xs font-medium">
                      {member.name}
                    </span>
                    <span className="mt-0.5 block text-[9px] text-[#858d85]">
                      {member.plan}
                    </span>
                  </span>
                  <input
                    checked={index < 3}
                    disabled
                    readOnly
                    type="checkbox"
                  />
                </label>
              ))}
            </div>
          </AdminPanel>

          <AdminPanel>
            <div className="flex items-center gap-3">
              <CirclePause
                className="size-4 text-[#8b6c79]"
                aria-hidden="true"
              />
              <PanelHeading eyebrow="Pause" title="Individual pacing" />
            </div>
            <div className="mt-5 rounded-xl border border-[#ddd7cd] bg-[#8b6c79]/7 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-[#59645a]">Talia Reed</span>
                <StatusPill tone="quiet">Paused with care</StatusPill>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#747d74]">
                Journey messages stay quiet until Shannon resumes them for this
                member.
              </p>
            </div>
          </AdminPanel>

          <AdminPanel className="bg-[#273029] text-white">
            <HeartHandshake
              className="size-4 text-[#c9ae88]"
              aria-hidden="true"
            />
            <p className="mt-4 font-serif text-xl text-white">
              Personal at every step.
            </p>
            <p className="mt-2 text-xs leading-5 text-white/45">
              Every touchpoint helps Shannon see where a real reply belongs
              alongside scheduled guidance.
            </p>
          </AdminPanel>
        </div>
      </div>
    </>
  )
}
