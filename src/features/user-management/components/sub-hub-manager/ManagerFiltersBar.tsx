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
import type { ManagerFilters } from "@/features/user-management/types/sub-hub-manager.types";

interface ManagerFiltersBarProps {
  filters: ManagerFilters;
  onChange: (filters: ManagerFilters) => void;
  onApply: () => void;
  onReset: () => void;
  regionOptions: Array<{ value: string; label: string }>;
  hubOptions: Array<{ value: string; label: string }>;
  statusOptions: Array<{ value: string; label: string }>;
  warehouseOptions: Array<{ value: string; label: string }>;
}

export function ManagerFiltersBar({
  filters,
  onChange,
  onApply,
  onReset,
  regionOptions,
  hubOptions,
  statusOptions,
  warehouseOptions,
}: ManagerFiltersBarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-100 p-4 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") onApply();
          }}
          placeholder="Search by Name, Employee ID or Hub..."
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:items-center">
        <Select
          value={filters.region}
          onValueChange={(v) => onChange({ ...filters, region: v ?? "all" })}
        >
          <SelectTrigger className="w-full lg:w-[150px]">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regionOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.hubId}
          onValueChange={(v) => onChange({ ...filters, hubId: v ?? "all" })}
        >
          <SelectTrigger className="w-full lg:w-[170px]">
            <SelectValue placeholder="All Hubs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hubs</SelectItem>
            {hubOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(v) => onChange({ ...filters, status: v ?? "all" })}
        >
          <SelectTrigger className="w-full lg:w-[140px]">
            <SelectValue placeholder="Status: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Status: All</SelectItem>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.warehouse}
          onValueChange={(v) => onChange({ ...filters, warehouse: v ?? "all" })}
        >
          <SelectTrigger className="w-full lg:w-[200px]">
            <SelectValue placeholder="All Warehouses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Warehouses</SelectItem>
            {warehouseOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
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
