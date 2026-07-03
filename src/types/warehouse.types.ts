import type { LucideIcon } from "lucide-react";

export type WarehouseStatIcon =
  "inventory" | "requisitions" | "dispatch" | "low-stock";

export interface WarehouseStat {
  id: string;
  label: string;
  value: string;
  subtitle: string;
  icon: WarehouseStatIcon;
  variant?: "default" | "warning";
}

export type RequisitionPriority = "critical" | "high" | "medium" | "low";

export type RequisitionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type RequisitionAllocationStatus =
  "PENDING" | "ALLOCATED" | "NOT_APPLICABLE";

export interface RequisitionRequester {
  name: string;
  role: string;
}

export interface Requisition {
  id: string;
  requestId: string;
  hubName: string;
  material: string;
  quantity: string;
  priority: RequisitionPriority;
  href: string;
}

export interface RequisitionListItem {
  id: string;
  requestId: string;
  requestedBy: RequisitionRequester;
  hubName: string;
  hubId: string;
  warehouseId: string;
  warehouseName: string;
  materialId: string;
  material: string;
  materialSpec?: string;
  requestedQty: number;
  unit: string;
  priority: RequisitionPriority;
  status: RequisitionStatus;
  allocationStatus: RequisitionAllocationStatus;
  createdAt: string;
  href: string;
  customerName?: string;
  adminRemarks?: string;
  rejectionReason?: string;
}

export type RequisitionFilterChip =
  | "all"
  | "critical"
  | "pending"
  | "approved"
  | "rejected"
  | "today"
  | "last-7-days";

export interface RequisitionAdvancedFilters {
  priority: RequisitionPriority | "all";
  status: RequisitionStatus | "all";
  hubId: string;
  warehouseId: string;
  material: string;
  requestedBy: string;
  dateFrom: string;
  dateTo: string;
}

export interface RequisitionStats {
  pendingRequests: number;
  criticalRequests: number;
  awaitingAllocation: number;
  todaysRequests: number;
}

export interface RequisitionQueryParams {
  page?: number;
  limit?: number;
  chip?: RequisitionFilterChip;
  advanced?: Partial<RequisitionAdvancedFilters>;
  search?: string;
}

export type RequisitionAttachmentType =
  "purchase-sheet" | "quotation" | "supporting-document";

export interface RequisitionAttachment {
  id: string;
  name: string;
  type: RequisitionAttachmentType;
  url: string;
  mimeType: string;
}

export type RequisitionAuditAction = "APPROVE" | "REJECT";

export interface RequisitionAuditEntry {
  id: string;
  requisitionId: string;
  adminName: string;
  action: RequisitionAuditAction;
  date: string;
  time: string;
  remarks?: string;
}

export interface RequisitionDetail extends RequisitionListItem {
  customerName?: string;
  region: string;
  destinationWarehouse: string;
  assignedWarehouse: string;
  sku: string;
  category: string;
  requestReason: string;
  attachments: RequisitionAttachment[];
  adminRemarks?: string;
  rejectionReason?: string;
}

export interface RequisitionApprovalPayload {
  adminName: string;
  remarks?: string;
}

export interface RequisitionRejectionPayload {
  adminName: string;
  remarks: string;
}

export type InventoryActivityStatus =
  "completed" | "verified" | "processing" | "pending";

export type QuantityChangeType = "positive" | "negative" | "neutral";

export interface InventoryActivity {
  id: string;
  time: string;
  activity: string;
  material: string;
  quantity: string;
  quantityChange: QuantityChangeType;
  by: string;
  status: InventoryActivityStatus;
}

export type LowStockSeverity = "critical" | "warning";

export interface LowStockItem {
  id: string;
  productName: string;
  currentStock: string;
  minimumStock: string;
  severity: LowStockSeverity;
}

export type WarehouseQuickActionIcon =
  | "receive-stock"
  | "approve-requisition"
  | "allocate-inventory"
  | "create-transfer"
  | "inventory-management"
  | "dispatch-control";

export interface WarehouseQuickAction {
  id: string;
  label: string;
  icon: WarehouseQuickActionIcon;
  href: string;
}

export type WarehouseIconMap<T extends string> = Record<T, LucideIcon>;

export type MaterialAllocationStatus =
  "NOT_ALLOCATED" | "PARTIALLY_ALLOCATED" | "ALLOCATED";

export type StockAvailabilityLevel = "enough" | "low" | "out-of-stock";

export interface MaterialAllocationItem {
  id: string;
  requestId: string;
  destinationHub: string;
  hubId: string;
  materialId: string;
  material: string;
  materialSpec?: string;
  sku: string;
  requestedQty: number;
  allocatedQty: number;
  unit: string;
  priority: RequisitionPriority;
  status: MaterialAllocationStatus;
  allocatedAt?: string;
}

export interface AllocationStats {
  pendingAllocation: number;
  criticalAllocation: number;
  allocatedToday: number;
  outOfStock: number;
}

export interface WarehouseSource {
  id: string;
  label: string;
}

export interface AllocationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  priority?: RequisitionPriority | "all";
  status?: MaterialAllocationStatus | "all";
}

export interface AllocationFormValues {
  warehouseSourceId: string;
  allocationQty: number;
  remarks?: string;
}

export interface AllocationPayload {
  allocationId: string;
  warehouseSourceId: string;
  allocationQty: number;
  remarks?: string;
  adminName: string;
}
