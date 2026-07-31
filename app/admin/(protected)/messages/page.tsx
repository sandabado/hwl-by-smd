import Link from "next/link"
import { Archive, CheckCheck, MessageCircle, Search } from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  PreviewPill,
  ReadOnlyButton,
  StatusPill,
} from "@/components/admin/admin-ui"
import { adminConversations } from "@/lib/admin-preview-data"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export default async function AdminMessagesPage() {
  await requireAdmin()

  return (
    <>
      <AdminPageHeader
        description="A private, spacious inbox for member questions, post-session reflections, and thoughtful follow-up."
        eyebrow="Conversations"
        title="Messages"
      >
        <ReadOnlyButton>
          <CheckCheck className="mr-2 inline size-3.5" aria-hidden="true" />
          Mark read
        </ReadOnlyButton>
        <ReadOnlyButton>
          <Archive className="mr-2 inline size-3.5" aria-hidden="true" />
          Archive
        </ReadOnlyButton>
      </AdminPageHeader>

      <AdminPanel className="mt-8 overflow-hidden p-0">
        <div className="flex flex-col justify-between gap-3 border-b border-[#d9d3c8] p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-[#6d7d85]/10 text-[#60717a]">
              <MessageCircle className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium">Private inbox</p>
              <p className="text-xs text-[#7d847c]">
                {adminConversations.length} illustrative conversations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="relative">
              <span className="sr-only">Search conversations</span>
              <Search
                className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#899089]"
                aria-hidden="true"
              />
              <input
                className="h-10 w-52 rounded-full border border-[#d4cdc1] bg-white/45 pr-4 pl-9 text-xs"
                disabled
                placeholder="Search messages"
              />
            </label>
            <PreviewPill />
          </div>
        </div>

        <div className="divide-y divide-[#ded8cd]">
          {adminConversations.map((conversation) => (
            <Link
              className="grid gap-3 p-5 transition hover:bg-white/35 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-6"
              href={`/admin/messages/${conversation.id}`}
              key={conversation.id}
            >
              <span className="grid size-10 place-items-center rounded-full bg-[#9d8464]/12 font-serif text-sm text-[#806443]">
                {conversation.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{conversation.name}</p>
                  {conversation.unread && (
                    <span
                      className="size-1.5 rounded-full bg-[#9d8464]"
                      title="Unread sample message"
                    />
                  )}
                  <StatusPill tone="quiet">{conversation.plan}</StatusPill>
                </div>
                <p className="mt-1 truncate text-xs text-[#747d74]">
                  {conversation.preview}
                </p>
              </div>
              <p className="text-[10px] text-[#909690]">{conversation.time}</p>
            </Link>
          ))}
        </div>
      </AdminPanel>
    </>
  )
}
