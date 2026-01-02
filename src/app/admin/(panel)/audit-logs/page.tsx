"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminAuditLogsQuery } from "@/hooks/admin/use-admin-data";

export default function AdminAuditLogsPage() {
  const [limit, setLimit] = useState(50);
  const auditLogsQuery = useAdminAuditLogsQuery(limit);

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Audit logs</CardTitle>
              <p className="text-sm text-slate-500">
                Immutable record of sensitive actions performed by staff accounts.
              </p>
            </div>
            <label className="text-xs font-semibold uppercase text-slate-500">
              Show last
              <Input
                type="number"
                value={limit}
                min={5}
                max={200}
                onChange={(event) => setLimit(Number(event.target.value))}
                className="mt-1 w-24 rounded-2xl border border-slate-200 px-3 py-1 text-sm"
              />
            </label>
          </div>
        </CardHeader>
        <CardContent>
          {auditLogsQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading audit logs...</p>
          ) : auditLogsQuery.data && auditLogsQuery.data.length > 0 ? (
            <div className="overflow-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="pb-2">Timestamp</th>
                    <th className="pb-2">Action</th>
                    <th className="pb-2">Target</th>
                    <th className="pb-2">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogsQuery.data.map((entry) => (
                    <tr key={entry.id}>
                      <td className="py-3 text-xs text-slate-500">
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <p className="font-semibold text-slate-900">{entry.action}</p>
                        <p className="text-xs text-slate-500">Admin #{entry.adminId ?? "—"}</p>
                      </td>
                      <td className="py-3 text-xs text-slate-500">
                        {entry.targetType ?? "—"} · {entry.targetId ?? "n/a"}
                      </td>
                      <td className="py-3 text-xs text-slate-500">
                        <pre className="max-w-md whitespace-pre-wrap break-words rounded-2xl bg-slate-50 p-2 text-[11px] text-slate-600">
                          {JSON.stringify(entry.metadata ?? {}, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No audit entries available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
