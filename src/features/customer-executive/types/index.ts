export type OrderSource = "APP" | "EXECUTIVE";

export type OrderStatus =
  "ACTIVE" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED" | "HUB_PROCESSING";

export type PaymentStatus = "PENDING" | "PAID" | "PARTIAL" | "EXPIRED";

export type LinkStatus = "NOT_SENT" | "SENT" | "EXPIRED" | "OPENED";

export type ComplaintStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "ESCALATED";

export type ComplaintPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type CustomerStatus = "ACTIVE" | "INACTIVE" | "VIP";

export type CustomerType =
  "CONTRACTOR" | "BUILDER" | "DEALER" | "ARCHITECT" | "INDIVIDUAL";

export type DeliveryPriority = "STANDARD" | "EXPRESS" | "EMERGENCY";

export type PaymentMethod = "UPI" | "CASH" | "BANK" | "CREDIT";

export type ActivityType =
  | "CUSTOMER_REGISTERED"
  | "ORDER_CREATED"
  | "PAYMENT_RECEIVED"
  | "COMPLAINT_RAISED"
  | "DELIVERY_COMPLETED"
  | "COMPLAINT_RESOLVED"
  | "PAYMENT_LINK_SENT"
  | "NOTE_ADDED";

export type TrackingStep =
  | "ORDER_CREATED"
  | "PAYMENT_RECEIVED"
  | "ACCEPTED"
  | "PACKED"
  | "LOADED"
  | "DISPATCHED"
  | "DRIVER_ASSIGNED"
  | "IN_TRANSIT"
  | "DELIVERED";

export interface CeExecutive {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarInitials: string;
  shift: string;
  isOnline: boolean;
}

export interface CeCustomer {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  gst?: string;
  city: string;
  state: string;
  pincode: string;
  address: string;
  customerType: CustomerType;
  status: CustomerStatus;
  assignedExecutiveId: string;
  photoUrl?: string;
  creditLimit: number;
  lifetimePurchase: number;
  createdAt: string;
  lastOrderAt?: string;
}

export interface CeProduct {
  id: string;
  sku: string;
  name: string;
  unit: string;
  unitPrice: number;
  imageUrl?: string;
  category: string;
}

export interface CeOrderItem {
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  unitPrice: number;
  quantity: number;
}

export interface CeOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  company: string;
  items: CeOrderItem[];
  amount: number;
  status: OrderStatus;
  orderSource: OrderSource;
  createdAt: string;
  eta?: string;
  deliveryAddress: string;
  deliveryPincode: string;
  deliveryDate?: string;
  deliveryPriority: DeliveryPriority;
  paymentMethod: PaymentMethod;
  trackingStep: TrackingStep;
  driverId?: string;
  vehicleId?: string;
  hubId: string;
}

export interface CePayment {
  id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  paidAmount: number;
  status: PaymentStatus;
  dueDate: string;
  linkStatus: LinkStatus;
  linkSentAt?: string;
  reminderCount: number;
  paymentLink?: string;
  createdAt: string;
}

export interface CeComplaint {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  company: string;
  orderId?: string;
  orderNumber?: string;
  issue: string;
  issueType: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignedExecutiveId: string;
  createdAt: string;
  resolvedAt?: string;
  internalNotes: CeNote[];
  timeline: CeActivity[];
}

export interface CeNote {
  id: string;
  customerId: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface CeActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  customerId?: string;
  orderId?: string;
  paymentId?: string;
  complaintId?: string;
  createdAt: string;
  createdBy?: string;
}

export interface CeDriver {
  id: string;
  name: string;
  phone: string;
  photoUrl?: string;
  rating: number;
}

export interface CeVehicle {
  id: string;
  registration: string;
  model: string;
  payload: string;
}

export interface CeHub {
  id: string;
  name: string;
  city: string;
  lastScannedAt?: string;
}

export interface CeNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  createdAt: string;
}

export interface CeExecutiveProfile {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  shift: string;
  avatarInitials: string;
}

export interface CeCustomerFilters {
  search: string;
  city: string;
  status: CustomerStatus | "ALL";
  customerType: CustomerType | "ALL";
}

export interface CeOrderFilters {
  search: string;
  status: OrderStatus | "ALL";
  orderSource: OrderSource | "ALL";
}

export interface CePaymentFilters {
  search: string;
  status: PaymentStatus | "ALL";
  linkStatus: LinkStatus | "ALL";
  dateRange: "7d" | "30d" | "90d" | "ALL";
}

export interface CeComplaintFilters {
  search: string;
  status: ComplaintStatus | "ALL";
  priority: ComplaintPriority | "ALL";
  issueType: string;
}

export interface CeQueryParams<T> {
  page: number;
  limit: number;
  filters: T;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface CeQueryResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CeDashboardStats {
  assignedCustomers: number;
  openComplaints: number;
  pendingPayments: number;
  pendingPaymentsAmount: number;
  avgResolutionHours: number;
}

export interface CeNewCustomerDraft {
  phone: string;
  name: string;
  company: string;
  gst?: string;
  email: string;
  customerType: CustomerType;
  address: string;
  state: string;
  city: string;
  pincode: string;
}

export interface CeNewOrderDraft {
  customerId: string;
  items: CeOrderItem[];
  deliveryAddress: string;
  deliveryPincode: string;
  deliveryDate: string;
  deliveryPriority: DeliveryPriority;
  paymentMethod: PaymentMethod;
}

export const CE_PAGE_SIZE = 10;

export const EMPTY_CUSTOMER_FILTERS: CeCustomerFilters = {
  search: "",
  city: "ALL",
  status: "ALL",
  customerType: "ALL",
};

export const EMPTY_ORDER_FILTERS: CeOrderFilters = {
  search: "",
  status: "ALL",
  orderSource: "ALL",
};

export const EMPTY_PAYMENT_FILTERS: CePaymentFilters = {
  search: "",
  status: "ALL",
  linkStatus: "ALL",
  dateRange: "7d",
};

export const EMPTY_COMPLAINT_FILTERS: CeComplaintFilters = {
  search: "",
  status: "ALL",
  priority: "ALL",
  issueType: "ALL",
};
