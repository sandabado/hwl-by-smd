import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  Cloud,
  ExternalLink,
  Inbox,
  KeyRound,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react"

import { AdminPanel } from "@/components/admin/admin-ui"
import { requireAdmin } from "@/lib/admin-auth"
import { isCalcomBookingLedgerReady } from "@/lib/bookings/member-bookings"
import { getCalcomPublicEventTypes } from "@/lib/calcom"
import {
  getAdminReconciliationStatus,
  type AdminReconciliationStatus,
} from "@/lib/commerce/admin-reconciliation"
import { isStripeConfigured, isSupabaseAdminConfigured } from "@/lib/env"
import {
  getCommerceDeploymentTarget,
  getExpectedStripeLivemode,
  isCommerceSalesReady,
  isProductCheckoutReady,
} from "@/lib/stripe"

export const dynamic = "force-dynamic"

type StatusTone = "neutral" | "positive" | "quiet" | "warning"

type ReadinessState = {
  detail: string
  status: string
  tone: StatusTone
}

type ReadinessItem = ReadinessState & {
  icon: LucideIcon
  label: string
}

const statusToneClasses: Record<StatusTone, string> = {
  neutral: "bg-[#e7e9e5] text-[#4f5a51]",
  positive: "bg-[#e2ebe0] text-[#455f43]",
  quiet: "bg-[#e9e5de] text-[#556057]",
  warning: "bg-[#f1e5d4] text-[#6f512f]",
}

const actionLinkClassName =
  "mt-auto inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-full bg-[#273029] px-4 text-xs font-medium text-white transition hover:bg-[#435047] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526b4f]"

const present = (value: string | undefined) => {
  const normalized = value?.trim()
  return Boolean(normalized && !normalized.startsWith("your_"))
}

