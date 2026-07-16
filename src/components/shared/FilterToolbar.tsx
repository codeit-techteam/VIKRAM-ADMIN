"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "draft", label: "Draft" },
] as const;

const ROW_COUNT_OPTIONS = [10, 25, 50, 100] as const;

interface FilterToolbarProps {
  searchPlaceholder?: string;
  className?: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  status?: string;
  onStatusChange?: (value: string) => void;
  rowCount?: string;
  onRowCountChange?: (value: string) => void;
}

export function FilterToolbar({
  searchPlaceholder = "Filter by title or target...",
  className,
  search = "",
  onSearchChange,
  status = "all",
  onStatusChange,
  rowCount = "10",
  onRowCountChange,
}: FilterToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            value={search}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 border-gray-200 bg-white pl-9 text-sm placeholder:text-gray-400"
          />
        </div>

        <Select
          value={status}
          onValueChange={(value) => {
            if (value) onStatusChange?.(value);
          }}
        >
          <SelectTrigger className="h-9 w-full border-gray-200 sm:w-auto">
            <span className="text-gray-500">Status:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Select
        value={rowCount}
        onValueChange={(value) => {
          if (value) onRowCountChange?.(value);
        }}
      >
        <SelectTrigger className="h-9 w-full border-gray-200 sm:ml-auto sm:w-auto">
          <span className="text-gray-500">Show:</span>
          <SelectValue />
          <span className="text-gray-500">rows</span>
        </SelectTrigger>
        <SelectContent>
          {ROW_COUNT_OPTIONS.map((count) => (
            <SelectItem key={count} value={String(count)}>
              {count}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
