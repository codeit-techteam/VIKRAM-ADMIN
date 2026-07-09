"use client";

import type { CustomerActivityEvent } from "@/features/user-management/types/customer.types";
import { formatDate, formatDateTime } from "@/utils/format-date";
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
  PROFILE_UPDATED: "bg-slate-500",
};

export function CustomerActivityTimeline({
  events,
  className,
}: CustomerActivityTimelineProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-gray-100",
        className,
      )}
    >
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Date
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Time
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                User
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Activity
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const date = new Date(event.date);

              return (
                <tr
                  key={`${event.type}-${event.date}`}
                  className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/60"
                >
                  <td className="px-4 py-3 text-[#1A1A1A]">
                    {formatDate(date)}
                  </td>
                  <td className="px-4 py-3 text-[#64748B]">
                    {formatDateTime(date).split(", ").pop()}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#1A1A1A]">
                    {event.user ?? "System"}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1A1A1A]">{event.label}</p>
                    {event.description ? (
                      <p className="mt-0.5 text-xs text-[#64748B]">
                        {event.description}
                      </p>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ol className="relative space-y-0 p-4 md:hidden">
        {events.map((event, index) => (
          <li
            key={`${event.type}-${event.date}-mobile`}
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
              <p className="mt-1 text-xs font-medium text-[#64748B]">
                {event.user ?? "System"}
              </p>
              {event.description ? (
                <p className="mt-1 text-sm text-[#64748B]">
                  {event.description}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
