import type { PaginationMeta } from "@/types/api";
import type {
  AllocationPayload,
  AllocationQueryParams,
  AllocationStats,
  MaterialAllocationItem,
  MaterialAllocationStatus,
  RequisitionPriority,
  StockAvailabilityLevel,
  WarehouseSource,
} from "@/types/warehouse.types";

import {
  getAvailableStock,
  getSharedInventoryItem,
  type InventoryItem,
} from "@/mock/inventory";
import { formatRequisitionQuantity } from "@/mock/requisitions";

export const ALLOCATION_PAGE_SIZE = 10;

export const WAREHOUSE_SOURCE_OPTIONS: WarehouseSource[] = [
  { id: "wh-central-sector-62", label: "Central Warehouse - Sector 62" },
  { id: "wh-noida", label: "Noida Warehouse" },
  { id: "wh-delhi", label: "Delhi Warehouse" },
];

const ALLOCATION_STOCK_OVERRIDES: Record<string, number> = {
  "alloc-9428": 150,
  "alloc-9427": 3200,
};

function applyGeneratedStockOverride(
  allocationId: string,
  index: number,
  available: number,
): number {
  const numericSuffix = allocationId.replace(/^alloc-/, "");
  if (!/^\d+$/.test(numericSuffix)) {
    return available;
  }

  if (index % 13 === 0) {
    return 0;
  }

  return available;
}

const ALLOCATION_UNIT_OVERRIDES: Record<string, string> = {
  "alloc-9428": "Bundles",
  "alloc-9427": "Bags",
};

const DESTINATION_HUBS = [
  { id: "hub-bangalore-south", label: "Bangalore South Hub" },
  { id: "hub-gurgaon-north", label: "Gurgaon North Hub" },
  { id: "hub-noida-62", label: "Noida Sector 62 Hub" },
  { id: "hub-delhi-south", label: "Delhi South Hub" },
  { id: "hub-manesar", label: "Manesar Plant Hub" },
  { id: "hub-dwarka", label: "Dwarka Expressway Hub" },
  { id: "hub-faridabad", label: "Faridabad East Hub" },
  { id: "hub-pune-west", label: "Pune West Hub" },
] as const;

const ALLOCATION_MATERIALS = [
  {
    materialId: "inv-005",
    material: "TMT Steel Rods",
    materialSpec: "12mm",
    sku: "MT-00234",
    unit: "Bundles",
    qtyRange: [100, 600],
  },
  {
    materialId: "inv-002",
    material: "UltraTech Cement",
    materialSpec: "OPC 53 Grade",
    sku: "MT-00102",
    unit: "Bags",
    qtyRange: [200, 3200],
  },
  {
    materialId: "inv-004",
    material: "PPC Bricks",
    materialSpec: "Standard",
    sku: "MT-00318",
    unit: "Units",
    qtyRange: [5000, 15000],
  },
  {
    materialId: "inv-001",
    material: "Steel Rebar FE 500D",
    materialSpec: "12mm",
    sku: "MT-00089",
    unit: "kg",
    qtyRange: [5000, 25000],
  },
  {
    materialId: "inv-006",
    material: "PPC Cement",
    materialSpec: "43 Grade",
    sku: "MT-00156",
    unit: "Bags",
    qtyRange: [150, 800],
  },
  {
    materialId: "inv-007",
    material: "Industrial Paint",
    materialSpec: "White",
    sku: "MT-00421",
    unit: "Ltrs",
    qtyRange: [100, 500],
  },
  {
    materialId: "inv-008",
    material: "River Sand",
    materialSpec: "Fine Grade",
    sku: "MT-00287",
    unit: "Units",
    qtyRange: [20, 80],
  },
] as const;

const priorities: RequisitionPriority[] = ["critical", "high", "medium", "low"];

