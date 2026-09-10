import { notFound, redirect } from "next/navigation"
import { LockKeyhole, Sparkles } from "lucide-react"

import { AdminLoginForm } from "@/components/admin/admin-login-form"
import { hasDemoAdminSession, isDemoAdminEnabled } from "@/lib/demo-admin"

export const dynamic = "force-dynamic"

export default async function AdminLoginPage() {
  if (!isDemoAdminEnabled()) notFound()
  if (await hasDemoAdminSession()) redirect("/admin")

  return (
    <div className="min-h-screen bg-[#e9e1d4] px-6 py-12 text-[#273029]">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/50 bg-[#f4efe7] shadow-[0_40px_120px_rgba(39,48,41,0.18)] lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden bg-[#273029] p-12 text-[#f4efe7] lg:flex lg:flex-col">
          <div className="absolute -top-28 -right-28 size-80 rounded-full border border-white/8" />
          <div className="absolute -top-10 -right-10 size-52 rounded-full border border-white/8" />
          <p className="text-xs tracking-[0.3em] text-[#c9ae88] uppercase">
            HWL by SMD
          </p>
          <div className="my-auto">
            <Sparkles className="size-6 text-[#c9ae88]" aria-hidden="true" />
            <h1 className="mt-7 text-7xl leading-[0.88] font-medium">
              The quiet
              <br />
              <em className="font-normal text-[#c9ae88]">control room.</em>
            </h1>
            <p className="mt-8 max-w-md text-base leading-relaxed text-white/55">
              Step behind the brand to see today&apos;s priorities, bookings,
              clients, messages, money, and the public experience.
            </p>
          </div>
          <p className="text-xs text-white/60">
            Development preview · Local access only
          </p>
        </section>

        <section className="flex items-center p-8 md:p-14">
          <div className="w-full">
            <span className="grid size-12 place-items-center rounded-full border border-[#d7d0c3] bg-white/55">
              <LockKeyhole
                className="size-5 text-[#9d8464]"
                aria-hidden="true"
              />
            </span>
            <p className="mt-8 text-xs tracking-[0.28em] text-[#806342] uppercase">
              Shannon&apos;s admin preview
            </p>
            <h2 className="mt-4 text-5xl font-medium">Welcome back.</h2>
            <p className="mt-4 max-w-sm leading-relaxed text-[#626c63]">
              Enter the temporary credentials to preview the Whole Body OS
              control room.
            </p>
            <AdminLoginForm />
          </div>
        </section>
      </div>
    </div>
  )
}
