'use client';

import { useParams, useRouter } from 'next/navigation';
import { useHostVehicleQuery, useSubmitVehicleMutation } from '@/hooks/use-host-vehicles';
import Button from '@/components/general/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { HostVehicle } from '@/types/vehicle';

const statusBadge = (status: HostVehicle['status']) => {
  switch (status) {
    case 'published': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'pending_review': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'suspended': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

export default function VehicleDetailPage() {
  const params = useParams<{ vehicleId: string }>();
  const router = useRouter();
  const vehicleId = Number(params.vehicleId);
  const { data: vehicle, isLoading } = useHostVehicleQuery(vehicleId);
  const submitVehicle = useSubmitVehicleMutation();

  if (isLoading) return <div className="p-6 text-sm text-slate-500">Loading...</div>;
  if (!vehicle) return <div className="p-6 text-sm text-slate-500">Vehicle not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <button type="button" onClick={() => router.push('/host/dashboard/vehicles')}
            className="mb-2 text-xs text-slate-500 hover:text-slate-700">← Back to vehicles</button>
          <h3 className="text-2xl font-semibold">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
          <span className={cn('mt-1 inline-block rounded-full border px-3 py-1 text-xs font-semibold', statusBadge(vehicle.status))}>
            {vehicle.status.replace('_', ' ')}
          </span>
        </div>
        {vehicle.status === 'draft' && (
          <Button type="primary" className="rounded-2xl" disabled={submitVehicle.isPending}
            onClick={() => submitVehicle.mutate(vehicleId)}>
            {submitVehicle.isPending ? 'Submitting...' : 'Submit for review'}
          </Button>
        )}
      </div>

      {vehicle.reviewNotes && vehicle.status === 'draft' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Admin notes:</strong> {vehicle.reviewNotes}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader><CardTitle className="text-base">Vehicle details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p><span className="font-medium">Make/Model:</span> {vehicle.make} {vehicle.model} ({vehicle.year})</p>
            <p><span className="font-medium">Color:</span> {vehicle.color || '—'}</p>
            <p><span className="font-medium">Fuel:</span> {vehicle.fuelType}</p>
            <p><span className="font-medium">Transmission:</span> {vehicle.transmission}</p>
            <p><span className="font-medium">Seats:</span> {vehicle.seatCapacity}</p>
            <p><span className="font-medium">Features:</span> {vehicle.features.join(', ') || '—'}</p>
            <p><span className="font-medium">Condition:</span> {vehicle.conditionNotes || '—'}</p>
            <p><span className="font-medium">Insurance:</span> {vehicle.hasInsurance ? `Yes${vehicle.insuranceNotes ? ` — ${vehicle.insuranceNotes}` : ''}` : 'No'}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader><CardTitle className="text-base">Pricing</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p><span className="font-medium">Daily price:</span> ₦{vehicle.dailyPrice.toLocaleString()}</p>
            <p><span className="font-medium">Caution deposit:</span> ₦{vehicle.cautionDeposit.toLocaleString()}</p>
            <p><span className="font-medium">Mileage limit:</span> {vehicle.mileageLimitPerDay ? `${vehicle.mileageLimitPerDay} km/day` : 'No limit'}</p>
            {vehicle.mileageLimitPerDay && <p><span className="font-medium">Extra charge:</span> ₦{vehicle.extraMileageCharge ?? 0}/km</p>}
            <p><span className="font-medium">Min rental:</span> {vehicle.minRentalDays} day(s)</p>
            <p><span className="font-medium">With driver:</span> {vehicle.withDriverAvailable ? `Yes — ₦${vehicle.driverDailyFee.toLocaleString()}/day` : 'No'}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader><CardTitle className="text-base">Pickup location</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            {vehicle.pickupAddress && <p>{vehicle.pickupAddress}</p>}
            <p>{vehicle.pickupCity}{vehicle.pickupState ? `, ${vehicle.pickupState}` : ''}</p>
            <p>{vehicle.pickupCountry}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="secondary" className="rounded-2xl"
          onClick={() => router.push(`/host/dashboard/vehicles/${vehicleId}/photos`)}>
          Manage photos ({vehicle.photos.length})
        </Button>
        <Button type="secondary" className="rounded-2xl"
          onClick={() => router.push(`/host/dashboard/vehicles/${vehicleId}/calendar`)}>
          Manage availability
        </Button>
      </div>

      {vehicle.photos.length > 0 && (
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
              <img key={p.id} src={p.url} alt={p.caption || 'Vehicle photo'}
                className="h-24 w-32 rounded-xl object-cover" />
            );
          })}
        </div>
      )}
    </div>
  );
}
