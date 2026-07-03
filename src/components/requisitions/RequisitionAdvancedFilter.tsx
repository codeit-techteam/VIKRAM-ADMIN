"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  EMPTY_REQUISITION_ADVANCED_FILTERS,
  REQUISITION_HUB_OPTIONS,
  REQUISITION_WAREHOUSE_OPTIONS,
} from "@/mock/requisitions";
import type { RequisitionAdvancedFilters } from "@/types/warehouse.types";

interface RequisitionAdvancedFilterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: RequisitionAdvancedFilters;
  onApply: (filters: RequisitionAdvancedFilters) => void;
}

export function RequisitionAdvancedFilter({
  open,
  onOpenChange,
  filters,
  onApply,
}: RequisitionAdvancedFilterProps) {
  const [draft, setDraft] = useState<RequisitionAdvancedFilters>(filters);

  useEffect(() => {
    if (open) {
      setDraft(filters);
    }
  }, [open, filters]);

  const updateDraft = <K extends keyof RequisitionAdvancedFilters>(
    key: K,
    value: RequisitionAdvancedFilters[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleReset = () => {
    setDraft(EMPTY_REQUISITION_ADVANCED_FILTERS);
  };

  const handleApply = () => {
    onApply(draft);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-gray-100 px-6 py-5">
          <SheetTitle className="text-lg font-semibold text-[#1A1A1A]">
            Advanced Filters
          </SheetTitle>
          <SheetDescription className="text-sm text-[#64748B]">
            Narrow requisitions by priority, status, hub, and more.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#1A1A1A]">
              Priority
            </Label>
            <Select
              value={draft.priority}
              onValueChange={(value) =>
                updateDraft(
                  "priority",
                  (value ?? "all") as RequisitionAdvancedFilters["priority"],
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#1A1A1A]">Status</Label>
            <Select
              value={draft.status}
              onValueChange={(value) =>
                updateDraft(
                  "status",
                  (value ?? "all") as RequisitionAdvancedFilters["status"],
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#1A1A1A]">Hub</Label>
            <Select
              value={draft.hubId}
              onValueChange={(value) => updateDraft("hubId", value ?? "all")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All hubs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All hubs</SelectItem>
                {REQUISITION_HUB_OPTIONS.map((hub) => (
                  <SelectItem key={hub.id} value={hub.id}>
                    {hub.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#1A1A1A]">
              Warehouse
            </Label>
            <Select
              value={draft.warehouseId}
              onValueChange={(value) =>
                updateDraft("warehouseId", value ?? "all")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All warehouses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All warehouses</SelectItem>
                {REQUISITION_WAREHOUSE_OPTIONS.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#1A1A1A]">
              Material
            </Label>
            <Input
              value={draft.material}
              onChange={(event) => updateDraft("material", event.target.value)}
              placeholder="Search by material name"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#1A1A1A]">
              Requested By
            </Label>
            <Input
              value={draft.requestedBy}
              onChange={(event) =>
                updateDraft("requestedBy", event.target.value)
              }
              placeholder="Name or role"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#1A1A1A]">
                Date From
              </Label>
              <Input
                type="date"
                value={draft.dateFrom}
                onChange={(event) =>
                  updateDraft("dateFrom", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#1A1A1A]">
                Date To
              </Label>
              <Input
                type="date"
                value={draft.dateTo}
                onChange={(event) => updateDraft("dateTo", event.target.value)}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="flex-row gap-3 border-t border-gray-100 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button type="button" className="flex-1" onClick={handleApply}>
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
