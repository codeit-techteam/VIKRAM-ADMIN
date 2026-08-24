"use client";

import { Minus, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

import { Skeleton } from "@/components/ui/skeleton";
import type { HubOrderTrendMetric } from "@/types/hub-orders.types";
import { cn } from "@/lib/utils";

interface HubOrderMetricCardProps {
  label: string;
  metric: HubOrderTrendMetric | number;
  subtitle?: string;
  icon: LucideIcon;
  formatValue?: (value: number) => string;
  isLoading?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  index?: number;
}

function formatTrend(change: number, changePercent: number): string {
  if (change === 0) return "No change today";
  const sign = change > 0 ? "+" : "";
  return `${sign}${change} (${sign}${changePercent}%) vs yesterday`;
}

export function HubOrderMetricCard({
  label,
  metric,
  subtitle,
  icon: Icon,
  formatValue,
  isLoading,
  isActive,
  onClick,
  index = 0,
}: HubOrderMetricCardProps) {
  const value = typeof metric === "number" ? metric : metric.value;
  const change = typeof metric === "number" ? 0 : metric.change;
  const changePercent = typeof metric === "number" ? 0 : metric.changePercent;
  const displayValue = formatValue ? formatValue(value) : String(value);

  const TrendIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  const trendTone =
    change > 0
      ? "text-emerald-600"
      : change < 0
        ? "text-red-500"
        : "text-[#94A3B8]";

  const Wrapper = onClick ? "button" : "div";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <Wrapper
        type={onClick ? "button" : undefined}
        onClick={onClick}
        className={cn(
          "group w-full rounded-xl border border-gray-100 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
          isActive && "ring-primary/30 border-primary/30 ring-2",
          onClick && "cursor-pointer",
        )}
      >
        {isLoading ? (
          <>
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-3 h-8 w-20" />
            <Skeleton className="mt-3 h-4 w-32" />
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-bold text-[#1A1A1A] tabular-nums sm:text-3xl">
                  {displayValue}
                </p>
                {subtitle ? (
                  <p className="mt-1 text-sm text-[#64748B]">{subtitle}</p>
                ) : null}
              </div>
              <div className="bg-primary/10 text-primary group-hover:bg-primary/15 flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors">
                <Icon className="size-5" strokeWidth={1.75} />
              </div>
            </div>
            {typeof metric !== "number" ? (
              <div
                className={cn(
                  "mt-3 flex items-center gap-1.5 text-xs",
                  trendTone,
                )}
              >
                <TrendIcon className="size-3.5" />
                <span>{formatTrend(change, changePercent)}</span>
              </div>
            ) : null}
          </>
        )}
      </Wrapper>
    </motion.div>
  );
}
