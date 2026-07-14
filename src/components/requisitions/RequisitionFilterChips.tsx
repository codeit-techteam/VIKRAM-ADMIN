"use client";

import type { RequisitionFilterChip } from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

const STATUS_CHIPS: Array<{ label: string; value: RequisitionFilterChip }> = [
  { label: "All", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "Pending", value: "pending" },
  { label: "Awaiting Allocation", value: "awaiting-allocation" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const TIME_CHIPS: Array<{ label: string; value: RequisitionFilterChip }> = [
  { label: "Today's", value: "today" },
  { label: "Last 7 Days", value: "last-7-days" },
];

interface RequisitionFilterChipsProps {
  activeChip: RequisitionFilterChip;
  onChipChange: (chip: RequisitionFilterChip) => void;
}

function FilterChip({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-white shadow-sm"
          : "text-[#64748B] hover:bg-gray-100 hover:text-[#1A1A1A]",
      )}
    >
      {label}
    </button>
  );
}

export function RequisitionFilterChips({
  activeChip,
  onChipChange,
}: RequisitionFilterChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {STATUS_CHIPS.map((chip) => (
        <FilterChip
          key={chip.value}
          label={chip.label}
          isActive={activeChip === chip.value}
          onClick={() => onChipChange(chip.value)}
        />
      ))}

      <div className="mx-1 hidden h-5 w-px bg-gray-200 sm:block" aria-hidden />

      {TIME_CHIPS.map((chip) => (
        <FilterChip
          key={chip.value}
          label={chip.label}
          isActive={activeChip === chip.value}
          onClick={() => onChipChange(chip.value)}
        />
      ))}
    </div>
  );
}
