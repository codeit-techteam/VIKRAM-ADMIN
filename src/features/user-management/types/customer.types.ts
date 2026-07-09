export type CustomerType =
  "INDIVIDUAL" | "CONTRACTOR" | "BUILDER" | "INTERIOR_DESIGNER";

export type CustomerStatus =
  "PENDING_VERIFICATION" | "ACTIVE" | "BLOCKED" | "INACTIVE";

export type CustomerOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

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

export interface CustomerActivityTimestamps {
  registeredAt: string;
  kycVerifiedAt?: string;
  firstLoginAt?: string;
  firstOrderAt?: string;
  latestOrderAt?: string;
  executiveAssignedAt?: string;
}

export interface CustomerRecord {
  id: string;
  customerId: string;
  name: string;
  phone: string;
  email: string;
  customerType: CustomerType;
  status: CustomerStatus;
  registrationDate: string;
  address: CustomerAddress;
  activity: CustomerActivityTimestamps;
}

export interface CustomerOrder {
  id: string;
  orderId: string;
  customerId: string;
  date: string;
  hubId: string;
  status: CustomerOrderStatus;
  amount: number;
}

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
  | "EXECUTIVE_ASSIGNED";

export interface CustomerActivityEvent {
  type: CustomerActivityEventType;
  label: string;
  date: string;
  description?: string;
}

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
