"use client";

import { Search, X } from "lucide-react";

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

export interface CeFilterOption {
  label: string;
  value: string;
}

export interface CeFilterConfig {
  key: string;
  label: string;
  options: CeFilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface CeSearchFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: CeFilterConfig[];
  onClear?: () => void;
  className?: string;
  sticky?: boolean;
}

export function CeSearchFilter({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  onClear,
  className,
  sticky = false,
}: CeSearchFilterProps) {
  const hasActiveFilters =
    search.trim() !== "" || filters.some((f) => f.value !== "ALL");

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center",
        sticky && "sticky top-0 z-10",
        className,
      )}
    >
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </div>

      {filters.map((filter) => (
        <Select
          key={filter.key}
          value={filter.value}
          onValueChange={(v) => v && filter.onChange(v)}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {hasActiveFilters && onClear && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-[#64748B]"
        >
          <X className="mr-1 size-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
