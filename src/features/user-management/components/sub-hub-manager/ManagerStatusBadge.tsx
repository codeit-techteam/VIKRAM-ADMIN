"use client";

import {
  MANAGER_STATUS_LABELS,
  MANAGER_STATUS_STYLES,
  type ManagerStatus,
} from "@/features/user-management/types/sub-hub-manager.types";
import { cn } from "@/lib/utils";

interface ManagerStatusBadgeProps {
  status: ManagerStatus;
  className?: string;
}

export function ManagerStatusBadge({
  status,
  className,
}: ManagerStatusBadgeProps) {
  const styles = MANAGER_STATUS_STYLES[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase",
        styles.badge,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", styles.dot)} />
      {MANAGER_STATUS_LABELS[status]}
    </span>
  );
}
