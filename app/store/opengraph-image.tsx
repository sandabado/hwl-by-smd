import {
  createBrandOgImage,
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
} from "@/lib/og-image"

export const alt =
  "HWL by SMD beauty products, magical tools, and the complete LIFT ritual"
export const size = OG_IMAGE_SIZE
export const contentType = OG_IMAGE_CONTENT_TYPE

export default function OpenGraphImage() {
  return createBrandOgImage({
    eyebrow: "The Store",
    title: "Beauty, ritual, and practice for home.",
  })
}
