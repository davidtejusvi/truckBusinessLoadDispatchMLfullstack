import { apiClient } from './client';
import type { Load } from '../store/loadsStore';

interface SearchParams { market?: string; origin?: string; destination?: string; equipmentType?: string; }
interface LoadsResponse { loads: Load[]; total: number; }

export const loadsApi = {
  searchLoads: async (params: SearchParams): Promise<LoadsResponse> => {
    const res = await apiClient.get<LoadsResponse>('/loads/search', { params });
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
};
