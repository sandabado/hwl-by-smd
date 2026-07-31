"use client"

import { useEffect, useRef, useState } from "react"

export function LiftSequenceProgress({ steps }: { steps: string[] }) {
  const [activeIndex, setActiveIndex] = useState(-1)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const stepNodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-lift-step]")
    )

    if (!stepNodes.length) return

    const update = () => {
      frameRef.current = null
      const activationLine = window.innerHeight * 0.58
      let nextIndex = -1

      stepNodes.forEach((step, index) => {
        if (step.getBoundingClientRect().top <= activationLine) {
          nextIndex = index
        }
      })

      setActiveIndex((current) => (current === nextIndex ? current : nextIndex))
    }

    const requestUpdate = () => {
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(update)
      }
    }

    requestUpdate()
    window.addEventListener("scroll", requestUpdate, { passive: true })
    window.addEventListener("resize", requestUpdate)

    return () => {
      window.removeEventListener("scroll", requestUpdate)
      window.removeEventListener("resize", requestUpdate)

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  const progress =
    activeIndex < 0 ? 0 : ((activeIndex + 1) / steps.length) * 100

  return (
    <div
      className="sticky top-20 z-20 mx-auto mt-10 max-w-5xl rounded-[1.5rem] border border-white/70 bg-[var(--background)]/90 p-4 shadow-[0_14px_42px_rgba(90,74,63,0.1)] backdrop-blur-md md:top-24"
      aria-label="LIFT sequence progress"
    >
      <div
        aria-valuemax={steps.length}
        aria-valuemin={0}
        aria-valuenow={activeIndex + 1}
        aria-valuetext={
          activeIndex < 0
            ? "Sequence not started"
            : `Movement ${activeIndex + 1} of ${steps.length}: ${steps[activeIndex]}`
        }
        className="h-1.5 overflow-hidden rounded-full bg-[var(--muted)]"
        role="progressbar"
      >
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol
        className="mt-5 grid grid-cols-7 gap-2"
        aria-label="Seven LIFT movements"
      >
        {steps.map((step, index) => {
          const isReached = index <= activeIndex

          return (
            <li className="min-w-0 text-center" key={step}>
              <a
                aria-current={index === activeIndex ? "step" : undefined}
                className="group inline-flex w-full flex-col items-center gap-2 text-[var(--muted-foreground)] outline-none"
                href={`#lift-step-${index + 1}`}
              >
                <span
                  className={
                    isReached
                      ? "grid size-8 place-items-center rounded-full bg-[var(--accent)] text-xs font-semibold text-white transition-colors"
                      : "grid size-8 place-items-center rounded-full border border-[var(--border)] bg-[var(--background)] text-xs font-semibold text-[var(--muted-foreground)] transition-colors group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]"
                  }
                >
                  {index + 1}
                </span>
                <span className="hidden text-[10px] leading-tight font-medium sm:block">
                  {step}
                </span>
              </a>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
