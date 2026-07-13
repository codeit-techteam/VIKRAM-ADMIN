import { isDeliveredToday, isTransferDelayed } from "@/mock/transfers";
import { INVENTORY_ITEMS } from "@/mock/inventory";
import { ROUTES } from "@/constants/routes";
import type {
  ErpAllocation,
  ErpDispatch,
  HubHealthGrade,
  HubInventoryEntry,
  HubStockStatus,
  SubHub,
  SubHubOperationalStatus,
} from "@/types/erp.types";
import type {
  RequisitionListItem,
  TransferListItem,
  TransferStatus,
} from "@/types/warehouse.types";
import {
  computeHubInventoryHealth,
  computeHubStockValue,
  countLowStockMaterials,
  formatHubStockValue,
  getHubInventoryEntries,
  isPendingOrder,
  isPendingRequisition,
} from "@/utils/sub-hub-metrics";
import { normalizeTransferStatus } from "@/utils/transfer-actions";

export type HubOpsStageFilter =
  "incoming" | "loading" | "ready" | "in-transit" | "delivered-today";

export type HubDispatchStage = "loading" | "ready" | "in-transit" | "delivered";

export interface HubInventoryRow {
  materialId: string;
  materialName: string;
  sku: string;
  category: string;
  availableQty: number;
  reservedQty: number;
  freeQty: number;
  incomingQty: number;
  outgoingQty: number;
  reorderLevel: number;
  safetyStock: number;
  unit: string;
  unitPrice: number;
  inventoryValue: number;
  status: HubStockStatus;
  lastUpdated?: string;
  recommendedQty: number;
}

export interface HubStockAlert {
  materialId: string;
  materialName: string;
  sku: string;
  currentQty: number;
  safetyStock: number;
  reorderLevel: number;
  recommendedQty: number;
  unit: string;
  status: Extract<HubStockStatus, "critical" | "low-stock" | "out-of-stock">;
}

export interface HubDispatchQueueItem {
  id: string;
  transferId: string;
  customer: string;
  vehicle: string;
  driver: string;
  eta: string;
  stage: HubDispatchStage;
  status: TransferStatus;
  material?: string;
  quantity?: number;
  unit?: string;
  href: string;
}

export interface HubLiveOpsCounts {
  incoming: number;
  loading: number;
  ready: number;
  inTransit: number;
  deliveredToday: number;
}

export interface HubPerformanceKpis {
  todaysOrders: number;
  todaysDispatches: number;
  incomingTransfers: number;
  pendingRequisitions: number;
}

export interface HubProfileKpiCards {
  inventoryValue: number;
  inventoryValueLabel: string;
  customerOrdersPending: number;
  pendingRequisitions: number;
  incomingTransfers: number;
}

export interface HubHealthBreakdown {
  score: number;
  grade: HubHealthGrade;
  inventoryHealth: number;
  dispatchSla: number;
  orderFulfillment: number;
  transferAccuracy: number;
  requisitionResponse: number;
}

export interface HubManagerProfile {
  name: string;
  phone: string;
  email: string;
  hubSinceLabel: string;
  capacityLabel: string;
  storageUtilization: number;
  workingHours: string;
  activeOrders: number;
  performanceScore: number;
}

const ACTIVE_INCOMING: ReadonlySet<TransferStatus> = new Set([
  "TRANSFER_CREATED",
  "LOADING",
  "READY_FOR_DISPATCH",
  "IN_TRANSIT",
  "REACHED_HUB",
]);

const ACTIVE_DISPATCH_QUEUE: ReadonlySet<TransferStatus> = new Set([
  "LOADING",
  "READY_FOR_DISPATCH",
  "IN_TRANSIT",
]);

function isSameDay(iso: string | undefined, reference: Date): boolean {
  if (!iso) return false;
  const date = new Date(iso);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
}

