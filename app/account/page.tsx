import Link from "next/link"
import type { Metadata } from "next"
import {
  CalendarDays,
  Download,
  HeartHandshake,
  ReceiptText,
} from "lucide-react"

import { AccountActions } from "@/components/account/account-actions"
import { Button } from "@/components/ui/button"
import { requireAccess } from "@/lib/access"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Your Account | HWL by SMD",
}

function readableDate(value: string | null | undefined) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value))
}

export default async function AccountPage() {
  const { access, user } = await requireAccess("authenticated", "/account")
  const membership = access.membership

  return (
    <section className="member-atmosphere px-6 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs tracking-[0.3em] text-[var(--accent)] uppercase">
          Account
        </p>
        <h1 className="mt-4 text-6xl font-medium text-[var(--primary)]">
          Your Account
        </h1>
        <p className="mt-4 text-lg text-[var(--muted-foreground)]">
          Profile, membership, purchases, and preferences.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <article className="den-card rounded-[2rem] p-8">
            <h2 className="text-3xl text-[var(--primary)]">Profile</h2>
            <p className="mt-5 text-xs tracking-[0.2em] text-[var(--muted-foreground)] uppercase">
              Signed in as
            </p>
            {user.user_metadata.full_name ? (
              <p className="mt-2 text-[var(--primary)]">
                {String(user.user_metadata.full_name)}
              </p>
            ) : null}
            <p className="mt-2 text-[var(--primary)]">{user.email}</p>
          </article>

          <article className="den-card rounded-[2rem] p-8">
            <h2 className="text-3xl text-[var(--primary)]">Membership</h2>
            {membership ? (
              <>
                <p className="mt-5 inline-flex rounded-full bg-[#52694d]/10 px-3 py-1 text-xs font-medium tracking-[0.18em] text-[#52694d] uppercase">
                  {membership.status}
                </p>
                <p className="mt-4 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  {membership.cancel_at_period_end
                    ? "Access until"
                    : "Renews"}{" "}
                  {readableDate(membership.current_period_end)}
                </p>
              </>
            ) : (
              <p className="mt-5 leading-relaxed text-[var(--muted-foreground)]">
                You don&apos;t have an active membership. The Den is
                $11.11/month — your private library, your direct line to
                Shannon, and your ongoing practice.
              </p>
            )}
          </article>
        </div>

        <article className="den-card mt-6 rounded-[2rem] p-8">
          <div className="flex items-center gap-3">
            <ReceiptText
              className="size-5 text-[var(--accent)]"
              aria-hidden="true"
            />
            <h2 className="text-3xl text-[var(--primary)]">Purchase history</h2>
          </div>
          {access.purchases.length ? (
            <div className="mt-6 divide-y divide-[var(--border)]">
              {access.purchases.map((purchase, index) => (
                <div
                  className="flex items-center justify-between gap-4 py-4 text-sm"
                  key={`${purchase.product_type}-${purchase.purchased_at}-${index}`}
                >
                  <div>
                    <p className="font-medium text-[var(--primary)] capitalize">
                      {purchase.product_type.replaceAll("_", " ")}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {readableDate(purchase.purchased_at)}
                    </p>
                  </div>
                  <p>${Number(purchase.amount_paid).toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-[var(--muted-foreground)]">
                You haven&apos;t chosen a practice yet. That&apos;s okay. The
                library is here when you&apos;re ready.
              </p>
              <Button
                asChild
                variant="link"
                className="mt-2 px-0 text-[var(--primary)]"
              >
                <Link href="/store">Browse the store</Link>
              </Button>
            </div>
          )}
        </article>

        <Link
          className="den-card mt-6 flex items-center justify-between gap-5 rounded-[2rem] p-8 transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
          href={
            access.isMember
              ? "/account/preferences/communication"
              : "/store#the-den"
          }
        >
          <div className="flex items-start gap-4">
            <HeartHandshake
              className="mt-1 size-5 shrink-0 text-[var(--accent)]"
              aria-hidden="true"
            />
            <div>
              <h2 className="text-3xl text-[var(--primary)]">
                {access.isMember
                  ? "Connection preferences"
                  : "The Den connection"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                {access.isMember
                  ? "Choose whether Shannon may include booking invitations in a guided Journey."
                  : "Private Connection is available with an active Den membership."}
              </p>
            </div>
          </div>
          <span className="text-sm text-[var(--primary)]" aria-hidden="true">
            →
          </span>
        </Link>

        <div className="mt-8">
          {access.canDownloadLift && (
            <Button
              asChild
              className="mr-3 h-11 rounded-full border-[var(--border)] bg-white/45 px-6 text-[var(--primary)]"
              variant="outline"
            >
              <Link href="/api/download/lift">
                <Download aria-hidden="true" />
                Download LIFT PDF
              </Link>
            </Button>
          )}
          <AccountActions hasBilling={access.purchases.length > 0} />
        </div>
      </div>
    </section>
  )
}
