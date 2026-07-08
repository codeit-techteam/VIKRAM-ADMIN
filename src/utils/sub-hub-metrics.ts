import { isTransferDelayed } from "@/mock/transfers";
import type {
  HubInventoryEntry,
  SubHub,
  SubHubOperationalStatus,
  SubHubStat,
  SubHubSummary,
  SubHubTableRow,
} from "@/types/erp.types";
import type {
  RequisitionListItem,
  TransferListItem,
} from "@/types/warehouse.types";

const IN_TRANSIT_STATUSES = new Set<TransferListItem["status"]>(["IN_TRANSIT"]);

export function isPendingRequisition(
  requisition: RequisitionListItem,
): boolean {
  return requisition.status === "PENDING" || requisition.status === "APPROVED";
}

export function isPendingOrder(requisition: RequisitionListItem): boolean {
  return (
    requisition.status === "ALLOCATED" || requisition.status === "TRANSFERRED"
  );
}

export function hasCriticalRequisitionPending(
  requisitions: RequisitionListItem[],
  hubId: string,
): boolean {
  return requisitions.some(
    (item) =>
      item.hubId === hubId &&
      item.priority === "critical" &&
      isPendingRequisition(item),
  );
}

export function getHubInventoryEntries(
  hubInventory: HubInventoryEntry[],
  hubId: string,
): HubInventoryEntry[] {
  return hubInventory.filter((entry) => entry.hubId === hubId);
}

export function computeMaterialHealth(
  quantity: number,
  minimumRequired: number,
): number {
  const minimum = minimumRequired > 0 ? minimumRequired : 1;
  const available = Number.isFinite(quantity) ? quantity : 0;
  return Math.round((available / minimum) * 100);
}

export function computeHubInventoryHealth(
  hubInventory: HubInventoryEntry[],
  hubId: string,
): number {
  const entries = getHubInventoryEntries(hubInventory, hubId);
  if (entries.length === 0) return 100;

  const total = entries.reduce(
    (sum, entry) =>
      sum + computeMaterialHealth(entry.quantity, entry.minimumRequired),
    0,
  );

  return Math.round(total / entries.length);
}

export function countLowStockMaterials(
  hubInventory: HubInventoryEntry[],
  hubId: string,
): number {
  return getHubInventoryEntries(hubInventory, hubId).filter(
    (entry) => entry.quantity < entry.minimumRequired,
  ).length;
}

export function isLowStockHub(
  hubInventory: HubInventoryEntry[],
  hubId: string,
): boolean {
  return countLowStockMaterials(hubInventory, hubId) > 0;
}

export function computeHubStockValue(
  hubInventory: HubInventoryEntry[],
  hubId: string,
): number {
  return getHubInventoryEntries(hubInventory, hubId).reduce(
    (sum, entry) => sum + entry.quantity * entry.purchasePrice,
    0,
  );
}

