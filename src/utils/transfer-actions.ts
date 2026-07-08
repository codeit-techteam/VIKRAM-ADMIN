import type {
  TransferListItem,
  TransferStatus,
  TransferTimelineEvent,
  TransferTimelineEventType,
} from "@/types/warehouse.types";

export type TransferRowAction =
  | "continue"
  | "delete"
  | "assign-vehicle"
  | "assign-driver"
  | "start-loading"
  | "complete-loading"
  | "dispatch-now"
  | "start-dispatch"
  | "track"
  | "update-eta"
  | "add-remarks"
  | "report-delay"
  | "mark-reached-hub"
  | "mark-delivered"
  | "receive-at-hub"
  | "view-details";

const TIMELINE_LABELS: Record<TransferTimelineEventType, string> = {
  TRANSFER_CREATED: "Transfer Created",
  VEHICLE_ASSIGNED: "Vehicle Assigned",
  DRIVER_ASSIGNED: "Driver Assigned",
  LOADING_STARTED: "Loading Started",
  LOADING_COMPLETED: "Loading Completed",
  READY_FOR_DISPATCH: "Ready For Dispatch",
  DISPATCH_STARTED: "Dispatch Started",
  IN_TRANSIT: "In Transit",
  REACHED_HUB: "Reached Hub",
  REACHED_DESTINATION: "Reached Destination",
  DELIVERED: "Delivered",
  HUB_RECEIVED: "Hub Received",
  DELAY_RECORDED: "Delay Recorded",
  COMPLETED: "Completed",
};

/** Maps legacy persisted statuses to the canonical ERP transfer status enum. */
const LEGACY_STATUS_MAP: Record<string, TransferStatus> = {
  CREATED: "TRANSFER_CREATED",
  VEHICLE_ASSIGNED: "TRANSFER_CREATED",
  DRIVER_ASSIGNED: "TRANSFER_CREATED",
  PENDING_DISPATCH: "TRANSFER_CREATED",
  DISPATCH_STARTED: "IN_TRANSIT",
  HUB_RECEIVED: "DELIVERED",
  COMPLETED: "DELIVERED",
};

export function normalizeTransferStatus(status: string): TransferStatus {
  if (status in LEGACY_STATUS_MAP) {
    return LEGACY_STATUS_MAP[status];
  }
  return status as TransferStatus;
}

export const DISPATCH_QUEUE_STATUSES: TransferStatus[] = [
  "TRANSFER_CREATED",
  "LOADING",
  "READY_FOR_DISPATCH",
  "IN_TRANSIT",
];

export const STATUS_ORDER: TransferStatus[] = [
  "DRAFT",
  "TRANSFER_CREATED",
  "LOADING",
  "READY_FOR_DISPATCH",
  "IN_TRANSIT",
  "REACHED_HUB",
  "DELIVERED",
  "CANCELLED",
];

export const WORKFLOW_TIMELINE_STEPS: TransferTimelineEventType[] = [
  "TRANSFER_CREATED",
  "VEHICLE_ASSIGNED",
  "DRIVER_ASSIGNED",
  "LOADING_STARTED",
  "LOADING_COMPLETED",
  "DISPATCH_STARTED",
  "IN_TRANSIT",
  "REACHED_HUB",
  "DELIVERED",
];

export function createTimelineEvent(
  type: TransferTimelineEventType,
  description?: string,
  options?: { actor?: string; remarks?: string },
): TransferTimelineEvent {
  return {
    id: `tl-${type.toLowerCase()}-${Date.now()}`,
    type,
    label: TIMELINE_LABELS[type],
    timestamp: new Date().toISOString(),
    description,
    actor: options?.actor ?? "Warehouse Manager",
    remarks: options?.remarks,
  };
}

export function getStatusIndex(status: TransferStatus): number {
  const normalized = normalizeTransferStatus(status);
  const index = STATUS_ORDER.indexOf(normalized);
  return index === -1 ? 0 : index;
}

export function hasVehicleAssigned(transfer: TransferListItem): boolean {
  return Boolean(transfer.vehicleId && transfer.vehicleNumber);
}

export function hasDriverAssigned(transfer: TransferListItem): boolean {
  return Boolean(transfer.driverId && transfer.assignedDriver);
}

export function canStartLoading(transfer: TransferListItem): boolean {
  return (
    normalizeTransferStatus(transfer.status) === "TRANSFER_CREATED" &&
    hasVehicleAssigned(transfer) &&
    hasDriverAssigned(transfer)
  );
}

export function canCompleteLoading(transfer: TransferListItem): boolean {
  return normalizeTransferStatus(transfer.status) === "LOADING";
}

