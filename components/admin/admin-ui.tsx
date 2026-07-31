import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
      <div className="max-w-3xl">
        <p className="text-[10px] font-semibold tracking-[0.24em] text-[#9d8464] uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-4xl leading-none font-medium text-[#273029] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f786f]">
          {description}
        </p>
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </header>
  )
}

export function AdminPanel({
  children,
  className,
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  return (
    <section
      className={cn(
        "rounded-[1.5rem] border border-white/70 bg-white/48 p-5 shadow-[0_18px_60px_rgba(39,48,41,0.055)] backdrop-blur-sm sm:p-6",
        className
      )}
      id={id}
    >
      {children}
    </section>
  )
}

export function PanelHeading({
  eyebrow,
  title,
  detail,
}: {
  eyebrow?: string
  title: string
  detail?: string
}) {
  return (
    <div>
      {eyebrow && (
        <p className="text-[10px] font-semibold tracking-[0.2em] text-[#9d8464] uppercase">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-1 text-2xl font-medium text-[#273029]">{title}</h2>
      {detail && <p className="mt-1 text-xs text-[#7c847c]">{detail}</p>}
    </div>
  )
}

export function PreviewPill({ label = "Sample preview" }: { label?: string }) {
  return (
    <span className="inline-flex min-h-8 items-center rounded-full border border-[#d7cfc1] bg-white/55 px-3 text-[9px] font-semibold tracking-[0.17em] text-[#896e4f] uppercase">
      {label}
    </span>
  )
}

const tones = {
  neutral: "bg-[#273029]/7 text-[#5f695f]",
  positive: "bg-[#688064]/12 text-[#526b4f]",
  warning: "bg-[#ad8659]/13 text-[#876440]",
  quiet: "bg-[#8b6c79]/10 text-[#765b67]",
} as const

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode
  tone?: keyof typeof tones
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap",
        tones[tone]
      )}
    >
      {children}
    </span>
  )
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  tone = "#9d8464",
}: {
  icon: LucideIcon
  label: string
  value: string
  note: string
  tone?: string
}) {
  return (
    <article className="rounded-[1.4rem] border border-white/70 bg-white/48 p-5 shadow-[0_16px_50px_rgba(39,48,41,0.05)]">
      <span
        className="grid size-10 place-items-center rounded-full"
        style={{ backgroundColor: `${tone}18`, color: tone }}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <p className="mt-5 text-[10px] font-semibold tracking-[0.18em] text-[#7b837b] uppercase">
        {label}
      </p>
      <p className="mt-1 font-serif text-4xl font-medium text-[#273029]">
        {value}
      </p>
      <p className="mt-2 text-xs text-[#7a837a]">{note}</p>
    </article>
  )
}

export function ReadOnlyButton({
  children,
  compact = false,
}: {
  children: React.ReactNode
  compact?: boolean
}) {
  return (
    <button
      className={cn(
        "cursor-not-allowed rounded-full border border-[#d4cdc1] bg-white/45 text-xs font-medium text-[#8a9089] opacity-80",
        compact ? "px-3 py-2" : "px-4 py-2.5"
      )}
      disabled
      title="Preview only — actions activate after production setup."
      type="button"
    >
      {children}
    </button>
  )
}

export function FieldPreview({
  label,
  value,
  multiline = false,
}: {
  label: string
  value: string
  multiline?: boolean
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold tracking-[0.15em] text-[#818981] uppercase">
        {label}
      </p>
      <div
        className={cn(
          "rounded-xl border border-[#d9d3c8] bg-[#f6f2ea]/70 px-4 py-3 text-sm leading-6 text-[#4f5a51]",
          multiline && "min-h-28"
        )}
      >
        {value}
      </div>
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d2cabd] bg-[#f6f1e8]/45 px-5 py-10 text-center">
      <span className="mx-auto grid size-11 place-items-center rounded-full bg-[#9d8464]/10 text-[#9d8464]">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <p className="mt-4 font-serif text-xl font-medium text-[#273029]">
        {title}
      </p>
      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#7b837b]">
        {description}
      </p>
    </div>
  )
}
