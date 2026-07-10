export type NotificationCategory =
  | "customer"
  | "orders"
  | "payments"
  | "hub"
  | "inventory"
  | "logistics"
  | "complaints"
  | "system";

export type NotificationPriority = "low" | "medium" | "high" | "critical";

export type NotificationFilterValue =
  | "all"
  | "unread"
  | "customer"
  | "orders"
  | "payments"
  | "inventory"
  | "hub"
  | "logistics"
  | "complaints"
  | "system";

export interface EnterpriseNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  createdAt: string;
  priority: NotificationPriority;
  isRead: boolean;
  actionLabel: string;
  href: string;
}

export interface NotificationQueryFilters {
  search: string;
  filter: NotificationFilterValue;
  page: number;
  pageSize: number;
}

export interface NotificationQueryResult {
  items: EnterpriseNotification[];
  total: number;
  totalPages: number;
  unreadCount: number;
}
