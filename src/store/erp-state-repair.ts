import { MOCK_DATABASE_SEED } from "@/mock/mock-database";
import type { ErpAllocation, MockDatabase } from "@/types/erp.types";
import {
  needsSubHubNetworkPatch,
  patchSubHubNetworkState,
} from "@/store/sub-hub-state";
import {
  generateAllocationId,
  resolveSku,
} from "@/store/warehouse-erp-helpers";
import { normalizeTransferStatus } from "@/utils/transfer-actions";
import type {
  RequisitionListItem,
  TransferListItem,
} from "@/types/warehouse.types";

type ErpCollectionKey = keyof MockDatabase;

const ERP_COLLECTION_KEYS: ErpCollectionKey[] = [
  "requisitions",
  "allocations",
  "transfers",
  "dispatches",
  "inventory",
  "vehicles",
  "drivers",
  "hubInventory",
  "subHubs",
  "activityLogs",
];

function buildPendingAllocation(
  requisition: RequisitionListItem,
): ErpAllocation {
  return {
    id: `alloc-${requisition.id}`,
    allocationId: requisition.allocationId ?? generateAllocationId(),
    requestId: requisition.requestId.replace(/^#/, ""),
    requisitionId: requisition.id,
    warehouseId: requisition.warehouseId,
    sourceWarehouse: requisition.warehouseName,
    materialId: requisition.materialId,
    material: requisition.material,
    materialSpec: requisition.materialSpec,
    sku: requisition.sku ?? resolveSku(requisition.materialId),
    destinationHub: requisition.hubName,
    hubId: requisition.hubId,
    requestedQty: requisition.requestedQty,
    reservedQty: 0,
    unit: requisition.unit,
    priority: requisition.priority,
    status: "PENDING",
    createdAt: requisition.approvedAt ?? requisition.createdAt,
  };
}

/**
 * Ensures every APPROVED requisition awaiting allocation has a PENDING
 * ErpAllocation row so Allocation Center stays in sync with requisitions.
 */
export function repairPendingAllocations(
  requisitions: RequisitionListItem[],
  allocations: ErpAllocation[],
): ErpAllocation[] | null {
  const awaiting = requisitions.filter(
    (item) => item.status === "APPROVED" && item.allocationStatus === "PENDING",
  );

  if (awaiting.length === 0) return null;

  let dirty = false;
  const next = [...allocations];

  for (const requisition of awaiting) {
    const existingIndex = next.findIndex(
      (entry) => entry.requisitionId === requisition.id,
    );

    if (existingIndex === -1) {
      next.unshift(buildPendingAllocation(requisition));
      dirty = true;
      continue;
    }

    const existing = next[existingIndex];
    if (existing.status === "COMPLETED" || existing.status === "CANCELLED") {
      continue;
    }

    if (existing.status !== "PENDING") {
      next[existingIndex] = { ...existing, status: "PENDING", reservedQty: 0 };
      dirty = true;
    }
  }

  return dirty ? next : null;
}

export function repairErpStoreState(
  state: Partial<MockDatabase>,
): Partial<MockDatabase> | null {
  const patch: Record<string, unknown> = {};
  let dirty = false;

  for (const key of ERP_COLLECTION_KEYS) {
    const current = state[key];

    if (!Array.isArray(current)) {
      patch[key] = MOCK_DATABASE_SEED[key];
      dirty = true;
    }
  }

  if (needsSubHubNetworkPatch(state)) {
    Object.assign(patch, patchSubHubNetworkState(state));
    dirty = true;
  }

  if (Array.isArray(state.transfers)) {
    const normalizedTransfers = state.transfers.map((transfer) => {
      const normalized = normalizeTransferStatus(transfer.status);
      return normalized === transfer.status
        ? transfer
        : ({ ...transfer, status: normalized } as TransferListItem);
    });

    const needsNormalization = normalizedTransfers.some(
      (transfer, index) => transfer !== state.transfers![index],
    );

    if (needsNormalization) {
      patch.transfers = normalizedTransfers;
      dirty = true;
    }
  }

  const requisitions = (patch.requisitions ?? state.requisitions) as
    RequisitionListItem[] | undefined;
  const allocations = (patch.allocations ?? state.allocations) as
    ErpAllocation[] | undefined;

  if (Array.isArray(requisitions) && Array.isArray(allocations)) {
    // Hot-reload / stale sessions may still hold an empty pending queue from
    // the old seed. Prefer the rebuilt seed when it has pending rows and the
    // live store has none.
    const livePending = allocations.filter(
      (entry) => entry.status === "PENDING",
    ).length;
    const seedPending = MOCK_DATABASE_SEED.allocations.filter(
      (entry) => entry.status === "PENDING",
    ).length;

    if (livePending === 0 && seedPending > 0) {
      patch.allocations = MOCK_DATABASE_SEED.allocations;
      patch.requisitions = MOCK_DATABASE_SEED.requisitions;
      dirty = true;
    } else {
      const repairedAllocations = repairPendingAllocations(
        requisitions,
        (patch.allocations as ErpAllocation[] | undefined) ?? allocations,
      );
      if (repairedAllocations) {
        patch.allocations = repairedAllocations;
        dirty = true;
      }
    }
  }

  return dirty ? (patch as Partial<MockDatabase>) : null;
}
