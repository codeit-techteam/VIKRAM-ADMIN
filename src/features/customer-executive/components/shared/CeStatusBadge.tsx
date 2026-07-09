import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type {
  ComplaintPriority,
  ComplaintStatus,
  CustomerStatus,
  LinkStatus,
  OrderSource,
  OrderStatus,
  PaymentStatus,
} from "@/features/customer-executive/types";

type CeStatus =
  | OrderStatus
  | OrderSource
  | PaymentStatus
  | LinkStatus
  | ComplaintStatus
  | ComplaintPriority
  | CustomerStatus
  | "ACTIVE"
  | "RESOLVED"
  | "CRITICAL"
  | "VIP";

const ceStatusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        ACTIVE: "bg-blue-100 text-blue-700",
        IN_TRANSIT: "bg-indigo-100 text-indigo-700",
        DELIVERED: "bg-purple-100 text-purple-700",
        CANCELLED: "bg-red-100 text-red-700",
        HUB_PROCESSING: "bg-orange-100 text-orange-700",
        APP: "bg-blue-50 text-blue-600 border border-blue-100",
        EXECUTIVE: "bg-orange-50 text-orange-600 border border-orange-100",
        PENDING: "bg-red-100 text-red-700",
        PAID: "bg-green-100 text-green-700",
        PARTIAL: "bg-blue-100 text-blue-700",
        EXPIRED: "bg-gray-100 text-gray-600",
        NOT_SENT: "bg-red-50 text-red-600",
        SENT: "bg-blue-50 text-blue-600",
        OPENED: "bg-green-50 text-green-600",
        OPEN: "bg-blue-100 text-blue-700",
        IN_PROGRESS: "bg-orange-100 text-orange-700",
        RESOLVED: "bg-green-100 text-green-700",
        ESCALATED: "bg-red-100 text-red-700",
        LOW: "bg-blue-100 text-blue-700",
        MEDIUM: "bg-amber-100 text-amber-700",
        HIGH: "bg-red-100 text-red-700",
        CRITICAL: "bg-red-200 text-red-800",
        VIP: "bg-amber-100 text-amber-800",
        INACTIVE: "bg-gray-100 text-gray-600",
      },
    },
    defaultVariants: {
      variant: "ACTIVE",
    },
  },
);

interface CeStatusBadgeProps extends VariantProps<
  typeof ceStatusBadgeVariants
> {
  status: CeStatus;
  label?: string;
  className?: string;
}

export function CeStatusBadge({
  status,
  label,
  className,
}: CeStatusBadgeProps) {
  const displayLabel =
    label ??
    (status === "EXECUTIVE"
      ? "EXECUTIVE"
      : status === "APP"
        ? "APP"
        : status.replace(/_/g, " "));

  return (
    <span className={cn(ceStatusBadgeVariants({ variant: status }), className)}>
      {displayLabel}
    </span>
  );
}

export function CeOrderSourceBadge({
  source,
  className,
}: {
  source: OrderSource;
  className?: string;
}) {
  return <CeStatusBadge status={source} className={className} />;
}
