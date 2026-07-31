import {
  createBrandOgImage,
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
} from "@/lib/og-image"

export const alt = "HWL by SMD products and The Den membership"
export const size = OG_IMAGE_SIZE
export const contentType = OG_IMAGE_CONTENT_TYPE

export default function OpenGraphImage() {
  return createBrandOgImage({
    eyebrow: "Products",
    title: "Begin with one intentional ritual.",
  })
}
