import Link from "next/link"
import { Download, ArrowLeft, ArrowRight } from "lucide-react"
import { notFound, redirect } from "next/navigation"

import { MarkCompleteButton } from "@/components/member/lesson-actions"
import { MemberNavigation } from "@/components/member/member-navigation"
import { MuxPlayerWrapper } from "@/components/video/mux-player-wrapper"
import { Button } from "@/components/ui/button"
import { requireAccess } from "@/lib/access"
import { getLessonById } from "@/lib/member-content"
import { createMuxPlaybackToken } from "@/lib/mux"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { access, user } = await requireAccess("any_purchase", `/lesson/${id}`)
  const result = await getLessonById(id)
  if (!result) notFound()

  if (result.course.access_tier === "membership" && !access.isMember) {
    redirect("/store?access=membership_only")
  }
  if (result.course.access_tier === "lift" && !access.canAccessLift) {
    redirect("/store?access=lift_guide_only")
  }

  const supabase = await createClient()
  const { data: progress } =
    (await supabase
      ?.from("user_progress")
      .select("completed")
      .eq("user_id", user.id)
      .eq("lesson_id", result.lesson.id)
      .maybeSingle()) ?? {}
  const token = result.lesson.video_playback_id
    ? await createMuxPlaybackToken(
        result.lesson.video_playback_id,
        result.lesson.duration_seconds
      )
    : null
  const currentIndex = result.siblings.findIndex(
    (lesson) => lesson.id === result.lesson.id
  )
  const previous = result.siblings[currentIndex - 1]
  const next = result.siblings[currentIndex + 1]
  const hasPdf =
    Boolean(result.lesson.pdf_storage_path) ||
    (result.course.access_tier === "lift" &&
      Boolean(process.env.LIFT_PDF_STORAGE_PATH))

  return (
    <section className="member-atmosphere min-h-screen px-6 py-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <Link
            className="inline-flex items-center gap-2 text-sm text-[var(--primary)]"
            href={`/course/${result.course.slug}`}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {result.course.title}
          </Link>
          <MemberNavigation hasMembership={access.isMember} />
        </div>

        <div className="mt-10">
          <MuxPlayerWrapper
            playbackId={result.lesson.video_playback_id}
            title={result.lesson.title}
            token={token}
            videoId={result.lesson.id}
          />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs tracking-[0.28em] text-[var(--accent)] uppercase">
              Lesson {currentIndex + 1} of {result.siblings.length}
            </p>
            <h1 className="mt-4 text-5xl font-medium text-[var(--primary)] md:text-6xl">
              {result.lesson.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[var(--muted-foreground)]">
              {result.lesson.description}
            </p>
            <details className="den-card mt-8 rounded-[1.5rem] p-6">
              <summary className="cursor-pointer font-serif text-2xl text-[var(--primary)]">
                Preparation & transcript
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
                Arrive with clean hands, soften your shoulders, and let the
                practice move at the pace of your breath. Captions and the full
                lesson transcript will appear here with the final video upload.
              </p>
            </details>
          </div>

          <div className="space-y-3 lg:min-w-56">
            <MarkCompleteButton
              initiallyComplete={Boolean(progress?.completed)}
              lessonId={result.lesson.id}
            />
            {hasPdf && (
              <Button
                asChild
                className="h-11 w-full rounded-full border-[var(--border)] bg-white/40 px-6 text-[var(--primary)]"
                variant="outline"
              >
                <a href={`/api/download/${result.lesson.id}`}>
                  <Download aria-hidden="true" />
                  Download Guide
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="mt-14 flex items-center justify-between border-t border-[var(--border)] pt-8">
          {previous ? (
            <Link
              className="inline-flex items-center gap-2 text-sm text-[var(--primary)]"
              href={`/lesson/${previous.id}`}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {previous.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              className="inline-flex items-center gap-2 text-sm text-[var(--primary)]"
              href={`/lesson/${next.id}`}
            >
              {next.title}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          ) : (
            <Link className="text-sm text-[var(--primary)]" href="/library">
              Return to library
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
