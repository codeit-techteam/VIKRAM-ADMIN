"use client";

import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  HUB_ASSIGNED: "bg-indigo-100 text-indigo-700",
  AWAITING_HUB_ALLOCATION: "bg-indigo-100 text-indigo-700",
  ACCEPTED_BY_HUB: "bg-sky-100 text-sky-700",
  PROCESSING: "bg-sky-100 text-sky-700",
  PICKING: "bg-amber-100 text-amber-700",
  PACKED: "bg-orange-100 text-orange-700",
  READY_FOR_DISPATCH: "bg-orange-100 text-orange-700",
  DRIVER_ASSIGNED: "bg-violet-100 text-violet-700",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-700",
  DISPATCHED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  FAILED_DELIVERY: "bg-red-200 text-red-800",
};

interface HubOrderStatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export function HubOrderStatusBadge({
  status,
  label,
  className,
}: HubOrderStatusBadgeProps) {
  const key = status.toUpperCase().replace(/\s+/g, "_");
  const style = STATUS_STYLES[key] ?? "bg-gray-100 text-gray-600";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        style,
        className,
      )}
    >
      {label ?? status.replaceAll("_", " ")}
    </span>
  );
}
