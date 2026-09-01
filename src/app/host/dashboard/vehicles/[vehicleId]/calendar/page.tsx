'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useHostVehicleQuery, useAddVehicleCalendarBlockMutation, useDeleteVehicleCalendarBlockMutation } from '@/hooks/use-host-vehicles';
import Button from '@/components/general/Button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function VehicleCalendarPage() {
  const params = useParams<{ vehicleId: string }>();
  const router = useRouter();
  const vehicleId = Number(params.vehicleId);
  const { data: vehicle, isLoading } = useHostVehicleQuery(vehicleId);
  const addBlock = useAddVehicleCalendarBlockMutation(vehicleId);
  const deleteBlock = useDeleteVehicleCalendarBlockMutation(vehicleId);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!startDate || !endDate) { setFormError('Both dates are required'); return; }
    if (new Date(endDate) < new Date(startDate)) { setFormError('End date must be after start date'); return; }
    setFormError(null);
    await addBlock.mutateAsync({ startDate, endDate, reason: reason || undefined });
    setStartDate(''); setEndDate(''); setReason('');
  };

  if (isLoading) return <div className="p-6 text-sm text-slate-500">Loading...</div>;
  if (!vehicle) return <div className="p-6 text-sm text-slate-500">Vehicle not found.</div>;

  return (
    <div className="space-y-6">
      <div>
        <button type="button" onClick={() => router.push(`/host/dashboard/vehicles/${vehicleId}`)}
          className="mb-2 text-xs text-slate-500 hover:text-slate-700">← Back to vehicle</button>
        <h3 className="text-2xl font-semibold">Availability</h3>
        <p className="text-sm text-slate-600">{vehicle.year} {vehicle.make} {vehicle.model}</p>
      </div>
      <Card className="border-slate-200">
        <CardHeader><CardTitle>Block dates</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {formError && <p className="text-sm text-rose-600">{formError}</p>}
          <div className="grid gap-3 md:grid-cols-3">
            <label className="space-y-2 text-sm"><span className="font-semibold">Start date</span>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
            <label className="space-y-2 text-sm"><span className="font-semibold">End date</span>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label>
            <label className="space-y-2 text-sm"><span className="font-semibold">Reason (optional)</span>
              <Input placeholder="Maintenance, personal use..." value={reason} onChange={(e) => setReason(e.target.value)} /></label>
          </div>
          <Button type="primary" className="rounded-2xl" onClick={handleAdd} disabled={addBlock.isPending}>
            {addBlock.isPending ? 'Adding...' : 'Block dates'}
          </Button>
        </CardContent>
      </Card>
      <Card className="border-slate-200">
        <CardHeader><CardTitle>Blocked periods</CardTitle></CardHeader>
        <CardContent>
          {!vehicle.calendarBlocks?.length ? (
            <p className="text-sm text-slate-500">No dates blocked.</p>
          ) : (
            <div className="space-y-2">
              {vehicle.calendarBlocks.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm">
                  <div>
                    <span className="font-medium">{new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()}</span>
                    {b.reason && <span className="ml-2 text-slate-500">· {b.reason}</span>}
                  </div>
                  <button type="button" onClick={() => deleteBlock.mutate(b.id)}
                    className="text-xs text-rose-600 hover:text-rose-800" disabled={deleteBlock.isPending}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
