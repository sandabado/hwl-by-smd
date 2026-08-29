import type { Metadata } from "next"

import { AuthProvider } from "@/components/auth/auth-provider"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { SiteBreadcrumbs } from "@/components/layout/site-breadcrumbs"
import { SiteEffects } from "@/components/layout/site-effects"
import { SkipLink } from "@/components/layout/skip-link"
import { JsonLd } from "@/components/seo/json-ld"
import { LocalSchema } from "@/components/seo/local-schema"
import { MotionPreference } from "@/components/shared/motion-preference"
import { PageTransition } from "@/components/shared/page-transition"
import { createWebsiteJsonLd, SITE_URL } from "@/lib/seo"
import "leaflet/dist/leaflet.css"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "HWL by SMD — Body, Beauty & Being",
  description:
    "Beauty, movement and ritual practices, products and experiences by Shannon Mary Dixon, online and in Palm Springs, Joshua Tree and the surrounding desert.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "HWL by SMD — Body, Beauty & Being",
    description:
      "Beauty, movement and ritual practices, products and experiences by Shannon Mary Dixon, online and in Palm Springs, Joshua Tree and the surrounding desert.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "HWL by SMD — Beauty, Body, and Being",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HWL by SMD — Body, Beauty & Being",
    description:
      "Beauty, movement and ritual practices, products and experiences by Shannon Mary Dixon, online and in Palm Springs, Joshua Tree and the surrounding desert.",
    images: ["/og.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <LocalSchema />
        <JsonLd data={createWebsiteJsonLd()} id="site-schema" />
        <AuthProvider>
          <div className="flex min-h-screen flex-col" data-app-shell="">
            <SkipLink />
            <SiteEffects />
            <Header />
            <SiteBreadcrumbs />
            <main className="flex-1" id="main-content" tabIndex={-1}>
              <PageTransition>{children}</PageTransition>
            </main>
            <MotionPreference />
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
