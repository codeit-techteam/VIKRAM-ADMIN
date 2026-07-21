import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { SubHubManager } from "@/features/user-management/types/sub-hub-manager.types";

export interface ApiHubOption {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  pincode?: string;
  phone?: string;
}

export interface ApiHubManager {
  id: string;
  name: string;
  fullName: string;
  employeeId: string;
  email: string | null;
  mobile: string | null;
  phone: string | null;
  role: string;
  hubId: string;
  hubName: string;
  hubCode: string;
  city: string;
  state: string;
  status: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHubManagerPayload {
  fullName: string;
  employeeId?: string;
  email: string;
  phone: string;
  password: string;
  hubId: string;
  isActive?: boolean;
}

export interface CreateHubManagerResponse extends ApiHubManager {
  credentials?: { employeeId: string; password: string };
}

export function mapApiManagerToSubHubManager(
  manager: ApiHubManager,
): SubHubManager {
  return {
    id: manager.id,
    employeeId: manager.employeeId,
    name: manager.name,
    phone: manager.mobile ?? manager.phone ?? "",
    email: manager.email ?? "",
    hubId: manager.hubId,
    hubName: manager.hubName,
    hubCode: manager.hubCode,
    warehouse: `${manager.city} Regional Warehouse`,
    region: manager.state,
    city: manager.city,
    status: manager.isActive ? "ACTIVE" : "LEAVE",
    pendingRequisitions: 0,
    pendingDispatches: 0,
    todayOrders: 0,
    lowStockItems: 0,
    availableDrivers: 0,
    totalDrivers: 0,
    joiningDate: manager.createdAt,
  };
}

export const hubManagerService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    hubId?: string;
  }): Promise<PaginatedResponse<SubHubManager>> => {
    const { data } = await api.get<
      ApiResponse<{
        data: ApiHubManager[];
        meta: PaginatedResponse<SubHubManager>["meta"];
      }>
    >(API_ENDPOINTS.HUB_MANAGERS.BASE, { params });
    return {
      data: data.data.data.map(mapApiManagerToSubHubManager),
      meta: data.data.meta,
    };
  },

  getById: async (id: string): Promise<SubHubManager> => {
    const { data } = await api.get<ApiResponse<ApiHubManager>>(
      API_ENDPOINTS.HUB_MANAGERS.BY_ID(id),
    );
    return mapApiManagerToSubHubManager(data.data);
  },

  listHubs: async (): Promise<ApiHubOption[]> => {
    const { data } = await api.get<ApiResponse<ApiHubOption[]>>(
      API_ENDPOINTS.HUB_MANAGERS.HUBS,
    );
    return data.data;
  },

  create: async (
    payload: CreateHubManagerPayload,
  ): Promise<CreateHubManagerResponse> => {
    const { data } = await api.post<ApiResponse<CreateHubManagerResponse>>(
      API_ENDPOINTS.HUB_MANAGERS.BASE,
      payload,
    );
    return data.data;
  },

  transferHub: async (
    id: string,
    hubId: string,
    reason?: string,
  ): Promise<SubHubManager> => {
    const { data } = await api.patch<ApiResponse<ApiHubManager>>(
      API_ENDPOINTS.HUB_MANAGERS.TRANSFER(id),
      { hubId, reason },
    );
    return mapApiManagerToSubHubManager(data.data);
  },

  deactivate: async (id: string): Promise<SubHubManager> => {
    const { data } = await api.patch<ApiResponse<ApiHubManager>>(
      API_ENDPOINTS.HUB_MANAGERS.DEACTIVATE(id),
    );
    return mapApiManagerToSubHubManager(data.data);
  },

  reactivate: async (id: string): Promise<SubHubManager> => {
    const { data } = await api.patch<ApiResponse<ApiHubManager>>(
      API_ENDPOINTS.HUB_MANAGERS.REACTIVATE(id),
    );
    return mapApiManagerToSubHubManager(data.data);
  },

  resetPassword: async (
    id: string,
    password?: string,
  ): Promise<{ managerId: string; temporaryPassword: string }> => {
    const { data } = await api.patch<
      ApiResponse<{ managerId: string; temporaryPassword: string }>
    >(API_ENDPOINTS.HUB_MANAGERS.RESET_PASSWORD(id), { password });
    return data.data;
  },
};
