import type {
  SupportExecutiveAssignment,
  SupportExecutiveAssignmentHistoryEntry,
} from "@/features/user-management/types/support-executive.types";

export type CustomerType =
  "INDIVIDUAL" | "CONTRACTOR" | "BUILDER" | "INTERIOR_DESIGNER";

export type CustomerStatus =
  "PENDING_VERIFICATION" | "ACTIVE" | "BLOCKED" | "INACTIVE";

export type CustomerOrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "PACKED"
  | "DISPATCHED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type OrderSource = "CUSTOMER_APP" | "CUSTOMER_EXECUTIVE" | "SUPER_ADMIN";

export type CustomerKycStatus = "PENDING" | "VERIFIED" | "REJECTED";

export type CustomerBlockReason =
  "VIOLATION" | "DUPLICATE" | "FRAUD" | "MANUAL";

export type {
  SupportExecutiveAssignment,
  SupportExecutiveAssignmentHistoryEntry,
};

export interface CustomerExecutive {
  id: string;
  name: string;
  phone: string;
  email: string;
  hubId: string;
}

export interface CustomerHub {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
}

export interface CustomerAddress {
  primaryAddress: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CustomerDeliveryAddress {
  id: string;
  customerId: string;
  recipient: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  serviceHubId: string;
  serviceHubName: string;
  isDefault: boolean;
}

export interface CustomerOrderProduct {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface CustomerOrderTimelineEvent {
  status: CustomerOrderStatus;
  label: string;
  timestamp: string;
  note?: string;
}

export interface CustomerOrderDriver {
  name: string;
  phone: string;
  vehicleNumber: string;
}

export interface CustomerOrderDetail extends CustomerOrder {
  products: CustomerOrderProduct[];
  timeline: CustomerOrderTimelineEvent[];
  deliveryAddress: CustomerDeliveryAddress;
  hub: CustomerHub;
  executive: CustomerExecutive;
  driver?: CustomerOrderDriver;
}

export interface CustomerActivityTimestamps {
  registeredAt: string;
  kycVerifiedAt?: string;
  firstLoginAt?: string;
  firstOrderAt?: string;
  latestOrderAt?: string;
  executiveAssignedAt?: string;
  profileUpdatedAt?: string;
}

export interface CustomerRecord {
  id: string;
  customerId: string;
  name: string;
  phone: string;
  email: string;
  customerType: CustomerType;
  status: CustomerStatus;
  kycStatus: CustomerKycStatus;
  registrationDate: string;
  address: CustomerAddress;
  activity: CustomerActivityTimestamps;
  designation?: string;
  imageUrl?: string;
  blockReason?: CustomerBlockReason;
  blockedAt?: string;
  supportExecutiveAssignment?: SupportExecutiveAssignment;
}

export interface CustomerOrder {
  id: string;
  orderId: string;
  customerId: string;
  customerName?: string;
  date: string;
  hubId: string;
  status: CustomerOrderStatus;
  amount: number;
  orderSource: OrderSource;
  createdByExecutive?: string;
  executiveId?: string;
}

export const ORDER_SOURCE_LABELS: Record<OrderSource, string> = {
  CUSTOMER_APP: "Customer App",
  CUSTOMER_EXECUTIVE: "Customer Executive",
  SUPER_ADMIN: "Super Admin",
};

export interface CustomerAssignedOperations {
  hubId?: string;
  hubName: string;
  hubLocation?: string;
  executiveId?: string;
  executiveName: string;
  executiveContact?: string;
  isAssigned: boolean;
}

export interface CustomerOrderSummary {
  totalOrders: number;
  activeOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  lastOrderDate: string | null;
}

export interface CustomerListItem extends CustomerRecord {
  assignedHub: string;
  assignedExecutive: string;
  activeOrders: number;
  lastOrderDate: string | null;
  assignedOperations: CustomerAssignedOperations;
  orderSummary: CustomerOrderSummary;
}

export interface CustomerDetail extends CustomerListItem {
  orders: CustomerOrder[];
  serviceHub: string;
  deliveryAddresses: CustomerDeliveryAddress[];
}

export interface CustomerStats {
  total: number;
  active: number;
  pendingVerification: number;
  blocked: number;
  newToday: number;
}

export interface CustomerFilters {
  search: string;
  status: string;
  customerType: string;
  assignedHub: string;
  assignedExecutive: string;
  state: string;
  city: string;
  registrationDateFrom: string;
  registrationDateTo: string;
}

export interface CustomerQueryParams {
  page: number;
  limit: number;
  filters: CustomerFilters;
}

export interface CustomerQueryResult {
  data: CustomerListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: CustomerStats;
}

export type CustomerActivityEventType =
  | "REGISTERED"
  | "KYC_VERIFIED"
  | "FIRST_LOGIN"
  | "FIRST_ORDER"
  | "LATEST_ORDER"
  | "EXECUTIVE_ASSIGNED"
  | "PROFILE_UPDATED";

export interface CustomerActivityEvent {
  type: CustomerActivityEventType;
  label: string;
  date: string;
  description?: string;
  user?: string;
}

export interface CustomerEditPayload {
  name: string;
  phone: string;
  email: string;
  customerType: CustomerType;
  status: CustomerStatus;
  address: CustomerAddress;
}

export const CUSTOMER_BLOCK_REASON_LABELS: Record<CustomerBlockReason, string> =
  {
    VIOLATION: "Violation",
    DUPLICATE: "Duplicate",
    FRAUD: "Fraud",
    MANUAL: "Manual",
  };

export const CUSTOMER_KYC_STATUS_LABELS: Record<CustomerKycStatus, string> = {
  PENDING: "KYC Pending",
  VERIFIED: "KYC Verified",
  REJECTED: "KYC Rejected",
};

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  INDIVIDUAL: "Individual",
  CONTRACTOR: "Contractor",
  BUILDER: "Builder",
  INTERIOR_DESIGNER: "Interior Designer",
};

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  PENDING_VERIFICATION: "Pending Verification",
  ACTIVE: "Active",
  BLOCKED: "Blocked",
  INACTIVE: "Inactive",
};

export const EMPTY_CUSTOMER_FILTERS: CustomerFilters = {
  search: "",
  status: "all",
  customerType: "all",
  assignedHub: "all",
  assignedExecutive: "all",
  state: "all",
  city: "",
  registrationDateFrom: "",
  registrationDateTo: "",
};

export const CUSTOMER_PAGE_SIZE = 10;
