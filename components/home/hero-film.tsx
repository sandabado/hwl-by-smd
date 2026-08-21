"use client"

import { useEffect, useRef, useState } from "react"
import { Pause, Play } from "lucide-react"

import { usePrefersReducedMotion } from "@/components/shared/motion-safe"
import { cn } from "@/lib/utils"

type NetworkInformation = {
  addEventListener?: (type: "change", listener: () => void) => void
  effectiveType?: string
  removeEventListener?: (type: "change", listener: () => void) => void
  saveData?: boolean
}

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformation
}

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: () => void) => number
}

const REDUCED_DATA_QUERY = "(prefers-reduced-data: reduce)"
const SLOW_CONNECTIONS = new Set(["slow-2g", "2g"])

export function HeroFilm({ source }: { source: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const manuallyPausedRef = useRef(false)
  const prefersReducedMotion = usePrefersReducedMotion()
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const reducedData = window.matchMedia(REDUCED_DATA_QUERY)
    const connection = (navigator as NavigatorWithConnection).connection
    let animationFrame: number | null = null

    const allowAutomaticPlayback = () => {
      const slowConnection = connection?.effectiveType
        ? SLOW_CONNECTIONS.has(connection.effectiveType)
        : false

      return (
        !prefersReducedMotion &&
        !reducedData.matches &&
        !connection?.saveData &&
        !slowConnection
      )
    }

    const syncPlaybackPolicy = () => {
      if (animationFrame !== null) cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(() => {
        setShouldLoad(allowAutomaticPlayback())
      })
    }

    if (document.readyState === "complete") {
      syncPlaybackPolicy()
    } else {
      window.addEventListener("load", syncPlaybackPolicy, { once: true })
    }

    reducedData.addEventListener("change", syncPlaybackPolicy)
    connection?.addEventListener?.("change", syncPlaybackPolicy)

    return () => {
      if (animationFrame !== null) cancelAnimationFrame(animationFrame)
      window.removeEventListener("load", syncPlaybackPolicy)
      reducedData.removeEventListener("change", syncPlaybackPolicy)
      connection?.removeEventListener?.("change", syncPlaybackPolicy)
    }
  }, [prefersReducedMotion])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (!shouldLoad) {
      video.pause()
      video.load()
      return
    }

    video.muted = true
    video.load()
    void video.play().catch(() => {
      setIsPlaying(false)
      setIsVisible(false)
    })
  }, [shouldLoad])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !shouldLoad) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          video.pause()
          return
        }

        if (
          !manuallyPausedRef.current &&
          document.visibilityState === "visible"
        ) {
          void video.play().catch(() => setIsPlaying(false))
        }
      },
      { threshold: 0.2 }
    )

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        video.pause()
      } else if (!manuallyPausedRef.current) {
        void video.play().catch(() => setIsPlaying(false))
      }
    }

    observer.observe(video)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      observer.disconnect()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [shouldLoad])

  function handlePlaying() {
    const video = videoRef.current as VideoWithFrameCallback | null
    setIsPlaying(true)

    if (video?.requestVideoFrameCallback) {
      video.requestVideoFrameCallback(() => setIsVisible(true))
    } else {
      setIsVisible(true)
    }
  }

  function handleToggle() {
    const video = videoRef.current
    if (!video) return

    if (!shouldLoad) {
      manuallyPausedRef.current = false
      setShouldLoad(true)
      return
    }

    if (video.paused) {
      manuallyPausedRef.current = false
      void video.play().catch(() => setIsPlaying(false))
    } else {
      manuallyPausedRef.current = true
      video.pause()
    }
  }

  return (
    <>
      <div aria-hidden="true" className="hero-film absolute inset-0">
        <video
          autoPlay
          className="hero-film__video"
          data-visible={isVisible}
          disablePictureInPicture
          id="hero-film"
          loop
          muted
          onError={() => {
            setIsPlaying(false)
            setIsVisible(false)
          }}
          onPause={() => setIsPlaying(false)}
          onPlaying={handlePlaying}
          playsInline
          preload="none"
          ref={videoRef}
          tabIndex={-1}
        >
          {shouldLoad ? <source src={source} type="video/mp4" /> : null}
        </video>
      </div>

      <button
        aria-controls="hero-film"
        aria-label={
          isPlaying ? "Pause background film" : "Play background film"
        }
        aria-pressed={isPlaying}
        className={cn(
          "absolute top-20 right-4 z-20 grid size-11 place-items-center rounded-full border border-white/40 bg-[#102a20]/80 text-white shadow-[0_10px_30px_rgba(5,14,9,0.25)] transition hover:bg-[#102a20]/95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:top-auto md:right-8 md:bottom-8",
          !shouldLoad && "bg-[#102a20]/90"
        )}
        onClick={handleToggle}
        type="button"
      >
        {isPlaying ? (
          <Pause aria-hidden="true" className="size-4" />
        ) : (
          <Play aria-hidden="true" className="ml-0.5 size-4" />
        )}
      </button>
    </>
  )
}
