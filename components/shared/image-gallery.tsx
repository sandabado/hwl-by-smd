"use client"

import { useEffect, useRef, useState } from "react"
import type { KeyboardEvent, PointerEvent } from "react"
import Image, { type ImageProps } from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export interface GalleryImage {
  alt: string
  blurDataURL?: string
  caption?: string
  preload?: boolean
  src: ImageProps["src"]
}

interface ImageGalleryProps {
  ariaLabel?: string
  aspectRatio?: string
  className?: string
  imageClassName?: string
  images: GalleryImage[]
  sizes?: string
}

export function ImageGallery({
  ariaLabel = "Image gallery",
  aspectRatio = "4 / 5",
  className,
  imageClassName,
  images,
  sizes = "(max-width: 640px) 82vw, (max-width: 1024px) 62vw, 45vw",
}: ImageGalleryProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const dragState = useRef({
    active: false,
    startScrollLeft: 0,
    startX: 0,
  })
  const [isDragging, setIsDragging] = useState(false)
  const [canScrollBackward, setCanScrollBackward] = useState(false)
  const [canScrollForward, setCanScrollForward] = useState(images.length > 1)

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    let animationFrame: number | null = null

    const updateControls = () => {
      animationFrame = null
      const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth

      setCanScrollBackward(scroller.scrollLeft > 2)
      setCanScrollForward(scroller.scrollLeft < maxScrollLeft - 2)
    }

    const requestUpdate = () => {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(updateControls)
      }
    }

    requestUpdate()
    scroller.addEventListener("scroll", requestUpdate, { passive: true })

    const resizeObserver = new ResizeObserver(requestUpdate)
    resizeObserver.observe(scroller)

    return () => {
      scroller.removeEventListener("scroll", requestUpdate)
      resizeObserver.disconnect()

      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame)
      }
    }
  }, [images.length])

  if (images.length === 0) return null

  const scrollOneFrame = (direction: -1 | 1) => {
    const scroller = scrollerRef.current
    if (!scroller) return

    const items = scroller.querySelectorAll<HTMLElement>("[data-gallery-item]")
    const distance =
      items.length > 1
        ? items[1].offsetLeft - items[0].offsetLeft
        : scroller.clientWidth * 0.8
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    scroller.scrollBy({
      left: distance * direction,
      behavior: reduceMotion ? "auto" : "smooth",
    })
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      scrollOneFrame(-1)
    }

    if (event.key === "ArrowRight") {
      event.preventDefault()
      scrollOneFrame(1)
    }
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const supportsDrag = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches

    if (!supportsDrag || event.button !== 0) return

    const scroller = event.currentTarget
    dragState.current = {
      active: true,
      startScrollLeft: scroller.scrollLeft,
      startX: event.clientX,
    }
    scroller.setPointerCapture(event.pointerId)
    setIsDragging(true)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return

    event.preventDefault()
    event.currentTarget.scrollLeft =
      dragState.current.startScrollLeft -
      (event.clientX - dragState.current.startX)
  }

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return

    dragState.current.active = false
    setIsDragging(false)

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <section
      aria-label={ariaLabel}
      className={cn("relative", className)}
      role="region"
    >
      <div className="mb-4 hidden justify-end gap-2 md:flex">
        <button
          aria-label="Previous image"
          className="grid size-10 place-items-center rounded-full border border-[var(--border)] bg-[var(--background)]/90 text-[var(--primary)] transition-colors outline-none hover:bg-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-35"
          disabled={!canScrollBackward}
          onClick={() => scrollOneFrame(-1)}
          type="button"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </button>
        <button
          aria-label="Next image"
          className="grid size-10 place-items-center rounded-full border border-[var(--border)] bg-[var(--background)]/90 text-[var(--primary)] transition-colors outline-none hover:bg-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-35"
          disabled={!canScrollForward}
          onClick={() => scrollOneFrame(1)}
          type="button"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </button>
      </div>

      <div
        aria-label={`${ariaLabel}. Use left and right arrow keys to browse.`}
        className={cn(
          "flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto overscroll-x-contain pb-4 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--background)] [&::-webkit-scrollbar]:hidden",
          isDragging ? "cursor-grabbing snap-none select-none" : "cursor-grab"
        )}
        onKeyDown={onKeyDown}
        onLostPointerCapture={stopDragging}
        onPointerCancel={stopDragging}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDragging}
        ref={scrollerRef}
        tabIndex={0}
      >
        {images.map((image, index) => (
          <figure
            aria-label={`${index + 1} of ${images.length}`}
            aria-roledescription="slide"
            className="w-[82%] shrink-0 snap-start sm:w-[62%] lg:w-[45%]"
            data-gallery-item=""
            key={`${String(image.src)}-${index}`}
            role="group"
          >
            <div
              className="relative overflow-hidden rounded-lg bg-[var(--muted)]"
              style={{ aspectRatio }}
            >
              <Image
                alt={image.alt}
                blurDataURL={image.blurDataURL}
                className={cn("object-cover", imageClassName)}
                draggable={false}
                fill
                placeholder={image.blurDataURL ? "blur" : "empty"}
                preload={image.preload}
                sizes={sizes}
                src={image.src}
              />
            </div>
            {image.caption ? (
              <figcaption className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                {image.caption}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </section>
  )
}
