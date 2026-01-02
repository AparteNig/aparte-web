"use client";

import { useMemo, useState } from "react";

import Link from "next/link";
import Button from "@/components/general/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminAccountsQuery, useAdminProfileQuery } from "@/hooks/admin/use-admin-data";

export default function AdminAccountsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const profileQuery = useAdminProfileQuery(true);
  const adminsQuery = useAdminAccountsQuery(profileQuery.data?.isSuperAdmin ?? false);

  if (profileQuery.isLoading) {
    return <p className="text-sm text-slate-500">Checking permissions…</p>;
  }

  if (!profileQuery.data?.isSuperAdmin) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Admin directory</CardTitle>
          <p className="text-sm text-slate-500">
            Only super admin accounts can view or manage other admins. Contact a super admin for access.
          </p>
        </CardHeader>
      </Card>
    );
  }

  const admins = useMemo(() => {
    if (!adminsQuery.data) return [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return adminsQuery.data;
    return adminsQuery.data.filter((admin) =>
      [admin.email, admin.fullName, admin.role]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term)),
    );
  }, [adminsQuery.data, searchTerm]);

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Admin directory</CardTitle>
          <p className="text-sm text-slate-500">View every admin account and monitor roles.</p>
        </CardHeader>
        <CardContent>
          <div className="mb-4 w-full md:max-w-sm">
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Search
            </label>
            <Input
              className="mt-2 rounded-2xl border-slate-200 bg-white"
              placeholder="Search name or email"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          {adminsQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading admins…</p>
          ) : admins.length === 0 ? (
            <p className="text-sm text-slate-500">No admins match your filters.</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="pb-2">Admin</th>
                    <th className="pb-2">Role</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Last activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="py-3">
                      <td className="py-3">
                        <div className="font-semibold text-slate-900">{admin.fullName || admin.email}</div>
                        <p className="text-xs text-slate-500">{admin.email}</p>
                      </td>
                      <td className="py-3 text-xs text-slate-500">
                        {admin.isSuperAdmin ? "Super admin" : admin.role}
                      </td>
                      <td className="py-3 text-xs text-slate-500">{admin.status}</td>
                      <td className="py-3 text-xs text-slate-500">
                        {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : "Never"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Management tools</CardTitle>
          <p className="text-sm text-slate-500">
            Use the Add admin tab to invite teammates or audit logs to review activity.
          </p>
        </CardHeader>
        <CardContent>
          <Link href="/admin/add-admin">
            <Button type="secondary" className="rounded-2xl">
              Invite new admin
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
