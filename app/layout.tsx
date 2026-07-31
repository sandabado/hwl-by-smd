import type { Metadata } from "next"
import { Cormorant_Garamond, Inter } from "next/font/google"

import { AuthProvider } from "@/components/auth/auth-provider"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { SiteBreadcrumbs } from "@/components/layout/site-breadcrumbs"
import { SiteEffects } from "@/components/layout/site-effects"
import { SkipLink } from "@/components/layout/skip-link"
import { JsonLd } from "@/components/seo/json-ld"
import { PageTransition } from "@/components/shared/page-transition"
import { createOrganizationJsonLd, createWebsiteJsonLd } from "@/lib/seo"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://howlbysmd.com"
  ),
  title: "HWL by SMD | Beauty · Body · Being",
  description:
    "Luxury facial rituals, movement, and intentional wellness experiences designed to restore your glow from the inside out.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "HWL by SMD | Beauty · Body · Being",
    description:
      "Luxury facial rituals, movement, and intentional wellness experiences designed to restore your glow from the inside out.",
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
    title: "HWL by SMD | Beauty · Body · Being",
    description:
      "Luxury facial rituals, movement, and intentional wellness experiences designed to restore your glow from the inside out.",
    images: ["/og.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body>
        <SkipLink />
        <JsonLd
          data={[createOrganizationJsonLd(), createWebsiteJsonLd()]}
          id="site-schema"
        />
        <SiteEffects />
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <SiteBreadcrumbs />
            <main className="flex-1" id="main-content" tabIndex={-1}>
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
