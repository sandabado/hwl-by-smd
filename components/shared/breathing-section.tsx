import type { ComponentPropsWithoutRef, ReactNode } from "react"

import { AmbientLight } from "@/components/shared/ambient-light"
import { Reveal } from "@/components/shared/reveal"
import {
  TextureOverlay,
  type TextureVariant,
} from "@/components/shared/texture-overlay"
import { cn } from "@/lib/utils"

export type RoomVariant =
  | "altar"
  | "bathroom"
  | "dressing-room"
  | "gift-shop"
  | "kitchen"
  | "library"
  | "living-room"
  | "sanctuary"
  | "studio"
  | "sunroom"

type RoomBackground = "cool" | "dark" | "gradient" | "transparent" | "warm"

interface BreathingSectionProps extends Omit<
  ComponentPropsWithoutRef<"section">,
  "children"
> {
  background?: RoomBackground
  children: ReactNode
  contentClassName?: string
  padding?: "expansive" | "standard"
  reveal?: boolean
  texture?: TextureVariant
  variant?: RoomVariant
}

const ambientByRoom: Record<
  RoomVariant,
  {
    position:
      "bottom-left" | "bottom-right" | "center" | "top-left" | "top-right"
    tone: "clay" | "sage" | "violet" | "warm"
  }
> = {
  altar: { position: "bottom-right", tone: "violet" },
  bathroom: { position: "top-right", tone: "warm" },
  "dressing-room": { position: "top-left", tone: "clay" },
  "gift-shop": { position: "top-right", tone: "clay" },
  kitchen: { position: "top-left", tone: "clay" },
  library: { position: "bottom-left", tone: "warm" },
  "living-room": { position: "top-right", tone: "warm" },
  sanctuary: { position: "center", tone: "violet" },
  studio: { position: "bottom-right", tone: "sage" },
  sunroom: { position: "top-right", tone: "warm" },
}

const defaultTextureByRoom: Record<RoomVariant, TextureVariant> = {
  altar: "grain",
  bathroom: "paper",
  "dressing-room": "paper",
  "gift-shop": "linen",
  kitchen: "paper",
  library: "paper",
  "living-room": "grain",
  sanctuary: "linen",
  studio: "grain",
  sunroom: "paper",
}

export function BreathingSection({
  background = "warm",
  children,
  className,
  contentClassName,
  padding = "standard",
  reveal = true,
  texture,
  variant = "living-room",
  ...props
}: BreathingSectionProps) {
  const ambient = ambientByRoom[variant]
  const content = reveal ? (
    <Reveal className={cn("room-section__content", contentClassName)}>
      {children}
    </Reveal>
  ) : (
    <div className={cn("room-section__content", contentClassName)}>
      {children}
    </div>
  )

  return (
    <section
      className={cn("room-section", className)}
      data-room={variant}
      data-room-background={background}
      data-room-padding={padding}
      {...props}
    >
      <AmbientLight position={ambient.position} tone={ambient.tone} />
      <TextureOverlay variant={texture ?? defaultTextureByRoom[variant]} />
      {content}
    </section>
  )
}
