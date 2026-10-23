export type LoadStatus = 'AVAILABLE' | 'PICKED' | 'COMPLETED' | 'CANCELLED';
export type Market = 'USA' | 'EUROPE';

export interface MockLoad {
  id: string;
  externalId: string;
  market: Market;
  originCity: string;
  originState: string;
  destCity: string;
  destState: string;
  equipmentType: string;
  weight: number;
  distance: number;
  rate: number;
  ratePerMile: number | null;
  ratePerKm: number | null;
  pickupDate: string;
  deliveryDate: string;
  status: LoadStatus;
  pickedById: string | null;
  postedBy: string;
  age: number;
  commodity: string;
  truckRequired: string;
}
