import type { CustomerStatus } from "@/features/user-management/types/customer.types";
import { CUSTOMER_STATUS_LABELS } from "@/features/user-management/types/customer.types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<CustomerStatus, { badge: string; dot: string }> = {
  ACTIVE: {
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    dot: "bg-emerald-500",
  },
  PENDING_VERIFICATION: {
    badge: "bg-amber-50 text-amber-700 border border-amber-100",
    dot: "bg-amber-500",
  },
  BLOCKED: {
    badge: "bg-red-50 text-red-700 border border-red-100",
    dot: "bg-red-500",
  },
  INACTIVE: {
    badge: "bg-slate-100 text-slate-600 border border-slate-200",
    dot: "bg-slate-400",
  },
};

interface CustomerStatusBadgeProps {
  status: CustomerStatus;
  className?: string;
}

export function CustomerStatusBadge({
  status,
  className,
}: CustomerStatusBadgeProps) {
  const styles = STATUS_STYLES[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
        styles.badge,
        className,
      )}
    >
      <span
        className={cn("size-2 shrink-0 rounded-full", styles.dot)}
        aria-hidden="true"
      />
      {CUSTOMER_STATUS_LABELS[status]}
    </span>
  );
}
