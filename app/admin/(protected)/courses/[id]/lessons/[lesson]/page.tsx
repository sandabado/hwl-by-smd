import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Captions,
  FileText,
  ScrollText,
  UploadCloud,
  Video,
} from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  EmptyState,
  FieldPreview,
  PanelHeading,
  ReadOnlyButton,
  StatusPill,
} from "@/components/admin/admin-ui"
import { adminCourses, liftLessons } from "@/lib/admin-preview-data"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export default async function AdminLessonEditorPage({
  params,
}: {
  params: Promise<{ id: string; lesson: string }>
}) {
  await requireAdmin()
  const { id, lesson: lessonId } = await params
  const course = adminCourses.find((item) => item.id === id)
  const lesson = liftLessons.find((item) => item.id === lessonId)

  if (!course || id !== "lift-daily-facial-ritual" || !lesson) notFound()

  return (
    <>
      <Link
        className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-[#756147] underline-offset-4 hover:underline"
        href={`/admin/courses/${course.id}`}
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        {course.title}
      </Link>
      <AdminPageHeader
        description="Prepare the lesson text and review its private media readiness before it reaches members."
        eyebrow="Read-only lesson editor"
        title={lesson.title}
      >
        <ReadOnlyButton>Save draft</ReadOnlyButton>
        <ReadOnlyButton>Publish lesson</ReadOnlyButton>
      </AdminPageHeader>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-5">
          <AdminPanel>
            <div className="flex items-center justify-between gap-3">
              <PanelHeading eyebrow="Lesson" title="Teaching notes" />
              <StatusPill tone="warning">{lesson.status}</StatusPill>
            </div>
            <div className="mt-5 space-y-4">
              <FieldPreview label="Title" value={lesson.title} />
              <FieldPreview
                label="Description"
                multiline
                value="The lesson description will orient the member to pressure, pacing, and intention before the practice begins."
              />
              <FieldPreview label="Duration" value={lesson.duration} />
            </div>
          </AdminPanel>

          <AdminPanel>
            <PanelHeading eyebrow="Transcript" title="Accessible lesson text" />
            <div className="mt-5">
              <FieldPreview
                label="Transcript"
                multiline
                value="No transcript has been added. A verified transcript should accompany every final video for search, reference, and accessibility."
              />
            </div>
          </AdminPanel>
        </div>

        <div className="space-y-5">
          <AdminPanel>
            <PanelHeading eyebrow="Mux" title="Private video" />
            <div className="mt-5">
              <EmptyState
                description="Upload remains disabled. Production will request a signed Mux upload URL and store only the resulting asset and playback identifiers."
                icon={Video}
                title="Awaiting video"
              />
            </div>
            <div className="mt-4">
              <ReadOnlyButton>
                <UploadCloud
                  className="mr-2 inline size-3.5"
                  aria-hidden="true"
                />
                Upload video
              </ReadOnlyButton>
            </div>
          </AdminPanel>

          <AdminPanel>
            <PanelHeading eyebrow="Downloads" title="Lesson PDF" />
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#ddd7cd] bg-white/25 p-4">
              <FileText className="size-4 text-[#9d8464]" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium">No private file linked</p>
                <p className="mt-1 text-xs text-[#7b837b]">
                  Protected storage path required
                </p>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel>
            <PanelHeading eyebrow="Accessibility" title="Captions" />
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3">
                <Captions
                  className="size-4 text-[#8b6c79]"
                  aria-hidden="true"
                />
                <p className="text-sm text-[#626c63]">No caption track</p>
              </div>
              <div className="flex items-center gap-3">
                <ScrollText
                  className="size-4 text-[#6e806b]"
                  aria-hidden="true"
                />
                <p className="text-sm text-[#626c63]">
                  Transcript needs review
                </p>
              </div>
            </div>
          </AdminPanel>
        </div>
      </div>
    </>
  )
}
