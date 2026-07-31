import Link from "next/link"
import { Download, Search, UsersRound } from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  PreviewPill,
  ReadOnlyButton,
  StatusPill,
} from "@/components/admin/admin-ui"
import { adminMembers } from "@/lib/admin-preview-data"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export default async function AdminMembersPage() {
  await requireAdmin()

  return (
    <>
      <AdminPageHeader
        description="See membership, access, and recent presence in one place. Live member records will appear only after the production database is connected."
        eyebrow="Community"
        title="Members"
      >
        <ReadOnlyButton>
          <Download className="mr-2 inline size-3.5" aria-hidden="true" />
          Export CSV
        </ReadOnlyButton>
      </AdminPageHeader>

      <AdminPanel className="mt-8">
        <div className="flex flex-col gap-3 border-b border-[#d9d3c8] pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-[#8b6c79]/10 text-[#765b67]">
              <UsersRound className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium">Member directory</p>
              <p className="text-xs text-[#7d847c]">
                {adminMembers.length} illustrative profiles
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <span className="sr-only">Search members</span>
              <Search
                className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#899089]"
                aria-hidden="true"
              />
              <input
                className="h-10 w-52 rounded-full border border-[#d4cdc1] bg-white/45 pr-4 pl-9 text-xs"
                disabled
                placeholder="Search members"
              />
            </label>
            <select
              aria-label="Filter by plan"
              className="h-10 rounded-full border border-[#d4cdc1] bg-white/45 px-3 text-xs text-[#788078]"
              defaultValue="all"
              disabled
            >
              <option value="all">All plans</option>
            </select>
            <select
              aria-label="Filter by status"
              className="h-10 rounded-full border border-[#d4cdc1] bg-white/45 px-3 text-xs text-[#788078]"
              defaultValue="all"
              disabled
            >
              <option value="all">All statuses</option>
            </select>
            <PreviewPill />
          </div>
        </div>

        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#d9d3c8] text-[9px] font-semibold tracking-[0.16em] text-[#868d86] uppercase">
                <th className="px-3 py-4">Member</th>
                <th className="px-3 py-4">Plan</th>
                <th className="px-3 py-4">Joined</th>
                <th className="px-3 py-4">Status</th>
                <th className="px-3 py-4">Last visit</th>
                <th className="px-3 py-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody>
              {adminMembers.map((member) => (
                <tr
                  className="border-b border-[#e0dbd1] last:border-0"
                  key={member.id}
                >
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-full bg-[#9d8464]/12 font-serif text-sm text-[#806443]">
                        {member.initials}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="mt-0.5 text-xs text-[#858c85]">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-[#566158]">
                    {member.plan}
                  </td>
                  <td className="px-3 py-4 text-sm text-[#707970]">
                    {member.joined}
                  </td>
                  <td className="px-3 py-4">
                    <StatusPill
                      tone={member.status === "Active" ? "positive" : "warning"}
                    >
                      {member.status}
                    </StatusPill>
                  </td>
                  <td className="px-3 py-4 text-sm text-[#707970]">
                    {member.lastActive}
                  </td>
                  <td className="px-3 py-4 text-right">
                    <Link
                      className="text-xs font-medium text-[#876947] underline-offset-4 hover:underline"
                      href={`/admin/members/${member.id}`}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </>
  )
}