function StatusBadge({
  children,
  tone,
}: {
  children: React.ReactNode
  tone: StatusTone
}) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap ${statusToneClasses[tone]}`}
    >
      {children}
    </span>
  )
}

function OperationsCard({
  description,
  eyebrow,
  external = false,
  facts,
  href,
  icon: Icon,
  linkLabel,
  status,
  title,
  tone,
}: {
  description: string
  eyebrow: string
  external?: boolean
  facts: readonly { label: string; value: string }[]
  href: string
  icon: LucideIcon
  linkLabel: string
  status: string
  title: string
  tone: StatusTone
}) {
  const ActionIcon = external ? ExternalLink : ArrowRight
  const actionContent = (
    <>
      {linkLabel}
      <ActionIcon className="size-3.5" aria-hidden="true" />
      {external ? <span className="sr-only"> Opens in a new tab.</span> : null}
    </>
  )

  return (
    <AdminPanel className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#273029]/7 text-[#4f5d52]">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <StatusBadge tone={tone}>{status}</StatusBadge>
      </div>
      <p className="mt-6 text-[10px] font-semibold tracking-[0.2em] text-[#6f512f] uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-3xl font-medium text-[#273029]">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[#59645b]">{description}</p>

      <dl className="my-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        {facts.map((fact) => (
          <div
            className="rounded-2xl border border-[#d9d2c6] bg-[#f7f2ea]/65 px-4 py-3"
            key={fact.label}
          >
            <dt className="text-[10px] font-semibold tracking-[0.13em] text-[#626c63] uppercase">
              {fact.label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-[#354039]">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>

      {external ? (
        <a
          className={actionLinkClassName}
          href={href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {actionContent}
        </a>
      ) : (
        <Link className={actionLinkClassName} href={href}>
          {actionContent}
        </Link>
      )}
    </AdminPanel>
  )
}

function reconciliationReadiness(
  reconciliation: AdminReconciliationStatus
): ReadinessState {
  if (reconciliation.status === "local_preview") {
    return {
      detail: "The signed local preview cannot read hosted recovery records.",
      status: "Preview isolated",
      tone: "quiet",
    }
  }

  if (reconciliation.status === "not_configured") {
    return {
      detail:
        "The deployment target, Stripe authority, or admin data connection is incomplete.",
      status: "Not configured",
      tone: "warning",
    }
  }

  if (reconciliation.status === "unavailable") {
    return {
      detail:
        "The sanitized recovery queue could not be read; no cached substitute is shown.",
      status: "Check unavailable",
      tone: "warning",
    }
  }

  const manualReviewCount = reconciliation.jobs.filter(
    ({ state }) => state === "manual_review"
  ).length

  return manualReviewCount > 0
    ? {
        detail: `The current sanitized queue view returned ${manualReviewCount} manual-review ${manualReviewCount === 1 ? "item" : "items"}.`,
        status: "Needs review",
        tone: "warning",
      }
    : {
        detail:
          "The sanitized recovery queue is readable; no manual-review item was returned by this check.",
        status: "Available",
        tone: "positive",
      }
}

function ReadinessRow({
  detail,
  icon: Icon,
  label,
  status,
  tone,
}: ReadinessItem) {
  return (
    <div className="grid gap-3 border-b border-[#ddd6ca] py-4 first:pt-0 last:border-0 last:pb-0 sm:grid-cols-[minmax(11rem,0.72fr)_minmax(0,1.28fr)] sm:items-start">
      <dt className="flex items-center gap-3 text-sm font-medium text-[#354039]">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#273029]/7 text-[#526057]">
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
        {label}
      </dt>
      <dd className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:justify-between sm:gap-4">
        <p className="text-xs leading-5 text-[#59645b] sm:order-1 sm:max-w-xl">
          {detail}
        </p>
        <StatusBadge tone={tone}>{status}</StatusBadge>
      </dd>
    </div>
  )
}

export default async function AdminOverviewPage() {
  const access = await requireAdmin()
  const [calcom, reconciliation] = await Promise.all([
    getCalcomPublicEventTypes(),
    getAdminReconciliationStatus(),
  ])

  const today = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "America/Los_Angeles",
    weekday: "long",
  }).format(new Date())

  const calPublishedServiceCount = calcom.eventTypes.length
  const calCatalogAvailable = calcom.status === "available"
  const bookingLedgerReady = isCalcomBookingLedgerReady()
  const stripeConfigured = isStripeConfigured()
  const salesGateOpen = isCommerceSalesReady()
  const runtimeAuthorityReady = isProductCheckoutReady("lift_guide")
  const commerceTarget = getCommerceDeploymentTarget()
  const expectedStripeLivemode = getExpectedStripeLivemode()
  const supabaseAdminConfigured = isSupabaseAdminConfigured()
  const calPrivateReadConfigured = present(process.env.CALCOM_API_KEY)
  const resendPresent = present(process.env.RESEND_API_KEY)
  const reconciliationState = reconciliationReadiness(reconciliation)

  const calCatalogStatus = calCatalogAvailable
    ? calPublishedServiceCount > 0
      ? `${calPublishedServiceCount} public ${calPublishedServiceCount === 1 ? "service" : "services"}`
      : "No public services"
    : "Check unavailable"
  const stripeMode =
    expectedStripeLivemode === true
      ? "Live mode"
      : expectedStripeLivemode === false
        ? "Test mode"
        : "Mode unverified"
  const paymentsStatus = runtimeAuthorityReady
    ? "Checkout authorized"
    : salesGateOpen
      ? "Authority incomplete"
      : "Sales gate closed"
  const paymentsTone: StatusTone = runtimeAuthorityReady
    ? "positive"
    : salesGateOpen
      ? "warning"
      : "quiet"

  const readiness: ReadinessItem[] = [
    {
      detail:
        access.source === "supabase"
          ? "The current session is a verified Supabase administrator."
          : "The current session is the signed local preview; hosted admin records remain closed.",
      icon: KeyRound,
      label: "Supabase admin connection",
      status: supabaseAdminConfigured ? "Configured" : "Not configured",
      tone: supabaseAdminConfigured ? "positive" : "warning",
    },
    {
      detail: calCatalogAvailable
        ? `${calPublishedServiceCount} published ${calPublishedServiceCount === 1 ? "service type is" : "service types are"} visible on the public HWL profile.`
        : "The public Cal.com catalog could not be checked; no count is inferred.",
      icon: Cloud,
      label: "Cal.com public catalog",
      status:
        calCatalogAvailable && calPublishedServiceCount > 0
          ? "Available"
          : calCatalogAvailable
            ? "Empty"
            : "Unavailable",
      tone:
        calCatalogAvailable && calPublishedServiceCount > 0
          ? "positive"
          : "warning",
    },
    {
      detail:
        "This reports the exact CALCOM_BOOKING_LEDGER_READY gate, not proof of webhook ingestion.",
      icon: CalendarDays,
      label: "Booking history ledger",
      status: bookingLedgerReady ? "Enabled" : "Not active",
      tone: bookingLedgerReady ? "positive" : "quiet",
    },
    {
      detail:
        "Presence check only for the Stripe secret and webhook configuration; no values are displayed.",
      icon: CircleDollarSign,
      label: "Stripe configuration",
      status: stripeConfigured ? "Values present" : "Incomplete",
      tone: stripeConfigured ? "positive" : "warning",
    },
    {
      detail:
        "This is the exact COMMERCE_SALES_READY release gate, independent of provider configuration.",
      icon: ShieldCheck,
      label: "Commerce sales gate",
      status: salesGateOpen ? "Open" : "Closed",
      tone: salesGateOpen ? "positive" : "quiet",
    },
    {
      detail: runtimeAuthorityReady
        ? `${commerceTarget ?? "Unknown"} · ${stripeMode.toLowerCase()} · canonical LIFT checkout authority is aligned.`
        : "Checkout remains fail closed until target, account, mode, catalog, storage, and sales gate all align.",
      icon: ShieldCheck,
      label: "Runtime checkout authority",
      status: runtimeAuthorityReady ? "Authorized" : "Fail closed",
      tone: runtimeAuthorityReady
        ? "positive"
        : salesGateOpen
          ? "warning"
          : "quiet",
    },
    {
      ...reconciliationState,
      icon: RefreshCw,
      label: "Payment reconciliation",
    },
    {
      detail:
        "Configuration presence only; this does not claim that an email was delivered.",
      icon: Mail,
      label: "Resend",
      status: resendPresent ? "Value present" : "Not present",
      tone: resendPresent ? "positive" : "warning",
    },
  ]

  return (
    <>
      <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div className="max-w-3xl">
          <p className="text-[10px] font-semibold tracking-[0.24em] text-[#6f512f] uppercase">
            {today}
          </p>
          <h1 className="mt-2 text-4xl leading-none font-medium text-[#273029] sm:text-5xl">
            Your work, in one calm place.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#59645b]">
            Start with the work itself. HWL summarizes what is known safely and
            hands you to a provider only when that provider owns the change.
          </p>
        </div>
        <span className="inline-flex min-h-10 max-w-full items-center gap-2 rounded-full border border-[#d2cabd] bg-white/55 px-3.5 text-xs font-medium text-[#4f5a51]">
          <UserRound className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">Signed in · {access.email}</span>
        </span>
      </header>

      <section className="mt-8" aria-labelledby="daily-work-heading">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-[#6f512f] uppercase">
            Daily work
          </p>
          <h2
            className="mt-1 text-3xl font-medium text-[#273029]"
            id="daily-work-heading"
          >
            Four clear places to begin
          </h2>
        </div>

        <div className="mt-5 grid items-stretch gap-5 xl:grid-cols-2 2xl:grid-cols-4">
          <OperationsCard
            description="Review Shannon's private booking queues in HWL. Confirming, rescheduling, and cancelling remain in Cal.com."
            eyebrow="Time"
            facts={[
              { label: "Public catalog", value: calCatalogStatus },
              {
                label: "Private queues",
                value: calPrivateReadConfigured
                  ? "Configured"
                  : "Not connected",
              },
            ]}
            href="/admin/bookings"
            icon={CalendarDays}
            linkLabel="Review bookings"
            status={
              calPrivateReadConfigured
                ? "Private read configured"
                : calCatalogAvailable && calPublishedServiceCount > 0
                  ? "Catalog available"
                  : "Check needed"
            }
            title="Bookings"
            tone={
              calPrivateReadConfigured
                ? "positive"
                : calCatalogAvailable && calPublishedServiceCount > 0
                  ? "quiet"
                  : "warning"
            }
          />

          <OperationsCard
            description="Review confirmed accounts with their scoped LIFT purchases, checkout activity, and any linked booking, message, or learning history."
            eyebrow="People"
            facts={[
              {
                label: "Private records",
                value:
                  access.source === "supabase"
                    ? "Verified admin read"
                    : "Locked in local preview",
              },
              { label: "Service payments", value: "Not linked yet" },
            ]}
            href="/admin/clients"
            icon={UserRound}
            linkLabel="Open clients"
            status={
              access.source === "supabase"
                ? "Client history available"
                : "Private records locked"
            }
            title="Clients"
            tone={access.source === "supabase" ? "positive" : "quiet"}
          />

          <OperationsCard
            description="Read website inquiries and consent-based client conversations without silently merging an unverified email into a client account."
            eyebrow="Care"
            facts={[
              {
                label: "Inquiry ledger",
                value: supabaseAdminConfigured
                  ? "Configured"
                  : "Not configured",
              },
              {
                label: "Email notification",
                value: resendPresent ? "Value present" : "Not present",
              },
            ]}
            href="/admin/inquiries"
            icon={Inbox}
            linkLabel="Open inbox"
            status="Inquiries + messages"
            title="Inbox"
            tone={access.source === "supabase" ? "positive" : "quiet"}
          />

          <OperationsCard
            description="Review sanitized Stripe products, prices, payments, invoices, and HWL reconciliation state. Money changes remain in Stripe."
            eyebrow="Money"
            facts={[
              {
                label: "Stripe configuration",
                value: stripeConfigured ? "Values present" : "Incomplete",
              },
              {
                label: "Sales gate",
                value: salesGateOpen ? "Open" : "Closed",
              },
            ]}
            href="/admin/store"
            icon={CircleDollarSign}
            linkLabel="Review money"
            status={paymentsStatus}
            title="Payments"
            tone={paymentsTone}
          />
        </div>
      </section>

      <AdminPanel className="mt-5">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#526b4f] [&::-webkit-details-marker]:hidden">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[#6f512f] uppercase">
                Readiness
              </p>
              <h2 className="mt-1 text-2xl font-medium text-[#273029]">
                Review system readiness
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#59645b]">
                Eight safe checks · no secrets or invented business totals
              </p>
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-[#d2cabd] bg-white/55 text-[#526057]">
              <ArrowRight
                className="size-4 transition-transform group-open:rotate-90"
                aria-hidden="true"
              />
              <span className="sr-only">Show readiness details</span>
            </span>
          </summary>
          <dl className="mt-5 border-t border-[#ddd6ca] pt-5">
            {readiness.map((item) => (
              <ReadinessRow {...item} key={item.label} />
            ))}
          </dl>
        </details>
      </AdminPanel>

      <AdminPanel className="mt-5 border-[#d4c4ab] bg-[#f5ead8]/72">
        <div className="flex items-start gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#806342]/10 text-[#6f512f]">
            <UserRound className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-[#6f512f] uppercase">
              Client boundary
            </p>
            <h2 className="mt-1 text-2xl font-medium text-[#273029]">
              A real client-history foundation is now active.
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#59645b]">
              Clients combines confirmed profiles with canonically scoped LIFT
              commerce and any available booking, conversation, and learning
              history. Inquiries remain separate; guest identity and
              post-appointment service payments are not linked yet.
            </p>
          </div>
        </div>
      </AdminPanel>
    </>
  )
}
