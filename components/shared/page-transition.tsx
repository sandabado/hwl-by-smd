"use client"

import { useCallback, useEffect, useLayoutEffect, useState } from "react"
import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

import { BreathLoader } from "@/components/shared/breath-loader"
import { allowsAmbientMotion } from "@/lib/motion-policy"
import { cn } from "@/lib/utils"

const BREATH_SESSION_KEY = "hwl_breathed"

type EntryBreathState = "checking" | "complete" | "showing"

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

function RouteReveal({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setIsVisible(true)
    })

    return () => window.cancelAnimationFrame(animationFrame)
  }, [])

  return (
    <div
      className={cn(
        "transition-[opacity,transform] duration-[400ms] ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        className
      )}
      data-page-transition=""
    >
      {children}
    </div>
  )
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()
  const loaderIsExcluded = !allowsAmbientMotion(pathname)
  const [entryBreathState, setEntryBreathState] =
    useState<EntryBreathState>("checking")

  const completeEntryBreath = useCallback(() => {
    try {
      window.sessionStorage.setItem(BREATH_SESSION_KEY, "true")
    } catch {
      // The one-time pause still completes if session storage is unavailable.
    }

    setEntryBreathState("complete")
  }, [])

  useLayoutEffect(() => {
    let cancelled = false
    let nextState: EntryBreathState = "complete"

    if (!loaderIsExcluded) {
      try {
        nextState =
          window.sessionStorage.getItem(BREATH_SESSION_KEY) === "true"
            ? "complete"
            : "showing"
      } catch {
        nextState = "showing"
      }
    }

    queueMicrotask(() => {
      if (!cancelled) setEntryBreathState(nextState)
    })

    return () => {
      cancelled = true
    }
  }, [loaderIsExcluded])

  return (
    <>
      {entryBreathState === "showing" && !loaderIsExcluded ? (
        <BreathLoader onComplete={completeEntryBreath} />
      ) : null}
      <RouteReveal className={className} key={pathname}>
        {children}
      </RouteReveal>
    </>
  )
}
