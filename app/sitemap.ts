import type { MetadataRoute } from "next"

import { absoluteUrl } from "@/lib/seo"

const routes = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/experiences", changeFrequency: "monthly", priority: 0.9 },
  { path: "/beauty", changeFrequency: "monthly", priority: 0.9 },
  { path: "/yoga", changeFrequency: "monthly", priority: 0.9 },
  { path: "/astrology", changeFrequency: "monthly", priority: 0.9 },
  { path: "/retreats", changeFrequency: "monthly", priority: 0.9 },
  { path: "/journal", changeFrequency: "weekly", priority: 0.7 },
  {
    path: "/journal/tarot-palm-springs",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/journal/sound-bath-joshua-tree",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/journal/desert-skincare",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  { path: "/beauty/lift", changeFrequency: "monthly", priority: 0.9 },
  { path: "/palm-springs", changeFrequency: "monthly", priority: 0.8 },
  { path: "/joshua-tree", changeFrequency: "monthly", priority: 0.8 },
  { path: "/yucca-valley", changeFrequency: "monthly", priority: 0.8 },
  {
    path: "/desert-hot-springs",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  { path: "/store", changeFrequency: "weekly", priority: 0.9 },
  { path: "/book", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/refund-policy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/health-disclaimer", changeFrequency: "yearly", priority: 0.2 },
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
