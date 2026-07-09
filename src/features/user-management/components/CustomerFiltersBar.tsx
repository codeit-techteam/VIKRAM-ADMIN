"use client";

import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CustomerFilters } from "@/features/user-management/types/customer.types";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface CustomerFiltersBarProps {
  draftFilters: CustomerFilters;
  onDraftChange: (filters: CustomerFilters) => void;
  onApply: () => void;
  onReset: () => void;
  hubOptions: FilterOption[];
  executiveOptions: FilterOption[];
  stateOptions: FilterOption[];
  className?: string;
}

const STATUS_OPTIONS: FilterOption[] = [
  { value: "all", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING_VERIFICATION", label: "Pending Verification" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "INACTIVE", label: "Inactive" },
];

const TYPE_OPTIONS: FilterOption[] = [
  { value: "all", label: "All Types" },
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "CONTRACTOR", label: "Contractor" },
  { value: "BUILDER", label: "Builder" },
  { value: "INTERIOR_DESIGNER", label: "Interior Designer" },
];

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="w-full lg:w-44">
      <label className="mb-1.5 block text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
        {label}
      </label>
      <Select
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue) onChange(nextValue);
        }}
      >
        <SelectTrigger className="h-10 w-full border-gray-200 bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function CustomerFiltersBar({
  draftFilters,
  onDraftChange,
  onApply,
  onReset,
  hubOptions,
  executiveOptions,
  stateOptions,
  className,
}: CustomerFiltersBarProps) {
  const update = (patch: Partial<CustomerFilters>) => {
    onDraftChange({ ...draftFilters, ...patch });
  };

  return (
    <div
      className={cn(
        "sticky top-0 z-10 rounded-xl border border-gray-100 bg-[#F8F9FB] p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Search
            </label>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                value={draftFilters.search}
                onChange={(event) => update({ search: event.target.value })}
                placeholder="Customer name, ID, or phone..."
                className="h-10 border-gray-200 bg-white pl-9 text-sm placeholder:text-gray-400"
              />
            </div>
          </div>

          <FilterSelect
            label="Status"
            value={draftFilters.status}
            options={STATUS_OPTIONS}
            onChange={(value) => update({ status: value })}
          />

          <FilterSelect
            label="Customer Type"
            value={draftFilters.customerType}
            options={TYPE_OPTIONS}
            onChange={(value) => update({ customerType: value })}
          />

          <FilterSelect
            label="Assigned Hub"
            value={draftFilters.assignedHub}
            options={[{ value: "all", label: "All Hubs" }, ...hubOptions]}
            onChange={(value) => update({ assignedHub: value })}
          />
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <FilterSelect
            label="Assigned Executive"
            value={draftFilters.assignedExecutive}
            options={[
              { value: "all", label: "All Executives" },
              ...executiveOptions,
            ]}
            onChange={(value) => update({ assignedExecutive: value })}
          />

          <FilterSelect
            label="State"
            value={draftFilters.state}
            options={[{ value: "all", label: "All States" }, ...stateOptions]}
            onChange={(value) => update({ state: value })}
          />

          <div className="w-full lg:w-44">
            <label className="mb-1.5 block text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              City
            </label>
            <Input
              value={draftFilters.city}
              onChange={(event) => update({ city: event.target.value })}
              placeholder="Mumbai, Delhi..."
              className="h-10 border-gray-200 bg-white text-sm placeholder:text-gray-400"
            />
          </div>

          <div className="w-full lg:w-44">
            <label className="mb-1.5 block text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Registration From
            </label>
            <Input
              type="date"
              value={draftFilters.registrationDateFrom}
              onChange={(event) =>
                update({ registrationDateFrom: event.target.value })
              }
              className="h-10 border-gray-200 bg-white text-sm"
            />
          </div>

          <div className="w-full lg:w-44">
            <label className="mb-1.5 block text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Registration To
            </label>
            <Input
              type="date"
              value={draftFilters.registrationDateTo}
              onChange={(event) =>
                update({ registrationDateTo: event.target.value })
              }
              className="h-10 border-gray-200 bg-white text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={onApply}
              className="h-10 bg-[#1A1A2E] px-6 text-white hover:bg-[#1A1A2E]/90"
            >
              Apply
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onReset}
              className="size-10 border-gray-200"
              aria-label="Reset filters"
            >
              <RotateCcw className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
