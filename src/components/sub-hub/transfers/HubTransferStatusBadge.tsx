import { cn } from "@/lib/utils";
import { HUB_TRANSFER_STATUS_LABELS } from "@/mock/hub-transfers";
import type { HubTransferStatus } from "@/types/hub-transfer.types";

const statusStyles: Record<HubTransferStatus, string> = {
  PENDING_DISPATCH: "bg-amber-100 text-amber-700",
  ASSIGNED: "bg-indigo-100 text-indigo-700",
  DISPATCHED: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

interface HubTransferStatusBadgeProps {
  status: HubTransferStatus;
  /** When true and not yet delivered/cancelled, surface Delayed instead of pipeline status. */
  isDelayed?: boolean;
  className?: string;
}

export function HubTransferStatusBadge({
  status,
  isDelayed = false,
  className,
}: HubTransferStatusBadgeProps) {
  const showDelayed =
    isDelayed && status !== "DELIVERED" && status !== "CANCELLED";

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase",
        showDelayed ? "bg-red-100 text-red-700" : statusStyles[status],
        className,
      )}
    >
      {showDelayed ? "Delayed" : HUB_TRANSFER_STATUS_LABELS[status]}
    </span>
  );
}
