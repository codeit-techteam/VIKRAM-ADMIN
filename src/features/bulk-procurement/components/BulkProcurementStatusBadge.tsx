import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { BulkProcurementStatus } from "@/features/bulk-procurement/types";

const statusVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        NEW: "bg-blue-100 text-blue-700",
        ASSIGNED: "bg-purple-100 text-purple-700",
        CONTACTED: "bg-indigo-100 text-indigo-700",
        IN_PROGRESS: "bg-amber-100 text-amber-700",
        QUOTE_PREPARED: "bg-cyan-100 text-cyan-700",
        QUOTE_SENT: "bg-sky-100 text-sky-700",
        QUOTED: "bg-teal-100 text-teal-700",
        NEGOTIATION: "bg-orange-100 text-orange-700",
        CONVERTED: "bg-emerald-100 text-emerald-700",
        ORDER_CREATED: "bg-green-100 text-green-700",
        COMPLETED: "bg-green-100 text-green-800",
        REJECTED: "bg-rose-100 text-rose-700",
        CANCELLED: "bg-red-100 text-red-700",
        EXPIRED: "bg-gray-100 text-gray-600",
      },
    },
    defaultVariants: { variant: "NEW" },
  },
);

const LABELS: Record<BulkProcurementStatus, string> = {
  NEW: "New",
  ASSIGNED: "Assigned",
  CONTACTED: "Contacted",
  IN_PROGRESS: "In Progress",
  QUOTE_PREPARED: "Quote Prepared",
  QUOTE_SENT: "Quote Sent",
  QUOTED: "Quoted",
  NEGOTIATION: "Negotiation",
  CONVERTED: "Converted",
  ORDER_CREATED: "Order Created",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

type BadgeVariant = NonNullable<
  VariantProps<typeof statusVariants>["variant"]
>;

export function BulkProcurementStatusBadge({
  status,
  className,
}: {
  status: BulkProcurementStatus | string;
  className?: string;
}) {
  const normalized = (
    typeof status === "string" ? status.toUpperCase() : "NEW"
  ) as BulkProcurementStatus;
  const variant = (
    normalized in LABELS ? normalized : "NEW"
  ) as BadgeVariant;

  return (
    <span className={cn(statusVariants({ variant }), className)}>
      {LABELS[variant as BulkProcurementStatus] ?? normalized}
    </span>
  );
}
