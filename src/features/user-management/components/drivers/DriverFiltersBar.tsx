"use client";

import { Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DriverFilters } from "@/types/logistics.types";

interface DriverFiltersBarProps {
  filters: DriverFilters;
  onChange: (filters: DriverFilters) => void;
  onApply: () => void;
  onReset: () => void;
  hubOptions: Array<{ value: string; label: string }>;
}

export function DriverFiltersBar({
  filters,
  onChange,
  onApply,
  onReset,
  hubOptions,
}: DriverFiltersBarProps) {
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
          placeholder="Search by name, employee ID, or mobile..."
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 lg:flex lg:items-center">
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onChange({ ...filters, status: value ?? "all" })
          }
        >
          <SelectTrigger className="w-full lg:w-[150px]">
            <SelectValue placeholder="Status: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="driving">On Trip</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.hub}
          onValueChange={(value) =>
            onChange({ ...filters, hub: value ?? "all" })
          }
        >
          <SelectTrigger className="w-full lg:w-[180px]">
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
