export function PrivateVideoPlayer({
  captionsSource,
  poster,
  source,
  title,
}: {
  captionsSource?: string
  poster: string
  source: string
  title: string
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/55 bg-[#20251f] shadow-[0_30px_80px_rgba(32,37,31,0.2)]">
      <video
        aria-label={title}
        className="aspect-video w-full bg-[#20251f] object-contain"
        controls
        crossOrigin="anonymous"
        playsInline
        poster={poster}
        preload="metadata"
      >
        <source src={source} type="video/mp4" />
        {captionsSource ? (
          <track
            default
            kind="captions"
            label="English"
            src={captionsSource}
            srcLang="en"
          />
        ) : null}
        Your browser does not support HTML video. Please contact Shannon for an
        accessible copy of this practice.
      </video>
    </div>
  )
}
