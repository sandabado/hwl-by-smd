"use client"

import { useEffect, useState } from "react"

export default function ScrollIndicator() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 100) {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div
      aria-label="Scroll down"
      className="flex h-10 w-6 justify-center rounded-full border-2 border-white/60 pt-2 opacity-60"
      role="img"
    >
      <div className="animate-bounce-subtle h-2 w-1 rounded-full bg-white" />
    </div>
  )
}
