"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import Button from "@/components/general/Button";
import { Input } from "@/components/ui/input";
import { checkInBooking } from "@/lib/api-client";
import { adminBookingsQueryKey } from "@/hooks/admin/use-admin-data";

/**
 * Redeem a guest's arrival code to start their stay.
 *
 * Admins can do this as well as hosts, so a guest arriving somewhere the host
 * isn't present is never stuck. The code itself is only ever shown to the
 * guest — an admin entering it is confirming the guest read it out to them.
 */
export default function AdminCheckIn({
  bookingId,
  status,
}: {
  bookingId: number;
  status: string;
}) {
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (status !== "confirmed") return null;

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await checkInBooking(bookingId, code.trim());
      setDone(true);
      setCode("");
      queryClient.invalidateQueries({ queryKey: adminBookingsQueryKey });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Check-in failed, please retry.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return <p className="text-sm font-medium text-emerald-700">Guest checked in — stay started.</p>;
  }

  return (
    <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-800">Check in guest</p>
      <p className="text-xs text-slate-500">
        Ask the guest for the 6-digit code shown in their app. The stay starts as soon as it&apos;s
        entered.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          className="w-40 tracking-[0.4em]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && code.trim().length === 6) void submit();
          }}
        />
        <Button
          type="primary"
          className="rounded-2xl"
          disabled={busy || code.trim().length !== 6}
          onClick={submit}
        >
          {busy ? "Checking in…" : "Start stay"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
