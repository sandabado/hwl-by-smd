import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  FileText,
  GripVertical,
  ImageIcon,
  Plus,
  UploadCloud,
  Video,
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
import { adminCourses, liftLessons } from "@/lib/admin-preview-data"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const course = adminCourses.find((item) => item.id === id)

  if (!course) notFound()

  const lessons = id === "lift-daily-facial-ritual" ? liftLessons : []

  return (
    <>
      <Link
        className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-[#756147] underline-offset-4 hover:underline"
        href="/admin/courses"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        All courses
      </Link>
      <AdminPageHeader
        description="Review the course structure, media readiness, and member access before anything is published."
        eyebrow={course.category}
        title={course.title}
      >
        <ReadOnlyButton>Save draft</ReadOnlyButton>
        <ReadOnlyButton>Publish</ReadOnlyButton>
      </AdminPageHeader>

      <div className="mt-8 grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="space-y-5">
          <AdminPanel>
            <div className="flex items-center justify-between gap-3">
              <PanelHeading eyebrow="Settings" title="Course details" />
              <StatusPill tone="warning">{course.status}</StatusPill>
            </div>
            <div className="mt-5 space-y-4">
              <FieldPreview label="Title" value={course.title} />
              <FieldPreview
                label="Description"
                multiline
                value={course.description}
              />
              <FieldPreview label="Access tier" value={course.access} />
              <FieldPreview label="Category" value={course.category} />
            </div>
          </AdminPanel>

          <AdminPanel>
            <PanelHeading eyebrow="Cover" title="Course artwork" />
            <div className="mt-5">
              <EmptyState
                description="A production upload will store the cover image securely and generate optimized sizes."
                icon={ImageIcon}
                title="Artwork placeholder"
              />
            </div>
            <div className="mt-4">
              <ReadOnlyButton>
                <UploadCloud
                  className="mr-2 inline size-3.5"
                  aria-hidden="true"
                />
                Upload image
              </ReadOnlyButton>
            </div>
          </AdminPanel>
        </div>

        <AdminPanel>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <PanelHeading
              detail={`${course.lessons} planned lessons`}
              eyebrow="Curriculum"
              title="Lessons"
            />
            <div className="flex items-center gap-2">
              <PreviewPill />
              <ReadOnlyButton compact>
                <Plus className="mr-1 inline size-3" aria-hidden="true" />
                Add lesson
              </ReadOnlyButton>
            </div>
          </div>

          {lessons.length ? (
            <ol className="mt-5 divide-y divide-[#ded8cd]">
              {lessons.map((lesson, index) => (
                <li
                  className="grid gap-3 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                  key={lesson.title}
                >
                  <div className="flex items-center gap-2 text-[#a0a59f]">
                    <GripVertical className="size-4" aria-hidden="true" />
                    <span className="grid size-7 place-items-center rounded-full bg-[#273029]/7 text-[10px] text-[#5e695f]">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{lesson.title}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-3 text-[10px] text-[#7f877f]">
                      <span className="flex items-center gap-1">
                        <Video className="size-3" aria-hidden="true" />
                        {lesson.media}
                      </span>
                      <span>{lesson.duration}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill tone="warning">{lesson.status}</StatusPill>
                    <Link
                      className="rounded-full border border-[#d4cdc1] bg-white/45 px-3 py-2 text-xs font-medium text-[#756147] transition hover:bg-white/70"
                      href={`/admin/courses/${course.id}/lessons/${lesson.id}`}
                    >
                      Review
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-5">
              <EmptyState
                description="This course concept has no lesson records yet. Add controls remain disabled in the read-only preview."
                icon={FileText}
                title="Curriculum not started"
              />
            </div>
          )}
        </AdminPanel>
      </div>
    </>
  )
}
