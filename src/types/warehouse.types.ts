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

export type WarehouseStockStatus = "OPTIMAL" | "MODERATE" | "EMPTY" | "LOW";

export interface WorkflowWarehouse {
  id: string;
  name: string;
  location: string;
  stock: number;
  status: WarehouseStockStatus;
  leadTimeHours: number;
  insight?: string;
}

export interface MaterialBatch {
  id: string;
  label: string;
  available: number;
  expiresInDays?: number;
  clearanceNote?: string;
}

export interface MaterialWorkflowDetail {
  materialId: string;
  name: string;
  spec?: string;
  sku: string;
  grade: string;
  category: string;
  categoryLabel: string;
  specifications: string[];
  unit: string;
  unitDensity?: number;
}

export type AllocationWorkflowStep = 1 | 2 | 3 | 4 | 5;

export interface AllocationWorkflowFormValues {
  warehouseSourceId: string;
  batchId: string;
  allocationQty: number;
  remarks: string;
}

export type AllocationTransferStatus = "COMPLETED";

export interface AllocationWorkflowResult {
  allocationId: string;
  requestId: string;
  destinationHub: string;
  quantity: number;
  unit: string;
  material: string;
  warehouseName: string;
  batchLabel: string;
  warehouseRemaining: number;
  baseWeight?: number;
  status: AllocationTransferStatus;
  inventoryReserved: boolean;
}

export type TransferStatus =
  | "DRAFT"
  | "CREATED"
  | "VEHICLE_ASSIGNED"
  | "DRIVER_ASSIGNED"
  | "READY_FOR_DISPATCH"
  | "PENDING_DISPATCH"
  | "DISPATCH_STARTED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "HUB_RECEIVED"
  | "COMPLETED";

export type TransferTimelineEventType =
  | "TRANSFER_CREATED"
  | "VEHICLE_ASSIGNED"
  | "DRIVER_ASSIGNED"
  | "READY_FOR_DISPATCH"
  | "DISPATCH_STARTED"
  | "REACHED_DESTINATION"
  | "DELIVERED"
  | "HUB_RECEIVED"
  | "COMPLETED";

export interface TransferTimelineEvent {
  id: string;
  type: TransferTimelineEventType;
  label: string;
  timestamp: string;
  description?: string;
}

export interface TransferActivityLog {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  details?: string;
}

export interface TransferDocument {
  id: string;
  name: string;
  type: "gate-pass" | "dispatch-log" | "delivery-note" | "supporting";
  url: string;
  createdAt: string;
}

export type TransferType = "standard" | "critical" | "express";

export type FleetAvailability = "now" | "2hr" | "4hr";

export type FleetVehicleStatus =
  "idle" | "assigned" | "maintenance" | "in-transit";

export type FleetDriverStatus = "ready" | "assigned" | "on-duty" | "leave";

export interface FleetVehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  capacityKg: number;
  location: string;
  availability: FleetAvailability;
  status: FleetVehicleStatus;
}

export interface FleetDriver {
  id: string;
  name: string;
  employeeId: string;
  licenseType: string;
  experienceYears: number;
  rating: number;
  status: FleetDriverStatus;
  phone?: string;
  avatarInitials?: string;
}

export type TransferWorkflowStep = 1 | 2 | 3 | 4 | 5;

export interface TransferWorkflowContext {
  allocationId: string;
  requisitionId: string;
  material: string;
  sku: string;
  quantity: number;
  unit: string;
  sourceWarehouse: string;
  sourceWarehouseId: string;
  destinationHub: string;
  destinationHubId: string;
  estimatedWeightKg: number;
}

export interface TransferWorkflowFormValues {
  transferType: TransferType;
  dispatchDate: string;
  expectedArrival: string;
  logisticsRemarks: string;
  vehicleId: string;
  driverId: string;
}

export interface TransferWorkflowResult {
  transferId: string;
  allocationId: string;
  requisitionId: string;
  vehicleNumber?: string;
  driverName?: string;
  destinationHub: string;
  material: string;
  quantity: number;
  unit: string;
  status: "CREATED";
  createdAt: string;
}

export interface TransferDriver {
  name: string;
  employeeId: string;
}

export interface TransferListItem {
  id: string;
  transferId: string;
  allocationId?: string;
  requisitionId?: string;
  sourceWarehouseId: string;
  sourceWarehouse: string;
  destinationHubId: string;
  destinationHub: string;
  vehicleNumber?: string;
  vehicleId?: string;
  driverId?: string;
  assignedDriver?: TransferDriver;
  status: TransferStatus;
  transferType?: TransferType;
  priority?: TransferType;
  material?: string;
  sku?: string;
  quantity?: number;
  quantityUnit?: string;
  estimatedWeightKg?: number;
  logisticsRemarks?: string;
  dispatchDate?: string;
  expectedArrival?: string;
  createdAt: string;
  dispatchAt?: string;
  eta: string;
  deliveredAt?: string;
  hubReceivedAt?: string;
  completedAt?: string;
  gatePassId?: string;
  materials: string[];
  timeline: TransferTimelineEvent[];
  activityLogs: TransferActivityLog[];
  documents: TransferDocument[];
}

export interface TransferFilters {
  status: TransferStatus | "all" | "delayed";
  sourceWarehouseId: string;
  destinationHubId: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

export interface TransferStats {
  pendingDispatch: number;
  inTransit: number;
  deliveredToday: number;
  delayedTransfers: number;
}

export interface TransferQueryParams {
  page?: number;
  limit?: number;
  filters?: Partial<TransferFilters>;
}
