"use client"

import { useEffect, useRef, useState } from "react"
import MuxPlayer from "@mux/mux-player-react"
import { Play } from "lucide-react"

export function MuxPlayerWrapper({
  playbackId,
  poster,
  videoId,
  title,
  token,
}: {
  playbackId: string | null
  poster?: string | null
  videoId: string
  title: string
  token: string | null
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "180px" }
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className="aspect-video overflow-hidden rounded-[2rem] bg-[var(--primary)] shadow-[0_35px_90px_rgba(90,74,63,0.2)]"
      ref={rootRef}
    >
      {visible && playbackId && token ? (
        <MuxPlayer
          accentColor="#c4a882"
          metadata={{
            video_id: videoId,
            video_title: title,
          }}
          playbackId={playbackId}
          playsInline
          poster={poster ?? undefined}
          streamType="on-demand"
          tokens={{ playback: token }}
          videoTitle={title}
          style={{ height: "100%", width: "100%" }}
        />
      ) : (
        <div className="grid h-full place-items-center p-8 text-center text-[var(--background)]">
          <div>
            <span className="mx-auto grid size-16 place-items-center rounded-full border border-white/20 bg-white/10">
              <Play className="ml-1 size-6" aria-hidden="true" />
            </span>
            <p className="mt-5 font-serif text-3xl">
              {playbackId
                ? "Preparing your private stream…"
                : "Shannon is preparing this video."}
            </p>
            <p className="mt-2 text-sm opacity-60">
              {playbackId
                ? "The secure player will appear in a moment."
                : "It will arrive here without changing your place in the course."}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
