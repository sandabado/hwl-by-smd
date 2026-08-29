"use client"

import { useEffect, useRef, useState } from "react"

import { usePrefersReducedMotion } from "@/components/shared/motion-safe"

type NetworkInformation = {
  addEventListener?: (type: "change", listener: () => void) => void
  effectiveType?: string
  removeEventListener?: (type: "change", listener: () => void) => void
  saveData?: boolean
}

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformation
}

const REDUCED_DATA_QUERY = "(prefers-reduced-data: reduce)"
const SLOW_CONNECTIONS = new Set(["slow-2g", "2g"])

export function LiftPreviewFilm({
  poster,
  source,
}: {
  poster: string
  source: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const [allowsAutomaticPlayback, setAllowsAutomaticPlayback] = useState(false)
  const [isNearViewport, setIsNearViewport] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const shouldLoad = allowsAutomaticPlayback && isNearViewport

  useEffect(() => {
    const reducedData = window.matchMedia(REDUCED_DATA_QUERY)
    const connection = (navigator as NavigatorWithConnection).connection

    const syncPlaybackPolicy = () => {
      const slowConnection = connection?.effectiveType
        ? SLOW_CONNECTIONS.has(connection.effectiveType)
        : false

      setAllowsAutomaticPlayback(
        !prefersReducedMotion &&
          !reducedData.matches &&
          !connection?.saveData &&
          !slowConnection
      )
    }

    syncPlaybackPolicy()
    reducedData.addEventListener("change", syncPlaybackPolicy)
    connection?.addEventListener?.("change", syncPlaybackPolicy)

    return () => {
      reducedData.removeEventListener("change", syncPlaybackPolicy)
      connection?.removeEventListener?.("change", syncPlaybackPolicy)
    }
  }, [prefersReducedMotion])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return

        setIsNearViewport(true)
        observer.disconnect()
      },
      { rootMargin: "320px" }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (!shouldLoad) {
      video.pause()
      return
    }

    video.load()
    void video.play().catch(() => setIsVisible(false))
  }, [shouldLoad])

  return (
    <video
      aria-hidden="true"
      autoPlay
      className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 data-[visible=true]:opacity-100 motion-reduce:hidden"
      data-visible={shouldLoad && isVisible}
      disablePictureInPicture
      muted
      onError={() => setIsVisible(false)}
      onPlaying={() => setIsVisible(true)}
      playsInline
      poster={poster}
      preload="none"
      ref={videoRef}
      tabIndex={-1}
    >
      {shouldLoad ? <source src={source} type="video/mp4" /> : null}
    </video>
  )
}
