import type { MaterialAllocationStatus } from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

const statusStyles: Record<MaterialAllocationStatus, string> = {
  NOT_ALLOCATED: "bg-sky-100 text-sky-700",
  PARTIALLY_ALLOCATED: "bg-orange-100 text-orange-700",
  ALLOCATED: "bg-green-100 text-green-700",
};

const statusLabels: Record<MaterialAllocationStatus, string> = {
  NOT_ALLOCATED: "Not Allocated",
  PARTIALLY_ALLOCATED: "Partially Allocated",
  ALLOCATED: "Allocated",
};

interface StatusBadgeProps {
  status: MaterialAllocationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        statusStyles[status],
        className,
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
