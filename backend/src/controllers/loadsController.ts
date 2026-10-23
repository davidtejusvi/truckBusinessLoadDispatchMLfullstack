import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

type LoadStatus = 'AVAILABLE' | 'PICKED' | 'COMPLETED' | 'CANCELLED';
type Market = 'USA' | 'EUROPE';

interface MockLoad {
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
  pickupDate: string;
  status: LoadStatus;
  pickedById: string | null;
}

const mockLoads: MockLoad[] = [
  // USA loads
  { id: 'load-usa-1', externalId: 'DAT-001', market: 'USA', originCity: 'Chicago', originState: 'IL', destCity: 'Dallas', destState: 'TX', equipmentType: 'Dry Van', weight: 42000, distance: 920, rate: 2850, pickupDate: '2024-02-15T08:00:00Z', status: 'AVAILABLE', pickedById: null },
  { id: 'load-usa-2', externalId: 'DAT-002', market: 'USA', originCity: 'Los Angeles', originState: 'CA', destCity: 'Phoenix', destState: 'AZ', equipmentType: 'Flatbed', weight: 38000, distance: 370, rate: 1450, pickupDate: '2024-02-16T10:00:00Z', status: 'AVAILABLE', pickedById: null },
  { id: 'load-usa-3', externalId: 'DAT-003', market: 'USA', originCity: 'Atlanta', originState: 'GA', destCity: 'Miami', destState: 'FL', equipmentType: 'Reefer', weight: 35000, distance: 660, rate: 2100, pickupDate: '2024-02-15T12:00:00Z', status: 'AVAILABLE', pickedById: null },
  { id: 'load-usa-4', externalId: 'DAT-004', market: 'USA', originCity: 'New York', originState: 'NY', destCity: 'Boston', destState: 'MA', equipmentType: 'Dry Van', weight: 28000, distance: 215, rate: 950, pickupDate: '2024-02-17T07:00:00Z', status: 'AVAILABLE', pickedById: null },
  { id: 'load-usa-5', externalId: 'DAT-005', market: 'USA', originCity: 'Houston', originState: 'TX', destCity: 'Denver', destState: 'CO', equipmentType: 'Flatbed', weight: 45000, distance: 1030, rate: 3200, pickupDate: '2024-02-16T09:00:00Z', status: 'AVAILABLE', pickedById: null },
  { id: 'load-usa-6', externalId: 'DAT-006', market: 'USA', originCity: 'Seattle', originState: 'WA', destCity: 'Portland', destState: 'OR', equipmentType: 'Dry Van', weight: 31000, distance: 175, rate: 750, pickupDate: '2024-02-15T14:00:00Z', status: 'AVAILABLE', pickedById: null },
  { id: 'load-usa-7', externalId: 'DAT-007', market: 'USA', originCity: 'Detroit', originState: 'MI', destCity: 'Columbus', destState: 'OH', equipmentType: 'Auto Carrier', weight: 48000, distance: 170, rate: 1800, pickupDate: '2024-02-18T08:00:00Z', status: 'AVAILABLE', pickedById: null },
  { id: 'load-usa-8', externalId: 'DAT-008', market: 'USA', originCity: 'Kansas City', originState: 'MO', destCity: 'Memphis', destState: 'TN', equipmentType: 'Reefer', weight: 40000, distance: 440, rate: 1600, pickupDate: '2024-02-16T11:00:00Z', status: 'AVAILABLE', pickedById: null },
  { id: 'load-usa-9', externalId: 'DAT-009', market: 'USA', originCity: 'Minneapolis', originState: 'MN', destCity: 'Milwaukee', destState: 'WI', equipmentType: 'Dry Van', weight: 27000, distance: 340, rate: 1100, pickupDate: '2024-02-17T09:00:00Z', status: 'AVAILABLE', pickedById: null },
  { id: 'load-usa-10', externalId: 'DAT-010', market: 'USA', originCity: 'Charlotte', originState: 'NC', destCity: 'Nashville', destState: 'TN', equipmentType: 'Flatbed', weight: 44000, distance: 410, rate: 1350, pickupDate: '2024-02-15T10:00:00Z', status: 'AVAILABLE', pickedById: null },
  // Europe loads
  { id: 'load-eu-1', externalId: 'EU-001', market: 'EUROPE', originCity: 'Hamburg', originState: 'DE', destCity: 'Warsaw', destState: 'PL', equipmentType: 'Curtainsider', weight: 24000, distance: 870, rate: 2200, pickupDate: '2024-02-15T08:00:00Z', status: 'AVAILABLE', pickedById: null },
  { id: 'load-eu-2', externalId: 'EU-002', market: 'EUROPE', originCity: 'Paris', originState: 'FR', destCity: 'Brussels', destState: 'BE', equipmentType: 'Dry Van', weight: 18000, distance: 310, rate: 950, pickupDate: '2024-02-16T09:00:00Z', status: 'AVAILABLE', pickedById: null },
  { id: 'load-eu-3', externalId: 'EU-003', market: 'EUROPE', originCity: 'Rotterdam', originState: 'NL', destCity: 'Frankfurt', destState: 'DE', equipmentType: 'Reefer', weight: 22000, distance: 430, rate: 1400, pickupDate: '2024-02-15T12:00:00Z', status: 'AVAILABLE', pickedById: null },
  { id: 'load-eu-4', externalId: 'EU-004', market: 'EUROPE', originCity: 'Madrid', originState: 'ES', destCity: 'Barcelona', destState: 'ES', equipmentType: 'Flatbed', weight: 26000, distance: 620, rate: 1800, pickupDate: '2024-02-17T07:00:00Z', status: 'AVAILABLE', pickedById: null },
  { id: 'load-eu-5', externalId: 'EU-005', market: 'EUROPE', originCity: 'Milan', originState: 'IT', destCity: 'Vienna', destState: 'AT', equipmentType: 'Curtainsider', weight: 20000, distance: 680, rate: 1650, pickupDate: '2024-02-16T10:00:00Z', status: 'AVAILABLE', pickedById: null },
  { id: 'load-eu-6', externalId: 'EU-006', market: 'EUROPE', originCity: 'Prague', originState: 'CZ', destCity: 'Budapest', destState: 'HU', equipmentType: 'Dry Van', weight: 19000, distance: 530, rate: 1200, pickupDate: '2024-02-15T14:00:00Z', status: 'AVAILABLE', pickedById: null },
  { id: 'load-eu-7', externalId: 'EU-007', market: 'EUROPE', originCity: 'Lisbon', originState: 'PT', destCity: 'Porto', destState: 'PT', equipmentType: 'Reefer', weight: 15000, distance: 310, rate: 850, pickupDate: '2024-02-18T08:00:00Z', status: 'AVAILABLE', pickedById: null },
  { id: 'load-eu-8', externalId: 'EU-008', market: 'EUROPE', originCity: 'Amsterdam', originState: 'NL', destCity: 'Antwerp', destState: 'BE', equipmentType: 'Flatbed', weight: 23000, distance: 160, rate: 680, pickupDate: '2024-02-16T11:00:00Z', status: 'AVAILABLE', pickedById: null },
  { id: 'load-eu-9', externalId: 'EU-009', market: 'EUROPE', originCity: 'Berlin', originState: 'DE', destCity: 'Copenhagen', destState: 'DK', equipmentType: 'Curtainsider', weight: 21000, distance: 390, rate: 1100, pickupDate: '2024-02-17T09:00:00Z', status: 'AVAILABLE', pickedById: null },
  { id: 'load-eu-10', externalId: 'EU-010', market: 'EUROPE', originCity: 'Lyon', originState: 'FR', destCity: 'Turin', destState: 'IT', equipmentType: 'Dry Van', weight: 17000, distance: 290, rate: 920, pickupDate: '2024-02-15T10:00:00Z', status: 'AVAILABLE', pickedById: null },
];

