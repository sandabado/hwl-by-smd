export function ContentLicenseNote({ className = "" }: { className?: string }) {
  return (
    <aside
      className={[
        "rounded-[1.25rem] border border-[var(--border)] bg-white/45 px-5 py-4 text-sm leading-relaxed text-[var(--muted-foreground)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      This practice was created by Shannon for your personal use. Please
      don&apos;t copy, record, share, or redistribute this lesson or its
      materials. Every purchase supports Shannon&apos;s work—thank you for
      honoring it.
    </aside>
  )
}
