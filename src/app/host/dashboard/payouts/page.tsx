"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import Button from "@/components/general/Button";
import { showToast } from "@/components/general/ui/CustomToast";
import Modal from "@/components/general/ui/modal/Modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getHostPayoutSummary, requestHostWithdrawal } from "@/lib/api-client";
import { useHostProfileQuery, useUpdateHostProfileMutation } from "@/hooks/use-host-profile";

type BankAccount = {
  bankName: string;
  bankCode: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  usageCount: number;
  lastUsedAt: string;
};

const STORAGE_KEY = "aparte.host.payoutAccounts";

const loadAccounts = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as BankAccount[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persistAccounts = (accounts: BankAccount[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
};

const accountKey = (account: Pick<BankAccount, "bankCode" | "accountNumber">) =>
  `${account.bankCode}-${account.accountNumber}`;

const isCompleteAccount = (account: Partial<BankAccount>) =>
  Boolean(
    account.bankName &&
      account.bankCode &&
      account.accountName &&
      account.accountNumber
  );

const upsertAccount = (accounts: BankAccount[], next: BankAccount) => {
  const existingIndex = accounts.findIndex(
    (account) => accountKey(account) === accountKey(next),
  );
  if (existingIndex >= 0) {
    const updated = [...accounts];
    updated[existingIndex] = {
      ...updated[existingIndex],
      ...next,
      usageCount: updated[existingIndex].usageCount,
      lastUsedAt: new Date().toISOString(),
    };
    return updated;
  }
  if (accounts.length < 2) {
    return [...accounts, next];
  }
  const sorted = [...accounts].sort((a, b) => {
    if (a.usageCount !== b.usageCount) {
      return a.usageCount - b.usageCount;
    }
    return a.lastUsedAt.localeCompare(b.lastUsedAt);
  });
  const replaceKey = accountKey(sorted[0]);
  return accounts.map((account) =>
    accountKey(account) === replaceKey ? next : account,
  );
};

const recordUsage = (accounts: BankAccount[], current?: Partial<BankAccount>) => {
  if (!current?.bankCode || !current?.accountNumber) return accounts;
  const currentKey = `${current.bankCode}-${current.accountNumber}`;
  return accounts.map((account) => {
    if (accountKey(account) !== currentKey) return account;
    return {
      ...account,
      usageCount: account.usageCount + 1,
      lastUsedAt: new Date().toISOString(),
    };
  });
};

export default function HostPayoutsPage() {
  const profileQuery = useHostProfileQuery();
  const updateProfile = useUpdateHostProfileMutation();
  const payoutSummaryQuery = useQuery({
    queryKey: ["host", "payout-summary"],
    queryFn: () => getHostPayoutSummary(),
  });
  const withdrawMutation = useMutation({
    mutationFn: (amount: number) => requestHostWithdrawal(amount),
    onSuccess: () => {
      showToast.success("Withdrawal request submitted. It is now processing.");
      payoutSummaryQuery.refetch();
    },
    onError: (error: unknown) => {
      showToast.error(error instanceof Error ? error.message : "Withdrawal failed.");
    },
  });

  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [amount, setAmount] = useState("");
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [bankForm, setBankForm] = useState<Partial<BankAccount>>({});
  const [pendingWithdrawal, setPendingWithdrawal] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"withdrawals" | "history">("withdrawals");
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<Awaited<ReturnType<typeof getHostPayoutSummary>>["withdrawalHistory"][number] | null>(
      null,
    );

  const profile = profileQuery.data;
  const hasPayoutInfo = Boolean(
    profile?.payoutBankName && profile?.payoutAccountName && profile?.payoutAccountNumber,
  );
  const currentAccount = useMemo(
    () =>
      profile
        ? {
            bankName: profile.payoutBankName,
            bankCode: profile.payoutBankCode,
            accountName: profile.payoutAccountName,
            accountNumber: profile.payoutAccountNumber,
            routingNumber: profile.payoutRoutingNumber ?? "",
          }
        : undefined,
    [profile],
  );
  const availableBalance = payoutSummaryQuery.data?.availableBalance ?? null;

  useEffect(() => {
    setAccounts(loadAccounts());
  }, []);

  useEffect(() => {
    persistAccounts(accounts);
  }, [accounts]);

  const updateBankForm = (field: keyof BankAccount, value: string) => {
    setBankForm((prev) => ({ ...prev, [field]: value }));
  };

  const openBankModal = (prefill = true) => {
    setBankForm(prefill ? currentAccount ?? {} : {});
    setBankModalOpen(true);
  };

  const closeBankModal = () => {
    setBankModalOpen(false);
    setPendingWithdrawal(null);
  };

  const handleSaveBankDetails = () => {
    if (!isCompleteAccount(bankForm)) {
      showToast.error("Complete all required bank details.");
      return;
    }
    updateProfile.mutate(
      {
        section: "payout",
        data: {
          payoutBankName: bankForm.bankName?.trim(),
          payoutBankCode: bankForm.bankCode?.trim(),
          payoutAccountName: bankForm.accountName?.trim(),
          payoutAccountNumber: bankForm.accountNumber?.trim(),
          payoutRoutingNumber: bankForm.routingNumber?.trim(),
        },
      },
      {
        onSuccess: () => {
          const nextAccount: BankAccount = {
            bankName: bankForm.bankName?.trim() ?? "",
            bankCode: bankForm.bankCode?.trim() ?? "",
            accountName: bankForm.accountName?.trim() ?? "",
            accountNumber: bankForm.accountNumber?.trim() ?? "",
            routingNumber: bankForm.routingNumber?.trim() ?? "",
            usageCount: 0,
            lastUsedAt: new Date().toISOString(),
          };
          setAccounts((prev) => upsertAccount(prev, nextAccount));
          showToast.success("Payout account updated.");
          const amountValue = pendingWithdrawal;
          closeBankModal();
          if (amountValue !== null) {
            withdrawMutation.mutate(amountValue, {
              onSuccess: () => {
                setAccounts((prev) => recordUsage(prev, nextAccount));
              },
            });
          }
        },
      },
    );
  };

  const handleWithdraw = () => {
    const amountValue = Number(amount);
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      showToast.error("Enter a valid amount.");
      return;
    }
    if (availableBalance !== null && amountValue > availableBalance) {
      showToast.error("Insufficient balance for this withdrawal.");
      return;
    }
    if (!hasPayoutInfo) {
      setPendingWithdrawal(amountValue);
      openBankModal(true);
      return;
    }
    withdrawMutation.mutate(amountValue, {
      onSuccess: () => {
        setAccounts((prev) => recordUsage(prev, currentAccount));
      },
    });
  };

  const handleWithdrawToNewAccount = () => {
    const amountValue = Number(amount);
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      showToast.error("Enter a valid amount.");
      return;
    }
    if (availableBalance !== null && amountValue > availableBalance) {
      showToast.error("Insufficient balance for this withdrawal.");
      return;
    }
    setPendingWithdrawal(amountValue);
    openBankModal(false);
  };

  const handleUseSavedAccount = (account: BankAccount) => {
    updateProfile.mutate(
      {
        section: "payout",
        data: {
          payoutBankName: account.bankName,
          payoutBankCode: account.bankCode,
          payoutAccountName: account.accountName,
          payoutAccountNumber: account.accountNumber,
          payoutRoutingNumber: account.routingNumber,
        },
      },
      {
        onSuccess: () => {
          showToast.success("Payout account switched.");
        },
      },
    );
  };

  if (profileQuery.isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-500">
        Loading payout settings...
      </div>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Unable to load payout settings.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Payouts</h2>
        <p className="text-sm text-slate-500">
          Request withdrawals and manage where your payouts are deposited.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Available balance:{" "}
          {availableBalance === null ? "—" : `₦${availableBalance.toLocaleString()}`}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["withdrawals", "history"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                activeTab === tab ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab === "withdrawals" ? "Withdrawals" : "Withdrawal history"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "withdrawals" && !hasPayoutInfo && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">Add payout details to withdraw funds.</p>
          <p className="text-xs text-amber-700">
            We need your bank details before we can process withdrawals.
          </p>
          <Button
            type="primary"
            className="mt-3 rounded-2xl"
            onClick={() => openBankModal(true)}
          >
            Add payout account
          </Button>
        </div>
      )}

      {activeTab === "withdrawals" && (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Withdrawal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <label className="block text-sm font-medium text-slate-600">
              Amount
              <Input
                type="number"
                min="1"
                className="mt-2 rounded-2xl border-slate-200 bg-white"
                placeholder="e.g. 25000"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="primary"
                className="rounded-2xl"
                disabled={withdrawMutation.isPending}
                onClick={handleWithdraw}
              >
                {withdrawMutation.isPending ? "Submitting..." : "Withdraw"}
              </Button>
              <Button
                type="secondary"
                className="rounded-2xl"
                disabled={withdrawMutation.isPending}
                onClick={handleWithdrawToNewAccount}
              >
                Withdraw to new account
              </Button>
            </div>
            {currentAccount && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs">
                <p className="font-semibold text-slate-700">Current payout account</p>
                <p>{currentAccount.bankName}</p>
                <p>
                  {currentAccount.accountName} · {currentAccount.accountNumber}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Saved bank accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            {accounts.length === 0 ? (
              <p className="text-sm text-slate-500">No saved accounts yet.</p>
            ) : (
              accounts.map((account) => (
                <div
                  key={accountKey(account)}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-3"
                >
                  <p className="text-sm font-semibold text-slate-800">{account.bankName}</p>
                  <p className="text-xs text-slate-500">
                    {account.accountName} · {account.accountNumber}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      type="secondary"
                      className="rounded-2xl text-xs"
                      onClick={() => handleUseSavedAccount(account)}
                      disabled={updateProfile.isPending}
                    >
                      Use this account
                    </Button>
                  </div>
                </div>
              ))
            )}
            <p className="text-xs text-slate-500">
              You can save up to two accounts. Adding a third replaces the least used.
            </p>
          </CardContent>
        </Card>
      </div>
      )}

      {activeTab === "history" && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Withdrawal history</CardTitle>
            <p className="text-sm text-slate-500">
              Track your withdrawal requests and their current status.
            </p>
          </CardHeader>
          <CardContent>
            {payoutSummaryQuery.isLoading ? (
              <p className="text-sm text-slate-500">Loading withdrawal history...</p>
            ) : payoutSummaryQuery.data?.withdrawalHistory?.length ? (
              <div className="overflow-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Requested</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payoutSummaryQuery.data.withdrawalHistory.map((withdrawal) => (
                      <tr key={withdrawal.id}>
                        <td className="py-3 font-semibold text-slate-900">
                          ₦{withdrawal.amount.toLocaleString()}
                        </td>
                        <td className="py-3 capitalize">{withdrawal.status}</td>
                        <td className="py-3 text-xs text-slate-500">
                          {new Date(withdrawal.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 text-right">
                          <Button
                            type="secondary"
                            className="rounded-2xl text-xs"
                            onClick={() => setSelectedWithdrawal(withdrawal)}
                          >
                            View details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No withdrawal requests yet.</p>
            )}
          </CardContent>
        </Card>
      )}

      <Modal opened={bankModalOpen} onClose={closeBankModal}>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Payout account</p>
            <p className="text-xs text-slate-500">
              Add bank details to receive withdrawals. Save up to two accounts.
            </p>
          </div>
          <div className="grid gap-3">
            <Input
              placeholder="Bank name"
              value={bankForm.bankName ?? ""}
              onChange={(event) => updateBankForm("bankName", event.target.value)}
            />
            <Input
              placeholder="Bank code"
              value={bankForm.bankCode ?? ""}
              onChange={(event) => updateBankForm("bankCode", event.target.value)}
            />
            <Input
              placeholder="Account name"
              value={bankForm.accountName ?? ""}
              onChange={(event) => updateBankForm("accountName", event.target.value)}
            />
            <Input
              placeholder="Account number"
              value={bankForm.accountNumber ?? ""}
              onChange={(event) => updateBankForm("accountNumber", event.target.value)}
            />
            <Input
              placeholder="Routing/reference (optional)"
              value={bankForm.routingNumber ?? ""}
              onChange={(event) => updateBankForm("routingNumber", event.target.value)}
            />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="secondary" className="rounded-2xl" onClick={closeBankModal}>
              Cancel
            </Button>
            <Button
              type="primary"
              className="rounded-2xl"
              disabled={updateProfile.isPending}
              onClick={handleSaveBankDetails}
            >
              {updateProfile.isPending ? "Saving..." : "Save payout account"}
            </Button>
          </div>
        </div>
      </Modal>
      <Modal opened={Boolean(selectedWithdrawal)} onClose={() => setSelectedWithdrawal(null)}>
        {selectedWithdrawal && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Withdrawal details</p>
              <p className="text-xs text-slate-500">
                Request #{selectedWithdrawal.id} · {selectedWithdrawal.status}
              </p>
            </div>
            <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-slate-400">Amount</p>
                <p className="font-semibold text-slate-900">
                  ₦{selectedWithdrawal.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Status</p>
                <p className="capitalize">{selectedWithdrawal.status}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Requested</p>
                <p>{new Date(selectedWithdrawal.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Approved</p>
                <p>{selectedWithdrawal.approvedAt ? new Date(selectedWithdrawal.approvedAt).toLocaleString() : "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Completed</p>
                <p>
                  {selectedWithdrawal.processedAt
                    ? new Date(selectedWithdrawal.processedAt).toLocaleString()
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Next stage</p>
                <p>
                  {selectedWithdrawal.status === "processing" || selectedWithdrawal.status === "pending"
                    ? "Awaiting admin approval"
                    : selectedWithdrawal.status === "approved"
                    ? "Awaiting manual transfer"
                    : selectedWithdrawal.status === "paid"
                    ? "Completed"
                    : "Contact support"}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
              <p className="text-xs uppercase text-slate-400">Payout account</p>
              <p className="font-semibold text-slate-900">
                {selectedWithdrawal.payoutBankName ?? "—"}
              </p>
              <p>
                {selectedWithdrawal.payoutAccountName ?? "—"} · {selectedWithdrawal.payoutAccountNumber ?? "—"}
              </p>
            </div>
            {selectedWithdrawal.adminNotes && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
                <p className="text-xs uppercase text-slate-400">Admin notes</p>
                <p>{selectedWithdrawal.adminNotes}</p>
              </div>
            )}
            {selectedWithdrawal.failureReason && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
                <p className="text-xs uppercase text-rose-500">Issue</p>
                <p>{selectedWithdrawal.failureReason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
