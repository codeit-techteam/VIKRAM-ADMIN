import { INVENTORY_ITEMS } from "@/mock/inventory";
import type {
  ErpAllocation,
  ErpDispatch,
  HubInventoryEntry,
  HubStockStatus,
  SubHub,
} from "@/types/erp.types";
import type {
  RequisitionListItem,
  TransferListItem,
} from "@/types/warehouse.types";
import {
  computeHubStockStatus,
  resolveIncomingQty,
  resolveMaxStock,
  resolveOutgoingQty,
  resolveReservedQty,
  type HubInventoryRow,
} from "@/utils/hub-profile-metrics";
import { formatHubStockValue } from "@/utils/sub-hub-metrics";

/** Deterministic supplier labels for catalog materials (shared mock, not duplicated stock). */
export const MATERIAL_SUPPLIERS: Record<string, string> = {
  "inv-001": "SAIL India",
  "inv-002": "UltraTech Cement",
  "inv-003": "Polycab Industries",
  "inv-004": "ACC Masonry",
  "inv-005": "JSW NeoSteel",
  "inv-006": "Ambuja Cement",
  "inv-007": "Asian Paints",
  "inv-008": "Supreme Industries",
  "inv-009": "BirlaAerocon",
  "inv-010": "Berger Paints",
  "inv-011": "Tata Steel",
  "inv-012": "JK Cement",
};

export const MATERIAL_TYPES = [
  "steel-rebar",
  "cement",
  "electrical",
  "masonry",
  "paint",
] as const;

export type MaterialTypeSlug = (typeof MATERIAL_TYPES)[number] | "all";

export const MATERIAL_TYPE_LABELS: Record<string, string> = {
  "steel-rebar": "Steel / Rebar",
  cement: "Cement",
  electrical: "Electrical",
  masonry: "Masonry",
  paint: "Paint & Coatings",
};

export interface HubNetworkInventoryRow extends HubInventoryRow {
  hubId: string;
  hubName: string;
  supplier: string;
  materialType: string;
  materialTypeSlug: string;
  maxStock: number;
  entryKey: string;
}

export interface HubInventoryOverviewStats {
  totalInventoryUnits: number;
  totalInventoryLabel: string;
  lowStockItems: number;
  inventoryValue: number;
  inventoryValueLabel: string;
  reservedInventory: number;
  reservedInventoryLabel: string;
}

export interface HubInventoryOverviewFilters {
  hubId: string;
  category: string;
  skuSearch: string;
  supplier: string;
  materialType: string;
}

export const HUB_INVENTORY_PAGE_SIZE = 8;

export type HubInventorySortKey =
  | "hubName"
  | "materialName"
  | "sku"
  | "category"
  | "availableQty"
  | "reservedQty"
  | "freeQty"
  | "reorderLevel"
  | "lastUpdated"
  | "status";

export type HubInventorySortDirection = "asc" | "desc";

function resolveSupplier(materialId: string): string {
  return MATERIAL_SUPPLIERS[materialId] ?? "BuildQuick Preferred";
}

function resolveMaterialType(materialId: string, category: string) {
  const catalog = INVENTORY_ITEMS.find((item) => item.id === materialId);
  const slug = catalog?.categorySlug ?? "general";
  return {
    slug,
    label: MATERIAL_TYPE_LABELS[slug] ?? category,
  };
}

function formatTotalUnits(total: number): string {
  if (total >= 1_000_000) {
    return `${(total / 1_000_000).toFixed(1)}M Units`;
  }
  if (total >= 1_000) {
    return `${(total / 1_000).toFixed(1)}K Units`;
  }
  return `${total.toLocaleString("en-IN")} Units`;
}

export function buildNetworkInventoryRows(
  subHubs: SubHub[],
  hubInventory: HubInventoryEntry[],
  transfers: TransferListItem[],
  requisitions: RequisitionListItem[],
  allocations: ErpAllocation[],
  dispatches: ErpDispatch[],
): HubNetworkInventoryRow[] {
  const hubById = new Map(subHubs.map((hub) => [hub.id, hub]));

  return hubInventory.flatMap((entry) => {
    const hub = hubById.get(entry.hubId);
    if (!hub) return [];

    const availableQty = entry.quantity;
    const reservedQty = resolveReservedQty(entry, requisitions, allocations);
    const freeQty = Math.max(0, availableQty - reservedQty);
    const reorderLevel = entry.reorderLevel ?? entry.minimumRequired;
    const safetyStock =
      entry.safetyStock ?? Math.max(1, Math.round(reorderLevel * 0.6));
    const maxStock = resolveMaxStock(entry);
    const category =
      entry.category ??
      INVENTORY_ITEMS.find((item) => item.id === entry.materialId)?.category ??
      "General Materials";
    const materialType = resolveMaterialType(entry.materialId, category);
    const status = computeHubStockStatus(
      availableQty,
      reservedQty,
      reorderLevel,
      safetyStock,
      maxStock,
    );
    const incomingQty = resolveIncomingQty(entry, transfers);
    const outgoingQty = resolveOutgoingQty(
      entry,
      requisitions,
      dispatches,
      hub.name,
    );

    return [
      {
        hubId: hub.id,
        hubName: hub.name,
        materialId: entry.materialId,
        materialName: entry.materialName,
        sku: entry.sku,
        category,
        availableQty,
        reservedQty,
        freeQty,
        incomingQty,
        outgoingQty,
        reorderLevel,
        safetyStock,
        maxStock,
        unit: entry.unit,
        unitPrice: entry.purchasePrice,
        inventoryValue: availableQty * entry.purchasePrice,
        status,
        lastUpdated: entry.lastUpdated ?? hub.lastInventorySync,
        recommendedQty: Math.max(
          0,
          Math.ceil(
            Math.max(reorderLevel * 1.2, safetyStock * 2) - availableQty,
          ),
        ),
        supplier: resolveSupplier(entry.materialId),
        materialType: materialType.label,
        materialTypeSlug: materialType.slug,
        entryKey: `${hub.id}::${entry.materialId}`,
      },
    ];
  });
}

