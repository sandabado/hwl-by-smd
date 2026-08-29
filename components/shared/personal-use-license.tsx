import Link from "next/link"

export function PersonalUseLicense({ className = "" }: { className?: string }) {
  return (
    <details
      className={[
        "rounded-[1.5rem] border border-[var(--border)] bg-white/48 px-6 py-5 text-left",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <summary className="cursor-pointer font-serif text-xl text-[var(--primary)] marker:text-[var(--accent)]">
        Personal-use license
      </summary>
      <div className="mt-5 space-y-4 text-sm leading-[1.8] text-[var(--muted-foreground)]">
        <p>
          A LIFT digital purchase gives one person a limited, personal,
          non-transferable license to use the guide and, when included, the
          private video. Your purchase does not transfer ownership of the
          materials.
        </p>
        <p>
          You may access the materials on your personal devices, keep a private
          backup, and make reasonable personal or accessibility copies. Please
          do not share your account or private links; publish, record, upload,
          redistribute, or resell the materials; copy them into a commercial
          class or service; or remove their notices or branding.
        </p>
        <p>
          This license does not limit rights that cannot lawfully be waived. For
          another use, please request written permission from Shannon.
        </p>
        <p>
          By purchasing, you agree to the{" "}
          <Link
            className="text-[var(--accent)] underline underline-offset-4"
            href="/terms#digital-products-and-access"
          >
            Terms
          </Link>{" "}
          and acknowledge the{" "}
          <Link
            className="text-[var(--accent)] underline underline-offset-4"
            href="/refund-policy"
          >
            Refund Policy
          </Link>
          .
        </p>
      </div>
    </details>
  )
}
