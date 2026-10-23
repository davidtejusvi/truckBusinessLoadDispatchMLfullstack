export interface Load {
  id: string;
  externalId?: string;
  market: 'USA' | 'EUROPE';
  originCity: string;
  originState: string;
  destCity: string;
  destState: string;
  equipmentType: string;
  weight?: number;
  distance?: number;
  rate?: number;
  ratePerMile?: number | null;
  ratePerKm?: number | null;
  pickupDate: string;
  deliveryDate?: string;
  status: 'AVAILABLE' | 'PICKED' | 'COMPLETED' | 'CANCELLED';
  pickedById?: string | null;
  postedBy?: string;
  age?: number;
  commodity?: string;
  truckRequired?: string;
}

export interface SearchFilters {
  originCity: string;
  destCity: string;
  equipmentType: string;
  dateFrom: string;
  dateTo: string;
  minRate: string;
  maxRate: string;
  sortBy: 'newest' | 'rate-high' | 'rate-low' | 'distance';
}

export interface LoadStats {
  totalAvailable: number;
  byMarket: { USA: number; EUROPE: number };
  byEquipmentType: Record<string, number>;
  avgRateUSA: number;
  avgRateEurope: number;
}
