import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type {
  MembershipPaymentStatus,
  MembershipPlanType,
  MembershipStatus,
} from "@/mock/mockMemberships";

const statusVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        ACTIVE: "bg-green-100 text-green-700",
        EXPIRED: "bg-gray-100 text-gray-600",
        EXPIRING_SOON: "bg-amber-100 text-amber-700",
        CANCELLED: "bg-red-100 text-red-700",
      },
    },
    defaultVariants: { variant: "ACTIVE" },
  },
);

const paymentVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        PAID: "bg-green-100 text-green-700",
        PENDING: "bg-amber-100 text-amber-700",
        REFUNDED: "bg-blue-100 text-blue-700",
      },
    },
    defaultVariants: { variant: "PAID" },
  },
);

const planVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        SILVER: "bg-gray-100 text-gray-700",
        GOLD: "bg-amber-100 text-amber-800",
        PLATINUM: "bg-purple-100 text-purple-700",
      },
    },
    defaultVariants: { variant: "SILVER" },
  },
);

export function MembershipStatusBadge({
  status,
  className,
}: {
  status: MembershipStatus;
  className?: string;
}) {
  const label =
    status === "EXPIRING_SOON"
      ? "Expiring Soon"
      : status.charAt(0) + status.slice(1).toLowerCase();

  return (
    <span className={cn(statusVariants({ variant: status }), className)}>
      {label}
    </span>
  );
}

export function MembershipPaymentBadge({
  status,
  className,
}: {
  status: MembershipPaymentStatus;
  className?: string;
}) {
  return (
    <span className={cn(paymentVariants({ variant: status }), className)}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export function MembershipPlanBadge({
  plan,
  className,
}: {
  plan: MembershipPlanType;
  className?: string;
}) {
  return (
    <span className={cn(planVariants({ variant: plan }), className)}>
      {plan.charAt(0) + plan.slice(1).toLowerCase()}
    </span>
  );
}
