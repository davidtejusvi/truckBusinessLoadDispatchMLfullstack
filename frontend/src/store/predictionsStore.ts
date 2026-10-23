import { create } from 'zustand';
import { predictionsApi } from '../api/predictions';
import type {
  RateParams,
  ForecastBody,
  Market,
  RatePrediction,
  FuelPriceResponse,
  FuelCostResponse,
  DemandLane,
  DemandForecastDay,
} from '../api/predictions';

interface PredictionsState {
  ratePrediction: RatePrediction | null;
  fuelPrice: FuelPriceResponse | null;
  fuelCost: FuelCostResponse | null;
  demandHeatmap: DemandLane[];
  demandForecast: DemandForecastDay[];
  loading: boolean;
  error: string | null;
  fetchRatePrediction: (params: RateParams) => Promise<void>;
  fetchFuelPrice: (market: Market) => Promise<void>;
  fetchFuelCost: (market: Market, distance: number) => Promise<void>;
  fetchDemandHeatmap: (market: Market) => Promise<void>;
  fetchDemandForecast: (body: ForecastBody) => Promise<void>;
  clear: () => void;
}

export const usePredictionsStore = create<PredictionsState>()((set) => ({
  ratePrediction: null,
  fuelPrice: null,
  fuelCost: null,
  demandHeatmap: [],
  demandForecast: [],
  loading: false,
  error: null,

  fetchRatePrediction: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await predictionsApi.getRatePrediction(params);
      set({ ratePrediction: data, loading: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to predict rate';
      set({ error: msg, loading: false });
    }
  },

  fetchFuelPrice: async (market) => {
    set({ loading: true, error: null });
    try {
      const data = await predictionsApi.getFuelPrice(market);
      set({ fuelPrice: data, loading: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch fuel price';
      set({ error: msg, loading: false });
    }
  },

  fetchFuelCost: async (market, distance) => {
    set({ loading: true, error: null });
    try {
      const data = await predictionsApi.getFuelCost(market, distance);
      set({ fuelCost: data, loading: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to estimate fuel cost';
      set({ error: msg, loading: false });
    }
  },

  fetchDemandHeatmap: async (market) => {
    set({ loading: true, error: null });
    try {
      const data = await predictionsApi.getDemandHeatmap(market);
      set({ demandHeatmap: data, loading: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch demand heatmap';
      set({ error: msg, loading: false });
    }
  },

  fetchDemandForecast: async (body) => {
    set({ loading: true, error: null });
    try {
      const data = await predictionsApi.getDemandForecast(body);
      set({ demandForecast: data, loading: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch demand forecast';
      set({ error: msg, loading: false });
    }
  },

  clear: () =>
    set({
      ratePrediction: null,
      fuelPrice: null,
      fuelCost: null,
      demandHeatmap: [],
      demandForecast: [],
      loading: false,
      error: null,
    }),
}));
