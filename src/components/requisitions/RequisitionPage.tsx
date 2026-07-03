"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { RequisitionAdvancedFilter } from "@/components/requisitions/RequisitionAdvancedFilter";
import { RequisitionDetailDrawer } from "@/components/requisitions/RequisitionDetailDrawer";
import {
  RequisitionStatsCard,
  type RequisitionStatCardData,
} from "@/components/requisitions/RequisitionStatsCard";
import { RequisitionTable } from "@/components/requisitions/RequisitionTable";
import { useAuth } from "@/hooks/use-auth";
import {
  approveRequisition,
  EMPTY_REQUISITION_ADVANCED_FILTERS,
  fetchRequisitions,
  REQUISITION_LIST,
  REQUISITION_PAGE_SIZE,
  rejectRequisition,
} from "@/mock/requisitions";
import type {
  RequisitionAdvancedFilters,
  RequisitionFilterChip,
  RequisitionListItem,
} from "@/types/warehouse.types";
import { notify } from "@/utils/notify";

export function RequisitionPage() {
  const { user } = useAuth();
  const [requisitions, setRequisitions] =
    useState<RequisitionListItem[]>(REQUISITION_LIST);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeChip, setActiveChip] = useState<RequisitionFilterChip>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [advancedFilters, setAdvancedFilters] =
    useState<RequisitionAdvancedFilters>(EMPTY_REQUISITION_ADVANCED_FILTERS);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [selectedRequisition, setSelectedRequisition] =
    useState<RequisitionListItem | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  useEffect(() => {
    // TODO: Replace simulated loading with requisition API fetch
    const timer = window.setTimeout(() => setIsLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  const queryResult = useMemo(
    () =>
      fetchRequisitions(requisitions, {
        page: currentPage,
        limit: REQUISITION_PAGE_SIZE,
        chip: activeChip,
        advanced: advancedFilters,
      }),
    [requisitions, activeChip, advancedFilters, currentPage],
  );

  useEffect(() => {
    if (
      queryResult.meta.total > 0 &&
      currentPage > queryResult.meta.totalPages
    ) {
      setCurrentPage(queryResult.meta.totalPages);
    }
  }, [currentPage, queryResult.meta.total, queryResult.meta.totalPages]);

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

  const handleRowSelect = useCallback((item: RequisitionListItem) => {
    setSelectedRequisition(item);
    setIsDetailDrawerOpen(true);
  }, []);

  const handleDrawerOpenChange = useCallback((open: boolean) => {
    setIsDetailDrawerOpen(open);
    if (!open) {
      setSelectedRequisition(null);
    }
  }, []);

  const handleApprove = useCallback(
    async (remarks: string) => {
      if (!selectedRequisition) return;

      setIsSubmitting(true);

      try {
        // TODO: Replace with requisition approval API
        await new Promise((resolve) => window.setTimeout(resolve, 400));

        const adminName = user?.name ?? "Super Admin";
        const result = approveRequisition(
          requisitions,
          selectedRequisition.id,
          { adminName, remarks: remarks || undefined },
        );

        setRequisitions(result.items);
        setIsDetailDrawerOpen(false);
        setSelectedRequisition(null);
        notify.success("Requisition Approved Successfully.");
      } catch {
        notify.error(
          "Approval failed",
          "Unable to approve the requisition. Please try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [requisitions, selectedRequisition, user?.name],
  );

  const handleReject = useCallback(
    async (remarks: string) => {
      if (!selectedRequisition) return;

      setIsSubmitting(true);

      try {
        // TODO: Replace with requisition rejection API
        await new Promise((resolve) => window.setTimeout(resolve, 400));

        const adminName = user?.name ?? "Super Admin";
        const result = rejectRequisition(requisitions, selectedRequisition.id, {
          adminName,
          remarks,
        });

        setRequisitions(result.items);
        setIsDetailDrawerOpen(false);
        setSelectedRequisition(null);
        notify.success("Requisition Rejected Successfully.");
      } catch {
        notify.error(
          "Rejection failed",
          "Unable to reject the requisition. Please try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [requisitions, selectedRequisition, user?.name],
  );

  const handleExport = useCallback(() => {
    // TODO: Connect to requisition export API
  }, []);

  const drawerRequisition = useMemo(() => {
    if (!selectedRequisition) return null;
    return (
      requisitions.find((item) => item.id === selectedRequisition.id) ??
      selectedRequisition
    );
  }, [requisitions, selectedRequisition]);

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
        onRowSelect={handleRowSelect}
      />

      <RequisitionAdvancedFilter
        open={isAdvancedFilterOpen}
        onOpenChange={setIsAdvancedFilterOpen}
        filters={advancedFilters}
        onApply={handleAdvancedFilterApply}
      />

      <RequisitionDetailDrawer
        open={isDetailDrawerOpen}
        onOpenChange={handleDrawerOpenChange}
        requisition={drawerRequisition}
        isSubmitting={isSubmitting}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <p className="pt-2 text-center text-xs text-gray-400">
        BuildQuick India | Enterprise Resource Planning v4.2.0 | © 2023
      </p>
    </div>
  );
}
