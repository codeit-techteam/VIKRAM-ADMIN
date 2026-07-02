export interface StatCardData {
  label: string;
  value: string;
  subtext: string;
  valueVariant?: "default" | "warning";
}

export interface RevenuePoint {
  month: string;
  value: number;
}

export type SubHubLoadStatus = "healthy" | "warning" | "critical";

export interface SubHubStatus {
  id: string;
  name: string;
  loadPercent: number;
  status: SubHubLoadStatus;
}

export type OrderStatus = "DISPATCHED" | "PROCESSING" | "DELIVERED";

export interface RecentOrder {
  orderId: string;
  customer: string;
  productCluster: string;
  amount: number;
  status: OrderStatus;
}

export interface LowStockItem {
  id: string;
  name: string;
  thumbnailUrl: string;
  stockLeftLabel: string;
}
