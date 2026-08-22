import { apiClient } from '../api/axiosInstance';
import { DashboardOverview } from '../types';

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    const res = await apiClient.get('/dashboard/overview');
    return res.data.data;
  },
};
