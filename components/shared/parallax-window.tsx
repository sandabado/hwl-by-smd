import type { ImageProps } from "next/image"

import { ParallaxImage } from "@/components/shared/parallax-image"
import {
  TextureOverlay,
  type TextureVariant,
} from "@/components/shared/texture-overlay"
import { cn } from "@/lib/utils"

interface ParallaxWindowProps {
  alt: string
  aspectRatio?: string
  className?: string
  frame?: "dark" | "none" | "soft"
  imageClassName?: string
  preload?: boolean
  quality?: number
  sizes?: string
  speed?: number
  src: ImageProps["src"]
  texture?: TextureVariant
}

export function ParallaxWindow({
  alt,
  aspectRatio = "4 / 5",
  className,
  frame = "soft",
  imageClassName,
  preload = false,
  quality = 75,
  sizes,
  speed = 0.15,
  src,
  texture = "grain",
}: ParallaxWindowProps) {
  return (
    <div className={cn("somatic-window", className)} data-window-frame={frame}>
      <ParallaxImage
        alt={alt}
        aspectRatio={aspectRatio}
        className="rounded-[inherit]"
        imageClassName={imageClassName}
        preload={preload}
        quality={quality}
        sizes={sizes}
        speed={speed}
        src={src}
      />
      <TextureOverlay intensity="subtle" variant={texture} />
    </div>
  )
}