function createDate(daysAgo: number, hour: number, minute: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function isSameDay(dateA: Date, dateB: Date): boolean {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function buildAllocationItem(
  index: number,
  overrides: Partial<MaterialAllocationItem> = {},
): MaterialAllocationItem {
  const id = `alloc-${9400 + index}`;
  const requestId = `REQ-${9400 + index}-IN`;
  const template = ALLOCATION_MATERIALS[index % ALLOCATION_MATERIALS.length];
  const hub = DESTINATION_HUBS[index % DESTINATION_HUBS.length];
  const [minQty, maxQty] = template.qtyRange;
  const requestedQty =
    minQty + Math.floor((index * 41) % (maxQty - minQty + 1) || 1);
  const priority = priorities[index % priorities.length];

  let status: MaterialAllocationStatus = "NOT_ALLOCATED";
  let allocatedQty = 0;

  if (index % 5 === 0) {
    status = "PARTIALLY_ALLOCATED";
    allocatedQty = Math.floor(requestedQty * 0.4);
  }

  return {
    id,
    requestId,
    destinationHub: hub.label,
    hubId: hub.id,
    materialId: template.materialId,
    material: template.material,
    materialSpec: template.materialSpec,
    sku: template.sku,
    requestedQty,
    allocatedQty,
    unit: template.unit,
    priority,
    status,
    allocatedAt:
      status !== "NOT_ALLOCATED" ? createDate(index % 3, 10, 30) : undefined,
    ...overrides,
  };
}

// TODO: Replace with allocation list API
export const ALLOCATION_LIST: MaterialAllocationItem[] = [
  buildAllocationItem(28, {
    id: "alloc-9428",
    requestId: "REQ-9428-IN",
    destinationHub: "Bangalore South Hub",
    hubId: "hub-bangalore-south",
    material: "TMT Steel Rods",
    materialSpec: "12mm",
    materialId: "inv-005",
    sku: "MT-00234",
    requestedQty: 450,
    allocatedQty: 0,
    unit: "Bundles",
    priority: "critical",
    status: "NOT_ALLOCATED",
  }),
  buildAllocationItem(27, {
    id: "alloc-9427",
    requestId: "REQ-9427-IN",
    destinationHub: "Gurgaon North Hub",
    hubId: "hub-gurgaon-north",
    material: "UltraTech Cement",
    materialSpec: "OPC 53 Grade",
    materialId: "inv-002",
    sku: "MT-00102",
    requestedQty: 2800,
    allocatedQty: 1200,
    unit: "Bags",
    priority: "high",
    status: "PARTIALLY_ALLOCATED",
  }),
  ...Array.from({ length: 140 }, (_, index) => buildAllocationItem(index + 1)),
];

export function getInventoryItem(
  materialId: string,
): InventoryItem | undefined {
  return getSharedInventoryItem(materialId);
}

export function getWarehouseAvailableStock(
  materialId: string,
  warehouseSourceId: string,
): number {
  const item = getInventoryItem(materialId);
  if (!item) return 0;

  const centralStock = getAvailableStock(item);

  if (warehouseSourceId === "wh-central-sector-62") {
    return centralStock;
  }

  if (warehouseSourceId === "wh-noida") {
    return Math.floor(centralStock * 0.65);
  }

  return Math.floor(centralStock * 0.45);
}

export function getMaterialAvailableForAllocation(
  materialId: string,
  warehouseSourceId: string = WAREHOUSE_SOURCE_OPTIONS[0].id,
  allocationId?: string,
): { available: number; unit: string } | null {
  const item = getInventoryItem(materialId);
  if (!item) return null;

  const allocationOverride = allocationId
    ? ALLOCATION_STOCK_OVERRIDES[allocationId]
    : undefined;

  const index = allocationId
    ? Number.parseInt(allocationId.replace(/^alloc-/, ""), 10) || 0
    : 0;

  const baseAvailable =
    allocationOverride ??
    getWarehouseAvailableStock(materialId, warehouseSourceId);

  const available = allocationId
    ? applyGeneratedStockOverride(allocationId, index, baseAvailable)
    : baseAvailable;

  return {
    available,
    unit: allocationId
      ? (ALLOCATION_UNIT_OVERRIDES[allocationId] ?? item.unit)
      : item.unit,
  };
}

export function getStockAvailabilityLevel(
  available: number,
  requestedQty: number,
): StockAvailabilityLevel {
  if (available === 0) return "out-of-stock";
  if (available < requestedQty) return "low";
  return "enough";
}

export function formatAllocationQuantity(qty: number, unit: string): string {
  return formatRequisitionQuantity(qty, unit);
}

function matchesSearch(item: MaterialAllocationItem, search?: string): boolean {
  if (!search?.trim()) return true;

  const query = search.trim().toLowerCase();
  const haystack = [
    item.requestId,
    item.destinationHub,
    item.material,
    item.materialSpec,
    item.sku,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function matchesFilters(
  item: MaterialAllocationItem,
  params: AllocationQueryParams,
): boolean {
  if (params.priority && params.priority !== "all") {
    if (item.priority !== params.priority) return false;
  }

  if (params.status && params.status !== "all") {
    if (item.status !== params.status) return false;
  }

  return matchesSearch(item, params.search);
}

function isPendingAllocation(item: MaterialAllocationItem): boolean {
  return (
    item.status === "NOT_ALLOCATED" || item.status === "PARTIALLY_ALLOCATED"
  );
}

function isAllocatedToday(
  item: MaterialAllocationItem,
  referenceDate: Date = new Date(),
): boolean {
  return (
    item.status === "ALLOCATED" &&
    Boolean(item.allocatedAt) &&
    isSameDay(new Date(item.allocatedAt!), referenceDate)
  );
}

function isOutOfStockAllocation(item: MaterialAllocationItem): boolean {
  const stock = getMaterialAvailableForAllocation(
    item.materialId,
    undefined,
    item.id,
  );
  return !stock || stock.available === 0;
}

function matchesStatFilter(
  item: MaterialAllocationItem,
  params: AllocationQueryParams,
  referenceDate: Date = new Date(),
): boolean {
  const statFilter = params.statFilter ?? "pending-allocation";

  switch (statFilter) {
    case "critical-allocation":
      return isPendingAllocation(item) && item.priority === "critical";
    case "allocated-today":
      return isAllocatedToday(item, referenceDate);
    case "out-of-stock":
      return isPendingAllocation(item) && isOutOfStockAllocation(item);
    case "pending-allocation":
    default:
      return isPendingAllocation(item);
  }
}

export function computeAllocationStats(
  items: MaterialAllocationItem[],
  referenceDate: Date = new Date(),
): AllocationStats {
  const pendingItems = items.filter(isPendingAllocation);

  const allocatedToday = items.filter((item) =>
    isAllocatedToday(item, referenceDate),
  ).length;

  return {
    pendingAllocation: pendingItems.length,
    criticalAllocation: pendingItems.filter(
      (item) => item.priority === "critical",
    ).length,
    allocatedToday,
    outOfStock: pendingItems.filter(isOutOfStockAllocation).length,
  };
}

export function filterAllocations(
  items: MaterialAllocationItem[],
  params: AllocationQueryParams,
  referenceDate: Date = new Date(),
): MaterialAllocationItem[] {
  return items
    .filter((item) => matchesStatFilter(item, params, referenceDate))
    .filter((item) => matchesFilters(item, params))
    .sort((a, b) => {
      const priorityOrder: Record<RequisitionPriority, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
      };

      const priorityDiff =
        priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      return a.requestId.localeCompare(b.requestId);
    });
}

export function paginateAllocations(
  items: MaterialAllocationItem[],
  page: number,
  limit: number,
): { data: MaterialAllocationItem[]; meta: PaginationMeta } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * limit;

  return {
    data: items.slice(start, start + limit),
    meta: {
      page: safePage,
      limit,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  };
}

// TODO: Replace with allocation list API
export function fetchAllocations(
  items: MaterialAllocationItem[],
  params: AllocationQueryParams = {},
): {
  data: MaterialAllocationItem[];
  meta: PaginationMeta;
  stats: AllocationStats;
} {
  const page = params.page ?? 1;
  const limit = params.limit ?? ALLOCATION_PAGE_SIZE;
  const filtered = filterAllocations(items, params);
  const paginated = paginateAllocations(filtered, page, limit);

  return {
    ...paginated,
    stats: computeAllocationStats(items),
  };
}

// TODO: Replace with material allocation API
export function allocateMaterial(
  allocations: MaterialAllocationItem[],
  inventory: InventoryItem[],
  payload: AllocationPayload,
): {
  allocations: MaterialAllocationItem[];
  inventory: InventoryItem[];
} {
  const allocation = allocations.find(
    (item) => item.id === payload.allocationId,
  );
  if (!allocation) {
    throw new Error("Allocation item not found.");
  }

  const available =
    getMaterialAvailableForAllocation(
      allocation.materialId,
      payload.warehouseSourceId,
      allocation.id,
    )?.available ?? 0;

  if (available === 0) {
    throw new Error("Insufficient stock.");
  }

  if (payload.allocationQty > available) {
    throw new Error("Allocation quantity exceeds available stock.");
  }

  const remainingQty = allocation.requestedQty - allocation.allocatedQty;
  if (payload.allocationQty > remainingQty) {
    throw new Error("Allocation quantity exceeds requested quantity.");
  }

  const newAllocatedQty = allocation.allocatedQty + payload.allocationQty;
  const newStatus: MaterialAllocationStatus =
    newAllocatedQty >= allocation.requestedQty
      ? "ALLOCATED"
      : "PARTIALLY_ALLOCATED";

  const now = new Date().toISOString();

  const updatedAllocations = allocations.map((item) => {
    if (item.id !== payload.allocationId) return item;

    return {
      ...item,
      allocatedQty: newAllocatedQty,
      status: newStatus,
      allocatedAt: now,
    };
  });

  const updatedInventory = inventory.map((item) => {
    if (item.id !== allocation.materialId) return item;

    return {
      ...item,
      committedStock: item.committedStock + payload.allocationQty,
    };
  });

  return {
    allocations: updatedAllocations,
    inventory: updatedInventory,
  };
}
