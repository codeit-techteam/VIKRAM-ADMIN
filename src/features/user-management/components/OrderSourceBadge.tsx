"use client";

import type { OrderSource } from "@/features/user-management/types/customer.types";
import { ORDER_SOURCE_LABELS } from "@/features/user-management/types/customer.types";
import { cn } from "@/lib/utils";

const ORDER_SOURCE_STYLES: Record<
  OrderSource,
  { badge: string; label: string }
> = {
  CUSTOMER_APP: {
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    label: ORDER_SOURCE_LABELS.CUSTOMER_APP,
  },
  CUSTOMER_EXECUTIVE: {
    badge: "bg-orange-50 text-orange-700 border border-orange-100",
    label: ORDER_SOURCE_LABELS.CUSTOMER_EXECUTIVE,
  },
  SUPER_ADMIN: {
    badge: "bg-blue-50 text-blue-700 border border-blue-100",
    label: ORDER_SOURCE_LABELS.SUPER_ADMIN,
  },
};

interface OrderSourceBadgeProps {
  source: OrderSource;
  className?: string;
}

export function OrderSourceBadge({ source, className }: OrderSourceBadgeProps) {
  const styles = ORDER_SOURCE_STYLES[source];

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase",
        styles.badge,
        className,
      )}
    >
      {styles.label}
    </span>
  );
}
