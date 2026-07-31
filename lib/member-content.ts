import "server-only"

import { createAdminClient } from "@/lib/supabase/server"

export type CourseRecord = {
  access_tier: "lift" | "membership"
  category: "Beauty" | "Movement" | "Ritual"
  cover_image_url: string | null
  description: string
  id: string
  slug: string
  title: string
}

export type LessonRecord = {
  course_id: string
  description: string
  duration_seconds: number
  id: string
  order_index: number
  pdf_storage_path: string | null
  slug: string
  title: string
  video_playback_id: string | null
}

export async function getPublishedCourses() {
  const supabase = createAdminClient()
  if (!supabase) return [] as CourseRecord[]

  const { data } = await supabase
    .from("courses")
    .select(
      "id, title, slug, description, cover_image_url, category, access_tier"
    )
    .eq("published", true)
    .order("created_at", { ascending: true })

  return (data ?? []) as CourseRecord[]
}

export async function getCourseBySlug(slug: string) {
  const supabase = createAdminClient()
  if (!supabase) return null

  const { data: course } = await supabase
    .from("courses")
    .select(
      "id, title, slug, description, cover_image_url, category, access_tier"
    )
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle()

  if (!course) return null

  const { data: lessons } = await supabase
    .from("lessons")
    .select(
      "id, course_id, title, slug, description, video_playback_id, pdf_storage_path, duration_seconds, order_index"
    )
    .eq("course_id", course.id)
    .eq("published", true)
    .order("order_index", { ascending: true })

  return {
    course: course as CourseRecord,
    lessons: (lessons ?? []) as LessonRecord[],
  }
}

export async function getLessonById(id: string) {
  const supabase = createAdminClient()
  if (!supabase) return null

  const { data: lesson } = await supabase
    .from("lessons")
    .select(
      "id, course_id, title, slug, description, video_playback_id, pdf_storage_path, duration_seconds, order_index"
    )
    .eq("id", id)
    .eq("published", true)
    .maybeSingle()

  if (!lesson) return null

  const { data: course } = await supabase
    .from("courses")
    .select(
      "id, title, slug, description, cover_image_url, category, access_tier"
    )
    .eq("id", lesson.course_id)
    .eq("published", true)
    .maybeSingle()

  if (!course) return null

  const { data: siblings } = await supabase
    .from("lessons")
    .select(
      "id, course_id, title, slug, description, video_playback_id, pdf_storage_path, duration_seconds, order_index"
    )
    .eq("course_id", course.id)
    .eq("published", true)
    .order("order_index", { ascending: true })

  return {
    course: course as CourseRecord,
    lesson: lesson as LessonRecord,
    siblings: (siblings ?? []) as LessonRecord[],
  }
}
