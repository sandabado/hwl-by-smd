import Link from "next/link"

const items = [
  ["Today", "/the-den"],
  ["Library", "/library"],
  ["Connection", "/the-den/connection"],
  ["Book Shannon", "/book"],
  ["Account", "/account"],
]

export function MemberNavigation() {
  return (
    <nav
      className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-white/60 bg-white/45 p-1 backdrop-blur"
      aria-label="Member area"
    >
      {items.map(([label, href]) => (
        <Link
          className="shrink-0 rounded-full px-4 py-2 text-xs font-medium tracking-wide text-[var(--primary)] transition hover:bg-white/70"
          href={href}
          key={href}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
