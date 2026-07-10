export interface StatCardData {
  label: string;
  value: string;
  subtext: string;
  valueVariant?: "default" | "warning";
  href?: string;
}

export type ActionPriority = "high" | "medium";

export interface PendingAction {
  id: string;
  title: string;
  count: number;
  priority: ActionPriority;
  href: string;
}

export interface QuickActionItem {
  id: string;
  label: string;
  href: string;
  iconName: "building" | "user-plus" | "shopping-cart" | "user-check";
}

export type OrderSource = "App" | "Exec";

export type PaymentStatus = "PAID" | "PENDING";

export type OrderStatus =
  "DISPATCHED" | "PROCESSING" | "DELIVERED" | "AWAITING HUB";

export interface RecentOrder {
  id: string;
  orderId: string;
  customer: string;
  source: OrderSource;
  assignedHub: string;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  href: string;
  recordId?: string;
  customerId?: string;
  hubId?: string;
}

export type NotificationType =
  | "hub_created"
  | "payment_received"
  | "customer_registered"
  | "hub_accepted"
  | "dispatch_started"
  | "low_stock";

export interface DashboardNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  isUnread: boolean;
  href?: string;
}

export interface ActivityStatItem {
  id: string;
  label: string;
  value: string;
  valueVariant?: "default" | "warning" | "danger";
  badge?: string;
  badgeVariant?: "default" | "warning" | "danger";
}

export interface WarehouseActivityData {
  items: ActivityStatItem[];
}

export interface ExecutiveStatsData {
  items: ActivityStatItem[];
}
