"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

import { usePrefersReducedMotion } from "@/components/shared/motion-safe"

const phases = ["Inhale", "Hold", "Exhale", "Rest"] as const

interface BreathLoaderProps {
  durationMs?: number
  onComplete: () => void
}

export function BreathLoader({
  durationMs = 4000,
  onComplete,
}: BreathLoaderProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [isExiting, setIsExiting] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    const appShell = document.querySelector<HTMLElement>("[data-app-shell]")
    const appShellWasInert = appShell?.inert ?? false

    document.body.style.overflow = "hidden"
    document.documentElement.style.overflow = "hidden"
    if (appShell) appShell.inert = true

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
      if (appShell) appShell.inert = appShellWasInert

      window.requestAnimationFrame(() => {
        document.getElementById("main-content")?.focus({ preventScroll: true })
      })
    }
  }, [])

  useEffect(() => {
    const safeDuration = prefersReducedMotion
      ? Math.min(2000, durationMs)
      : durationMs
    const fadeDuration = prefersReducedMotion ? 200 : 600
    const phaseDuration = Math.max(250, safeDuration / phases.length)
    const phaseTimer = prefersReducedMotion
      ? null
      : window.setInterval(() => {
          setPhaseIndex((current) => (current + 1) % phases.length)
        }, phaseDuration)
    const exitTimer = window.setTimeout(
      () => setIsExiting(true),
      Math.max(0, safeDuration - fadeDuration)
    )
    const completeTimer = window.setTimeout(onComplete, safeDuration)

    return () => {
      if (phaseTimer !== null) window.clearInterval(phaseTimer)
      window.clearTimeout(exitTimer)
      window.clearTimeout(completeTimer)
    }
  }, [durationMs, onComplete, prefersReducedMotion])

  return createPortal(
    <div
      aria-live="polite"
      className="breath-loader"
      data-exiting={isExiting ? "true" : "false"}
      data-reduced-motion={prefersReducedMotion ? "true" : "false"}
      role="status"
    >
      <span className="sr-only">A brief pause.</span>
      <div aria-hidden="true" className="breath-loader__grain" />
      <div className="breath-loader__content">
        <span aria-hidden="true" className="breath-loader__circle" />
        <p className="breath-loader__label">
          {prefersReducedMotion ? "Taking a moment…" : "Take a breath."}
        </p>
        {!prefersReducedMotion ? (
          <p aria-hidden="true" className="breath-loader__phase">
            {phases[phaseIndex]}
          </p>
        ) : null}
      </div>
    </div>,
    document.body
  )
}
