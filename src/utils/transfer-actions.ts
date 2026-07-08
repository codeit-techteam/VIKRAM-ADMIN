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
  | "ready-for-dispatch"
  | "start-dispatch"
  | "track"
  | "mark-delivered"
  | "receive-at-hub"
  | "view-details";

const TIMELINE_LABELS: Record<TransferTimelineEventType, string> = {
  TRANSFER_CREATED: "Transfer Created",
  VEHICLE_ASSIGNED: "Vehicle Assigned",
  DRIVER_ASSIGNED: "Driver Assigned",
  READY_FOR_DISPATCH: "Ready For Dispatch",
  DISPATCH_STARTED: "Dispatch Started",
  REACHED_DESTINATION: "Reached Destination",
  DELIVERED: "Delivered",
  HUB_RECEIVED: "Hub Received",
  COMPLETED: "Completed",
};

export function createTimelineEvent(
  type: TransferTimelineEventType,
  description?: string,
): TransferTimelineEvent {
  return {
    id: `tl-${type.toLowerCase()}-${Date.now()}`,
    type,
    label: TIMELINE_LABELS[type],
    timestamp: new Date().toISOString(),
    description,
  };
}

export function hasVehicleAssigned(transfer: TransferListItem): boolean {
  return Boolean(transfer.vehicleId && transfer.vehicleNumber);
}

export function hasDriverAssigned(transfer: TransferListItem): boolean {
  return Boolean(transfer.driverId && transfer.assignedDriver);
}

export function canStartDispatch(transfer: TransferListItem): boolean {
  return (
    transfer.status === "PENDING_DISPATCH" &&
    hasVehicleAssigned(transfer) &&
    hasDriverAssigned(transfer)
  );
}

export function getTransferRowActions(
  transfer: TransferListItem,
): TransferRowAction[] {
  switch (transfer.status) {
    case "DRAFT":
      return ["continue", "delete"];

    case "CREATED":
    case "VEHICLE_ASSIGNED":
    case "DRIVER_ASSIGNED": {
      const actions: TransferRowAction[] = [];
      if (!hasVehicleAssigned(transfer)) {
        actions.push("assign-vehicle");
      }
      if (!hasDriverAssigned(transfer)) {
        actions.push("assign-driver");
      }
      if (hasVehicleAssigned(transfer) && hasDriverAssigned(transfer)) {
        actions.push("ready-for-dispatch");
      }
      return actions;
    }

    case "READY_FOR_DISPATCH":
      return ["ready-for-dispatch"];

    case "PENDING_DISPATCH":
      return canStartDispatch(transfer) ? ["start-dispatch"] : [];

    case "DISPATCH_STARTED":
    case "IN_TRANSIT":
      return ["track", "mark-delivered"];

    case "DELIVERED":
      return ["receive-at-hub"];

    case "HUB_RECEIVED":
      return ["receive-at-hub"];

    case "COMPLETED":
      return ["view-details"];

    default:
      return [];
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
    case "ready-for-dispatch":
      return "Ready For Dispatch";
    case "start-dispatch":
      return "Start Dispatch";
    case "track":
      return "Track Transfer";
    case "mark-delivered":
      return "Mark Delivered";
    case "receive-at-hub":
      return "Receive At Hub";
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
  return status === "COMPLETED";
}

export function isTransferClosed(transfer: TransferListItem): boolean {
  return transfer.status === "COMPLETED";
}
