import {
  createBrandOgImage,
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
} from "@/lib/og-image"

export const alt = "HWL by SMD — Beauty, Body, and Being"
export const size = OG_IMAGE_SIZE
export const contentType = OG_IMAGE_CONTENT_TYPE

export default function OpenGraphImage() {
  return createBrandOgImage({
    eyebrow: "Beauty · Body · Being",
    title: "Luxury wellness for the whole self.",
  })
}
