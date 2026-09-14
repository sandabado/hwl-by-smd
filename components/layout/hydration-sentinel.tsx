"use client"

import { useEffect, useRef } from "react"

export function HydrationSentinel() {
  const sentinelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    sentinel?.setAttribute("data-hwl-hydrated", "true")

    return () => sentinel?.removeAttribute("data-hwl-hydrated")
  }, [])

  return (
    <span
      ref={sentinelRef}
      aria-hidden="true"
      data-hwl-hydration-sentinel=""
      hidden
    />
  )
}
