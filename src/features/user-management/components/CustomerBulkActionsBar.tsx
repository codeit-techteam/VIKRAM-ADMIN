"use client";

import {
  Ban,
  Building2,
  Download,
  Power,
  PowerOff,
  UserCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface CustomerBulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onBlock: () => void;
  onAssignHub: () => void;
  onExport: () => void;
  showingFrom: number;
  showingTo: number;
  className?: string;
}

export function CustomerBulkActionsBar({
  selectedCount,
  totalCount,
  allSelected,
  onSelectAll,
  onActivate,
  onDeactivate,
  onBlock,
  onAssignHub,
  onExport,
  showingFrom,
  showingTo,
  className,
}: CustomerBulkActionsBarProps) {
  const hasSelection = selectedCount > 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-gray-100 px-1 py-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-[#64748B]">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => onSelectAll(checked === true)}
            aria-label="Select all customers on this page"
          />
          Select All
        </label>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!hasSelection}
          onClick={onActivate}
          className="gap-2 text-[#64748B] hover:text-[#1A1A1A]"
        >
          <UserCheck className="size-4" />
          Activate
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!hasSelection}
          onClick={onDeactivate}
          className="gap-2 text-[#64748B] hover:text-[#1A1A1A]"
        >
          <PowerOff className="size-4" />
          Deactivate
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!hasSelection}
          onClick={onBlock}
          className="gap-2 text-[#64748B] hover:text-red-600"
        >
          <Ban className="size-4" />
          Block
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!hasSelection}
          onClick={onAssignHub}
          className="gap-2 text-[#64748B] hover:text-[#1A1A1A]"
        >
          <Building2 className="size-4" />
          Assign Hub
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!hasSelection}
          onClick={onExport}
          className="gap-2 text-[#64748B] hover:text-[#1A1A1A]"
        >
          <Download className="size-4" />
          Export Selected
        </Button>
      </div>

      <p className="text-sm text-[#64748B]">
        Showing {showingFrom} - {showingTo} of{" "}
        {totalCount.toLocaleString("en-IN")} customers
      </p>
    </div>
  );
}
