"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import Button from "@/components/general/Button";
import { useCheckInBookingMutation } from "@/hooks/use-bookings";
import type { HostBooking } from "@/types/listing";

/**
 * Starts a stay by redeeming the guest's arrival code.
 *
 * The code is never shown here — only the guest has it, and they read it out at
 * handover. That asymmetry is the whole point: a host who could see the code
 * could start a stay for a guest who never turned up.
 */
export default function CheckInControl({ booking }: { booking: HostBooking }) {
  const checkIn = useCheckInBookingMutation();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (booking.status !== "confirmed") return null;

  const submit = async () => {
    setError(null);
    try {
      await checkIn.mutateAsync({ bookingId: booking.id, code: code.trim() });
      setOpen(false);
      setCode("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Check-in failed, please retry.");
    }
  };

  if (!open) {
    return (
      <Button type="secondary" onClick={() => setOpen(true)}>
        Check in guest
      </Button>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <label className="block text-sm font-medium text-slate-700">
        Enter the guest&apos;s 6-digit code
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
        Ask the guest for this when they arrive. The stay starts as soon as it&apos;s entered.
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
          {checkIn.isPending ? "Checking in…" : "Start stay"}
        </Button>
      </div>
    </div>
  );
}
