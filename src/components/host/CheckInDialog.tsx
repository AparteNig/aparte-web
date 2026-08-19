"use client";

import { useState } from "react";
import { Car, KeyRound } from "lucide-react";

import { Input } from "@/components/ui/input";
import Button from "@/components/general/Button";
import { useCheckInBookingMutation } from "@/hooks/use-bookings";
import { isVehicleBooking } from "@/lib/booking-display";
import type { HostBooking } from "@/types/listing";

/**
 * Starts a stay — or a hire — by redeeming the guest's arrival code.
 *
 * The code is never shown here: only the guest has it, and they read it out at
 * handover. That asymmetry is the whole point — a host who could see the code
 * could start a booking for someone who never turned up.
 *
 * The wording splits by kind because "check in" reads as a hotel action and
 * makes owners hesitate over which button actually releases the car.
 */
export default function CheckInControl({ booking }: { booking: HostBooking }) {
  const checkIn = useCheckInBookingMutation();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (booking.status !== "confirmed") return null;

  const isVehicle = isVehicleBooking(booking);
  const who = isVehicle ? "renter" : "guest";

  const submit = async () => {
    setError(null);
    try {
      await checkIn.mutateAsync({ bookingId: booking.id, code: code.trim() });
      setOpen(false);
      setCode("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : `Could not start the ${isVehicle ? "rental" : "stay"}, please retry.`,
      );
    }
  };

  if (!open) {
    return (
      <Button
        type="secondary"
        className="inline-flex items-center gap-1.5"
        onClick={() => setOpen(true)}
      >
        {isVehicle ? <Car className="size-3.5" /> : <KeyRound className="size-3.5" />}
        {isVehicle ? "Hand over the keys" : "Check in guest"}
      </Button>
    );
  }

  return (
    <div
      className={
        isVehicle
          ? "space-y-2 rounded-lg border border-amber-200 bg-amber-50/70 p-3"
          : "space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3"
      }
    >
      <label className="block text-sm font-medium text-slate-700">
        {isVehicle
          ? "Enter the renter's 6-digit pickup code"
          : "Enter the guest's 6-digit check-in code"}
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
          ? "Ask the renter for this at pickup. The hire clock starts as soon as it's entered."
          : `Ask the ${who} for this when they arrive. The stay starts as soon as it's entered.`}
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button
          type="secondary"
          disabled={checkIn.isPending}
          onClick={() => {
            setOpen(false);
            setCode("");
            setError(null);
          }}
        >
          Cancel
        </Button>
        <Button disabled={checkIn.isPending || code.trim().length !== 6} onClick={submit}>
          {checkIn.isPending
            ? isVehicle
              ? "Starting…"
              : "Checking in…"
            : isVehicle
              ? "Start your engines"
              : "Start stay"}
        </Button>
      </div>
    </div>
  );
}
