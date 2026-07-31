"use client"

import { usePathname } from "next/navigation"

import {
  Breadcrumbs,
  type BreadcrumbItem,
} from "@/components/shared/breadcrumbs"

const LABELS: Record<string, string> = {
  about: "About",
  account: "Account",
  beauty: "Beauty",
  being: "Being",
  body: "Body",
  book: "Book",
  contact: "Contact",
  connection: "Connection Hub",
  course: "Course",
  experiences: "Experiences",
  journal: "Journal",
  lesson: "Lesson",
  library: "Library",
  lift: "LIFT Guide",
  movement: "Movement",
  preferences: "Preferences",
  privacy: "Privacy",
  retreats: "Retreats",
  ritual: "Ritual",
  store: "Products",
  terms: "Terms",
  "the-den": "The Den",
}

const HIDDEN_PREFIXES = [
  "/about",
  "/admin",
  "/api",
  "/auth",
  "/beauty",
  "/being",
  "/body",
  "/book",
  "/checkout",
  "/contact",
  "/journal",
  "/login",
  "/reset-password",
  "/retreats",
  "/store",
  "/the-den",
  "/update-password",
]

function humanize(segment: string) {
  return (
    LABELS[segment] ??
    segment
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase())
  )
}

export function SiteBreadcrumbs() {
  const pathname = usePathname()

  if (
    pathname === "/" ||
    HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return null
  }

  const segments = pathname.split("/").filter(Boolean)
  const items: BreadcrumbItem[] = segments.map((segment, index) => {
    const isOpaqueId =
      segment.length > 24 || /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(segment)
    const parent = segments[index - 1]
    const label = isOpaqueId
      ? parent === "lesson"
        ? "Lesson"
        : parent === "course"
          ? "Course"
          : "Details"
      : humanize(segment)

    return {
      href:
        index < segments.length - 1
          ? `/${segments.slice(0, index + 1).join("/")}`
          : undefined,
      label,
    }
  })

  return (
    <Breadcrumbs className="mx-auto w-full max-w-7xl px-6 py-3" items={items} />
  )
}
