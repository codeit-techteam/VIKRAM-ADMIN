"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AllocationSummaryCard,
  buildAllocationSummaryCards,
  type AllocationStatKey,
} from "@/components/allocation/AllocationSummaryCard";
import { MaterialAllocationTable } from "@/components/allocation/MaterialAllocationTable";
import { ALLOCATION_PAGE_SIZE, fetchAllocations } from "@/mock/allocations";
import type { MaterialAllocationItem } from "@/types/warehouse.types";
import { ROUTES } from "@/constants/routes";
import { warehouseService } from "@/services/warehouse";
import { notify } from "@/utils/notify";

const TABLE_COPY: Record<
  AllocationStatKey,
  { title: string; subtitle: string }
> = {
  "pending-allocation": {
    title: "Pending Material Allocation",
    subtitle: "Review and allocate inventory to approved requisitions.",
  },
  "critical-allocation": {
    title: "Critical Material Allocation",
    subtitle:
      "Prioritize high-urgency requisitions that still need allocation.",
  },
  "allocated-today": {
    title: "Allocated Today",
    subtitle: "Material reservations completed today.",
  },
  "out-of-stock": {
    title: "Out of Stock Allocations",
    subtitle: "Pending requisitions blocked by zero available stock.",
  },
};

export function AllocationPage() {
  const router = useRouter();
  const [allocations, setAllocations] = useState<MaterialAllocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStat, setActiveStat] =
    useState<AllocationStatKey>("pending-allocation");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const result = await warehouseService.listAllocations({
          page: 1,
          limit: 1000,
        });
        if (active) setAllocations(result.data);
      } catch {
        if (active) {
          notify.error(
            "Allocations unavailable",
            "Unable to load approved requisitions.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    const interval = window.setInterval(() => void load(), 30000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const queryResult = useMemo(
    () =>
      fetchAllocations(allocations, {
        page: currentPage,
        limit: ALLOCATION_PAGE_SIZE,
        statFilter: activeStat,
      }),
    [allocations, currentPage, activeStat],
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

  const handleStatClick = useCallback((statId: AllocationStatKey) => {
    setActiveStat((current) =>
      current === statId ? "pending-allocation" : statId,
    );
    setCurrentPage(1);
  }, []);

  const handleStartWorkflow = useCallback(
    (item: MaterialAllocationItem) => {
      if (item.status === "ALLOCATED") return;
      router.push(
        `${ROUTES.CENTRAL_WAREHOUSE}/allocate/workflow?allocationId=${encodeURIComponent(item.id)}`,
      );
    },
    [router],
  );

  const tableCopy = TABLE_COPY[activeStat];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((stat) => (
          <AllocationSummaryCard
            key={stat.id}
            stat={stat}
            isLoading={isLoading}
            isActive={activeStat === stat.id}
            onClick={() => handleStatClick(stat.id)}
          />
        ))}
      </div>

      <MaterialAllocationTable
        items={queryResult.data}
        isLoading={isLoading}
        currentPage={queryResult.meta.page}
        totalItems={queryResult.meta.total}
        pageSize={ALLOCATION_PAGE_SIZE}
        title={tableCopy.title}
        subtitle={tableCopy.subtitle}
        onPageChange={setCurrentPage}
        onStartWorkflow={handleStartWorkflow}
      />
    </div>
  );
}
