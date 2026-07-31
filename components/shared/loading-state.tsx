import { cn } from "@/lib/utils"

export function LoadingState({
  variant = "page",
}: {
  variant?: "lesson" | "member" | "page"
}) {
  return (
    <section
      aria-busy="true"
      aria-label="Preparing your experience"
      aria-live="polite"
      className={cn(
        "min-h-[65svh] px-6 py-16 md:py-24",
        variant !== "page" && "member-atmosphere"
      )}
      role="status"
    >
      <span className="sr-only">Preparing your experience…</span>
      <div
        aria-hidden="true"
        className="mx-auto max-w-6xl motion-safe:animate-pulse"
      >
        <div className="h-3 w-32 rounded-full bg-[var(--accent)]/20" />
        <div className="mt-6 h-14 max-w-2xl rounded-2xl bg-[var(--primary)]/10 md:h-20" />
        <div className="mt-5 h-4 max-w-xl rounded-full bg-[var(--muted)]" />
        <div className="mt-3 h-4 max-w-md rounded-full bg-[var(--muted)]" />

        {variant === "lesson" ? (
          <>
            <div className="mt-12 aspect-video rounded-[2rem] bg-[var(--primary)]/10" />
            <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_14rem]">
              <div className="h-40 rounded-[1.5rem] bg-white/45" />
              <div className="h-28 rounded-[1.5rem] bg-white/45" />
            </div>
          </>
        ) : (
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                className="h-64 rounded-[2rem] border border-white/60 bg-white/45"
                key={item}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
