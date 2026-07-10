import { cn } from "@/lib/utils";
import type { FleetTimelineEvent } from "@/types/logistics.types";
import { formatLogisticsDateTime } from "@/mock/logistics";

interface FleetTimelineProps {
  events: FleetTimelineEvent[];
  className?: string;
}

export function FleetTimeline({ events, className }: FleetTimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const dotColor =
          event.type === "success"
            ? "bg-emerald-500"
            : event.type === "warning"
              ? "bg-amber-500"
              : "bg-primary";

        return (
          <div key={event.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={cn("size-2.5 shrink-0 rounded-full", dotColor)} />
              {!isLast ? (
                <div className="min-h-8 w-px flex-1 bg-gray-200" />
              ) : null}
            </div>
            <div className={cn("pb-5", isLast && "pb-0")}>
              <p className="text-sm font-medium text-[#1A1A1A]">
                {event.label}
              </p>
              {event.description ? (
                <p className="mt-0.5 text-xs text-[#64748B]">
                  {event.description}
                </p>
              ) : null}
              <p className="mt-0.5 text-xs text-gray-400">
                {formatLogisticsDateTime(event.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