export function formatHubStockValue(value: number): string {
  if (value >= 10_000_000) {
    return `₹${(value / 10_000_000).toFixed(2)} Cr`;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatInventoryHealth(health: number): string {
  return `${health}%`;
}

export function getInventoryHealthColor(health: number): string {
  if (health >= 90) return "text-green-600";
  if (health >= 70) return "text-orange-500";
  return "text-red-600";
}

export function getInventoryHealthBarColor(health: number): string {
  if (health >= 90) return "bg-green-500";
  if (health >= 70) return "bg-orange-500";
  return "bg-red-500";
}

export function countDelayedTransfersForHub(
  transfers: TransferListItem[],
  hubId: string,
  reference = new Date(),
): number {
  return transfers.filter(
    (transfer) =>
      transfer.destinationHubId === hubId &&
      isTransferDelayed(transfer, reference),
  ).length;
}

export function countTransfersInTransitForHub(
  transfers: TransferListItem[],
  hubId: string,
): number {
  return transfers.filter(
    (transfer) =>
      transfer.destinationHubId === hubId &&
      IN_TRANSIT_STATUSES.has(transfer.status),
  ).length;
}

export function computeHubOperationalStatus(
  hubId: string,
  hubInventory: HubInventoryEntry[],
  transfers: TransferListItem[],
  requisitions: RequisitionListItem[],
  reference = new Date(),
): SubHubOperationalStatus {
  const inventoryHealth = computeHubInventoryHealth(hubInventory, hubId);
  const delayedTransfers = countDelayedTransfersForHub(
    transfers,
    hubId,
    reference,
  );
  const lowStockAlerts = countLowStockMaterials(hubInventory, hubId);
  const criticalPending = hasCriticalRequisitionPending(requisitions, hubId);

  if (inventoryHealth < 70 || delayedTransfers > 2 || criticalPending) {
    return "critical";
  }

  if (inventoryHealth < 90 || lowStockAlerts > 0 || delayedTransfers > 0) {
    return "warning";
  }

  return "healthy";
}

export function computeSubHubDashboardKpis(
  subHubs: SubHub[],
  hubInventory: HubInventoryEntry[],
  requisitions: RequisitionListItem[],
): SubHubStat[] {
  const activeHubs = subHubs.filter((hub) => hub.isActive);
  const pendingRequisitions = requisitions.filter(isPendingRequisition).length;
  const healthValues = activeHubs.map((hub) =>
    computeHubInventoryHealth(hubInventory, hub.id),
  );
  const averageHealth =
    healthValues.length > 0
      ? Math.round(
          healthValues.reduce((sum, value) => sum + value, 0) /
            healthValues.length,
        )
      : 100;
  const lowStockHubs = activeHubs.filter((hub) =>
    isLowStockHub(hubInventory, hub.id),
  ).length;

  return [
    {
      id: "total-active-sub-hubs",
      label: "Total Active Sub-Hubs",
      value: String(activeHubs.length),
      subtitle: `${subHubs.length - activeHubs.length} inactive in network`,
      icon: "active-hubs",
      variant: "default",
    },
    {
      id: "pending-requisitions",
      label: "Pending Requisitions",
      value: String(pendingRequisitions).padStart(2, "0"),
      subtitle: "Pending, approved, or awaiting allocation",
      icon: "pending-requisitions",
      variant: "default",
    },
    {
      id: "inventory-health",
      label: "Inventory Health",
      value: `${averageHealth}%`,
      subtitle: "Average health across active hubs",
      icon: "inventory-health",
      variant:
        averageHealth < 70
          ? "danger"
          : averageHealth < 90
            ? "warning"
            : "default",
    },
    {
      id: "low-stock-hubs",
      label: "Low Stock Hubs",
      value: String(lowStockHubs).padStart(2, "0"),
      subtitle: "Hubs below reorder level",
      icon: "low-stock-hubs",
      variant: lowStockHubs > 0 ? "warning" : "default",
    },
  ];
}

function buildHubMetrics(
  hub: SubHub,
  hubInventory: HubInventoryEntry[],
  transfers: TransferListItem[],
  requisitions: RequisitionListItem[],
) {
  const inventoryHealth = computeHubInventoryHealth(hubInventory, hub.id);
  const stockValue = computeHubStockValue(hubInventory, hub.id);
  const pendingOrders = requisitions.filter(
    (item) => item.hubId === hub.id && isPendingOrder(item),
  ).length;
  const pendingRequisitions = requisitions.filter(
    (item) => item.hubId === hub.id && isPendingRequisition(item),
  ).length;
  const transfersInTransit = countTransfersInTransitForHub(transfers, hub.id);
  const status = computeHubOperationalStatus(
    hub.id,
    hubInventory,
    transfers,
    requisitions,
  );

  return {
    inventoryHealth,
    stockValue,
    pendingOrders,
    pendingRequisitions,
    transfersInTransit,
    status,
  };
}

export function computeSubHubSummaries(
  subHubs: SubHub[],
  hubInventory: HubInventoryEntry[],
  transfers: TransferListItem[],
  requisitions: RequisitionListItem[],
  limit = 3,
): SubHubSummary[] {
  return subHubs
    .filter((hub) => hub.isActive)
    .map((hub) => {
      const metrics = buildHubMetrics(
        hub,
        hubInventory,
        transfers,
        requisitions,
      );

      return {
        hubId: hub.id,
        name: hub.name,
        city: hub.city,
        managerName: hub.managerName,
        stockValue: metrics.stockValue,
        stockValueLabel: formatHubStockValue(metrics.stockValue),
        pendingOrders: metrics.pendingOrders,
        inventoryHealth: metrics.inventoryHealth,
        lastInventorySync: hub.lastInventorySync,
        status: metrics.status,
      };
    })
    .sort((left, right) => right.stockValue - left.stockValue)
    .slice(0, limit);
}

export function computeSubHubTableRows(
  subHubs: SubHub[],
  hubInventory: HubInventoryEntry[],
  transfers: TransferListItem[],
  requisitions: RequisitionListItem[],
): SubHubTableRow[] {
  return subHubs
    .filter((hub) => hub.isActive)
    .map((hub) => {
      const metrics = buildHubMetrics(
        hub,
        hubInventory,
        transfers,
        requisitions,
      );

      return {
        hubId: hub.id,
        name: hub.name,
        nodeId: hub.nodeId,
        managerName: hub.managerName,
        city: hub.city,
        region: hub.region,
        inventoryHealth: metrics.inventoryHealth,
        pendingOrders: metrics.pendingOrders,
        pendingRequisitions: metrics.pendingRequisitions,
        transfersInTransit: metrics.transfersInTransit,
        status: metrics.status,
        isActive: hub.isActive,
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function formatLastSync(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
