import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import type {
  AnalyticsCategory,
  CtrTrend,
} from "@/features/cms/types/video.types";
import { cn } from "@/lib/utils";

interface AnalyticsRowProps {
  category: AnalyticsCategory;
}

function CtrTrendIcon({ trend }: { trend: CtrTrend }) {
  if (trend === "up") {
    return <TrendingUp className="size-3.5" />;
  }

  if (trend === "down") {
    return <TrendingDown className="size-3.5" />;
  }

  return <ArrowRight className="size-3.5" />;
}

function formatViews(value: number): string {
  return value.toLocaleString();
}

export function AnalyticsTableHeader() {
  return (
    <div className="hidden border-b border-gray-100 pb-3 sm:grid sm:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))] sm:items-center sm:gap-4">
      <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
        Video Category
      </p>
      <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
        Total Views
      </p>
      <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
        Avg. CTR
      </p>
      <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
        Watch Efficiency
      </p>
      <p className="text-right text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
        Status
      </p>
    </div>
  );
}

export function AnalyticsRow({ category }: AnalyticsRowProps) {
  const ctrColor =
    category.ctrTrend === "up"
      ? "text-emerald-600"
      : category.ctrTrend === "down"
        ? "text-red-600"
        : "text-amber-600";

  return (
    <div className="grid grid-cols-1 gap-4 border-b border-gray-100 py-4 last:border-b-0 last:pb-0 sm:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))] sm:items-center sm:gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "h-8 w-1 shrink-0 rounded-full",
            category.accentBarClass,
          )}
          aria-hidden="true"
        />
        <p className="truncate font-medium text-[#1A1A1A]">{category.name}</p>
      </div>

      <p className="text-sm font-semibold text-[#1A1A1A] sm:text-base">
        {formatViews(category.totalViews)}
      </p>

      <p
        className={cn(
          "inline-flex items-center gap-1 text-sm font-semibold sm:text-base",
          ctrColor,
        )}
      >
        {category.ctr}%
        <CtrTrendIcon trend={category.ctrTrend} />
      </p>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn("h-full rounded-full", category.accentColor)}
          style={{ width: `${category.watchEfficiencyPercent}%` }}
        />
      </div>

      <div className="flex sm:justify-end">
        <StatusBadge status={category.status} />
      </div>
    </div>
  );
}
