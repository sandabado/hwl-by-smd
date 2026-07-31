"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

interface CursorGlowProps {
  className?: string
}

export function CursorGlow({ className }: CursorGlowProps) {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)")
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let animationFrame: number | null = null
    let pointerX = 0
    let pointerY = 0

    const syncEnabledState = () => {
      const enabled = finePointer.matches && !reducedMotion.matches
      glow.hidden = !enabled

      if (!enabled) {
        glow.style.opacity = "0"
      }
    }

    const paint = () => {
      animationFrame = null
      glow.style.transform = `translate3d(${pointerX - 150}px, ${
        pointerY - 150
      }px, 0)`
      glow.style.opacity = "0.03"
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches) return

      pointerX = event.clientX
      pointerY = event.clientY

      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(paint)
      }
    }

    const hideGlow = () => {
      glow.style.opacity = "0"
    }

    syncEnabledState()
    finePointer.addEventListener("change", syncEnabledState)
    reducedMotion.addEventListener("change", syncEnabledState)
    window.addEventListener("pointermove", onPointerMove, { passive: true })
    document.documentElement.addEventListener("pointerleave", hideGlow)
    window.addEventListener("blur", hideGlow)

    return () => {
      finePointer.removeEventListener("change", syncEnabledState)
      reducedMotion.removeEventListener("change", syncEnabledState)
      window.removeEventListener("pointermove", onPointerMove)
      document.documentElement.removeEventListener("pointerleave", hideGlow)
      window.removeEventListener("blur", hideGlow)

      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame)
      }
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed top-0 left-0 z-30 size-[300px] rounded-full bg-[radial-gradient(circle,var(--accent)_0%,transparent_70%)] opacity-0 mix-blend-multiply transition-opacity duration-200 will-change-transform",
        className
      )}
      hidden
      ref={glowRef}
    />
  )
}
