import Link from "next/link"
import { ArrowUpRight, LockKeyhole } from "lucide-react"

import type { CourseRecord } from "@/lib/member-content"

export function CourseCard({
  course,
  locked = false,
  progress = 0,
}: {
  course: CourseRecord
  locked?: boolean
  progress?: number
}) {
  const content = (
    <article className="den-card group h-full rounded-[2rem] p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(90,74,63,0.13)]">
      <div className="flex items-center justify-between">
        <span className="rounded-full border border-[var(--border)] bg-white/40 px-3 py-1 text-[10px] tracking-[0.2em] text-[var(--accent)] uppercase">
          {course.category}
        </span>
        {locked ? (
          <LockKeyhole
            className="size-4 text-[var(--accent)]"
            aria-hidden="true"
          />
        ) : (
          <ArrowUpRight
            className="size-4 text-[var(--accent)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        )}
      </div>
      <h3 className="mt-7 text-3xl font-medium text-[var(--primary)]">
        {course.title}
      </h3>
      <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
        {course.description}
      </p>
      {!locked && (
        <div className="mt-7">
          <div className="h-1 overflow-hidden rounded-full bg-[var(--muted)]">
            <div
              className="h-full rounded-full bg-[var(--accent)]"
              style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] tracking-[0.18em] text-[var(--muted-foreground)] uppercase">
            {progress ? `${progress}% complete` : "Ready when you are"}
          </p>
        </div>
      )}
    </article>
  )

  return locked ? (
    content
  ) : (
    <Link href={`/course/${course.slug}`}>{content}</Link>
  )
}
