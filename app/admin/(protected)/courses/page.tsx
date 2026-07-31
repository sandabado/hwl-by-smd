import Link from "next/link"
import { BookOpen, Clock3, Layers3, Plus, Video } from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  PreviewPill,
  ReadOnlyButton,
  StatusPill,
} from "@/components/admin/admin-ui"
import { adminCourses } from "@/lib/admin-preview-data"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export default async function AdminCoursesPage() {
  await requireAdmin()

  return (
    <>
      <AdminPageHeader
        description="Shape the private learning library, organize lessons, and see which media is ready for members."
        eyebrow="The Den library"
        title="Courses"
      >
        <ReadOnlyButton>
          <Plus className="mr-2 inline size-3.5" aria-hidden="true" />
          Create course
        </ReadOnlyButton>
      </AdminPageHeader>

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-xs text-[#747d74]">
          {adminCourses.length} course concepts
        </p>
        <PreviewPill />
      </div>

      <div className="mt-4 grid gap-5 xl:grid-cols-3">
        {adminCourses.map((course, index) => (
          <AdminPanel className="overflow-hidden p-0" key={course.id}>
            <div
              className={
                index === 0
                  ? "relative h-40 bg-[radial-gradient(circle_at_68%_24%,rgba(255,255,255,.55),transparent_34%),linear-gradient(135deg,#cab9a2,#8d775f)]"
                  : index === 1
                    ? "relative h-40 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,.3),transparent_30%),linear-gradient(135deg,#86917f,#4e6051)]"
                    : "relative h-40 bg-[radial-gradient(circle_at_75%_25%,rgba(255,255,255,.3),transparent_32%),linear-gradient(135deg,#8d727d,#5f4d55)]"
              }
            >
              <span className="absolute top-4 left-4 rounded-full bg-[#f7f2ea]/80 px-3 py-1 text-[9px] font-semibold tracking-[0.15em] text-[#675847] uppercase backdrop-blur">
                {course.category}
              </span>
              <BookOpen
                className="absolute right-5 bottom-5 size-7 text-white/65"
                aria-hidden="true"
              />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-2xl leading-tight">{course.title}</h2>
                <StatusPill
                  tone={course.status === "Draft" ? "warning" : "quiet"}
                >
                  {course.status}
                </StatusPill>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#747d74]">
                {course.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-4 border-t border-[#ded8cd] pt-4 text-[10px] text-[#727b72]">
                <span className="flex items-center gap-1.5">
                  <Layers3 className="size-3.5" aria-hidden="true" />
                  {course.lessons} lessons
                </span>
                <span className="flex items-center gap-1.5">
                  <Video className="size-3.5" aria-hidden="true" />
                  {course.access}
                </span>
              </div>
              <Link
                className="mt-5 inline-flex min-h-10 w-full items-center justify-center rounded-full bg-[#273029] px-4 text-xs font-medium text-white transition hover:bg-[#4f5d52]"
                href={`/admin/courses/${course.id}`}
              >
                Review course
              </Link>
            </div>
          </AdminPanel>
        ))}
      </div>

      <AdminPanel className="mt-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-[#9d8464]/10 text-[#8a6b48]">
            <Clock3 className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium">Publishing stays deliberate</p>
            <p className="mt-1 text-xs leading-5 text-[#7a827a]">
              Upload, reorder, edit, and publish controls remain disabled until
              Mux uploads, storage policies, and audited server actions are in
              place.
            </p>
          </div>
        </div>
      </AdminPanel>
    </>
  )
}
