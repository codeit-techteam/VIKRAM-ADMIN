import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type {
  AllocationStatFilter,
  AllocationStats,
} from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

export type AllocationStatKey = AllocationStatFilter;

export interface AllocationSummaryCardData {
  id: AllocationStatKey;
  label: string;
  value: string;
  variant?: "default" | "warning" | "critical" | "success" | "muted";
}

const iconMap: Record<AllocationStatKey, LucideIcon> = {
  "pending-allocation": ClipboardList,
  "critical-allocation": AlertTriangle,
  "allocated-today": CheckCircle2,
  "out-of-stock": ShoppingCart,
};

interface AllocationSummaryCardProps {
  stat: AllocationSummaryCardData;
  isLoading?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export function AllocationSummaryCard({
  stat,
  isLoading,
  isActive = false,
  onClick,
}: AllocationSummaryCardProps) {
  const Icon = iconMap[stat.id];
  const variant = stat.variant ?? "default";

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
        !isActive && (variant === "warning" || variant === "critical")
          ? "bg-orange-50/60"
          : null,
        !isActive &&
          variant !== "warning" &&
          variant !== "critical" &&
          "bg-white",
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
              variant === "critical"
                ? "text-red-600"
                : variant === "warning" || variant === "success"
                  ? "text-primary"
                  : "text-[#1A1A1A]",
            )}
          >
            {stat.value}
          </p>
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            variant === "critical"
              ? "bg-red-100"
              : variant === "success"
                ? "bg-green-100"
                : variant === "muted"
                  ? "bg-gray-100"
                  : variant === "warning"
                    ? "bg-primary/15"
                    : "bg-primary/10",
          )}
        >
          <Icon
            className={cn(
              "size-5",
              variant === "critical"
                ? "text-red-600"
                : variant === "success"
                  ? "text-green-600"
                  : variant === "muted"
                    ? "text-gray-500"
                    : "text-primary",
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

export function buildAllocationSummaryCards(
  stats: AllocationStats,
): AllocationSummaryCardData[] {
  return [
    {
      id: "pending-allocation",
      label: "Pending Allocation",
      value: String(stats.pendingAllocation),
      variant: "warning",
    },
    {
      id: "critical-allocation",
      label: "Critical Allocation",
      value: String(stats.criticalAllocation),
      variant: "critical",
    },
    {
      id: "allocated-today",
      label: "Allocated Today",
      value: String(stats.allocatedToday),
      variant: "success",
    },
    {
      id: "out-of-stock",
      label: "Out Of Stock",
      value: String(stats.outOfStock),
      variant: "muted",
    },
  ];
}
