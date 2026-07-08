import type { SubHubOperationalStatus } from "@/types/erp.types";
import { cn } from "@/lib/utils";

const statusStyles: Record<SubHubOperationalStatus, string> = {
  healthy: "bg-green-100 text-green-700",
  warning: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const statusLabels: Record<SubHubOperationalStatus, string> = {
  healthy: "Healthy",
  warning: "Warning",
  critical: "Critical",
};

interface SubHubStatusBadgeProps {
  status: SubHubOperationalStatus;
  className?: string;
}

export function SubHubStatusBadge({
  status,
  className,
}: SubHubStatusBadgeProps) {
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
