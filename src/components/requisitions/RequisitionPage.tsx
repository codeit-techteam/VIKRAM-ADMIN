"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { RequisitionAdvancedFilter } from "@/components/requisitions/RequisitionAdvancedFilter";
import {
  RequisitionStatsCard,
  type RequisitionStatCardData,
} from "@/components/requisitions/RequisitionStatsCard";
import { RequisitionTable } from "@/components/requisitions/RequisitionTable";
import {
  EMPTY_REQUISITION_ADVANCED_FILTERS,
  fetchRequisitions,
  REQUISITION_PAGE_SIZE,
} from "@/mock/requisitions";
import type {
  RequisitionAdvancedFilters,
  RequisitionFilterChip,
  RequisitionListItem,
} from "@/types/warehouse.types";

export function RequisitionPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeChip, setActiveChip] = useState<RequisitionFilterChip>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [advancedFilters, setAdvancedFilters] =
    useState<RequisitionAdvancedFilters>(EMPTY_REQUISITION_ADVANCED_FILTERS);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  useEffect(() => {
    // TODO: Replace simulated loading with requisition API fetch
    const timer = window.setTimeout(() => setIsLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  const queryResult = useMemo(
    () =>
      fetchRequisitions({
        page: currentPage,
        limit: REQUISITION_PAGE_SIZE,
        chip: activeChip,
        advanced: advancedFilters,
      }),
    [activeChip, advancedFilters, currentPage],
  );

  const statCards = useMemo<RequisitionStatCardData[]>(
    () => [
      {
        id: "pending-requests",
        label: "Pending Requests",
        value: String(queryResult.stats.pendingRequests).padStart(2, "0"),
        variant: "default",
      },
      {
        id: "critical-requests",
        label: "Critical Requests",
        value: String(queryResult.stats.criticalRequests).padStart(2, "0"),
        variant: "critical",
      },
      {
        id: "awaiting-allocation",
        label: "Awaiting Allocation",
        value: String(queryResult.stats.awaitingAllocation).padStart(2, "0"),
        variant: "default",
      },
      {
        id: "todays-requests",
        label: "Today's Requests",
        value: String(queryResult.stats.todaysRequests).padStart(2, "0"),
        variant: "default",
      },
    ],
    [queryResult.stats],
  );

  const handleChipChange = useCallback((chip: RequisitionFilterChip) => {
    setActiveChip(chip);
    setCurrentPage(1);
  }, []);

  const handleAdvancedFilterApply = useCallback(
    (filters: RequisitionAdvancedFilters) => {
      setAdvancedFilters(filters);
      setCurrentPage(1);
    },
    [],
  );

  const handleApprove = useCallback((item: RequisitionListItem) => {
    // TODO: Connect to requisition approval API
    void item;
  }, []);

  const handleReject = useCallback((item: RequisitionListItem) => {
    // TODO: Connect to requisition rejection API
    void item;
  }, []);

  const handleExport = useCallback(() => {
    // TODO: Connect to requisition export API
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <RequisitionStatsCard
            key={stat.id}
            stat={stat}
            isLoading={isLoading}
          />
        ))}
      </div>

      <RequisitionTable
        items={queryResult.data}
        isLoading={isLoading}
        currentPage={queryResult.meta.page}
        totalItems={queryResult.meta.total}
        pageSize={REQUISITION_PAGE_SIZE}
        activeChip={activeChip}
        onChipChange={handleChipChange}
        onPageChange={setCurrentPage}
        onAdvancedFilter={() => setIsAdvancedFilterOpen(true)}
        onExport={handleExport}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <RequisitionAdvancedFilter
        open={isAdvancedFilterOpen}
        onOpenChange={setIsAdvancedFilterOpen}
        filters={advancedFilters}
        onApply={handleAdvancedFilterApply}
      />

      <p className="pt-2 text-center text-xs text-gray-400">
        BuildQuick India | Enterprise Resource Planning v4.2.0 | © 2023
      </p>
    </div>
  );
}
