"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { AuthLinks } from "@/components/auth/auth-links"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { MAIN_NAV } from "@/lib/nav-config"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const closeMenu = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-11 text-[var(--foreground)] lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="data-[side=right]:data-open:slide-in-from-right data-[side=right]:data-closed:slide-out-to-right w-screen max-w-none gap-0 border-0 bg-[var(--background)] p-0 text-[var(--foreground)] shadow-none duration-300 ease-out data-[side=right]:w-screen data-[side=right]:border-l-0 sm:max-w-none data-[side=right]:sm:max-w-none"
      >
        <div className="flex h-full flex-col px-6 py-6">
          <SheetTitle className="font-serif text-xl font-medium tracking-[0.12em] text-[var(--primary)]">
            HWL·SMD
            <span className="mt-2 block font-serif text-xs tracking-[0.2em] text-[var(--muted-foreground)] uppercase">
              Body · Beauty · Being
            </span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Navigate the HWL by SMD website.
          </SheetDescription>

          <div className="my-auto flex w-full flex-col items-center">
            <nav
              className="flex w-full flex-col items-center"
              aria-label="Mobile main"
            >
              {MAIN_NAV.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={closeMenu}
                    className={cn(
                      "w-full py-3 text-center font-serif text-2xl text-[var(--foreground)] transition-colors duration-200 hover:text-[var(--accent)]",
                      isActive && "text-[var(--accent)]"
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
              <Button
                asChild
                className="min-h-11 w-full rounded-full bg-[var(--accent)] px-5 py-2 text-sm text-[var(--background)] hover:bg-[var(--primary)]"
              >
                <Link href="/book" onClick={closeMenu}>
                  Book
                </Link>
              </Button>
              <AuthLinks mobile onNavigate={closeMenu} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
