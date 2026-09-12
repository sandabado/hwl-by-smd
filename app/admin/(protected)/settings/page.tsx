import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  CreditCard,
  Database,
  ExternalLink,
  Globe2,
  Mail,
  ShieldPlus,
  ServerCog,
  ShieldCheck,
  Video,
} from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  PanelHeading,
  StatusPill,
} from "@/components/admin/admin-ui"
import { requireAdmin } from "@/lib/admin-auth"
import {
  getShannonAdminHandoffConfig,
  isShannonAdminHandoffOperator,
} from "@/lib/admin-role-handoff"
import { getCalcomPublicEventTypes } from "@/lib/calcom"
import {
  getCanonicalSiteUrl,
  getDeploymentTargetBoundary,
} from "@/lib/commerce/launch-authority"
import { getStripeDashboardBaseUrl } from "@/lib/commerce/stripe-admin"
import {
  isStripeConfigured,
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from "@/lib/env"
import {
  getExpectedStripeAccountId,
  getExpectedStripeLivemode,
  isStripeModeConfigured,
} from "@/lib/stripe"

export const dynamic = "force-dynamic"

type StatusTone = "neutral" | "positive" | "quiet" | "warning"

type IntegrationCardProps = {
  authority: string
  detail: readonly string[]
  href: string
  icon: LucideIcon
  name: string
  status: string
  tone: StatusTone
}

const PLACEHOLDER_VALUES = new Set([
  "[sensitive]",
  "changeme",
  "null",
  "placeholder",
  "required",
  "todo",
  "undefined",
])

function hasServerValue(value: string | undefined) {
  if (!value || value !== value.trim()) return false

  const normalized = value.toLowerCase()
  return Boolean(
    value && !value.startsWith("your_") && !PLACEHOLDER_VALUES.has(normalized)
  )
}

function readPublicOrigin(value: string | undefined) {
  if (!value || value !== value.trim()) return null

  try {
    const url = new URL(value)
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) {
      return null
    }

    return url.origin
  } catch {
    return null
  }
}

function targetLabel(target: ReturnType<typeof getDeploymentTargetBoundary>) {
  if (target === null) return "Unresolved runtime"
  if (target === "local") return "Local preview"
  return `${target[0].toUpperCase()}${target.slice(1)}`
}

function presenceLabel(value: boolean) {
  return value ? "present" : "not present"
}

