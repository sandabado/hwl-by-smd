import {
  createBrandOgImage,
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
} from "@/lib/og-image"

export const alt = "Tarot, astrology, and ritual by HWL by SMD"
export const size = OG_IMAGE_SIZE
export const contentType = OG_IMAGE_CONTENT_TYPE

export default function OpenGraphImage() {
  return createBrandOgImage({
    eyebrow: "Tarot · Being",
    title: "Ancient wisdom for modern life.",
  })
}
