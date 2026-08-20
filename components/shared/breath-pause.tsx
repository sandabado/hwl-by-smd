"use client"

import { useEffect, useRef, useState } from "react"

import { usePrefersReducedMotion } from "@/components/shared/motion-safe"
import { cn } from "@/lib/utils"

interface BreathPauseProps {
  className?: string
  text: string
}

export function BreathPause({ className, text }: BreathPauseProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const wasVisibleRef = useRef(false)
  const [cycle, setCycle] = useState(0)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const node = sectionRef.current
    if (!node || prefersReducedMotion) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !wasVisibleRef.current) {
          wasVisibleRef.current = true
          setCycle((current) => current + 1)
          return
        }

        if (!entry.isIntersecting) wasVisibleRef.current = false
      },
      { threshold: 0.35 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [prefersReducedMotion])

  return (
    <section className={cn("breath-pause", className)} ref={sectionRef}>
      <span
        aria-hidden="true"
        className="breath-pause__circle"
        data-active={cycle > 0 && !prefersReducedMotion ? "true" : "false"}
        key={cycle}
      />
      <p className="breath-pause__text">{text}</p>
    </section>
  )
}
