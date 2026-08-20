import type { ComponentPropsWithoutRef } from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

export const gentleHoverClassName = "gentle-hover"

export function GentleHover({
  asChild = false,
  className,
  ...props
}: ComponentPropsWithoutRef<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div"

  return <Comp className={cn(gentleHoverClassName, className)} {...props} />
}
