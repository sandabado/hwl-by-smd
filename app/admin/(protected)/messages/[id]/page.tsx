import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  Paperclip,
  Send,
  Sparkles,
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
import { adminConversations } from "@/lib/admin-preview-data"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export default async function AdminMessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const conversation = adminConversations.find((item) => item.id === id)

  if (!conversation) notFound()

  return (
    <>
      <Link
        className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-[#756147] underline-offset-4 hover:underline"
        href="/admin/messages"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        All messages
      </Link>
      <AdminPageHeader
        description="A focused conversation view with enough member context to respond with care."
        eyebrow="Sample conversation"
        title={conversation.name}
      >
        <PreviewPill />
      </AdminPageHeader>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <AdminPanel className="flex min-h-[620px] flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-[#ddd7cd] pb-4">
            <div>
              <p className="text-sm font-medium">{conversation.name}</p>
              <p className="mt-1 text-[10px] text-[#858d85]">
                Private member thread · sample only
              </p>
            </div>
            <StatusPill tone={conversation.unread ? "warning" : "neutral"}>
              {conversation.unread ? "Unread" : "Read"}
            </StatusPill>
          </div>

          <div className="flex-1 space-y-5 py-7">
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-[#273029]/7 px-4 py-3">
              <p className="text-sm leading-6 text-[#4f5a51]">
                {conversation.preview}
              </p>
              <p className="mt-2 text-[9px] text-[#8a918a]">
                {conversation.time}
              </p>
            </div>
            <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-[#9d8464]/15 px-4 py-3">
              <p className="text-sm leading-6 text-[#4f5a51]">
                This is where Shannon&apos;s thoughtful reply would appear once
                authenticated messaging and delivery are connected.
              </p>
              <p className="mt-2 text-[9px] text-[#8a7a66]">Preview response</p>
            </div>
          </div>

          <div className="border-t border-[#ddd7cd] pt-4">
            <label className="text-[10px] font-semibold tracking-[0.15em] text-[#818981] uppercase">
              Reply
              <textarea
                className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-[#d7d0c4] bg-white/45 p-4 text-sm text-[#747d74]"
                disabled
                placeholder="Reply activates after secure messaging is connected."
              />
            </label>
            <div className="mt-3 flex justify-between gap-3">
              <ReadOnlyButton compact>
                <Paperclip
                  className="mr-1 inline size-3.5"
                  aria-hidden="true"
                />
                Attach
              </ReadOnlyButton>
              <ReadOnlyButton compact>
                <Send className="mr-1 inline size-3.5" aria-hidden="true" />
                Send reply
              </ReadOnlyButton>
            </div>
          </div>
        </AdminPanel>

        <div className="space-y-5">
          <AdminPanel>
            <PanelHeading eyebrow="Member" title={conversation.name} />
            <div className="mt-5 space-y-4">
              <FieldPreview label="Plan" value={conversation.plan} />
              <FieldPreview label="Status" value="Active · sample" />
              <FieldPreview label="Course progress" value="4 of 7 lessons" />
            </div>
          </AdminPanel>
          <AdminPanel>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-[#688064]/10 text-[#5b7058]">
                <CalendarDays className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium">Next booking</p>
                <p className="mt-1 text-xs text-[#7d847c]">
                  No verified booking linked
                </p>
              </div>
            </div>
          </AdminPanel>
          <AdminPanel className="bg-[#273029] text-white">
            <Sparkles className="size-4 text-[#c9ae88]" aria-hidden="true" />
            <p className="mt-4 font-serif text-xl text-white">
              Care stays private.
            </p>
            <p className="mt-2 text-xs leading-5 text-white/45">
              Production messages need explicit retention rules, access logs,
              and secure attachments before replies are enabled.
            </p>
          </AdminPanel>
        </div>
      </div>
    </>
  )
}
