"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/general/Button";
import Modal from "@/components/general/ui/modal/Modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useAdminHostsQuery,
  useApproveHostMutation,
  useRejectHostMutation,
  useRestoreHostMutation,
  useSuspendHostMutation,
} from "@/hooks/admin/use-admin-data";
import type { AdminHost } from "@/types/admin";
import { cn } from "@/lib/utils";

const statusBadge = (status: AdminHost["adminApprovalStatus"]) => {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "pending":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-rose-100 text-rose-700 border-rose-200";
  }
};

export default function AdminHostsPage() {
  const router = useRouter();
  const hostsQuery = useAdminHostsQuery();
  const suspendHost = useSuspendHostMutation();
  const restoreHost = useRestoreHostMutation();
  const approveHost = useApproveHostMutation();
  const rejectHost = useRejectHostMutation();
  const [filter, setFilter] = useState<AdminHost["adminApprovalStatus"] | "all">("all");
  const [rejectModalHost, setRejectModalHost] = useState<AdminHost | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [suspendModalHost, setSuspendModalHost] = useState<AdminHost | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const approvingHostId =
    approveHost.isPending && approveHost.variables ? approveHost.variables.hostId : null;
  const rejectingHostId =
    rejectHost.isPending && rejectHost.variables ? rejectHost.variables.hostId : null;
  const suspendingHostId =
    suspendHost.isPending && suspendHost.variables ? suspendHost.variables.hostId : null;
  const restoringHostId =
    restoreHost.isPending && typeof restoreHost.variables === "number"
      ? restoreHost.variables
      : null;
  const modalSubmitting =
    rejectModalHost && rejectingHostId === rejectModalHost.id && rejectHost.isPending;
  const suspendModalSubmitting =
    suspendModalHost && suspendingHostId === suspendModalHost.id && suspendHost.isPending;

  const hosts = useMemo(() => {
    if (!hostsQuery.data) {
      return [];
    }
    const term = searchTerm.trim().toLowerCase();
    return hostsQuery.data.filter((host) => {
      const matchesFilter = filter === "all" || host.adminApprovalStatus === filter;
      const matchesSearch =
        term.length === 0 ||
        [host.fullName, host.email, host.city, host.country]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(term));
      return matchesFilter && matchesSearch;
    });
  }, [hostsQuery.data, filter, searchTerm]);

  const handleApprove = (hostId: number) => {
    approveHost.mutate({ hostId });
  };

  const handleSuspend = (host: AdminHost) => {
    setSuspendReason("");
    setSuspendModalHost(host);
  };

  const handleRestore = (hostId: number) => {
    restoreHost.mutate(hostId);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Landlord compliance queue</h2>
            <p className="text-sm text-slate-500">
              Approve onboarding submissions, suspend risky accounts, and keep notes.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 lg:max-w-xl">
            <div className="relative">
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Search
              </label>
              <Input
                className="mt-2 rounded-2xl border-slate-200 bg-white"
                placeholder="Search name, email, or city"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="absolute right-3 top-9 text-xs font-semibold text-slate-500 hover:text-slate-800"
                  onClick={() => setSearchTerm("")}
                >
                  ×
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "pending", "approved", "rejected"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option === "all" ? "all" : option)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-semibold transition",
                    filter === option
                      ? "bg-primary/10 text-primary"
                      : "bg-slate-100 text-slate-700",
                  )}
                >
                  {option === "all" ? "All" : option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        {hostsQuery.isLoading ? (
          <p className="py-4 text-sm text-slate-500">Loading landlords...</p>
        ) : hosts.length === 0 ? (
          <p className="py-4 text-sm text-slate-500">No landlords match this filter.</p>
        ) : (
          <div className="mt-4 overflow-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-xs uppercase text-slate-500">
                <tr
                  className="cursor-pointer transition hover:bg-slate-50"
                  onClick={() => router.push(`/admin/hosts/${host.id}`)}
                >
                  <th className="pb-2">Landlord</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Onboarding</th>
                  <th className="pb-2">Notes</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hosts.map((host) => {
                  const isApprovingCurrent = approvingHostId === host.id;
                  const isRejectingCurrent = rejectingHostId === host.id;
                  const isSuspendingCurrent = suspendingHostId === host.id;
                  const isRestoringCurrent = restoringHostId === host.id;
                  return (
                    <tr
                      key={host.id}
                      className="cursor-pointer transition hover:bg-slate-50"
                      onClick={() => router.push(`/admin/hosts/${host.id}`)}
                    >
                      <td className="py-3">
                      <div className="font-semibold text-slate-900">{host.fullName ?? host.email}</div>
                      <p className="text-xs text-slate-500">
                        {host.city ?? "Unknown"}, {host.country ?? "—"}
                      </p>
                      <p className="text-xs text-slate-500">{host.email}</p>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs font-semibold",
                            statusBadge(host.adminApprovalStatus),
                          )}
                        >
                          {host.adminApprovalStatus}
                        </span>
                        {host.isSuspended && (
                          <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                            Suspended
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-xs text-slate-500">
                      {host.onboardingStatus} · Joined{" "}
                      {new Date(host.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-xs text-slate-500">
                      {host.onboardingNotes ? host.onboardingNotes.split("\n").slice(-2).join("\n") : "—"}
                    </td>
                    <td className="py-3 text-right">
                      <div
                        className="flex flex-wrap justify-end gap-2"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {host.adminApprovalStatus !== "approved" ? (
                          <>
                            <Button
                              type="primary"
                              className="rounded-2xl"
                              disabled={isApprovingCurrent}
                              onClick={() => handleApprove(host.id)}
                            >
                              {isApprovingCurrent ? "Approving..." : "Approve"}
                            </Button>
                            {host.adminApprovalStatus !== "rejected" && (
                              <Button
                                type="secondary"
                                className="rounded-2xl"
                                disabled={isRejectingCurrent}
                                onClick={() => {
                                  setRejectReason("");
                                  setRejectModalHost(host);
                                }}
                              >
                                {isRejectingCurrent ? "Rejecting..." : "Reject"}
                              </Button>
                            )}
                          </>
                        ) : host.isSuspended ? (
                          <Button
                            type="secondary"
                            className="rounded-2xl"
                            disabled={isRestoringCurrent}
                            onClick={() => handleRestore(host.id)}
                          >
                            {isRestoringCurrent ? "Restoring..." : "Restore"}
                          </Button>
                        ) : (
                          <Button
                            type="secondary"
                            className="rounded-2xl text-rose-600 hover:text-rose-700"
                            disabled={isSuspendingCurrent}
                            onClick={() => handleSuspend(host)}
                          >
                            {isSuspendingCurrent ? "Suspending..." : "Suspend"}
                          </Button>
                        )}
                      </div>
                    </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <Modal
        opened={Boolean(rejectModalHost)}
        onClose={() => {
          setRejectModalHost(null);
          setRejectReason("");
        }}
      >
        <div className="space-y-4 text-slate-800">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Reject landlord</p>
            <h3 className="text-xl font-semibold text-slate-900">
              {rejectModalHost
                ? `Request changes for ${rejectModalHost.fullName ?? rejectModalHost.email}`
                : "Request changes"}
            </h3>
            <p className="text-sm text-slate-500">
              Explain why this landlord can’t be approved yet so they can resolve issues.
            </p>
          </div>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-semibold">Reason</span>
            <textarea
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              rows={4}
              placeholder="e.g. Upload CAC document and verify support phone number."
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
            />
          </label>
          <div className="flex justify-end gap-3">
            <Button
              type="secondary"
              className="rounded-2xl"
              disabled={modalSubmitting}
              onClick={() => {
                setRejectModalHost(null);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="rounded-2xl"
              disabled={modalSubmitting || !rejectReason.trim()}
              onClick={() => {
                if (!rejectModalHost) return;
                rejectHost.mutate(
                  { hostId: rejectModalHost.id, reason: rejectReason.trim() },
                  {
                    onSuccess: () => {
                      setRejectModalHost(null);
                      setRejectReason("");
                    },
                  },
                );
              }}
            >
              {modalSubmitting ? "Rejecting..." : "Send decision"}
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        opened={Boolean(suspendModalHost)}
        onClose={() => {
          setSuspendModalHost(null);
          setSuspendReason("");
        }}
      >
        <div className="space-y-4 text-slate-800">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">
              Suspend landlord
            </p>
            <h3 className="text-xl font-semibold text-slate-900">
              {suspendModalHost
                ? `Suspend ${suspendModalHost.fullName ?? suspendModalHost.email}`
                : "Suspend landlord"}
            </h3>
            <p className="text-sm text-slate-500">
              Optional note helps other admins understand the action.
            </p>
          </div>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-semibold">Reason (optional)</span>
            <textarea
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              rows={4}
              placeholder="e.g. Fraudulent payout details or repeated guest complaints."
              value={suspendReason}
              onChange={(event) => setSuspendReason(event.target.value)}
            />
          </label>
          <div className="flex justify-end gap-3">
            <Button
              type="secondary"
              className="rounded-2xl"
              disabled={suspendModalSubmitting}
              onClick={() => {
                setSuspendModalHost(null);
                setSuspendReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="secondary"
              className="rounded-2xl bg-rose-100 text-rose-700 hover:bg-rose-200"
              disabled={suspendModalSubmitting}
              onClick={() => {
                if (!suspendModalHost) return;
                suspendHost.mutate(
                  { hostId: suspendModalHost.id, reason: suspendReason.trim() || undefined },
                  {
                    onSuccess: () => {
                      setSuspendModalHost(null);
                      setSuspendReason("");
                    },
                  },
                );
              }}
            >
              {suspendModalSubmitting ? "Suspending..." : "Confirm suspend"}
            </Button>
          </div>
        </div>
      </Modal>
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Recent notes</CardTitle>
          <p className="text-sm text-slate-500">Trail of recent onboarding updates.</p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          {hostsQuery.isLoading ? (
            <p>Loading...</p>
          ) : (
            hosts
              .filter((host) => host.onboardingNotes)
              .slice(0, 5)
              .map((host) => (
                <div key={host.id} className="rounded-2xl border border-slate-200 p-3">
                  <p className="font-semibold text-slate-900">{host.fullName ?? host.email}</p>
                  <p className="text-xs text-slate-500">
                    Updated {new Date(host.updatedAt ?? host.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{host.onboardingNotes}</p>
                </div>
              ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
