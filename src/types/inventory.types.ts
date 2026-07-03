export type InventoryCategorySlug =
  "steel-rebar" | "cement" | "electrical" | "masonry" | "paint";

export type InventoryStockStatus = "in-stock" | "low-stock" | "out-of-stock";

export type IncomingDeliveryStatus = "in-transit" | "expected";

export interface InventoryItem {
  id: string;
  productName: string;
  sku: string;
  category: string;
  categorySlug: InventoryCategorySlug;
  currentStock: number;
  committedStock: number;
  minimumStock: number;
  unit: string;
  purchasePrice: number;
}

export interface IncomingDelivery {
  id: string;
  expectedDeliveryDate: string;
  status: IncomingDeliveryStatus;
}

export interface InventoryStats {
  totalStockValue: string;
  lowStockAlerts: number;
  outOfStockItems: number;
  inventoryItems: number;
}

// TODO: Replace with inventory stats API response
export interface InventoryStatsApiResponse {
  inventoryItems: number;
}

export interface InventoryCategoryFilter {
  id: string;
  label: string;
  slug: InventoryCategorySlug | "all";
}
