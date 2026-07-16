"use client";

import { Calendar, Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ExecutiveFilters } from "@/features/user-management/types/support-executive.types";

interface ExecutiveFiltersBarProps {
  filters: ExecutiveFilters;
  onChange: (filters: ExecutiveFilters) => void;
  onApply: () => void;
  onReset: () => void;
  regionOptions: Array<{ value: string; label: string }>;
  hubOptions: Array<{ value: string; label: string }>;
  statusOptions: Array<{ value: string; label: string }>;
}

export function ExecutiveFiltersBar({
  filters,
  onChange,
  onApply,
  onReset,
  regionOptions,
  hubOptions,
  statusOptions,
}: ExecutiveFiltersBarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-100 p-4 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={filters.search}
          onChange={(event) =>
            onChange({ ...filters, search: event.target.value })
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") onApply();
          }}
          placeholder="Search by Name, ID or Phone..."
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:items-center">
        <Select
          value={filters.region}
          onValueChange={(value) =>
            onChange({ ...filters, region: value ?? "all" })
          }
        >
          <SelectTrigger className="w-full lg:w-[150px]">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regionOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.hubId}
          onValueChange={(value) =>
            onChange({ ...filters, hubId: value ?? "all" })
          }
        >
          <SelectTrigger className="w-full lg:w-[170px]">
            <SelectValue placeholder="All Hubs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hubs</SelectItem>
            {hubOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) =>
            onChange({
              ...filters,
              status: value ?? "all",
              activity: "all",
            })
          }
        >
          <SelectTrigger className="w-full lg:w-[140px]">
            <SelectValue placeholder="Status: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Status: All</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.dateRange}
          onValueChange={(value) =>
            onChange({ ...filters, dateRange: value ?? "7" })
          }
        >
          <SelectTrigger className="w-full lg:w-[140px]">
            <Calendar className="mr-2 size-4 text-gray-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="icon" onClick={onApply}>
          <Filter className="size-4" />
          <span className="sr-only">Apply filters</span>
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
        <Button type="button" size="sm" onClick={onApply}>
          Apply
        </Button>
      </div>
    </div>
  );
}
