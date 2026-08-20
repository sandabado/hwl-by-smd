import {
  Bell,
  CircleDollarSign,
  Cloud,
  CreditCard,
  Globe2,
  ImageIcon,
  KeyRound,
  Mail,
  Palette,
  UsersRound,
  Video,
} from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  FieldPreview,
  PanelHeading,
  ReadOnlyButton,
  StatusPill,
} from "@/components/admin/admin-ui"
import { requireAdmin } from "@/lib/admin-auth"
import { getCalcomPublicEventTypes } from "@/lib/calcom"
import {
  isStripeConfigured,
  isSupabaseAdminConfigured,
  publicEnv,
} from "@/lib/env"

export const dynamic = "force-dynamic"

function present(value: string | undefined) {
  return Boolean(value && !value.startsWith("your_"))
}

function IntegrationCard({
  icon: Icon,
  name,
  connected,
  detail,
  statusLabel,
}: {
  icon: typeof Cloud
  name: string
  connected: boolean
  detail: string
  statusLabel?: string
}) {
  return (
    <div className="rounded-2xl border border-[#ddd7cd] bg-white/26 p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-[#273029]/6 text-[#5e695f]">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <StatusPill tone={connected ? "positive" : "warning"}>
          {statusLabel ?? (connected ? "Configured" : "Waiting")}
        </StatusPill>
      </div>
      <p className="mt-4 text-sm font-medium">{name}</p>
      <p className="mt-1 text-xs leading-5 text-[#7a827a]">{detail}</p>
      <div className="mt-4">
        <ReadOnlyButton compact>Configure</ReadOnlyButton>
      </div>
    </div>
  )
}

