export type BulkProcurementStatus =
  | "NEW"
  | "ASSIGNED"
  | "CONTACTED"
  | "IN_PROGRESS"
  | "QUOTE_PREPARED"
  | "QUOTE_SENT"
  | "QUOTED"
  | "NEGOTIATION"
  | "CONVERTED"
  | "ORDER_CREATED"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED";

export type BulkDeliveryRequirement =
  | "IMMEDIATE"
  | "TODAY"
  | "TOMORROW"
  | "WITHIN_3_DAYS"
  | "WITHIN_1_WEEK"
  | "FLEXIBLE";

export type BulkFollowUpStatus = "PENDING" | "COMPLETED" | "MISSED";

export type BulkQuotationStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED";

export interface BulkTimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  actor?: string;
}

export interface BulkFollowUp {
  id: string;
  followUpAt: string;
  note: string;
  status: BulkFollowUpStatus;
  createdByName?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export interface BulkInternalNote {
  id: string;
  note: string;
  createdByName?: string | null;
  createdAt: string;
}

export interface BulkQuotation {
  id: string;
  quotationNumber: string;
  status: BulkQuotationStatus;
  materialLabel: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  deliveryCharge: number;
  gstPercent: number;
  discountAmount: number;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  productId?: string | null;
  notes?: string | null;
  validUntil?: string | null;
  sentAt?: string | null;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  createdAt: string;
}

export interface BulkProcurementRequest {
  id: string;
  enquiryNumber: string;
  company: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  project: string;
  projectLocation: string;
  material: string;
  quantity: number;
  unit: string;
  quantityLabel: string;
  materialLines: Array<{ name: string; quantity: number; unit: string }>;
  deliveryRequirement?: BulkDeliveryRequirement | null;
  deliveryDate?: string | null;
  status: BulkProcurementStatus;
  assignedExecutiveId?: string | null;
  assignedExecutiveName?: string | null;
  estimatedValue?: number | null;
  quotedValue?: number | null;
  pipelineDisplay: string;
  remarks?: string | null;
  additionalNotes?: string | null;
  preferredContact?: string | null;
  convertedOrderId?: string | null;
  addressId?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  createdAt: string;
  updatedAt: string;
  timeline: BulkTimelineEvent[];
  followUps: BulkFollowUp[];
  internalNotes: BulkInternalNote[];
  quotations: BulkQuotation[];
}

export interface BulkProcurementDashboardStats {
  openRequests: number;
  assigned: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  estimatedPipeline: number;
  quotedPipeline: number;
  convertedValue: number;
  awaitingQuoteCount?: number;
  /** Display value for pipeline card — currency or "Awaiting Quote" */
  pipelineDisplay: string;
}

export const BULK_STATUS_OPTIONS: {
  value: BulkProcurementStatus;
  label: string;
}[] = [
  { value: "NEW", label: "New" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "QUOTE_PREPARED", label: "Quote Prepared" },
  { value: "QUOTE_SENT", label: "Quote Sent" },
  { value: "QUOTED", label: "Quoted" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "CONVERTED", label: "Converted" },
  { value: "ORDER_CREATED", label: "Order Created" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "EXPIRED", label: "Expired" },
];

export const BULK_DELIVERY_LABELS: Record<BulkDeliveryRequirement, string> = {
  IMMEDIATE: "Immediate",
  TODAY: "Today",
  TOMORROW: "Tomorrow",
  WITHIN_3_DAYS: "Within 3 days",
  WITHIN_1_WEEK: "Within 1 week",
  FLEXIBLE: "Flexible",
};

export const TERMINAL_BULK_STATUSES: BulkProcurementStatus[] = [
  "CONVERTED",
  "ORDER_CREATED",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
  "EXPIRED",
];
