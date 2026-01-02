'use client';

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/general/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useAdminBookingsQuery,
  useCompleteAdminBookingMutation,
  useUpdateBookingNotesMutation,
  useUpdateBookingStatusMutation,
} from "@/hooks/admin/use-admin-data";
import { cn } from "@/lib/utils";

const BOOKING_STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "ongoing",
  "checkout_due",
  "guest_departed",
  "completed",
  "cancelled",
];

export default function AdminBookingsPage() {
  const router = useRouter();
  const bookingsQuery = useAdminBookingsQuery();
  const updateStatus = useUpdateBookingStatusMutation();
  const updateNotes = useUpdateBookingNotesMutation();
  const completeBooking = useCompleteAdminBookingMutation();
  const [statusDraft, setStatusDraft] = useState<Record<number, string>>({});
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const bookings = useMemo(() => {
    if (!bookingsQuery.data) return [];
    const term = searchTerm.trim().toLowerCase();
    return bookingsQuery.data.filter((row) => {
      const matchesStatus = statusFilter === "all" || row.booking.status === statusFilter;
      const matchesSearch =
        term.length === 0 ||
        [row.listing?.title, row.booking.guestName, row.booking.guestEmail, row.booking.guestPhone]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [bookingsQuery.data, statusFilter, searchTerm]);
  const actionableBookings = useMemo(
    () =>
      bookings.filter((row) =>
        ["pending", "guest_departed", "checkout_due", "confirmed"].includes(row.booking.status),
      ),
    [bookings],
  );

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Bookings control</CardTitle>
          <p className="text-sm text-slate-500">
            Force status transitions, annotate cases, and trigger payout completion when safe.
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:max-w-sm">
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Search
              </label>
              <Input
                className="mt-2 rounded-2xl border-slate-200 bg-white"
                placeholder="Search listing, guest, or contact"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", ...BOOKING_STATUS_OPTIONS] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatusFilter(option)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-semibold transition",
                    statusFilter === option ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-700",
                  )}
                >
                  {option === "all"
                    ? "All statuses"
                    : option
                        .split("_")
                        .map((part) => part[0].toUpperCase() + part.slice(1))
                        .join(" ")}
                </button>
              ))}
            </div>
          </div>
          {bookingsQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p className="text-sm text-slate-500">No bookings found.</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="pb-2">Listing</th>
                    <th className="pb-2">Guest</th>
                    <th className="pb-2">Dates</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((row) => {
                    const booking = row.booking;
                    const currentValue = statusDraft[booking.id] ?? booking.status;
                    const amount = (booking.totalAmount ?? 0) / 100;
                    return (
                      <tr
                        key={booking.id}
                        className="cursor-pointer transition hover:bg-slate-50"
                        onClick={() => router.push(`/admin/bookings/${booking.id}`)}
                      >
                        <td className="py-3">
                          <div className="font-semibold text-slate-900">
                            {row.listing?.title ?? `Listing #${booking.listingId}`}
                          </div>
                          <p className="text-xs text-slate-500">Booking #{booking.id}</p>
                        </td>
                        <td className="py-3">
                          <div className="font-semibold text-slate-900">{booking.guestName}</div>
                          <p className="text-xs text-slate-500">
                            {booking.guestEmail || booking.guestPhone || "—"}
                          </p>
                        </td>
                        <td className="py-3 text-xs text-slate-500">
                          {new Date(booking.startDate).toLocaleDateString()} –{" "}
                          {new Date(booking.endDate).toLocaleDateString()}
                          <br />
                          ₦{amount.toLocaleString()}
                        </td>
                        <td className="py-3">
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-semibold capitalize",
                              booking.status === "completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : booking.status === "cancelled"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-amber-100 text-amber-700",
                            )}
                          >
                            {booking.status.replace("_", " ")}
                          </span>
                          <p className="text-xs text-slate-500">
                            Notes: {booking.notes ? booking.notes.slice(0, 60) : "—"}
                          </p>
                        </td>
                        <td className="py-3 text-right" onClick={(event) => event.stopPropagation()}>
                          <div className="flex flex-col gap-2">
                            <select
                              className="rounded-2xl border border-slate-200 px-3 py-2 text-xs"
                              value={currentValue}
                              onChange={(event) =>
                                setStatusDraft((prev) => ({
                                  ...prev,
                                  [booking.id]: event.target.value,
                                }))
                              }
                            >
                              {BOOKING_STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                  {status.replace("_", " ")}
                                </option>
                              ))}
                            </select>
                            <Button
                              type="primary"
                              className="rounded-2xl text-xs"
                              disabled={updateStatus.isPending || currentValue === booking.status}
                              onClick={() => {
                                updateStatus.mutate({
                                  bookingId: booking.id,
                                  status: currentValue,
                                });
                              }}
                            >
                              Update status
                            </Button>
                            <Button
                              type="secondary"
                              className="rounded-2xl text-xs"
                              disabled={updateNotes.isPending}
                              onClick={() => {
                                const notes = window.prompt(
                                  "Add or override notes for this booking:",
                                  booking.notes ?? "",
                                );
                                if (notes === null) {
                                  return;
                                }
                                updateNotes.mutate({ bookingId: booking.id, notes });
                              }}
                            >
                              Edit notes
                            </Button>
                            {["guest_departed", "checkout_due"].includes(booking.status) && (
                              <Button
                                type="secondary"
                                className="rounded-2xl text-xs text-emerald-700"
                                disabled={completeBooking.isPending}
                                onClick={() => {
                                  completeBooking.mutate(booking.id);
                                }}
                              >
                                Mark completed + payout
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Actionable queue</CardTitle>
          <p className="text-sm text-slate-500">
            Stays needing manual follow-up (checkout, payout, or refund).
          </p>
        </CardHeader>
        <CardContent>
          {actionableBookings.length === 0 ? (
            <p className="text-sm text-slate-500">All caught up.</p>
          ) : (
            <ul className="space-y-3 text-sm text-slate-700">
              {actionableBookings.slice(0, 6).map((row) => (
                <li
                  key={row.booking.id}
                  className="rounded-2xl border border-slate-200 p-3"
                >
                  <p className="font-semibold text-slate-900">
                    {row.booking.guestName} · {row.listing?.title ?? `Listing #${row.booking.listingId}`}
                  </p>
                  <p className="text-xs text-slate-500">
                    {row.booking.status.replace("_", " ")} · stay ended{" "}
                    {new Date(row.booking.endDate).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
