import { create } from 'zustand';
import { loadsApi } from '../api/loads';

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
  pickupDate: string;
  status: 'AVAILABLE' | 'PICKED' | 'COMPLETED' | 'CANCELLED';
  pickedById?: string | null;
}

interface SearchParams {
  market?: string;
  origin?: string;
  destination?: string;
  equipmentType?: string;
}

interface LoadsState {
  loads: Load[];
  activeLoads: Load[];
  isLoading: boolean;
  error: string | null;
  searchLoads: (params: SearchParams) => Promise<void>;
  pickLoad: (id: string) => Promise<void>;
  fetchActiveLoads: () => Promise<void>;
}

export const useLoadsStore = create<LoadsState>((set) => ({
  loads: [],
  activeLoads: [],
  isLoading: false,
  error: null,
  searchLoads: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const res = await loadsApi.searchLoads(params);
      set({ loads: res.loads, isLoading: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Search failed';
      set({ error: msg, isLoading: false });
    }
  },
  pickLoad: async (id) => {
    try {
      await loadsApi.pickLoad(id);
      set(state => ({
        loads: state.loads.map(l => l.id === id ? { ...l, status: 'PICKED' as const } : l),
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Pick failed';
      set({ error: msg });
    }
  },
  fetchActiveLoads: async () => {
    set({ isLoading: true });
    try {
      const res = await loadsApi.getActiveLoads();
      set({ activeLoads: res.loads, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
