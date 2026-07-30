import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  HubOrderAnalytics,
  HubOrderDashboard,
  HubOrderExportFormat,
  HubOrderFilters,
  HubOrderListResponse,
} from "@/types/hub-orders.types";

function buildOrderParams(
  filters: Partial<HubOrderFilters> & { page?: number; limit?: number },
) {
  const params: Record<string, string | number> = {};

  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  if (filters.tab && filters.tab !== "all") params.tab = filters.tab;
  if (filters.dateRange && filters.dateRange !== "custom") {
    params.dateRange = filters.dateRange;
  }
  if (filters.fromDate) params.fromDate = filters.fromDate;
  if (filters.toDate) params.toDate = filters.toDate;
  if (filters.paymentMethod && filters.paymentMethod !== "all") {
    params.paymentMethod = filters.paymentMethod;
  }
  if (filters.orderStatus && filters.orderStatus !== "all") {
    params.orderStatus = filters.orderStatus;
  }
  if (filters.paymentStatus && filters.paymentStatus !== "all") {
    params.paymentStatus = filters.paymentStatus;
  }
  if (filters.customerType && filters.customerType !== "all") {
    params.customerType = filters.customerType;
  }
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.sortOrder) params.sortOrder = filters.sortOrder;

  return params;
}

export const hubOrdersService = {
  getDashboard: async (hubId: string): Promise<HubOrderDashboard> => {
    const { data } = await api.get<ApiResponse<HubOrderDashboard>>(
      API_ENDPOINTS.SUBHUB.ORDERS_DASHBOARD(hubId),
    );
    return data.data;
  },

  getAnalytics: async (hubId: string): Promise<HubOrderAnalytics> => {
    const { data } = await api.get<ApiResponse<HubOrderAnalytics>>(
      API_ENDPOINTS.SUBHUB.ORDERS_ANALYTICS(hubId),
    );
    return data.data;
  },

  list: async (
    hubId: string,
    filters: Partial<HubOrderFilters> & { page?: number; limit?: number },
  ): Promise<HubOrderListResponse> => {
    const { data } = await api.get<ApiResponse<HubOrderListResponse>>(
      API_ENDPOINTS.SUBHUB.ORDERS(hubId),
      { params: buildOrderParams(filters) },
    );
    return data.data;
  },

  listActive: async (
    hubId: string,
    filters: Partial<HubOrderFilters> & { page?: number; limit?: number },
  ): Promise<HubOrderListResponse> => {
    const { data } = await api.get<ApiResponse<HubOrderListResponse>>(
      API_ENDPOINTS.SUBHUB.ORDERS_ACTIVE(hubId),
      { params: buildOrderParams(filters) },
    );
    return data.data;
  },

  export: async (
    hubId: string,
    format: HubOrderExportFormat,
    filters: Partial<HubOrderFilters>,
  ): Promise<{ blob: Blob; filename: string }> => {
    const response = await api.get(API_ENDPOINTS.SUBHUB.ORDERS_EXPORT(hubId), {
      params: { ...buildOrderParams(filters), format },
      responseType: "blob",
    });
    const disposition = String(response.headers["content-disposition"] ?? "");
    const match = /filename="?([^"]+)"?/i.exec(disposition);
    const filename = match?.[1] ?? `hub-orders.${format}`;
    return { blob: response.data as Blob, filename };
  },
};

export async function downloadHubOrdersExport(
  hubId: string,
  format: HubOrderExportFormat,
  filters: Partial<HubOrderFilters>,
): Promise<void> {
  const { blob, filename } = await hubOrdersService.export(
    hubId,
    format,
    filters,
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
