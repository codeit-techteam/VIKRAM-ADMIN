import { isTransferDelayed } from "@/mock/transfers";
import { ROUTES } from "@/constants/routes";
import type {
  ErpActivityLog,
  ErpAllocation,
  ErpDispatch,
  HubActivityEvent,
  HubInventoryEntry,
  OperationsAlert,
  SubHub,
  SubHubOperationalStatus,
  SubHubStat,
  SubHubSummary,
  SubHubTableRow,
} from "@/types/erp.types";
import type {
  RequisitionListItem,
  TransferListItem,
  TransferTimelineEventType,
} from "@/types/warehouse.types";
import {
  DISPATCH_QUEUE_STATUSES,
  normalizeTransferStatus,
} from "@/utils/transfer-actions";

const IN_TRANSIT_STATUSES = new Set<TransferListItem["status"]>(["IN_TRANSIT"]);

const INCOMING_TRANSFER_STATUSES = new Set([
  "TRANSFER_CREATED",
  "LOADING",
  "READY_FOR_DISPATCH",
  "IN_TRANSIT",
  "REACHED_HUB",
  "DELIVERED",
]);

const HUB_TIMELINE_LABELS: Partial<Record<TransferTimelineEventType, string>> =
  {
    TRANSFER_CREATED: "Transfer Created",
    VEHICLE_ASSIGNED: "Vehicle Assigned",
    DRIVER_ASSIGNED: "Driver Assigned",
    LOADING_STARTED: "Loading Started",
    LOADING_COMPLETED: "Loading Completed",
    READY_FOR_DISPATCH: "Ready For Dispatch",
    DISPATCH_STARTED: "Dispatch Started",
    IN_TRANSIT: "In Transit",
    REACHED_HUB: "Reached Hub",
    DELIVERED: "Delivered",
    HUB_RECEIVED: "Transfer Received",
    COMPLETED: "Transfer Completed",
    DELAY_RECORDED: "Transfer Delayed",
  };

export function isPendingRequisition(
  requisition: RequisitionListItem,
): boolean {
  return requisition.status === "PENDING" || requisition.status === "APPROVED";
}

