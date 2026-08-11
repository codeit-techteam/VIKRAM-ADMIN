import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type {
  MembershipPaymentStatus,
  MembershipPlanType,
  MembershipStatus,
} from "@/features/membership/types";

const statusVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        ACTIVE: "bg-green-100 text-green-700",
        EXPIRED: "bg-gray-100 text-gray-600",
        EXPIRING_SOON: "bg-amber-100 text-amber-700",
        CANCELLED: "bg-red-100 text-red-700",
        PENDING: "bg-blue-100 text-blue-700",
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
        FAILED: "bg-red-100 text-red-700",
      },
    },
    defaultVariants: { variant: "PAID" },
  },
);

const knownPlanVariants = cva(
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

function formatLabel(value: string) {
  if (!value) return "—";
  if (value.includes(" ")) return value;
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export function MembershipStatusBadge({
  status,
  className,
}: {
  status: MembershipStatus;
  className?: string;
}) {
  const label =
    status === "EXPIRING_SOON" ? "Expiring Soon" : formatLabel(status);

  return (
    <span
      className={cn(
        statusVariants({
          variant: status as
            | "ACTIVE"
            | "EXPIRED"
            | "EXPIRING_SOON"
            | "CANCELLED"
            | "PENDING",
        }),
        className,
      )}
    >
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
    <span
      className={cn(
        paymentVariants({
          variant: status as "PAID" | "PENDING" | "REFUNDED" | "FAILED",
        }),
        className,
      )}
    >
      {formatLabel(status)}
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
  const upper = String(plan).toUpperCase();
  const known =
    upper === "SILVER" || upper === "GOLD" || upper === "PLATINUM"
      ? upper
      : null;

  if (known) {
    return (
      <span
        className={cn(knownPlanVariants({ variant: known }), className)}
      >
        {formatLabel(known)}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-800",
        className,
      )}
    >
      {formatLabel(String(plan))}
    </span>
  );
}
