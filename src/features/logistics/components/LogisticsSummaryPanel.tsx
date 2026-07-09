import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface LogisticsSummaryItem {
  id: string;
  label: string;
  value: number;
  variant?: "default" | "warning" | "critical" | "success";
  icon?: LucideIcon;
}

interface LogisticsSummaryPanelProps {
  title: string;
  subtitle: string;
  href: string;
  items: LogisticsSummaryItem[];
  isLoading?: boolean;
}

const valueVariantClasses = {
  default: "text-[#1A1A1A]",
  warning: "text-primary",
  critical: "text-destructive",
  success: "text-success",
} as const;

const progressVariantClasses = {
  default: "bg-primary",
  warning: "bg-warning",
  critical: "bg-destructive",
  success: "bg-success",
} as const;

function SummaryRow({
  item,
  total,
}: {
  item: LogisticsSummaryItem;
  total: number;
}) {
  const variant = item.variant ?? "default";
  const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
  const Icon = item.icon;

  return (
    <div className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {Icon ? (
            <div
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-md",
                variant === "critical"
                  ? "bg-destructive/10"
                  : variant === "warning"
                    ? "bg-primary/10"
                    : variant === "success"
                      ? "bg-success/10"
                      : "bg-muted",
              )}
            >
              <Icon
                className={cn(
                  "size-3.5",
                  variant === "critical"
                    ? "text-destructive"
                    : variant === "warning"
                      ? "text-primary"
                      : variant === "success"
                        ? "text-success"
                        : "text-muted-foreground",
                )}
                strokeWidth={1.75}
              />
            </div>
          ) : null}
          <span className="truncate text-sm text-[#64748B]">{item.label}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              valueVariantClasses[variant],
            )}
          >
            {item.value}
          </span>
          <span className="w-8 text-right text-[11px] text-gray-400 tabular-nums">
            {percentage}%
          </span>
        </div>
      </div>
      <Progress value={percentage} className="gap-0">
        <ProgressTrack className="h-1.5">
          <ProgressIndicator className={progressVariantClasses[variant]} />
        </ProgressTrack>
      </Progress>
    </div>
  );
}

export function LogisticsSummaryPanel({
  title,
  subtitle,
  href,
  items,
  isLoading,
}: LogisticsSummaryPanelProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-[#1A1A1A]">{title}</h2>
          <p className="mt-0.5 text-sm text-[#64748B]">{subtitle}</p>
        </div>
        <Badge
          variant="secondary"
          className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold tabular-nums"
        >
          {isLoading ? "—" : total} total
        </Badge>
      </div>

      <div className="flex flex-1 flex-col px-5 py-2">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-2 py-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))
          : items.map((item) => (
              <SummaryRow key={item.id} item={item} total={total} />
            ))}
      </div>

      <div className="border-t border-gray-100 px-5 py-3">
        <Link
          href={href}
          className="text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
        >
          View all
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
