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
  MaterialAllocationItem,
  MaterialAllocationStatus,
  Requisition,
  RequisitionListItem,
  TransferListItem,
} from "@/types/warehouse.types";

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
