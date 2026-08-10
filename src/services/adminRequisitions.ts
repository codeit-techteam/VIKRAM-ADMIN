import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ROUTES } from "@/constants/routes";
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
  hubId?: string;
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

export interface AdminRequisitionMaterial {
  id: string;
  productId: string;
  sku?: string | null;
  productName: string;
  requestedQty: number;
  approvedQty?: number | null;
  allocatedQty?: number | null;
  receivedQty?: number | null;
  availableStock?: number | null;
  warehouseStock?: number | null;
  minimumStock?: number | null;
  unit: string;
  unitPrice?: number;
  remarks?: string | null;
  status?: string;
  category?: string | null;
}

export interface AdminRequisitionTimelineStep {
  id: string;
  title: string;
  subtitle?: string;
  timestamp: string;
  status: "completed" | "active" | "pending";
}

export interface AdminRequisitionDetail {
  id: string;
  requestId: string;
  requestNo?: string;
  hubId: string;
  hubName: string;
  hubLocation?: string;
  priority: string;
  status: string;
  rawStatus?: string;
  expectedDate?: string;
  reason?: string;
  remarks?: string | null;
  rejectionReason?: string | null;
  warehouseId?: string | null;
  warehouseName?: string;
  date?: string;
  materials: AdminRequisitionMaterial[];
  timeline?: AdminRequisitionTimelineStep[];
  activityLogs?: Array<{
    id: string;
    who: string;
    action: string;
    role: string;
    at: string;
  }>;
  comments?: Array<{
    id: string;
    message: string;
    createdAt?: string;
    authorName?: string;
  }>;
  approval?: {
    approvedBy?: string | null;
    approvedAt?: string | null;
  };
  allocation?: {
    allocatedBy?: string | null;
    allocatedAt?: string | null;
    warehouseBin?: string | null;
    expectedDispatchDate?: string | null;
  };
  dispatch?: {
    vehicleRegistration?: string | null;
    driverName?: string | null;
    lrNumber?: string | null;
    dispatchedAt?: string | null;
    estimatedArrival?: string | null;
  };
  requestedBy?: string | { name: string; role: string };
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

function toIsoDate(value: string | Date | undefined | null): string {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  return value.toISOString();
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
    createdAt: toIsoDate(row.requestDate),
    allocationStatus: row.allocationStatus,
    href: `${ROUTES.CENTRAL_WAREHOUSE}/requisitions`,
  };
}

export function mapAdminDetailToListItem(
  detail: AdminRequisitionDetail,
): Partial<RequisitionListItem> {
  const first = detail.materials?.[0];
  const requestedBy =
    typeof detail.requestedBy === "object" && detail.requestedBy
      ? detail.requestedBy
      : {
          name:
            typeof detail.requestedBy === "string"
              ? detail.requestedBy
              : "Hub Manager",
          role: "HUB_MANAGER",
        };

  return {
    id: detail.id,
    requestId: detail.requestNo ?? detail.requestId,
    requestedBy,
    hubName: detail.hubName ?? detail.hubLocation ?? "",
    hubId: detail.hubId,
    warehouseId: detail.warehouseId ?? "",
    warehouseName: detail.warehouseName ?? "",
    materialId: first?.productId ?? "",
    material:
      detail.materials?.length === 1 && first
        ? first.productName
        : `${detail.materials?.length ?? 0} materials`,
    sku: first?.sku ?? undefined,
    requestedQty:
      detail.materials?.reduce((sum, item) => sum + item.requestedQty, 0) ?? 0,
    approvedQty: detail.materials?.reduce(
      (sum, item) => sum + (item.approvedQty ?? 0),
      0,
    ),
    unit: first?.unit ?? "Units",
    rejectionReason: detail.rejectionReason ?? undefined,
    adminRemarks: detail.remarks ?? undefined,
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

  stats: async (hubId?: string): Promise<AdminRequisitionStats> => {
    const { data } = await api.get<ApiResponse<AdminRequisitionStats>>(
      API_ENDPOINTS.ADMIN_REQUISITIONS.STATS,
      { params: hubId ? { hubId } : undefined },
    );
    return data.data;
  },

  getById: async (id: string): Promise<AdminRequisitionDetail> => {
    const { data } = await api.get<ApiResponse<AdminRequisitionDetail>>(
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
    const { data } = await api.patch<ApiResponse<AdminRequisitionDetail>>(
      API_ENDPOINTS.ADMIN_REQUISITIONS.APPROVE(id),
      payload,
    );
    return data.data;
  },

  reject: async (id: string, payload: { reason: string; comment?: string }) => {
    const { data } = await api.patch<ApiResponse<AdminRequisitionDetail>>(
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
      comment?: string;
    },
  ) => {
    const { data } = await api.patch<ApiResponse<AdminRequisitionDetail>>(
      API_ENDPOINTS.ADMIN_REQUISITIONS.ALLOCATE(id),
      payload,
    );
    return data.data;
  },

  assignLogistics: async (
    id: string,
    payload: {
      vehicleId?: string;
      driverId?: string;
      expectedDispatchDate?: string;
      comment?: string;
    },
  ) => {
    const { data } = await api.patch<ApiResponse<AdminRequisitionDetail>>(
      API_ENDPOINTS.ADMIN_REQUISITIONS.ASSIGN_LOGISTICS(id),
      payload,
    );
    return data.data;
  },

  dispatch: async (
    id: string,
    payload: {
      vehicleId?: string;
      driverId?: string;
      vehicleNumber?: string;
      driverName?: string;
      driverPhone?: string;
      eta?: string;
      comment?: string;
      lrNumber?: string;
      dispatchDate?: string;
      estimatedArrival?: string;
    },
  ) => {
    const { data } = await api.patch<ApiResponse<AdminRequisitionDetail>>(
      API_ENDPOINTS.ADMIN_REQUISITIONS.DISPATCH(id),
      {
        vehicleId: payload.vehicleId,
        driverId: payload.driverId,
        lrNumber: payload.lrNumber,
        dispatchDate: payload.dispatchDate,
        estimatedArrival: payload.estimatedArrival ?? payload.eta,
      },
    );
    return data.data;
  },

  addComment: async (id: string, message: string) => {
    const { data } = await api.post<ApiResponse<AdminRequisitionDetail>>(
      API_ENDPOINTS.ADMIN_REQUISITIONS.COMMENTS(id),
      { message },
    );
    return data.data;
  },

  exportCsv: async (id: string): Promise<Blob> => {
    const { data } = await api.get<Blob>(
      API_ENDPOINTS.ADMIN_REQUISITIONS.EXPORT(id),
      { responseType: "blob" },
    );
    return data;
  },
};
