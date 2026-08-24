import { API_ENDPOINTS } from "@/constants/api-endpoints";
import api from "@/services/api";
import type { ApiResponse, PaginationMeta } from "@/types/api";
import type { InventoryItem, InventoryStats } from "@/types/inventory.types";
import type {
  InventoryActivity,
  LowStockItem,
  MaterialAllocationItem,
  RequisitionListItem,
  RequisitionPriority,
  TransferListItem,
  WarehouseStat,
} from "@/types/warehouse.types";

interface ListParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  destinationHubId?: string;
  hubId?: string;
}

interface WarehouseInventoryRow extends Omit<InventoryItem, "status"> {
  reservedStock: number;
  availableStock: number;
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
}

export interface WarehouseInventoryResponse {
  data: InventoryItem[];
  stats: InventoryStats;
  meta: PaginationMeta;
  warehouse: { id: string; code: string; name: string };
}

export interface WarehouseDashboardResponse {
  stats: WarehouseStat[];
  criticalRequisitions: RequisitionListItem[];
  lowStockAlerts: LowStockItem[];
  activities: InventoryActivity[];
  counters: Record<string, number>;
}

interface RawDashboard {
  stats: WarehouseStat[];
  criticalRequisitions: Array<{
    id: string;
    requestId: string;
    hubName: string;
    material: string;
    quantity: string;
    priority: RequisitionPriority;
    href: string;
  }>;
  lowStockAlerts: LowStockItem[];
  activities: Array<{
    id: string;
    productName: string;
    type: string;
    quantity: string;
    createdBy?: string | null;
    timestamp: string;
  }>;
  counters: Record<string, number>;
}

interface RawAllocation {
  id: string;
  requisitionId: string;
  requestId: string;
  hubId: string;
  hubName: string;
  status: "APPROVED" | "ALLOCATED";
  priority: string;
  material: string;
  sku?: string;
  requestedQty: number;
  allocatedQty: number;
  unit: string;
  warehouseAvailable?: number | null;
  allocatedAt?: string;
  items?: Array<{ productId: string }>;
}

function withMeta(meta: PaginationMeta): PaginationMeta {
  return {
    ...meta,
    hasNextPage: meta.page < meta.totalPages,
    hasPreviousPage: meta.page > 1,
  };
}

function priority(value: string): RequisitionPriority {
  if (value === "URGENT" || value === "critical") return "critical";
  if (value === "HIGH" || value === "high") return "high";
  if (value === "LOW" || value === "low") return "low";
  return "medium";
}

export const warehouseService = {
  getDashboard: async (): Promise<WarehouseDashboardResponse> => {
    const { data } = await api.get<ApiResponse<RawDashboard>>(
      API_ENDPOINTS.WAREHOUSE.DASHBOARD,
    );
    const payload = data.data;
    return {
      ...payload,
      criticalRequisitions: payload.criticalRequisitions.map((row) => {
        const quantity = row.quantity.match(/^([\d.]+)\s*(.*)$/);
        return {
          id: row.id,
          requestId: row.requestId,
          requestedBy: { name: "Hub Manager", role: "HUB_MANAGER" },
          hubName: row.hubName,
          hubId: "",
          warehouseId: "",
          warehouseName: "Central Warehouse",
          materialId: "",
          material: row.material,
          requestedQty: Number(quantity?.[1] ?? 0),
          unit: quantity?.[2] || "units",
          priority: row.priority,
          status: "PENDING",
          allocationStatus: "PENDING",
          createdAt: new Date().toISOString(),
          href: row.href,
        };
      }),
      activities: payload.activities.map((row) => ({
        id: row.id,
        time: new Date(row.timestamp).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        activity: row.type.replaceAll("_", " "),
        material: row.productName,
        quantity: row.quantity,
        quantityChange: row.quantity.startsWith("-") ? "negative" : "positive",
        by: row.createdBy || "System",
        status: "completed",
      })),
    };
  },

  listInventory: async (
    params?: ListParams,
  ): Promise<WarehouseInventoryResponse> => {
    const { data } = await api.get<
      ApiResponse<{
        data: WarehouseInventoryRow[];
        stats: InventoryStats;
        meta: PaginationMeta;
        warehouse: { id: string; code: string; name: string };
      }>
    >(API_ENDPOINTS.WAREHOUSE.INVENTORY, { params });
    return {
      ...data.data,
      data: data.data.data.map((row) => ({
        ...row,
        committedStock: row.committedStock ?? row.reservedStock,
        status:
          row.status === "IN_STOCK"
            ? "in-stock"
            : row.status === "LOW_STOCK"
              ? "low-stock"
              : "out-of-stock",
      })),
      meta: withMeta(data.data.meta),
    };
  },

  exportInventory: async (params?: ListParams): Promise<Blob> => {
    const { data } = await api.get<Blob>(
      API_ENDPOINTS.WAREHOUSE.INVENTORY_EXPORT,
      { params, responseType: "blob" },
    );
    return data;
  },

  listAllocations: async (
    params?: ListParams,
  ): Promise<{ data: MaterialAllocationItem[]; meta: PaginationMeta }> => {
    const { data } = await api.get<
      ApiResponse<{ data: RawAllocation[]; meta: PaginationMeta }>
    >(API_ENDPOINTS.WAREHOUSE.ALLOCATIONS, { params });
    return {
      data: data.data.data.map((row) => ({
        id: row.requisitionId || row.id,
        requestId: row.requestId,
        destinationHub: row.hubName,
        hubId: row.hubId,
        materialId: row.items?.[0]?.productId ?? "",
        material: row.material,
        sku: row.sku ?? "—",
        requestedQty: row.requestedQty,
        allocatedQty: row.allocatedQty,
        unit: row.unit,
        priority: priority(row.priority),
        status:
          row.status === "ALLOCATED"
            ? "ALLOCATED"
            : row.allocatedQty > 0
              ? "PARTIALLY_ALLOCATED"
              : "NOT_ALLOCATED",
        allocatedAt: row.allocatedAt,
        availableStock: row.warehouseAvailable ?? 0,
      })),
      meta: withMeta(data.data.meta),
    };
  },

  listTransfers: async (
    params?: ListParams,
  ): Promise<{
    data: TransferListItem[];
    stats: Record<string, number>;
    meta: PaginationMeta;
  }> => {
    const { data } = await api.get<
      ApiResponse<{
        data: TransferListItem[];
        stats: Record<string, number>;
        meta: PaginationMeta;
      }>
    >(API_ENDPOINTS.WAREHOUSE.TRANSFERS, { params });
    return { ...data.data, meta: withMeta(data.data.meta) };
  },

  getTransfer: async (id: string): Promise<TransferListItem> => {
    const { data } = await api.get<ApiResponse<TransferListItem>>(
      API_ENDPOINTS.WAREHOUSE.TRANSFER_BY_ID(id),
    );
    return data.data;
  },
};