const pickedLoads: string[] = [];

export const searchLoads = async (req: Request, res: Response): Promise<void> => {
  const { market, origin, destination, equipmentType } = req.query;
  let results = [...mockLoads];
  if (market) results = results.filter(l => l.market === String(market).toUpperCase());
  if (origin) results = results.filter(l => l.originCity.toLowerCase().includes(String(origin).toLowerCase()) || l.originState.toLowerCase().includes(String(origin).toLowerCase()));
  if (destination) results = results.filter(l => l.destCity.toLowerCase().includes(String(destination).toLowerCase()) || l.destState.toLowerCase().includes(String(destination).toLowerCase()));
  if (equipmentType) results = results.filter(l => l.equipmentType.toLowerCase().includes(String(equipmentType).toLowerCase()));
  res.json({ loads: results, total: results.length });
};

export const pickLoad = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const load = mockLoads.find(l => l.id === id);
  if (!load) {
    res.status(404).json({ error: 'Load not found' });
    return;
  }
  if (load.status !== 'AVAILABLE') {
    res.status(409).json({ error: 'Load is no longer available' });
    return;
  }
  load.status = 'PICKED';
  load.pickedById = req.user?.id || null;
  pickedLoads.push(id);
  res.json({ message: 'Load picked successfully', load });
};

export const getActiveLoads = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const active = mockLoads.filter(l => l.pickedById === userId && l.status === 'PICKED');
  res.json({ loads: active, total: active.length });
};
