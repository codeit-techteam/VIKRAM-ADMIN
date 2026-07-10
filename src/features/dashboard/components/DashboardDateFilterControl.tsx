"use client";

import { Calendar } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  DASHBOARD_DATE_RANGE_LABELS,
  type DashboardDateFilter,
  type DashboardDateRange,
} from "@/mock/executive-dashboard";

interface DashboardDateFilterProps {
  value: DashboardDateFilter;
  onChange: (filter: DashboardDateFilter) => void;
}

const PRESET_RANGES: DashboardDateRange[] = [
  "today",
  "week",
  "month",
  "quarter",
  "year",
];

export function DashboardDateFilterControl({
  value,
  onChange,
}: DashboardDateFilterProps) {
  const [customFrom, setCustomFrom] = useState(value.customFrom ?? "");
  const [customTo, setCustomTo] = useState(value.customTo ?? "");

  const label =
    value.range === "custom" && value.customFrom && value.customTo
      ? `${value.customFrom} – ${value.customTo}`
      : DASHBOARD_DATE_RANGE_LABELS[value.range];

  const applyCustom = () => {
    if (customFrom && customTo) {
      onChange({ range: "custom", customFrom, customTo });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" className="h-10 gap-2 px-4">
            <Calendar className="size-4" />
            {label}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        {PRESET_RANGES.map((range) => (
          <DropdownMenuItem
            key={range}
            onClick={() => onChange({ range })}
            className={value.range === range ? "bg-orange-50" : undefined}
          >
            {DASHBOARD_DATE_RANGE_LABELS[range]}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="space-y-2 p-2">
          <p className="text-xs font-medium text-gray-500">Custom Range</p>
          <Input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="h-8 text-xs"
          />
          <Input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="h-8 text-xs"
          />
          <Button
            size="sm"
            className="w-full"
            onClick={applyCustom}
            disabled={!customFrom || !customTo}
          >
            Apply Custom
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
