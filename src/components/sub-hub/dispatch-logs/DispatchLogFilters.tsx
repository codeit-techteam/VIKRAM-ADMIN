"use client";

import { X } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DISPATCH_LOG_FILTER_OPTIONS } from "@/mock/dispatch-logs";
import type { DispatchLogFilters } from "@/types/dispatch-log.types";
import { cn } from "@/lib/utils";

interface DispatchLogFiltersBarProps {
  filters: DispatchLogFilters;
  hubs: Array<{ id: string; name: string }>;
  onChange: (next: Partial<DispatchLogFilters>) => void;
  onClear: () => void;
  className?: string;
}

function hasActiveFilters(filters: DispatchLogFilters): boolean {
  return (
    filters.hubId !== "all" ||
    filters.customer.trim().length > 0 ||
    filters.vehicle.trim().length > 0 ||
    filters.driver.trim().length > 0 ||
    filters.status !== "all" ||
    filters.date.length > 0
  );
}

export function DispatchLogFiltersBar({
  filters,
  hubs,
  onChange,
  onClear,
  className,
}: DispatchLogFiltersBarProps) {
  const active = hasActiveFilters(filters);

  return (
    <div
      className={cn(
        "sticky top-0 z-20 rounded-xl border border-gray-100 bg-white/95 p-4 shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold tracking-wide text-[#94A3B8] uppercase">
            Filters:
          </span>

          <Select
            value={filters.hubId}
            onValueChange={(value) => onChange({ hubId: value ?? "all" })}
          >
            <SelectTrigger className="h-10 w-full min-w-[140px] sm:w-[160px]">
              <SelectValue placeholder="Hub" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hubs</SelectItem>
              {hubs.map((hub) => (
                <SelectItem key={hub.id} value={hub.id}>
                  {hub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            value={filters.customer}
            onChange={(event) => onChange({ customer: event.target.value })}
            placeholder="Customer"
            className="h-10 w-full min-w-[130px] sm:w-[150px]"
          />

          <Input
            value={filters.vehicle}
            onChange={(event) => onChange({ vehicle: event.target.value })}
            placeholder="Vehicle"
            className="h-10 w-full min-w-[120px] sm:w-[130px]"
          />

          <Input
            value={filters.driver}
            onChange={(event) => onChange({ driver: event.target.value })}
            placeholder="Driver"
            className="h-10 w-full min-w-[120px] sm:w-[130px]"
          />

          <Select
            value={filters.status}
            onValueChange={(value) =>
              onChange({
                status: (value ?? "all") as DispatchLogFilters["status"],
              })
            }
          >
            <SelectTrigger className="h-10 w-full min-w-[140px] sm:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {DISPATCH_LOG_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={filters.date}
            onChange={(event) => onChange({ date: event.target.value })}
            className="h-10 w-full min-w-[140px] sm:w-[150px]"
            aria-label="Filter by date"
          />
        </div>

        {active ? (
          <button
            type="button"
            onClick={onClear}
            className="hover:text-primary inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] transition-colors"
          >
            <X className="size-3.5" />
            Clear Filters
          </button>
        ) : null}
      </div>
    </div>
  );
}
