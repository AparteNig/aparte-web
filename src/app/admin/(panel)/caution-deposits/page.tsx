"use client";

import { useState } from "react";

import Button from "@/components/general/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useCautionDepositsQuery,
  useClaimCautionDepositMutation,
  useResolveCautionDepositMutation,
} from "@/hooks/admin/use-admin-data";
import { cn } from "@/lib/utils";
import type { CautionDepositRow } from "@/lib/api-client";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

const statusBadge = (status: CautionDepositRow["status"]) => {
  switch (status) {
    case "held":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "claimed":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "released":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "awarded":
      return "bg-purple-100 text-purple-700 border-purple-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

const formatDue = (iso: string | null) => {
  if (!iso) return "—";
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "releasing now";
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours >= 1) return `${hours}h`;
  return `${Math.max(1, Math.floor(ms / 60_000))}m`;
};

function DepositRow({ deposit }: { deposit: CautionDepositRow }) {
  const claim = useClaimCautionDepositMutation();
  const resolve = useResolveCautionDepositMutation();
  const [mode, setMode] = useState<"idle" | "claim" | "resolve">("idle");
  const [reason, setReason] = useState("");
  const [award, setAward] = useState("0");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const busy = claim.isPending || resolve.isPending;
  const awardNumber = Number(award);
  const awardInvalid =
    !Number.isFinite(awardNumber) || awardNumber < 0 || awardNumber > deposit.amount;

  const run = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
      setMode("idle");
      setReason("");
      setNotes("");
      setAward("0");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed, please retry.");
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">
            {deposit.stayTitle ?? `Booking #${deposit.bookingId}`}
          </p>
          <p className="text-sm text-slate-600">
            {deposit.guestName ?? "Guest"} · booking #{deposit.bookingId}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-slate-900">{naira(deposit.amount)}</p>
          <span
            className={cn(
              "inline-block rounded-full border px-2 py-0.5 text-xs font-semibold",
              statusBadge(deposit.status),
            )}
          >
            {deposit.status}
          </span>
        </div>
      </div>

      <div className="mt-2 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
        {deposit.status === "held" && (
          <p>Auto-returns to guest in {formatDue(deposit.releaseDueAt)}</p>
        )}
        {deposit.claimReason && <p>Claim: {deposit.claimReason}</p>}
        {(deposit.status === "released" || deposit.status === "awarded") && (
          <p>
            Guest {naira(deposit.amountToGuest)} · Host {naira(deposit.amountToHost)}
          </p>
        )}
        {deposit.resolutionNotes && <p>Note: {deposit.resolutionNotes}</p>}
      </div>

      {/* A failed refund leaves the deposit held and retrying — surface it loudly */}
      {deposit.releaseError && (
        <p className="mt-2 rounded bg-rose-50 p-2 text-xs text-rose-700">
          Release failing: {deposit.releaseError}
        </p>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {mode === "claim" && (
        <div className="mt-3 space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            What damage is being claimed?
            <Input
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. host reports a broken glass table"
              className="mt-1"
            />
          </label>
          <p className="text-xs text-slate-500">
            This pauses the automatic return so the deposit stays held while you review.
          </p>
          <div className="flex gap-2">
            <Button type="secondary" disabled={busy} onClick={() => setMode("idle")}>
              Cancel
            </Button>
            <Button
              disabled={busy || !reason.trim()}
              onClick={() =>
                run(() =>
                  claim.mutateAsync({ bookingId: deposit.bookingId, reason: reason.trim() }),
                )
              }
            >
              {claim.isPending ? "Holding…" : "Hold deposit"}
            </Button>
          </div>
        </div>
      )}

      {mode === "resolve" && (
        <div className="mt-3 space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Amount to award the host (0 returns everything to the guest)
            <Input
              autoFocus
              inputMode="numeric"
              value={award}
              onChange={(e) => setAward(e.target.value.replace(/[^\d]/g, ""))}
              className="mt-1"
            />
          </label>
          <p className="text-xs text-slate-500">
            Held: {naira(deposit.amount)} · Guest would receive{" "}
            {naira(Math.max(0, deposit.amount - (Number.isFinite(awardNumber) ? awardNumber : 0)))}
          </p>
          <label className="block text-sm font-medium text-slate-700">
            Resolution notes
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What you decided and why"
              className="mt-1"
            />
          </label>
          <div className="flex gap-2">
            <Button type="secondary" disabled={busy} onClick={() => setMode("idle")}>
              Cancel
            </Button>
            <Button
              disabled={busy || awardInvalid}
              onClick={() =>
                run(() =>
                  resolve.mutateAsync({
                    bookingId: deposit.bookingId,
                    amountToHost: awardNumber,
                    notes: notes.trim() || undefined,
                  }),
                )
              }
            >
              {resolve.isPending ? "Resolving…" : "Resolve deposit"}
            </Button>
          </div>
        </div>
      )}

      {mode === "idle" && (deposit.status === "held" || deposit.status === "claimed") && (
        <div className="mt-3 flex gap-2">
          {deposit.status === "held" && (
            <Button type="secondary" onClick={() => setMode("claim")}>
              Hold for damage claim
            </Button>
          )}
          <Button onClick={() => setMode("resolve")}>Resolve</Button>
        </div>
      )}
    </div>
  );
}

const FILTERS = [
  { key: "claimed", label: "Needs a decision" },
  { key: "held", label: "Held" },
  { key: "", label: "All" },
] as const;

export default function AdminCautionDepositsPage() {
  const [filter, setFilter] = useState<string>("claimed");
  const depositsQuery = useCautionDepositsQuery(filter || undefined);
  const deposits = depositsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Caution deposits</CardTitle>
          <p className="text-sm text-slate-600">
            Money Aparte holds on the guest&apos;s behalf. It returns to the guest automatically
            after checkout — only a decision here can send any of it to a host.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key || "all"}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition",
                  filter === f.key
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-600 hover:border-slate-400",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {depositsQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading deposits…</p>
          ) : deposits.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing here right now.</p>
          ) : (
            <div className="space-y-3">
              {deposits.map((deposit) => (
                <DepositRow key={deposit.id} deposit={deposit} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
