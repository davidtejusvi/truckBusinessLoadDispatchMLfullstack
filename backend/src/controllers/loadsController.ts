import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { MockLoad } from '../types/load';

// Base date for pickup spread: use a fixed reference so data is stable
const BASE_DATE = new Date('2024-07-01T00:00:00Z');

function pickupDateDays(days: number, hour: number): string {
  const d = new Date(BASE_DATE);
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
}

function deliveryDateDays(pickupIso: string, transitDays: number): string {
  const d = new Date(pickupIso);
  d.setUTCDate(d.getUTCDate() + transitDays);
  return d.toISOString();
}

const mockLoads: MockLoad[] = [
  // ── USA (25 loads) ──────────────────────────────────────────────────────────
  {
    id: 'load-usa-1', externalId: 'DAT-001', market: 'USA',
    originCity: 'Chicago', originState: 'IL', destCity: 'Atlanta', destState: 'GA',
    equipmentType: 'Flatbed', weight: 43000, distance: 716, rate: 2147,
    ratePerMile: parseFloat((2147 / 716).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(0, 8), deliveryDate: deliveryDateDays(pickupDateDays(0, 8), 2),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Midwest Freight Co', age: 30, commodity: 'Steel Coils', truckRequired: 'Flatbed',
  },
  {
    id: 'load-usa-2', externalId: 'DAT-002', market: 'USA',
    originCity: 'Dallas', originState: 'TX', destCity: 'Los Angeles', destState: 'CA',
    equipmentType: 'Dry Van', weight: 38000, distance: 1435, rate: 3588,
    ratePerMile: parseFloat((3588 / 1435).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(1, 7), deliveryDate: deliveryDateDays(pickupDateDays(1, 7), 3),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Lone Star Logistics', age: 60, commodity: 'Electronics', truckRequired: 'Dry Van',
  },
  {
    id: 'load-usa-3', externalId: 'DAT-003', market: 'USA',
    originCity: 'New York', originState: 'NY', destCity: 'Miami', destState: 'FL',
    equipmentType: 'Reefer', weight: 35000, distance: 1280, rate: 3456,
    ratePerMile: parseFloat((3456 / 1280).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(1, 9), deliveryDate: deliveryDateDays(pickupDateDays(1, 9), 3),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'East Coast Transport', age: 15, commodity: 'Frozen Food', truckRequired: 'Reefer',
  },
  {
    id: 'load-usa-4', externalId: 'DAT-004', market: 'USA',
    originCity: 'Seattle', originState: 'WA', destCity: 'Phoenix', destState: 'AZ',
    equipmentType: 'Step Deck', weight: 45000, distance: 1421, rate: 4263,
    ratePerMile: parseFloat((4263 / 1421).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(2, 6), deliveryDate: deliveryDateDays(pickupDateDays(2, 6), 3),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Pacific Northwest Freight', age: 90, commodity: 'Machinery', truckRequired: 'Step Deck',
  },
  {
    id: 'load-usa-5', externalId: 'DAT-005', market: 'USA',
    originCity: 'Denver', originState: 'CO', destCity: 'Houston', destState: 'TX',
    equipmentType: 'Lowboy', weight: 48000, distance: 1020, rate: 3264,
    ratePerMile: parseFloat((3264 / 1020).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(2, 10), deliveryDate: deliveryDateDays(pickupDateDays(2, 10), 2),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Rocky Mountain Carriers', age: 120, commodity: 'Construction Equipment', truckRequired: 'Lowboy',
  },
  {
    id: 'load-usa-6', externalId: 'DAT-006', market: 'USA',
    originCity: 'Chicago', originState: 'IL', destCity: 'Dallas', destState: 'TX',
    equipmentType: 'Dry Van', weight: 40000, distance: 920, rate: 2484,
    ratePerMile: parseFloat((2484 / 920).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(3, 8), deliveryDate: deliveryDateDays(pickupDateDays(3, 8), 2),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Heartland Haulers', age: 45, commodity: 'Auto Parts', truckRequired: 'Dry Van',
  },
  {
    id: 'load-usa-7', externalId: 'DAT-007', market: 'USA',
    originCity: 'Los Angeles', originState: 'CA', destCity: 'Seattle', destState: 'WA',
    equipmentType: 'Flatbed', weight: 42000, distance: 1135, rate: 3405,
    ratePerMile: parseFloat((3405 / 1135).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(3, 11), deliveryDate: deliveryDateDays(pickupDateDays(3, 11), 2),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'SoCal Freight Lines', age: 200, commodity: 'Building Materials', truckRequired: 'Flatbed',
  },
  {
    id: 'load-usa-8', externalId: 'DAT-008', market: 'USA',
    originCity: 'Miami', originState: 'FL', destCity: 'Chicago', destState: 'IL',
    equipmentType: 'Reefer', weight: 36000, distance: 1376, rate: 3716,
    ratePerMile: parseFloat((3716 / 1376).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(4, 7), deliveryDate: deliveryDateDays(pickupDateDays(4, 7), 3),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Sunshine State Logistics', age: 75, commodity: 'Produce', truckRequired: 'Reefer',
  },
  {
    id: 'load-usa-9', externalId: 'DAT-009', market: 'USA',
    originCity: 'Phoenix', originState: 'AZ', destCity: 'Denver', destState: 'CO',
    equipmentType: 'Step Deck', weight: 44000, distance: 600, rate: 1800,
    ratePerMile: parseFloat((1800 / 600).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(4, 9), deliveryDate: deliveryDateDays(pickupDateDays(4, 9), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Desert Transport LLC', age: 180, commodity: 'Industrial Equipment', truckRequired: 'Step Deck',
  },
  {
    id: 'load-usa-10', externalId: 'DAT-010', market: 'USA',
    originCity: 'Houston', originState: 'TX', destCity: 'Nashville', destState: 'TN',
    equipmentType: 'Lowboy', weight: 47000, distance: 870, rate: 2610,
    ratePerMile: parseFloat((2610 / 870).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(5, 8), deliveryDate: deliveryDateDays(pickupDateDays(5, 8), 2),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Gulf Coast Carriers', age: 240, commodity: 'Heavy Machinery', truckRequired: 'Lowboy',
  },
  {
    id: 'load-usa-11', externalId: 'DAT-011', market: 'USA',
    originCity: 'Atlanta', originState: 'GA', destCity: 'New York', destState: 'NY',
    equipmentType: 'Dry Van', weight: 38000, distance: 883, rate: 2384,
    ratePerMile: parseFloat((2384 / 883).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(5, 10), deliveryDate: deliveryDateDays(pickupDateDays(5, 10), 2),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Peach State Freight', age: 55, commodity: 'Consumer Goods', truckRequired: 'Dry Van',
  },
  {
    id: 'load-usa-12', externalId: 'DAT-012', market: 'USA',
    originCity: 'Boston', originState: 'MA', destCity: 'Philadelphia', destState: 'PA',
    equipmentType: 'Flatbed', weight: 41000, distance: 310, rate: 930,
    ratePerMile: parseFloat((930 / 310).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(6, 7), deliveryDate: deliveryDateDays(pickupDateDays(6, 7), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'New England Transport', age: 10, commodity: 'Steel Beams', truckRequired: 'Flatbed',
  },
  {
    id: 'load-usa-13', externalId: 'DAT-013', market: 'USA',
    originCity: 'Kansas City', originState: 'MO', destCity: 'Memphis', destState: 'TN',
    equipmentType: 'Reefer', weight: 37000, distance: 440, rate: 1320,
    ratePerMile: parseFloat((1320 / 440).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(6, 9), deliveryDate: deliveryDateDays(pickupDateDays(6, 9), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Midwest Cold Chain', age: 360, commodity: 'Frozen Food', truckRequired: 'Reefer',
  },
  {
    id: 'load-usa-14', externalId: 'DAT-014', market: 'USA',
    originCity: 'Minneapolis', originState: 'MN', destCity: 'Detroit', destState: 'MI',
    equipmentType: 'Step Deck', weight: 43000, distance: 690, rate: 2070,
    ratePerMile: parseFloat((2070 / 690).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(7, 8), deliveryDate: deliveryDateDays(pickupDateDays(7, 8), 2),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Twin Cities Freight', age: 420, commodity: 'Agricultural Equipment', truckRequired: 'Step Deck',
  },
  {
    id: 'load-usa-15', externalId: 'DAT-015', market: 'USA',
    originCity: 'Charlotte', originState: 'NC', destCity: 'Nashville', destState: 'TN',
    equipmentType: 'Lowboy', weight: 46000, distance: 408, rate: 1224,
    ratePerMile: parseFloat((1224 / 408).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(7, 10), deliveryDate: deliveryDateDays(pickupDateDays(7, 10), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Carolina Carriers', age: 480, commodity: 'Construction Equipment', truckRequired: 'Lowboy',
  },
  {
    id: 'load-usa-16', externalId: 'DAT-016', market: 'USA',
    originCity: 'Dallas', originState: 'TX', destCity: 'Chicago', destState: 'IL',
    equipmentType: 'Dry Van', weight: 39000, distance: 920, rate: 2484,
    ratePerMile: parseFloat((2484 / 920).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(8, 7), deliveryDate: deliveryDateDays(pickupDateDays(8, 7), 2),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Texas Freight Solutions', age: 25, commodity: 'Retail Goods', truckRequired: 'Dry Van',
  },
  {
    id: 'load-usa-17', externalId: 'DAT-017', market: 'USA',
    originCity: 'Seattle', originState: 'WA', destCity: 'Portland', destState: 'OR',
    equipmentType: 'Flatbed', weight: 40000, distance: 175, rate: 613,
    ratePerMile: parseFloat((613 / 175).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(8, 9), deliveryDate: deliveryDateDays(pickupDateDays(8, 9), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Pacific Logistics Group', age: 145, commodity: 'Lumber', truckRequired: 'Flatbed',
  },
  {
    id: 'load-usa-18', externalId: 'DAT-018', market: 'USA',
    originCity: 'Denver', originState: 'CO', destCity: 'Salt Lake City', destState: 'UT',
    equipmentType: 'Reefer', weight: 34000, distance: 525, rate: 1575,
    ratePerMile: parseFloat((1575 / 525).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(9, 8), deliveryDate: deliveryDateDays(pickupDateDays(9, 8), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Mountain West Freight', age: 310, commodity: 'Dairy Products', truckRequired: 'Reefer',
  },
  {
    id: 'load-usa-19', externalId: 'DAT-019', market: 'USA',
    originCity: 'New York', originState: 'NY', destCity: 'Washington DC', destState: 'DC',
    equipmentType: 'Step Deck', weight: 42000, distance: 228, rate: 684,
    ratePerMile: parseFloat((684 / 228).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(9, 10), deliveryDate: deliveryDateDays(pickupDateDays(9, 10), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Metro Freight Services', age: 5, commodity: 'Government Supplies', truckRequired: 'Step Deck',
  },
  {
    id: 'load-usa-20', externalId: 'DAT-020', market: 'USA',
    originCity: 'Houston', originState: 'TX', destCity: 'San Antonio', destState: 'TX',
    equipmentType: 'Lowboy', weight: 49000, distance: 197, rate: 690,
    ratePerMile: parseFloat((690 / 197).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(10, 7), deliveryDate: deliveryDateDays(pickupDateDays(10, 7), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Lone Star Heavy Haul', age: 270, commodity: 'Oilfield Equipment', truckRequired: 'Lowboy',
  },
  {
    id: 'load-usa-21', externalId: 'DAT-021', market: 'USA',
    originCity: 'Los Angeles', originState: 'CA', destCity: 'Las Vegas', destState: 'NV',
    equipmentType: 'Dry Van', weight: 36000, distance: 272, rate: 816,
    ratePerMile: parseFloat((816 / 272).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(10, 9), deliveryDate: deliveryDateDays(pickupDateDays(10, 9), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'California Freight Co', age: 400, commodity: 'Electronics', truckRequired: 'Dry Van',
  },
  {
    id: 'load-usa-22', externalId: 'DAT-022', market: 'USA',
    originCity: 'Phoenix', originState: 'AZ', destCity: 'Tucson', destState: 'AZ',
    equipmentType: 'Flatbed', weight: 41000, distance: 115, rate: 403,
    ratePerMile: parseFloat((403 / 115).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(11, 8), deliveryDate: deliveryDateDays(pickupDateDays(11, 8), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Arizona Flatbed LLC', age: 160, commodity: 'Building Materials', truckRequired: 'Flatbed',
  },
  {
    id: 'load-usa-23', externalId: 'DAT-023', market: 'USA',
    originCity: 'Atlanta', originState: 'GA', destCity: 'Birmingham', destState: 'AL',
    equipmentType: 'Reefer', weight: 33000, distance: 147, rate: 515,
    ratePerMile: parseFloat((515 / 147).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(11, 10), deliveryDate: deliveryDateDays(pickupDateDays(11, 10), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Southern Cold Freight', age: 215, commodity: 'Frozen Meat', truckRequired: 'Reefer',
  },
  {
    id: 'load-usa-24', externalId: 'DAT-024', market: 'USA',
    originCity: 'Chicago', originState: 'IL', destCity: 'St Louis', destState: 'MO',
    equipmentType: 'Step Deck', weight: 44000, distance: 299, rate: 897,
    ratePerMile: parseFloat((897 / 299).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(12, 7), deliveryDate: deliveryDateDays(pickupDateDays(12, 7), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Great Lakes Freight', age: 335, commodity: 'Industrial Parts', truckRequired: 'Step Deck',
  },
  {
    id: 'load-usa-25', externalId: 'DAT-025', market: 'USA',
    originCity: 'Memphis', originState: 'TN', destCity: 'Nashville', destState: 'TN',
    equipmentType: 'Lowboy', weight: 47000, distance: 213, rate: 639,
    ratePerMile: parseFloat((639 / 213).toFixed(2)), ratePerKm: null,
    pickupDate: pickupDateDays(13, 9), deliveryDate: deliveryDateDays(pickupDateDays(13, 9), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Volunteer State Carriers', age: 460, commodity: 'Heavy Equipment', truckRequired: 'Lowboy',
  },

  // ── EUROPE (20 loads) ────────────────────────────────────────────────────────
  {
    id: 'load-eu-1', externalId: 'EU-001', market: 'EUROPE',
    originCity: 'Amsterdam', originState: 'NL', destCity: 'Paris', destState: 'FR',
    equipmentType: 'Tautliner', weight: 24000, distance: 504, rate: 1058,
    ratePerMile: null, ratePerKm: parseFloat((1058 / 504).toFixed(2)),
    pickupDate: pickupDateDays(0, 9), deliveryDate: deliveryDateDays(pickupDateDays(0, 9), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Holland Express BV', age: 20, commodity: 'Consumer Goods', truckRequired: 'Tautliner',
  },
  {
    id: 'load-eu-2', externalId: 'EU-002', market: 'EUROPE',
    originCity: 'Hamburg', originState: 'DE', destCity: 'Warsaw', destState: 'PL',
    equipmentType: 'Mega', weight: 26000, distance: 870, rate: 2175,
    ratePerMile: null, ratePerKm: parseFloat((2175 / 870).toFixed(2)),
    pickupDate: pickupDateDays(1, 8), deliveryDate: deliveryDateDays(pickupDateDays(1, 8), 2),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Hamburg Logistics GmbH', age: 50, commodity: 'Auto Parts', truckRequired: 'Mega',
  },
  {
    id: 'load-eu-3', externalId: 'EU-003', market: 'EUROPE',
    originCity: 'Madrid', originState: 'ES', destCity: 'Lisbon', destState: 'PT',
    equipmentType: 'Frigo', weight: 22000, distance: 625, rate: 1563,
    ratePerMile: null, ratePerKm: parseFloat((1563 / 625).toFixed(2)),
    pickupDate: pickupDateDays(1, 10), deliveryDate: deliveryDateDays(pickupDateDays(1, 10), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Iberia Freight SA', age: 110, commodity: 'Frozen Seafood', truckRequired: 'Frigo',
  },
  {
    id: 'load-eu-4', externalId: 'EU-004', market: 'EUROPE',
    originCity: 'Milan', originState: 'IT', destCity: 'Vienna', destState: 'AT',
    equipmentType: 'Flatbed', weight: 28000, distance: 826, rate: 2065,
    ratePerMile: null, ratePerKm: parseFloat((2065 / 826).toFixed(2)),
    pickupDate: pickupDateDays(2, 7), deliveryDate: deliveryDateDays(pickupDateDays(2, 7), 2),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Milano Trasporti SpA', age: 175, commodity: 'Steel Coils', truckRequired: 'Flatbed',
  },
  {
    id: 'load-eu-5', externalId: 'EU-005', market: 'EUROPE',
    originCity: 'Rotterdam', originState: 'NL', destCity: 'Frankfurt', destState: 'DE',
    equipmentType: 'Coil', weight: 30000, distance: 390, rate: 1092,
    ratePerMile: null, ratePerKm: parseFloat((1092 / 390).toFixed(2)),
    pickupDate: pickupDateDays(2, 9), deliveryDate: deliveryDateDays(pickupDateDays(2, 9), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Port of Rotterdam Carriers', age: 220, commodity: 'Metal Coils', truckRequired: 'Coil',
  },
  {
    id: 'load-eu-6', externalId: 'EU-006', market: 'EUROPE',
    originCity: 'Paris', originState: 'FR', destCity: 'Berlin', destState: 'DE',
    equipmentType: 'Tautliner', weight: 23000, distance: 1050, rate: 2310,
    ratePerMile: null, ratePerKm: parseFloat((2310 / 1050).toFixed(2)),
    pickupDate: pickupDateDays(3, 8), deliveryDate: deliveryDateDays(pickupDateDays(3, 8), 2),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Transports Dupont SARL', age: 85, commodity: 'Fashion Goods', truckRequired: 'Tautliner',
  },
  {
    id: 'load-eu-7', externalId: 'EU-007', market: 'EUROPE',
    originCity: 'Brussels', originState: 'BE', destCity: 'Amsterdam', destState: 'NL',
    equipmentType: 'Mega', weight: 20000, distance: 210, rate: 588,
    ratePerMile: null, ratePerKm: parseFloat((588 / 210).toFixed(2)),
    pickupDate: pickupDateDays(3, 10), deliveryDate: deliveryDateDays(pickupDateDays(3, 10), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Benelux Freight NV', age: 135, commodity: 'Chemicals', truckRequired: 'Mega',
  },
  {
    id: 'load-eu-8', externalId: 'EU-008', market: 'EUROPE',
    originCity: 'Warsaw', originState: 'PL', destCity: 'Prague', destState: 'CZ',
    equipmentType: 'Frigo', weight: 21000, distance: 660, rate: 1650,
    ratePerMile: null, ratePerKm: parseFloat((1650 / 660).toFixed(2)),
    pickupDate: pickupDateDays(4, 7), deliveryDate: deliveryDateDays(pickupDateDays(4, 7), 2),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'East EU Transport Sp.z.o.o', age: 280, commodity: 'Dairy Products', truckRequired: 'Frigo',
  },
  {
    id: 'load-eu-9', externalId: 'EU-009', market: 'EUROPE',
    originCity: 'Lisbon', originState: 'PT', destCity: 'Madrid', destState: 'ES',
    equipmentType: 'Flatbed', weight: 27000, distance: 625, rate: 1563,
    ratePerMile: null, ratePerKm: parseFloat((1563 / 625).toFixed(2)),
    pickupDate: pickupDateDays(4, 9), deliveryDate: deliveryDateDays(pickupDateDays(4, 9), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Lusitania Cargo Lda', age: 350, commodity: 'Granite Slabs', truckRequired: 'Flatbed',
  },
  {
    id: 'load-eu-10', externalId: 'EU-010', market: 'EUROPE',
    originCity: 'Vienna', originState: 'AT', destCity: 'Budapest', destState: 'HU',
    equipmentType: 'Coil', weight: 29000, distance: 243, rate: 680,
    ratePerMile: null, ratePerKm: parseFloat((680 / 243).toFixed(2)),
    pickupDate: pickupDateDays(5, 8), deliveryDate: deliveryDateDays(pickupDateDays(5, 8), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Danube Logistics KG', age: 40, commodity: 'Steel Wire', truckRequired: 'Coil',
  },
  {
    id: 'load-eu-11', externalId: 'EU-011', market: 'EUROPE',
    originCity: 'Frankfurt', originState: 'DE', destCity: 'Munich', destState: 'DE',
    equipmentType: 'Tautliner', weight: 22000, distance: 394, rate: 906,
    ratePerMile: null, ratePerKm: parseFloat((906 / 394).toFixed(2)),
    pickupDate: pickupDateDays(5, 10), deliveryDate: deliveryDateDays(pickupDateDays(5, 10), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Rhine Carriers GmbH', age: 95, commodity: 'Auto Components', truckRequired: 'Tautliner',
  },
  {
    id: 'load-eu-12', externalId: 'EU-012', market: 'EUROPE',
    originCity: 'Munich', originState: 'DE', destCity: 'Zurich', destState: 'CH',
    equipmentType: 'Mega', weight: 18000, distance: 340, rate: 952,
    ratePerMile: null, ratePerKm: parseFloat((952 / 340).toFixed(2)),
    pickupDate: pickupDateDays(6, 7), deliveryDate: deliveryDateDays(pickupDateDays(6, 7), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Bayern Transport AG', age: 155, commodity: 'Electronics', truckRequired: 'Mega',
  },
  {
    id: 'load-eu-13', externalId: 'EU-013', market: 'EUROPE',
    originCity: 'Zurich', originState: 'CH', destCity: 'Lyon', destState: 'FR',
    equipmentType: 'Frigo', weight: 19000, distance: 472, rate: 1274,
    ratePerMile: null, ratePerKm: parseFloat((1274 / 472).toFixed(2)),
    pickupDate: pickupDateDays(6, 9), deliveryDate: deliveryDateDays(pickupDateDays(6, 9), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Swiss Alpine Freight AG', age: 320, commodity: 'Pharmaceutical Goods', truckRequired: 'Frigo',
  },
  {
    id: 'load-eu-14', externalId: 'EU-014', market: 'EUROPE',
    originCity: 'Lyon', originState: 'FR', destCity: 'Barcelona', destState: 'ES',
    equipmentType: 'Flatbed', weight: 25000, distance: 640, rate: 1600,
    ratePerMile: null, ratePerKm: parseFloat((1600 / 640).toFixed(2)),
    pickupDate: pickupDateDays(7, 8), deliveryDate: deliveryDateDays(pickupDateDays(7, 8), 2),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Rhône Transport SAS', age: 70, commodity: 'Building Stone', truckRequired: 'Flatbed',
  },
  {
    id: 'load-eu-15', externalId: 'EU-015', market: 'EUROPE',
    originCity: 'Barcelona', originState: 'ES', destCity: 'Madrid', destState: 'ES',
    equipmentType: 'Coil', weight: 28000, distance: 621, rate: 1739,
    ratePerMile: null, ratePerKm: parseFloat((1739 / 621).toFixed(2)),
    pickupDate: pickupDateDays(7, 10), deliveryDate: deliveryDateDays(pickupDateDays(7, 10), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Catalan Logistics SL', age: 195, commodity: 'Steel Coils', truckRequired: 'Coil',
  },
  {
    id: 'load-eu-16', externalId: 'EU-016', market: 'EUROPE',
    originCity: 'Rome', originState: 'IT', destCity: 'Milan', destState: 'IT',
    equipmentType: 'Tautliner', weight: 21000, distance: 572, rate: 1430,
    ratePerMile: null, ratePerKm: parseFloat((1430 / 572).toFixed(2)),
    pickupDate: pickupDateDays(8, 7), deliveryDate: deliveryDateDays(pickupDateDays(8, 7), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Roma Express Srl', age: 415, commodity: 'Marble', truckRequired: 'Tautliner',
  },
  {
    id: 'load-eu-17', externalId: 'EU-017', market: 'EUROPE',
    originCity: 'Athens', originState: 'GR', destCity: 'Sofia', destState: 'BG',
    equipmentType: 'Mega', weight: 23000, distance: 535, rate: 1284,
    ratePerMile: null, ratePerKm: parseFloat((1284 / 535).toFixed(2)),
    pickupDate: pickupDateDays(8, 9), deliveryDate: deliveryDateDays(pickupDateDays(8, 9), 2),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Aegean Freight EPE', age: 250, commodity: 'Olive Oil', truckRequired: 'Mega',
  },
  {
    id: 'load-eu-18', externalId: 'EU-018', market: 'EUROPE',
    originCity: 'Sofia', originState: 'BG', destCity: 'Bucharest', destState: 'RO',
    equipmentType: 'Frigo', weight: 20000, distance: 388, rate: 970,
    ratePerMile: null, ratePerKm: parseFloat((970 / 388).toFixed(2)),
    pickupDate: pickupDateDays(9, 8), deliveryDate: deliveryDateDays(pickupDateDays(9, 8), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Balkan Trans EOOD', age: 385, commodity: 'Frozen Vegetables', truckRequired: 'Frigo',
  },
  {
    id: 'load-eu-19', externalId: 'EU-019', market: 'EUROPE',
    originCity: 'Bucharest', originState: 'RO', destCity: 'Kiev', destState: 'UA',
    equipmentType: 'Flatbed', weight: 26000, distance: 820, rate: 2050,
    ratePerMile: null, ratePerKm: parseFloat((2050 / 820).toFixed(2)),
    pickupDate: pickupDateDays(9, 10), deliveryDate: deliveryDateDays(pickupDateDays(9, 10), 2),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Eastern EU Logistics SRL', age: 130, commodity: 'Timber', truckRequired: 'Flatbed',
  },
  {
    id: 'load-eu-20', externalId: 'EU-020', market: 'EUROPE',
    originCity: 'Copenhagen', originState: 'DK', destCity: 'Stockholm', destState: 'SE',
    equipmentType: 'Coil', weight: 27000, distance: 650, rate: 1820,
    ratePerMile: null, ratePerKm: parseFloat((1820 / 650).toFixed(2)),
    pickupDate: pickupDateDays(10, 8), deliveryDate: deliveryDateDays(pickupDateDays(10, 8), 1),
    status: 'AVAILABLE', pickedById: null,
    postedBy: 'Nordic Cargo AS', age: 455, commodity: 'Paper Rolls', truckRequired: 'Coil',
  },
];

// ── Search ────────────────────────────────────────────────────────────────────

export const searchLoads = async (req: Request, res: Response): Promise<void> => {
  const {
    market,
    originCity,
    originState,
    destCity,
    destState,
    equipmentType,
    minRate,
    maxRate,
    pickupDateFrom,
    pickupDateTo,
    minDistance,
    maxDistance,
  } = req.query;

  let results = [...mockLoads];

  if (market && String(market).toUpperCase() !== 'ALL') {
    results = results.filter(l => l.market === String(market).toUpperCase());
  }
  if (originCity) {
    results = results.filter(l =>
      l.originCity.toLowerCase().includes(String(originCity).toLowerCase()),
    );
  }
  if (originState) {
    results = results.filter(l =>
      l.originState.toLowerCase().includes(String(originState).toLowerCase()),
    );
  }
  if (destCity) {
    results = results.filter(l =>
      l.destCity.toLowerCase().includes(String(destCity).toLowerCase()),
    );
  }
  if (destState) {
    results = results.filter(l =>
      l.destState.toLowerCase().includes(String(destState).toLowerCase()),
    );
  }
  if (equipmentType && String(equipmentType).toUpperCase() !== 'ALL') {
    results = results.filter(
      l => l.equipmentType.toLowerCase() === String(equipmentType).toLowerCase(),
    );
  }
  if (minRate !== undefined) {
    const min = parseFloat(String(minRate));
    if (!isNaN(min)) results = results.filter(l => l.rate >= min);
  }
  if (maxRate !== undefined) {
    const max = parseFloat(String(maxRate));
    if (!isNaN(max)) results = results.filter(l => l.rate <= max);
  }
  if (pickupDateFrom) {
    const from = new Date(String(pickupDateFrom)).getTime();
    if (!isNaN(from)) results = results.filter(l => new Date(l.pickupDate).getTime() >= from);
  }
  if (pickupDateTo) {
    const to = new Date(String(pickupDateTo)).getTime();
    if (!isNaN(to)) results = results.filter(l => new Date(l.pickupDate).getTime() <= to);
  }
  if (minDistance !== undefined) {
    const min = parseFloat(String(minDistance));
    if (!isNaN(min)) results = results.filter(l => l.distance >= min);
  }
  if (maxDistance !== undefined) {
    const max = parseFloat(String(maxDistance));
    if (!isNaN(max)) results = results.filter(l => l.distance <= max);
  }

  // Sort by age ascending (lower age = more recently posted = newer)
  results.sort((a, b) => a.age - b.age);

  const appliedFilters: Record<string, unknown> = {};
  if (market) appliedFilters.market = market;
  if (originCity) appliedFilters.originCity = originCity;
  if (originState) appliedFilters.originState = originState;
  if (destCity) appliedFilters.destCity = destCity;
  if (destState) appliedFilters.destState = destState;
  if (equipmentType) appliedFilters.equipmentType = equipmentType;
  if (minRate !== undefined) appliedFilters.minRate = minRate;
  if (maxRate !== undefined) appliedFilters.maxRate = maxRate;
  if (pickupDateFrom) appliedFilters.pickupDateFrom = pickupDateFrom;
  if (pickupDateTo) appliedFilters.pickupDateTo = pickupDateTo;
  if (minDistance !== undefined) appliedFilters.minDistance = minDistance;
  if (maxDistance !== undefined) appliedFilters.maxDistance = maxDistance;

  res.json({
    loads: results,
    total: results.length,
    market: market ? String(market).toUpperCase() : null,
    filters: appliedFilters,
  });
};

// ── Get by ID ─────────────────────────────────────────────────────────────────

export const getLoadById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const load = mockLoads.find(l => l.id === id);
  if (!load) {
    res.status(404).json({ error: 'Load not found' });
    return;
  }
  res.json({ load });
};

// ── Pick load ─────────────────────────────────────────────────────────────────

export const pickLoad = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const load = mockLoads.find(l => l.id === id);
  if (!load) {
    res.status(404).json({ error: 'Load not found' });
    return;
  }
  if (load.status !== 'AVAILABLE') {
    res.status(409).json({ error: 'Load already picked' });
    return;
  }
  load.status = 'PICKED';
  load.pickedById = req.user?.id || null;
  res.json({ message: 'Load picked successfully', load });
};

// ── Active loads ──────────────────────────────────────────────────────────────

export const getActiveLoads = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const active = mockLoads.filter(l => l.pickedById === userId && l.status === 'PICKED');
  res.json({ loads: active, total: active.length });
};

// ── Stats ─────────────────────────────────────────────────────────────────────

export const getLoadStats = async (_req: Request, res: Response): Promise<void> => {
  const available = mockLoads.filter(l => l.status === 'AVAILABLE');
  const totalAvailable = available.length;

  const byMarket = {
    USA: available.filter(l => l.market === 'USA').length,
    EUROPE: available.filter(l => l.market === 'EUROPE').length,
  };

  const byEquipmentType: Record<string, number> = {};
  for (const load of mockLoads) {
    byEquipmentType[load.equipmentType] = (byEquipmentType[load.equipmentType] ?? 0) + 1;
  }

  const usaLoads = mockLoads.filter(l => l.market === 'USA');
  const europeLoads = mockLoads.filter(l => l.market === 'EUROPE');

  const avgRateUSA =
    usaLoads.length > 0
      ? parseFloat(
        (usaLoads.reduce((sum, l) => sum + l.rate, 0) / usaLoads.length).toFixed(2),
      )
      : 0;

  const avgRateEurope =
    europeLoads.length > 0
      ? parseFloat(
        (europeLoads.reduce((sum, l) => sum + l.rate, 0) / europeLoads.length).toFixed(2),
      )
      : 0;

  res.json({
    stats: {
      totalAvailable,
      byMarket,
      byEquipmentType,
      avgRateUSA,
      avgRateEurope,
    },
  });
};
