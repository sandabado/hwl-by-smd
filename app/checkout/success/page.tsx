import Link from "next/link"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function CheckoutSuccessPage() {
  return (
    <section className="member-atmosphere px-6 py-24">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-white/60 bg-white/65 p-10 text-center shadow-xl backdrop-blur md:p-14">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#52694d] text-white">
          <Check className="size-6" aria-hidden="true" />
        </span>
        <p className="mt-7 text-xs tracking-[0.3em] text-[var(--accent)] uppercase">
          You&apos;re in
        </p>
        <h1 className="mt-4 text-5xl font-medium text-[var(--primary)]">
          Your ritual is ready.
        </h1>
        <p className="mt-5 leading-relaxed text-[var(--muted-foreground)]">
          Your purchase is being placed in your private library now. This
          usually takes only a breath.
        </p>
        <Button
          asChild
          className="mt-8 h-11 rounded-full bg-[var(--primary)] px-7 text-white"
        >
          <Link href="/the-den">Enter The Den</Link>
        </Button>
      </div>
    </section>
  )
}
