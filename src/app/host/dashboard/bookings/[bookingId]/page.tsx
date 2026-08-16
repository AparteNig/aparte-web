"use client";

import { useParams, useRouter } from "next/navigation";

import Button from "@/components/general/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CheckInControl from "@/components/host/CheckInDialog";
import {
  useAcceptBookingMutation,
  useCompleteBookingMutation,
  useHostBookingQuery,
} from "@/hooks/use-bookings";
import { cn } from "@/lib/utils";

const naira = (n: number | null | undefined) => `₦${(n ?? 0).toLocaleString("en-NG")}`;

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-NG", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const formatDateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-NG") : "—";

const statusBadge = (status: string) => {
  if (status === "confirmed" || status === "completed") return "bg-emerald-100 text-emerald-700";
  if (status === "ongoing") return "bg-blue-100 text-blue-700";
  if (status === "cancelled") return "bg-rose-100 text-rose-700";
  if (status === "awaiting_approval" || status === "pending_payment")
    return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
};

const statusLabel = (status: string) =>
  status === "awaiting_approval"
    ? "needs your answer"
    : status === "pending_payment"
    ? "awaiting payment"
    : status.replace(/_/g, " ");

function Row({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <div>
        <p className="text-sm text-slate-600">{label}</p>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
      <div className="text-right text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

export default function HostBookingDetailPage() {
  const router = useRouter();
  const params = useParams<{ bookingId: string }>();
  const bookingId = params?.bookingId ? Number(params.bookingId) : undefined;

  const { data: booking, isLoading, isError, error } = useHostBookingQuery(bookingId);
  const accept = useAcceptBookingMutation();
  const complete = useCompleteBookingMutation();

  if (isLoading) {
    return <p className="p-6 text-sm text-slate-500">Loading booking…</p>;
  }

  if (isError || !booking) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-red-600">
          {error instanceof Error ? error.message : "Booking not found."}
        </p>
        <Button type="secondary" onClick={() => router.push("/host/dashboard/bookings")}>
          Back to bookings
        </Button>
      </div>
    );
  }

  const subject =
    booking.listing?.title ??
    (booking.vehicle ? `${booking.vehicle.year} ${booking.vehicle.make} ${booking.vehicle.model}` : "Booking");

  // Damage awards are earnings that sit outside the booking payout
  const totalEarned = (booking.hostPayoutAmount ?? 0) + (booking.caution?.awardedToHost ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => router.push("/host/dashboard/bookings")}
            className="text-sm text-slate-500 hover:underline"
          >
            ← Back to bookings
          </button>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">{subject}</h2>
          <p className="text-sm text-slate-500">Booking #{booking.id}</p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold capitalize",
            statusBadge(booking.status),
          )}
        >
          {statusLabel(booking.status)}
        </span>
      </div>

      {/* Time-sensitive action first */}
      {booking.status === "awaiting_approval" && (
        <Card className="border-amber-300 bg-amber-50/60">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <p className="text-sm text-slate-700">
              This guest has paid and is waiting on you. It confirms automatically if you
              don&apos;t respond.
            </p>
            <Button disabled={accept.isPending} onClick={() => accept.mutate(booking.id)}>
              {accept.isPending ? "Accepting…" : "Accept booking"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stay</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Check-in" value={formatDate(booking.startDate)} />
            <Row label="Check-out" value={formatDate(booking.endDate)} />
            <Row label="Nights" value={booking.nights} />
            {booking.listing && (
              <Row
                label="Location"
                value={[booking.listing.city, booking.listing.country].filter(Boolean).join(", ")}
              />
            )}
            {booking.vehicle && <Row label="With driver" value={booking.withDriver ? "Yes" : "No"} />}
            <Row label="Booked on" value={formatDateTime(booking.createdAt)} />
            {booking.notes ? <Row label="Guest notes" value={booking.notes} /> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guest</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Name" value={booking.guestName} />
            <Row label="Email" value={booking.guestEmail || "—"} />
            <Row label="Phone" value={booking.guestPhone || "—"} />
            <Row
              label="Checked in"
              value={
                booking.checkedInAt
                  ? `${formatDateTime(booking.checkedInAt)} (by ${booking.checkedInByType})`
                  : "Not yet"
              }
            />
            <div className="pt-3">
              <CheckInControl booking={booking} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Accommodation" value={naira(booking.accommodationAmount)} />
            {booking.passThroughAmount > 0 && (
              <Row
                label={booking.vehicle ? "Driver fee" : "Cleaning fee"}
                value={naira(booking.passThroughAmount)}
                hint="Paid to you in full"
              />
            )}
            <Row
              label="Aparte commission"
              value={`− ${naira(booking.hostCommission)}`}
              hint="Charged on accommodation only"
            />
            {booking.caution?.awardedToHost ? (
              <Row
                label="Damage award"
                value={
                  <span className="text-emerald-700">
                    + {naira(booking.caution.awardedToHost)}
                  </span>
                }
                hint="Released to you from the caution deposit"
              />
            ) : null}
            <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <span className="font-semibold text-slate-900">You earn</span>
              <span className="text-lg font-bold text-slate-900">{naira(totalEarned)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What the guest paid</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Accommodation" value={naira(booking.accommodationAmount)} />
            {booking.passThroughAmount > 0 && (
              <Row
                label={booking.vehicle ? "Driver fee" : "Cleaning fee"}
                value={naira(booking.passThroughAmount)}
              />
            )}
            <Row
              label="Aparte service fee"
              value={naira(booking.guestServiceFee)}
              hint="Charged to the guest, not deducted from you"
            />
            {booking.cautionAmount > 0 && (
              <Row
                label="Caution deposit"
                value={naira(booking.cautionAmount)}
                hint="Refundable — held by Aparte, never paid to you"
              />
            )}
            <Row label="Total charged" value={<strong>{naira(booking.totalAmount)}</strong>} />

            {booking.caution && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">
                  Caution deposit: {booking.caution.status}
                </p>
                {booking.caution.status === "held" && booking.caution.releaseDueAt && (
                  <p>Returns to the guest on {formatDateTime(booking.caution.releaseDueAt)}.</p>
                )}
                {booking.caution.status === "claimed" && (
                  <p>On hold pending review. {booking.caution.claimReason}</p>
                )}
                {(booking.caution.status === "awarded" ||
                  booking.caution.status === "released") && (
                  <p>
                    {naira(booking.caution.returnedToGuest)} returned to the guest,{" "}
                    {naira(booking.caution.awardedToHost)} awarded to you.
                  </p>
                )}
                <p className="mt-1">
                  To claim against a deposit, contact Aparte support — an admin reviews every
                  claim.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="secondary"
          onClick={() => router.push(`/host/dashboard/messages?bookingId=${booking.id}`)}
        >
          Open chat
        </Button>
        {(booking.status === "guest_departed" || booking.status === "checkout_due") && (
          <Button disabled={complete.isPending} onClick={() => complete.mutate(booking.id)}>
            {complete.isPending ? "Completing…" : "Mark completed"}
          </Button>
        )}
      </div>
    </div>
  );
}
