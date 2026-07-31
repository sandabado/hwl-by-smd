"use client"

import { useEffect, useRef, useState } from "react"
import type { CSSProperties, ReactNode, Ref } from "react"

import { usePrefersReducedMotion } from "@/components/shared/motion-safe"
import { cn } from "@/lib/utils"

type RevealElement = "article" | "div" | "li" | "section"

interface RevealProps {
  as?: RevealElement
  children: ReactNode
  className?: string
  delay?: number
}

export function Reveal({
  as = "div",
  children,
  className,
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (prefersReducedMotion) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setIsVisible(true)
        observer.unobserve(node)
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [prefersReducedMotion])

  const style = {
    "--reveal-delay": `${Math.min(800, Math.max(0, delay))}ms`,
  } as CSSProperties

  const sharedProps = {
    className: cn("somatic-reveal", className),
    "data-reveal": prefersReducedMotion || isVisible ? "visible" : "pending",
    style,
  }

  if (as === "article") {
    return (
      <article ref={ref as Ref<HTMLElement>} {...sharedProps}>
        {children}
      </article>
    )
  }

  if (as === "li") {
    return (
      <li ref={ref as Ref<HTMLLIElement>} {...sharedProps}>
        {children}
      </li>
    )
  }

  if (as === "section") {
    return (
      <section ref={ref as Ref<HTMLElement>} {...sharedProps}>
        {children}
      </section>
    )
  }

  return (
    <div ref={ref as Ref<HTMLDivElement>} {...sharedProps}>
      {children}
    </div>
  )
}
