import { cn } from "@/lib/utils";
import { HUB_TRANSFER_STATUS_LABELS } from "@/mock/hub-transfers";
import type { HubTransferStatus } from "@/types/hub-transfer.types";

const statusStyles: Record<HubTransferStatus, string> = {
  PENDING_DISPATCH: "bg-amber-100 text-amber-700",
  VEHICLE_ASSIGNED: "bg-sky-100 text-sky-700",
  DRIVER_ASSIGNED: "bg-indigo-100 text-indigo-700",
  PACKED: "bg-violet-100 text-violet-700",
  LOADED: "bg-purple-100 text-purple-700",
  DISPATCHED: "bg-blue-100 text-blue-700",
  REACHED_CUSTOMER_AREA: "bg-cyan-100 text-cyan-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-700",
};

interface HubTransferStatusBadgeProps {
  status: HubTransferStatus;
  className?: string;
}

export function HubTransferStatusBadge({
  status,
  className,
}: HubTransferStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase",
        statusStyles[status],
        className,
      )}
    >
      {HUB_TRANSFER_STATUS_LABELS[status]}
    </span>
  );
}
