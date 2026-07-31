"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

interface ScrollProgressProps {
  className?: string
}

export function ScrollProgress({ className }: ScrollProgressProps) {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let animationFrame: number | null = null

    const updateProgress = () => {
      animationFrame = null

      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const progress =
        scrollableHeight > 0
          ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight))
          : 0

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`
      }
    }

    const requestUpdate = () => {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(updateProgress)
      }
    }

    requestUpdate()
    window.addEventListener("scroll", requestUpdate, { passive: true })
    window.addEventListener("resize", requestUpdate)

    const resizeObserver = new ResizeObserver(requestUpdate)
    resizeObserver.observe(document.documentElement)

    return () => {
      window.removeEventListener("scroll", requestUpdate)
      window.removeEventListener("resize", requestUpdate)
      resizeObserver.disconnect()

      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame)
      }
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[100] hidden h-[3px] md:block",
        className
      )}
    >
      <div
        className="h-full w-full origin-left scale-x-0 bg-[var(--accent)] transition-transform duration-150 ease-out motion-reduce:transition-none"
        ref={barRef}
      />
    </div>
  )
}
