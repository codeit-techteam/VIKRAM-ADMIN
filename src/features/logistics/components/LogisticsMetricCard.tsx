import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";

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
  href?: string;
}

interface LogisticsMetricCardProps {
  stat: LogisticsMetricCardData;
  isLoading?: boolean;
  size?: "default" | "compact";
}

const variantAccent = {
  default: "border-l-primary/40",
  warning: "border-l-warning",
  critical: "border-l-destructive",
  success: "border-l-success",
} as const;

export function LogisticsMetricCard({
  stat,
  isLoading,
  size = "default",
}: LogisticsMetricCardProps) {
  const Icon = stat.icon;
  const variant = stat.variant ?? "default";
  const isWarning = variant === "warning";
  const isCritical = variant === "critical";
  const isSuccess = variant === "success";
  const isCompact = size === "compact";

  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-xl border border-gray-100 bg-white shadow-sm",
          isCompact ? "p-4" : "p-5",
        )}
      >
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-3 h-8 w-16" />
        <Skeleton className="mt-2 h-3 w-20" />
      </div>
    );
  }

  const cardClassName = cn(
    "group relative overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all duration-200",
    "border-l-[3px]",
    variantAccent[variant],
    isWarning || isCritical ? "bg-orange-50/40" : "bg-white",
    isCompact ? "p-4" : "p-5",
    stat.href &&
      "cursor-pointer hover:border-primary/25 hover:shadow-md hover:ring-1 hover:ring-primary/10",
    !stat.href && "hover:shadow-md",
  );

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-semibold tracking-wider text-gray-400 uppercase",
              isCompact ? "text-[10px]" : "text-[11px]",
            )}
          >
            {stat.label}
          </p>
          <p
            className={cn(
              "mt-1.5 font-bold tracking-tight",
              isCompact ? "text-2xl" : "text-3xl",
              isCritical
                ? "text-destructive"
                : isWarning
                  ? "text-primary"
                  : isSuccess
                    ? "text-success"
                    : "text-[#1A1A1A]",
            )}
          >
            {stat.value}
          </p>
          {stat.trend ? (
            <div
              className={cn(
                "mt-1 flex items-center gap-1 text-xs font-medium",
                stat.trendUp ? "text-success" : "text-destructive",
              )}
            >
              {stat.trendUp ? (
                <TrendingUp className="size-3.5" />
              ) : (
                <TrendingDown className="size-3.5" />
              )}
              <span>{stat.trend}</span>
            </div>
          ) : null}
        </div>
        {Icon ? (
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-lg transition-colors",
              isCompact ? "size-9" : "size-10",
              isCritical
                ? "bg-destructive/10 group-hover:bg-destructive/15"
                : isWarning
                  ? "bg-primary/15 group-hover:bg-primary/20"
                  : isSuccess
                    ? "bg-success/10 group-hover:bg-success/15"
                    : "bg-primary/10 group-hover:bg-primary/15",
            )}
          >
            <Icon
              className={cn(
                isCompact ? "size-4" : "size-5",
                isCritical
                  ? "text-destructive"
                  : isSuccess
                    ? "text-success"
                    : "text-primary",
              )}
              strokeWidth={1.75}
            />
          </div>
        ) : null}
      </div>
      {stat.href ? (
        <p className="text-primary mt-3 text-[11px] font-medium opacity-0 transition-opacity group-hover:opacity-100">
          View details →
        </p>
      ) : null}
    </>
  );

  if (stat.href) {
    return (
      <Link href={stat.href} className={cardClassName}>
        {content}
      </Link>
    );
  }

  return <div className={cardClassName}>{content}</div>;
}

export function LogisticsMetricCardSkeleton() {
  return (
    <LogisticsMetricCard stat={{ id: "sk", label: "", value: "" }} isLoading />
  );
}
