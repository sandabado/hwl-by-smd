import Link from "next/link"

import { cn } from "@/lib/utils"

const items = [
  { label: "Overview", href: "/admin/journeys", key: "overview" },
  { label: "Composer", href: "/admin/journeys/composer", key: "composer" },
  {
    label: "Templates",
    href: "/admin/journeys/templates",
    key: "templates",
  },
  {
    label: "Insights",
    href: "/admin/journeys/insights",
    key: "insights",
  },
] as const

export function JourneySubnav({
  current,
}: {
  current: (typeof items)[number]["key"]
}) {
  return (
    <nav
      aria-label="Journey workspace"
      className="mt-8 flex gap-2 overflow-x-auto pb-2"
    >
      {items.map((item) => (
        <Link
          aria-current={current === item.key ? "page" : undefined}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-xs transition",
            current === item.key
              ? "border-[#273029] bg-[#273029] text-white"
              : "border-[#d4cdc1] bg-white/42 text-[#626d63] hover:bg-white/70"
          )}
          href={item.href}
          key={item.key}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
