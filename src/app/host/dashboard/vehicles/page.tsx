'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/general/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHostVehiclesQuery, useDeleteVehicleMutation, useSubmitVehicleMutation } from '@/hooks/use-host-vehicles';
import Modal from '@/components/general/ui/modal/Modal';
import type { HostVehicle } from '@/types/vehicle';
import { cn } from '@/lib/utils';

const statusBadge = (status: HostVehicle['status']) => {
  switch (status) {
    case 'published': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'pending_review': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'suspended': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

export default function HostVehiclesPage() {
  const router = useRouter();
  const { data: vehicles = [], isLoading } = useHostVehiclesQuery();
  const deleteVehicle = useDeleteVehicleMutation();
  const submitVehicle = useSubmitVehicleMutation();
  const [toDelete, setToDelete] = useState<{ id: number; label: string } | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');

  const filtered = vehicles.filter((v) => filter === 'all' || v.status === filter);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-semibold">Your vehicles</h3>
            <p className="text-sm text-slate-600">Manage your car rental fleet.</p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              {(['all', 'draft', 'published'] as const).map((opt) => (
                <button key={opt} type="button" onClick={() => setFilter(opt)}
                  className={cn('rounded-full px-3 py-1 text-xs font-semibold transition',
                    filter === opt ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700')}>
                  {opt === 'draft' ? `Drafts: ${vehicles.filter(v => v.status === 'draft').length}`
                    : opt === 'published' ? `Published: ${vehicles.filter(v => v.status === 'published').length}`
                    : 'All'}
                </button>
              ))}
            </div>
          </div>
          <Button type="primary" className="rounded-2xl" onClick={() => router.push('/host/dashboard/vehicles/new')}>
            Add vehicle
          </Button>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-500">Loading vehicles...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-500">
            {filter === 'all' ? 'No vehicles yet. Add your first vehicle above.' : `No ${filter} vehicles.`}
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((v) => (
              <Card key={v.id} className="cursor-pointer border-slate-200 transition hover:border-primary/40"
                onClick={() => router.push(`/host/dashboard/vehicles/${v.id}`)}>
                <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>{v.year} {v.make} {v.model}</CardTitle>
                    <p className="text-sm text-slate-500">
                      {v.pickupCity}, {v.pickupCountry} · ₦{v.dailyPrice.toLocaleString()}/day
                      {v.withDriverAvailable && ` · Driver: ₦${v.driverDailyFee.toLocaleString()}/day`}
                    </p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge(v.status)}`}>
                    {v.status.replace('_', ' ')}
                  </span>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  <p>{v.transmission} · {v.fuelType} · {v.seatCapacity} seats</p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button type="primary" className="rounded-2xl"
                      disabled={v.status !== 'draft' || submitVehicle.isPending}
                      onClick={(e) => { e.stopPropagation(); submitVehicle.mutate(v.id); }}>
                      Submit for review
                    </Button>
                    <Button type="transparent" className="ml-auto text-rose-600 hover:text-rose-700"
                      onClick={(e) => { e.stopPropagation(); setToDelete({ id: v.id, label: `${v.year} ${v.make} ${v.model}` }); }}
                      disabled={deleteVehicle.isPending}>
                      Delete
                    </Button>
                  </div>
                  {v.status === 'pending_review' && (
                    <p className="text-xs text-amber-700">Awaiting admin review.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Modal opened={Boolean(toDelete)} onClose={() => { if (!deleteVehicle.isPending) setToDelete(null); }} className="max-w-lg">
        <div className="space-y-4 text-slate-800">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-rose-600">Delete vehicle</p>
            <h3 className="text-xl font-semibold">Are you sure?</h3>
            <p className="text-sm text-slate-500">This will permanently remove <strong>{toDelete?.label}</strong>.</p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="secondary" className="rounded-2xl" onClick={() => setToDelete(null)} disabled={deleteVehicle.isPending}>Cancel</Button>
            <Button type="primary" className="rounded-2xl bg-rose-600 text-white hover:bg-rose-700"
              disabled={deleteVehicle.isPending || !toDelete}
              onClick={async () => {
                if (!toDelete) return;
                await deleteVehicle.mutateAsync(toDelete.id);
                setToDelete(null);
              }}>
              {deleteVehicle.isPending ? 'Deleting...' : 'Delete vehicle'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
