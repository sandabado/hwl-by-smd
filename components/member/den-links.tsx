import Link from "next/link"
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpenText,
  CalendarHeart,
  UserRound,
} from "lucide-react"

const shortcuts = [
  { href: "/library", icon: BookOpenText, label: "Library" },
  { href: "/book", icon: CalendarHeart, label: "Book a Session" },
  { href: "/account", icon: UserRound, label: "Manage Account" },
] as const

export function DenShortcuts() {
  return (
    <nav
      aria-label="The Den shortcuts"
      className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-1 border-y border-white/60 py-2"
    >
      {shortcuts.map(({ href, icon: Icon, label }) => (
        <Link
          className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--primary)] underline-offset-4 hover:underline"
          href={href}
          key={href}
        >
          <Icon aria-hidden="true" className="size-4 text-[var(--accent)]" />
          {label}
          <ArrowUpRight
            aria-hidden="true"
            className="size-3.5 opacity-55 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
          />
        </Link>
      ))}
    </nav>
  )
}

export function BackToDenLink() {
  return (
    <nav aria-label="Member area">
      <Link
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--primary)] underline-offset-4 hover:underline"
        href="/the-den"
      >
        <ArrowLeft aria-hidden="true" className="size-4 text-[var(--accent)]" />
        Back to The Den
      </Link>
    </nav>
  )
}
