"use client"

import { useRef, useState } from "react"
import { Play } from "lucide-react"

export function PublicPreviewPlayer({
  describedBy,
  duration,
  label,
  poster,
  source,
}: {
  describedBy?: string
  duration: string
  label: string
  poster: string
  source: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasStarted, setHasStarted] = useState(false)

  const startPlayback = () => {
    const video = videoRef.current
    if (!video) return

    setHasStarted(true)
    void video.play().catch(() => setHasStarted(false))
  }

  const pauseOtherPreviews = () => {
    document
      .querySelectorAll<HTMLVideoElement>("[data-lift-public-preview]")
      .forEach((video) => {
        if (video !== videoRef.current) video.pause()
      })
  }

  return (
    <div className="relative flex h-full min-h-72 items-center overflow-hidden rounded-[2rem] border border-white/70 bg-[#20251f] shadow-[0_24px_65px_rgba(54,46,38,0.16)]">
      <video
        aria-describedby={describedBy}
        aria-label={`${label}. Silent demonstration.`}
        className="aspect-video w-full bg-[#20251f] object-contain"
        controls={hasStarted}
        controlsList="nodownload noremoteplayback"
        data-lift-public-preview
        disablePictureInPicture
        muted
        onPlay={pauseOtherPreviews}
        playsInline
        poster={poster}
        preload="none"
        ref={videoRef}
      >
        <source src={source} type="video/mp4" />
        Your browser does not support HTML video. The written movement guidance
        is available beside this preview.
      </video>

      {!hasStarted ? (
        <button
          aria-label={`Play ${label} preview`}
          className="group absolute inset-0 grid cursor-pointer place-items-center bg-[linear-gradient(180deg,rgba(24,30,25,0.06),rgba(24,30,25,0.38))] p-6 text-center text-white transition outline-none hover:bg-[linear-gradient(180deg,rgba(24,30,25,0.02),rgba(24,30,25,0.28))] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset"
          onClick={startPlayback}
          type="button"
        >
          <span>
            <span className="mx-auto grid size-16 place-items-center rounded-full border border-white/70 bg-white/88 text-[var(--primary)] shadow-lg backdrop-blur-sm transition group-hover:scale-105">
              <Play className="ml-1 size-5" aria-hidden="true" />
            </span>
            <span className="mt-5 block text-xs font-medium tracking-[0.2em] uppercase">
              {label}
            </span>
            <span className="mt-2 block text-xs text-white/82">
              Silent preview · {duration}
            </span>
          </span>
        </button>
      ) : null}
    </div>
  )
}
