"use client"

import { useEffect, useRef } from "react"
import Image, { type ImageProps } from "next/image"

import { cn } from "@/lib/utils"

type ParallaxImageSource =
  | {
      alt: string
      src: ImageProps["src"]
    }
  | {
      alt?: string
      src?: undefined
    }

export type ParallaxImageProps = ParallaxImageSource & {
  aspectRatio?: string
  blurDataURL?: string
  className?: string
  imageClassName?: string
  placeholder?: ImageProps["placeholder"]
  preload?: boolean
  quality?: number
  sizes?: string
  speed?: number
}

export function ParallaxImage({
  alt = "",
  aspectRatio = "4 / 5",
  blurDataURL,
  className,
  imageClassName,
  placeholder,
  preload = false,
  quality = 75,
  sizes = "(max-width: 768px) 100vw, 50vw",
  speed = 0.18,
  src,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const layer = layerRef.current
    if (!container || !layer) return

    const motionDisabled = window.matchMedia(
      "(prefers-reduced-motion: reduce), (pointer: coarse)"
    )
    const safeSpeed = Math.min(0.3, Math.max(0.1, speed))
    let isNearViewport = false
    let animationFrame: number | null = null

    const reset = () => {
      layer.style.transform = "translate3d(0, 0, 0)"
    }

    const updatePosition = () => {
      animationFrame = null

      if (!isNearViewport || motionDisabled.matches) {
        reset()
        return
      }

      const rect = container.getBoundingClientRect()
      const elementCenter = rect.top + rect.height / 2
      const viewportCenter = window.innerHeight / 2
      const maxOffset = Math.min(48, rect.height * 0.08)
      const offset = Math.max(
        -maxOffset,
        Math.min(maxOffset, (viewportCenter - elementCenter) * safeSpeed)
      )

      layer.style.transform = `translate3d(0, ${offset}px, 0)`
    }

    const requestUpdate = () => {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(updatePosition)
      }
    }

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isNearViewport = entry.isIntersecting
        requestUpdate()
      },
      { rootMargin: "25% 0px" }
    )

    const onMotionPreferenceChange = () => {
      if (motionDisabled.matches) {
        reset()
      } else {
        requestUpdate()
      }
    }

    intersectionObserver.observe(container)
    motionDisabled.addEventListener("change", onMotionPreferenceChange)
    window.addEventListener("scroll", requestUpdate, { passive: true })
    window.addEventListener("resize", requestUpdate)
    requestUpdate()

    return () => {
      intersectionObserver.disconnect()
      motionDisabled.removeEventListener("change", onMotionPreferenceChange)
      window.removeEventListener("scroll", requestUpdate)
      window.removeEventListener("resize", requestUpdate)

      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame)
      }
    }
  }, [speed])

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-[var(--muted)]",
        className
      )}
      ref={containerRef}
      style={{ aspectRatio }}
    >
      <div
        aria-hidden={!src && !alt ? "true" : undefined}
        aria-label={!src && alt ? alt : undefined}
        className="absolute inset-x-0 -inset-y-[10%] will-change-transform motion-reduce:transform-none"
        ref={layerRef}
        role={!src && alt ? "img" : undefined}
      >
        {src ? (
          <Image
            alt={alt}
            blurDataURL={blurDataURL}
            className={cn("object-cover", imageClassName)}
            fill
            placeholder={placeholder ?? (blurDataURL ? "blur" : "empty")}
            preload={preload}
            quality={quality}
            sizes={sizes}
            src={src}
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--muted)_0%,color-mix(in_srgb,var(--accent)_16%,var(--muted))_48%,var(--background)_100%)]" />
        )}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_58%,rgba(43,39,36,0.08))]"
      />
    </div>
  )
}