export function isPendingHubRequisition(
  requisition: RequisitionListItem,
): boolean {
  return isPendingRequisition(requisition);
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

export function countIncomingTransfersForHub(
  transfers: TransferListItem[],
  hubId: string,
): number {
  return transfers.filter(
    (transfer) =>
      transfer.destinationHubId === hubId &&
      INCOMING_TRANSFER_STATUSES.has(normalizeTransferStatus(transfer.status)),
  ).length;
}

export function countOutgoingTransfersForHub(
  requisitions: RequisitionListItem[],
  hubId: string,
): number {
  return requisitions.filter(
    (item) =>
      item.hubId === hubId &&
      (item.status === "TRANSFERRED" || item.status === "ALLOCATED"),
  ).length;
}

export function countPendingCustomerOrdersForHub(
  requisitions: RequisitionListItem[],
  hubId: string,
): number {
  return requisitions.filter(
    (item) => item.hubId === hubId && isPendingOrder(item),
  ).length;
}

export function countCriticalCustomerOrders(
  requisitions: RequisitionListItem[],
): number {
  return requisitions.filter(
    (item) =>
      item.priority === "critical" &&
      (isPendingOrder(item) || isPendingRequisition(item)),
  ).length;
}

export function computeHubHealthScore(
  hubId: string,
  hubInventory: HubInventoryEntry[],
  transfers: TransferListItem[],
  requisitions: RequisitionListItem[],
  reference = new Date(),
): number {
  const inventoryHealth = computeHubInventoryHealth(hubInventory, hubId);
  const inventoryPenalty = Math.max(0, 100 - inventoryHealth) * 0.25;

  const delayedTransfers = countDelayedTransfersForHub(
    transfers,
    hubId,
    reference,
  );
  const delayedPenalty = Math.min(20, delayedTransfers * 8);

  const pendingRequisitions = requisitions.filter(
    (item) => item.hubId === hubId && isPendingRequisition(item),
  ).length;
  const requisitionPenalty = Math.min(15, pendingRequisitions * 5);

  const delayedOrders = requisitions.filter(
    (item) =>
      item.hubId === hubId &&
      item.priority === "critical" &&
      isPendingOrder(item),
  ).length;
  const orderPenalty = Math.min(20, delayedOrders * 10);

  const lowStockMaterials = countLowStockMaterials(hubInventory, hubId);
  const lowStockPenalty = Math.min(20, lowStockMaterials * 5);

  return Math.max(
    0,
    Math.round(
      100 -
        inventoryPenalty -
        delayedPenalty -
        requisitionPenalty -
        orderPenalty -
        lowStockPenalty,
    ),
  );
}

export function getHubHealthScoreColor(score: number): string {
  if (score >= 90) return "text-green-600";
  if (score >= 75) return "text-orange-500";
  return "text-red-600";
}

export function getHubHealthScoreBarColor(score: number): string {
  if (score >= 90) return "bg-green-500";
  if (score >= 75) return "bg-orange-500";
  return "bg-red-500";
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
  const pendingRequisitions = requisitions.filter(
    isPendingHubRequisition,
  ).length;
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
      id: "total-active-hubs",
      label: "Total Active Hubs",
      value: String(activeHubs.length),
      subtitle: `${subHubs.length - activeHubs.length} inactive in network`,
      icon: "active-hubs",
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
      id: "pending-requisitions",
      label: "Pending Hub Requisitions",
      value: String(pendingRequisitions).padStart(2, "0"),
      subtitle: "Pending, approved, or awaiting allocation",
      icon: "pending-requisitions",
      variant: pendingRequisitions > 0 ? "warning" : "default",
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
  const healthScore = computeHubHealthScore(
    hub.id,
    hubInventory,
    transfers,
    requisitions,
  );
  const stockValue = computeHubStockValue(hubInventory, hub.id);
  const pendingOrders = countPendingCustomerOrdersForHub(requisitions, hub.id);
  const pendingRequisitions = requisitions.filter(
    (item) => item.hubId === hub.id && isPendingRequisition(item),
  ).length;
  const incomingTransfers = countIncomingTransfersForHub(transfers, hub.id);
  const outgoingTransfers = countOutgoingTransfersForHub(requisitions, hub.id);
  const transfersInTransit = countTransfersInTransitForHub(transfers, hub.id);
  const status = computeHubOperationalStatus(
    hub.id,
    hubInventory,
    transfers,
    requisitions,
  );

  return {
    inventoryHealth,
    healthScore,
    stockValue,
    pendingOrders,
    pendingRequisitions,
    incomingTransfers,
    outgoingTransfers,
    transfersInTransit,
    status,
  };
}

export function computeSubHubSummaries(
  subHubs: SubHub[],
  hubInventory: HubInventoryEntry[],
  transfers: TransferListItem[],
  requisitions: RequisitionListItem[],
  limit?: number,
): SubHubSummary[] {
  const result = subHubs
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
        pendingRequisitions: metrics.pendingRequisitions,
        incomingTransfers: metrics.incomingTransfers,
        outgoingTransfers: metrics.outgoingTransfers,
        inventoryHealth: metrics.inventoryHealth,
        healthScore: metrics.healthScore,
        lastInventorySync: hub.lastInventorySync,
        status: metrics.status,
      };
    })
    .sort((left, right) => left.healthScore - right.healthScore);

  return limit ? result.slice(0, limit) : result;
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
        healthScore: metrics.healthScore,
        pendingOrders: metrics.pendingOrders,
        pendingRequisitions: metrics.pendingRequisitions,
        incomingTransfers: metrics.incomingTransfers,
        outgoingTransfers: metrics.outgoingTransfers,
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

