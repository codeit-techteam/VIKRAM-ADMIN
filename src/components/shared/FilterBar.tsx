"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface FilterBarProps {
  searchLabel?: string;
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: FilterConfig[];
  onApply: () => void;
  className?: string;
}

export function FilterBar({
  searchLabel = "SEARCH PRODUCTS",
  searchPlaceholder = "Product name or SKU...",
  searchValue,
  onSearchChange,
  filters,
  onApply,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-100 bg-[#F8F9FB] p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label className="mb-1.5 block text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            {searchLabel}
          </label>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 border-gray-200 bg-white pl-9 text-sm placeholder:text-gray-400"
            />
          </div>
        </div>

        {filters.map((filter) => (
          <div key={filter.label} className="w-full lg:w-44">
            <label className="mb-1.5 block text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              {filter.label}
            </label>
            <Select
              value={filter.value}
              onValueChange={(value) => {
                if (value) filter.onChange(value);
              }}
            >
              <SelectTrigger className="h-10 w-full border-gray-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        <Button
          type="button"
          onClick={onApply}
          className="h-10 bg-[#1A1A2E] px-6 text-white hover:bg-[#1A1A2E]/90"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
