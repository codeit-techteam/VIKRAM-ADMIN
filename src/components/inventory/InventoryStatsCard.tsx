"use client";

import {
  AlertTriangle,
  CircleAlert,
  IndianRupee,
  Package,
  type LucideIcon,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type InventoryStatKey =
  | "inventory-items"
  | "low-stock-alerts"
  | "out-of-stock-items"
  | "total-stock-value";

export interface InventoryStatCardData {
  id: InventoryStatKey;
  label: string;
  value: string;
  subtitle?: string;
  variant?: "default" | "warning";
}

const iconMap: Record<InventoryStatKey, LucideIcon> = {
  "inventory-items": Package,
  "low-stock-alerts": AlertTriangle,
  "out-of-stock-items": CircleAlert,
  "total-stock-value": IndianRupee,
};

interface InventoryStatsCardProps {
  stat: InventoryStatCardData;
  isLoading?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export function InventoryStatsCard({
  stat,
  isLoading,
  isActive = false,
  onClick,
}: InventoryStatsCardProps) {
  const Icon = iconMap[stat.id];
  const isWarning = stat.variant === "warning";

  if (isLoading) {
    return (
      <div className="h-full rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-3 h-8 w-20" />
      </div>
    );
  }

  const content = (
    <div
      className={cn(
        "h-full rounded-xl border p-6 shadow-sm transition-all duration-200",
        onClick && "cursor-pointer hover:scale-[1.02] hover:shadow-md",
        isActive
          ? "border-primary bg-primary/5 ring-primary/20 ring-2"
          : "border-gray-100",
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

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="h-full w-full text-left"
      >
        {content}
      </button>
    );
  }

  return content;
}
