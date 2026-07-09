"use client";

import {
  EXECUTIVE_STATUS_LABELS,
  EXECUTIVE_STATUS_STYLES,
  type ExecutiveAvailabilityStatus,
} from "@/features/user-management/types/support-executive.types";
import { cn } from "@/lib/utils";

interface ExecutiveStatusBadgeProps {
  status: ExecutiveAvailabilityStatus;
  className?: string;
}

export function ExecutiveStatusBadge({
  status,
  className,
}: ExecutiveStatusBadgeProps) {
  const styles = EXECUTIVE_STATUS_STYLES[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase",
        styles.badge,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", styles.dot)} />
      {EXECUTIVE_STATUS_LABELS[status]}
    </span>
  );
}
