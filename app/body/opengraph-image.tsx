import {
  createBrandOgImage,
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
} from "@/lib/og-image"

export const alt = "Body experiences by HWL by SMD"
export const size = OG_IMAGE_SIZE
export const contentType = OG_IMAGE_CONTENT_TYPE

export default function OpenGraphImage() {
  return createBrandOgImage({
    eyebrow: "Body",
    title: "Movement as medicine.",
  })
}
