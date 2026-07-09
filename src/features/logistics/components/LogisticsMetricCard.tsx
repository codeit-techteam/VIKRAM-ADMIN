import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface LogisticsMetricCardData {
  id: string;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  variant?: "default" | "warning" | "critical" | "success";
  icon?: LucideIcon;
}

interface LogisticsMetricCardProps {
  stat: LogisticsMetricCardData;
  isLoading?: boolean;
}

export function LogisticsMetricCard({
  stat,
  isLoading,
}: LogisticsMetricCardProps) {
  const Icon = stat.icon;
  const isWarning = stat.variant === "warning";
  const isCritical = stat.variant === "critical";
  const isSuccess = stat.variant === "success";

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-3 h-8 w-16" />
        <Skeleton className="mt-2 h-3 w-20" />
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
              isCritical
                ? "text-red-600"
                : isWarning
                  ? "text-primary"
                  : isSuccess
                    ? "text-emerald-600"
                    : "text-[#1A1A1A]",
            )}
          >
            {stat.value}
          </p>
          {stat.trend ? (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                stat.trendUp ? "text-emerald-600" : "text-red-500",
              )}
            >
              {stat.trendUp ? "↑" : "↓"} {stat.trend}
            </p>
          ) : null}
        </div>
        {Icon ? (
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              isCritical
                ? "bg-red-100"
                : isWarning
                  ? "bg-primary/15"
                  : isSuccess
                    ? "bg-emerald-100"
                    : "bg-primary/10",
            )}
          >
            <Icon
              className={cn(
                "size-5",
                isCritical
                  ? "text-red-600"
                  : isSuccess
                    ? "text-emerald-600"
                    : "text-primary",
              )}
              strokeWidth={1.75}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function LogisticsMetricCardSkeleton() {
  return (
    <LogisticsMetricCard stat={{ id: "sk", label: "", value: "" }} isLoading />
  );
}
