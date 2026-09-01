'use client';

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Button from "@/components/general/Button";
import { showToast } from "@/components/general/ui/CustomToast";
import Modal from "@/components/general/ui/modal/Modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useAdminListingDetailQuery,
  useApproveHostMutation,
  useApproveListingMutation,
  useRejectListingMutation,
  useRestoreListingMutation,
  useSuspendListingMutation,
  useUpdateListingCautionFeeMutation,
} from "@/hooks/admin/use-admin-data";

export default function AdminListingDetailPage() {
  const params = useParams<{ listingId: string }>();
  const listingId = Number(params?.listingId);
  const router = useRouter();
  const approveHost = useApproveHostMutation();
  const approveListing = useApproveListingMutation();
  const rejectListing = useRejectListingMutation();
  const suspendListing = useSuspendListingMutation();
  const restoreListing = useRestoreListingMutation();
  const updateCautionFee = useUpdateListingCautionFeeMutation();
  const [cautionFeeDraft, setCautionFeeDraft] = useState("");
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [hostApprovalModalOpen, setHostApprovalModalOpen] = useState(false);
  const listingQuery = useAdminListingDetailQuery(listingId);
  const listingFee = listingQuery.data?.listing?.cautionFee ?? 0;

  useEffect(() => {
    if (listingQuery.data?.listing) {
      setCautionFeeDraft(String(listingQuery.data.listing.cautionFee ?? 0));
    }
  }, [listingQuery.data?.listing]);

  if (Number.isNaN(listingId)) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-rose-700">
        Invalid listing reference.
      </div>
    );
  }

  if (listingQuery.isLoading || !listingQuery.data) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        {listingQuery.isLoading ? "Loading listing details..." : "Listing not found."}
      </div>
    );
  }

  const { listing, host } = listingQuery.data;
  const cautionFeeNumber = Number(cautionFeeDraft);
  const cautionFeeInvalid =
    cautionFeeDraft.trim() === "" || Number.isNaN(cautionFeeNumber) || cautionFeeNumber < 0;
  const cautionFeeDirty = !cautionFeeInvalid && cautionFeeNumber !== listingFee;
  const approvalSubmitting = updateCautionFee.isPending || approveListing.isPending;

  const handleApprove = () => {
    if (host?.adminApprovalStatus && host.adminApprovalStatus !== "approved") {
      setHostApprovalModalOpen(true);
      return;
    }
    setApproveModalOpen(true);
  };
  const handleApproveConfirm = () => {
    if (cautionFeeInvalid) return;
    updateCautionFee.mutate(
      { listingId: listing.id, cautionFee: cautionFeeNumber },
      {
        onSuccess: () => {
          approveListing.mutate(
            { listingId: listing.id },
            {
              onSuccess: () => setApproveModalOpen(false),
            },
          );
        },
      },
    );
  };

  const handleReject = () => {
    const reviewNotes = window.prompt("Add optional rejection notes:");
    rejectListing.mutate({ listingId: listing.id, reviewNotes: reviewNotes ?? undefined });
  };
  const handleSuspend = () => {
    const reason = window.prompt("Suspension reason (optional):") ?? undefined;
    suspendListing.mutate({ listingId: listing.id, reason });
  };
  const handleRestore = () => restoreListing.mutate(listing.id);
  return (
    <div className="space-y-6">
      <Button
        type="secondary"
        className="rounded-2xl"
        onClick={() => router.push("/admin/listings")}
      >
        ← Back to listings
      </Button>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>{listing.title}</CardTitle>
          <p className="text-sm text-slate-500">
            Listing #{listing.id} · Landlord #{host?.id ?? listing.hostId}
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Location</p>
              <p>
                {listing.city ?? "Unknown"}, {listing.country ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Nightly rate</p>
              <p>₦{listing.nightlyPrice.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Caution fee</p>
              <p>₦{(listing.cautionFee ?? 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Status</p>
              <p>
                {listing.status === "suspended" &&
                listing.reviewNotes?.toLowerCase().includes("reject")
                  ? "Rejected"
                  : listing.status.replace("_", " ")}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Landlord</p>
              <p>{host?.fullName ?? host?.email ?? `Landlord #${listing.hostId}`}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs uppercase text-slate-500">Review notes</p>
            <p>{listing.reviewNotes ?? "—"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-3">
            <p className="text-xs uppercase text-slate-500">Update caution fee</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <input
                type="number"
                min="0"
                className="w-40 rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                value={cautionFeeDraft}
                onChange={(event) => setCautionFeeDraft(event.target.value)}
              />
              <Button
                type="secondary"
                className="rounded-2xl"
                disabled={updateCautionFee.isPending || cautionFeeInvalid || !cautionFeeDirty}
                onClick={() =>
                  updateCautionFee.mutate({ listingId: listing.id, cautionFee: cautionFeeNumber })
                }
              >
                {updateCautionFee.isPending ? "Saving..." : "Save caution fee"}
              </Button>
            </div>
            {cautionFeeInvalid && (
              <p className="mt-2 text-xs text-rose-600">Enter a valid non-negative amount.</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {listing.status !== "published" && (
              <Button
                type="primary"
                className="rounded-2xl"
                disabled={approveListing.isPending}
                onClick={handleApprove}
              >
                {approveListing.isPending ? "Approving..." : "Approve listing"}
              </Button>
            )}
            <Button
              type="secondary"
              className="rounded-2xl"
              disabled={rejectListing.isPending}
              onClick={handleReject}
            >
              {rejectListing.isPending ? "Rejecting..." : "Reject listing"}
            </Button>
            {listing.status === "published" && (
              <Button
                type="secondary"
                className="rounded-2xl text-rose-700"
                disabled={suspendListing.isPending}
                onClick={handleSuspend}
              >
                {suspendListing.isPending ? "Suspending..." : "Suspend listing"}
              </Button>
            )}
            {listing.status === "suspended" && (
              <Button
                type="secondary"
                className="rounded-2xl"
                disabled={restoreListing.isPending}
                onClick={handleRestore}
              >
                {restoreListing.isPending ? "Unsuspending..." : "Unsuspend listing"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal opened={approveModalOpen} onClose={() => setApproveModalOpen(false)}>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Approve listing</p>
            <p className="text-xs text-slate-500">
              Add a caution fee before publishing · {listing.title}.
            </p>
          </div>
          <label className="block text-sm font-medium text-slate-600">
            Caution fee
            <Input
              type="number"
              min="0"
              className="mt-2 rounded-2xl border-slate-200 bg-white"
              value={cautionFeeDraft}
              onChange={(event) => setCautionFeeDraft(event.target.value)}
            />
          </label>
          {cautionFeeInvalid && (
            <p className="text-xs text-rose-600">Enter a valid non-negative amount.</p>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="secondary" className="rounded-2xl" onClick={() => setApproveModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="primary"
              className="rounded-2xl"
              disabled={approvalSubmitting || cautionFeeInvalid}
              onClick={handleApproveConfirm}
            >
              {approvalSubmitting ? "Approving..." : "Save & approve"}
            </Button>
          </div>
        </div>
      </Modal>
      <Modal opened={hostApprovalModalOpen} onClose={() => setHostApprovalModalOpen(false)}>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Approve host first</p>
            <p className="text-xs text-slate-500">
              {host?.fullName ?? host?.email ?? `Landlord #${listing.hostId}`} must be approved
              before this listing can be published.
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="secondary" className="rounded-2xl" onClick={() => setHostApprovalModalOpen(false)}>
              Close
            </Button>
            <Button
              type="secondary"
              className="rounded-2xl"
              disabled={approveHost.isPending}
              onClick={() => {
                if (!host?.id) return;
                approveHost.mutate(
                  { hostId: host.id },
                  {
                    onSuccess: () => {
                      showToast.success("Host approved. Add the caution fee to publish the listing.");
                      setHostApprovalModalOpen(false);
                      setApproveModalOpen(true);
                    },
                  },
                );
              }}
            >
              {approveHost.isPending ? "Approving host..." : "Approve host"}
            </Button>
            <Button
              type="primary"
              className="rounded-2xl"
              onClick={() => {
                setHostApprovalModalOpen(false);
                router.push("/admin/hosts");
              }}
            >
              Go to host approvals
            </Button>
          </div>
        </div>
      </Modal>

      {listing.photos.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {listing.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50"
                >
                  <Image
                    src={photo.url}
                    alt={photo.caption || listing.title}
                    width={600}
                    height={400}
                    className="h-48 w-full object-cover"
                  />
                  {photo.caption && (
                    <p className="p-2 text-xs text-slate-500">{photo.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
