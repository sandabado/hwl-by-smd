"use client"

import { useEffect, useRef } from "react"
import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type MagneticButtonProps = ComponentProps<typeof Button> & {
  magnetic?: boolean
  maxOffset?: number
  radius?: number
  wrapperClassName?: string
}

export function MagneticButton({
  magnetic = true,
  maxOffset = 6,
  radius = 20,
  wrapperClassName,
  disabled,
  ...buttonProps
}: MagneticButtonProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper || !magnetic || disabled) return

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)")
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const safeMaxOffset = Math.max(0, maxOffset)
    const safeRadius = Math.max(0, radius)
    let animationFrame: number | null = null
    let isAttracted = false

    const moveTo = (x: number, y: number, duration = 120) => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame)
      }

      animationFrame = window.requestAnimationFrame(() => {
        wrapper.style.transitionDuration = `${duration}ms`
        wrapper.style.transform = `translate3d(${x}px, ${y}px, 0)`
        animationFrame = null
      })
    }

    const reset = () => {
      if (!isAttracted) return
      isAttracted = false
      moveTo(0, 0, 300)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches) {
        reset()
        return
      }

      const rect = wrapper.getBoundingClientRect()
      const isNearby =
        event.clientX >= rect.left - safeRadius &&
        event.clientX <= rect.right + safeRadius &&
        event.clientY >= rect.top - safeRadius &&
        event.clientY <= rect.bottom + safeRadius

      if (!isNearby) {
        reset()
        return
      }

      isAttracted = true
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const rangeX = rect.width / 2 + safeRadius
      const rangeY = rect.height / 2 + safeRadius
      const offsetX = Math.max(
        -safeMaxOffset,
        Math.min(
          safeMaxOffset,
          ((event.clientX - centerX) / rangeX) * safeMaxOffset
        )
      )
      const offsetY = Math.max(
        -safeMaxOffset,
        Math.min(
          safeMaxOffset,
          ((event.clientY - centerY) / rangeY) * safeMaxOffset
        )
      )

      moveTo(offsetX, offsetY)
    }

    const syncMotionPreference = () => {
      if (!finePointer.matches || reducedMotion.matches) {
        reset()
      }
    }

    document.addEventListener("pointermove", onPointerMove, { passive: true })
    window.addEventListener("blur", reset)
    finePointer.addEventListener("change", syncMotionPreference)
    reducedMotion.addEventListener("change", syncMotionPreference)

    return () => {
      document.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("blur", reset)
      finePointer.removeEventListener("change", syncMotionPreference)
      reducedMotion.removeEventListener("change", syncMotionPreference)

      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame)
      }
    }
  }, [disabled, magnetic, maxOffset, radius])

  return (
    <span
      className={cn(
        "inline-flex transition-transform ease-out will-change-transform motion-reduce:transform-none motion-reduce:transition-none",
        wrapperClassName
      )}
      ref={wrapperRef}
    >
      <Button disabled={disabled} {...buttonProps} />
    </span>
  )
}
