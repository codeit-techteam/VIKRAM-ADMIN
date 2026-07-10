import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  IndianRupee,
  Network,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  User,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";
import type {
  NotificationCategory,
  NotificationFilterValue,
  NotificationPriority,
} from "@/features/notification-center/types";

export const NOTIFICATION_PAGE_SIZE = 10;

export const NOTIFICATION_DRAWER_FILTER_OPTIONS: {
  label: string;
  value: NotificationFilterValue;
}[] = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Orders", value: "orders" },
  { label: "Payments", value: "payments" },
  { label: "Inventory", value: "inventory" },
  { label: "Hub", value: "hub" },
  { label: "Logistics", value: "logistics" },
  { label: "Complaints", value: "complaints" },
];

export const NOTIFICATION_CENTER_FILTER_OPTIONS: {
  label: string;
  value: NotificationFilterValue;
}[] = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Customer", value: "customer" },
  { label: "Orders", value: "orders" },
  { label: "Payments", value: "payments" },
  { label: "Inventory", value: "inventory" },
  { label: "Hub", value: "hub" },
  { label: "Logistics", value: "logistics" },
  { label: "Complaints", value: "complaints" },
  { label: "System", value: "system" },
];

export const CATEGORY_CONFIG: Record<
  NotificationCategory,
  { label: string; icon: LucideIcon; badgeClass: string }
> = {
  customer: {
    label: "Customer",
    icon: User,
    badgeClass: "bg-blue-50 text-blue-700",
  },
  orders: {
    label: "Orders",
    icon: ShoppingCart,
    badgeClass: "bg-orange-50 text-orange-700",
  },
  payments: {
    label: "Payments",
    icon: IndianRupee,
    badgeClass: "bg-green-50 text-green-700",
  },
  hub: {
    label: "Hub",
    icon: Network,
    badgeClass: "bg-violet-50 text-violet-700",
  },
  inventory: {
    label: "Inventory",
    icon: Package,
    badgeClass: "bg-amber-50 text-amber-700",
  },
  logistics: {
    label: "Logistics",
    icon: Truck,
    badgeClass: "bg-cyan-50 text-cyan-700",
  },
  complaints: {
    label: "Complaints",
    icon: AlertTriangle,
    badgeClass: "bg-red-50 text-red-700",
  },
  system: {
    label: "System",
    icon: Settings,
    badgeClass: "bg-gray-100 text-gray-700",
  },
};

export const PRIORITY_CONFIG: Record<
  NotificationPriority,
  { label: string; className: string }
> = {
  low: { label: "Low", className: "bg-gray-100 text-gray-600" },
  medium: { label: "Medium", className: "bg-blue-50 text-blue-700" },
  high: { label: "High", className: "bg-orange-50 text-orange-700" },
  critical: { label: "Critical", className: "bg-red-50 text-red-700" },
};

export const NOTIFICATION_ROUTES = {
  order: (id: string) => `${ROUTES.ORDERS}/${id}`,
  customer: (id: string) => `${ROUTES.USER_MANAGEMENT_CUSTOMERS}/${id}`,
  payment: () => ROUTES.FINANCE_PAYMENTS,
  inventory: () => ROUTES.HUB_INVENTORY,
  requisition: () => ROUTES.HUB_REQUISITIONS,
  transfer: () => ROUTES.HUB_TRANSFERS,
  dispatch: () => ROUTES.HUB_DISPATCH_LOGS,
  complaint: () => ROUTES.CUSTOMER_EXECUTIVE_COMPLAINTS,
  hub: () => ROUTES.SUB_HUB_NETWORK,
} as const;
