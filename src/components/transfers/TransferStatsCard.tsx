import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  type LucideIcon,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type TransferStatKey =
  "pending-dispatch" | "in-transit" | "delivered-today" | "delayed-transfers";

export interface TransferStatCardData {
  id: TransferStatKey;
  label: string;
  value: string;
  variant?: "default" | "warning" | "critical";
}

const iconMap: Record<TransferStatKey, LucideIcon> = {
  "pending-dispatch": Clock,
  "in-transit": Truck,
  "delivered-today": CheckCircle2,
  "delayed-transfers": AlertTriangle,
};

interface TransferStatsCardProps {
  stat: TransferStatCardData;
  isLoading?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export function TransferStatsCard({
  stat,
  isLoading,
  isActive = false,
  onClick,
}: TransferStatsCardProps) {
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

  const content = (
    <div
      className={cn(
        "rounded-xl border p-5 shadow-sm transition-all duration-200",
        onClick && "cursor-pointer hover:scale-[1.01] hover:shadow-md",
        isActive
          ? "border-primary bg-primary/5 ring-primary/20 ring-2"
          : "border-gray-100",
        !isActive && (isWarning || isCritical) ? "bg-orange-50/60" : null,
        !isActive && !isWarning && !isCritical ? "bg-white" : null,
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

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isActive}
        aria-label={`Filter by ${stat.label}`}
        className="w-full text-left"
      >
        {content}
      </button>
    );
  }

  return content;
}
