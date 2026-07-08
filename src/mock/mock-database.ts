import { activities as SEED_ACTIVITIES } from "@/mock/warehouse-dashboard";
import { INVENTORY_ITEMS } from "@/mock/inventory";
import { REQUISITION_LIST } from "@/mock/requisitions";
import { TRANSFER_LIST } from "@/mock/transfers";
import { FLEET_DRIVERS, FLEET_VEHICLES } from "@/mock/transfer-fleet";
import { buildSeedHubInventory, SUB_HUBS } from "@/mock/sub-hubs";
import {
  buildDispatchFromTransfer,
  generateAllocationId,
  resolveSku,
} from "@/store/warehouse-erp-helpers";
import type {
  ErpActivityLog,
  ErpAllocation,
  MockDatabase,
} from "@/types/erp.types";
import type { RequisitionListItem } from "@/types/warehouse.types";

function enrichRequisition(item: RequisitionListItem): RequisitionListItem {
  return {
    ...item,
    sku: resolveSku(item.materialId),
    approvedQty:
      item.status === "APPROVED" ||
      item.status === "ALLOCATED" ||
      item.status === "TRANSFERRED" ||
      item.status === "COMPLETED"
        ? item.requestedQty
        : undefined,
  };
}

function buildAllocationFromRequisition(
  requisition: RequisitionListItem,
): ErpAllocation {
  const allocationId = generateAllocationId();
  const isCompleted =
    requisition.allocationStatus === "ALLOCATED" ||
    requisition.status === "ALLOCATED" ||
    requisition.status === "TRANSFERRED" ||
    requisition.status === "COMPLETED";

  return {
    id: `alloc-${requisition.id}`,
    allocationId,
    requestId: requisition.requestId.replace(/^#/, ""),
    requisitionId: requisition.id,
    warehouseId: requisition.warehouseId,
    sourceWarehouse: requisition.warehouseName,
    materialId: requisition.materialId,
    material: requisition.material,
    materialSpec: requisition.materialSpec,
    sku: resolveSku(requisition.materialId),
    destinationHub: requisition.hubName,
    hubId: requisition.hubId,
    requestedQty: requisition.requestedQty,
    reservedQty: isCompleted ? requisition.requestedQty : 0,
    unit: requisition.unit,
    priority: requisition.priority,
    status: isCompleted ? "COMPLETED" : "PENDING",
    createdAt: requisition.createdAt,
    completedAt: isCompleted ? requisition.createdAt : undefined,
  };
}

function buildSeedAllocations(
  requisitions: RequisitionListItem[],
): ErpAllocation[] {
  const approved = requisitions.filter(
    (item) =>
      item.status === "APPROVED" ||
      item.status === "ALLOCATED" ||
      item.status === "TRANSFERRED" ||
      item.status === "COMPLETED",
  );

  const registrySeeds: ErpAllocation[] = [
    {
      id: "alloc-registry-9578",
      allocationId: "ALC-9578",
      requestId: "REQ-9404-IN",
      requisitionId: "req-9404",
      warehouseId: "wh-central-sector-62",
      sourceWarehouse: "Central Warehouse - Sector 62",
      materialId: "inv-006",
      material: "PPC Cement",
      materialSpec: "43 Grade",
      sku: "SKU-CEM-0043-STD",
      destinationHub: "Manesar Plant",
      hubId: "hub-manesar",
      requestedQty: 314,
      reservedQty: 314,
      unit: "Bags",
      priority: "high",
      status: "COMPLETED",
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      batchLabel: "Batch B-2024",
      baseWeight: 15700,
    },
    {
      id: "alloc-registry-9821",
      allocationId: "ALC-9821",
      requestId: "REQ-8812",
      requisitionId: "req-8812",
      warehouseId: "wh-central-sector-62",
      sourceWarehouse: "Central Warehouse - Sector 62",
      materialId: "inv-005",
      material: "TMT Steel Rods",
      materialSpec: "12mm",
      sku: "SKU-STL-0016-IND",
      destinationHub: "Gurgaon North",
      hubId: "hub-gurgaon-north",
      requestedQty: 450,
      reservedQty: 450,
      unit: "Bundles",
      priority: "critical",
      status: "COMPLETED",
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      batchLabel: "Batch A-2024",
      baseWeight: 5400,
    },
    {
      id: "alloc-registry-9104",
      allocationId: "ALC-9104",
      requestId: "REQ-8756",
      requisitionId: "req-8756",
      warehouseId: "wh-noida-central",
      sourceWarehouse: "Noida Central Warehouse",
      materialId: "inv-002",
      material: "UltraTech Cement",
      materialSpec: "OPC 53 Grade",
      sku: "SKU-CEM-0053-ULT",
      destinationHub: "Noida Sector 62",
      hubId: "hub-noida-62",
      requestedQty: 300,
      reservedQty: 300,
      unit: "Bags",
      priority: "medium",
      status: "COMPLETED",
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      batchLabel: "Batch C-118",
      baseWeight: 15000,
    },
  ];

  const linkedTransferAllocationIds = new Set(
    TRANSFER_LIST.map((transfer) => transfer.allocationId).filter(Boolean),
  );

  const fromRequisitions = approved
    .filter((item) => item.allocationStatus !== "NOT_APPLICABLE")
    .map((item) => {
      const allocation = buildAllocationFromRequisition(item);
      const linkedTransfer = TRANSFER_LIST.find(
        (transfer) =>
          transfer.requisitionId === item.requestId.replace(/^#/, ""),
      );
      if (linkedTransfer?.allocationId) {
        allocation.allocationId = linkedTransfer.allocationId;
      }
      return allocation;
    });

  const withoutDuplicates = registrySeeds.filter(
    (seed) =>
      !fromRequisitions.some(
        (item) => item.allocationId === seed.allocationId,
      ) && !linkedTransferAllocationIds.has(seed.allocationId),
  );

  return [...withoutDuplicates, ...fromRequisitions];
}

function buildSeedActivityLogs(): ErpActivityLog[] {
  const seedFromDashboard: ErpActivityLog[] = SEED_ACTIVITIES.map(
    (activity, index) => ({
      id: activity.id ?? `seed-act-${index}`,
      timestamp: new Date().toISOString(),
      user: activity.by,
      module: "Inventory",
      action: activity.activity,
      remarks: `${activity.material} — ${activity.quantity}`,
    }),
  );

  return seedFromDashboard;
}

export function createMockDatabase(): MockDatabase {
  const requisitions = REQUISITION_LIST.map(enrichRequisition);
  const transfers = structuredClone(TRANSFER_LIST);
  const allocations = buildSeedAllocations(requisitions);

  const requisitionsWithLinks = requisitions.map((item) => {
    const allocation = allocations.find(
      (entry) => entry.requisitionId === item.id,
    );
    const transfer = transfers.find(
      (entry) =>
        entry.requisitionId === item.requestId.replace(/^#/, "") ||
        entry.allocationId === allocation?.allocationId,
    );

    if (!allocation && !transfer) return item;

    return {
      ...item,
      allocationId: allocation?.allocationId,
      transferId: transfer?.transferId,
      status:
        transfer?.status === "DELIVERED"
          ? ("COMPLETED" as const)
          : transfer
            ? ("TRANSFERRED" as const)
            : allocation?.status === "COMPLETED"
              ? ("ALLOCATED" as const)
              : item.status,
      allocationStatus:
        allocation?.status === "COMPLETED"
          ? ("ALLOCATED" as const)
          : item.allocationStatus,
    };
  });

  const dispatches = transfers
    .map(buildDispatchFromTransfer)
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return {
    requisitions: requisitionsWithLinks,
    allocations,
    transfers,
    dispatches,
    inventory: structuredClone(INVENTORY_ITEMS),
    vehicles: structuredClone(FLEET_VEHICLES),
    drivers: structuredClone(FLEET_DRIVERS),
    hubInventory: buildSeedHubInventory(SUB_HUBS),
    subHubs: structuredClone(SUB_HUBS),
    activityLogs: buildSeedActivityLogs(),
  };
}

export const MOCK_DATABASE_SEED = createMockDatabase();
