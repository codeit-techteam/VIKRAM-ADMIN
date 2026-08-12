export type ExpertCallbackStatus = "NEW" | "CONTACTED" | "CLOSED";

export interface ExpertCallbackCustomer {
  id: string;
  phone: string;
  fullName?: string | null;
}

export interface ExpertCallbackExecutive {
  id: string;
  fullName: string;
}

export interface ExpertCallbackRequest {
  id: string;
  contactName: string;
  needs: string;
  phoneSnapshot?: string | null;
  categorySlug?: string | null;
  categoryName?: string | null;
  status: ExpertCallbackStatus;
  executiveNotes?: string | null;
  contactedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  customer: ExpertCallbackCustomer;
  assignedExecutive?: ExpertCallbackExecutive | null;
}

export interface ExpertCallbackStats {
  total: number;
  new: number;
  contacted: number;
  closed: number;
}

export const EXPERT_CALLBACK_STATUS_LABELS: Record<
  ExpertCallbackStatus,
  string
> = {
  NEW: "New",
  CONTACTED: "Contacted",
  CLOSED: "Closed",
};

export const EXPERT_CALLBACK_PAGE_SIZE = 10;