export function computeOperationsAlerts(
  subHubs: SubHub[],
  hubInventory: HubInventoryEntry[],
  requisitions: RequisitionListItem[],
  transfers: TransferListItem[],
  allocations: ErpAllocation[],
  reference = new Date(),
): OperationsAlert[] {
  const activeHubs = subHubs.filter((hub) => hub.isActive);
  const lowStockHubCount = activeHubs.filter((hub) =>
    isLowStockHub(hubInventory, hub.id),
  ).length;

  const pendingAllocations = allocations.filter(
    (item) => item.status === "PENDING" || item.status === "INVENTORY_RESERVED",
  ).length;

  const pendingDispatches = transfers.filter((transfer) =>
    DISPATCH_QUEUE_STATUSES.includes(normalizeTransferStatus(transfer.status)),
  ).length;

  const delayedTransfers = transfers.filter((transfer) =>
    isTransferDelayed(transfer, reference),
  ).length;

  const driverPending = transfers.filter(
    (transfer) =>
      normalizeTransferStatus(transfer.status) === "TRANSFER_CREATED" &&
      !transfer.driverId,
  ).length;

  const vehiclePending = transfers.filter(
    (transfer) =>
      normalizeTransferStatus(transfer.status) === "TRANSFER_CREATED" &&
      !transfer.vehicleId,
  ).length;

  const criticalOrders = countCriticalCustomerOrders(requisitions);

  const alerts: OperationsAlert[] = [
    {
      id: "low-stock-hubs",
      label: "Low Stock Hubs",
      count: lowStockHubCount,
      href: ROUTES.SUB_HUB_NETWORK,
      severity: lowStockHubCount > 0 ? "warning" : "default",
    },
    {
      id: "pending-allocations",
      label: "Pending Warehouse Allocations",
      count: pendingAllocations,
      href: `${ROUTES.CENTRAL_WAREHOUSE}/allocate`,
      severity: pendingAllocations > 0 ? "warning" : "default",
    },
    {
      id: "pending-dispatches",
      label: "Pending Dispatches",
      count: pendingDispatches,
      href: `${ROUTES.CENTRAL_WAREHOUSE}/dispatch`,
      severity: pendingDispatches > 0 ? "warning" : "default",
    },
    {
      id: "delayed-transfers",
      label: "Delayed Transfers",
      count: delayedTransfers,
      href: `${ROUTES.CENTRAL_WAREHOUSE}/transfers?status=delayed`,
      severity: delayedTransfers > 0 ? "critical" : "default",
    },
    {
      id: "driver-pending",
      label: "Driver Assignment Pending",
      count: driverPending,
      href: `${ROUTES.CENTRAL_WAREHOUSE}/transfers`,
      severity: driverPending > 0 ? "warning" : "default",
    },
    {
      id: "vehicle-pending",
      label: "Vehicle Assignment Pending",
      count: vehiclePending,
      href: `${ROUTES.CENTRAL_WAREHOUSE}/transfers`,
      severity: vehiclePending > 0 ? "warning" : "default",
    },
    {
      id: "critical-orders",
      label: "Critical Customer Orders Waiting",
      count: criticalOrders,
      href: `${ROUTES.CENTRAL_WAREHOUSE}/requisitions?chip=critical`,
      severity: criticalOrders > 0 ? "critical" : "default",
    },
  ];

  return alerts.filter((alert) => alert.count > 0);
}

function mapTransferEventToHubActivity(
  transfer: TransferListItem,
  eventType: TransferTimelineEventType,
  timestamp: string,
  actor?: string,
  remarks?: string,
): HubActivityEvent {
  return {
    id: `${transfer.id}-${eventType}-${timestamp}`,
    timestamp,
    title: HUB_TIMELINE_LABELS[eventType] ?? eventType,
    description: `${transfer.material ?? "Material"} · ${transfer.quantity ?? ""} ${transfer.quantityUnit ?? ""} → ${transfer.destinationHub}${remarks ? ` — ${remarks}` : ""}`,
    category: "transfer",
    actor,
  };
}

