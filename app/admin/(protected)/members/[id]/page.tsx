import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  MessageCircle,
  UserRound,
} from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  EmptyState,
  FieldPreview,
  PanelHeading,
  PreviewPill,
  ReadOnlyButton,
  StatusPill,
} from "@/components/admin/admin-ui"
import { adminMembers } from "@/lib/admin-preview-data"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export default async function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const member = adminMembers.find((item) => item.id === id)

  if (!member) notFound()

  return (
    <>
      <Link
        className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-[#756147] underline-offset-4 hover:underline"
        href="/admin/members"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        All members
      </Link>
      <AdminPageHeader
        description="A complete relationship view across access, learning, bookings, and private messages."
        eyebrow="Sample member profile"
        title={member.name}
      >
        <ReadOnlyButton>Suspend</ReadOnlyButton>
        <ReadOnlyButton>Activate</ReadOnlyButton>
      </AdminPageHeader>

      <div className="mt-8 grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
        <AdminPanel>
          <div className="flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-full bg-[#9d8464]/12 font-serif text-xl text-[#806443]">
              {member.initials}
            </span>
            <div>
              <p className="font-medium">{member.name}</p>
              <p className="mt-1 text-xs text-[#7d847c]">{member.email}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4">
            <FieldPreview label="Plan" value={member.plan} />
            <FieldPreview label="Joined" value={member.joined} />
            <div>
              <p className="mb-2 text-[10px] font-semibold tracking-[0.15em] text-[#818981] uppercase">
                Status
              </p>
              <StatusPill
                tone={member.status === "Active" ? "positive" : "warning"}
              >
                {member.status}
              </StatusPill>
            </div>
          </div>
        </AdminPanel>

        <div className="grid gap-5 sm:grid-cols-2">
          <AdminPanel>
            <PanelHeading eyebrow="Learning" title="Course progress" />
            <div className="mt-5">
              <div className="flex justify-between text-xs text-[#687268]">
                <span>LIFT ritual</span>
                <span>4 of 7</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#d9d3c8]">
                <div className="h-full w-[57%] rounded-full bg-[#8b7256]" />
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-[#7b837b]">
              Illustrative progress only. Live lesson completion will come from
              Supabase.
            </p>
          </AdminPanel>
          <AdminPanel>
            <PanelHeading eyebrow="Commerce" title="Purchase history" />
            <div className="mt-5 flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-[#688064]/10 text-[#5b7058]">
                <CircleDollarSign className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium">{member.plan}</p>
                <p className="text-xs text-[#7b837b]">
                  Sample record · Payment successful
                </p>
              </div>
            </div>
          </AdminPanel>
          <AdminPanel>
            <PanelHeading eyebrow="Care" title="Booking history" />
            <div className="mt-5 flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-[#8b6c79]/10 text-[#765b67]">
                <CalendarDays className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium">Beauty & Being Ritual</p>
                <p className="text-xs text-[#7b837b]">
                  One sample appointment · Confirmed
                </p>
              </div>
            </div>
          </AdminPanel>
          <AdminPanel>
            <PanelHeading eyebrow="Relationship" title="Messages" />
            <div className="mt-5 flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-[#6d7d85]/10 text-[#60717a]">
                <MessageCircle className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium">Private thread</p>
                <p className="text-xs text-[#7b837b]">
                  Two illustrative messages
                </p>
              </div>
            </div>
          </AdminPanel>
        </div>
      </div>

      <AdminPanel className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <PanelHeading eyebrow="Notes" title="Private care notes" />
          <PreviewPill />
        </div>
        <div className="mt-5">
          <EmptyState
            description="No real notes are stored in this preview. A production notes workflow should include explicit permissions, audit history, and an appropriate privacy policy."
            icon={UserRound}
            title="No private notes"
          />
        </div>
      </AdminPanel>
    </>
  )
}
