"use client";

import type { TransferListItem, TransferStatus } from "@/types/warehouse.types";
import { isTransferDelayed } from "@/mock/transfers";
import { cn } from "@/lib/utils";

type DisplayStatus =
  | "Draft"
  | "Transfer Created"
  | "Vehicle Assigned"
  | "Driver Assigned"
  | "Ready For Dispatch"
  | "Pending Dispatch"
  | "Loading"
  | "Dispatch Started"
  | "In Transit"
  | "Delivered"
  | "Reached Hub"
  | "Hub Received"
  | "Completed"
  | "Delayed";

const statusStyles: Record<DisplayStatus, string> = {
  Draft: "bg-slate-100 text-slate-600",
  "Transfer Created": "bg-slate-100 text-slate-700",
  "Vehicle Assigned": "bg-blue-50 text-blue-700",
  "Driver Assigned": "bg-indigo-50 text-indigo-700",
  "Ready For Dispatch": "bg-emerald-50 text-emerald-700",
  "Pending Dispatch": "bg-orange-50 text-orange-700",
  Loading: "bg-blue-50 text-blue-700",
  "Dispatch Started": "bg-violet-50 text-violet-700",
  "In Transit": "bg-sky-50 text-sky-700",
  Delivered: "bg-amber-50 text-amber-700",
  "Reached Hub": "bg-amber-50 text-amber-700",
  "Hub Received": "bg-teal-50 text-teal-700",
  Completed: "bg-green-50 text-green-700",
  Delayed: "bg-orange-50 text-orange-700",
};

const statusDots: Partial<Record<DisplayStatus, string>> = {
  "In Transit": "bg-sky-500",
  Delayed: "bg-orange-500",
  Completed: "bg-green-500",
  Delivered: "bg-amber-500",
};

function mapStatus(status: TransferStatus): DisplayStatus {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "CREATED":
      return "Transfer Created";
    case "VEHICLE_ASSIGNED":
      return "Vehicle Assigned";
    case "DRIVER_ASSIGNED":
      return "Driver Assigned";
    case "READY_FOR_DISPATCH":
      return "Ready For Dispatch";
    case "PENDING_DISPATCH":
      return "Pending Dispatch";
    case "LOADING":
      return "Loading";
    case "DISPATCH_STARTED":
      return "Dispatch Started";
    case "IN_TRANSIT":
      return "In Transit";
    case "REACHED_HUB":
      return "Reached Hub";
    case "DELIVERED":
      return "Delivered";
    case "HUB_RECEIVED":
      return "Hub Received";
    case "COMPLETED":
      return "Completed";
    default:
      return "Transfer Created";
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
