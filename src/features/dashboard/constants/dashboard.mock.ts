import { ROUTES } from "@/constants/routes";
import type {
  DashboardNotification,
  ExecutiveStatsData,
  PendingAction,
  QuickActionItem,
  RecentOrder,
  StatCardData,
  WarehouseActivityData,
} from "@/features/dashboard/types/dashboard.types";

export const STAT_CARDS: StatCardData[] = [
  {
    label: "TOTAL ORDERS",
    value: "160",
    subtext: "Current fiscal quarter performance.",
    href: ROUTES.LOGISTICS,
  },
  {
    label: "ACTIVE USERS",
    value: "90",
    subtext: "Growth across contractor profiles.",
    href: ROUTES.USER_MANAGEMENT,
  },
  {
    label: "TOTAL HUBS",
    value: "48",
    subtext: "8 Central, 40 Regional Sub-hubs.",
    href: ROUTES.SUB_HUB_NETWORK,
  },
  {
    label: "PENDING APPROVALS",
    value: "142",
    subtext: "Requires immediate supervisor review.",
    valueVariant: "warning",
    href: ROUTES.NOTIFICATION_CENTER,
  },
];

export const PENDING_ACTIONS: PendingAction[] = [
  {
    id: "hub-acceptance",
    title: "Pending Hub Acceptance",
    count: 8,
    priority: "high",
    href: ROUTES.SUB_HUB_NETWORK,
  },
  {
    id: "customer-payments",
    title: "Pending Customer Payments",
    count: 12,
    priority: "high",
    href: ROUTES.FINANCE_PAYMENTS,
  },
  {
    id: "warehouse-requests",
    title: "Warehouse Requests",
    count: 15,
    priority: "medium",
    href: ROUTES.CENTRAL_WAREHOUSE,
  },
  {
    id: "exec-orders",
    title: "Customer Exec Orders",
    count: 21,
    priority: "medium",
    href: ROUTES.CUSTOMER_EXECUTIVE,
  },
];

export const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: "add-hub",
    label: "Add New Hub",
    href: ROUTES.SUB_HUB_ADD,
    iconName: "building",
  },
  {
    id: "add-user",
    label: "Add User",
    href: ROUTES.USER_MANAGEMENT,
    iconName: "user-plus",
  },
  {
    id: "raise-order",
    label: "Raise Order",
    href: ROUTES.CUSTOMER_EXECUTIVE,
    iconName: "shopping-cart",
  },
  {
    id: "register-customer",
    label: "Register Cust.",
    href: ROUTES.CUSTOMER_EXECUTIVE,
    iconName: "user-check",
  },
];

