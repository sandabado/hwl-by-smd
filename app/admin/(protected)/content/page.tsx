import Link from "next/link"
import { FilePenLine, Plus, Search } from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  PreviewPill,
  ReadOnlyButton,
  StatusPill,
} from "@/components/admin/admin-ui"
import { adminArticles } from "@/lib/admin-preview-data"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export default async function AdminContentPage() {
  await requireAdmin()

  return (
    <>
      <AdminPageHeader
        description="Hold essays, practical guides, and seasonal reflections in one quiet editorial workspace."
        eyebrow="The Journal"
        title="Content"
      >
        <ReadOnlyButton>
          <Plus className="mr-2 inline size-3.5" aria-hidden="true" />
          Write article
        </ReadOnlyButton>
      </AdminPageHeader>

      <AdminPanel className="mt-8">
        <div className="flex flex-col gap-3 border-b border-[#d9d3c8] pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-[#9d8464]/10 text-[#876947]">
              <FilePenLine className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium">Editorial library</p>
              <p className="text-xs text-[#7d847c]">
                {adminArticles.length} sample drafts and outlines
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <span className="sr-only">Search journal articles</span>
              <Search
                className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#899089]"
                aria-hidden="true"
              />
              <input
                className="h-10 w-52 rounded-full border border-[#d4cdc1] bg-white/45 pr-4 pl-9 text-xs"
                disabled
                placeholder="Search articles"
              />
            </label>
            <select
              aria-label="Filter article status"
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
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#d9d3c8] text-[9px] font-semibold tracking-[0.16em] text-[#868d86] uppercase">
                <th className="px-3 py-4">Title</th>
                <th className="px-3 py-4">Category</th>
                <th className="px-3 py-4">Status</th>
                <th className="px-3 py-4">Date</th>
                <th className="px-3 py-4">Views</th>
                <th className="px-3 py-4 text-right">Editor</th>
              </tr>
            </thead>
            <tbody>
              {adminArticles.map((article) => (
                <tr
                  className="border-b border-[#e0dbd1] last:border-0"
                  key={article.id}
                >
                  <td className="max-w-md px-3 py-4 text-sm font-medium">
                    {article.title}
                  </td>
                  <td className="px-3 py-4 text-sm text-[#697269]">
                    {article.category}
                  </td>
                  <td className="px-3 py-4">
                    <StatusPill
                      tone={article.status === "Draft" ? "warning" : "quiet"}
                    >
                      {article.status}
                    </StatusPill>
                  </td>
                  <td className="px-3 py-4 text-sm text-[#7b837b]">
                    {article.date}
                  </td>
                  <td className="px-3 py-4 text-sm text-[#7b837b]">
                    {article.views}
                  </td>
                  <td className="px-3 py-4 text-right">
                    <Link
                      className="text-xs font-medium text-[#876947] underline-offset-4 hover:underline"
                      href={`/admin/content/${article.id}`}
                    >
                      Review
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
