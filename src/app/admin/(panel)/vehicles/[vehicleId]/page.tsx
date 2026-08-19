'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminVehicleQuery, useReviewVehicleMutation, useSuspendVehicleMutation, useUnsuspendVehicleMutation, useEditAdminVehicleMutation, useSetVehiclePremiumMutation } from '@/hooks/admin/use-admin-vehicles';
import Button from '@/components/general/Button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function AdminVehicleDetailPage() {
  const params = useParams<{ vehicleId: string }>();
  const router = useRouter();
  const vehicleId = Number(params.vehicleId);
  const { data, isLoading } = useAdminVehicleQuery(vehicleId);
  const reviewVehicle = useReviewVehicleMutation();
  const suspendVehicle = useSuspendVehicleMutation();
  const unsuspendVehicle = useUnsuspendVehicleMutation();
  const editVehicle = useEditAdminVehicleMutation();
  const setPremium = useSetVehiclePremiumMutation();

  const [reviewNotes, setReviewNotes] = useState('');
  const [premiumNotes, setPremiumNotes] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState<{ dailyPrice: string; cautionDeposit: string; driverDailyFee: string; conditionNotes: string; reviewNotes: string }>({ dailyPrice: '', cautionDeposit: '', driverDailyFee: '', conditionNotes: '', reviewNotes: '' });

  const vehicle = data?.vehicle;
  const host = data?.host;

  if (isLoading) return <div className="p-6 text-sm text-slate-500">Loading...</div>;
  if (!vehicle) return <div className="p-6 text-sm text-slate-500">Vehicle not found.</div>;

  const isPending = vehicle.status === 'pending_review';
  const isPublished = vehicle.status === 'published';
  const isSuspended = vehicle.status === 'suspended';

  const startEdit = () => {
    setEditDraft({ dailyPrice: String(vehicle.dailyPrice), cautionDeposit: String(vehicle.cautionDeposit), driverDailyFee: String(vehicle.driverDailyFee), conditionNotes: vehicle.conditionNotes, reviewNotes: vehicle.reviewNotes });
    setEditMode(true);
  };

  const saveEdit = () => {
    editVehicle.mutate({
      vehicleId,
      payload: {
        dailyPrice: Number(editDraft.dailyPrice),
        cautionDeposit: Number(editDraft.cautionDeposit),
        driverDailyFee: Number(editDraft.driverDailyFee),
        conditionNotes: editDraft.conditionNotes,
        reviewNotes: editDraft.reviewNotes,
      }
    }, { onSuccess: () => setEditMode(false) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <button type="button" onClick={() => router.push('/admin/vehicles')}
            className="mb-2 text-xs text-slate-500 hover:text-slate-700">← Back to vehicles</button>
          <h3 className="text-2xl font-semibold">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
          <span className={cn('mt-1 inline-block rounded-full border px-3 py-1 text-xs font-semibold capitalize', {
            'bg-emerald-100 text-emerald-700 border-emerald-200': isPublished,
            'bg-amber-100 text-amber-700 border-amber-200': isPending,
            'bg-rose-100 text-rose-700 border-rose-200': isSuspended,
            'bg-slate-100 text-slate-600 border-slate-200': vehicle.status === 'draft',
          })}>
            {vehicle.status.replace('_', ' ')}
          </span>
          {vehicle.isPremium && (
            <span className="mt-1 ml-2 inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              ★ Premium
            </span>
          )}
        </div>
        <Button type="secondary" className="rounded-2xl" onClick={startEdit}>Edit fields</Button>
      </div>

      {/* Premium — the editorial gate for the explore video feed. Kept in its
          own panel rather than mixed into Actions, because it is a different
          decision from the compliance review above it. */}
      <Card className={cn('border-slate-200', vehicle.isPremium && 'border-amber-300 bg-amber-50/40')}>
        <CardHeader>
          <CardTitle className="text-base">Explore feed — Premium</CardTitle>
          <p className="text-sm text-slate-500">
            Only Premium vehicles appear in the Explore video feed, and only Premium hosts can
            upload clips. Publishing is about compliance; Premium is about whether this car
            belongs in a curated feed.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {!isPublished && !vehicle.isPremium ? (
            <p className="text-sm text-slate-500">
              This vehicle must be published before it can be granted Premium.
            </p>
          ) : vehicle.isPremium ? (
            <>
              <p className="text-sm text-slate-600">
                Granted
                {vehicle.premiumApprovedAt
                  ? ` on ${new Date(vehicle.premiumApprovedAt).toLocaleDateString()}`
                  : ''}
                . {vehicle.explorePosts?.length ?? 0} clip
                {(vehicle.explorePosts?.length ?? 0) === 1 ? '' : 's'} uploaded.
              </p>
              {vehicle.premiumNotes && (
                <p className="text-sm text-slate-500 italic">{vehicle.premiumNotes}</p>
              )}
              <Button
                type="secondary"
                className="rounded-2xl text-rose-600"
                disabled={setPremium.isPending}
                onClick={() => setPremium.mutate({ vehicleId, isPremium: false })}
              >
                {setPremium.isPending ? 'Revoking…' : 'Revoke Premium'}
              </Button>
              {/* Says what revoking does and does not destroy, so the admin is
                  not guessing whether it is safe to undo. */}
              <p className="text-xs text-slate-400">
                Removes it from the feed immediately. Existing clips are kept, so this can be
                reversed without the host re-uploading.
              </p>
            </>
          ) : (
            <>
              <label className="block space-y-2 text-sm">
                <span className="font-semibold">Why is this car Premium? (optional)</span>
                <textarea
                  className="w-full rounded-2xl border border-slate-200 p-3 text-sm"
                  rows={2}
                  value={premiumNotes}
                  onChange={(e) => setPremiumNotes(e.target.value)}
                  placeholder="e.g. high-end SUV, excellent condition"
                />
              </label>
              <Button
                type="primary"
                className="rounded-2xl"
                disabled={setPremium.isPending}
                onClick={() =>
                  setPremium.mutate({
                    vehicleId,
                    isPremium: true,
                    notes: premiumNotes.trim() || undefined,
                  })
                }
              >
                {setPremium.isPending ? 'Granting…' : 'Grant Premium'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Action panel */}
      <Card className="border-slate-200">
        <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isPending && (
            <>
              <label className="block space-y-2 text-sm">
                <span className="font-semibold">Review notes (optional)</span>
                <textarea className="w-full rounded-2xl border border-slate-200 p-3 text-sm" rows={3}
                  value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Notes for the host..." />
              </label>
              <div className="flex gap-2">
                <Button type="primary" className="rounded-2xl" disabled={reviewVehicle.isPending}
                  onClick={() => reviewVehicle.mutate({ vehicleId, action: 'approve', reviewNotes: reviewNotes.trim() || undefined })}>
                  Approve
                </Button>
                <Button type="secondary" className="rounded-2xl" disabled={reviewVehicle.isPending}
                  onClick={() => reviewVehicle.mutate({ vehicleId, action: 'reject', reviewNotes: reviewNotes.trim() || undefined })}>
                  Reject
                </Button>
              </div>
            </>
          )}
          {isPublished && (
            <Button type="secondary" className="rounded-2xl text-rose-600" disabled={suspendVehicle.isPending}
              onClick={() => { const reason = window.prompt('Suspension reason:') ?? undefined; suspendVehicle.mutate({ vehicleId, reason: reason?.trim() || undefined }); }}>
              {suspendVehicle.isPending ? 'Suspending...' : 'Suspend vehicle'}
            </Button>
          )}
          {isSuspended && (
            <Button type="secondary" className="rounded-2xl" disabled={unsuspendVehicle.isPending}
              onClick={() => unsuspendVehicle.mutate(vehicleId)}>
              {unsuspendVehicle.isPending ? 'Unsuspending...' : 'Unsuspend vehicle'}
            </Button>
          )}
          {!isPending && !isPublished && !isSuspended && (
            <p className="text-sm text-slate-500">No actions available for this status.</p>
          )}
        </CardContent>
      </Card>

      {/* Edit panel */}
      {editMode && (
        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-base">Edit fields</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {([
              { label: 'Daily price (₦)', key: 'dailyPrice' },
              { label: 'Caution deposit (₦)', key: 'cautionDeposit' },
              { label: 'Driver daily fee (₦)', key: 'driverDailyFee' },
            ] as const).map(({ label, key }) => (
              <label key={key} className="space-y-2 text-sm">
                <span className="font-semibold">{label}</span>
                <Input type="number" value={editDraft[key]} onChange={(e) => setEditDraft(d => ({ ...d, [key]: e.target.value }))} />
              </label>
            ))}
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-semibold">Condition notes</span>
              <textarea className="w-full rounded-2xl border border-slate-200 p-3 text-sm" rows={2}
                value={editDraft.conditionNotes} onChange={(e) => setEditDraft(d => ({ ...d, conditionNotes: e.target.value }))} />
            </label>
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-semibold">Review notes</span>
              <textarea className="w-full rounded-2xl border border-slate-200 p-3 text-sm" rows={2}
                value={editDraft.reviewNotes} onChange={(e) => setEditDraft(d => ({ ...d, reviewNotes: e.target.value }))} />
            </label>
            <div className="flex gap-2 md:col-span-2">
              <Button type="primary" className="rounded-2xl" onClick={saveEdit} disabled={editVehicle.isPending}>
                {editVehicle.isPending ? 'Saving...' : 'Save changes'}
              </Button>
              <Button type="secondary" className="rounded-2xl" onClick={() => setEditMode(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader><CardTitle className="text-base">Host</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm text-slate-700">
            <p className="font-semibold">{host?.fullName ?? `Host #${vehicle.hostId}`}</p>
            <p className="text-slate-500">{host?.email ?? '—'}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader><CardTitle className="text-base">Vehicle details</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm text-slate-700">
            <p><span className="font-medium">Make/Model/Year:</span> {vehicle.make} {vehicle.model} {vehicle.year}</p>
            <p><span className="font-medium">Fuel/Trans:</span> {vehicle.fuelType} / {vehicle.transmission}</p>
            <p><span className="font-medium">Seats:</span> {vehicle.seatCapacity}</p>
            <p><span className="font-medium">Daily price:</span> ₦{vehicle.dailyPrice.toLocaleString()}</p>
            <p><span className="font-medium">Caution:</span> ₦{vehicle.cautionDeposit.toLocaleString()}</p>
            <p><span className="font-medium">With driver:</span> {vehicle.withDriverAvailable ? `Yes — ₦${vehicle.driverDailyFee.toLocaleString()}/day` : 'No'}</p>
            <p><span className="font-medium">Location:</span> {vehicle.pickupCity}, {vehicle.pickupCountry}</p>
            {vehicle.reviewNotes && <p><span className="font-medium">Notes:</span> {vehicle.reviewNotes}</p>}
          </CardContent>
        </Card>
      </div>

      {vehicle.photos.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-700">Photos & videos</p>
          <div className="flex flex-wrap gap-2">
            {vehicle.photos.map((p) => {
              const isVid = /\.(mp4|mov|webm|avi|mkv)(\?|$)/i.test(p.url);
              return isVid ? (
                <div key={p.id} className="relative h-24 w-32 overflow-hidden rounded-xl bg-slate-900">
                  <video src={p.url} className="h-full w-full object-cover opacity-70" muted />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="rounded-full bg-white/80 p-1.5 text-sm leading-none">▶</span>
                  </div>
                </div>
              ) : (
                <img key={p.id} src={p.url} alt={p.caption} className="h-24 w-32 rounded-xl object-cover" />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
