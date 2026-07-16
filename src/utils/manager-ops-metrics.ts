import type {
  SubHubManager,
  ManagerStatus,
} from "@/features/user-management/types/sub-hub-manager.types";
import type { HubInventoryEntry } from "@/types/erp.types";
import type { LogisticsDriver } from "@/types/logistics.types";
import type {
  RequisitionListItem,
  TransferListItem,
} from "@/types/warehouse.types";
import {
  countLowStockMaterials,
  countPendingCustomerOrdersForHub,
  isPendingRequisition,
} from "@/utils/sub-hub-metrics";
import {
  DISPATCH_QUEUE_STATUSES,
  normalizeTransferStatus,
} from "@/utils/transfer-actions";

/** Map Sub-Hub Network hub names → logistics assignedHub labels */
const HUB_TO_LOGISTICS: Record<string, string[]> = {
  "hub-gurgaon-north": ["Gurgaon Sector 14 Hub", "Gurgaon Central"],
  "hub-gurgaon-west": ["Gurgaon Sector 14 Hub"],
  "hub-sohna-road": ["Gurgaon Sector 14 Hub"],
  "hub-noida-62": ["Noida Sector 62 Hub"],
  "hub-noida-north": ["Noida Sector 62 Hub"],
  "hub-delhi-south": ["South Delhi Hub"],
  "hub-dwarka": ["South Delhi Hub"],
  "hub-faridabad-east": ["Faridabad Hub"],
  "hub-manesar": ["Ghaziabad Hub", "Faridabad Hub"],
  "hub-manesar-site": ["Ghaziabad Hub"],
  "hub-jaipur-west": ["Ghaziabad Hub"],
};

function computeStatus(input: {
  pendingRequisitions: number;
  pendingDispatches: number;
  lowStockItems: number;
  todayOrders: number;
  isOnLeave: boolean;
}): ManagerStatus {
  if (input.isOnLeave) return "LEAVE";
  if (input.pendingDispatches > 15 || input.todayOrders > 40) return "BUSY";
  if (input.pendingRequisitions > 5 || input.lowStockItems > 10)
    return "ATTENTION";
  return "ACTIVE";
}

function countPendingDispatchesForHub(
  transfers: TransferListItem[],
  hubId: string,
): number {
  return transfers.filter(
    (transfer) =>
      transfer.destinationHubId === hubId &&
      DISPATCH_QUEUE_STATUSES.includes(
        normalizeTransferStatus(transfer.status),
      ),
  ).length;
}

function getDriversForHub(drivers: LogisticsDriver[], hubId: string) {
  const labels = HUB_TO_LOGISTICS[hubId] ?? [];
  if (labels.length === 0) return [];
  return drivers.filter((driver) =>
    labels.some(
      (label) =>
        driver.assignedHub === label ||
        driver.assignedHub.toLowerCase().includes(label.toLowerCase()) ||
        label.toLowerCase().includes(driver.assignedHub.toLowerCase()),
    ),
  );
}

export interface ManagerOpsContext {
  hubInventory: HubInventoryEntry[];
  requisitions: RequisitionListItem[];
  transfers: TransferListItem[];
  drivers: LogisticsDriver[];
}

/**
 * Overlay live hub / logistics metrics onto manager records so cards and
 * tables show data that matches Sub-Hub Network + fleet stores.
 */
export function enrichManagersWithOps(
  managers: SubHubManager[],
  ctx: ManagerOpsContext,
): SubHubManager[] {
  return managers.map((manager) => {
    if (!manager.hubId) return manager;

    const pendingRequisitions = ctx.requisitions.filter(
      (item) => item.hubId === manager.hubId && isPendingRequisition(item),
    ).length;

    const pendingDispatches = countPendingDispatchesForHub(
      ctx.transfers,
      manager.hubId,
    );

    const todayOrders = countPendingCustomerOrdersForHub(
      ctx.requisitions,
      manager.hubId,
    );

    const lowStockItems = countLowStockMaterials(
      ctx.hubInventory,
      manager.hubId,
    );

    const hubDrivers = getDriversForHub(ctx.drivers, manager.hubId);
    const totalDrivers =
      hubDrivers.length > 0 ? hubDrivers.length : manager.totalDrivers;
    const availableDrivers =
      hubDrivers.length > 0
        ? hubDrivers.filter((d) => d.status === "available").length
        : manager.availableDrivers;

    const isOnLeave = manager.status === "LEAVE";
    const status = computeStatus({
      pendingRequisitions,
      pendingDispatches,
      lowStockItems,
      todayOrders,
      isOnLeave,
    });

    return {
      ...manager,
      pendingRequisitions,
      pendingDispatches,
      todayOrders,
      lowStockItems,
      availableDrivers,
      totalDrivers,
      status,
    };
  });
}

export function managerNeedsAttention(manager: SubHubManager): boolean {
  return (
    manager.pendingRequisitions > 5 ||
    manager.lowStockItems > 10 ||
    manager.pendingDispatches > 15
  );
}
