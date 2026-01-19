"use client";

import Button from "@/components/general/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAdminPayoutsQuery,
  useApprovePayoutMutation,
  useMarkPayoutPaidMutation,
  useRejectPayoutMutation,
} from "@/hooks/admin/use-admin-data";
import { cn } from "@/lib/utils";

const statusBadge = (status: string) => {
  switch (status) {
    case "pending":
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

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Payout queue</CardTitle>
          <p className="text-sm text-slate-500">
            Approve, reject, or mark manual transfer batches once processed.
          </p>
        </CardHeader>
        <CardContent>
          {payoutsQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading payout requests...</p>
          ) : payoutsQuery.data && payoutsQuery.data.length > 0 ? (
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
                  {payoutsQuery.data.map((request) => (
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
                          {request.status === "pending" && (
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
                                const reference =
                                  window.prompt("Add optional transfer reference:") ?? undefined;
                                markPaidMutation.mutate({ requestId: request.id, reference });
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
    </div>
  );
}
