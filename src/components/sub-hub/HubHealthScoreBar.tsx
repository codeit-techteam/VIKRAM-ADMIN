"use client";

import {
  getHubHealthScoreBarColor,
  getHubHealthScoreColor,
} from "@/utils/sub-hub-metrics";
import { cn } from "@/lib/utils";

interface HubHealthScoreBarProps {
  score: number;
  showLabel?: boolean;
  className?: string;
}

export function HubHealthScoreBar({
  score,
  showLabel = true,
  className,
}: HubHealthScoreBarProps) {
  const clampedScore = Math.max(0, Math.min(100, score));

  return (
    <div className={cn("flex min-w-[120px] items-center gap-2", className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            getHubHealthScoreBarColor(clampedScore),
          )}
          style={{ width: `${clampedScore}%` }}
        />
      </div>
      {showLabel ? (
        <span
          className={cn(
            "w-10 text-right text-sm font-semibold tabular-nums",
            getHubHealthScoreColor(clampedScore),
          )}
        >
          {clampedScore}
        </span>
      ) : null}
    </div>
  );
}
