import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { loadsApi } from '../api/loads';
import type { Load, SearchFilters, LoadStats } from '../types/load';

// Re-export Load so existing imports from this module continue to work.
export type { Load };

const DEFAULT_FILTERS: SearchFilters = {
  originCity: '',
  destCity: '',
  equipmentType: '',
  dateFrom: '',
  dateTo: '',
  minRate: '',
  maxRate: '',
  sortBy: 'newest',
};

const STORAGE_KEY = 'truckbiz-search-filters';

function loadFiltersFromSession(): SearchFilters {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_FILTERS, ...JSON.parse(raw) };
    }
  } catch {
    // ignore parse errors
  }
  return { ...DEFAULT_FILTERS };
}

interface LoadsState {
  loads: Load[];
  activeLoads: Load[];
  currentLoad: Load | null;
  isLoading: boolean;
  error: string | null;
  searchFilters: SearchFilters;
  loadStats: LoadStats | null;
  searchLoads: (params: Partial<SearchFilters> & { market?: string }) => Promise<void>;
  pickLoad: (id: string) => Promise<void>;
  fetchActiveLoads: () => Promise<void>;
  fetchLoadById: (id: string) => Promise<void>;
  fetchLoadStats: () => Promise<void>;
  setFilter: (key: keyof SearchFilters, value: string) => void;
  clearFilters: () => void;
}

export const useLoadsStore = create<LoadsState>()(
  subscribeWithSelector((set) => ({
    loads: [],
    activeLoads: [],
    currentLoad: null,
    isLoading: false,
    error: null,
    searchFilters: loadFiltersFromSession(),
    loadStats: null,

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
        set((state) => ({
          loads: state.loads.map((l) =>
            l.id === id ? { ...l, status: 'PICKED' as const } : l
          ),
        }));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Pick failed';
        set({ error: msg });
        throw err;
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

    fetchLoadById: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const res = await loadsApi.getLoadById(id);
        set({ currentLoad: res.load, isLoading: false });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch load';
        set({ error: msg, isLoading: false });
      }
    },

    fetchLoadStats: async () => {
      try {
        const res = await loadsApi.getLoadStats();
        set({ loadStats: res.stats });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch stats';
        set({ error: msg });
      }
    },

    setFilter: (key, value) => {
      set((state) => ({
        searchFilters: { ...state.searchFilters, [key]: value },
      }));
    },

    clearFilters: () => {
      set({ searchFilters: { ...DEFAULT_FILTERS } });
    },
  }))
);

// Persist searchFilters to sessionStorage whenever they change.
useLoadsStore.subscribe(
  (state) => state.searchFilters,
  (filters) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch {
      // ignore storage errors (e.g. private browsing quota)
    }
  }
);
