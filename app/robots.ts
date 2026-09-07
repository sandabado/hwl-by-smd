import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  const privatePaths = [
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
  ]

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: privatePaths },
      {
        userAgent: ["OAI-SearchBot", "Google-Extended", "GPTBot", "CCBot"],
        allow: "/",
        disallow: privatePaths,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
