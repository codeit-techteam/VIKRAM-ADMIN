import type { TransferListItem, TransferStatus } from "@/types/warehouse.types";
import { isTransferDelayed } from "@/mock/transfers";
import { cn } from "@/lib/utils";

type DisplayStatus =
  | "Created"
  | "Vehicle Assigned"
  | "Ready"
  | "Dispatched"
  | "In Transit"
  | "Reached Hub"
  | "Completed"
  | "Delayed";

const statusStyles: Record<DisplayStatus, string> = {
  Created: "bg-slate-100 text-slate-700",
  "Vehicle Assigned": "bg-blue-50 text-blue-700",
  Ready: "bg-emerald-50 text-emerald-700",
  Dispatched: "bg-violet-50 text-violet-700",
  "In Transit": "bg-sky-50 text-sky-700",
  "Reached Hub": "bg-indigo-50 text-indigo-700",
  Completed: "bg-green-50 text-green-700",
  Delayed: "bg-orange-50 text-orange-700",
};

const statusDots: Partial<Record<DisplayStatus, string>> = {
  "In Transit": "bg-sky-500",
  Delayed: "bg-orange-500",
  Completed: "bg-green-500",
};

function mapStatus(status: TransferStatus): DisplayStatus {
  switch (status) {
    case "CREATED":
      return "Created";
    case "VEHICLE_ASSIGNED":
      return "Vehicle Assigned";
    case "DRIVER_ASSIGNED":
    case "READY":
      return "Ready";
    case "DISPATCHED":
      return "Dispatched";
    case "IN_TRANSIT":
      return "In Transit";
    case "REACHED_HUB":
      return "Reached Hub";
    case "DELIVERED":
      return "Completed";
    default:
      return "Created";
  }
}

interface TransferStatusBadgeProps {
  transfer: TransferListItem;
  className?: string;
}

export function TransferStatusBadge({
  transfer,
  className,
}: TransferStatusBadgeProps) {
  const displayStatus: DisplayStatus = isTransferDelayed(transfer)
    ? "Delayed"
    : mapStatus(transfer.status);

  const dotClass = statusDots[displayStatus];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        statusStyles[displayStatus],
        className,
      )}
    >
      {dotClass ? (
        <span
          className={cn("size-1.5 shrink-0 rounded-full", dotClass)}
          aria-hidden="true"
        />
      ) : null}
      {displayStatus}
    </span>
  );
}
