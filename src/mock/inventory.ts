import type {
  IncomingDelivery,
  InventoryCategoryFilter,
  InventoryItem,
  InventoryStats,
} from "@/types/inventory.types";

export type {
  IncomingDelivery,
  InventoryItem,
  InventoryStats,
  InventoryStatsApiResponse,
} from "@/types/inventory.types";

// TODO: Replace with inventory list API
export const INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: "inv-001",
    productName: "Steel Rebar FE 500D (12mm)",
    sku: "SKU-STL-0012-IND",
    category: "Structural Steel",
    categorySlug: "steel-rebar",
    currentStock: 45000,
    committedStock: 12500,
    minimumStock: 10000,
    unit: "kg",
    purchasePrice: 62,
  },
  {
    id: "inv-002",
    productName: "OPC 53 Grade Cement",
    sku: "SKU-CEM-0053-ULT",
    category: "Cementing Materials",
    categorySlug: "cement",
    currentStock: 3500,
    committedStock: 200,
    minimumStock: 500,
    unit: "bags",
    purchasePrice: 385,
  },
  {
    id: "inv-003",
    productName: "Industrial Copper Wiring (2.5mm)",
    sku: "SKU-ELE-WR25-PRM",
    category: "Electricals",
    categorySlug: "electrical",
    currentStock: 0,
    committedStock: 0,
    minimumStock: 50,
    unit: "rolls",
    purchasePrice: 4200,
  },
  {
    id: "inv-004",
    productName: "Premium Masonry Bricks (Class A)",
    sku: "SKU-MAS-BRK-CLA",
    category: "Masonry & Blockwork",
    categorySlug: "masonry",
    currentStock: 15000,
    committedStock: 2100,
    minimumStock: 3000,
    unit: "units",
    purchasePrice: 8.5,
  },
  {
    id: "inv-005",
    productName: "TMT Steel Bars 16mm",
    sku: "SKU-STL-0016-IND",
    category: "Structural Steel",
    categorySlug: "steel-rebar",
    currentStock: 28000,
    committedStock: 8000,
    minimumStock: 12000,
    unit: "kg",
    purchasePrice: 64,
  },
  {
    id: "inv-006",
    productName: "PPC Cement 43 Grade",
    sku: "SKU-CEM-0043-STD",
    category: "Cementing Materials",
    categorySlug: "cement",
    currentStock: 800,
    committedStock: 720,
    minimumStock: 400,
    unit: "bags",
    purchasePrice: 360,
  },
  {
    id: "inv-007",
    productName: "Exterior Emulsion Paint (White)",
    sku: "SKU-PNT-EML-WHT",
    category: "Paints & Coatings",
    categorySlug: "paint",
    currentStock: 420,
    committedStock: 180,
    minimumStock: 200,
    unit: "buckets",
    purchasePrice: 1250,
  },
  {
    id: "inv-008",
    productName: "PVC Conduit Pipes (20mm)",
    sku: "SKU-ELE-CND-020",
    category: "Electricals",
    categorySlug: "electrical",
    currentStock: 0,
    committedStock: 0,
    minimumStock: 100,
    unit: "bundles",
    purchasePrice: 890,
  },
  {
    id: "inv-009",
    productName: "AAC Blocks 600x200x150",
    sku: "SKU-MAS-AAC-615",
    category: "Masonry & Blockwork",
    categorySlug: "masonry",
    currentStock: 5200,
    committedStock: 4800,
    minimumStock: 2000,
    unit: "units",
    purchasePrice: 42,
  },
  {
    id: "inv-010",
    productName: "Weather Shield Primer",
    sku: "SKU-PNT-PRM-WTH",
    category: "Paints & Coatings",
    categorySlug: "paint",
    currentStock: 95,
    committedStock: 40,
    minimumStock: 80,
    unit: "buckets",
    purchasePrice: 980,
  },
  {
    id: "inv-011",
    productName: "Steel Rebar FE 500D (10mm)",
    sku: "SKU-STL-0010-IND",
    category: "Structural Steel",
    categorySlug: "steel-rebar",
    currentStock: 38000,
    committedStock: 15000,
    minimumStock: 10000,
    unit: "kg",
    purchasePrice: 58,
  },
  {
    id: "inv-012",
    productName: "White Cement",
    sku: "SKU-CEM-WHT-PRM",
    category: "Cementing Materials",
    categorySlug: "cement",
    currentStock: 0,
    committedStock: 0,
    minimumStock: 150,
    unit: "bags",
    purchasePrice: 520,
  },
];

