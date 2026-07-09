import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ShipmentTimeline } from "@/types/logistics.types";
import { formatLogisticsDateTime } from "@/mock/logistics";

interface LogisticsTimelineProps {
  timeline: ShipmentTimeline;
  className?: string;
}

export function LogisticsTimeline({
  timeline,
  className,
}: LogisticsTimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {timeline.stages.map((stage, index) => {
        const isLast = index === timeline.stages.length - 1;
        const isCompleted = !!stage.completedAt;
        const isCurrent = stage.isCurrent;

        return (
          <div key={stage.stage} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-2",
                  isCurrent
                    ? "border-primary bg-primary text-white"
                    : isCompleted
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-gray-200 bg-white text-gray-300",
                )}
              >
                {isCompleted && !isCurrent ? (
                  <Check className="size-4" strokeWidth={2.5} />
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>
              {!isLast ? (
                <div
                  className={cn(
                    "min-h-8 w-0.5 flex-1",
                    isCompleted ? "bg-emerald-300" : "bg-gray-200",
                  )}
                />
              ) : null}
            </div>
            <div className={cn("pb-6", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium",
                  isCurrent
                    ? "text-primary"
                    : isCompleted
                      ? "text-[#1A1A1A]"
                      : "text-gray-400",
                )}
              >
                {stage.label}
              </p>
              {stage.completedAt ? (
                <p className="mt-0.5 text-xs text-[#64748B]">
                  {formatLogisticsDateTime(stage.completedAt)}
                </p>
              ) : isCurrent ? (
                <p className="text-primary mt-0.5 text-xs font-medium">
                  In progress
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-gray-300">Pending</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
