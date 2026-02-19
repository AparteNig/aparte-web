"use client";

import { useState } from "react";

import Button from "@/components/general/Button";
import Modal from "@/components/general/ui/modal/Modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useAdminPayoutsQuery,
  useApprovePayoutMutation,
  useMarkPayoutPaidMutation,
  useRejectPayoutMutation,
} from "@/hooks/admin/use-admin-data";
import { cn } from "@/lib/utils";
import type { AdminPayoutRequest } from "@/types/admin";

const statusBadge = (status: string) => {
  switch (status) {
    case "pending":
    case "processing":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "approved":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "paid":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "failed":
    case "rejected":
      return "bg-rose-100 text-rose-700 border-rose-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

export default function AdminPayoutsPage() {
  const payoutsQuery = useAdminPayoutsQuery();
  const approveMutation = useApprovePayoutMutation();
  const rejectMutation = useRejectPayoutMutation();
  const markPaidMutation = useMarkPayoutPaidMutation();
  const [activeTab, setActiveTab] = useState<"queue" | "history">("queue");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<AdminPayoutRequest | null>(null);
  const [referenceModal, setReferenceModal] = useState<{ requestId: number } | null>(null);
  const [referenceDraft, setReferenceDraft] = useState("");

  const payouts = payoutsQuery.data ?? [];
  const filteredPayouts = payouts.filter((request) => {
    if (activeTab === "queue") {
      return ["pending", "processing", "approved"].includes(request.status);
    }
    return ["paid", "rejected", "failed"].includes(request.status);
  });

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Payout queue</CardTitle>
          <p className="text-sm text-slate-500">
            Approve, reject, or mark manual transfer batches once processed.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["queue", "history"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  activeTab === tab ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab === "queue" ? "Queue" : "Withdrawal history"}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {payoutsQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading payout requests...</p>
          ) : filteredPayouts.length > 0 ? (
            <div className="overflow-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="pb-2">Host</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Notes</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayouts.map((request) => (
                    <tr key={request.id}>
                      <td className="py-3">
                        <div className="font-semibold text-slate-900">Landlord #{request.hostId}</div>
                        <p className="text-xs text-slate-500">
                          Requested {new Date(request.createdAt).toLocaleString()}
                        </p>
                      </td>
                      <td className="py-3">
                        <p className="font-semibold text-slate-900">
                          ₦{request.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">{request.currency}</p>
                      </td>
                      <td className="py-3">
                        <span
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                            statusBadge(request.status),
                          )}
                        >
                          {request.status}
                        </span>
                        {request.failureReason && (
                          <p className="text-xs text-rose-600">{request.failureReason}</p>
                        )}
                      </td>
                      <td className="py-3 text-xs text-slate-500">
                        {request.adminNotes ?? request.reason ?? "—"}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            type="secondary"
                            className="rounded-2xl text-xs"
                            onClick={() => setSelectedWithdrawal(request)}
                          >
                            View
                          </Button>
                          {(request.status === "pending" || request.status === "processing") && (
                            <>
                              <Button
                                type="primary"
                                className="rounded-2xl text-xs"
                                disabled={approveMutation.isPending}
                                onClick={() =>
                                  approveMutation.mutate({
                                    requestId: request.id,
                                  })
                                }
                              >
                                Approve
                              </Button>
                              <Button
                                type="secondary"
                                className="rounded-2xl text-xs"
                                disabled={rejectMutation.isPending}
                                onClick={() => {
                                  const reason = window.prompt(
                                    "Provide a rejection reason (visible to host):",
                                  );
                                  if (!reason) return;
                                  rejectMutation.mutate({ requestId: request.id, reason });
                                }}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {request.status === "approved" && (
                            <Button
                              type="secondary"
                              className="rounded-2xl text-xs text-emerald-700"
                              disabled={markPaidMutation.isPending}
                              onClick={() => {
                                setReferenceDraft("");
                                setReferenceModal({ requestId: request.id });
                              }}
                            >
                              Mark paid
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No payout requests at the moment.</p>
          )}
        </CardContent>
      </Card>
      <Modal opened={Boolean(referenceModal)} onClose={() => setReferenceModal(null)}>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Mark payout as paid</p>
            <p className="text-xs text-slate-500">Add an optional transfer reference.</p>
          </div>
          <label className="block text-sm font-medium text-slate-600">
            Transfer reference (optional)
            <Input
              className="mt-2 rounded-2xl border-slate-200 bg-white"
              placeholder="e.g. TRF-2024-0912"
              value={referenceDraft}
              onChange={(event) => setReferenceDraft(event.target.value)}
            />
          </label>
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="secondary" className="rounded-2xl" onClick={() => setReferenceModal(null)}>
              Cancel
            </Button>
            <Button
              type="primary"
              className="rounded-2xl"
              disabled={markPaidMutation.isPending || !referenceModal}
              onClick={() => {
                if (!referenceModal) return;
                const reference = referenceDraft.trim() || undefined;
                markPaidMutation.mutate(
                  { requestId: referenceModal.requestId, reference },
                  {
                    onSuccess: () => {
                      setReferenceModal(null);
                      setReferenceDraft("");
                    },
                  },
                );
              }}
            >
              {markPaidMutation.isPending ? "Saving..." : "Confirm paid"}
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
                <p className="text-xs uppercase text-slate-400">Host</p>
                <p>Landlord #{selectedWithdrawal.hostId}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Requested</p>
                <p>{new Date(selectedWithdrawal.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Approved</p>
                <p>
                  {selectedWithdrawal.approvedAt
                    ? new Date(selectedWithdrawal.approvedAt).toLocaleString()
                    : "—"}
                </p>
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
                    : "No further action"}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
              <p className="text-xs uppercase text-slate-400">Payout account</p>
              <p className="font-semibold text-slate-900">
                {selectedWithdrawal.payoutBankName ?? "—"}
              </p>
              <p>
                {selectedWithdrawal.payoutAccountName ?? "—"} ·{" "}
                {selectedWithdrawal.payoutAccountNumber ?? "—"}
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
