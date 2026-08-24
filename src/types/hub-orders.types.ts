export type HubOrderTab =
  | "all"
  | "active"
  | "completed"
  | "cancelled"
  | "pending_dispatch"
  | "out_for_delivery";

export type HubOrderDateRange =
  "today" | "yesterday" | "week" | "month" | "custom" | "";

export interface HubOrderTrendMetric {
  value: number;
  change: number;
  changePercent: number;
}

export interface HubOrderDashboard {
  totalOrders: HubOrderTrendMetric;
  activeOrders: HubOrderTrendMetric;
  completedOrders: HubOrderTrendMetric;
  cancelledOrders: HubOrderTrendMetric;
  todaysOrders: HubOrderTrendMetric;
  ordersPendingDispatch: HubOrderTrendMetric;
  ordersOutForDelivery: HubOrderTrendMetric;
  deliveredToday: HubOrderTrendMetric;
  totalRevenue: HubOrderTrendMetric;
  pendingRevenue: HubOrderTrendMetric;
  averageDeliveryTimeHours: HubOrderTrendMetric;
}

export interface HubOrderAnalytics {
  todaysOrders: number;
  thisWeek: number;
  thisMonth: number;
  averageOrderValue: number;
  totalRevenue: number;
  highestSellingCategory: string;
  highestSellingCategoryQty: number;
  highestSellingProduct: string;
  highestSellingProductQty: number;
  repeatCustomers: number;
  totalCustomers: number;
  pendingCodCollection: number;
  pendingCodOrders: number;
}

export interface HubOrderListItem {
  id: string;
  orderNumber: string;
  orderStatus: string;
  statusLabel: string;
  paymentMethod: string;
  paymentStatus: string;
  grandTotal: number;
  createdAt: string;
  expectedDeliveryAt: string | null;
  dispatchedAt: string | null;
  deliveredAt: string | null;
  deliveryAddressLabel: string;
  customer?: {
    id: string;
    fullName: string | null;
    phone: string;
    profile?: {
      businessType?: string | null;
      gstNumber?: string | null;
      companyName?: string | null;
    } | null;
  } | null;
  hub?: { id: string; code: string; name: string } | null;
  assignedDriver?: {
    id: string;
    name: string;
    phone: string;
    vehicle?: { registration?: string; vehicleType?: string } | null;
  } | null;
  assignedVehicle?: {
    id: string;
    registration: string;
    vehicleType: string;
  } | null;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  itemCount?: number;
  deliveryOtpVerified?: boolean;
}

export interface HubOrderStatusCounts {
  all: number;
  active: number;
  completed: number;
  cancelled: number;
  pending_dispatch: number;
  out_for_delivery: number;
  pending: number;
}

export interface HubOrderListResponse {
  orders: HubOrderListItem[];
  statusCounts: HubOrderStatusCounts;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HubOrderFilters {
  tab: HubOrderTab;
  dateRange: HubOrderDateRange;
  fromDate: string;
  toDate: string;
  paymentMethod: string;
  orderStatus: string;
  paymentStatus: string;
  customerType: string;
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export const EMPTY_HUB_ORDER_FILTERS: HubOrderFilters = {
  tab: "all",
  dateRange: "",
  fromDate: "",
  toDate: "",
  paymentMethod: "all",
  orderStatus: "all",
  paymentStatus: "all",
  customerType: "all",
  search: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

export type HubOrderExportFormat = "csv" | "xlsx" | "pdf";
