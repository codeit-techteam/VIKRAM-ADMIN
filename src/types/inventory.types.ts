export type InventoryCategorySlug = string;

export type InventoryStockStatus = "in-stock" | "low-stock" | "out-of-stock";

export type IncomingDeliveryStatus = "in-transit" | "expected";

export interface InventoryItem {
  id: string;
  productId?: string;
  productName: string;
  sku: string;
  category: string;
  categorySlug: string;
  imageUrl?: string | null;
  currentStock: number;
  committedStock: number;
  availableStock?: number;
  minimumStock: number;
  unit: string;
  purchasePrice: number;
  status?: InventoryStockStatus;
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
