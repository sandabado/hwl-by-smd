import type { Metadata } from "next"

export const SITE_URL = "https://howlbysmd.com"
export const SITE_NAME = "HWL by SMD"
export const DEFAULT_SOCIAL_IMAGE = "/og.png"

type JsonLdPrimitive = boolean | null | number | string

export type JsonLdNode = {
  [key: string]:
    | JsonLdNode
    | JsonLdPrimitive
    | readonly (JsonLdNode | JsonLdPrimitive)[]
    | undefined
}

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString()
}

export function createPageMetadata({
  title,
  description,
  path,
  image = DEFAULT_SOCIAL_IMAGE,
}: {
  title: string
  description: string
  path: string
  image?: string
}): Metadata {
  const canonical = absoluteUrl(path)
  const socialImage = absoluteUrl(image)

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: socialImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  }
}

export function createOrganizationJsonLd(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl(DEFAULT_SOCIAL_IMAGE),
    description:
      "Beauty, movement, ritual, and intentional wellness experiences with Shannon Mary Dixon.",
    email: "hello@howlbysmd.com",
    telephone: "+1-617-671-8636",
    sameAs: [
      "https://instagram.com/shannmarydix",
      "https://instagram.com/hwl.bysmd",
    ],
  }
}

export function createWebsiteJsonLd(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description:
      "Luxury facial rituals, movement, and intentional wellness experiences designed to restore your glow from the inside out.",
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-US",
  }
}

export function createPersonJsonLd({
  image = "/images/brand/shannon-smiling-portrait.webp",
}: {
  image?: string
} = {}): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/about#shannon`,
    name: "Shannon Mary Dixon",
    url: absoluteUrl("/about"),
    image: absoluteUrl(image),
    description:
      "Founder of HWL by SMD, a practice exploring beauty, body, and being.",
    worksFor: { "@id": `${SITE_URL}/#organization` },
    sameAs: [
      "https://instagram.com/shannmarydix",
      "https://instagram.com/hwl.bysmd",
    ],
  }
}

export function createServiceJsonLd({
  name,
  description,
  path,
  serviceType,
  image,
  areaServed = "Palm Springs and the Coachella Valley, California",
}: {
  name: string
  description: string
  path: string
  serviceType: string
  image?: string
  areaServed?: string
}): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(path)}#service`,
    name,
    description,
    url: absoluteUrl(path),
    serviceType,
    areaServed,
    provider: { "@id": `${SITE_URL}/#organization` },
    ...(image ? { image: absoluteUrl(image) } : {}),
  }
}

export function createProductJsonLd({
  id = "product",
  name,
  description,
  path,
  price,
  image = DEFAULT_SOCIAL_IMAGE,
  availability = "https://schema.org/InStock",
}: {
  id?: string
  name: string
  description: string
  path: string
  price: number | string
  image?: string
  availability?: string
}): JsonLdNode {
  const url = absoluteUrl(path)

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#${id}`,
    name,
    description,
    url,
    image: absoluteUrl(image),
    brand: { "@id": `${SITE_URL}/#organization` },
    offers: {
      "@type": "Offer",
      url,
      price: String(price),
      priceCurrency: "USD",
      availability,
    },
  }
}

export function createArticleJsonLd({
  headline,
  description,
  path,
  datePublished,
  dateModified = datePublished,
  image = DEFAULT_SOCIAL_IMAGE,
  articleSection,
}: {
  headline: string
  description: string
  path: string
  datePublished: string
  dateModified?: string
  image?: string
  articleSection?: string
}): JsonLdNode {
  const url = absoluteUrl(path)

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline,
    description,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    image: absoluteUrl(image),
    datePublished,
    dateModified,
    author: { "@id": `${SITE_URL}/about#shannon` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-US",
    ...(articleSection ? { articleSection } : {}),
  }
}