function materialCategory(materialId: string, fallback?: string): string {
  if (fallback) return fallback;
  return (
    INVENTORY_ITEMS.find((item) => item.id === materialId)?.category ??
    "General Materials"
  );
}

/** Customer orders still open (status ≠ Delivered / Completed). */
export function isOpenCustomerOrder(requisition: RequisitionListItem): boolean {
  if (requisition.status === "COMPLETED" || requisition.status === "REJECTED") {
    return false;
  }

  // Customer orders are ALLOCATED / TRANSFERRED, or explicitly tagged with a customer.
  return (
    isPendingOrder(requisition) ||
    (Boolean(requisition.customerName) && requisition.status !== "PENDING")
  );
}

export function resolveReservedQty(
  entry: HubInventoryEntry,
  requisitions: RequisitionListItem[],
  allocations: ErpAllocation[],
): number {
  if (typeof entry.reservedQty === "number" && entry.reservedQty >= 0) {
    return entry.reservedQty;
  }

  const fromOrders = requisitions
    .filter(
      (item) =>
        item.hubId === entry.hubId &&
        item.materialId === entry.materialId &&
        isOpenCustomerOrder(item),
    )
    .reduce((sum, item) => sum + (item.approvedQty ?? item.requestedQty), 0);

  const fromAllocations = allocations
    .filter(
      (item) =>
        item.hubId === entry.hubId &&
        item.materialId === entry.materialId &&
        (item.status === "PENDING" || item.status === "INVENTORY_RESERVED"),
    )
    .reduce((sum, item) => sum + item.reservedQty, 0);

  return Math.min(entry.quantity, Math.max(fromOrders, fromAllocations));
}

export function resolveIncomingQty(
  entry: HubInventoryEntry,
  transfers: TransferListItem[],
): number {
  return transfers
    .filter((transfer) => {
      const status = normalizeTransferStatus(transfer.status);
      return (
        transfer.destinationHubId === entry.hubId &&
        ACTIVE_INCOMING.has(status) &&
        (transfer.sku === entry.sku ||
          transfer.material
            ?.toLowerCase()
            .includes(entry.materialName.toLowerCase().slice(0, 12)))
      );
    })
    .reduce((sum, transfer) => sum + (transfer.quantity ?? 0), 0);
}

export function resolveOutgoingQty(
  entry: HubInventoryEntry,
  requisitions: RequisitionListItem[],
  dispatches: ErpDispatch[],
  hubName: string,
): number {
  const fromOrders = requisitions
    .filter(
      (item) =>
        item.hubId === entry.hubId &&
        item.materialId === entry.materialId &&
        (item.status === "ALLOCATED" || item.status === "TRANSFERRED"),
    )
    .reduce((sum, item) => sum + (item.approvedQty ?? item.requestedQty), 0);

  const fromDispatches = dispatches
    .filter(
      (item) =>
        item.destinationHub === hubName &&
        item.materialId === entry.materialId &&
        item.status !== "COMPLETED",
    )
    .reduce((sum, item) => sum + item.quantity, 0);

  return Math.max(fromOrders, fromDispatches);
}

export function resolveMaxStock(
  entry: Pick<
    HubInventoryEntry,
    "maxStock" | "minimumRequired" | "reorderLevel"
  >,
): number {
  if (typeof entry.maxStock === "number" && entry.maxStock > 0) {
    return entry.maxStock;
  }

  const reorder = entry.reorderLevel ?? entry.minimumRequired ?? 1;

  return Math.max(reorder * 2, Math.round(reorder * 2.5));
}

/**
 * Status priority (mutually exclusive badge):
 * Out of Stock → Critical → Low Stock → Over Stock → Reserved → Healthy
 */
