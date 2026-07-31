"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

import { cn } from "@/lib/utils"

interface BackToTopProps {
  className?: string
}

export function BackToTop({ className }: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let animationFrame: number | null = null

    const updateVisibility = () => {
      animationFrame = null
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight

      setIsVisible(
        scrollableHeight > 0 && window.scrollY / scrollableHeight >= 0.5
      )
    }

    const requestUpdate = () => {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(updateVisibility)
      }
    }

    requestUpdate()
    window.addEventListener("scroll", requestUpdate, { passive: true })
    window.addEventListener("resize", requestUpdate)

    return () => {
      window.removeEventListener("scroll", requestUpdate)
      window.removeEventListener("resize", requestUpdate)

      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame)
      }
    }
  }, [])

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    })
  }

  return (
    <button
      aria-hidden={!isVisible}
      aria-label="Back to top"
      className={cn(
        "fixed right-5 bottom-5 z-40 grid size-10 place-items-center rounded-full bg-[var(--primary)]/90 text-[var(--background)] shadow-[0_12px_32px_rgba(43,39,36,0.2)] backdrop-blur transition-[opacity,transform,visibility] duration-300 outline-none hover:-translate-y-1 hover:bg-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] motion-reduce:transform-none motion-reduce:transition-none md:right-8 md:bottom-8",
        isVisible
          ? "visible translate-y-0 opacity-100"
          : "invisible translate-y-2 opacity-0",
        className
      )}
      onClick={scrollToTop}
      tabIndex={isVisible ? 0 : -1}
      type="button"
    >
      <ArrowUp aria-hidden="true" className="size-4" />
    </button>
  )
}
