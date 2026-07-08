"use client";

import { motion } from "framer-motion";

import type { HubStockStatus } from "@/types/erp.types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<HubStockStatus, string> = {
  healthy: "bg-green-100 text-green-700 ring-green-200",
  "low-stock": "bg-orange-100 text-orange-700 ring-orange-200",
  critical: "bg-red-100 text-red-700 ring-red-200",
  reserved: "bg-blue-100 text-blue-700 ring-blue-200",
  "out-of-stock": "bg-gray-200 text-gray-700 ring-gray-300",
  overstock: "bg-emerald-100 text-emerald-700 ring-emerald-200",
};

const STATUS_LABELS: Record<HubStockStatus, string> = {
  healthy: "Healthy",
  "low-stock": "Low Stock",
  critical: "Critical",
  reserved: "Reserved",
  "out-of-stock": "Out of Stock",
  overstock: "Over Stock",
};

interface HubInventoryStatusBadgeProps {
  status: HubStockStatus;
  className?: string;
}

export function HubInventoryStatusBadge({
  status,
  className,
}: HubInventoryStatusBadgeProps) {
  return (
    <motion.span
      key={status}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </motion.span>
  );
}

export { STATUS_LABELS, STATUS_STYLES };
