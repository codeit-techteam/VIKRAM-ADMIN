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

export interface AdminDashboardOrders {
  total: number;
  today: number;
  pending: number;
  processing: number;
  accepted?: number;
  readyToDispatch: number;
  completed: number;
  cancelled: number;
  delivered?: number;
}

export interface AdminDashboardPayload {
  customers: { total: number };
  orders: AdminDashboardOrders;
  revenue: { total: number | string };
  memberships: { active: number };
  loyalty: { totalPointsIssued: number };
  bulkProcurement: { total: number };
  emergencyOrders: { total: number };
  cms: {
    testimonials: number;
    activeProducts: number;
    categories: number;
    activeVideos: number;
    banners: number;
    notifications: number;
    activeOffers?: number;
  };
  recentOrders?: Array<{
    id: string;
    orderNumber: string;
    orderStatus: string;
    statusLabel?: string;
    paymentStatus?: string;
    grandTotal?: number | string;
    createdAt: string;
    customer?: { id?: string; fullName?: string | null; phone?: string } | null;
    hub?: { id?: string; code?: string; name?: string } | null;
  }>;
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

  getAdminDashboard: async (): Promise<AdminDashboardPayload> => {
    const { data } = await api.get<ApiResponse<AdminDashboardPayload>>(
      API_ENDPOINTS.DASHBOARD.ADMIN,
    );
    return data.data;
  },
};
