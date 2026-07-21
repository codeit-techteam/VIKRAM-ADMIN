import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type {
  WalletTransactionStatus,
  WalletTransactionType,
} from "@/mock/mockWallet";

const typeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        CREDIT: "bg-green-100 text-green-700",
        DEBIT: "bg-red-100 text-red-700",
      },
    },
    defaultVariants: { variant: "CREDIT" },
  },
);

const statusVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        COMPLETED: "bg-green-100 text-green-700",
        PENDING: "bg-amber-100 text-amber-700",
        FAILED: "bg-red-100 text-red-700",
      },
    },
    defaultVariants: { variant: "COMPLETED" },
  },
);

export function WalletTypeBadge({
  type,
  className,
}: {
  type: WalletTransactionType;
  className?: string;
}) {
  return (
    <span className={cn(typeVariants({ variant: type }), className)}>
      {type.charAt(0) + type.slice(1).toLowerCase()}
    </span>
  );
}

export function WalletStatusBadge({
  status,
  className,
}: {
  status: WalletTransactionStatus;
  className?: string;
}) {
  return (
    <span className={cn(statusVariants({ variant: status }), className)}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
