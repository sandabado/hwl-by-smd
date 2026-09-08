"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <section
      aria-labelledby="error-title"
      className="relative isolate grid min-h-[65svh] place-items-center overflow-hidden px-6 py-24 text-center"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(255,255,255,0.82),transparent_34%),linear-gradient(155deg,var(--background),var(--muted))]"
      />
      <div className="relative z-10 mx-auto max-w-xl">
        <p className="text-xs font-medium tracking-[0.3em] text-[var(--accent)] uppercase">
          A gentle pause
        </p>
        <h1
          className="mt-4 text-4xl font-medium text-[var(--primary)] md:text-6xl"
          id="error-title"
        >
          Something went sideways.
        </h1>
        <p className="mx-auto mt-5 max-w-lg leading-relaxed text-[var(--muted-foreground)]">
          Please try once more. If the interruption continues, return home and
          begin again when you&apos;re ready.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            className="h-11 rounded-full px-7"
            onClick={() => retry()}
            type="button"
          >
            Try Again
          </Button>
          <Button asChild className="h-11 rounded-full px-7" variant="outline">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
        {error.digest ? (
          <p className="mt-6 text-xs text-[var(--muted-foreground)]">
            Reference: {error.digest}
          </p>
        ) : null}
      </div>
    </section>
  )
}
