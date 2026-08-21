import { HeroEntry } from "@/components/home/hero-entry"
import { createPageMetadata } from "@/lib/seo"
import { getPublishedHomepageFeature } from "@/lib/site-content"

export const revalidate = 3600

export const metadata = createPageMetadata({
  title: "HWL by SMD — Skincare, Yoga, Astrology & Retreats in Palm Springs",
  description:
    "Shannon Mary Dixon offers facial rituals, private yoga, astrology consultations, tarot readings, and retreat facilitation in Palm Springs, Joshua Tree, Yucca Valley, Desert Hot Springs, and Morongo Valley.",
  path: "/",
})

export default async function Page() {
  const featuredExperience = await getPublishedHomepageFeature()

  return <HeroEntry featuredExperience={featuredExperience} />
}
