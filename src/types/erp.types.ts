import type { InventoryItem } from "@/types/inventory.types";
import type {
  AllocationWorkflowResult,
  FleetDriver,
  FleetVehicle,
  InventoryActivity,
  RequisitionListItem,
  RequisitionPriority,
  TransferListItem,
} from "@/types/warehouse.types";

export type ErpAllocationStatus =
  "PENDING" | "INVENTORY_RESERVED" | "COMPLETED" | "CANCELLED";

export type ErpDispatchStatus =
  | "PENDING_DISPATCH"
  | "LOADING"
  | "READY_FOR_DISPATCH"
  | "DISPATCHED"
  | "COMPLETED";

export interface ErpAllocation {
  id: string;
  allocationId: string;
  requestId: string;
  requisitionId: string;
  warehouseId: string;
  sourceWarehouse: string;
  materialId: string;
  material: string;
  materialSpec?: string;
  sku: string;
  destinationHub: string;
  hubId: string;
  requestedQty: number;
  reservedQty: number;
  unit: string;
  priority: RequisitionPriority;
  status: ErpAllocationStatus;
  createdAt: string;
  completedAt?: string;
  remarks?: string;
  batchLabel?: string;
  baseWeight?: number;
}

export interface ErpDispatch {
  id: string;
  dispatchId: string;
  transferId: string;
  allocationId: string;
  requestId: string;
  materialId: string;
  material: string;
  quantity: number;
  unit: string;
  warehouse: string;
  destinationHub: string;
  status: ErpDispatchStatus;
  dispatchAt?: string;
  createdAt: string;
}

export interface ErpActivityLog {
  id: string;
  timestamp: string;
  user: string;
  module: string;
  action: string;
  remarks?: string;
  entityId?: string;
  entityType?: string;
}

export interface HubInventoryEntry {
  hubId: string;
  hubName: string;
  materialId: string;
  materialName: string;
  sku: string;
  quantity: number;
  minimumRequired: number;
  purchasePrice: number;
  unit: string;
  lastUpdated?: string;
  /** Optional seed override; otherwise derived from active orders/allocations. */
  reservedQty?: number;
  category?: string;
  safetyStock?: number;
  maxStock?: number;
  reorderLevel?: number;
}

export type HubStockStatus =
  | "healthy"
  | "low-stock"
  | "critical"
  | "reserved"
  | "out-of-stock"
  | "overstock";

export type HubHealthGrade = "excellent" | "healthy" | "warning" | "critical";

export type SubHubOperationalStatus = "healthy" | "warning" | "critical";

export type SubHubStatIcon =
  | "active-hubs"
  | "pending-requisitions"
  | "inventory-health"
  | "low-stock-hubs";

export interface SubHubStat {
  id: string;
  label: string;
  value: string;
  subtitle: string;
  icon: SubHubStatIcon;
  variant?: "default" | "warning" | "danger";
}

export interface SubHub {
  id: string;
  name: string;
  city: string;
  region: string;
  managerName: string;
  nodeId: string;
  isActive: boolean;
  lastInventorySync: string;
  address?: string;
  managerPhone?: string;
  managerEmail?: string;
  hubSince?: string;
  capacityMt?: number;
  capacitySqFt?: number;
  workingHours?: string;
  hubType?: string;
  hubTypeLabel?: string;
  coverageRadiusKm?: number;
  linkedWarehouseId?: string;
  linkedWarehouseName?: string;
  fulfillmentPriority?: string;
  servicePincodes?: string[];
  deliverySlots?: string[];
  autoRestocking?: boolean;
  allowedCategories?: string[];
}

export interface SubHubSummary {
  hubId: string;
  name: string;
  city: string;
  managerName: string;
  stockValue: number;
  stockValueLabel: string;
  pendingOrders: number;
  pendingRequisitions: number;
  incomingTransfers: number;
  outgoingTransfers: number;
  inventoryHealth: number;
  healthScore: number;
  lastInventorySync: string;
  status: SubHubOperationalStatus;
}

export interface SubHubTableRow {
  hubId: string;
  name: string;
  nodeId: string;
  managerName: string;
  city: string;
  region: string;
  inventoryHealth: number;
  healthScore: number;
  pendingOrders: number;
  pendingRequisitions: number;
  incomingTransfers: number;
  outgoingTransfers: number;
  transfersInTransit: number;
  status: SubHubOperationalStatus;
  isActive: boolean;
}

export type OperationsAlertSeverity = "default" | "warning" | "critical";

export interface OperationsAlert {
  id: string;
  label: string;
  count: number;
  href: string;
  severity: OperationsAlertSeverity;
}

export type HubActivityCategory =
  | "transfer"
  | "inventory"
  | "order"
  | "requisition"
  | "dispatch"
  | "allocation";

export interface HubActivityEvent {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  category: HubActivityCategory;
  actor?: string;
}

export interface MockDatabase {
  requisitions: RequisitionListItem[];
  allocations: ErpAllocation[];
  transfers: TransferListItem[];
  dispatches: ErpDispatch[];
  inventory: InventoryItem[];
  vehicles: FleetVehicle[];
  drivers: FleetDriver[];
  hubInventory: HubInventoryEntry[];
  subHubs: SubHub[];
  activityLogs: ErpActivityLog[];
}

export interface CompleteAllocationParams {
  requisitionId: string;
  warehouseId: string;
  warehouseName: string;
  allocationQty: number;
  batchLabel?: string;
  remarks?: string;
  adminName?: string;
  baseWeight?: number;
}

export interface CompleteAllocationResult {
  allocation: ErpAllocation;
  workflowResult: AllocationWorkflowResult;
}

export type { InventoryActivity };
