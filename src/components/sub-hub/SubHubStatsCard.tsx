import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ClipboardList,
  Network,
  type LucideIcon,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { SubHubStat, SubHubStatIcon } from "@/types/erp.types";
import { cn } from "@/lib/utils";

const iconMap: Record<SubHubStatIcon, LucideIcon> = {
  "active-hubs": Network,
  "pending-requisitions": ClipboardList,
  "inventory-health": Activity,
  "low-stock-hubs": AlertTriangle,
};

interface SubHubStatsCardProps {
  stat: SubHubStat;
  isLoading?: boolean;
}

export function SubHubStatsCard({ stat, isLoading }: SubHubStatsCardProps) {
  const Icon = iconMap[stat.icon];
  const isWarning = stat.variant === "warning";
  const isDanger = stat.variant === "danger";

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
    "rounded-xl border border-gray-100 p-6 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
    isDanger ? "bg-red-50/50" : isWarning ? "bg-orange-50/60" : "bg-white",
    stat.href && "cursor-pointer hover:border-primary/20",
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
            isDanger
              ? "text-red-600"
              : isWarning
                ? "text-primary"
                : "text-[#1A1A1A]",
          )}
        >
          {stat.value}
        </p>
        <p className="mt-1 text-sm text-[#64748B]">{stat.subtitle}</p>
      </div>
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          isDanger
            ? "bg-red-100"
            : isWarning
              ? "bg-primary/15"
              : "bg-primary/10",
        )}
      >
        <Icon
          className={cn("size-5", isDanger ? "text-red-600" : "text-primary")}
          strokeWidth={1.75}
        />
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
