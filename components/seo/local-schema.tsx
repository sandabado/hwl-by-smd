import { JsonLd } from "@/components/seo/json-ld"
import { SITE_CONFIG } from "@/lib/constants"
import { absoluteUrl, SITE_NAME, SITE_URL, type JsonLdNode } from "@/lib/seo"

export const SERVICE_AREAS = [
  "Palm Springs",
  "Joshua Tree",
  "Yucca Valley",
  "Desert Hot Springs",
  "Morongo Valley",
] as const

const offers = [
  {
    name: "Facial Rituals and Skincare",
    path: "/beauty",
    serviceType: "Facial rituals, lymphatic care, and skin consultation",
  },
  {
    name: "Private Yoga",
    path: "/yoga",
    serviceType: "Private yoga and restorative movement",
  },
  {
    name: "Sound Bath",
    path: "/yoga",
    serviceType: "Private sound bath sessions",
  },
  {
    name: "Tarot and Astrology Consultations",
    path: "/tarot",
    serviceType: "Tarot readings, astrology consultations, and ritual ceremony",
  },
  {
    name: "Wellness Retreat Facilitation",
    path: "/retreats",
    serviceType: "Custom wellness programming for retreats and private groups",
  },
] as const

export function createLocalBusinessJsonLd(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: "HWL by Shannon Mary Dixon",
    url: absoluteUrl("/"),
    image: absoluteUrl("/images/brand/shannon-window-portrait.webp"),
    logo: absoluteUrl("/og.png"),
    description:
      "Facial rituals, private yoga, tarot readings, and retreat facilitation with Shannon Mary Dixon in Palm Springs and the surrounding desert communities.",
    email: SITE_CONFIG.email,
    telephone: "+1-617-671-8636",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Palm Springs",
      addressRegion: "CA",
      addressCountry: "US",
    },
    areaServed: SERVICE_AREAS.map((name) => ({
      "@type": "Place",
      name,
      containedInPlace: {
        "@type": "State",
        name: "California",
      },
    })),
    founder: {
      "@type": "Person",
      "@id": `${SITE_URL}/about#shannon`,
      name: "Shannon Mary Dixon",
      url: absoluteUrl("/about"),
    },
    makesOffer: offers.map(({ name, path, serviceType }) => ({
      "@type": "Offer",
      url: absoluteUrl(path),
      itemOffered: {
        "@type": "Service",
        name,
        serviceType,
        url: absoluteUrl(path),
        provider: { "@id": `${SITE_URL}/#organization` },
      },
    })),
    sameAs: [SITE_CONFIG.instagramPersonalUrl, SITE_CONFIG.instagramBrandUrl],
  }
}

export function LocalSchema() {
  return (
    <JsonLd data={createLocalBusinessJsonLd()} id="local-business-schema" />
  )
}
