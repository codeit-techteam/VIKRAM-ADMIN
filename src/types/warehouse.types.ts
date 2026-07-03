import type { LucideIcon } from "lucide-react";

export type WarehouseStatIcon =
  "inventory" | "requisitions" | "dispatch" | "low-stock";

export interface WarehouseStat {
  id: string;
  label: string;
  value: string;
  subtitle: string;
  icon: WarehouseStatIcon;
  variant?: "default" | "warning";
}

export type RequisitionPriority = "critical" | "high" | "medium";

export interface Requisition {
  id: string;
  requestId: string;
  hubName: string;
  material: string;
  quantity: string;
  priority: RequisitionPriority;
  href: string;
}

export type InventoryActivityStatus =
  "completed" | "verified" | "processing" | "pending";

export type QuantityChangeType = "positive" | "negative" | "neutral";

export interface InventoryActivity {
  id: string;
  time: string;
  activity: string;
  material: string;
  quantity: string;
  quantityChange: QuantityChangeType;
  by: string;
  status: InventoryActivityStatus;
}

export type LowStockSeverity = "critical" | "warning";

export interface LowStockItem {
  id: string;
  productName: string;
  currentStock: string;
  minimumStock: string;
  severity: LowStockSeverity;
}

export type WarehouseQuickActionIcon =
  | "receive-stock"
  | "approve-requisition"
  | "allocate-inventory"
  | "create-transfer"
  | "inventory-management"
  | "dispatch-control";

export interface WarehouseQuickAction {
  id: string;
  label: string;
  icon: WarehouseQuickActionIcon;
  href: string;
}

export type WarehouseIconMap<T extends string> = Record<T, LucideIcon>;
