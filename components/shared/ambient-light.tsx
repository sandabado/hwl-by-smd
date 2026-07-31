import { cn } from "@/lib/utils"

type AmbientLightPosition =
  "bottom-left" | "bottom-right" | "center" | "top-left" | "top-right"

type AmbientLightTone = "clay" | "sage" | "violet" | "warm"

interface AmbientLightProps {
  className?: string
  position?: AmbientLightPosition
  tone?: AmbientLightTone
}

export function AmbientLight({
  className,
  position = "top-right",
  tone = "warm",
}: AmbientLightProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("ambient-light", className)}
      data-position={position}
      data-tone={tone}
    />
  )
}
