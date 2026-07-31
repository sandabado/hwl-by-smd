"use client"

import { useSyncExternalStore } from "react"

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

function subscribe(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY)
  const handleChange = () => onStoreChange()

  mediaQuery.addEventListener("change", handleChange)
  return () => mediaQuery.removeEventListener("change", handleChange)
}

function getSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

function getServerSnapshot() {
  // Render the calm, fully visible state until the browser can report a choice.
  return true
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
