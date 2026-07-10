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
import type { HubRequisitionFilters } from "@/mock/hub-requisitions";
import type { SubHub } from "@/types/erp.types";
import type {
  RequisitionPriority,
  RequisitionStatus,
} from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

interface HubRequisitionFiltersBarProps {
  filters: HubRequisitionFilters;
  hubs: SubHub[];
  materials: string[];
  onChange: (next: Partial<HubRequisitionFilters>) => void;
  onClear: () => void;
  className?: string;
}

const STATUS_OPTIONS: Array<{
  value: RequisitionStatus | "all";
  label: string;
}> = [
  { value: "all", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "COMPLETED", label: "Completed" },
];

const PRIORITY_OPTIONS: Array<{
  value: RequisitionPriority | "all";
  label: string;
}> = [
  { value: "all", label: "All Priorities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

function hasActiveFilters(filters: HubRequisitionFilters): boolean {
  return (
    filters.status !== "all" ||
    filters.hubId !== "all" ||
    filters.material !== "all" ||
    filters.priority !== "all" ||
    filters.date.length > 0
  );
}

export function HubRequisitionFiltersBar({
  filters,
  hubs,
  materials,
  onChange,
  onClear,
  className,
}: HubRequisitionFiltersBarProps) {
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
            value={filters.status}
            onValueChange={(value) =>
              onChange({
                status: (value ?? "all") as HubRequisitionFilters["status"],
              })
            }
          >
            <SelectTrigger className="h-10 w-full min-w-[140px] sm:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.hubId}
            onValueChange={(value) => onChange({ hubId: value ?? "all" })}
          >
            <SelectTrigger className="h-10 w-full min-w-[150px] sm:w-[170px]">
              <SelectValue placeholder="Hub" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hubs</SelectItem>
              {hubs
                .filter((hub) => hub.isActive)
                .map((hub) => (
                  <SelectItem key={hub.id} value={hub.id}>
                    {hub.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.material}
            onValueChange={(value) => onChange({ material: value ?? "all" })}
          >
            <SelectTrigger className="h-10 w-full min-w-[150px] sm:w-[190px]">
              <SelectValue placeholder="Material" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Materials</SelectItem>
              {materials.map((material) => (
                <SelectItem key={material} value={material}>
                  {material}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.priority}
            onValueChange={(value) =>
              onChange({
                priority: (value ?? "all") as HubRequisitionFilters["priority"],
              })
            }
          >
            <SelectTrigger className="h-10 w-full min-w-[140px] sm:w-[160px]">
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
            value={filters.date}
            onChange={(event) => onChange({ date: event.target.value })}
            className="h-10 w-full min-w-[150px] sm:w-[170px]"
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
