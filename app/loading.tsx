export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="px-6 py-10"
      role="status"
    >
      <span className="sr-only">Preparing this page…</span>
      <div
        aria-hidden="true"
        className="mx-auto h-px max-w-7xl overflow-hidden bg-[var(--border)]"
      >
        <div className="h-full w-1/3 bg-[var(--accent)]/45 motion-safe:animate-pulse" />
      </div>
    </div>
  )
}
