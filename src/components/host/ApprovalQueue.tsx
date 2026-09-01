"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Car } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Button from "@/components/general/Button";
import {
  useAcceptBookingMutation,
  useApprovalQueueQuery,
  useDeclineBookingMutation,
} from "@/hooks/use-bookings";
import { bookingDuration, bookingSubject, isVehicleBooking } from "@/lib/booking-display";
import type { HostBooking } from "@/types/listing";

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const formatRange = (start: string, end: string) => {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${new Date(start).toLocaleDateString("en-NG", opts)} – ${new Date(
    end,
  ).toLocaleDateString("en-NG", opts)}`;
};

/**
 * Live countdown to the moment this booking confirms without the host. Ticks
 * locally rather than refetching, so the pressure is visible second by second.
 */
function useCountdown(deadline: string | null) {
  const [msLeft, setMsLeft] = useState(() =>
    deadline ? new Date(deadline).getTime() - Date.now() : 0,
  );

  useEffect(() => {
    if (!deadline) return;
    const tick = () => setMsLeft(new Date(deadline).getTime() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  if (!deadline) return null;
  if (msLeft <= 0) return "confirming now";
  const minutes = Math.floor(msLeft / 60000);
  const seconds = Math.floor((msLeft % 60000) / 1000);
  return `${minutes}:${String(seconds).padStart(2, "0")} left`;
}

function ApprovalCard({ booking }: { booking: HostBooking }) {
  const router = useRouter();
  const accept = useAcceptBookingMutation();
  const decline = useDeclineBookingMutation();
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const countdown = useCountdown(booking.approvalDueAt);

  const busy = accept.isPending || decline.isPending;
  const isVehicle = isVehicleBooking(booking);
  const what = bookingSubject(booking);

  const run = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong, please retry.");
    }
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => router.push(`/host/dashboard/bookings/${booking.id}`)}
            className="flex items-center gap-1.5 text-left font-semibold text-slate-900 hover:underline"
          >
            {isVehicle ? <Car className="size-4 shrink-0 text-slate-500" /> : null}
            {what}
          </button>
          <p className="text-sm text-slate-600">
            {booking.guestName} · {formatRange(booking.startDate, booking.endDate)} ·{" "}
            {/* A car rental is counted in days; only a stay has nights. */}
            {bookingDuration(booking, booking.nights)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-slate-900">
            {currency.format(booking.netOfRefundable ?? booking.totalAmount)}
          </p>
          {countdown && (
            <p className="text-xs font-medium text-amber-700">{countdown}</p>
          )}
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        The guest has already paid. If you don&apos;t respond this confirms automatically —
        declining refunds them in full and frees the dates.
      </p>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {declining ? (
        <div className="mt-3 space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Why can&apos;t you take this booking?
            <Input
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. the unit is already occupied"
              className="mt-1"
            />
          </label>
          <p className="text-xs text-slate-500">
            The guest sees this, so keep it factual.
          </p>
          <div className="flex gap-2">
            <Button
              type="secondary"
              disabled={busy}
              onClick={() => {
                setDeclining(false);
                setReason("");
              }}
            >
              Back
            </Button>
            <Button
              disabled={busy || !reason.trim()}
              onClick={() =>
                run(async () => {
                  const result = await decline.mutateAsync({
                    bookingId: booking.id,
                    reason: reason.trim(),
                  });
                  // The booking is cancelled either way; only the refund can lag
                  if (!result.refundInitiated) {
                    setError(
                      "Booking declined and dates freed, but the refund needs an admin to complete it.",
                    );
                  }
                })
              }
            >
              {decline.isPending ? "Declining…" : "Confirm decline"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <Button
            disabled={busy}
            onClick={() => run(() => accept.mutateAsync(booking.id))}
          >
            {accept.isPending ? "Accepting…" : "Accept booking"}
          </Button>
          <Button type="secondary" disabled={busy} onClick={() => setDeclining(true)}>
            Decline
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Sits above the bookings list. Without this the host has no way to press
 * accept, so every booking would simply time out into a confirmation.
 */
export default function ApprovalQueue() {
  const { data, isLoading } = useApprovalQueueQuery();
  const bookings = data?.bookings ?? [];

  // Nothing to answer is the normal state — stay out of the way entirely
  if (isLoading || bookings.length === 0) return null;

  return (
    <Card className="border-amber-300">
      <CardHeader>
        <CardTitle className="text-amber-900">
          Needs your answer ({bookings.length})
        </CardTitle>
        <p className="text-sm text-slate-600">
          Paid bookings waiting on you. You have {data?.approvalWindowMinutes ?? 15} minutes from
          payment before each one confirms on its own.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {bookings.map((booking) => (
          <ApprovalCard key={booking.id} booking={booking} />
        ))}
      </CardContent>
    </Card>
  );
}
