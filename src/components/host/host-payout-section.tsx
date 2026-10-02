"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import Button from "@/components/general/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUpdateHostProfileMutation } from "@/hooks/use-host-profile";
import { getPaymentBanks, verifyBankAccount } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { HostProfile } from "@/types/host";

/**
 * Payout account, picked from Paystack's bank list and confirmed against the
 * registered account name before it is saved. The generic section form asked
 * a landlord to type a bank code by hand, and saved whatever name they typed.
 */
export default function HostPayoutSection({ profile }: { profile: HostProfile }) {
  const updateProfile = useUpdateHostProfileMutation();
  const banksQuery = useQuery({
    queryKey: ["paystackBanks"],
    queryFn: async () => (await getPaymentBanks()).banks,
    staleTime: 60 * 60 * 1000,
  });

  const [bankCode, setBankCode] = useState(profile.payoutBankCode ?? "");
  const [accountNumber, setAccountNumber] = useState(profile.payoutAccountNumber ?? "");
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const isComplete = profile.completedSteps.includes("PAYOUT_DETAILS");
  const bank = banksQuery.data?.find((item) => item.code === bankCode);
  const unchanged =
    bankCode === (profile.payoutBankCode ?? "") &&
    accountNumber === (profile.payoutAccountNumber ?? "");

  // A name resolved for one account must never be saved against another.
  useEffect(() => {
    setResolvedName(null);
    setError(null);
    setSaved(false);
  }, [bankCode, accountNumber]);

  const verify = async () => {
    setVerifying(true);
    setError(null);
    try {
      const result = await verifyBankAccount({ bankCode, accountNumber });
      setResolvedName(result.accountName);
    } catch (e) {
      setError(
        e instanceof Error && e.message !== "Request failed"
          ? e.message
          : "We could not confirm that account. Check the bank and number.",
      );
    } finally {
      setVerifying(false);
    }
  };

  const save = async () => {
    if (!bank || !resolvedName) return;
    setError(null);
    try {
      await updateProfile.mutateAsync({
        section: "payout",
        data: {
          payoutBankName: bank.name,
          payoutBankCode: bank.code,
          payoutAccountName: resolvedName,
          payoutAccountNumber: accountNumber,
        },
      });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save payout details.");
    }
  };

  return (
    <Card id="payout" className="border-slate-200">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Payout account</CardTitle>
            <p className="text-sm text-slate-500">Where Paystack should deposit your payouts.</p>
          </div>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              isComplete ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600",
            )}
          >
            {isComplete ? "Complete" : "Pending"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-700">
        {profile.payoutAccountNumber && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Current account</p>
            <p className="mt-1 font-semibold text-slate-900">{profile.payoutAccountName}</p>
            <p className="text-slate-600">
              {profile.payoutBankName} · {profile.payoutAccountNumber}
            </p>
          </div>
        )}

        <label className="block space-y-2">
          <span className="font-medium">Bank</span>
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
            disabled={banksQuery.isLoading}
          >
            <option value="">
              {banksQuery.isLoading ? "Loading banks…" : "Select your bank"}
            </option>
            {banksQuery.data?.map((item) => (
              <option key={item.id} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
          {banksQuery.isError && (
            <p className="text-xs text-rose-600">
              The bank list did not load.{" "}
              <button type="button" className="underline" onClick={() => banksQuery.refetch()}>
                Try again
              </button>
            </p>
          )}
        </label>

        <label className="block space-y-2">
          <span className="font-medium">Account number</span>
          <Input
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit NUBAN"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
          />
        </label>

        {resolvedName && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
            Account name: <strong>{resolvedName}</strong>
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-rose-700">{error}</div>
        )}
        {saved && <p className="text-sm text-emerald-700">Payout account saved.</p>}

        {resolvedName ? (
          <Button
            type="primary"
            className="rounded-2xl text-sm font-semibold"
            onClick={save}
            disabled={updateProfile.isPending || saved}
          >
            {updateProfile.isPending ? "Saving…" : "Save payout account"}
          </Button>
        ) : (
          <Button
            type="primary"
            className="rounded-2xl text-sm font-semibold"
            onClick={verify}
            disabled={!bank || accountNumber.length !== 10 || verifying || unchanged}
          >
            {verifying ? "Checking account…" : "Verify account"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
