"use client";

import {
  Activity,
  ClipboardList,
  Package,
  ShoppingCart,
  Truck,
  Warehouse,
} from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import type { HubActivityCategory, HubActivityEvent } from "@/types/erp.types";
import { cn } from "@/lib/utils";

const categoryStyles: Record<
  HubActivityCategory,
  { icon: typeof Activity; className: string }
> = {
  transfer: { icon: Truck, className: "bg-blue-50 text-blue-600" },
  inventory: { icon: Package, className: "bg-green-50 text-green-600" },
  order: { icon: ShoppingCart, className: "bg-purple-50 text-purple-600" },
  requisition: {
    icon: ClipboardList,
    className: "bg-amber-50 text-amber-600",
  },
  dispatch: { icon: Truck, className: "bg-orange-50 text-orange-600" },
  allocation: { icon: Warehouse, className: "bg-primary/10 text-primary" },
};

interface HubActivityTimelineProps {
  events: HubActivityEvent[];
  isLoading?: boolean;
}

function formatEventTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HubActivityTimeline({
  events,
  isLoading,
}: HubActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={`timeline-skeleton-${index}`}
            className="h-16 animate-pulse rounded-lg bg-gray-100"
          />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        description="ERP events for this hub will appear here as operations progress."
        icon={<Activity className="size-8" />}
      />
    );
  }

  return (
    <ol className="relative space-y-0">
      {events.map((event, index) => {
        const style = categoryStyles[event.category];
        const Icon = style.icon;
        const isLast = index === events.length - 1;

        return (
          <li key={event.id} className="relative flex gap-4 pb-6">
            {!isLast ? (
              <span className="absolute top-10 left-4 h-[calc(100%-1.5rem)] w-px bg-gray-200" />
            ) : null}
            <div
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full",
                style.className,
              )}
            >
              <Icon className="size-4" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-[#1A1A1A]">
                  {event.title}
                </p>
                <time className="text-xs text-[#64748B]">
                  {formatEventTime(event.timestamp)}
                </time>
              </div>
              {event.description ? (
                <p className="mt-1 text-sm text-[#64748B]">
                  {event.description}
                </p>
              ) : null}
              {event.actor ? (
                <p className="mt-1 text-xs text-gray-400">by {event.actor}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
