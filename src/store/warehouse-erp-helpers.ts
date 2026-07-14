import { getAvailableStock } from "@/mock/inventory";
import { INVENTORY_ITEMS } from "@/mock/inventory";
import type { InventoryItem } from "@/types/inventory.types";
import type {
  ErpActivityLog,
  ErpAllocation,
  ErpDispatch,
  HubInventoryEntry,
} from "@/types/erp.types";
import type {
  AllocationWorkflowResult,
  InventoryActivity,
  InventoryActivityStatus,
  MaterialAllocationItem,
  MaterialAllocationStatus,
  Requisition,
  RequisitionListItem,
  TransferListItem,
  TransferStatus,
} from "@/types/warehouse.types";

const TRANSFER_STATUS_LABELS: Record<TransferStatus, string> = {
  DRAFT: "Draft",
  TRANSFER_CREATED: "Pending Dispatch",
  LOADING: "Loading",
  READY_FOR_DISPATCH: "Ready to Dispatch",
  IN_TRANSIT: "In Transit",
  REACHED_HUB: "Reached Hub",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const OUTBOUND_ACTIVITY_LABELS: Partial<Record<TransferStatus, string>> = {
  TRANSFER_CREATED: "Pending Dispatch",
  LOADING: "Loading at Warehouse",
  READY_FOR_DISPATCH: "Ready to Dispatch",
  IN_TRANSIT: "In Transit to Hub",
  REACHED_HUB: "Reached Sub-Hub",
  DELIVERED: "Delivered to Hub",
};

function getTransferActivityStatus(
  transfer: TransferListItem,
): InventoryActivityStatus {
  if (transfer.status === "DELIVERED" || transfer.status === "REACHED_HUB") {
    return "completed";
  }
  if (transfer.status === "IN_TRANSIT" || transfer.status === "LOADING") {
    return "processing";
  }
  if (transfer.status === "TRANSFER_CREATED") {
    return "pending";
  }
  return "verified";
}

function getTransferActivityTime(transfer: TransferListItem): string {
  const timestamp =
    transfer.hubReceivedAt ??
    transfer.reachedHubAt ??
    transfer.dispatchAt ??
    transfer.loadingStartedAt ??
    transfer.createdAt;

  return new Date(timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getTransferMaterialLabel(transfer: TransferListItem): string {
  if (transfer.material) return transfer.material;
  const primary = transfer.materials[0];
  if (!primary) return "Mixed Materials";
  return primary.split(" x")[0]?.trim() ?? primary;
}

function getTransferQuantityLabel(transfer: TransferListItem): string {
  if (transfer.quantity && transfer.quantityUnit) {
    return `${transfer.quantity.toLocaleString("en-IN")} ${transfer.quantityUnit}`;
  }

  const match = transfer.materials[0]?.match(/x([\d,]+)/i);
  if (match?.[1]) {
    return `${match[1]} units`;
  }

  return "—";
}

export function transferToInventoryActivity(
  transfer: TransferListItem,
): InventoryActivity {
  return {
    id: transfer.id,
    time: getTransferActivityTime(transfer),
    activity:
      OUTBOUND_ACTIVITY_LABELS[transfer.status] ??
      TRANSFER_STATUS_LABELS[transfer.status],
    material: getTransferMaterialLabel(transfer),
    quantity: getTransferQuantityLabel(transfer),
    quantityChange: "negative",
    by: transfer.assignedDriver?.name ?? "Dispatch Ops",
    status: getTransferActivityStatus(transfer),
    transferId: transfer.transferId,
    destinationHub: transfer.destinationHub,
    sourceWarehouse: transfer.sourceWarehouse,
  };
}

export function buildOutboundTransferActivities(
  transfers: TransferListItem[],
  limit = 8,
): InventoryActivity[] {
  return transfers
    .filter(
      (transfer) =>
        transfer.status !== "DRAFT" && transfer.status !== "CANCELLED",
    )
    .sort(
      (left, right) =>
        new Date(right.dispatchAt ?? right.createdAt).getTime() -
        new Date(left.dispatchAt ?? left.createdAt).getTime(),
    )
    .slice(0, limit)
    .map(transferToInventoryActivity);
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString().slice(-8)}`;
}

export function generateAllocationId(): string {
  const suffix = Math.floor(9000 + Math.random() * 1000);
  return `ALC-${suffix}`;
}

export function resolveSku(materialId: string): string {
  const item = INVENTORY_ITEMS.find((entry) => entry.id === materialId);
  return item?.sku ?? "SKU-GEN-001";
}

export function resolveMaterialName(
  material: string,
  materialSpec?: string,
): string {
  return materialSpec ? `${material} (${materialSpec})` : material;
}

export function erpAllocationToMaterialItem(
  allocation: ErpAllocation,
): MaterialAllocationItem {
  const statusMap: Record<ErpAllocation["status"], MaterialAllocationStatus> = {
    PENDING: "NOT_ALLOCATED",
    INVENTORY_RESERVED: "PARTIALLY_ALLOCATED",
    COMPLETED: "ALLOCATED",
    CANCELLED: "NOT_ALLOCATED",
  };

  return {
    id: allocation.id,
    requestId: allocation.requestId,
    destinationHub: allocation.destinationHub,
    hubId: allocation.hubId,
    materialId: allocation.materialId,
    material: allocation.material,
    materialSpec: allocation.materialSpec,
    sku: allocation.sku,
    requestedQty: allocation.requestedQty,
    allocatedQty: allocation.reservedQty,
    unit: allocation.unit,
    priority: allocation.priority,
    status: statusMap[allocation.status] ?? "NOT_ALLOCATED",
    allocatedAt: allocation.completedAt,
  };
}

export function allocationToWorkflowResult(
  allocation: ErpAllocation,
  inventory: InventoryItem[],
): AllocationWorkflowResult {
  const item = inventory.find((entry) => entry.id === allocation.materialId);
  const warehouseRemaining = item ? getAvailableStock(item) : 0;

  return {
    allocationId: allocation.allocationId,
    requestId: allocation.requestId,
    destinationHub: allocation.destinationHub,
    quantity: allocation.reservedQty,
    unit: allocation.unit,
    material: resolveMaterialName(allocation.material, allocation.materialSpec),
    warehouseName: allocation.sourceWarehouse,
    batchLabel: allocation.batchLabel ?? "Batch A",
    warehouseRemaining,
    baseWeight: allocation.baseWeight,
    status: "COMPLETED",
    inventoryReserved: allocation.status === "COMPLETED",
  };
}

export function erpLogToInventoryActivity(
  log: ErpActivityLog,
): InventoryActivity {
  const isPositive = log.action.toLowerCase().includes("received");
  const isNegative =
    log.action.toLowerCase().includes("dispatch") ||
    log.action.toLowerCase().includes("reserved");

  return {
    id: log.id,
    time: new Date(log.timestamp).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    activity: log.action,
    material: log.remarks?.split("—")[0]?.trim() ?? log.module,
    quantity: isNegative ? "-qty" : isPositive ? "+qty" : "—",
    quantityChange: isNegative
      ? "negative"
      : isPositive
        ? "positive"
        : "neutral",
    by: log.user,
    status: log.action.includes("Completed") ? "completed" : "verified",
  };
}

export function requisitionToCriticalItem(
  item: RequisitionListItem,
): Requisition {
  return {
    id: item.id,
    requestId: item.requestId,
    hubName: item.hubName,
    material: resolveMaterialName(item.material, item.materialSpec),
    quantity: `${item.requestedQty} ${item.unit}`,
    priority: item.priority,
    href: item.href,
  };
}

export function buildDispatchFromTransfer(
  transfer: TransferListItem,
): ErpDispatch | null {
  if (!transfer.allocationId || !transfer.requisitionId) return null;

  const statusMap: Partial<
    Record<TransferListItem["status"], ErpDispatch["status"]>
  > = {
    TRANSFER_CREATED: "PENDING_DISPATCH",
    LOADING: "LOADING",
    READY_FOR_DISPATCH: "READY_FOR_DISPATCH",
    IN_TRANSIT: "DISPATCHED",
    REACHED_HUB: "DISPATCHED",
    DELIVERED: "COMPLETED",
  };

  const status = statusMap[transfer.status] ?? "PENDING_DISPATCH";

  return {
    id: `disp-${transfer.transferId}`,
    dispatchId: `DSP-${transfer.transferId.replace(/^TRN-/, "")}`,
    transferId: transfer.transferId,
    allocationId: transfer.allocationId,
    requestId: transfer.requisitionId,
    materialId: "unknown",
    material: transfer.material ?? transfer.materials[0] ?? "Material",
    quantity: transfer.quantity ?? 0,
    unit: transfer.quantityUnit ?? "units",
    warehouse: transfer.sourceWarehouse,
    destinationHub: transfer.destinationHub,
    status,
    dispatchAt: transfer.dispatchAt,
    createdAt: transfer.createdAt,
  };
}

export function upsertHubInventory(
  entries: HubInventoryEntry[],
  entry: HubInventoryEntry,
): HubInventoryEntry[] {
  const existing = entries.find(
    (item) =>
      item.hubId === entry.hubId && item.materialId === entry.materialId,
  );

  if (!existing) {
    return [...entries, entry];
  }

  return entries.map((item) =>
    item.hubId === entry.hubId && item.materialId === entry.materialId
      ? {
          ...item,
          quantity: item.quantity + entry.quantity,
          lastUpdated: entry.lastUpdated ?? new Date().toISOString(),
        }
      : item,
  );
}