export function computeHubStockStatus(
  availableQty: number,
  reservedQty: number,
  reorderLevel: number,
  safetyStock: number,
  maxStock?: number,
): HubStockStatus {
  if (availableQty <= 0) return "out-of-stock";
  if (availableQty <= safetyStock) return "critical";
  if (availableQty <= reorderLevel) return "low-stock";
  if (typeof maxStock === "number" && maxStock > 0 && availableQty > maxStock) {
    return "overstock";
  }
  if (reservedQty > 0) return "reserved";
  return "healthy";
}

export function recommendedReorderQty(
  availableQty: number,
  reorderLevel: number,
  safetyStock: number,
): number {
  const target = Math.max(reorderLevel * 1.2, safetyStock * 2);
  return Math.max(0, Math.ceil(target - availableQty));
}

export function buildHubInventoryRows(
  hub: SubHub,
  hubInventory: HubInventoryEntry[],
  transfers: TransferListItem[],
  requisitions: RequisitionListItem[],
  allocations: ErpAllocation[],
  dispatches: ErpDispatch[],
): HubInventoryRow[] {
  return getHubInventoryEntries(hubInventory, hub.id).map((entry) => {
    const availableQty = entry.quantity;
    const reservedQty = resolveReservedQty(entry, requisitions, allocations);
    const freeQty = Math.max(0, availableQty - reservedQty);
    const reorderLevel = entry.reorderLevel ?? entry.minimumRequired;
    const safetyStock =
      entry.safetyStock ?? Math.max(1, Math.round(reorderLevel * 0.6));
    const maxStock = resolveMaxStock(entry);
    const incomingQty = resolveIncomingQty(entry, transfers);
    const outgoingQty = resolveOutgoingQty(
      entry,
      requisitions,
      dispatches,
      hub.name,
    );
    const status = computeHubStockStatus(
      availableQty,
      reservedQty,
      reorderLevel,
      safetyStock,
      maxStock,
    );

    return {
      materialId: entry.materialId,
      materialName: entry.materialName,
      sku: entry.sku,
      category: materialCategory(entry.materialId, entry.category),
      availableQty,
      reservedQty,
      freeQty,
      incomingQty,
      outgoingQty,
      reorderLevel,
      safetyStock,
      unit: entry.unit,
      unitPrice: entry.purchasePrice,
      inventoryValue: availableQty * entry.purchasePrice,
      status,
      lastUpdated: entry.lastUpdated ?? hub.lastInventorySync,
      recommendedQty: recommendedReorderQty(
        availableQty,
        reorderLevel,
        safetyStock,
      ),
    };
  });
}

export function buildHubStockAlerts(rows: HubInventoryRow[]): HubStockAlert[] {
  return rows
    .filter(
      (row) =>
        row.status === "critical" ||
        row.status === "out-of-stock" ||
        (row.status === "low-stock" && row.availableQty < row.safetyStock),
    )
    .map((row) => ({
      materialId: row.materialId,
      materialName: row.materialName,
      sku: row.sku,
      currentQty: row.availableQty,
      safetyStock: row.safetyStock,
      reorderLevel: row.reorderLevel,
      recommendedQty: row.recommendedQty,
      unit: row.unit,
      status:
        row.status === "out-of-stock" || row.status === "critical"
          ? row.status
          : "critical",
    }))
    .sort((left, right) => left.currentQty - right.currentQty);
}

export function inventoryHealthLabel(health: number): SubHubOperationalStatus {
  if (health < 70) return "critical";
  if (health < 90) return "warning";
  return "healthy";
}

export function computeDispatchSla(
  transfers: TransferListItem[],
  hubId: string,
  reference = new Date(),
): { onTime: number; total: number; percent: number } {
  const hubTransfers = transfers.filter(
    (transfer) => transfer.destinationHubId === hubId,
  );

  const completedOrActive = hubTransfers.filter((transfer) => {
    const status = normalizeTransferStatus(transfer.status);
    return status !== "DRAFT" && status !== "CANCELLED";
  });

  const total = completedOrActive.length;
  if (total === 0) {
    return { onTime: 0, total: 0, percent: 100 };
  }

  const delayed = completedOrActive.filter((transfer) =>
    isTransferDelayed(transfer, reference),
  ).length;
  const onTime = total - delayed;

  return {
    onTime,
    total,
    percent: Math.round((onTime / total) * 100),
  };
}

