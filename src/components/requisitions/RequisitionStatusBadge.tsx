import { cn } from "@/lib/utils";
import type { RequisitionStatus } from "@/types/warehouse.types";

const statusStyles: Record<RequisitionStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  ALLOCATED: "bg-blue-100 text-blue-700",
  TRANSFERRED: "bg-indigo-100 text-indigo-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
};

const statusLabels: Record<RequisitionStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  ALLOCATED: "Allocated",
  TRANSFERRED: "Transferred",
  COMPLETED: "Completed",
};

interface RequisitionStatusBadgeProps {
  status: RequisitionStatus;
  className?: string;
}

export function RequisitionStatusBadge({
  status,
  className,
}: RequisitionStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase",
        statusStyles[status],
        className,
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
