import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { LoyaltyTier } from "@/mock/mockLoyalty";

const tierVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        BRONZE: "bg-orange-100 text-orange-800",
        SILVER: "bg-gray-100 text-gray-700",
        GOLD: "bg-amber-100 text-amber-800",
        PLATINUM: "bg-purple-100 text-purple-700",
      },
    },
    defaultVariants: { variant: "BRONZE" },
  },
);

export function LoyaltyTierBadge({
  tier,
  className,
}: {
  tier: LoyaltyTier;
  className?: string;
}) {
  return (
    <span className={cn(tierVariants({ variant: tier }), className)}>
      {tier.charAt(0) + tier.slice(1).toLowerCase()}
    </span>
  );
}
