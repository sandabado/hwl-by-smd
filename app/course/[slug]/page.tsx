import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Check, Circle, Clock3 } from "lucide-react"

import { ContentLicenseNote } from "@/components/member/content-license-note"
import { MemberNavigation } from "@/components/member/member-navigation"
import { PrivateVideoPlayer } from "@/components/video/private-video-player"
import { requireAccess } from "@/lib/access"
import { media } from "@/lib/media"
import { getCourseBySlug } from "@/lib/member-content"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

function minutes(seconds: number) {
  return Math.max(1, Math.round(seconds / 60))
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { access, user } = await requireAccess(
    "authenticated",
    `/course/${slug}`
  )
  const result = await getCourseBySlug(slug)
  if (!result) notFound()
  if (result.course.access_tier === "membership" && !access.isMember) {
    redirect("/store?access=membership_only")
  }
  if (result.course.access_tier === "lift" && !access.canAccessLift) {
    redirect("/beauty/lift?access=lift_guide_only")
  }

  const supabase = await createClient()
  const lessonIds = result.lessons.map((lesson) => lesson.id)
  const { data: progress } =
    lessonIds.length && supabase
      ? await supabase
          .from("user_progress")
          .select("lesson_id, completed")
          .eq("user_id", user.id)
          .in("lesson_id", lessonIds)
      : { data: [] }
  const completed = new Set(
    (progress ?? [])
      .filter((item) => item.completed)
      .map((item) => item.lesson_id)
  )
  const isLiftCourse = result.course.access_tier === "lift"
  const liftCaptionsReady = Boolean(
    process.env.LIFT_VIDEO_CAPTIONS_STORAGE_PATH
  )

  return (
    <section className="member-atmosphere min-h-screen px-6 py-12 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex justify-end">
          <MemberNavigation />
        </div>
        <div className="mt-12 max-w-3xl">
          <p className="text-xs tracking-[0.3em] text-[var(--accent)] uppercase">
            {result.course.category} · {result.lessons.length} lessons
          </p>
          <h1 className="mt-5 text-6xl leading-none font-medium text-[var(--primary)] md:text-8xl">
            {result.course.title}
          </h1>
          <p className="mt-7 text-lg leading-relaxed text-[var(--muted-foreground)]">
            {result.course.description}
          </p>
        </div>

        {isLiftCourse ? (
          <section className="mt-14" aria-labelledby="complete-lift-video">
            <div className="mb-7 max-w-3xl">
              <p className="text-xs tracking-[0.28em] text-[var(--accent)] uppercase">
                Complete guided practice
              </p>
              <h2
                className="mt-3 text-4xl font-medium text-[var(--primary)] md:text-5xl"
                id="complete-lift-video"
              >
                Practice all seven movements with Shannon.
              </h2>
            </div>
            <PrivateVideoPlayer
              captionsSource={
                liftCaptionsReady ? "/api/video/lift/captions" : undefined
              }
              poster={media.editorial.liftVideoPreview.src}
              source="/api/video/lift"
              title="Complete LIFT guided facial massage practice"
            />
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--muted-foreground)]">
              Written instructions for every movement are available in your
              downloadable LIFT Guide PDF. English captions are planned as a
              Phase 2 accessibility enhancement.
            </p>
            <ContentLicenseNote className="mt-5" />
          </section>
        ) : null}

        <div className="mt-14 grid gap-4">
          {result.lessons.length ? (
            result.lessons.map((lesson, index) => {
              const done = completed.has(lesson.id)
              return (
                <Link
                  className="den-card group grid items-center gap-5 rounded-[1.5rem] p-5 transition hover:-translate-y-0.5 md:grid-cols-[auto_1fr_auto]"
                  href={`/lesson/${lesson.id}`}
                  key={lesson.id}
                >
                  <span className="grid size-11 place-items-center rounded-full bg-white/60 font-serif text-lg text-[var(--primary)]">
                    {done ? (
                      <Check
                        className="size-4 text-[#52694d]"
                        aria-hidden="true"
                      />
                    ) : (
                      String(index + 1).padStart(2, "0")
                    )}
                  </span>
                  <div>
                    <h2 className="text-2xl text-[var(--primary)]">
                      {lesson.title}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      {lesson.description}
                    </p>
                  </div>
                  <span className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    <Clock3 className="size-4" aria-hidden="true" />
                    {minutes(lesson.duration_seconds)} min
                    {!done && (
                      <Circle className="ml-2 size-3" aria-hidden="true" />
                    )}
                  </span>
                </Link>
              )
            })
          ) : (
            <p className="den-card rounded-[1.5rem] p-6 leading-relaxed text-[var(--muted-foreground)]">
              This course is resting while Shannon prepares its first lesson.
              You can return to the library whenever you like.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
