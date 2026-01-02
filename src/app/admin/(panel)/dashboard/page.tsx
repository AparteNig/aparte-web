'use client';

import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useAdminAuditLogsQuery,
  useAdminBookingsQuery,
  useAdminHostsQuery,
  useAdminListingsQuery,
  useAdminPayoutsQuery,
} from "@/hooks/admin/use-admin-data";

const StatCard = ({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) => (
  <Card className="border-slate-200">
    <CardHeader>
      <CardTitle>{label}</CardTitle>
      <p className="text-xs text-slate-500">{helper}</p>
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-semibold text-slate-900">{value}</p>
    </CardContent>
  </Card>
);

export default function AdminDashboardPage() {
  const router = useRouter();
  const hostsQuery = useAdminHostsQuery();
  const listingsQuery = useAdminListingsQuery();
  const bookingsQuery = useAdminBookingsQuery();
  const payoutsQuery = useAdminPayoutsQuery();
  const auditLogsQuery = useAdminAuditLogsQuery(6);

  const hosts = hostsQuery.data ?? [];
  const listings = listingsQuery.data ?? [];
  const bookings = bookingsQuery.data ?? [];
  const payouts = payoutsQuery.data ?? [];

  const pendingHosts = hosts.filter((host) => host.adminApprovalStatus === "pending").length;
  const suspendedHosts = hosts.filter((host) => host.isSuspended).length;
  const reviewQueue = listings.filter(
    (entry) => entry.listing.status === "pending_review" || entry.listing.status === "draft",
  ).length;
  const activeListings = listings.filter((entry) => entry.listing.status === "published").length;
  const pendingPayouts = payouts.filter((request) => request.status === "pending").length;
  const pendingBookings = bookings.filter((row) =>
    ["pending", "guest_departed", "checkout_due"].includes(row.booking.status),
  ).length;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Pending host approvals"
          value={pendingHosts}
          helper={`${suspendedHosts} hosts currently suspended`}
        />
        <StatCard
          label="Listings requiring review"
          value={reviewQueue}
          helper={`${activeListings} live listings`}
        />
        <StatCard
          label="Actionable bookings"
          value={pendingBookings}
          helper="Includes checkout_due & guest_departed"
        />
        <StatCard
          label="Payout requests"
          value={pendingPayouts}
          helper="Pending manual approval"
        />
        <StatCard
          label="Total hosts"
          value={hosts.length}
          helper="Across all onboarding stages"
        />
        <StatCard
          label="Audit log entries"
          value={auditLogsQuery.data?.length ?? 0}
          helper="Latest 6 actions"
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Recent audit activity</h2>
            <p className="text-sm text-slate-500">
              Track sensitive actions taken by admin and reviewer accounts.
            </p>
          </div>
        </div>
        {auditLogsQuery.isLoading ? (
          <p className="text-sm text-slate-500">Loading audit logs...</p>
        ) : auditLogsQuery.data && auditLogsQuery.data.length > 0 ? (
          <div className="overflow-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Target</th>
                  <th className="pb-2">Actor</th>
                  <th className="pb-2">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogsQuery.data?.map((entry) => (
                  <tr key={entry.id}>
                    <td className="py-2 font-semibold text-slate-900">{entry.action}</td>
                    <td className="py-2 text-xs text-slate-500">
                      {entry.targetType ?? "—"} · {entry.targetId ?? "n/a"}
                    </td>
                    <td className="py-2 text-xs text-slate-500">
                      Admin #{entry.adminId ?? "—"}
                    </td>
                    <td className="py-2 text-xs text-slate-500">
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No recent audit entries.</p>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Hosts awaiting approval</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingHosts === 0 ? (
              <p className="text-sm text-slate-500">No pending hosts right now.</p>
            ) : (
              <ul className="space-y-2 text-sm text-slate-700">
                {hosts
                  .filter((host) => host.adminApprovalStatus === "pending")
                  .slice(0, 5)
                  .map((host) => (
                    <li
                      key={host.id}
                      className="cursor-pointer rounded-2xl border border-slate-200 p-3 transition hover:bg-slate-50"
                      onClick={() => router.push(`/admin/hosts/${host.id}`)}
                    >
                      <p className="font-semibold text-slate-900">{host.fullName ?? host.email}</p>
                      <p className="text-xs text-slate-500">
                        Joined {new Date(host.createdAt).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Payout approvals</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingPayouts === 0 ? (
              <p className="text-sm text-slate-500">No payouts waiting review.</p>
            ) : (
              <ul className="space-y-2 text-sm text-slate-700">
                {payouts
                  .filter((request) => request.status === "pending")
                  .slice(0, 5)
                  .map((request) => (
                    <li key={request.id} className="rounded-2xl border border-slate-200 p-3">
                      <p className="font-semibold text-slate-900">
                        ₦{(request.amount / 100).toLocaleString()} · Host #{request.hostId}
                      </p>
                      <p className="text-xs text-slate-500">
                        Requested {new Date(request.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