export function canDispatchNow(transfer: TransferListItem): boolean {
  return (
    normalizeTransferStatus(transfer.status) === "READY_FOR_DISPATCH" &&
    hasVehicleAssigned(transfer) &&
    hasDriverAssigned(transfer)
  );
}

/** @deprecated Use canDispatchNow */
export function canStartDispatch(transfer: TransferListItem): boolean {
  return canDispatchNow(transfer);
}

export function isInDispatchQueue(transfer: TransferListItem): boolean {
  return DISPATCH_QUEUE_STATUSES.includes(
    normalizeTransferStatus(transfer.status),
  );
}

export function isHubReceivingEligible(transfer: TransferListItem): boolean {
  return normalizeTransferStatus(transfer.status) === "REACHED_HUB";
}

export function getTransferRowActions(
  transfer: TransferListItem,
): TransferRowAction[] {
  const status = normalizeTransferStatus(transfer.status);

  switch (status) {
    case "DRAFT":
      return ["continue", "delete"];

    case "TRANSFER_CREATED": {
      const actions: TransferRowAction[] = [];
      if (!hasVehicleAssigned(transfer)) {
        actions.push("assign-vehicle");
      }
      if (!hasDriverAssigned(transfer)) {
        actions.push("assign-driver");
      }
      if (canStartLoading(transfer)) {
        actions.push("start-loading");
      }
      return actions;
    }

    case "LOADING":
      return ["complete-loading"];

    case "READY_FOR_DISPATCH":
      return canDispatchNow(transfer) ? ["dispatch-now"] : [];

    case "IN_TRANSIT":
      return ["track", "update-eta", "report-delay", "mark-reached-hub"];

    case "REACHED_HUB":
      return ["receive-at-hub"];

    case "DELIVERED":
      return ["view-details"];

    case "CANCELLED":
      return ["view-details"];

    default:
      return [];
  }
}

export function getDispatchRowAction(
  transfer: TransferListItem,
): TransferRowAction | null {
  const status = normalizeTransferStatus(transfer.status);

  switch (status) {
    case "TRANSFER_CREATED":
      return canStartLoading(transfer) ? "start-loading" : null;
    case "LOADING":
      return "complete-loading";
    case "READY_FOR_DISPATCH":
      return "dispatch-now";
    default:
      return null;
  }
}

export function getTransferActionLabel(action: TransferRowAction): string {
  switch (action) {
    case "continue":
      return "Continue Transfer";
    case "delete":
      return "Delete";
    case "assign-vehicle":
      return "Assign Vehicle";
    case "assign-driver":
      return "Assign Driver";
    case "start-loading":
      return "Start Loading";
    case "complete-loading":
      return "Complete Loading";
    case "dispatch-now":
      return "Dispatch Now";
    case "start-dispatch":
      return "Start Dispatch";
    case "track":
      return "Track Transfer";
    case "update-eta":
      return "Update ETA";
    case "add-remarks":
      return "Add Remarks";
    case "report-delay":
      return "Report Delay";
    case "mark-reached-hub":
      return "Mark Reached Hub";
    case "mark-delivered":
      return "Confirm Delivery";
    case "receive-at-hub":
      return "Confirm Delivery";
    case "view-details":
      return "View Details";
  }
}

export function getPriorityLabel(
  transfer: TransferListItem,
): "Standard" | "Critical" | "Express" {
  const priority = transfer.priority ?? transfer.transferType ?? "standard";
  switch (priority) {
    case "critical":
      return "Critical";
    case "express":
      return "Express";
    default:
      return "Standard";
  }
}

export function getPriorityStyles(transfer: TransferListItem): string {
  const priority = transfer.priority ?? transfer.transferType ?? "standard";
  switch (priority) {
    case "critical":
      return "bg-red-50 text-red-700";
    case "express":
      return "bg-orange-50 text-orange-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export function isTerminalStatus(status: TransferStatus): boolean {
  const normalized = normalizeTransferStatus(status);
  return normalized === "DELIVERED" || normalized === "CANCELLED";
}

export function isTransferClosed(transfer: TransferListItem): boolean {
  return isTerminalStatus(transfer.status);
}

export function isLoadingChecklistComplete(
  checklist: TransferListItem["loadingChecklist"],
): boolean {
  if (!checklist) return false;
  return Object.values(checklist).every(Boolean);
}

export const DEFAULT_LOADING_CHECKLIST = {
  materialPicked: false,
  quantityVerified: false,
  vehicleReady: false,
  driverPresent: false,
  documentsAttached: false,
  gatePassGenerated: false,
} as const;
