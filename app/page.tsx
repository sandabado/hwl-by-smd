import { HeroEntry } from "@/components/home/hero-entry"
import { createPageMetadata } from "@/lib/seo"
import { getPublishedHomepageFeature } from "@/lib/site-content"

export const revalidate = 3600

export const metadata = createPageMetadata({
  title: "HWL by SMD — Body, Beauty & Being",
  description:
    "Beauty, movement and ritual practices, products and experiences by Shannon Mary Dixon, online and in Palm Springs, Joshua Tree and the surrounding desert.",
  path: "/",
})

export default async function Page() {
  const featuredExperience = await getPublishedHomepageFeature()

  return <HeroEntry featuredExperience={featuredExperience} />
}
