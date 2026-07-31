import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/account",
        "/admin",
        "/api",
        "/auth",
        "/checkout",
        "/course",
        "/den",
        "/lesson",
        "/library",
        "/login",
        "/reset-password",
        "/the-den",
        "/update-password",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