export const RECENT_ORDERS: RecentOrder[] = [
  {
    id: "1",
    orderId: "#BQ-9402",
    customer: "Ravi Teja Const.",
    source: "App",
    assignedHub: "Gurgaon Central",
    paymentStatus: "PAID",
    status: "PROCESSING",
    href: ROUTES.LOGISTICS,
  },
  {
    id: "2",
    orderId: "#BQ-9398",
    customer: "Mehta Developers",
    source: "Exec",
    assignedHub: "Noida North",
    paymentStatus: "PENDING",
    status: "AWAITING HUB",
    href: ROUTES.LOGISTICS,
  },
  {
    id: "3",
    orderId: "#BQ-9395",
    customer: "Skyline Infra",
    source: "App",
    assignedHub: "Mumbai West",
    paymentStatus: "PAID",
    status: "DISPATCHED",
    href: ROUTES.LOGISTICS,
  },
  {
    id: "4",
    orderId: "#BQ-9391",
    customer: "Urban Build Co.",
    source: "Exec",
    assignedHub: "Pune South",
    paymentStatus: "PAID",
    status: "DELIVERED",
    href: ROUTES.LOGISTICS,
  },
  {
    id: "5",
    orderId: "#BQ-9388",
    customer: "Prestige Builders",
    source: "App",
    assignedHub: "Bengaluru East",
    paymentStatus: "PENDING",
    status: "PROCESSING",
    href: ROUTES.LOGISTICS,
  },
  {
    id: "6",
    orderId: "#BQ-9385",
    customer: "L&T Infrastructure",
    source: "Exec",
    assignedHub: "Delhi North",
    paymentStatus: "PAID",
    status: "DISPATCHED",
    href: ROUTES.LOGISTICS,
  },
  {
    id: "7",
    orderId: "#BQ-9382",
    customer: "Greenfield Projects",
    source: "App",
    assignedHub: "Hyderabad Central",
    paymentStatus: "PAID",
    status: "DELIVERED",
    href: ROUTES.LOGISTICS,
  },
  {
    id: "8",
    orderId: "#BQ-9379",
    customer: "Apex Constructions",
    source: "Exec",
    assignedHub: "Chennai Hub",
    paymentStatus: "PENDING",
    status: "AWAITING HUB",
    href: ROUTES.LOGISTICS,
  },
  {
    id: "9",
    orderId: "#BQ-9376",
    customer: "Horizon Realty",
    source: "App",
    assignedHub: "Kolkata East",
    paymentStatus: "PAID",
    status: "PROCESSING",
    href: ROUTES.LOGISTICS,
  },
  {
    id: "10",
    orderId: "#BQ-9373",
    customer: "Metro Infra Ltd.",
    source: "Exec",
    assignedHub: "Ahmedabad North",
    paymentStatus: "PAID",
    status: "DISPATCHED",
    href: ROUTES.LOGISTICS,
  },
];

export const DASHBOARD_NOTIFICATIONS: DashboardNotification[] = [
  {
    id: "1",
    type: "hub_created",
    title: "New Hub Created",
    description: "Jaipur West sub-hub registered and awaiting activation.",
    time: "12 mins ago",
    isUnread: true,
  },
  {
    id: "2",
    type: "payment_received",
    title: "Payment Received",
    description: "₹4.2L received from Ravi Teja Const. for order #BQ-9402.",
    time: "1 hour ago",
    isUnread: true,
  },
  {
    id: "3",
    type: "customer_registered",
    title: "Customer Registered",
    description: "Skyline Infra onboarded via Customer Executive portal.",
    time: "2 hours ago",
    isUnread: false,
  },
  {
    id: "4",
    type: "hub_accepted",
    title: "Hub Accepted Order",
    description: "Gurgaon Central accepted order #BQ-9402 for dispatch.",
    time: "3 hours ago",
    isUnread: false,
  },
  {
    id: "5",
    type: "dispatch_started",
    title: "Dispatch Started",
    description: "Truck BQ-TR-482 departed Mumbai West for Skyline Infra.",
    time: "4 hours ago",
    isUnread: false,
  },
  {
    id: "6",
    type: "low_stock",
    title: "Critical Stock Alert",
    description: "Concrete Additives running low at Noida North Hub.",
    time: "5 hours ago",
    isUnread: true,
  },
];

export const WAREHOUSE_ACTIVITY: WarehouseActivityData = {
  items: [
    { id: "incoming", label: "Today's Incoming", value: "14 Trucks" },
    { id: "outgoing", label: "Today's Outgoing", value: "28 Loads" },
    {
      id: "requisitions",
      label: "Pending Requisitions",
      value: "07",
      badge: "High",
      badgeVariant: "danger",
    },
    { id: "transfers", label: "Transfer Requests", value: "12 Units" },
    {
      id: "alerts",
      label: "Inventory Alerts",
      value: "09",
      badge: "CRITICAL",
      badgeVariant: "danger",
    },
  ],
};

export const EXECUTIVE_STATS: ExecutiveStatsData = {
  items: [
    { id: "calls", label: "Today's Calls", value: "428" },
    {
      id: "customers",
      label: "New Customers",
      value: "12 Today",
      valueVariant: "warning",
    },
    { id: "orders", label: "Orders Raised", value: "54" },
    {
      id: "payments",
      label: "Pending Payments",
      value: "₹ 1.2L",
      valueVariant: "danger",
    },
    { id: "followups", label: "Pending Follow-ups", value: "86" },
  ],
};
