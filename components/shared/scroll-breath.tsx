"use client"

import { useEffect, useState } from "react"

type StillnessMessage = "hidden" | "still" | "breath" | "no-rush"

const messageByState: Record<StillnessMessage, string> = {
  hidden: "",
  still: "Still here.",
  breath: "Take a breath.",
  "no-rush": "No rush.",
}

export function ScrollBreath() {
  const [message, setMessage] = useState<StillnessMessage>("hidden")
  const [isScrolling, setIsScrolling] = useState(false)

  useEffect(() => {
    const desktopMotion = window.matchMedia(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)"
    )

    if (!desktopMotion.matches) return

    let settleTimer: number | null = null
    let breathTimer: number | null = null
    let noRushTimer: number | null = null

    const clearTimers = () => {
      if (settleTimer !== null) window.clearTimeout(settleTimer)
      if (breathTimer !== null) window.clearTimeout(breathTimer)
      if (noRushTimer !== null) window.clearTimeout(noRushTimer)
    }

    const onScroll = () => {
      clearTimers()
      setIsScrolling(true)
      setMessage("hidden")

      settleTimer = window.setTimeout(() => {
        setIsScrolling(false)
        setMessage("still")
        breathTimer = window.setTimeout(() => setMessage("breath"), 3000)
        noRushTimer = window.setTimeout(() => setMessage("no-rush"), 8000)
      }, 2000)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      clearTimers()
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="scroll-breath"
      data-scrolling={isScrolling ? "true" : "false"}
      data-visible={message === "hidden" ? "false" : "true"}
    >
      <span className="scroll-breath__circle" />
      <span className="scroll-breath__message">{messageByState[message]}</span>
    </div>
  )
}
