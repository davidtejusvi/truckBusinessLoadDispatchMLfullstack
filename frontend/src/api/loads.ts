import { apiClient } from './client';
import type { Load, SearchFilters, LoadStats } from '../types/load';

interface SearchParams extends Partial<SearchFilters> {
  market?: string;
}

interface LoadsResponse {
  loads: Load[];
  total: number;
  market?: string;
  filters?: object;
}

interface LoadStatsResponse {
  stats: LoadStats;
}

interface LoadDetailResponse {
  load: Load;
}

export const loadsApi = {
  searchLoads: async (params: SearchParams): Promise<LoadsResponse> => {
    const res = await apiClient.get<LoadsResponse>('/loads/search', { params });
    return res.data;
  },

  getLoadById: async (id: string): Promise<LoadDetailResponse> => {
    const res = await apiClient.get<LoadDetailResponse>(`/loads/${id}`);
    return res.data;
  },

  pickLoad: async (id: string): Promise<{ message: string; load: Load }> => {
    const res = await apiClient.post<{ message: string; load: Load }>(`/loads/pick/${id}`);
    return res.data;
  },

  getActiveLoads: async (): Promise<LoadsResponse> => {
    const res = await apiClient.get<LoadsResponse>('/loads/active');
    return res.data;
  },

  getLoadStats: async (): Promise<LoadStatsResponse> => {
    const res = await apiClient.get<LoadStatsResponse>('/loads/stats');
    return res.data;
  },
};
