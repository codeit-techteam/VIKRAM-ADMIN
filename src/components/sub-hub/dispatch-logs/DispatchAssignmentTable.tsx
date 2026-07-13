"use client";

import { Printer } from "lucide-react";

import { DispatchLogStatusBadge } from "@/components/sub-hub/dispatch-logs/DispatchLogStatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { DataTableSkeleton } from "@/components/tables/data-table-skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDispatchAssignmentStatusLabel } from "@/mock/dispatch-logs";
import type { DispatchLog } from "@/types/dispatch-log.types";
import { cn } from "@/lib/utils";

interface DispatchAssignmentTableProps {
  items: DispatchLog[];
  isLoading?: boolean;
  onAssign: (item: DispatchLog) => void;
  onPrint?: (item: DispatchLog) => void;
}

const assignmentStatusStyles = {
  Ready: "bg-amber-100 text-amber-700",
  Assigned: "bg-indigo-100 text-indigo-700",
} as const;

export function DispatchAssignmentTable({
  items,
  isLoading,
  onAssign,
  onPrint,
}: DispatchAssignmentTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-base font-semibold text-[#1A1A1A]">
          Dispatch Assignment
        </h2>
        <p className="mt-0.5 text-sm text-[#64748B]">
          Assign vehicles and drivers to pending hub dispatches
        </p>
      </div>

      {isLoading ? (
        <div className="p-4">
          <DataTableSkeleton columns={8} rows={6} />
        </div>
      ) : items.length === 0 ? (
        <div className="p-8">
          <EmptyState
            title="No dispatches in this view"
            description="Pending dispatches awaiting assignment will appear here."
          />
        </div>
      ) : (
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                  Order ID
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                  Customer
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                  Hub
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                  Vehicle
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                  Driver
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                  Current Status
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                  Dispatch Status
                </TableHead>
                <TableHead className="text-right text-xs font-semibold tracking-wide text-[#64748B] uppercase">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => {
                const dispatchStatus = getDispatchAssignmentStatusLabel(item);
                const isAssigned = dispatchStatus === "Assigned";

                return (
                  <TableRow
                    key={item.id}
                    className="transition-colors hover:bg-orange-50/40"
                    style={{
                      animation: `hubInvFadeIn 0.28s ease ${Math.min(index * 0.04, 0.28)}s both`,
                    }}
                  >
                    <TableCell className="font-mono text-xs text-[#64748B]">
                      {item.orderId}
                    </TableCell>
                    <TableCell className="font-medium text-[#1A1A1A]">
                      {item.customerName}
                    </TableCell>
                    <TableCell className="text-[#475569]">
                      {item.hubName}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#475569]">
                      {item.vehicleNumber ?? "—"}
                    </TableCell>
                    <TableCell className="text-[#475569]">
                      {item.driverName ?? "—"}
                    </TableCell>
                    <TableCell>
                      <DispatchLogStatusBadge
                        status={item.status}
                        isDelayed={item.isDelayed}
                      />
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase",
                          assignmentStatusStyles[dispatchStatus],
                        )}
                      >
                        {dispatchStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {isAssigned ? (
                        onPrint ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => onPrint(item)}
                          >
                            <Printer className="size-3.5" />
                            Dispatch Slip
                          </Button>
                        ) : null
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onAssign(item)}
                        >
                          Assign
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