function IntegrationCard({
  authority,
  detail,
  href,
  icon: Icon,
  name,
  status,
  tone,
}: IntegrationCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#ddd7cd] bg-white/30 p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-[#273029]/7 text-[#5e695f]">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <StatusPill tone={tone}>{status}</StatusPill>
      </div>

      <h3 className="mt-5 text-xl font-medium text-[#273029]">{name}</h3>
      <p className="mt-1 text-[10px] font-semibold tracking-[0.16em] text-[#6f512f] uppercase">
        Authority: {authority}
      </p>

      <ul className="mt-4 flex-1 space-y-2 text-xs leading-5 text-[#59645b]">
        {detail.map((item) => (
          <li className="flex gap-2" key={item}>
            <span className="mt-[0.55rem] size-1 shrink-0 rounded-full bg-[#9d8464]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <a
        className="mt-5 inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-[#cfc7ba] bg-white/55 px-4 text-xs font-medium text-[#4e5b51] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#273029]"
        href={href}
        rel="noreferrer"
        target="_blank"
      >
        Open provider
        <ExternalLink className="size-3.5" aria-hidden="true" />
        <span className="sr-only">: {name} (opens in a new tab)</span>
      </a>
    </article>
  )
}

function GateRow({
  detail,
  enabled,
  label,
}: {
  detail: string
  enabled: boolean
  label: string
}) {
  const Icon = enabled ? CheckCircle2 : CircleAlert

  return (
    <li className="flex flex-col justify-between gap-3 rounded-2xl border border-[#ddd7cd] bg-white/28 p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 items-start gap-3">
        <Icon
          className={
            enabled
              ? "mt-0.5 size-4 shrink-0 text-[#5f785d]"
              : "mt-0.5 size-4 shrink-0 text-[#936d43]"
          }
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-medium text-[#273029]">{label}</p>
          <p className="mt-1 text-xs leading-5 text-[#59645b]">{detail}</p>
        </div>
      </div>
      <StatusPill tone={enabled ? "positive" : "warning"}>
        {enabled ? "Requested by config" : "Closed by config"}
      </StatusPill>
    </li>
  )
}

export default async function AdminSettingsPage() {
  const access = await requireAdmin()
  const handoffConfig =
    access.source === "supabase" && access.role === "super_admin"
      ? getShannonAdminHandoffConfig()
      : null
  const handoffAvailable = Boolean(
    handoffConfig &&
    access.source === "supabase" &&
    access.role === "super_admin" &&
    isShannonAdminHandoffOperator(access, handoffConfig)
  )

  const calcom = await getCalcomPublicEventTypes()
  const deploymentTarget = getDeploymentTargetBoundary(process.env)
  const configuredSiteOrigin = readPublicOrigin(
    process.env.NEXT_PUBLIC_SITE_URL
  )
  const canonicalSiteUrl = getCanonicalSiteUrl(process.env)

  const supabasePublicConfigured = isSupabaseConfigured()
  const supabaseAdminConfigured = isSupabaseAdminConfigured()

  const stripeSecretsPresent = isStripeConfigured()
  const stripeAuthorityResolved = isStripeModeConfigured()
  const stripeAccountId = getExpectedStripeAccountId()
  const stripeLivemode = getExpectedStripeLivemode()
  const stripeDashboardUrl =
    stripeAccountId && stripeLivemode !== null
      ? getStripeDashboardBaseUrl(stripeAccountId, stripeLivemode)
      : null

  const calApiKeyPresent = hasServerValue(process.env.CALCOM_API_KEY)
  const calWebhookPresent = hasServerValue(process.env.CALCOM_WEBHOOK_SECRET)
  const calLedgerRequested = process.env.CALCOM_BOOKING_LEDGER_READY === "true"

  const resendKeyPresent = hasServerValue(process.env.RESEND_API_KEY)
  const resendSenderPresent = hasServerValue(process.env.CONTACT_FROM_EMAIL)
  const resendRecipientPresent = hasServerValue(process.env.CONTACT_TO_EMAIL)
  const resendConfigurationComplete =
    resendKeyPresent && resendSenderPresent && resendRecipientPresent

  const muxConfigurationComplete = [
    process.env.MUX_ACCESS_TOKEN,
    process.env.MUX_SECRET_KEY,
    process.env.MUX_SIGNING_KEY_ID,
    process.env.MUX_PRIVATE_KEY,
  ].every(hasServerValue)

  const canonicalDomainConfigured = Boolean(canonicalSiteUrl)
  const isLocalPreview = deploymentTarget === "local"
  const domainStatus = canonicalDomainConfigured
    ? "Canonical origin"
    : isLocalPreview && configuredSiteOrigin
      ? "Local origin"
      : configuredSiteOrigin
        ? "Review boundary"
        : "Not configured"

  const supabaseStatus = supabaseAdminConfigured
    ? "Admin config present"
    : supabasePublicConfigured
      ? "Public config only"
      : "Not configured"

  const stripeStatus =
    stripeSecretsPresent && stripeAuthorityResolved
      ? "Authority config present"
      : stripeSecretsPresent || stripeAuthorityResolved
        ? "Partial config"
        : "Not configured"

  const calPublicCount =
    calcom.status === "available" ? calcom.eventTypes.length : null
  const calStatus =
    calPublicCount === null
      ? "Public check unavailable"
      : calPublicCount > 0
        ? "Public catalog live"
        : "No public events"

  return (
    <>
      <AdminPageHeader
        description="A read-only view of the environment boundaries and provider handoffs behind HWL. It never displays credentials and does not pretend to edit provider settings."
        eyebrow="Operational truth"
        title="Settings"
      >
        {handoffAvailable && (
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#cfc7ba] bg-white/55 px-4 text-xs font-medium text-[#4e5b51] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#273029]"
            href="/admin/settings/access"
          >
            <ShieldPlus className="size-3.5" aria-hidden="true" />
            Administrator handoff
          </Link>
        )}
      </AdminPageHeader>

      <AdminPanel className="mt-8 border-[#cfc5b7] bg-[#273029] text-white">
        <div className="flex items-start gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/8 text-[#d4bc9b]">
            <ShieldCheck className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#d4bc9b] uppercase">
              Read-only by design
            </p>
            <h2 className="mt-2 text-2xl font-medium text-white">
              Configuration presence is not a provider test.
            </h2>
            <p className="mt-2 max-w-4xl text-xs leading-6 text-white/66">
              “Present” means this server environment contains the required
              configuration signals. Only the Cal.com public catalog below is
              checked over the network on this page. Use each provider for
              changes, then verify the corresponding HWL workflow end to end.
            </p>
          </div>
        </div>
      </AdminPanel>

      <section className="mt-8">
        <PanelHeading
          detail="Public origins and private credentials are kept separate. Secret values are never rendered."
          eyebrow="Environment"
          title="Connected foundations"
        />
        <div className="mt-5 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          <IntegrationCard
            authority="Vercel and DNS"
            detail={[
              `Runtime boundary: ${targetLabel(deploymentTarget)}.`,
              `Site origin: ${configuredSiteOrigin ?? "not present"}.`,
              `Vercel runtime signal: ${presenceLabel(process.env.VERCEL === "1")}.`,
            ]}
            href="https://vercel.com/dashboard"
            icon={Globe2}
            name="Domain and deployment"
            status={domainStatus}
            tone={
              canonicalDomainConfigured ||
              (isLocalPreview && Boolean(configuredSiteOrigin))
                ? "positive"
                : "warning"
            }
          />

          <IntegrationCard
            authority="Supabase"
            detail={[
              `Browser auth and data configuration: ${presenceLabel(supabasePublicConfigured)}.`,
              `Server administrator configuration: ${presenceLabel(supabaseAdminConfigured)}.`,
              "Presence and canonical-boundary checks only; no database request is made here.",
            ]}
            href="https://supabase.com/dashboard/projects"
            icon={Database}
            name="Accounts, data, and private files"
            status={supabaseStatus}
            tone={supabaseAdminConfigured ? "positive" : "warning"}
          />

          <IntegrationCard
            authority="Stripe"
            detail={[
              `Server secret and webhook configuration: ${presenceLabel(stripeSecretsPresent)}.`,
              `Canonical account and mode boundary: ${stripeAuthorityResolved ? "resolved" : "unresolved"}.`,
              "No Stripe request is made here; Money provides the narrow, verified live read.",
            ]}
            href={stripeDashboardUrl ?? "https://dashboard.stripe.com"}
            icon={CreditCard}
            name="Products, payments, and invoices"
            status={stripeStatus}
            tone={
              stripeSecretsPresent && stripeAuthorityResolved
                ? "positive"
                : "warning"
            }
          />

          <IntegrationCard
            authority="Cal.com"
            detail={[
              calPublicCount === null
                ? "Public event catalog request did not complete successfully."
                : `${calPublicCount} published event ${calPublicCount === 1 ? "type was" : "types were"} returned by the public catalog.`,
              `Private bookings API key: ${presenceLabel(calApiKeyPresent)}; presence only, authentication not tested here.`,
              `Booking ledger flag: ${calLedgerRequested ? "enabled" : "disabled"}; webhook secret: ${presenceLabel(calWebhookPresent)}.`,
            ]}
            href="https://app.cal.com/event-types"
            icon={CalendarClock}
            name="Availability and appointments"
            status={calStatus}
            tone={
              calPublicCount !== null && calPublicCount > 0
                ? "positive"
                : "warning"
            }
          />

          <IntegrationCard
            authority="Resend"
            detail={[
              `Server API key: ${presenceLabel(resendKeyPresent)}.`,
              `Sender configuration: ${presenceLabel(resendSenderPresent)}; recipient configuration: ${presenceLabel(resendRecipientPresent)}.`,
              "Presence only; this page does not prove delivery or mailbox receipt.",
            ]}
            href="https://resend.com/domains"
            icon={Mail}
            name="Transactional email"
            status={
              resendConfigurationComplete
                ? "Server config present"
                : resendKeyPresent ||
                    resendSenderPresent ||
                    resendRecipientPresent
                  ? "Partial config"
                  : "Not configured"
            }
            tone={resendConfigurationComplete ? "positive" : "warning"}
          />

          <IntegrationCard
            authority="Mux and Supabase Storage"
            detail={[
              `Mux protected-playback configuration: ${presenceLabel(muxConfigurationComplete)}.`,
              "The LIFT launch video uses signed Supabase Storage delivery.",
              "Mux remains relevant only to lessons that carry a Mux playback identifier.",
            ]}
            href="https://dashboard.mux.com"
            icon={Video}
            name="Protected video"
            status={
              muxConfigurationComplete
                ? "Mux config present"
                : "Supabase delivery path"
            }
            tone={muxConfigurationComplete ? "positive" : "quiet"}
          />
        </div>
      </section>

      <div className="mt-8 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <AdminPanel>
          <div className="flex items-start gap-3">
            <ServerCog
              className="mt-1 size-4 shrink-0 text-[#806340]"
              aria-hidden="true"
            />
            <PanelHeading
              detail="These are environment gates, not editable controls."
              eyebrow="Release boundaries"
              title="What this runtime allows"
            />
          </div>

          <ul className="mt-5 space-y-3">
            <GateRow
              detail="The checkout route still enforces the canonical Stripe, Supabase, product, price, storage, and deployment authority checks."
              enabled={process.env.COMMERCE_SALES_READY === "true"}
              label="LIFT checkout requests"
            />
            <GateRow
              detail="Website inquiries are accepted only when the public collection flag and server-side storage boundary both allow them."
              enabled={
                process.env.NEXT_PUBLIC_INQUIRY_COLLECTION_READY === "true"
              }
              label="Website inquiry collection"
            />
            <GateRow
              detail="A usable booking history also requires the webhook secret and the booking-record migration; this flag alone is not proof."
              enabled={calLedgerRequested && calWebhookPresent}
              label="Local booking ledger"
            />
          </ul>
        </AdminPanel>

        <AdminPanel>
          <PanelHeading
            detail="HWL keeps daily work calm by showing only narrow operational reads. Provider systems remain canonical for sensitive changes."
            eyebrow="Authority map"
            title="Where Shannon manages each responsibility"
          />

          <dl className="mt-5 divide-y divide-[#ddd7cd]">
            {[
              [
                "Bookings",
                "Review the queue in HWL; manage availability, confirmation, rescheduling, and cancellation in Cal.com.",
              ],
              [
                "Money",
                "Review the verified catalog and payment activity in HWL; change products, prices, invoices, and refunds in Stripe.",
              ],
              [
                "Clients",
                "Use the HWL client directory for the joined account history that exists today; identity and private records remain in Supabase.",
              ],
              [
                "Messages",
                "Review joined-client conversation history in HWL; reply controls stay unavailable until the write path is transactional, notified, and audited.",
              ],
              [
                "Email",
                "Manage sending domains and API credentials in Resend; verify real delivery from the website workflow.",
              ],
              [
                "Website",
                "Use Studio only for the publishing workflow it explicitly supports; deployment and domain aliases remain in Vercel.",
              ],
            ].map(([term, description]) => (
              <div
                className="grid gap-1 py-4 first:pt-0 last:pb-0 sm:grid-cols-[8rem_1fr] sm:gap-4"
                key={term}
              >
                <dt className="text-sm font-medium text-[#273029]">{term}</dt>
                <dd className="text-xs leading-5 text-[#59645b]">
                  {description}
                </dd>
              </div>
            ))}
          </dl>
        </AdminPanel>
      </div>
    </>
  )
}
