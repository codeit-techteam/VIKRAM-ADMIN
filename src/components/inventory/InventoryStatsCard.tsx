import {
  AlertTriangle,
  CircleAlert,
  IndianRupee,
  Package,
  type LucideIcon,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type InventoryStatKey =
  | "total-stock-value"
  | "low-stock-alerts"
  | "out-of-stock-items"
  | "inventory-items";

interface InventoryStatCardData {
  id: InventoryStatKey;
  label: string;
  value: string;
  subtitle?: string;
  variant?: "default" | "warning";
}

const iconMap: Record<InventoryStatKey, LucideIcon> = {
  "total-stock-value": IndianRupee,
  "low-stock-alerts": AlertTriangle,
  "out-of-stock-items": CircleAlert,
  "inventory-items": Package,
};

interface InventoryStatsCardProps {
  stat: InventoryStatCardData;
  isLoading?: boolean;
}

export function InventoryStatsCard({
  stat,
  isLoading,
}: InventoryStatsCardProps) {
  const Icon = iconMap[stat.id];
  const isWarning = stat.variant === "warning";

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-3 h-8 w-20" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-100 p-6 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md",
        isWarning ? "bg-orange-50/60" : "bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">
            {stat.label}
          </p>
          <p
            className={cn(
              "mt-2 text-3xl font-bold",
              isWarning ? "text-primary" : "text-[#1A1A1A]",
            )}
          >
            {stat.value}
          </p>
          {stat.subtitle ? (
            <p className="mt-1 text-sm text-[#64748B]">{stat.subtitle}</p>
          ) : null}
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            isWarning ? "bg-primary/15" : "bg-primary/10",
          )}
        >
          <Icon className="text-primary size-5" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}