export function computeOrderFulfillmentRate(
  requisitions: RequisitionListItem[],
  hubId: string,
): number {
  const hubReqs = requisitions.filter((item) => item.hubId === hubId);
  if (hubReqs.length === 0) return 100;

  const fulfillable = hubReqs.filter(
    (item) =>
      item.status === "COMPLETED" ||
      item.status === "TRANSFERRED" ||
      item.status === "ALLOCATED" ||
      item.status === "APPROVED" ||
      item.status === "PENDING",
  );

  if (fulfillable.length === 0) return 100;

  const completed = fulfillable.filter(
    (item) => item.status === "COMPLETED" || item.status === "TRANSFERRED",
  ).length;

  return Math.round((completed / fulfillable.length) * 100);
}

export function computeTransferAccuracy(
  transfers: TransferListItem[],
  hubId: string,
  reference = new Date(),
): number {
  const hubTransfers = transfers.filter(
    (transfer) => transfer.destinationHubId === hubId,
  );
  if (hubTransfers.length === 0) return 100;

  const delayed = hubTransfers.filter((transfer) =>
    isTransferDelayed(transfer, reference),
  ).length;

  return Math.max(0, Math.round((1 - delayed / hubTransfers.length) * 100));
}

export function computeRequisitionResponseScore(
  requisitions: RequisitionListItem[],
  hubId: string,
): number {
  const hubReqs = requisitions.filter((item) => item.hubId === hubId);
  if (hubReqs.length === 0) return 100;

  const pending = hubReqs.filter(isPendingRequisition).length;
  const criticalPending = hubReqs.filter(
    (item) => item.priority === "critical" && isPendingRequisition(item),
  ).length;

  const penalty = pending * 8 + criticalPending * 12;
  return Math.max(0, 100 - penalty);
}

export function computeHubProfileHealth(
  hubId: string,
  hubInventory: HubInventoryEntry[],
  transfers: TransferListItem[],
  requisitions: RequisitionListItem[],
  reference = new Date(),
): HubHealthBreakdown {
  const inventoryHealth = computeHubInventoryHealth(hubInventory, hubId);
  const dispatchSla = computeDispatchSla(transfers, hubId, reference).percent;
  const orderFulfillment = computeOrderFulfillmentRate(requisitions, hubId);
  const transferAccuracy = computeTransferAccuracy(transfers, hubId, reference);
  const requisitionResponse = computeRequisitionResponseScore(
    requisitions,
    hubId,
  );

  const score = Math.round(
    inventoryHealth * 0.4 +
      dispatchSla * 0.25 +
      orderFulfillment * 0.2 +
      transferAccuracy * 0.1 +
      requisitionResponse * 0.05,
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    grade: hubHealthGrade(score),
    inventoryHealth,
    dispatchSla,
    orderFulfillment,
    transferAccuracy,
    requisitionResponse,
  };
}

export function hubHealthGrade(score: number): HubHealthGrade {
  if (score >= 90) return "excellent";
  if (score >= 75) return "healthy";
  if (score >= 55) return "warning";
  return "critical";
}

export function computeHubProfileKpis(
  hubId: string,
  hubInventory: HubInventoryEntry[],
  transfers: TransferListItem[],
  requisitions: RequisitionListItem[],
): HubProfileKpiCards {
  const inventoryValue = computeHubStockValue(hubInventory, hubId);

  return {
    inventoryValue,
    inventoryValueLabel: formatHubStockValue(inventoryValue),
    customerOrdersPending: requisitions.filter(
      (item) => item.hubId === hubId && isOpenCustomerOrder(item),
    ).length,
    pendingRequisitions: requisitions.filter(
      (item) => item.hubId === hubId && isPendingRequisition(item),
    ).length,
    incomingTransfers: transfers.filter((transfer) => {
      const status = normalizeTransferStatus(transfer.status);
      return transfer.destinationHubId === hubId && ACTIVE_INCOMING.has(status);
    }).length,
  };
}

