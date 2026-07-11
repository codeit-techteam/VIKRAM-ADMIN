import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { FinancePaymentStatus } from "@/features/finance/types";

const financeStatusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        Pending: "bg-amber-100 text-amber-700",
        Paid: "bg-green-100 text-green-700",
        Cancelled: "bg-red-100 text-red-700",
      },
    },
    defaultVariants: {
      variant: "Pending",
    },
  },
);

interface FinanceStatusBadgeProps extends VariantProps<
  typeof financeStatusBadgeVariants
> {
  status: FinancePaymentStatus;
  className?: string;
}

export function FinanceStatusBadge({
  status,
  className,
}: FinanceStatusBadgeProps) {
  return (
    <span
      className={cn(financeStatusBadgeVariants({ variant: status }), className)}
    >
      {status}
    </span>
  );
}