export function computeHubInventoryOverviewStats(
  rows: HubNetworkInventoryRow[],
): HubInventoryOverviewStats {
  const totalInventoryUnits = rows.reduce(
    (sum, row) => sum + row.availableQty,
    0,
  );
  const inventoryValue = rows.reduce((sum, row) => sum + row.inventoryValue, 0);
  const reservedInventory = rows.reduce((sum, row) => sum + row.reservedQty, 0);
  const lowStockItems = rows.filter(
    (row) => row.availableQty <= row.reorderLevel,
  ).length;

  return {
    totalInventoryUnits,
    totalInventoryLabel: formatTotalUnits(totalInventoryUnits),
    lowStockItems,
    inventoryValue,
    inventoryValueLabel: formatHubStockValue(inventoryValue),
    reservedInventory,
    reservedInventoryLabel: `${reservedInventory.toLocaleString("en-IN")} Units`,
  };
}

export function filterNetworkInventoryRows(
  rows: HubNetworkInventoryRow[],
  filters: HubInventoryOverviewFilters,
): HubNetworkInventoryRow[] {
  const query = filters.skuSearch.trim().toLowerCase();

  return rows.filter((row) => {
    if (filters.hubId !== "all" && row.hubId !== filters.hubId) return false;
    if (filters.category !== "all" && row.category !== filters.category) {
      return false;
    }
    if (filters.supplier !== "all" && row.supplier !== filters.supplier) {
      return false;
    }
    if (
      filters.materialType !== "all" &&
      row.materialTypeSlug !== filters.materialType
    ) {
      return false;
    }
    if (query) {
      const haystack =
        `${row.sku} ${row.materialName} ${row.hubName}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

const STATUS_SORT_ORDER: Record<HubStockStatus, number> = {
  "out-of-stock": 0,
  critical: 1,
  "low-stock": 2,
  reserved: 3,
  overstock: 4,
  healthy: 5,
};

export function sortNetworkInventoryRows(
  rows: HubNetworkInventoryRow[],
  sortKey: HubInventorySortKey,
  direction: HubInventorySortDirection,
): HubNetworkInventoryRow[] {
  const factor = direction === "asc" ? 1 : -1;

  return [...rows].sort((left, right) => {
    let comparison = 0;

    switch (sortKey) {
      case "availableQty":
      case "reservedQty":
      case "freeQty":
      case "reorderLevel":
        comparison = left[sortKey] - right[sortKey];
        break;
      case "lastUpdated":
        comparison =
          new Date(left.lastUpdated ?? 0).getTime() -
          new Date(right.lastUpdated ?? 0).getTime();
        break;
      case "status":
        comparison =
          STATUS_SORT_ORDER[left.status] - STATUS_SORT_ORDER[right.status];
        break;
      default:
        comparison = String(left[sortKey]).localeCompare(
          String(right[sortKey]),
        );
    }

    return comparison * factor;
  });
}

export function collectFilterOptions(rows: HubNetworkInventoryRow[]) {
  const categories = Array.from(new Set(rows.map((row) => row.category))).sort(
    (a, b) => a.localeCompare(b),
  );

  const suppliers = Array.from(new Set(rows.map((row) => row.supplier))).sort(
    (a, b) => a.localeCompare(b),
  );

  const materialTypes = Array.from(
    new Set(rows.map((row) => row.materialTypeSlug)),
  )
    .filter((slug) => slug !== "general")
    .sort((a, b) => a.localeCompare(b));

  return { categories, suppliers, materialTypes };
}

export function getIncomingTransfersForMaterial(
  transfers: TransferListItem[],
  hubId: string,
  sku: string,
  materialName: string,
): TransferListItem[] {
  const active = new Set([
    "TRANSFER_CREATED",
    "LOADING",
    "READY_FOR_DISPATCH",
    "IN_TRANSIT",
    "REACHED_HUB",
  ]);

  return transfers.filter((transfer) => {
    if (transfer.destinationHubId !== hubId) return false;
    if (!active.has(transfer.status)) return false;
    if (transfer.sku === sku) return true;
    return Boolean(
      transfer.material
        ?.toLowerCase()
        .includes(materialName.toLowerCase().slice(0, 12)),
    );
  });
}

export function getOutgoingDispatchesForMaterial(
  dispatches: ErpDispatch[],
  hubName: string,
  materialId: string,
): ErpDispatch[] {
  return dispatches.filter(
    (dispatch) =>
      dispatch.destinationHub === hubName &&
      dispatch.materialId === materialId &&
      dispatch.status !== "COMPLETED",
  );
}