// TODO: Replace with incoming deliveries API
export const INCOMING_DELIVERIES: IncomingDelivery[] = [
  {
    id: "del-001",
    expectedDeliveryDate: new Date().toISOString().split("T")[0],
    status: "in-transit",
  },
  {
    id: "del-002",
    expectedDeliveryDate: new Date().toISOString().split("T")[0],
    status: "expected",
  },
  {
    id: "del-003",
    expectedDeliveryDate: new Date().toISOString().split("T")[0],
    status: "in-transit",
  },
  {
    id: "del-004",
    expectedDeliveryDate: new Date().toISOString().split("T")[0],
    status: "expected",
  },
  {
    id: "del-005",
    expectedDeliveryDate: new Date(Date.now() + 86400000)
      .toISOString()
      .split("T")[0],
    status: "in-transit",
  },
];

export const INVENTORY_CATEGORY_FILTERS: InventoryCategoryFilter[] = [
  { id: "all", label: "All Categories", slug: "all" },
  { id: "steel-rebar", label: "Steel Rebar", slug: "steel-rebar" },
  { id: "cement", label: "Cement", slug: "cement" },
  { id: "electrical", label: "Electrical", slug: "electrical" },
  { id: "masonry", label: "Masonry", slug: "masonry" },
  { id: "paint", label: "Paint", slug: "paint" },
];

export const INVENTORY_TOTAL_ITEMS = 1248;
export const INVENTORY_PAGE_SIZE = 4;

export function getAvailableStock(item: InventoryItem): number {
  return Math.max(0, item.currentStock - item.committedStock);
}

export function getInventoryStockStatus(
  item: InventoryItem,
): "in-stock" | "low-stock" | "out-of-stock" {
  const available = getAvailableStock(item);

  if (available === 0) {
    return "out-of-stock";
  }

  if (available <= item.minimumStock) {
    return "low-stock";
  }

  return "in-stock";
}

export function formatStockQuantity(value: number, unit: string): string {
  return `${value.toLocaleString("en-IN")} ${unit}`;
}

export function formatStockValueInCrores(totalRupees: number): string {
  const crores = totalRupees / 10_000_000;
  return `₹${crores.toFixed(1)} Cr`;
}

export function formatInventoryItemsCount(count: number): string {
  return `${count.toLocaleString("en-IN")} SKU`;
}

export function computeInventoryStats(
  items: InventoryItem[],
  totalInventoryItems: number = INVENTORY_TOTAL_ITEMS,
): InventoryStats {
  const totalRupees = items.reduce(
    (sum, item) => sum + item.currentStock * item.purchasePrice,
    0,
  );

  return {
    totalStockValue: formatStockValueInCrores(totalRupees),
    lowStockAlerts: items.filter(
      (item) => getInventoryStockStatus(item) === "low-stock",
    ).length,
    outOfStockItems: items.filter(
      (item) => getInventoryStockStatus(item) === "out-of-stock",
    ).length,
    inventoryItems: totalInventoryItems,
  };
}

// TODO: Replace with inventory stats API
export const INVENTORY_STATS = computeInventoryStats(INVENTORY_ITEMS);

type InventorySource = () => InventoryItem[];
let inventorySource: InventorySource | null = null;

export function setInventorySource(source: InventorySource): void {
  inventorySource = source;
}

export function getSharedInventoryItems(): InventoryItem[] {
  return inventorySource ? inventorySource() : INVENTORY_ITEMS;
}

export function getSharedInventoryItem(
  materialId: string,
): InventoryItem | undefined {
  return getSharedInventoryItems().find((item) => item.id === materialId);
}
