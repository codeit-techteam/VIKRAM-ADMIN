import type { RequisitionPriority } from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

const priorityStyles: Record<RequisitionPriority, string> = {
  critical: "bg-red-600 text-white",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-blue-100 text-blue-700",
  low: "bg-gray-100 text-gray-600",
};

interface PriorityBadgeProps {
  priority: RequisitionPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase",
        priorityStyles[priority],
        className,
      )}
    >
      {priority}
    </span>
  );
}
