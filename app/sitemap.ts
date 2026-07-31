import type { MetadataRoute } from "next"

import { absoluteUrl } from "@/lib/seo"

const routes = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/experiences", changeFrequency: "monthly", priority: 0.9 },
  { path: "/beauty", changeFrequency: "monthly", priority: 0.9 },
  { path: "/body", changeFrequency: "monthly", priority: 0.9 },
  { path: "/being", changeFrequency: "monthly", priority: 0.9 },
  { path: "/retreats", changeFrequency: "monthly", priority: 0.9 },
  { path: "/journal", changeFrequency: "weekly", priority: 0.7 },
  { path: "/beauty/lift", changeFrequency: "monthly", priority: 0.9 },
  { path: "/store", changeFrequency: "weekly", priority: 0.9 },
  { path: "/book", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
] satisfies Array<{
  path: string
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>
  priority: number
}>

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, changeFrequency, priority }) => ({
    url: absoluteUrl(path),
    changeFrequency,
    priority,
  }))
}
