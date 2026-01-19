'use client';

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/general/Button";
import Modal from "@/components/general/ui/modal/Modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useAdminListingsQuery,
  useApproveListingMutation,
  useRejectListingMutation,
  useRestoreListingMutation,
  useSuspendListingMutation,
} from "@/hooks/admin/use-admin-data";
import { cn } from "@/lib/utils";

const listingStatusChip = (status: string) => {
  switch (status) {
    case "published":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "pending_review":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "rejected":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "suspended":
      return "bg-rose-100 text-rose-700 border-rose-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

export default function AdminListingsPage() {
  const router = useRouter();
  const listingsQuery = useAdminListingsQuery();
  const approveListing = useApproveListingMutation();
  const rejectListing = useRejectListingMutation();
  const suspendListing = useSuspendListingMutation();
  const restoreListing = useRestoreListingMutation();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [rejectModalListing, setRejectModalListing] = useState<{ id: number; title: string } | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const rejectingListingId =
    rejectListing.isPending && rejectListing.variables ? rejectListing.variables.listingId : null;
  const modalSubmitting =
    rejectModalListing && rejectingListingId === rejectModalListing.id && rejectListing.isPending;
  const statusOptions = ["all", "pending_review", "published", "suspended", "draft"] as const;
  const filteredListings = useMemo(() => {
    if (!listingsQuery.data) return [];
    const term = searchTerm.trim().toLowerCase();
    return listingsQuery.data.filter((entry) => {
      const matchesStatus = statusFilter === "all" || entry.listing.status === statusFilter;
      const matchesSearch =
        term.length === 0 ||
        [entry.listing.title, entry.host?.fullName, entry.host?.email, entry.listing.city, entry.listing.country]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [listingsQuery.data, statusFilter, searchTerm]);

  const closeRejectModal = () => {
    setRejectModalListing(null);
    setReviewNotes("");
  };
  const confirmReject = () => {
    if (!rejectModalListing) return;
    rejectListing.mutate(
      {
        listingId: rejectModalListing.id,
        reviewNotes: reviewNotes.trim() ? reviewNotes.trim() : undefined,
      },
      {
        onSuccess: () => {
          closeRejectModal();
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Listing approvals</CardTitle>
          <p className="text-sm text-slate-500">
            Vet new supply, leave review notes, and publish trusted homes.
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:max-w-sm">
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Search
              </label>
              <Input
                className="mt-2 rounded-2xl border-slate-200 bg-white"
                placeholder="Search title, host, city..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatusFilter(option)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-semibold transition",
                    statusFilter === option ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-700",
                  )}
                >
                  {option === "all"
                    ? "All statuses"
                    : option
                        .split("_")
                        .map((part) => part[0].toUpperCase() + part.slice(1))
                        .join(" ")}
                </button>
              ))}
            </div>
          </div>
          {listingsQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading listings...</p>
          ) : listingsQuery.data && listingsQuery.data.length > 0 ? (
            <div className="overflow-auto">
              {filteredListings.length === 0 ? (
                <p className="text-sm text-slate-500">No listings match your filters.</p>
              ) : (
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr>
                      <th className="pb-2">Listing</th>
                      <th className="pb-2">Landlord</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Notes</th>
                      <th className="pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredListings.map((entry) => {
                      const isApprovingCurrent =
                        approveListing.isPending &&
                        approveListing.variables?.listingId === entry.listing.id;
                      const isRejectingCurrent = rejectingListingId === entry.listing.id;
                      const isSuspendingCurrent =
                        suspendListing.isPending &&
                        suspendListing.variables?.listingId === entry.listing.id;
                      const isRestoringCurrent =
                        restoreListing.isPending && restoreListing.variables === entry.listing.id;
                      const isReviewStage =
                        entry.listing.status !== "published" && entry.listing.status !== "suspended";
                      const isPublished = entry.listing.status === "published";
                      const isSuspended = entry.listing.status === "suspended";
                      return (
                        <tr
                          key={entry.listing.id}
                          className="cursor-pointer transition hover:bg-slate-50"
                          onClick={() => router.push(`/admin/listings/${entry.listing.id}`)}
                        >
                          <td className="py-3">
                            <div className="font-semibold text-slate-900">{entry.listing.title}</div>
                            <p className="text-xs text-slate-500">
                              {entry.listing.city ?? "Unknown"}, {entry.listing.country ?? "—"}
                            </p>
                            <p className="text-xs text-slate-500">
                              ₦{entry.listing.nightlyPrice.toLocaleString()} per night
                            </p>
                          </td>
                          <td className="py-3">
                            <div className="font-semibold text-slate-900">
                              {entry.host?.fullName ?? `Landlord #${entry.listing.hostId}`}
                            </div>
                            <p className="text-xs text-slate-500">{entry.host?.email ?? "—"}</p>
                          </td>
                          <td className="py-3">
                            {(() => {
                              const isRejected =
                                entry.listing.status === "suspended" &&
                                entry.listing.reviewNotes?.toLowerCase().includes("reject");
                              const badgeStatus = isRejected ? "rejected" : entry.listing.status;
                              const label = isRejected
                                ? "Rejected"
                                : entry.listing.status.replace("_", " ");
                              return (
                                <span
                                  className={cn(
                                    "rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                                    listingStatusChip(badgeStatus),
                                  )}
                                >
                                  {label}
                                </span>
                              );
                            })()}
                            <p className="text-xs text-slate-500">
                              Updated {new Date(entry.listing.updatedAt).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="py-3 text-xs text-slate-500">
                            {entry.listing.reviewNotes ? (
                              <span className="whitespace-pre-wrap">{entry.listing.reviewNotes}</span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex flex-wrap justify-end gap-2">
                              {isReviewStage && (
                                <Button
                                  type="primary"
                                  className="rounded-2xl"
                                  disabled={isApprovingCurrent}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    approveListing.mutate({
                                      listingId: entry.listing.id,
                                    });
                                  }}
                                >
                                  {isApprovingCurrent ? "Approving..." : "Approve"}
                                </Button>
                              )}
                              {isReviewStage && (
                                <Button
                                  type="secondary"
                                  className="rounded-2xl"
                                  disabled={isRejectingCurrent}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setReviewNotes("");
                                    setRejectModalListing({ id: entry.listing.id, title: entry.listing.title });
                                  }}
                                >
                                  {isRejectingCurrent ? "Rejecting..." : "Reject"}
                                </Button>
                              )}
                              {isPublished && (
                                <Button
                                  type="secondary"
                                  className="rounded-2xl text-rose-600 hover:text-rose-700"
                                  disabled={isSuspendingCurrent}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    const reason =
                                      window.prompt("Suspension reason (optional):") ?? undefined;
                                    suspendListing.mutate({
                                      listingId: entry.listing.id,
                                      reason: reason?.trim() ? reason : undefined,
                                    });
                                  }}
                                >
                                  {isSuspendingCurrent ? "Suspending..." : "Suspend"}
                                </Button>
                              )}
                              {isSuspended && (
                                <Button
                                  type="secondary"
                                  className="rounded-2xl"
                                  disabled={isRestoringCurrent}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    restoreListing.mutate(entry.listing.id);
                                  }}
                                >
                                  {isRestoringCurrent ? "Unsuspending..." : "Unsuspend"}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No listings in the queue.</p>
          )}
        </CardContent>
      </Card>
      <Modal opened={Boolean(rejectModalListing)} onClose={closeRejectModal}>
        <div className="space-y-4 text-slate-800">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Reject listing</p>
            <h3 className="text-xl font-semibold text-slate-900">
              {rejectModalListing ? `Request changes for "${rejectModalListing.title}"` : "Request changes"}
            </h3>
            <p className="text-sm text-slate-500">
              Share quick feedback so the landlord knows what to fix before resubmitting.
            </p>
          </div>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-semibold">Notes for the landlord</span>
            <textarea
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              rows={4}
              placeholder="e.g. Upload clearer bedroom photos and confirm CAC certificate."
              value={reviewNotes}
              onChange={(event) => setReviewNotes(event.target.value)}
            />
          </label>
          <div className="flex justify-end gap-3">
            <Button type="secondary" className="rounded-2xl" onClick={closeRejectModal} disabled={modalSubmitting}>
              Cancel
            </Button>
            <Button
              type="primary"
              className="rounded-2xl"
              disabled={modalSubmitting}
              onClick={confirmReject}
            >
              {modalSubmitting ? "Rejecting..." : "Send decision"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
