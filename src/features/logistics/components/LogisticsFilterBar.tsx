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
import type { FilterConfig } from "@/components/shared/FilterBar";
import { cn } from "@/lib/utils";

interface LogisticsFilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: FilterConfig[];
  onReset?: () => void;
  className?: string;
}

export function LogisticsFilterBar({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filters,
  onReset,
  className,
}: LogisticsFilterBarProps) {
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
            Search
          </label>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
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
              onValueChange={(v) => v && filter.onChange(v)}
            >
              <SelectTrigger className="h-10 border-gray-200 bg-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}

        {onReset ? (
          <Button
            type="button"
            variant="outline"
            className="h-10 border-gray-200"
            onClick={onReset}
          >
            Reset
          </Button>
        ) : null}
      </div>
    </div>
  );
}
