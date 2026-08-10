/** Shared Sub-Hub Network ops labels/constants — no demo records. */

import type { DispatchLogFilters } from "@/types/dispatch-log.types";
import type { HubTransferFilters } from "@/types/hub-transfer.types";
import type {
  RequisitionListItem,
  RequisitionPriority,
  RequisitionStatus,
} from "@/types/warehouse.types";

export const HUB_INVENTORY_PAGE_SIZE = 10;

export const HUB_REQUISITION_PAGE_SIZE = 10;

export const HUB_TRANSFER_PAGE_SIZE = 10;

export const DISPATCH_LOG_PAGE_SIZE = 10;

export interface HubRequisitionFilters {
  status: RequisitionStatus | "all";
  hubId: string;
  material: string;
  priority: RequisitionPriority | "all";
  date: string;
}

export interface HubRequisitionStats {
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
}

export const EMPTY_HUB_REQUISITION_FILTERS: HubRequisitionFilters = {
  status: "all",
  hubId: "all",
  material: "all",
  priority: "all",
  date: "",
};

export const EMPTY_HUB_TRANSFER_FILTERS: HubTransferFilters = {
  hubId: "all",
  customer: "",
  orderId: "",
  driver: "",
  vehicle: "",
  status: "all",
  dateFrom: "",
  dateTo: "",
  priority: "all",
};

export const EMPTY_DISPATCH_LOG_FILTERS: DispatchLogFilters = {
  hubId: "all",
  customer: "",
  vehicle: "",
  driver: "",
  status: "all",
  date: "",
};

export const HUB_TRANSFER_STATUS_LABELS: Record<string, string> = {
  PENDING_DISPATCH: "Pending Dispatch",
  ASSIGNED: "Assigned",
  DISPATCHED: "In Transit",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const HUB_TRANSFER_FILTER_OPTIONS = [
  { value: "PENDING_DISPATCH", label: "Pending Dispatch" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "DISPATCHED", label: "In Transit" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "delayed", label: "Delayed" },
] as const;

export const HUB_TRANSFER_STATUS_OPTIONS = Object.entries(
  HUB_TRANSFER_STATUS_LABELS,
).map(([value, label]) => ({ value, label }));

export const DISPATCH_LOG_STATUS_LABELS: Record<string, string> = {
  READY_FOR_DISPATCH: "Ready for Dispatch",
  ASSIGNED: "Assigned",
  DISPATCHED: "Dispatched",
  REACHED_AREA: "Reached Area",
  DELIVERED: "Delivered",
};

export const DISPATCH_LOG_FILTER_OPTIONS = [
  { value: "pending-dispatch", label: "Pending Dispatch" },
  { value: "vehicle-pending", label: "Vehicle Pending" },
  { value: "driver-pending", label: "Driver Pending" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "REACHED_AREA", label: "Reached Area" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "ASSIGNED", label: "Assigned" },
] as const;

export const DISPATCH_LOG_STATUS_OPTIONS = Object.entries(
  DISPATCH_LOG_STATUS_LABELS,
).map(([value, label]) => ({ value, label }));

export function formatHubOpsDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatHubOpsDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatHubOpsQuantity(qty: number, unit: string): string {
  const formatted =
    qty % 1 === 0
      ? qty.toLocaleString("en-IN")
      : qty.toLocaleString("en-IN", { maximumFractionDigits: 1 });
  return `${formatted} ${unit}`.trim();
}

export function formatHubOpsCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

/** Aliases used by existing Sub-Hub components. */
export const formatHubTransferDateTime = formatHubOpsDateTime;
export const formatDispatchLogDateTime = formatHubOpsDateTime;
export const formatHubRequisitionDate = formatHubOpsDate;
export const formatHubRequisitionPrintDate = formatHubOpsDateTime;
export const formatRequisitionQuantity = formatHubOpsQuantity;
export const formatHubTransferCurrency = formatHubOpsCurrency;
export const formatDispatchLogCurrency = formatHubOpsCurrency;

export interface HubRequisitionInventoryContext {
  currentQty: number;
  minimumStock: number;
  unit: string;
  sku: string;
  lastUpdated?: string;
}

export interface HubRequisitionTimelineEntry {
  id: string;
  title: string;
  description?: string;
  actor: string;
  timestamp: string;
  variant: "default" | "success" | "danger" | "info";
}

export interface HubRequisitionDetailView {
  requisition: RequisitionListItem & {
    destinationWarehouse?: string;
    requestReason?: string;
    materials?: Array<{
      id: string;
      name: string;
      sku: string;
      requestedQty: number;
      approvedQty?: number | null;
      unit: string;
    }>;
  };
  hubManager: string;
  hubCity: string;
  hubRegion: string;
  inventory: HubRequisitionInventoryContext | null;
  timeline: HubRequisitionTimelineEntry[];
}