export function computeHubPerformanceKpis(
  hub: SubHub,
  _hubInventory: HubInventoryEntry[],
  transfers: TransferListItem[],
  requisitions: RequisitionListItem[],
  reference = new Date(),
): HubPerformanceKpis {
  return {
    todaysOrders: requisitions.filter(
      (item) => item.hubId === hub.id && isSameDay(item.createdAt, reference),
    ).length,
    todaysDispatches: transfers.filter((transfer) => {
      if (transfer.destinationHubId !== hub.id) return false;
      return isSameDay(
        transfer.dispatchAt ?? transfer.loadingCompletedAt,
        reference,
      );
    }).length,
    incomingTransfers: transfers.filter((transfer) => {
      const status = normalizeTransferStatus(transfer.status);
      return (
        transfer.destinationHubId === hub.id && ACTIVE_INCOMING.has(status)
      );
    }).length,
    pendingRequisitions: requisitions.filter(
      (item) => item.hubId === hub.id && isPendingRequisition(item),
    ).length,
  };
}

export function computeLiveOpsCounts(
  hubId: string,
  transfers: TransferListItem[],
  reference = new Date(),
): HubLiveOpsCounts {
  const hubTransfers = transfers.filter(
    (transfer) => transfer.destinationHubId === hubId,
  );

  return {
    incoming: hubTransfers.filter((transfer) =>
      ACTIVE_INCOMING.has(normalizeTransferStatus(transfer.status)),
    ).length,
    loading: hubTransfers.filter(
      (transfer) => normalizeTransferStatus(transfer.status) === "LOADING",
    ).length,
    ready: hubTransfers.filter(
      (transfer) =>
        normalizeTransferStatus(transfer.status) === "READY_FOR_DISPATCH",
    ).length,
    inTransit: hubTransfers.filter(
      (transfer) => normalizeTransferStatus(transfer.status) === "IN_TRANSIT",
    ).length,
    deliveredToday: hubTransfers.filter((transfer) =>
      isDeliveredToday(transfer, reference),
    ).length,
  };
}

export function filterTransfersByOpsStage(
  transfers: TransferListItem[],
  hubId: string,
  stage: HubOpsStageFilter,
  reference = new Date(),
): TransferListItem[] {
  return transfers.filter((transfer) => {
    if (transfer.destinationHubId !== hubId) return false;
    const status = normalizeTransferStatus(transfer.status);

    switch (stage) {
      case "incoming":
        return ACTIVE_INCOMING.has(status);
      case "loading":
        return status === "LOADING";
      case "ready":
        return status === "READY_FOR_DISPATCH";
      case "in-transit":
        return status === "IN_TRANSIT";
      case "delivered-today":
        return isDeliveredToday(transfer, reference);
      default:
        return false;
    }
  });
}

function mapDispatchStage(status: TransferStatus): HubDispatchStage | null {
  switch (normalizeTransferStatus(status)) {
    case "LOADING":
      return "loading";
    case "READY_FOR_DISPATCH":
      return "ready";
    case "IN_TRANSIT":
    case "REACHED_HUB":
      return "in-transit";
    case "DELIVERED":
      return "delivered";
    default:
      return null;
  }
}

