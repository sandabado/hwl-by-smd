"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

import { allowsAmbientMotion } from "@/lib/motion-policy"

const MOTION_PREFERENCE_ACKNOWLEDGED = "motion_pref_acknowledged"

export function MotionPreference() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!allowsAmbientMotion(pathname)) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let isCurrent = true

    function updateVisibility() {
      let acknowledged = false

      try {
        acknowledged =
          window.sessionStorage.getItem(MOTION_PREFERENCE_ACKNOWLEDGED) ===
          "true"
      } catch {
        // Session storage can be unavailable in privacy-restricted contexts.
      }

      if (isCurrent) {
        setIsVisible(reducedMotion.matches && !acknowledged)
      }
    }

    queueMicrotask(updateVisibility)
    reducedMotion.addEventListener("change", updateVisibility)

    return () => {
      isCurrent = false
      reducedMotion.removeEventListener("change", updateVisibility)
    }
  }, [pathname])

  function dismiss() {
    try {
      window.sessionStorage.setItem(MOTION_PREFERENCE_ACKNOWLEDGED, "true")
    } catch {
      // The notice still dismisses for the current render if storage is blocked.
    }

    setIsVisible(false)
  }

  if (!isVisible || !allowsAmbientMotion(pathname)) return null

  return (
    <aside
      className="bg-muted/50 px-4 py-2 text-xs text-muted-foreground"
      role="status"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <p>Motion is softened for you.</p>
        <button
          aria-label="Dismiss motion preference notice"
          className="rounded-full px-2 py-1 font-medium text-foreground transition-colors hover:bg-muted"
          onClick={dismiss}
          type="button"
        >
          Okay
        </button>
      </div>
    </aside>
  )
}
