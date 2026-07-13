import { cn } from "@/lib/utils";
import { DISPATCH_LOG_STATUS_LABELS } from "@/mock/dispatch-logs";
import type { DispatchLogStatus } from "@/types/dispatch-log.types";

const statusStyles: Record<DispatchLogStatus, string> = {
  READY_FOR_DISPATCH: "bg-amber-100 text-amber-700",
  ASSIGNED: "bg-indigo-100 text-indigo-700",
  DISPATCHED: "bg-blue-100 text-blue-700",
  REACHED_AREA: "bg-cyan-100 text-cyan-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
};

interface DispatchLogStatusBadgeProps {
  status: DispatchLogStatus;
  className?: string;
}

export function DispatchLogStatusBadge({
  status,
  className,
}: DispatchLogStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase",
        statusStyles[status],
        className,
      )}
    >
      {DISPATCH_LOG_STATUS_LABELS[status]}
    </span>
  );
}
