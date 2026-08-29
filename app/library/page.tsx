import type { Metadata } from "next"

import { CourseCard } from "@/components/member/course-card"
import { MemberNavigation } from "@/components/member/member-navigation"
import { requireAccess } from "@/lib/access"
import { getPublishedCourses } from "@/lib/member-content"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Ritual Library | HWL by SMD",
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { access } = await requireAccess("any_purchase", "/library")
  const { category } = await searchParams
  const courses = await getPublishedCourses()
  const visible = courses.filter(
    (course) =>
      (access.isMember ||
        (course.access_tier === "lift" && access.canAccessLift)) &&
      (!category || category === "All" || course.category === category)
  )

  return (
    <section className="member-atmosphere min-h-screen px-6 py-12 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs tracking-[0.3em] text-[var(--accent)] uppercase">
              Your private collection
            </p>
            <h1 className="mt-3 text-6xl font-medium text-[var(--primary)] md:text-8xl">
              The Library
            </h1>
          </div>
          <MemberNavigation />
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {["All", "Beauty", "Movement", "Ritual"].map((item) => (
            <a
              className="rounded-full border border-white/60 bg-white/45 px-4 py-2 text-xs text-[var(--primary)] backdrop-blur transition hover:bg-white/75"
              href={item === "All" ? "/library" : `/library?category=${item}`}
              key={item}
            >
              {item}
            </a>
          ))}
        </div>

        {visible.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((course) => (
              <CourseCard course={course} key={course.id} />
            ))}
          </div>
        ) : (
          <div className="den-card mt-10 rounded-[2rem] p-12 text-center">
            <p className="font-serif text-4xl text-[var(--primary)]">
              Shannon is filming now.
            </p>
            <p className="mt-3 text-[var(--muted-foreground)]">
              Check back soon. New practices will arrive quietly, right here.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
