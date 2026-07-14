"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { RequisitionAdvancedFilter } from "@/components/requisitions/RequisitionAdvancedFilter";
import { RequisitionDetailDrawer } from "@/components/requisitions/RequisitionDetailDrawer";
import {
  RequisitionStatsCard,
  type RequisitionStatCardData,
} from "@/components/requisitions/RequisitionStatsCard";
import { RequisitionTable } from "@/components/requisitions/RequisitionTable";
import { useAuth } from "@/hooks/use-auth";
import {
  EMPTY_REQUISITION_ADVANCED_FILTERS,
  fetchRequisitions,
  REQUISITION_PAGE_SIZE,
} from "@/mock/requisitions";
import { useWarehouseErpStore } from "@/store/warehouse-erp-store";
import type {
  RequisitionAdvancedFilters,
  RequisitionFilterChip,
  RequisitionListItem,
} from "@/types/warehouse.types";
import { notify } from "@/utils/notify";

const STAT_CHIP_MAP = {
  "pending-requests": "pending",
  "critical-requests": "critical",
  "awaiting-allocation": "awaiting-allocation",
  "todays-requests": "today",
} as const satisfies Record<string, RequisitionFilterChip>;

export function RequisitionPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const requisitions = useWarehouseErpStore((state) => state.requisitions);
  const approveRequisition = useWarehouseErpStore(
    (state) => state.approveRequisition,
  );
  const rejectRequisition = useWarehouseErpStore(
    (state) => state.rejectRequisition,
  );
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
  const [drawerInitialAction, setDrawerInitialAction] = useState<
    "approve" | "reject" | null
  >(null);

  useEffect(() => {
    // TODO: Replace simulated loading with requisition API fetch
    const timer = window.setTimeout(() => setIsLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const statusParam = searchParams.get("status");
    const hubParam = searchParams.get("hub");
    const typeParam = searchParams.get("type");

    if (statusParam?.toUpperCase() === "PENDING" || typeParam === "hub") {
      setActiveChip("pending");
    }

    if (hubParam) {
      setAdvancedFilters((current) => ({
        ...current,
        hubId: hubParam,
      }));
      setCurrentPage(1);
    }
  }, [searchParams]);

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

  const handleStatCardClick = useCallback(
    (statId: keyof typeof STAT_CHIP_MAP) => {
      const chip = STAT_CHIP_MAP[statId];
      setActiveChip((current) => (current === chip ? "all" : chip));
      setCurrentPage(1);
    },
    [],
  );

  const handleAdvancedFilterApply = useCallback(
    (filters: RequisitionAdvancedFilters) => {
      setAdvancedFilters(filters);
      setCurrentPage(1);
    },
    [],
  );

  const handleRowSelect = useCallback((item: RequisitionListItem) => {
    setSelectedRequisition(item);
    setDrawerInitialAction(null);
    setIsDetailDrawerOpen(true);
  }, []);

  const handleRowApprove = useCallback((item: RequisitionListItem) => {
    if (item.status !== "PENDING") return;
    setSelectedRequisition(item);
    setDrawerInitialAction("approve");
    setIsDetailDrawerOpen(true);
  }, []);

  const handleRowReject = useCallback((item: RequisitionListItem) => {
    if (item.status !== "PENDING") return;
    setSelectedRequisition(item);
    setDrawerInitialAction("reject");
    setIsDetailDrawerOpen(true);
  }, []);

  const handleDrawerOpenChange = useCallback((open: boolean) => {
    setIsDetailDrawerOpen(open);
    if (!open) {
      setSelectedRequisition(null);
      setDrawerInitialAction(null);
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
        approveRequisition(selectedRequisition.id, {
          adminName,
          remarks: remarks || undefined,
        });

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
    [selectedRequisition, user?.name, approveRequisition],
  );

  const handleReject = useCallback(
    async (remarks: string) => {
      if (!selectedRequisition) return;

      setIsSubmitting(true);

      try {
        // TODO: Replace with requisition rejection API
        await new Promise((resolve) => window.setTimeout(resolve, 400));

        const adminName = user?.name ?? "Super Admin";
        rejectRequisition(selectedRequisition.id, {
          adminName,
          remarks,
        });

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
    [selectedRequisition, user?.name, rejectRequisition],
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
            isActive={activeChip === STAT_CHIP_MAP[stat.id]}
            onClick={() => handleStatCardClick(stat.id)}
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
        onApprove={handleRowApprove}
        onReject={handleRowReject}
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
        initialAction={drawerInitialAction}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <p className="pt-2 text-center text-xs text-gray-400">
        Bajriwala | Enterprise Resource Planning v4.2.0 | © 2023
      </p>
    </div>
  );
}
