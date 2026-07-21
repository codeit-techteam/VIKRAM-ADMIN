import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { BulkProcurementStatus } from "@/mock/mockBulkProcurement";

const statusVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        OPEN: "bg-blue-100 text-blue-700",
        ASSIGNED: "bg-purple-100 text-purple-700",
        IN_PROGRESS: "bg-amber-100 text-amber-700",
        COMPLETED: "bg-green-100 text-green-700",
        CANCELLED: "bg-red-100 text-red-700",
      },
    },
    defaultVariants: { variant: "OPEN" },
  },
);

const LABELS: Record<BulkProcurementStatus, string> = {
  OPEN: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function BulkProcurementStatusBadge({
  status,
  className,
}: {
  status: BulkProcurementStatus;
  className?: string;
}) {
  return (
    <span className={cn(statusVariants({ variant: status }), className)}>
      {LABELS[status]}
    </span>
  );
}
