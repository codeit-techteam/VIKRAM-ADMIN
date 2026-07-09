import type {
  CustomerOrderStatus,
  OrderSource,
} from "@/features/user-management/types/customer.types";

export type ExecutiveAvailabilityStatus =
  "AVAILABLE" | "BUSY" | "OFFLINE" | "LEAVE";

export type SupportAssignmentReason =
  | "CUSTOMER_SUPPORT"
  | "COMPLAINT_HANDLING"
  | "BULK_ORDER_ASSISTANCE"
  | "KYC_VERIFICATION"
  | "MANUAL_FOLLOW_UP"
  | "RELATIONSHIP_MANAGEMENT";

export type SupportAssignmentPriority = "LOW" | "MEDIUM" | "HIGH";

export type AssignmentHistoryStatus = "CURRENT" | "PREVIOUS";

export interface SupportExecutive {
  id: string;
  employeeId: string;
  name: string;
  phone: string;
  email: string;
  hubId: string;
  hubName: string;
  status: ExecutiveAvailabilityStatus;
  activeCustomers: number;
  openTickets: number;
  imageUrl?: string;
}

export interface SupportExecutiveAssignment {
  executiveId: string;
  executiveName: string;
  employeeId: string;
  hubId: string;
  hubName: string;
  phone: string;
  email: string;
  reason: SupportAssignmentReason;
  priority: SupportAssignmentPriority;
  notes?: string;
  assignedDate: string;
  assignedBy: string;
}

export interface SupportExecutiveAssignmentHistoryEntry {
  id: string;
  customerId: string;
  executiveId: string;
  executiveName: string;
  employeeId: string;
  hubId: string;
  hubName: string;
  assignedBy: string;
  reason: SupportAssignmentReason;
  priority: SupportAssignmentPriority;
  notes?: string;
  assignedDate: string;
  removedDate?: string;
  removedReason?: string;
  status: AssignmentHistoryStatus;
}

export interface AssignSupportExecutivePayload {
  executiveId: string;
  reason: SupportAssignmentReason;
  priority: SupportAssignmentPriority;
  notes?: string;
  assignedBy?: string;
}

export interface RemoveSupportExecutivePayload {
  reason: string;
  removedBy?: string;
}

export interface SupportExecutiveFilters {
  search: string;
  hubId: string;
  status: string;
}

export const SUPPORT_ASSIGNMENT_REASON_LABELS: Record<
  SupportAssignmentReason,
  string
> = {
  CUSTOMER_SUPPORT: "Customer Support",
  COMPLAINT_HANDLING: "Complaint Handling",
  BULK_ORDER_ASSISTANCE: "Bulk Order Assistance",
  KYC_VERIFICATION: "KYC Verification",
  MANUAL_FOLLOW_UP: "Manual Follow-up",
  RELATIONSHIP_MANAGEMENT: "Relationship Management",
};

export const SUPPORT_ASSIGNMENT_PRIORITY_LABELS: Record<
  SupportAssignmentPriority,
  string
> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const EXECUTIVE_STATUS_LABELS: Record<
  ExecutiveAvailabilityStatus,
  string
> = {
  AVAILABLE: "Available",
  BUSY: "Busy",
  OFFLINE: "Offline",
  LEAVE: "Leave",
};

export const EXECUTIVE_STATUS_STYLES: Record<
  ExecutiveAvailabilityStatus,
  { badge: string; dot: string }
> = {
  AVAILABLE: {
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    dot: "bg-emerald-500",
  },
  BUSY: {
    badge: "bg-orange-50 text-orange-700 border border-orange-100",
    dot: "bg-orange-500",
  },
  OFFLINE: {
    badge: "bg-slate-50 text-slate-600 border border-slate-200",
    dot: "bg-slate-400",
  },
  LEAVE: {
    badge: "bg-red-50 text-red-600 border border-red-100",
    dot: "bg-red-400",
  },
};

export interface CustomerExecutiveRecord {
  id: string;
  employeeId: string;
  name: string;
  photo?: string;
  phone: string;
  email: string;
  hubId: string;
  hub: string;
  region: string;
  assignedCustomers: number;
  todayOrders: number;
  totalOrders: number;
  todayCalls: number;
  status: ExecutiveAvailabilityStatus;
  joiningDate: string;
}

export interface ExecutiveDashboardStats {
  totalExecutives: number;
  availableToday: number;
  ordersCreatedToday: number;
  customerCallsAssisted: number;
  joinedThisMonth: number;
}

export interface ExecutiveFilters {
  search: string;
  region: string;
  hubId: string;
  status: string;
  dateRange: string;
}

export interface ExecutiveQueryParams {
  page: number;
  limit: number;
  filters: ExecutiveFilters;
}

export interface ExecutiveQueryResult {
  data: CustomerExecutiveRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: ExecutiveDashboardStats;
}

export interface ExecutiveProfileDetail extends CustomerExecutiveRecord {
  assignedRegions: string[];
  recentOrders: ExecutiveOrderRow[];
  assignedCustomerRows: ExecutiveAssignedCustomerRow[];
}

export interface ExecutiveOrderRow {
  id: string;
  orderId: string;
  customerName: string;
  hub: string;
  amount: number;
  orderSource: OrderSource;
  date: string;
  status: CustomerOrderStatus;
}

export interface ExecutiveAssignedCustomerRow {
  id: string;
  customerName: string;
  phone: string;
  city: string;
  lastOrderDate: string | null;
  assignedSince: string;
  status: "ACTIVE" | "NEW_LEAD" | "INACTIVE";
}

export const EMPTY_EXECUTIVE_FILTERS: ExecutiveFilters = {
  search: "",
  region: "all",
  hubId: "all",
  status: "all",
  dateRange: "7",
};

export const EXECUTIVE_PAGE_SIZE = 10;

export const EMPTY_SUPPORT_EXECUTIVE_FILTERS: SupportExecutiveFilters = {
  search: "",
  hubId: "all",
  status: "all",
};
