"use client";

import { ArrowUpDown, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Pagination } from "@/components/allocation/Pagination";
import { PriorityBadge } from "@/components/allocation/PriorityBadge";
import { DataTableSkeleton } from "@/components/tables/data-table-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchWorkflowRequisitions,
  formatWorkflowDate,
  formatWorkflowQuantity,
  WORKFLOW_REQUISITION_PAGE_SIZE,
} from "@/mock/allocation-workflow";
import type { RequisitionListItem } from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

interface RequisitionTableProps {
  requisitions: RequisitionListItem[];
  selectedId: string | null;
  isLoading?: boolean;
  onSelect: (requisition: RequisitionListItem) => void;
}

export function RequisitionTable({
  requisitions,
  selectedId,
  isLoading = false,
  onSelect,
}: RequisitionTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const queryResult = useMemo(
    () =>
      fetchWorkflowRequisitions(requisitions, {
        page: currentPage,
        limit: WORKFLOW_REQUISITION_PAGE_SIZE,
        search,
      }),
    [requisitions, currentPage, search],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by Request ID, Hub or Material..."
            className="h-10 rounded-xl border-gray-200 bg-gray-50/60 pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-2 border-gray-200 px-3 text-sm font-medium text-[#64748B]"
          >
            <Filter className="size-4" />
            Filters
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-2 border-gray-200 px-3 text-sm font-medium text-[#64748B]"
          >
            <ArrowUpDown className="size-4" />
            Sort
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-5">
          <DataTableSkeleton columns={6} rows={5} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100 hover:bg-transparent">
                <TableHead className="w-12 bg-white" />
                <TableHead className="bg-white text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                  Request ID
                </TableHead>
                <TableHead className="bg-white text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                  Destination Hub
                </TableHead>
                <TableHead className="bg-white text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                  Material
                </TableHead>
                <TableHead className="bg-white text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                  Qty
                </TableHead>
                <TableHead className="bg-white text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                  Priority
                </TableHead>
                <TableHead className="bg-white text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                  Req. Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queryResult.data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-sm text-[#64748B]"
                  >
                    No approved requisitions available for allocation.
                  </TableCell>
                </TableRow>
              ) : (
                queryResult.data.map((item) => {
                  const isSelected = selectedId === item.id;

                  return (
                    <TableRow
                      key={item.id}
                      className={cn(
                        "cursor-pointer border-gray-100 transition-colors",
                        isSelected ? "bg-orange-50/70" : "hover:bg-gray-50/80",
                      )}
                      onClick={() => onSelect(item)}
                    >
                      <TableCell className="py-4">
                        <div
                          className={cn(
                            "flex size-5 items-center justify-center rounded-full border-2",
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-gray-300 bg-white",
                          )}
                        >
                          {isSelected ? (
                            <div className="size-2 rounded-full bg-white" />
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="text-primary font-semibold">
                          {item.requestId}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-[#64748B]">
                        {item.hubName}
                      </TableCell>
                      <TableCell className="py-4 text-sm font-medium text-[#1A1A1A]">
                        {item.material}
                      </TableCell>
                      <TableCell className="py-4 text-sm font-medium text-[#1A1A1A]">
                        {formatWorkflowQuantity(item.requestedQty, item.unit)}
                      </TableCell>
                      <TableCell className="py-4">
                        <PriorityBadge priority={item.priority} />
                      </TableCell>
                      <TableCell className="py-4 text-sm text-[#64748B]">
                        {formatWorkflowDate(item.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination
        currentPage={queryResult.meta.page}
        totalItems={queryResult.meta.total}
        pageSize={WORKFLOW_REQUISITION_PAGE_SIZE}
        itemLabel="requisitions"
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
