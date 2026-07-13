"use client";

import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SubHub } from "@/types/erp.types";
import type { HubInventoryOverviewFilters } from "@/utils/hub-inventory-overview";
import { MATERIAL_TYPE_LABELS } from "@/utils/hub-inventory-overview";
import { cn } from "@/lib/utils";

interface HubInventoryFiltersProps {
  filters: HubInventoryOverviewFilters;
  hubs: SubHub[];
  categories: string[];
  suppliers: string[];
  materialTypes: string[];
  onChange: (next: Partial<HubInventoryOverviewFilters>) => void;
  onClear: () => void;
  hasStatFilter?: boolean;
  className?: string;
}

function hasActiveFilters(filters: HubInventoryOverviewFilters): boolean {
  return (
    filters.hubId !== "all" ||
    filters.category !== "all" ||
    filters.supplier !== "all" ||
    filters.materialType !== "all" ||
    filters.skuSearch.trim().length > 0
  );
}

export function HubInventoryFilters({
  filters,
  hubs,
  categories,
  suppliers,
  materialTypes,
  onChange,
  onClear,
  hasStatFilter = false,
  className,
}: HubInventoryFiltersProps) {
  const active = hasActiveFilters(filters) || hasStatFilter;

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
            <SelectTrigger className="h-10 w-full min-w-[150px] sm:w-[170px]">
              <SelectValue placeholder="Select Hub" />
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
            value={filters.category}
            onValueChange={(value) => onChange({ category: value ?? "all" })}
          >
            <SelectTrigger className="h-10 w-full min-w-[150px] sm:w-[180px]">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.supplier}
            onValueChange={(value) => onChange({ supplier: value ?? "all" })}
          >
            <SelectTrigger className="h-10 w-full min-w-[150px] sm:w-[170px]">
              <SelectValue placeholder="Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier} value={supplier}>
                  {supplier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.materialType}
            onValueChange={(value) =>
              onChange({ materialType: value ?? "all" })
            }
          >
            <SelectTrigger className="h-10 w-full min-w-[150px] sm:w-[170px]">
              <SelectValue placeholder="Material Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {materialTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {MATERIAL_TYPE_LABELS[type] ?? type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative w-full min-w-[180px] sm:w-[220px]">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              value={filters.skuSearch}
              onChange={(event) => onChange({ skuSearch: event.target.value })}
              placeholder="Search SKU"
              className="h-10 pl-9"
            />
          </div>
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
