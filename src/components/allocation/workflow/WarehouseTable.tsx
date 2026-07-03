"use client";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatWorkflowQuantity } from "@/mock/allocation-workflow";
import type {
  RequisitionListItem,
  WorkflowWarehouse,
} from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

interface WarehouseTableProps {
  warehouses: WorkflowWarehouse[];
  requisition: RequisitionListItem;
  selectedWarehouseId: string | null;
  onSelect: (warehouseId: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const statusStyles = {
  OPTIMAL: "bg-green-100 text-green-700",
  MODERATE: "bg-amber-100 text-amber-700",
  LOW: "bg-orange-100 text-orange-700",
  EMPTY: "bg-gray-100 text-gray-500",
} as const;

export function WarehouseTable({
  warehouses,
  requisition,
  selectedWarehouseId,
  onSelect,
  onRefresh,
  isRefreshing = false,
}: WarehouseTableProps) {
  const selectedWarehouse = warehouses.find(
    (warehouse) => warehouse.id === selectedWarehouseId,
  );

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-bold text-[#1A1A1A]">
            Stock Distribution
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-primary h-8 gap-2 px-2 text-sm font-medium"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn("size-4", isRefreshing && "animate-spin")}
            />
            Refresh Real-time Data
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100 hover:bg-transparent">
                <TableHead className="bg-white text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                  Warehouse Name
                </TableHead>
                <TableHead className="bg-white text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                  In Stock
                </TableHead>
                <TableHead className="bg-white text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                  Status
                </TableHead>
                <TableHead className="w-16 bg-white" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.map((warehouse) => {
                const isSelected = selectedWarehouseId === warehouse.id;
                const isDisabled = warehouse.status === "EMPTY";

                return (
                  <TableRow
                    key={warehouse.id}
                    className={cn(
                      "border-gray-100 transition-colors",
                      isSelected ? "bg-orange-50/60" : "hover:bg-gray-50/80",
                      isDisabled ? "opacity-60" : "cursor-pointer",
                    )}
                    onClick={() => {
                      if (!isDisabled) onSelect(warehouse.id);
                    }}
                  >
                    <TableCell className="py-4">
                      <div>
                        <p className="font-semibold text-[#1A1A1A]">
                          {warehouse.name}
                        </p>
                        <p className="mt-0.5 text-xs text-[#64748B]">
                          {warehouse.location}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-sm font-medium text-[#1A1A1A]">
                      {formatWorkflowQuantity(
                        warehouse.stock,
                        requisition.unit,
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase",
                          statusStyles[warehouse.status],
                        )}
                      >
                        {warehouse.status}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <div
                        className={cn(
                          "flex size-5 items-center justify-center rounded-full border-2",
                          isSelected && !isDisabled
                            ? "border-primary bg-primary"
                            : "border-gray-300 bg-white",
                          isDisabled && "border-gray-200 bg-gray-100",
                        )}
                      >
                        {isSelected && !isDisabled ? (
                          <div className="size-2 rounded-full bg-white" />
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedWarehouse ? (
        <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-5">
          <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
            Lead Time Estimate
          </p>
          <p className="mt-2 text-2xl font-bold text-[#1A1A1A]">
            {selectedWarehouse.leadTimeHours} Hours
          </p>
          <p className="mt-1 text-sm text-[#64748B]">
            Estimated delivery from {selectedWarehouse.name.split(" - ")[0]} to
            site.
          </p>
        </div>
      ) : null}
    </div>
  );
}
