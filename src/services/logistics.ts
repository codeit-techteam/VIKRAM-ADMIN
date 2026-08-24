import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  CriticalShipment,
  CustomerDelivery,
  DispatchRecord,
  LogisticsDashboardStats,
  MaintenanceRecord,
  PaginationMeta,
  ShipmentTimeline,
  WarehouseShipment,
} from "@/types/logistics.types";

async function unwrap<T>(
  promise: Promise<{ data: ApiResponse<T> }>,
): Promise<T> {
  const res = await promise;
  return res.data.data;
}

export interface LogisticsFilterOption {
  id: string;
  name: string;
  code?: string;
  city?: string | null;
}

export interface LogisticsFiltersResponse {
  warehouses: LogisticsFilterOption[];
  hubs: LogisticsFilterOption[];
}

export interface WarehouseLogisticsParams {
  search?: string;
  warehouseId?: string;
  hubId?: string;
  destinationHubId?: string;
  priority?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CustomerLogisticsParams {
  search?: string;
  hubId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface DispatchLogisticsParams {
  search?: string;
  source?: string;
  status?: string;
  assignment?: string;
  page?: number;
  limit?: number;
}

export interface MaintenanceLogisticsParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface WarehouseLogisticsResponse {
  data: WarehouseShipment[];
  stats: {
    transfersToday: number;
    pending: number;
    loading: number;
    inTransit: number;
    delayed: number;
    completed: number;
  };
  meta: PaginationMeta;
}

export interface CustomerLogisticsResponse {
  data: CustomerDelivery[];
  stats: {
    ordersReady: number;
    outForDelivery: number;
    delivered: number;
    failed: number;
    returned: number;
  };
  meta: PaginationMeta;
}

export interface DispatchLogisticsResponse {
  data: DispatchRecord[];
  stats: {
    pending: number;
    todaysDispatches: number;
    driversWaiting: number;
    vehiclesWaiting: number;
  };
  meta: PaginationMeta;
}

export interface MaintenanceLogisticsResponse {
  data: MaintenanceRecord[];
  stats: {
    scheduled: number;
    inMaintenance: number;
    completed: number;
    overdue: number;
  };
  meta: PaginationMeta;
}

export type LogisticsDashboardResponse = LogisticsDashboardStats & {
  criticalShipments: CriticalShipment[];
};

export const logisticsService = {
  getFilters: () =>
    unwrap(
      api.get<ApiResponse<LogisticsFiltersResponse>>(
        API_ENDPOINTS.LOGISTICS.FILTERS,
      ),
    ),

  getDashboard: () =>
    unwrap(
      api.get<ApiResponse<LogisticsDashboardResponse>>(
        API_ENDPOINTS.LOGISTICS.DASHBOARD,
      ),
    ),

  getWarehouse: (params: WarehouseLogisticsParams = {}) =>
    unwrap(
      api.get<ApiResponse<WarehouseLogisticsResponse>>(
        API_ENDPOINTS.LOGISTICS.WAREHOUSE,
        { params },
      ),
    ),

  getCustomer: (params: CustomerLogisticsParams = {}) =>
    unwrap(
      api.get<ApiResponse<CustomerLogisticsResponse>>(
        API_ENDPOINTS.LOGISTICS.CUSTOMER,
        { params },
      ),
    ),

  getDispatch: (params: DispatchLogisticsParams = {}) =>
    unwrap(
      api.get<ApiResponse<DispatchLogisticsResponse>>(
        API_ENDPOINTS.LOGISTICS.DISPATCH,
        { params },
      ),
    ),

  getMaintenance: (params: MaintenanceLogisticsParams = {}) =>
    unwrap(
      api.get<ApiResponse<MaintenanceLogisticsResponse>>(
        API_ENDPOINTS.LOGISTICS.MAINTENANCE,
        { params },
      ),
    ),

  trackShipment: async (shipmentId: string): Promise<ShipmentTimeline> =>
    unwrap(
      api.get<ApiResponse<ShipmentTimeline>>(
        API_ENDPOINTS.LOGISTICS.TRACKING(shipmentId),
      ),
    ),

  assignWarehouseLogistics: async (
    requisitionId: string,
    payload: { vehicleId?: string; driverId?: string },
  ) =>
    unwrap(
      api.patch<ApiResponse<unknown>>(
        API_ENDPOINTS.ADMIN_REQUISITIONS.ASSIGN_LOGISTICS(requisitionId),
        payload,
      ),
    ),

  assignOrderDriver: async (
    orderId: string,
    payload: { driverId: string; vehicleId?: string },
  ) =>
    unwrap(
      api.patch<ApiResponse<unknown>>(
        API_ENDPOINTS.ADMIN_ORDERS.ASSIGN_DRIVER(orderId),
        payload,
      ),
    ),

  completeMaintenance: async (vehicleId: string) =>
    unwrap(
      api.patch<ApiResponse<unknown>>(
        API_ENDPOINTS.ADMIN_VEHICLES.STATUS(vehicleId),
        { status: "AVAILABLE", reason: "Maintenance completed" },
      ),
    ),

  startMaintenance: async (
    vehicleId: string,
    payload?: { maintenanceReason?: string; maintenanceExpectedAt?: string },
  ) =>
    unwrap(
      api.patch<ApiResponse<unknown>>(
        API_ENDPOINTS.ADMIN_VEHICLES.STATUS(vehicleId),
        {
          status: "MAINTENANCE",
          reason: "Marked for maintenance",
          maintenanceReason: payload?.maintenanceReason ?? "General maintenance",
          maintenanceExpectedAt: payload?.maintenanceExpectedAt,
        },
      ),
    ),
};
