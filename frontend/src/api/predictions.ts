import { apiClient } from './client';

export type Market = 'USA' | 'EUROPE';

export interface RateParams {
  market: Market;
  equipmentType: string;
  distance: number;
  dayOfWeek: number;
  fuelPrice: number;
}

export interface ForecastBody {
  origin: string;
  destination: string;
  market: Market;
  days: number;
}

// POST /predictions/rate (backend proxies to the ML service /predict/rate).
export interface RatePrediction {
  predicted_rate: number;
  confidence_low: number;
  confidence_high: number;
  currency: string;
}

export interface FuelTrendPoint {
  date: string;
  price: number;
}

// GET /predictions/fuel/:market -> current price + 7-day trend.
export interface FuelPriceResponse {
  price: number;
  currency: string;
  unit: string;
  trend: FuelTrendPoint[];
}

// GET /predictions/fuel-cost -> estimated fuel cost for a trip.
export interface FuelCostResponse {
  fuel_cost: number;
  fuel_price: number;
  currency: string;
  unit: string;
  fuel_efficiency: string;
}

// GET /predictions/demand/:market -> top-15 lane demand objects.
export interface DemandLane {
  lane: string;
  origin: string;
  destination: string;
  demand_score: number;
  load_count: number;
  avg_rate: number;
}

// POST /predictions/demand/forecast -> 7-day per-day demand forecast for a lane.
export interface DemandForecastDay {
  date: string;
  predicted_loads: number;
  predicted_avg_rate: number;
  confidence: number;
}

export const predictionsApi = {
  getRatePrediction: async (params: RateParams): Promise<RatePrediction> => {
    const res = await apiClient.get<RatePrediction>('/predictions/rate', { params });
    return res.data;
  },

  getFuelPrice: async (market: Market): Promise<FuelPriceResponse> => {
    const res = await apiClient.get<FuelPriceResponse>(`/predictions/fuel/${market}`);
    return res.data;
  },

  getFuelCost: async (market: Market, distance: number): Promise<FuelCostResponse> => {
    const res = await apiClient.get<FuelCostResponse>('/predictions/fuel-cost', {
      params: { market, distance },
    });
    return res.data;
  },

  getDemandHeatmap: async (market: Market): Promise<DemandLane[]> => {
    const res = await apiClient.get<DemandLane[]>(`/predictions/demand/${market}`);
    return res.data;
  },

  getDemandForecast: async (body: ForecastBody): Promise<DemandForecastDay[]> => {
    const res = await apiClient.post<DemandForecastDay[]>('/predictions/demand/forecast', body);
    return res.data;
  },
};
