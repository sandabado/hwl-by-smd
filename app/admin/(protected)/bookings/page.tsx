import { CalendarCheck, Download, Search } from "lucide-react"
import Link from "next/link"

import {
  AdminPageHeader,
  AdminPanel,
  PreviewPill,
  ReadOnlyButton,
  StatusPill,
} from "@/components/admin/admin-ui"
import { adminBookings } from "@/lib/admin-preview-data"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export default async function AdminBookingsPage() {
  await requireAdmin()

  return (
    <>
      <AdminPageHeader
        description="A clear service ledger for consultations, coaching, beauty rituals, yoga, and private group experiences."
        eyebrow="Care schedule"
        title="Bookings"
      >
        <ReadOnlyButton>
          <Download className="mr-2 inline size-3.5" aria-hidden="true" />
          Export
        </ReadOnlyButton>
        <ReadOnlyButton>New booking</ReadOnlyButton>
      </AdminPageHeader>

      <AdminPanel className="mt-8">
        <div className="flex flex-col gap-3 border-b border-[#d9d3c8] pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-[#688064]/10 text-[#5b7058]">
              <CalendarCheck className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium">Upcoming care</p>
              <p className="text-xs text-[#7d847c]">
                {adminBookings.length} sample bookings
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <span className="sr-only">Search bookings</span>
              <Search
                className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#899089]"
                aria-hidden="true"
              />
              <input
                className="h-10 w-52 rounded-full border border-[#d4cdc1] bg-white/45 pr-4 pl-9 text-xs"
                disabled
                placeholder="Search bookings"
              />
            </label>
            <select
              aria-label="Filter bookings"
              className="h-10 rounded-full border border-[#d4cdc1] bg-white/45 px-3 text-xs text-[#788078]"
              defaultValue="upcoming"
              disabled
            >
              <option value="upcoming">Upcoming</option>
            </select>
            <PreviewPill />
          </div>
        </div>

        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#d9d3c8] text-[9px] font-semibold tracking-[0.16em] text-[#868d86] uppercase">
                <th className="px-3 py-4">Date</th>
                <th className="px-3 py-4">Client</th>
                <th className="px-3 py-4">Service</th>
                <th className="px-3 py-4">Format</th>
                <th className="px-3 py-4">Value</th>
                <th className="px-3 py-4">Status</th>
                <th className="px-3 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {adminBookings.map((booking) => (
                <tr
                  className="border-b border-[#e0dbd1] last:border-0"
                  key={booking.id}
                >
                  <td className="px-3 py-4">
                    <p className="text-sm font-medium">{booking.date}</p>
                    <p className="mt-1 text-xs text-[#818981]">
                      {booking.time}
                    </p>
                  </td>
                  <td className="px-3 py-4 text-sm text-[#566158]">
                    {booking.client}
                  </td>
                  <td className="px-3 py-4">
                    <p className="text-sm font-medium">{booking.service}</p>
                    <p className="mt-1 text-xs text-[#818981]">
                      {booking.duration}
                    </p>
                  </td>
                  <td className="px-3 py-4 text-sm text-[#707970]">
                    {booking.format}
                  </td>
                  <td className="px-3 py-4 text-sm text-[#566158]">
                    {booking.value}
                  </td>
                  <td className="px-3 py-4">
                    <StatusPill
                      tone={
                        booking.status === "Confirmed"
                          ? "positive"
                          : booking.status === "Pending"
                            ? "warning"
                            : "quiet"
                      }
                    >
                      {booking.status}
                    </StatusPill>
                  </td>
                  <td className="px-3 py-4 text-right">
                    <Link
                      className="text-xs font-medium text-[#876947] underline-offset-4 hover:underline"
                      href={`/admin/bookings/${booking.id}`}
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </>
  )
}
