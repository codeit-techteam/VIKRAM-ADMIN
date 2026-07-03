import { AlertCircle, CheckCircle2 } from "lucide-react";

import {
  formatAllocationQuantity,
  getStockAvailabilityLevel,
} from "@/mock/allocations";
import type { StockAvailabilityLevel } from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

const badgeStyles: Record<
  Exclude<StockAvailabilityLevel, "out-of-stock">,
  string
> = {
  enough: "text-green-700",
  low: "text-red-600",
};

const badgeLabels: Record<
  Exclude<StockAvailabilityLevel, "out-of-stock">,
  string
> = {
  enough: "Enough Stock",
  low: "Low Stock",
};

interface StockIndicatorProps {
  available: number;
  requestedQty: number;
  unit: string;
  className?: string;
}

export function StockIndicator({
  available,
  requestedQty,
  unit,
  className,
}: StockIndicatorProps) {
  const level = getStockAvailabilityLevel(available, requestedQty);

  if (level === "out-of-stock") {
    return (
      <div className={cn("space-y-1", className)}>
        <p className="text-sm font-medium text-[#1A1A1A]">
          Available:{" "}
          <span className="font-semibold text-red-600">
            {formatAllocationQuantity(0, unit)}
          </span>
        </p>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
          <AlertCircle className="size-3.5" />
          Insufficient Stock
        </span>
      </div>
    );
  }

  const BadgeIcon = level === "enough" ? CheckCircle2 : AlertCircle;

  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-sm font-medium text-[#1A1A1A]">
        Available:{" "}
        <span
          className={cn(
            "font-semibold",
            level === "low" ? "text-red-600" : "text-[#1A1A1A]",
          )}
        >
          {formatAllocationQuantity(available, unit)}
        </span>
      </p>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-semibold",
          badgeStyles[level],
        )}
      >
        <BadgeIcon className="size-3.5" />
        {badgeLabels[level]}
      </span>
    </div>
  );
}
