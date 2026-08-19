"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

import { Input } from "@/components/ui/input";
import Button from "@/components/general/Button";
import { useCheckOutBookingMutation } from "@/hooks/use-bookings";
import { bookingCopy, isVehicleBooking } from "@/lib/booking-display";
import type { HostBooking } from "@/types/listing";

/**
 * Ends a stay or rental by redeeming the guest's departure code.
 *
 * The mirror of `CheckInControl`, and for the same reason: the code is never
 * shown here. Ending a booking used to be a bare button press, so a host could
 * mark a guest gone while they were still in the property — and a host who
 * simply forgot left the guest's caution deposit parked. Requiring the code
 * makes departure something both parties were present for.
 */
export default function CheckOutControl({ booking }: { booking: HostBooking }) {
  const checkOut = useCheckOutBookingMutation();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Only a booking that actually started can end. `checkout_due` is the same
  // live stay with its end date passed, so both are valid here.
  if (booking.status !== "ongoing" && booking.status !== "checkout_due") return null;

  const isVehicle = isVehicleBooking(booking);
  const copy = bookingCopy(booking);
  const who = isVehicle ? "renter" : "guest";

  const submit = async () => {
    setError(null);
    try {
      await checkOut.mutateAsync({ bookingId: booking.id, code: code.trim() });
      setOpen(false);
      setCode("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Check-out failed, please retry.");
    }
  };

  if (!open) {
    return (
      <Button
        type="secondary"
        className="inline-flex items-center gap-1.5"
        onClick={() => setOpen(true)}
      >
        <LogOut className="size-3.5" />
        {isVehicle ? "Confirm return" : "Check out guest"}
      </Button>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <label className="block text-sm font-medium text-slate-700">
        {isVehicle
          ? "Enter the renter's 6-digit return code"
          : "Enter the guest's 6-digit check-out code"}
        <Input
          autoFocus
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          className="mt-1 tracking-[0.4em]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && code.trim().length === 6) void submit();
          }}
        />
      </label>
      <p className="text-xs text-slate-500">
        {isVehicle
          ? `Ask the ${who} for this as they hand the keys back. It is a different code from the one at pickup.`
          : `Ask the ${who} for this as they leave. It is a different code from the one at check-in.`}
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button
          type="secondary"
          disabled={checkOut.isPending}
          onClick={() => {
            setOpen(false);
            setCode("");
            setError(null);
          }}
        >
          Cancel
        </Button>
        <Button disabled={checkOut.isPending || code.trim().length !== 6} onClick={submit}>
          {checkOut.isPending ? "Confirming…" : `End ${copy.noun}`}
        </Button>
      </div>
    </div>
  );
}
