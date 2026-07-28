import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/types/api";
import type {
  RequisitionListItem,
  RequisitionPriority,
  RequisitionStatus,
} from "@/types/warehouse.types";

export interface AdminRequisitionListParams extends PaginationParams {
  search?: string;
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AdminRequisitionStats {
  pendingApproval: number;
  pendingRequests: number;
  criticalRequests: number;
  awaitingAllocation: number;
  inTransit: number;
  completed: number;
  rejected: number;
  openRequests: { value: number; badge: string };
  approvedRequests: { value: number; badge: string };
  delayedRequests: { value: number; badge: string };
}

interface BackendAdminRequisitionRow {
  id: string;
  requestId: string;
  requestNo: string;
  requestedBy: { name: string; role: string };
  hubName: string;
  hubId: string;
  warehouseId: string;
  warehouseName: string;
  materialId: string;
  material: string;
  sku?: string;
  requestedQty: number;
  approvedQty?: number;
  unit: string;
  priority: RequisitionPriority;
  status: RequisitionStatus;
  rawStatus?: string;
  requestDate: string;
  expectedDate?: string;
  estimatedValue: number;
  allocationStatus: "PENDING" | "ALLOCATED" | "NOT_APPLICABLE";
}

function mapListItem(row: BackendAdminRequisitionRow): RequisitionListItem {
  return {
    id: row.id,
    requestId: row.requestNo ?? row.requestId,
    requestedBy: row.requestedBy,
    hubName: row.hubName,
    hubId: row.hubId,
    warehouseId: row.warehouseId,
    warehouseName: row.warehouseName,
    materialId: row.materialId,
    material: row.material,
    sku: row.sku,
    requestedQty: row.requestedQty,
    approvedQty: row.approvedQty,
    unit: row.unit,
    priority: row.priority,
    status: row.status,
    requestDate: row.requestDate,
    expectedDate: row.expectedDate,
    estimatedValue: row.estimatedValue,
    allocationStatus: row.allocationStatus,
  };
}

export const adminRequisitionsService = {
  list: async (
    params?: AdminRequisitionListParams,
  ): Promise<PaginatedResponse<RequisitionListItem>> => {
    const { data } = await api.get<
      ApiResponse<PaginatedResponse<BackendAdminRequisitionRow>>
    >(API_ENDPOINTS.ADMIN_REQUISITIONS.BASE, { params });
    return {
      ...data.data,
      data: data.data.data.map(mapListItem),
    };
  },

  stats: async (): Promise<AdminRequisitionStats> => {
    const { data } = await api.get<ApiResponse<AdminRequisitionStats>>(
      API_ENDPOINTS.ADMIN_REQUISITIONS.STATS,
    );
    return data.data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.ADMIN_REQUISITIONS.BY_ID(id),
    );
    return data.data;
  },

  approve: async (
    id: string,
    payload: {
      items: Array<{ itemId: string; approvedQty: number }>;
      comment?: string;
    },
  ) => {
    const { data } = await api.patch<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.ADMIN_REQUISITIONS.APPROVE(id),
      payload,
    );
    return data.data;
  },

  reject: async (id: string, payload: { reason: string; comment?: string }) => {
    const { data } = await api.patch<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.ADMIN_REQUISITIONS.REJECT(id),
      payload,
    );
    return data.data;
  },

  allocate: async (
    id: string,
    payload: {
      items: Array<{ itemId: string; allocatedQty: number }>;
      warehouseBin?: string;
      vehicleId?: string;
      driverId?: string;
      expectedDispatchDate?: string;
    },
  ) => {
    const { data } = await api.patch<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.ADMIN_REQUISITIONS.ALLOCATE(id),
      payload,
    );
    return data.data;
  },

  dispatch: async (
    id: string,
    payload: {
      vehicleId?: string;
      driverId?: string;
      lrNumber?: string;
      dispatchDate?: string;
      estimatedArrival?: string;
    },
  ) => {
    const { data } = await api.patch<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.ADMIN_REQUISITIONS.DISPATCH(id),
      payload,
    );
    return data.data;
  },

  addComment: async (id: string, message: string) => {
    const { data } = await api.post<ApiResponse<Record<string, unknown>>>(
      API_ENDPOINTS.ADMIN_REQUISITIONS.COMMENTS(id),
      { message },
    );
    return data.data;
  },
};
