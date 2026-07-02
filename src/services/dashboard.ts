import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import type { ApiResponse } from "@/types/api";

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  pendingDeliveries: number;
}

export interface DashboardChartData {
  label: string;
  value: number;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get<ApiResponse<DashboardStats>>(
      API_ENDPOINTS.DASHBOARD.STATS,
    );
    return data.data;
  },

  getCharts: async (): Promise<DashboardChartData[]> => {
    const { data } = await api.get<ApiResponse<DashboardChartData[]>>(
      API_ENDPOINTS.DASHBOARD.CHARTS,
    );
    return data.data;
  },

  getRecentActivity: async (): Promise<unknown[]> => {
    const { data } = await api.get<ApiResponse<unknown[]>>(
      API_ENDPOINTS.DASHBOARD.RECENT_ACTIVITY,
    );
    return data.data;
  },
};
