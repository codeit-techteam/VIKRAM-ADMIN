"use client";

import type { CustomerActivityEvent } from "@/features/user-management/types/customer.types";
import { formatDateTime } from "@/utils/format-date";
import { cn } from "@/lib/utils";

interface CustomerActivityTimelineProps {
  events: CustomerActivityEvent[];
  className?: string;
}

const EVENT_COLORS: Record<CustomerActivityEvent["type"], string> = {
  REGISTERED: "bg-blue-500",
  KYC_VERIFIED: "bg-emerald-500",
  FIRST_LOGIN: "bg-violet-500",
  FIRST_ORDER: "bg-primary",
  LATEST_ORDER: "bg-amber-500",
  EXECUTIVE_ASSIGNED: "bg-teal-500",
};

export function CustomerActivityTimeline({
  events,
  className,
}: CustomerActivityTimelineProps) {
  if (events.length === 0) {
    return <p className="text-sm text-[#64748B]">No activity recorded yet.</p>;
  }

  return (
    <ol className={cn("relative space-y-0", className)}>
      {events.map((event, index) => (
        <li
          key={`${event.type}-${event.date}`}
          className="relative flex gap-4 pb-8 last:pb-0"
        >
          {index < events.length - 1 ? (
            <span
              className="absolute top-3 left-[7px] h-full w-px bg-gray-200"
              aria-hidden="true"
            />
          ) : null}
          <span
            className={cn(
              "relative z-10 mt-1.5 size-3.5 shrink-0 rounded-full ring-4 ring-white",
              EVENT_COLORS[event.type],
            )}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[#1A1A1A]">
                {event.label}
              </p>
              <time className="text-xs text-[#64748B]">
                {formatDateTime(event.date)}
              </time>
            </div>
            {event.description ? (
              <p className="mt-1 text-sm text-[#64748B]">{event.description}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