export default async function AdminSettingsPage() {
  await requireAdmin()
  const calcom = await getCalcomPublicEventTypes()

  const muxConfigured = Boolean(
    present(process.env.MUX_ACCESS_TOKEN) &&
    present(process.env.MUX_SECRET_KEY) &&
    present(process.env.MUX_SIGNING_KEY_ID) &&
    present(process.env.MUX_PRIVATE_KEY)
  )
  const resendConfigured = present(process.env.RESEND_API_KEY)
  const calProfileLinked = calcom.status === "available"
  const calPublishedEventCount = calcom.eventTypes.length
  const calBookingReady = calProfileLinked && calPublishedEventCount > 0
  const domainConfigured =
    present(process.env.NEXT_PUBLIC_SITE_URL) &&
    !publicEnv.siteUrl.includes("localhost")

  return (
    <>
      <AdminPageHeader
        description="The operational foundation for brand, domain, secure connections, notifications, and trusted access."
        eyebrow="Foundation"
        title="Settings"
      >
        <ReadOnlyButton>Save changes</ReadOnlyButton>
      </AdminPageHeader>

      <nav
        aria-label="Settings sections"
        className="mt-8 flex gap-2 overflow-x-auto pb-2"
      >
        {[
          ["Brand", "#brand"],
          ["Domain", "#domain"],
          ["Integrations", "#integrations"],
          ["Notifications", "#notifications"],
          ["Team", "#team"],
          ["Billing", "#billing"],
        ].map(([label, href]) => (
          <a
            className="shrink-0 rounded-full border border-[#d4cdc1] bg-white/42 px-4 py-2 text-xs text-[#626d63] transition hover:bg-white/70"
            href={href}
            key={href}
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="mt-4 space-y-5">
        <AdminPanel id="brand">
          <div className="grid gap-7 xl:grid-cols-[0.65fr_1.35fr]">
            <div>
              <PanelHeading
                detail="Visual identity preview"
                eyebrow="Brand"
                title="HWL by SMD"
              />
              <div className="mt-5 grid min-h-44 place-items-center rounded-2xl border border-dashed border-[#d2cabd] bg-[#f6f1e8]/45 text-center">
                <div>
                  <ImageIcon
                    className="mx-auto size-5 text-[#9d8464]"
                    aria-hidden="true"
                  />
                  <p className="mt-3 font-serif text-2xl">HWL by SMD</p>
                  <p className="mt-1 text-[9px] tracking-[0.22em] text-[#8c806f] uppercase">
                    Body · Beauty · Being
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldPreview label="Brand name" value="HWL by SMD" />
              <FieldPreview label="Tagline" value="Body · Beauty · Being" />
              <FieldPreview label="Serif" value="System Serif" />
              <FieldPreview label="Sans serif" value="System Sans" />
              <div>
                <p className="mb-2 text-[10px] font-semibold tracking-[0.15em] text-[#818981] uppercase">
                  Palette
                </p>
                <div className="flex min-h-12 items-center gap-2 rounded-xl border border-[#d9d3c8] bg-[#f6f2ea]/70 px-4">
                  {["#273029", "#5a4a3f", "#c4a882", "#faf7f2"].map((color) => (
                    <span
                      className="size-7 rounded-full border border-black/5"
                      key={color}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-end">
                <ReadOnlyButton>
                  <Palette
                    className="mr-2 inline size-3.5"
                    aria-hidden="true"
                  />
                  Edit identity
                </ReadOnlyButton>
              </div>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel id="domain">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4">
              <span className="grid size-11 place-items-center rounded-full bg-[#6d7d85]/10 text-[#60717a]">
                <Globe2 className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-[#9d8464] uppercase">
                  Domain
                </p>
                <h2 className="mt-1 text-2xl">howlbysmd.com</h2>
                <p className="mt-1 text-xs text-[#7a827a]">
                  Public home for the HWL experience
                </p>
              </div>
            </div>
            <StatusPill tone={domainConfigured ? "positive" : "warning"}>
              {domainConfigured ? "URL configured" : "Local preview"}
            </StatusPill>
          </div>
        </AdminPanel>

        <AdminPanel id="integrations">
          <PanelHeading
            detail="Presence checks only; secret values never appear in this interface."
            eyebrow="Integrations"
            title="Connected foundations"
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <IntegrationCard
              connected={isStripeConfigured()}
              detail="Payments, subscriptions, and webhooks"
              icon={CreditCard}
              name="Stripe"
            />
            <IntegrationCard
              connected={isSupabaseAdminConfigured()}
              detail="Authentication, data, and private files"
              icon={KeyRound}
              name="Supabase"
            />
            <IntegrationCard
              connected={muxConfigured}
              detail="Uploads and signed video playback"
              icon={Video}
              name="Mux"
            />
            <IntegrationCard
              connected={resendConfigured}
              detail="Transactional and contact email"
              icon={Mail}
              name="Resend"
            />
            <IntegrationCard
              connected={calBookingReady}
              detail={
                calProfileLinked
                  ? `${calPublishedEventCount} published event ${calPublishedEventCount === 1 ? "type" : "types"} on the public profile`
                  : "Public profile check unavailable; no personal calendar data was read"
              }
              icon={Cloud}
              name="Cal.com"
              statusLabel={
                calBookingReady
                  ? "Live"
                  : calProfileLinked
                    ? "Setup needed"
                    : "Check needed"
              }
            />
          </div>
        </AdminPanel>

        <div className="grid gap-5 xl:grid-cols-2">
          <AdminPanel id="notifications">
            <div className="flex items-center gap-3">
              <Bell className="size-4 text-[#9d8464]" aria-hidden="true" />
              <PanelHeading eyebrow="Notifications" title="What reaches you" />
            </div>
            <div className="mt-5 space-y-3">
              {["New members", "Purchases", "Bookings", "Private messages"].map(
                (label) => (
                  <label
                    className="flex items-center justify-between gap-4 rounded-xl border border-[#ddd7cd] bg-white/24 px-4 py-3 text-sm text-[#5f695f]"
                    key={label}
                  >
                    {label}
                    <input checked disabled readOnly type="checkbox" />
                  </label>
                )
              )}
            </div>
          </AdminPanel>

          <AdminPanel id="team">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <UsersRound
                  className="size-4 text-[#9d8464]"
                  aria-hidden="true"
                />
                <PanelHeading eyebrow="Team" title="Trusted access" />
              </div>
              <ReadOnlyButton compact>Add person</ReadOnlyButton>
            </div>
            <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-[#ddd7cd] bg-white/24 p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-[#c9ae88] font-serif text-lg">
                  S
                </span>
                <div>
                  <p className="text-sm font-medium">Shannon Dixon</p>
                  <p className="mt-1 text-xs text-[#7a827a]">
                    Owner · Administrator
                  </p>
                </div>
              </div>
              <StatusPill tone="positive">Primary</StatusPill>
            </div>
            <p className="mt-4 text-xs leading-5 text-[#7a827a]">
              Future team roles will be explicit: Administrator, Editor, or
              Viewer. No role-changing action exists in this preview.
            </p>
          </AdminPanel>
        </div>

        <AdminPanel id="billing">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4">
              <span className="grid size-11 place-items-center rounded-full bg-[#9d8464]/10 text-[#876947]">
                <CircleDollarSign className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-[#9d8464] uppercase">
                  Whole Body OS billing
                </p>
                <h2 className="mt-1 text-2xl">Owner-controlled platform</h2>
                <p className="mt-1 text-xs text-[#7a827a]">
                  No fictional platform subscription is attached to this
                  preview.
                </p>
              </div>
            </div>
            <StatusPill tone="neutral">Self-managed</StatusPill>
          </div>
        </AdminPanel>
      </div>
    </>
  )
}
