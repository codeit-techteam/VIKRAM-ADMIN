"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AllocationSummaryCard,
  buildAllocationSummaryCards,
} from "@/components/allocation/AllocationSummaryCard";
import { MaterialAllocationTable } from "@/components/allocation/MaterialAllocationTable";
import { ALLOCATION_PAGE_SIZE, fetchAllocations } from "@/mock/allocations";
import { useWarehouseErpStore } from "@/store/warehouse-erp-store";
import type { MaterialAllocationItem } from "@/types/warehouse.types";
import { ROUTES } from "@/constants/routes";

export function AllocationPage() {
  const router = useRouter();
  const allocationRecords = useWarehouseErpStore((state) => state.allocations);
  const requisitions = useWarehouseErpStore((state) => state.requisitions);
  const getMaterialAllocations = useWarehouseErpStore(
    (state) => state.getMaterialAllocations,
  );

  const allocations = useMemo(
    () => getMaterialAllocations(),
    [allocationRecords, requisitions, getMaterialAllocations],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  const queryResult = useMemo(
    () =>
      fetchAllocations(allocations, {
        page: currentPage,
        limit: ALLOCATION_PAGE_SIZE,
      }),
    [allocations, currentPage],
  );

  useEffect(() => {
    if (
      queryResult.meta.total > 0 &&
      currentPage > queryResult.meta.totalPages
    ) {
      setCurrentPage(queryResult.meta.totalPages);
    }
  }, [currentPage, queryResult.meta.total, queryResult.meta.totalPages]);

  const summaryCards = useMemo(
    () => buildAllocationSummaryCards(queryResult.stats),
    [queryResult.stats],
  );

  const handleStartWorkflow = useCallback(
    (item: MaterialAllocationItem) => {
      if (item.status === "ALLOCATED") return;
      router.push(
        `${ROUTES.CENTRAL_WAREHOUSE}/allocate/workflow?allocationId=${encodeURIComponent(item.id)}`,
      );
    },
    [router],
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((stat) => (
          <AllocationSummaryCard
            key={stat.id}
            stat={stat}
            isLoading={isLoading}
          />
        ))}
      </div>

      <MaterialAllocationTable
        items={queryResult.data}
        isLoading={isLoading}
        currentPage={queryResult.meta.page}
        totalItems={queryResult.meta.total}
        pageSize={ALLOCATION_PAGE_SIZE}
        onPageChange={setCurrentPage}
        onStartWorkflow={handleStartWorkflow}
      />
    </div>
  );
}
