import Link from "next/link";
import {
  AlertTriangle,
  ClipboardList,
  Package,
  Truck,
  type LucideIcon,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { WarehouseStat, WarehouseStatIcon } from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

const iconMap: Record<WarehouseStatIcon, LucideIcon> = {
  inventory: Package,
  requisitions: ClipboardList,
  dispatch: Truck,
  "low-stock": AlertTriangle,
};

interface WarehouseStatsCardProps {
  stat: WarehouseStat;
  isLoading?: boolean;
}

export function WarehouseStatsCard({
  stat,
  isLoading,
}: WarehouseStatsCardProps) {
  const Icon = iconMap[stat.icon];
  const isWarning = stat.variant === "warning";

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-3 h-8 w-20" />
        <Skeleton className="mt-2 h-4 w-44" />
      </div>
    );
  }

  const cardClassName = cn(
    "rounded-xl border border-gray-100 p-5 shadow-sm transition-all duration-200",
    isWarning ? "bg-orange-50/60" : "bg-white",
    stat.href &&
      "hover:border-primary/20 hover:shadow-md focus-visible:ring-primary/25 cursor-pointer focus-visible:ring-2 focus-visible:outline-none",
  );

  const content = (
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
        <p className="mt-1 text-sm text-[#64748B]">{stat.subtitle}</p>
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
  );

  if (stat.href) {
    return (
      <Link href={stat.href} className={cn(cardClassName, "block")}>
        {content}
      </Link>
    );
  }

  return <div className={cardClassName}>{content}</div>;
}
