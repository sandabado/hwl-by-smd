import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Clock3,
  MapPin,
  UserRound,
} from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  EmptyState,
  FieldPreview,
  PanelHeading,
  ReadOnlyButton,
  StatusPill,
} from "@/components/admin/admin-ui"
import { adminBookings } from "@/lib/admin-preview-data"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const booking = adminBookings.find((item) => item.id === id)

  if (!booking) notFound()

  return (
    <>
      <Link
        className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-[#756147] underline-offset-4 hover:underline"
        href="/admin/bookings"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        All bookings
      </Link>
      <AdminPageHeader
        description="A complete appointment view for preparation, timing, client context, and post-session follow-up."
        eyebrow="Sample booking"
        title={booking.service}
      >
        <ReadOnlyButton>Reschedule</ReadOnlyButton>
        <ReadOnlyButton>Cancel booking</ReadOnlyButton>
      </AdminPageHeader>

      <div className="mt-8 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <AdminPanel>
          <div className="flex items-center justify-between gap-3">
            <PanelHeading eyebrow="Appointment" title="Booking details" />
            <StatusPill
              tone={booking.status === "Confirmed" ? "positive" : "warning"}
            >
              {booking.status}
            </StatusPill>
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <UserRound className="size-4 text-[#9d8464]" aria-hidden="true" />
              <p className="text-sm">{booking.client}</p>
            </div>
            <div className="flex items-center gap-3">
              <CalendarDays
                className="size-4 text-[#9d8464]"
                aria-hidden="true"
              />
              <p className="text-sm">{booking.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <Clock3 className="size-4 text-[#9d8464]" aria-hidden="true" />
              <p className="text-sm">
                {booking.time} · {booking.duration}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="size-4 text-[#9d8464]" aria-hidden="true" />
              <p className="text-sm">{booking.format}</p>
            </div>
          </div>
          <div className="mt-6 space-y-4 border-t border-[#ddd7cd] pt-5">
            <FieldPreview label="Value" value={booking.value} />
            <FieldPreview label="Source" value="Sample booking record" />
          </div>
        </AdminPanel>

        <div className="space-y-5">
          <AdminPanel>
            <PanelHeading eyebrow="Preparation" title="Intake form" />
            <div className="mt-5">
              <EmptyState
                description="No real health, care, or preference information is stored in this preview. Production intake must use explicit consent and limited access."
                icon={ClipboardList}
                title="No verified intake"
              />
            </div>
          </AdminPanel>
          <AdminPanel>
            <PanelHeading eyebrow="Internal" title="Session notes" />
            <div className="mt-5">
              <FieldPreview
                label="Private note"
                multiline
                value="Notes are intentionally unavailable until role permissions, retention rules, and an audit trail are implemented."
              />
            </div>
          </AdminPanel>
        </div>
      </div>
    </>
  )
}
