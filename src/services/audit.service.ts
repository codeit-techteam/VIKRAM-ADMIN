import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import type { ApiResponse } from "@/types/api";

export interface AuditLogItem {
  id: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  adminEmail?: string | null;
  adminUserId?: string | null;
  createdAt: string;
  newValue?: unknown;
  oldValue?: unknown;
}

export const auditService = {
  list: async (params?: {
    resource?: string;
    action?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: AuditLogItem[]; meta?: unknown }> => {
    const { data } = await api.get<
      ApiResponse<{ data: AuditLogItem[]; meta?: unknown }>
    >(API_ENDPOINTS.ADMIN_AUDIT.BASE, {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        resource: params?.resource,
        action: params?.action,
      },
    });

    return {
      items: data.data?.data ?? [],
      meta: data.data?.meta,
    };
  },
};
