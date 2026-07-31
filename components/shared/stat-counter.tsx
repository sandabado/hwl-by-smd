"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { cn } from "@/lib/utils"

interface StatCounterProps {
  className?: string
  duration?: number
  label?: string
  locale?: string
  prefix?: string
  suffix?: string
  value: number
}

export function StatCounter({
  className,
  duration = 1500,
  label,
  locale = "en-US",
  prefix = "",
  suffix = "",
  value,
}: StatCounterProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [displayValue, setDisplayValue] = useState(0)
  const decimalPlaces = Math.min(
    3,
    Number.isInteger(value) ? 0 : (String(value).split(".")[1]?.length ?? 0)
  )
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        maximumFractionDigits: decimalPlaces,
        minimumFractionDigits: decimalPlaces,
      }),
    [decimalPlaces, locale]
  )
  const accessibleValue = `${prefix}${formatter.format(value)}${suffix}${
    label ? `, ${label}` : ""
  }`

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let animationFrame: number | null = null
    let hasAnimated = false

    const animate = () => {
      if (hasAnimated) return
      hasAnimated = true

      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        duration <= 0
      ) {
        setDisplayValue(value)
        return
      }

      const startTime = performance.now()
      const tick = (now: number) => {
        const progress = Math.min(1, (now - startTime) / duration)
        const easedProgress = 1 - Math.pow(1 - progress, 3)

        setDisplayValue(value * easedProgress)

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(tick)
        } else {
          setDisplayValue(value)
          animationFrame = null
        }
      }

      animationFrame = window.requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate()
          observer.disconnect()
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.25 }
    )

    observer.observe(container)

    return () => {
      observer.disconnect()

      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame)
      }
    }
  }, [duration, value])

  return (
    <div
      aria-label={accessibleValue}
      className={cn("text-center", className)}
      ref={containerRef}
      role="group"
    >
      <span
        aria-hidden="true"
        className="block font-serif text-4xl leading-none font-medium text-[var(--primary)] md:text-5xl"
      >
        {prefix}
        {formatter.format(displayValue)}
        {suffix}
      </span>
      {label ? (
        <span
          aria-hidden="true"
          className="mt-3 block text-xs font-medium tracking-[0.18em] text-[var(--muted-foreground)] uppercase"
        >
          {label}
        </span>
      ) : null}
    </div>
  )
}
