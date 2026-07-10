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
import { HUB_TRANSFER_STATUS_OPTIONS } from "@/mock/hub-transfers";
import type {
  HubTransferFilters,
  HubTransferPriority,
} from "@/types/hub-transfer.types";
import { cn } from "@/lib/utils";

interface HubTransferFiltersBarProps {
  filters: HubTransferFilters;
  hubs: Array<{ id: string; name: string }>;
  onChange: (next: Partial<HubTransferFilters>) => void;
  onClear: () => void;
  className?: string;
}

const PRIORITY_OPTIONS: Array<{
  value: HubTransferPriority | "all";
  label: string;
}> = [
  { value: "all", label: "All Priorities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

function hasActiveFilters(filters: HubTransferFilters): boolean {
  return (
    filters.hubId !== "all" ||
    filters.customer.trim().length > 0 ||
    filters.orderId.trim().length > 0 ||
    filters.driver.trim().length > 0 ||
    filters.vehicle.trim().length > 0 ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.dateFrom.length > 0 ||
    filters.dateTo.length > 0
  );
}

export function HubTransferFiltersBar({
  filters,
  hubs,
  onChange,
  onClear,
  className,
}: HubTransferFiltersBarProps) {
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
            value={filters.orderId}
            onChange={(event) => onChange({ orderId: event.target.value })}
            placeholder="Order ID"
            className="h-10 w-full min-w-[120px] sm:w-[140px]"
          />

          <Input
            value={filters.driver}
            onChange={(event) => onChange({ driver: event.target.value })}
            placeholder="Driver"
            className="h-10 w-full min-w-[120px] sm:w-[130px]"
          />

          <Input
            value={filters.vehicle}
            onChange={(event) => onChange({ vehicle: event.target.value })}
            placeholder="Vehicle"
            className="h-10 w-full min-w-[120px] sm:w-[130px]"
          />

          <Select
            value={filters.status}
            onValueChange={(value) =>
              onChange({
                status: (value ?? "all") as HubTransferFilters["status"],
              })
            }
          >
            <SelectTrigger className="h-10 w-full min-w-[150px] sm:w-[170px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {HUB_TRANSFER_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.priority}
            onValueChange={(value) =>
              onChange({
                priority: (value ?? "all") as HubTransferFilters["priority"],
              })
            }
          >
            <SelectTrigger className="h-10 w-full min-w-[130px] sm:w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(event) => onChange({ dateFrom: event.target.value })}
            className="h-10 w-full min-w-[140px] sm:w-[150px]"
            aria-label="Date from"
          />
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(event) => onChange({ dateTo: event.target.value })}
            className="h-10 w-full min-w-[140px] sm:w-[150px]"
            aria-label="Date to"
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
