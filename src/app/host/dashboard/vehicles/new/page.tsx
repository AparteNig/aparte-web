'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import Button from '@/components/general/Button';
import { Card, CardContent } from '@/components/ui/card';
import PillMultiSelect from '@/components/general/form/PillMultiSelect';
import { useCreateVehicleMutation } from '@/hooks/use-host-vehicles';

const FEATURE_OPTIONS = ['AC', 'GPS', 'Child seat', 'Roof rack', 'Bluetooth', 'Backup camera', 'USB charger', 'Sunroof'];

type VehicleFormValues = {
  make: string; model: string; year: string; color: string;
  fuelType: string; transmission: string; seatCapacity: string;
  dailyPrice: string; cautionDeposit: string;
  mileageLimitPerDay: string; extraMileageCharge: string;
  withDriverAvailable: boolean; driverDailyFee: string;
  features: string[]; conditionNotes: string;
  hasInsurance: boolean; insuranceNotes: string;
  pickupAddress: string; pickupCity: string; pickupState: string; pickupCountry: string;
  minRentalDays: string;
};

export default function NewVehiclePage() {
  const router = useRouter();
  const createVehicle = useCreateVehicleMutation();
  const [error, setError] = useState<string | null>(null);
  const { register, control, handleSubmit, watch } = useForm<VehicleFormValues>({
    defaultValues: {
      make: '', model: '', year: '', color: '', fuelType: 'petrol', transmission: 'manual',
      seatCapacity: '4', dailyPrice: '', cautionDeposit: '0', mileageLimitPerDay: '',
      extraMileageCharge: '', withDriverAvailable: false, driverDailyFee: '0',
      features: [], conditionNotes: '', hasInsurance: false, insuranceNotes: '',
      pickupAddress: '', pickupCity: '', pickupState: '', pickupCountry: 'Nigeria', minRentalDays: '1',
    }
  });
  const withDriver = watch('withDriverAvailable');
  const hasInsurance = watch('hasInsurance');

  const onSubmit = handleSubmit(async (values) => {
    try {
      setError(null);
      const result = await createVehicle.mutateAsync({
        make: values.make, model: values.model, year: Number(values.year),
        color: values.color, fuelType: values.fuelType as never,
        transmission: values.transmission as never,
        seatCapacity: Number(values.seatCapacity),
        dailyPrice: Number(values.dailyPrice),
        cautionDeposit: Number(values.cautionDeposit) || 0,
        mileageLimitPerDay: values.mileageLimitPerDay ? Number(values.mileageLimitPerDay) : null,
        extraMileageCharge: values.extraMileageCharge ? Number(values.extraMileageCharge) : null,
        withDriverAvailable: values.withDriverAvailable,
        driverDailyFee: values.withDriverAvailable ? Number(values.driverDailyFee) : 0,
        features: values.features,
        conditionNotes: values.conditionNotes,
        hasInsurance: values.hasInsurance,
        insuranceNotes: values.hasInsurance ? values.insuranceNotes : '',
        pickupAddress: values.pickupAddress,
        pickupCity: values.pickupCity,
        pickupState: values.pickupState,
        pickupCountry: values.pickupCountry,
        minRentalDays: Number(values.minRentalDays) || 1,
      });
      router.push(`/host/dashboard/vehicles/${result.vehicle.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vehicle');
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold">Add vehicle</h3>
        <p className="text-sm text-slate-600">Fill in the details then submit for review when ready.</p>
      </div>
      <Card className="border-slate-200">
        <CardContent className="py-6">
          {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <form className="grid gap-6 md:grid-cols-2" onSubmit={onSubmit}>
            {/* Basic Info */}
            <div className="md:col-span-2">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Basic info</p>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-2 text-sm"><span className="font-semibold">Make</span>
                  <Input placeholder="Toyota" {...register('make', { required: true })} /></label>
                <label className="space-y-2 text-sm"><span className="font-semibold">Model</span>
                  <Input placeholder="Camry" {...register('model', { required: true })} /></label>
                <label className="space-y-2 text-sm"><span className="font-semibold">Year</span>
                  <Input type="number" placeholder="2022" {...register('year', { required: true })} /></label>
                <label className="space-y-2 text-sm"><span className="font-semibold">Color</span>
                  <Input placeholder="Black" {...register('color')} /></label>
                <label className="space-y-2 text-sm"><span className="font-semibold">Fuel type</span>
                  <select className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" {...register('fuelType')}>
                    {['petrol','diesel','electric','hybrid'].map(f => <option key={f} value={f}>{f}</option>)}
                  </select></label>
                <label className="space-y-2 text-sm"><span className="font-semibold">Transmission</span>
                  <select className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" {...register('transmission')}>
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                  </select></label>
                <label className="space-y-2 text-sm"><span className="font-semibold">Seats</span>
                  <Input type="number" min="1" {...register('seatCapacity', { required: true })} /></label>
              </div>
            </div>

            {/* Pricing */}
            <div className="md:col-span-2">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Pricing</p>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm"><span className="font-semibold">Daily price (₦)</span>
                  <Input type="number" min="0" placeholder="25000" {...register('dailyPrice', { required: true })} /></label>
                <label className="space-y-2 text-sm"><span className="font-semibold">Caution deposit (₦)</span>
                  <Input type="number" min="0" placeholder="50000" {...register('cautionDeposit')} /></label>
                <label className="space-y-2 text-sm"><span className="font-semibold">Mileage limit/day (km, optional)</span>
                  <Input type="number" min="0" placeholder="200" {...register('mileageLimitPerDay')} /></label>
                <label className="space-y-2 text-sm"><span className="font-semibold">Extra charge/km (₦, optional)</span>
                  <Input type="number" min="0" placeholder="100" {...register('extraMileageCharge')} /></label>
                <label className="space-y-2 text-sm"><span className="font-semibold">Min rental days</span>
                  <Input type="number" min="1" {...register('minRentalDays')} /></label>
              </div>
            </div>

            {/* Driver option */}
            <div className="md:col-span-2">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Driver option</p>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="accent-primary" {...register('withDriverAvailable')} />
                <span className="font-semibold">Offer with driver</span>
              </label>
              {withDriver && (
                <label className="mt-3 block space-y-2 text-sm"><span className="font-semibold">Driver daily fee (₦)</span>
                  <Input type="number" min="0" {...register('driverDailyFee')} /></label>
              )}
            </div>

            {/* Features & condition */}
            <div className="md:col-span-2">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Features & condition</p>
              <Controller name="features" control={control} render={({ field }) => (
                <PillMultiSelect label="Features" options={FEATURE_OPTIONS} selected={field.value}
                  onChange={field.onChange} allowCustom customPlaceholder="Add feature" addButtonLabel="Add feature" />
              )} />
              <label className="mt-4 block space-y-2 text-sm"><span className="font-semibold">Condition notes</span>
                <textarea className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  rows={3} placeholder="Describe current condition..." {...register('conditionNotes')} /></label>
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input type="checkbox" className="accent-primary" {...register('hasInsurance')} />
                <span className="font-semibold">Has insurance</span>
              </label>
              {hasInsurance && (
                <label className="mt-3 block space-y-2 text-sm"><span className="font-semibold">Insurance notes</span>
                  <Input placeholder="Policy number or provider..." {...register('insuranceNotes')} /></label>
              )}
            </div>

            {/* Pickup location */}
            <div className="md:col-span-2">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Pickup location</p>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm md:col-span-2"><span className="font-semibold">Address (optional)</span>
                  <Input placeholder="12 Victoria Island" {...register('pickupAddress')} /></label>
                <label className="space-y-2 text-sm"><span className="font-semibold">City</span>
                  <Input placeholder="Lagos" {...register('pickupCity', { required: true })} /></label>
                <label className="space-y-2 text-sm"><span className="font-semibold">State</span>
                  <Input placeholder="Lagos State" {...register('pickupState')} /></label>
                <label className="space-y-2 text-sm"><span className="font-semibold">Country</span>
                  <Input placeholder="Nigeria" {...register('pickupCountry', { required: true })} /></label>
              </div>
            </div>

            <div className="md:col-span-2">
              <Button type="primary" buttonType="submit" className="w-full rounded-2xl md:w-auto" disabled={createVehicle.isPending}>
                {createVehicle.isPending ? 'Saving...' : 'Save as draft'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
