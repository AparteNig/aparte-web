'use client';

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import Button from "@/components/general/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAdminHostsQuery,
  useApproveHostMutation,
  useRejectHostMutation,
  useRestoreHostMutation,
  useSuspendHostMutation,
} from "@/hooks/admin/use-admin-data";

export default function AdminHostDetailPage() {
  const params = useParams<{ hostId: string }>();
  const router = useRouter();
  const hostId = Number(params?.hostId);
  const hostsQuery = useAdminHostsQuery();
  const approveHost = useApproveHostMutation();
  const rejectHost = useRejectHostMutation();
  const suspendHost = useSuspendHostMutation();
  const restoreHost = useRestoreHostMutation();

  const host = hostsQuery.data?.find((item) => item.id === hostId);

  if (Number.isNaN(hostId)) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-rose-700">
        Invalid landlord reference.
      </div>
    );
  }

  if (hostsQuery.isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Loading landlord details...
      </div>
    );
  }

  if (!host) {
    return (
      <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        <p>Landlord not found.</p>
        <Button type="secondary" className="rounded-2xl" onClick={() => router.push("/admin/hosts")}>
          Back to landlords
        </Button>
      </div>
    );
  }

  const handleApprove = () => approveHost.mutate({ hostId: host.id });
  const handleReject = () => {
    const reason = window.prompt("Reason for rejection?");
    if (!reason) return;
    rejectHost.mutate({ hostId: host.id, reason });
  };
  const handleSuspend = () => {
    const reason = window.prompt("Suspension reason (optional):") ?? undefined;
    suspendHost.mutate({ hostId: host.id, reason });
  };
  const handleRestore = () => restoreHost.mutate(host.id);

  return (
    <div className="space-y-6">
      <Button type="secondary" className="rounded-2xl" onClick={() => router.push("/admin/hosts")}>
        ← Back to landlords
      </Button>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>{host.fullName ?? host.email}</CardTitle>
          <p className="text-sm text-slate-500">Landlord #{host.id}</p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Contact</p>
              <p>{host.email}</p>
              <p>{host.phone ?? "No phone on record"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Location</p>
              <p>
                {host.city ?? "Unknown"}, {host.country ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Onboarding status</p>
              <p>{host.onboardingStatus}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Admin approval</p>
              <p>
                {host.adminApprovalStatus}
                {host.approvedAt && (
                  <span className="ml-2 text-xs text-slate-500">
                    {new Date(host.approvedAt).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 text-sm">
            <p className="text-xs uppercase text-slate-500">Latest notes</p>
            <p>{host.onboardingNotes ?? "—"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {host.adminApprovalStatus !== "approved" ? (
              <>
                <Button
                  type="primary"
                  className="rounded-2xl"
                  disabled={approveHost.isPending}
                  onClick={handleApprove}
                >
                  Approve landlord
                </Button>
                {host.adminApprovalStatus !== "rejected" && (
                  <Button
                    type="secondary"
                    className="rounded-2xl"
                    disabled={rejectHost.isPending}
                    onClick={handleReject}
                  >
                    Reject landlord
                  </Button>
                )}
              </>
            ) : host.isSuspended ? (
              <Button
                type="secondary"
                className="rounded-2xl"
                disabled={restoreHost.isPending}
                onClick={handleRestore}
              >
                Restore landlord
              </Button>
            ) : (
              <Button
                type="secondary"
                className="rounded-2xl text-rose-700"
                disabled={suspendHost.isPending}
                onClick={handleSuspend}
              >
                Suspend landlord
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-slate-500">
        Need deeper insight?{" "}
        <Link className="font-semibold text-primary underline" href="/admin/audit-logs">
          Review audit logs
        </Link>
      </div>
    </div>
  );
}