export function buildHubDispatchQueue(
  hub: SubHub,
  transfers: TransferListItem[],
  requisitions: RequisitionListItem[],
): HubDispatchQueueItem[] {
  return transfers
    .filter((transfer) => {
      if (transfer.destinationHubId !== hub.id) return false;
      const stage = mapDispatchStage(transfer.status);
      return (
        stage !== null &&
        ACTIVE_DISPATCH_QUEUE.has(normalizeTransferStatus(transfer.status))
      );
    })
    .map((transfer) => {
      const linkedReq = requisitions.find(
        (item) =>
          item.transferId === transfer.transferId ||
          item.id === transfer.requisitionId ||
          item.allocationId === transfer.allocationId,
      );
      const stage = mapDispatchStage(transfer.status)!;

      return {
        id: transfer.id,
        transferId: transfer.transferId,
        customer:
          linkedReq?.customerName ??
          linkedReq?.requestedBy.name ??
          transfer.destinationHub,
        vehicle: transfer.vehicleNumber ?? "Unassigned",
        driver: transfer.assignedDriver?.name ?? "Unassigned",
        eta: transfer.eta,
        stage,
        status: normalizeTransferStatus(transfer.status),
        material: transfer.material,
        quantity: transfer.quantity,
        unit: transfer.quantityUnit,
        href: `${ROUTES.CENTRAL_WAREHOUSE}/dispatch/${transfer.transferId}`,
      };
    })
    .sort((left, right) => left.eta.localeCompare(right.eta));
}

export function computeStorageUtilization(
  hub: SubHub,
  hubInventory: HubInventoryEntry[],
): number {
  const entries = getHubInventoryEntries(hubInventory, hub.id);
  if (entries.length === 0 || !hub.capacityMt) return 0;

  const stockPressure = entries.reduce((sum, entry) => {
    return sum + entry.quantity / Math.max(entry.minimumRequired, 1);
  }, 0);
  const avgFill = (stockPressure / entries.length) * 55;
  return Math.min(98, Math.max(12, Math.round(avgFill)));
}

export function formatHubSince(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

export function buildHubManagerProfile(
  hub: SubHub,
  hubInventory: HubInventoryEntry[],
  requisitions: RequisitionListItem[],
  healthScore: number,
): HubManagerProfile {
  const activeOrders = requisitions.filter(
    (item) => item.hubId === hub.id && isOpenCustomerOrder(item),
  ).length;

  const capacityMt = hub.capacityMt ?? 0;
  const capacitySqFt = hub.capacitySqFt;

  return {
    name: hub.managerName,
    phone: hub.managerPhone ?? "—",
    email: hub.managerEmail ?? "—",
    hubSinceLabel: formatHubSince(hub.hubSince),
    capacityLabel: capacitySqFt
      ? `${capacityMt.toLocaleString("en-IN")} MT · ${capacitySqFt.toLocaleString("en-IN")} Sq Ft`
      : `${capacityMt.toLocaleString("en-IN")} MT`,
    storageUtilization: computeStorageUtilization(hub, hubInventory),
    workingHours: hub.workingHours ?? "09:00 - 18:00",
    activeOrders,
    performanceScore: healthScore,
  };
}

export function getOpsStageHref(
  hubId: string,
  stage: HubOpsStageFilter,
): string {
  const statusMap: Record<HubOpsStageFilter, string> = {
    incoming: "all",
    loading: "LOADING",
    ready: "READY_FOR_DISPATCH",
    "in-transit": "IN_TRANSIT",
    "delivered-today": "DELIVERED",
  };

  return `${ROUTES.CENTRAL_WAREHOUSE}/transfers?hub=${hubId}&status=${statusMap[stage]}`;
}

export function getRaiseRequisitionHref(hubId: string, materialId?: string) {
  const base = `${ROUTES.HUB_REQUISITIONS}?hub=${hubId}`;
  return materialId ? `${base}&material=${materialId}` : base;
}

export function getRaiseTransferHref(hubId: string) {
  return `${ROUTES.HUB_TRANSFERS}?hub=${hubId}`;
}

export function getHubInventoryHref(hubId?: string) {
  const base = ROUTES.HUB_INVENTORY;
  return hubId ? `${base}?hub=${hubId}` : base;
}
