"use client";

import { CheckCircle2, Circle, Clock } from "lucide-react";
import { format } from "date-fns";

import type { FinanceTimelineEvent } from "@/features/finance/types";
import { cn } from "@/lib/utils";

interface FinanceTimelineProps {
  events: FinanceTimelineEvent[];
  className?: string;
}

function TimelineItem({
  label,
  timestamp,
  isLast,
  isCompleted,
  isCurrent,
}: {
  label: string;
  timestamp?: string;
  isLast: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        {isCompleted ? (
          <CheckCircle2 className="size-5 shrink-0 text-green-500" />
        ) : isCurrent ? (
          <div className="bg-primary/15 flex size-5 shrink-0 items-center justify-center rounded-full">
            <Clock className="text-primary size-3" />
          </div>
        ) : (
          <Circle className="size-5 shrink-0 text-gray-300" />
        )}
        {!isLast ? (
          <div
            className={cn(
              "my-1 w-0.5 flex-1 rounded-full",
              isCompleted ? "bg-green-200" : "bg-gray-200",
            )}
            style={{ minHeight: "28px" }}
          />
        ) : null}
      </div>
      <div className={cn("min-w-0 pb-6", isLast && "pb-0")}>
        <p
          className={cn(
            "text-sm font-medium",
            isCompleted || isCurrent ? "text-[#1A1A1A]" : "text-gray-400",
          )}
        >
          {label}
        </p>
        {timestamp ? (
          <p className="mt-0.5 text-xs text-[#64748B]">
            {format(new Date(timestamp), "dd MMM yyyy, hh:mm a")}
          </p>
        ) : isCurrent ? (
          <p className="text-primary mt-0.5 text-xs font-medium">In progress</p>
        ) : (
          <p className="mt-0.5 text-xs text-gray-300">Pending</p>
        )}
      </div>
    </div>
  );
}

export function FinanceTimeline({ events, className }: FinanceTimelineProps) {
  const firstIncompleteIndex = events.findIndex((e) => !e.completedAt);

  return (
    <div className={cn("space-y-0", className)}>
      {events.map((event, index) => {
        const isCompleted = Boolean(event.completedAt);
        const isCurrent = !isCompleted && index === firstIncompleteIndex;
        const isLast = index === events.length - 1;

        return (
          <TimelineItem
            key={event.step}
            label={event.label}
            timestamp={event.completedAt}
            isLast={isLast}
            isCompleted={isCompleted}
            isCurrent={isCurrent}
          />
        );
      })}
    </div>
  );
}
