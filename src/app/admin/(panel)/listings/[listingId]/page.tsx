'use client';

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import Button from "@/components/general/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAdminListingDetailQuery,
  useApproveListingMutation,
  useRejectListingMutation,
  useRestoreListingMutation,
  useSuspendListingMutation,
} from "@/hooks/admin/use-admin-data";

export default function AdminListingDetailPage() {
  const params = useParams<{ listingId: string }>();
  const listingId = Number(params?.listingId);
  const router = useRouter();
  const approveListing = useApproveListingMutation();
  const rejectListing = useRejectListingMutation();
  const suspendListing = useSuspendListingMutation();
  const restoreListing = useRestoreListingMutation();
  const listingQuery = useAdminListingDetailQuery(listingId);

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

  const handleApprove = () => approveListing.mutate({ listingId: listing.id });

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
