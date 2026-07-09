export type ExecutiveAvailabilityStatus = "AVAILABLE" | "BUSY" | "OFFLINE";

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
};

export const EMPTY_SUPPORT_EXECUTIVE_FILTERS: SupportExecutiveFilters = {
  search: "",
  hubId: "all",
  status: "all",
};
