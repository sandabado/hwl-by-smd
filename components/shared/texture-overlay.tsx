import { cn } from "@/lib/utils"

export type TextureVariant = "grain" | "linen" | "none" | "paper"

interface TextureOverlayProps {
  className?: string
  intensity?: "present" | "soft" | "subtle"
  variant?: TextureVariant
}

export function TextureOverlay({
  className,
  intensity = "subtle",
  variant = "grain",
}: TextureOverlayProps) {
  if (variant === "none") return null

  return (
    <div
      aria-hidden="true"
      className={cn("texture-overlay", className)}
      data-intensity={intensity}
      data-texture={variant}
    />
  )
}
