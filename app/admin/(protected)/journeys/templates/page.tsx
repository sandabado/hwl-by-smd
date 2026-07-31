import {
  BookOpen,
  CalendarDays,
  Clock3,
  CopyPlus,
  HeartHandshake,
  MessageCircle,
  Sparkles,
} from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  PanelHeading,
  PreviewPill,
  ReadOnlyButton,
  StatusPill,
} from "@/components/admin/admin-ui"
import { JourneySubnav } from "@/components/admin/journey-subnav"
import { journeyTemplates } from "@/lib/admin-preview-data"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

const templateIcons = [
  HeartHandshake,
  BookOpen,
  CalendarDays,
  Sparkles,
  CalendarDays,
  MessageCircle,
  HeartHandshake,
] as const

export default async function AdminJourneyTemplatesPage() {
  await requireAdmin()

  return (
    <>
      <AdminPageHeader
        description="Reusable beginnings that protect Shannon’s voice, member attention, and the expectation of real dialogue."
        eyebrow="Journey library"
        title="Templates"
      >
        <ReadOnlyButton>Create template</ReadOnlyButton>
      </AdminPageHeader>

      <JourneySubnav current="templates" />

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-xs text-[#747d74]">
          Seven intimate starting points shaped for personal care.
        </p>
        <PreviewPill />
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {journeyTemplates.map((template, index) => {
          const Icon = templateIcons[index]
          return (
            <AdminPanel className="flex flex-col" key={template.title}>
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-[#9d8464]/10 text-[#876947]">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <StatusPill tone="quiet">
                  {template.messages}{" "}
                  {template.messages === 1 ? "message" : "messages"}
                </StatusPill>
              </div>
              <h2 className="mt-5 text-2xl">{template.title}</h2>
              <p className="mt-3 flex-1 text-xs leading-5 text-[#737c73]">
                {template.description}
              </p>
              <div className="mt-5 space-y-2 rounded-2xl bg-[#f6f1e8]/60 p-4 text-xs text-[#647064]">
                <p className="flex items-center gap-2">
                  <Clock3 className="size-3.5" aria-hidden="true" />
                  {template.timing}
                </p>
                <p className="flex items-center gap-2">
                  <MessageCircle className="size-3.5" aria-hidden="true" />
                  {template.cta}
                </p>
              </div>
              <div className="mt-5">
                <ReadOnlyButton>
                  <CopyPlus
                    className="mr-2 inline size-3.5"
                    aria-hidden="true"
                  />
                  Clone into composer
                </ReadOnlyButton>
              </div>
            </AdminPanel>
          )
        })}
      </div>

      <AdminPanel className="mt-5 bg-[#273029] text-white">
        <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
          <PanelHeading
            detail="Every cloned template still requires a human review before scheduling."
            eyebrow="Template promise"
            title="A beginning, never a script."
          />
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              "Personalize the member’s context",
              "Mark the human touchpoint",
              "Review rhythm and member choice",
            ].map((item) => (
              <div
                className="rounded-2xl border border-white/10 bg-white/6 p-4 text-xs leading-5 text-white/55"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </AdminPanel>
    </>
  )
}
