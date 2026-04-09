'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminVehiclesQuery, useReviewVehicleMutation, useSuspendVehicleMutation, useUnsuspendVehicleMutation } from '@/hooks/admin/use-admin-vehicles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Button from '@/components/general/Button';
import Modal from '@/components/general/ui/modal/Modal';
import { cn } from '@/lib/utils';

const statusChip = (status: string) => {
  switch (status) {
    case 'published': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'pending_review': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'suspended': return 'bg-rose-100 text-rose-700 border-rose-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const STATUS_OPTIONS = ['all', 'pending_review', 'published', 'suspended', 'draft'] as const;

export default function AdminVehiclesPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [rejectModal, setRejectModal] = useState<{ id: number; label: string } | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  const vehiclesQuery = useAdminVehiclesQuery(statusFilter !== 'all' ? { status: statusFilter } : undefined);
  const reviewVehicle = useReviewVehicleMutation();
  const suspendVehicle = useSuspendVehicleMutation();
  const unsuspendVehicle = useUnsuspendVehicleMutation();

  const rows = (vehiclesQuery.data ?? []).filter((entry) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return [entry.vehicle.make, entry.vehicle.model, entry.host?.fullName, entry.host?.email, entry.vehicle.pickupCity]
      .filter(Boolean).some((v) => v!.toLowerCase().includes(term));
  });

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Vehicle approvals</CardTitle>
          <p className="text-sm text-slate-500">Review, approve, and moderate vehicle listings.</p>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
            <Input className="rounded-2xl md:max-w-sm" placeholder="Search make, model, host..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button key={opt} type="button" onClick={() => setStatusFilter(opt)}
                  className={cn('rounded-full px-4 py-1.5 text-xs font-semibold transition',
                    statusFilter === opt ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-700')}>
                  {opt === 'all' ? 'All' : opt.split('_').map(p => p[0].toUpperCase() + p.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>
          {vehiclesQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading vehicles...</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-slate-500">No vehicles match your filters.</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="pb-2">Vehicle</th>
                    <th className="pb-2">Host</th>
                    <th className="pb-2">Daily price</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((entry) => {
                    const { vehicle, host } = entry;
                    const isPendingReview = vehicle.status === 'pending_review' || vehicle.status === 'draft';
                    const isPublished = vehicle.status === 'published';
                    const isSuspended = vehicle.status === 'suspended';
                    return (
                      <tr key={vehicle.id} className="cursor-pointer transition hover:bg-slate-50"
                        onClick={() => router.push(`/admin/vehicles/${vehicle.id}`)}>
                        <td className="py-3">
                          <div className="font-semibold text-slate-900">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                          <p className="text-xs text-slate-500">{vehicle.pickupCity}, {vehicle.pickupCountry}</p>
                        </td>
                        <td className="py-3">
                          <div className="font-semibold">{host?.fullName ?? `Host #${vehicle.hostId}`}</div>
                          <p className="text-xs text-slate-500">{host?.email ?? '—'}</p>
                        </td>
                        <td className="py-3">₦{vehicle.dailyPrice.toLocaleString()}</td>
                        <td className="py-3">
                          <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold capitalize', statusChip(vehicle.status))}>
                            {vehicle.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex flex-wrap justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            {isPendingReview && (
                              <>
                                <Button type="primary" className="rounded-2xl"
                                  disabled={reviewVehicle.isPending}
                                  onClick={() => reviewVehicle.mutate({ vehicleId: vehicle.id, action: 'approve' })}>
                                  Approve
                                </Button>
                                <Button type="secondary" className="rounded-2xl"
                                  onClick={() => { setRejectNotes(''); setRejectModal({ id: vehicle.id, label: `${vehicle.year} ${vehicle.make} ${vehicle.model}` }); }}>
                                  Reject
                                </Button>
                              </>
                            )}
                            {isPublished && (
                              <Button type="secondary" className="rounded-2xl text-rose-600"
                                disabled={suspendVehicle.isPending}
                                onClick={() => { const reason = window.prompt('Suspension reason:') ?? undefined; suspendVehicle.mutate({ vehicleId: vehicle.id, reason: reason?.trim() || undefined }); }}>
                                Suspend
                              </Button>
                            )}
                            {isSuspended && (
                              <Button type="secondary" className="rounded-2xl"
                                disabled={unsuspendVehicle.isPending}
                                onClick={() => unsuspendVehicle.mutate(vehicle.id)}>
                                Unsuspend
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
        </CardContent>
      </Card>

      <Modal opened={Boolean(rejectModal)} onClose={() => setRejectModal(null)}>
        <div className="space-y-4 text-slate-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Reject vehicle</p>
            <h3 className="text-xl font-semibold">{rejectModal?.label}</h3>
            <p className="text-sm text-slate-500">Add notes for the host so they know what to fix.</p>
          </div>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-semibold">Review notes</span>
            <textarea className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              rows={4} value={rejectNotes} onChange={(e) => setRejectNotes(e.target.value)} />
          </label>
          <div className="flex justify-end gap-3">
            <Button type="secondary" className="rounded-2xl" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button type="primary" className="rounded-2xl" disabled={reviewVehicle.isPending}
              onClick={() => {
                if (!rejectModal) return;
                reviewVehicle.mutate({ vehicleId: rejectModal.id, action: 'reject', reviewNotes: rejectNotes.trim() || undefined },
                  { onSuccess: () => { setRejectModal(null); setRejectNotes(''); } });
              }}>
              {reviewVehicle.isPending ? 'Rejecting...' : 'Send decision'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
