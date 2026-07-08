"use client";

import type { TransferListItem, TransferStatus } from "@/types/warehouse.types";
import { isTransferDelayed } from "@/mock/transfers";
import { normalizeTransferStatus } from "@/utils/transfer-actions";
import { cn } from "@/lib/utils";

type DisplayStatus =
  | "Draft"
  | "Transfer Created"
  | "Loading"
  | "Ready For Dispatch"
  | "In Transit"
  | "Reached Hub"
  | "Delivered"
  | "Cancelled"
  | "Delayed";

const statusStyles: Record<DisplayStatus, string> = {
  Draft: "bg-slate-100 text-slate-600",
  "Transfer Created": "bg-slate-100 text-slate-700",
  Loading: "bg-blue-50 text-blue-700",
  "Ready For Dispatch": "bg-emerald-50 text-emerald-700",
  "In Transit": "bg-sky-50 text-sky-700",
  "Reached Hub": "bg-amber-50 text-amber-700",
  Delivered: "bg-green-50 text-green-700",
  Cancelled: "bg-red-50 text-red-600",
  Delayed: "bg-orange-50 text-orange-700",
};

const statusDots: Partial<Record<DisplayStatus, string>> = {
  "In Transit": "bg-sky-500",
  Delayed: "bg-orange-500",
  Delivered: "bg-green-500",
};

function mapStatus(status: TransferStatus): DisplayStatus {
  switch (normalizeTransferStatus(status)) {
    case "DRAFT":
      return "Draft";
    case "TRANSFER_CREATED":
      return "Transfer Created";
    case "LOADING":
      return "Loading";
    case "READY_FOR_DISPATCH":
      return "Ready For Dispatch";
    case "IN_TRANSIT":
      return "In Transit";
    case "REACHED_HUB":
      return "Reached Hub";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
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
