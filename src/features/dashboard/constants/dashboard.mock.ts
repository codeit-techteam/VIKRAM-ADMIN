import type {
  LowStockItem,
  RecentOrder,
  RevenuePoint,
  StatCardData,
  SubHubStatus,
} from "@/features/dashboard/types/dashboard.types";

export const STAT_CARDS: StatCardData[] = [
  {
    label: "TOTAL ORDERS",
    value: "160",
    subtext: "Current fiscal quarter performance",
  },
  {
    label: "ACTIVE USERS",
    value: "90",
    subtext: "Growth across contractor profiles",
  },
  {
    label: "TOTAL HUBS",
    value: "48",
    subtext: "8 Central, 40 Regional Sub-hubs",
  },
  {
    label: "PENDING APPROVALS",
    value: "142",
    subtext: "Requires immediate supervisor review",
    valueVariant: "warning",
  },
];

export const REVENUE_DATA: RevenuePoint[] = [
  { month: "JAN", value: 420 },
  { month: "FEB", value: 380 },
  { month: "MAR", value: 510 },
  { month: "APR", value: 460 },
  { month: "MAY", value: 590 },
  { month: "JUN", value: 720 },
  { month: "JUL", value: 480 },
  { month: "AUG", value: 520 },
  { month: "SEP", value: 440 },
  { month: "OCT", value: 560 },
  { month: "NOV", value: 490 },
  { month: "DEC", value: 610 },
];

export const REVENUE_HIGHLIGHT_INDEX = 5;

export const SUB_HUB_STATUSES: SubHubStatus[] = [
  {
    id: "mumbai-central",
    name: "Mumbai Central",
    loadPercent: 92,
    status: "healthy",
  },
  {
    id: "delhi-north",
    name: "Delhi North Hub",
    loadPercent: 74,
    status: "warning",
  },
  {
    id: "bengaluru-east",
    name: "Bengaluru East",
    loadPercent: 105,
    status: "critical",
  },
];

export const RECENT_ORDERS: RecentOrder[] = [
  {
    orderId: "#BQ-9402",
    customer: "Prestige Builders",
    productCluster: "Steel TMT Bars",
    amount: 420000,
    status: "DISPATCHED",
  },
  {
    orderId: "#BQ-9401",
    customer: "L&T Infrastructure",
    productCluster: "UltraTech PPC",
    amount: 1285000,
    status: "PROCESSING",
  },
  {
    orderId: "#BQ-9399",
    customer: "Urban Landscapes",
    productCluster: "Red Bricks (5000)",
    amount: 65000,
    status: "DELIVERED",
  },
];

export const LOW_STOCK_ITEMS: LowStockItem[] = [
  {
    id: "ultratech-cement",
    name: "UltraTech Cement",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1581094794359-0ef1ffe22a0d?w=80&h=80&fit=crop",
    stockLeftLabel: "120 Units Left",
  },
  {
    id: "tata-tiscon",
    name: "TATA Tiscon 12mm",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=80&h=80&fit=crop",
    stockLeftLabel: "450kg Left",
  },
];
