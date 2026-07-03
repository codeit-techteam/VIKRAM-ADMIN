"use client";

import { Filter, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import type { InventoryCategoryFilter } from "@/types/inventory.types";
import { cn } from "@/lib/utils";

interface InventoryFiltersProps {
  categories: InventoryCategoryFilter[];
  activeCategory: InventoryCategoryFilter["slug"];
  onCategoryChange: (slug: InventoryCategoryFilter["slug"]) => void;
  onAdvancedFilter?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  trailingContent?: ReactNode;
}

export function InventoryFilters({
  categories,
  activeCategory,
  onCategoryChange,
  onAdvancedFilter,
  onRefresh,
  isRefreshing = false,
  trailingContent,
}: InventoryFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-base font-semibold text-[#1A1A1A]">
            Stock Ledger
          </h2>
          {trailingContent}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-2 border-gray-200 px-3 text-sm font-medium text-[#64748B]"
            onClick={onAdvancedFilter}
          >
            <Filter className="size-4" />
            Advanced Filter
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="size-9 border-gray-200 text-[#64748B]"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh inventory"
          >
            <RefreshCw
              className={cn("size-4", isRefreshing && "animate-spin")}
            />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 pb-1">
        {categories.map((category) => {
          const isActive = activeCategory === category.slug;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(category.slug)}
              className={cn(
                "rounded-md px-3 py-2 text-xs font-semibold tracking-wide uppercase transition-colors",
                isActive
                  ? "text-primary border-primary border-b-2"
                  : "text-[#64748B] hover:text-[#1A1A1A]",
              )}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
