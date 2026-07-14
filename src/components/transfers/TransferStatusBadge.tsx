"use client";

import type { TransferListItem, TransferStatus } from "@/types/warehouse.types";
import { isTransferDelayed } from "@/mock/transfers";
import { normalizeTransferStatus } from "@/utils/transfer-actions";
import { cn } from "@/lib/utils";

/** MVP-facing status labels shown in tables, filters, and cards. */
export type TransferDisplayStatus =
  | "Draft"
  | "Pending Dispatch"
  | "Loading"
  | "Ready to Dispatch"
  | "In Transit"
  | "Reached Hub"
  | "Delivered"
  | "Cancelled"
  | "Delayed"
  | "Dispatched Today";

export const TRANSFER_STATUS_LABELS: Record<TransferStatus, string> = {
  DRAFT: "Draft",
  TRANSFER_CREATED: "Pending Dispatch",
  LOADING: "Loading",
  READY_FOR_DISPATCH: "Ready to Dispatch",
  IN_TRANSIT: "In Transit",
  REACHED_HUB: "Reached Hub",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const statusStyles: Record<TransferDisplayStatus, string> = {
  Draft: "bg-slate-100 text-slate-600",
  "Pending Dispatch": "bg-amber-50 text-amber-700",
  Loading: "bg-blue-50 text-blue-700",
  "Ready to Dispatch": "bg-emerald-50 text-emerald-700",
  "In Transit": "bg-sky-50 text-sky-700",
  "Reached Hub": "bg-amber-50 text-amber-700",
  Delivered: "bg-green-50 text-green-700",
  Cancelled: "bg-red-50 text-red-600",
  Delayed: "bg-orange-50 text-orange-700",
  "Dispatched Today": "bg-indigo-50 text-indigo-700",
};

const statusDots: Partial<Record<TransferDisplayStatus, string>> = {
  "In Transit": "bg-sky-500",
  Delayed: "bg-orange-500",
  Delivered: "bg-green-500",
  "Dispatched Today": "bg-indigo-500",
};

export function getTransferDisplayStatus(
  transfer: TransferListItem,
  options?: { forceDispatchedToday?: boolean },
): TransferDisplayStatus {
  if (options?.forceDispatchedToday) {
    return "Dispatched Today";
  }

  if (isTransferDelayed(transfer)) {
    return "Delayed";
  }

  return TRANSFER_STATUS_LABELS[
    normalizeTransferStatus(transfer.status)
  ] as TransferDisplayStatus;
}

interface TransferStatusBadgeProps {
  transfer: TransferListItem;
  className?: string;
  /** When filtering by Dispatched Today, show that label instead of In Transit. */
  forceDispatchedToday?: boolean;
}

export function TransferStatusBadge({
  transfer,
  className,
  forceDispatchedToday = false,
}: TransferStatusBadgeProps) {
  const displayStatus = getTransferDisplayStatus(transfer, {
    forceDispatchedToday,
  });

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