export function computeHubActivityEvents(
  hub: SubHub,
  hubInventory: HubInventoryEntry[],
  transfers: TransferListItem[],
  requisitions: RequisitionListItem[],
  activityLogs: ErpActivityLog[],
  dispatches: ErpDispatch[],
): HubActivityEvent[] {
  const events: HubActivityEvent[] = [];

  for (const transfer of transfers.filter(
    (item) => item.destinationHubId === hub.id,
  )) {
    for (const event of transfer.timeline ?? []) {
      events.push(
        mapTransferEventToHubActivity(
          transfer,
          event.type,
          event.timestamp,
          event.actor,
          event.remarks,
        ),
      );
    }

    if (transfer.hubReceivedAt) {
      events.push({
        id: `${transfer.id}-hub-received`,
        timestamp: transfer.hubReceivedAt,
        title: "Hub Receives Inventory",
        description: `${transfer.material ?? "Material"} received at ${hub.name}`,
        category: "inventory",
      });
    }
  }

  for (const requisition of requisitions.filter(
    (item) => item.hubId === hub.id,
  )) {
    events.push({
      id: `${requisition.id}-created`,
      timestamp: requisition.createdAt,
      title: "Requisition Raised",
      description: `${requisition.material} · ${requisition.requestedQty} ${requisition.unit}`,
      category: "requisition",
      actor: requisition.requestedBy.name,
    });

    if (requisition.approvedAt) {
      events.push({
        id: `${requisition.id}-approved`,
        timestamp: requisition.approvedAt,
        title: "Warehouse Approved",
        description: `${requisition.requestId} approved for ${hub.name}`,
        category: "allocation",
      });
    }

    if (requisition.status === "ALLOCATED") {
      events.push({
        id: `${requisition.id}-allocated`,
        timestamp: requisition.approvedAt ?? requisition.createdAt,
        title: "Warehouse Allocation Completed",
        description: `${requisition.material} allocated to ${hub.name}`,
        category: "allocation",
      });
    }

    if (isPendingOrder(requisition)) {
      events.push({
        id: `${requisition.id}-customer-order`,
        timestamp: requisition.approvedAt ?? requisition.createdAt,
        title: "Customer Order Received",
        description: requisition.customerName
          ? `Order for ${requisition.customerName}`
          : `${requisition.requestId} awaiting fulfillment`,
        category: "order",
      });
    }

    if (requisition.status === "TRANSFERRED") {
      events.push({
        id: `${requisition.id}-dispatch`,
        timestamp: requisition.approvedAt ?? requisition.createdAt,
        title: "Dispatch Completed",
        description: `${requisition.material} dispatched from ${hub.name}`,
        category: "dispatch",
      });
    }

    if (requisition.status === "COMPLETED") {
      events.push({
        id: `${requisition.id}-fulfilled`,
        timestamp: requisition.approvedAt ?? requisition.createdAt,
        title: "Customer Order Fulfilled",
        description: `${requisition.requestId} completed`,
        category: "order",
      });
    }
  }

  for (const dispatch of dispatches.filter(
    (item) => item.destinationHub === hub.name,
  )) {
    events.push({
      id: `dispatch-${dispatch.id}`,
      timestamp: dispatch.dispatchAt ?? dispatch.createdAt,
      title: "Dispatch Started",
      description: `${dispatch.material} · ${dispatch.quantity} ${dispatch.unit}`,
      category: "dispatch",
    });
  }

  const hubInventoryMentions = activityLogs.filter(
    (log) =>
      log.remarks?.includes(hub.name) ||
      log.remarks?.includes(hub.city) ||
      (log.entityId &&
        requisitions.some(
          (req) =>
            req.hubId === hub.id &&
            (req.id === log.entityId || req.requestId === log.entityId),
        )),
  );

  for (const log of hubInventoryMentions) {
    events.push({
      id: `log-${log.id}`,
      timestamp: log.timestamp,
      title: log.action,
      description: log.remarks,
      category: log.module.toLowerCase().includes("inventory")
        ? "inventory"
        : "allocation",
      actor: log.user,
    });
  }

  for (const entry of getHubInventoryEntries(hubInventory, hub.id)) {
    if (entry.quantity < entry.minimumRequired) {
      events.push({
        id: `low-stock-${entry.materialId}`,
        timestamp: hub.lastInventorySync,
        title: "Inventory Below Threshold",
        description: `${entry.materialName} at ${entry.quantity} ${entry.unit} (reorder: ${entry.minimumRequired})`,
        category: "inventory",
      });
    }
  }

  return events
    .sort(
      (left, right) =>
        new Date(right.timestamp).getTime() -
        new Date(left.timestamp).getTime(),
    )
    .filter(
      (event, index, list) =>
        list.findIndex((entry) => entry.id === event.id) === index,
    );
}

export function getHubDetailPath(hubId: string): string {
  return `${ROUTES.SUB_HUB_NETWORK}/${hubId}`;
}
