import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  PanelHeading,
} from "@/components/admin/admin-ui"
import { requireSuperAdmin } from "@/lib/admin-auth"
import {
  getShannonAdminHandoffConfig,
  isShannonAdminHandoffOperator,
  SHANNON_ADMIN_EMAIL,
} from "@/lib/admin-role-handoff"

import { handoffShannonAdministratorAction } from "./actions"
import { ShannonAdminHandoffForm } from "./shannon-admin-handoff-form"

export const dynamic = "force-dynamic"

export default async function AdminAccessHandoffPage() {
  const access = await requireSuperAdmin()
  const config = getShannonAdminHandoffConfig()
  if (!config || !isShannonAdminHandoffOperator(access, config)) notFound()

  const granting = config.mode === "grant"

  return (
    <>
      <AdminPageHeader
        description="A single-purpose, audited handoff for Shannon’s permanent administrator account. This page cannot manage any other identity or grant super-administrator access."
        eyebrow="Restricted access"
        title="Administrator handoff"
      >
        <Link
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#cfc7ba] bg-white/55 px-4 text-xs font-medium text-[#4e5b51] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#273029]"
          href="/admin/settings"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to settings
        </Link>
      </AdminPageHeader>

      <div className="mt-8 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <AdminPanel className="self-start border-[#cfc5b7] bg-[#273029] text-white">
          <span className="grid size-10 place-items-center rounded-full bg-white/8 text-[#d4bc9b]">
            <LockKeyhole className="size-4" aria-hidden="true" />
          </span>
          <p className="mt-5 text-[10px] font-semibold tracking-[0.2em] text-[#d4bc9b] uppercase">
            Human authority required
          </p>
          <h2 className="mt-2 text-2xl font-medium text-white">
            The signed-in super administrator performs the change.
          </h2>
          <p className="mt-3 text-xs leading-6 text-white/68">
            HWL rechecks the actor, Shannon’s exact UUID and email, her
            confirmed Auth status, and her exact approved current role at
            submission time. The database records the human actor and approval
            reference in its append-only role audit.
          </p>
        </AdminPanel>

        <AdminPanel>
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="mt-1 size-4 shrink-0 text-[#806340]"
              aria-hidden="true"
            />
            <PanelHeading
              detail={`Fixed target: ${SHANNON_ADMIN_EMAIL}. Expected current role: ${config.expectedRole}. New role: ${config.newRole}.`}
              eyebrow="Permanent administrator"
              title={
                granting ? "Grant Shannon access" : "Revoke Shannon access"
              }
            />
          </div>

          <div className="mt-5 rounded-2xl border border-[#ddd7cd] bg-white/30 p-4 text-xs leading-5 text-[#59645b]">
            Continue only after the owner has approved this exact role change,
            actor UUID, target UUID, reference, and deployment SHA. Grant mode
            also requires Shannon to have accepted her Supabase invitation and
            signed in successfully. This action does not alter Ghosthand’s
            super-administrator role and cannot grant Shannon
            super-administrator access.
          </div>

          <ShannonAdminHandoffForm
            action={handoffShannonAdministratorAction}
            confirmationPhrase={config.confirmationPhrase}
            mode={config.mode}
          />
        </AdminPanel>
      </div>
    </>
  )
}
