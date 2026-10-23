import { apiClient } from './client';

interface DashboardStats { activeLoads: number; totalRevenue: number; loadsThisWeek: number; milesThisWeek: number; revenueThisMonth: number; pendingLoads: number; }

export const dashboardApi = {
  getDashboard: async (): Promise<DashboardStats> => {
    const res = await apiClient.get<DashboardStats>('/dashboard');
    return res.data;
  },
};
