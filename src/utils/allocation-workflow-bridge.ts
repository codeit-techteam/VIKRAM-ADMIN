import { ALLOCATION_LIST } from "@/mock/allocations";
import { getWorkflowRequisitionSeed } from "@/mock/allocation-workflow";
import { ROUTES } from "@/constants/routes";
import type {
  MaterialAllocationItem,
  RequisitionListItem,
} from "@/types/warehouse.types";

export function materialAllocationToRequisition(
  item: MaterialAllocationItem,
): RequisitionListItem {
  const remainingQty = Math.max(0, item.requestedQty - item.allocatedQty);
  const requestId = item.requestId.startsWith("#")
    ? item.requestId
    : `#${item.requestId}`;

  return {
    id: item.id,
    requestId,
    requestedBy: { name: "Approved Requisition", role: "Central Warehouse" },
    hubName: item.destinationHub.replace(/ Hub$/, ""),
    hubId: item.hubId,
    warehouseId: "wh-central-sector-62",
    warehouseName: "Central Warehouse - Sector 62",
    materialId: item.materialId,
    material: item.material,
    materialSpec: item.materialSpec,
    requestedQty: remainingQty > 0 ? remainingQty : item.requestedQty,
    unit: item.unit,
    priority: item.priority,
    status: "APPROVED",
    allocationStatus: "PENDING",
    createdAt: item.allocatedAt ?? new Date().toISOString(),
    href: `${ROUTES.CENTRAL_WAREHOUSE}/requisitions/${item.id}`,
  };
}

export function resolveWorkflowRequisitionFromAllocationId(
  allocationId: string,
): RequisitionListItem | null {
  const item = ALLOCATION_LIST.find((entry) => entry.id === allocationId);
  if (!item || item.status === "ALLOCATED") return null;
  return materialAllocationToRequisition(item);
}

export function mergeRequisitionIntoWorkflowList(
  requisition: RequisitionListItem,
  existing: RequisitionListItem[] = getWorkflowRequisitionSeed(),
): RequisitionListItem[] {
  const normalizedId = requisition.requestId.replace(/^#/, "");
  const filtered = existing.filter(
    (item) =>
      item.id !== requisition.id &&
      item.requestId.replace(/^#/, "") !== normalizedId,
  );
  return [requisition, ...filtered];
}
