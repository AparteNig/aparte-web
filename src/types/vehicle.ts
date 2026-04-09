export type VehicleStatus = 'draft' | 'pending_review' | 'published' | 'suspended';
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid';
export type VehicleTransmission = 'manual' | 'automatic';

export type VehiclePhoto = {
  id: number;
  key: string;
  url: string;
  caption: string;
  sortOrder: number;
  createdAt: string;
};

export type VehiclePhotoPayload = {
  key: string;
  caption?: string;
  sortOrder?: number;
};

export type VehicleCalendarBlock = {
  id: number;
  vehicleId: number;
  startDate: string;
  endDate: string;
  reason: string;
};

export type HostVehicle = {
  id: number;
  hostId: number;
  make: string;
  model: string;
  year: number;
  color: string;
  fuelType: FuelType;
  transmission: VehicleTransmission;
  seatCapacity: number;
  features: string[];
  conditionNotes: string;
  hasInsurance: boolean;
  insuranceNotes: string;
  dailyPrice: number;
  currency: string;
  cautionDeposit: number;
  withDriverAvailable: boolean;
  driverDailyFee: number;
  mileageLimitPerDay: number | null;
  extraMileageCharge: number | null;
  minRentalDays: number;
  pickupAddress: string;
  pickupCity: string;
  pickupState: string;
  pickupCountry: string;
  status: VehicleStatus;
  reviewNotes: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  photos: VehiclePhoto[];
  calendarBlocks?: VehicleCalendarBlock[];
};

export type AdminVehicleRow = {
  vehicle: HostVehicle;
  host: { id: number; email: string; fullName: string | null } | null;
};
