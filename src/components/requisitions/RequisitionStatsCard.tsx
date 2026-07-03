import {
  AlertTriangle,
  Calendar,
  ClipboardList,
  PackageCheck,
  type LucideIcon,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type RequisitionStatKey =
  | "pending-requests"
  | "critical-requests"
  | "awaiting-allocation"
  | "todays-requests";

export interface RequisitionStatCardData {
  id: RequisitionStatKey;
  label: string;
  value: string;
  variant?: "default" | "warning" | "critical";
}

const iconMap: Record<RequisitionStatKey, LucideIcon> = {
  "pending-requests": ClipboardList,
  "critical-requests": AlertTriangle,
  "awaiting-allocation": PackageCheck,
  "todays-requests": Calendar,
};

interface RequisitionStatsCardProps {
  stat: RequisitionStatCardData;
  isLoading?: boolean;
}

export function RequisitionStatsCard({
  stat,
  isLoading,
}: RequisitionStatsCardProps) {
  const Icon = iconMap[stat.id];
  const isWarning = stat.variant === "warning";
  const isCritical = stat.variant === "critical";

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-3 h-8 w-16" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-100 p-5 shadow-sm transition-all duration-200 hover:shadow-md",
        isWarning || isCritical ? "bg-orange-50/60" : "bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
            {stat.label}
          </p>
          <p
            className={cn(
              "mt-2 text-3xl font-bold tracking-tight",
              isWarning || isCritical ? "text-primary" : "text-[#1A1A1A]",
            )}
          >
            {stat.value}
          </p>
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            isCritical
              ? "bg-red-100"
              : isWarning
                ? "bg-primary/15"
                : "bg-primary/10",
          )}
        >
          <Icon
            className={cn(
              "size-5",
              isCritical ? "text-red-600" : "text-primary",
            )}
            strokeWidth={1.75}
          />
        </div>
      </div>
    </div>
  );
}
