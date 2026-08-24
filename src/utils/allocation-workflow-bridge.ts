import {
  adminRequisitionsService,
  mapAdminDetailToListItem,
} from "@/services/adminRequisitions";
import { useWarehouseErpStore } from "@/store/warehouse-erp-store";
import { ROUTES } from "@/constants/routes";
import type {
  MaterialAllocationItem,
  RequisitionListItem,
  RequisitionPriority,
  RequisitionStatus,
} from "@/types/warehouse.types";

function asPriority(value: string | undefined): RequisitionPriority {
  const normalized = (value ?? "").toLowerCase();
  if (
    normalized === "critical" ||
    normalized === "high" ||
    normalized === "medium" ||
    normalized === "low"
  ) {
    return normalized;
  }
  return "medium";
}

function asStatus(value: string | undefined): RequisitionStatus {
  const normalized = (value ?? "").toUpperCase();
  const allowed: RequisitionStatus[] = [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "ALLOCATED",
    "TRANSFERRED",
    "COMPLETED",
  ];
  return (allowed.includes(normalized as RequisitionStatus)
    ? normalized
    : "APPROVED") as RequisitionStatus;
}

export function materialAllocationToRequisition(
  item: MaterialAllocationItem,
): RequisitionListItem {
  const remainingQty = Math.max(0, item.requestedQty - item.allocatedQty);
  const requestId = item.requestId.startsWith("#")
    ? item.requestId
    : item.requestId.startsWith("REQ-")
      ? item.requestId
      : `#${item.requestId}`;

  return {
    id: item.id,
    requestId,
    requestedBy: { name: "Approved Requisition", role: "Central Warehouse" },
    hubName: item.destinationHub.replace(/ Hub$/, ""),
    hubId: item.hubId,
    warehouseId: "central-warehouse",
    warehouseName: "Main Warehouse Gurugram",
    materialId: item.materialId,
    material: item.material,
    materialSpec: item.materialSpec,
    sku: item.sku,
    requestedQty: remainingQty > 0 ? remainingQty : item.requestedQty,
    unit: item.unit,
    priority: item.priority,
    status: "APPROVED",
    allocationStatus: "PENDING",
    createdAt: item.allocatedAt ?? new Date().toISOString(),
    href: `${ROUTES.CENTRAL_WAREHOUSE}/requisitions/${item.id}`,
  };
}

/**
 * Resolve a workflow requisition from the allocation deep-link param.
 * The param is typically the requisition UUID from the Allocation Center list.
 * Prefer live API; fall back to ERP store only for legacy mock IDs.
 */
export async function resolveWorkflowRequisitionFromAllocationId(
  allocationId: string,
): Promise<RequisitionListItem | null> {
  try {
    const detail = await adminRequisitionsService.getById(allocationId);
    const mapped = mapAdminDetailToListItem(detail);
    const rawStatus = (detail.rawStatus ?? detail.status ?? "").toUpperCase();

    // Only APPROVED requisitions are allocatable.
    if (rawStatus !== "APPROVED" && detail.status !== "APPROVED") {
      return null;
    }

    return {
      id: mapped.id ?? detail.id,
      requestId: mapped.requestId ?? detail.requestNo ?? detail.requestId,
      requestedBy: mapped.requestedBy ?? {
        name: "Hub Manager",
        role: "HUB_MANAGER",
      },
      hubName: mapped.hubName ?? detail.hubName,
      hubId: mapped.hubId ?? detail.hubId,
      warehouseId: mapped.warehouseId ?? detail.warehouseId ?? "",
      warehouseName:
        mapped.warehouseName ??
        detail.warehouseName ??
        "Main Warehouse Gurugram",
      materialId: mapped.materialId ?? detail.materials?.[0]?.productId ?? "",
      material: mapped.material ?? detail.materials?.[0]?.productName ?? "",
      sku: mapped.sku ?? detail.materials?.[0]?.sku ?? undefined,
      requestedQty:
        mapped.requestedQty ??
        detail.materials?.reduce((sum, item) => sum + item.requestedQty, 0) ??
        0,
      approvedQty: mapped.approvedQty,
      unit: mapped.unit ?? detail.materials?.[0]?.unit ?? "Units",
      priority: asPriority(detail.priority),
      status: asStatus(detail.status),
      allocationStatus: "PENDING",
      createdAt: detail.date ?? new Date().toISOString(),
      href: `${ROUTES.CENTRAL_WAREHOUSE}/requisitions/${detail.id}`,
    };
  } catch {
    // Fall through to ERP/mock resolution for legacy deep links.
  }

  const state = useWarehouseErpStore.getState();
  const allocation =
    state.getAllocationRecordById(allocationId) ??
    state.allocations.find((entry) => entry.id === allocationId);

  if (allocation?.status === "COMPLETED") {
    return null;
  }

  if (allocation) {
    const requisition = state.requisitions.find(
      (item) => item.id === allocation.requisitionId,
    );
    if (!requisition) return null;

    return {
      ...requisition,
      status: "APPROVED",
      allocationStatus: "PENDING",
      requestedQty: requisition.requestedQty,
    };
  }

  const materialItem = state
    .getMaterialAllocations()
    .find((entry) => entry.id === allocationId);
  if (!materialItem || materialItem.status === "ALLOCATED") return null;
  return materialAllocationToRequisition(materialItem);
}

export function mergeRequisitionIntoWorkflowList(
  requisition: RequisitionListItem,
  existing: RequisitionListItem[] = [],
): RequisitionListItem[] {
  const normalizedId = requisition.requestId.replace(/^#/, "");
  const filtered = existing.filter(
    (item) =>
      item.id !== requisition.id &&
      item.requestId.replace(/^#/, "") !== normalizedId,
  );
  return [requisition, ...filtered];
}
