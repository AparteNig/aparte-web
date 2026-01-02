'use client';

import { useParams, useRouter } from "next/navigation";

import Button from "@/components/general/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function AdminBookingDetailPage() {
  const params = useParams<{ bookingId: string }>();
  const bookingId = Number(params?.bookingId);
  const router = useRouter();
  const bookingsQuery = useAdminBookingsQuery();
  const updateStatus = useUpdateBookingStatusMutation();
  const updateNotes = useUpdateBookingNotesMutation();
  const completeBooking = useCompleteAdminBookingMutation();

  const row = bookingsQuery.data?.find((entry) => entry.booking.id === bookingId);

  if (Number.isNaN(bookingId)) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-rose-700">
        Invalid booking reference.
      </div>
    );
  }

  if (bookingsQuery.isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Loading booking details...
      </div>
    );
  }

  if (!row) {
    return (
      <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        <p>Booking not found.</p>
        <Button
          type="secondary"
          className="rounded-2xl"
          onClick={() => router.push("/admin/bookings")}
        >
          Back to bookings
        </Button>
      </div>
    );
  }

  const { booking, listing, host } = row;
  const amount = (booking.totalAmount ?? 0) / 100;

  return (
    <div className="space-y-6">
      <Button
        type="secondary"
        className="rounded-2xl"
        onClick={() => router.push("/admin/bookings")}
      >
        ← Back to bookings
      </Button>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Booking #{booking.id}</CardTitle>
          <p className="text-sm text-slate-500">
            {listing?.title ?? `Listing #${booking.listingId}`} · Guest {booking.guestName}
          </p>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Dates</p>
              <p>
                {new Date(booking.startDate).toLocaleDateString()} –{" "}
                {new Date(booking.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Amount</p>
              <p>₦{amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Status</p>
              <p className="capitalize">{booking.status.replace("_", " ")}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Host</p>
              <p>{host?.fullName ?? host?.email ?? `Host #${booking.hostId}`}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs uppercase text-slate-500">Notes</p>
            <p>{booking.notes ?? "—"}</p>
            <Button
              type="secondary"
              className="mt-3 rounded-2xl text-xs"
              disabled={updateNotes.isPending}
              onClick={() => {
                const notes = window.prompt("Update booking notes:", booking.notes ?? "") ?? null;
                if (notes === null) return;
                updateNotes.mutate({ bookingId: booking.id, notes });
              }}
            >
              Edit notes
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="rounded-2xl border border-slate-200 px-3 py-2 text-xs"
              value={booking.status}
              onChange={(event) =>
                updateStatus.mutate({
                  bookingId: booking.id,
                  status: event.target.value,
                })
              }
            >
              {BOOKING_STATUS_OPTIONS.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption.replace("_", " ")}
                </option>
              ))}
            </select>
            {["guest_departed", "checkout_due"].includes(booking.status) && (
              <Button
                type="primary"
                className="rounded-2xl"
                disabled={completeBooking.isPending}
                onClick={() => completeBooking.mutate(booking.id)}
              >
                Mark completed + payout
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
