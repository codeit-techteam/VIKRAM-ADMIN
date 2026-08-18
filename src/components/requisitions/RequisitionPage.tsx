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
import { invalidatePendingRequisitionCount } from "@/hooks/use-pending-requisition-count";
import {
  EMPTY_REQUISITION_ADVANCED_FILTERS,
  REQUISITION_PAGE_SIZE,
} from "@/mock/requisitions";
import {
  adminRequisitionsService,
  type AdminRequisitionListParams,
} from "@/services/adminRequisitions";
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

function startOfDayIso(date = new Date()): string {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next.toISOString();
}

function daysAgoIso(days: number): string {
  const next = new Date();
  next.setDate(next.getDate() - days);
  next.setHours(0, 0, 0, 0);
  return next.toISOString();
}

function buildListParams(
  chip: RequisitionFilterChip,
  page: number,
  advanced: RequisitionAdvancedFilters,
): AdminRequisitionListParams {
  const search = [advanced.material, advanced.requestedBy]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" ");

  const params: AdminRequisitionListParams = {
    page,
    limit: REQUISITION_PAGE_SIZE,
    search: search || undefined,
  };

  if (advanced.priority !== "all") {
    params.priority =
      advanced.priority === "critical"
        ? "URGENT"
        : advanced.priority === "high"
          ? "HIGH"
          : "NORMAL";
  }

  if (advanced.status !== "all") {
    const statusMap: Record<string, string> = {
      PENDING: "PENDING_APPROVAL",
      APPROVED: "APPROVED",
      REJECTED: "REJECTED",
      ALLOCATED: "ALLOCATED",
      TRANSFERRED: "IN_TRANSIT",
      COMPLETED: "COMPLETED",
    };
    params.status = statusMap[advanced.status] ?? advanced.status;
  }

  if (advanced.dateFrom) params.dateFrom = advanced.dateFrom;
  if (advanced.dateTo) params.dateTo = advanced.dateTo;

  switch (chip) {
    case "pending":
      params.status = "PENDING_APPROVAL";
      break;
    case "critical":
      params.priority = "URGENT";
      break;
    case "awaiting-allocation":
    case "approved":
      params.status = "APPROVED";
      break;
    case "rejected":
      params.status = "REJECTED";
      break;
    case "today":
      params.dateFrom = startOfDayIso();
      break;
    case "last-7-days":
      params.dateFrom = daysAgoIso(7);
      break;
    case "all":
    default:
      break;
  }

  return params;
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function RequisitionPage() {
  const searchParams = useSearchParams();
  const { user: _user } = useAuth();
  const [requisitions, setRequisitions] = useState<RequisitionListItem[]>([]);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    criticalRequests: 0,
    awaitingAllocation: 0,
    todaysRequests: 0,
    total: 0,
    totalPages: 1,
  });
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
    const statusParam = searchParams.get("status");
    const hubParam = searchParams.get("hub");
    const typeParam = searchParams.get("type");
    const chipParam = searchParams.get("chip");

    if (chipParam === "critical") {
      setActiveChip("critical");
    } else if (
      statusParam?.toUpperCase() === "PENDING" ||
      statusParam?.toUpperCase() === "PENDING_APPROVAL" ||
      typeParam === "hub"
    ) {
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

  const loadRequisitions = useCallback(async () => {
    setIsLoading(true);
    try {
      const listParams = buildListParams(
        activeChip,
        currentPage,
        advancedFilters,
      );

      const [list, apiStats, todayList] = await Promise.all([
        adminRequisitionsService.list(listParams),
        adminRequisitionsService.stats(),
        adminRequisitionsService.list({
          page: 1,
          limit: 1,
          dateFrom: startOfDayIso(),
        }),
      ]);

      setRequisitions(list.data);
      setStats({
        pendingRequests:
          apiStats.pendingRequests ?? apiStats.pendingApproval ?? 0,
        criticalRequests:
          apiStats.criticalRequests ?? apiStats.delayedRequests?.value ?? 0,
        awaitingAllocation: apiStats.awaitingAllocation ?? 0,
        todaysRequests: todayList.meta.total,
        total: list.meta.total,
        totalPages: list.meta.totalPages,
      });
    } catch {
      notify.error("Failed to load requisitions");
    } finally {
      setIsLoading(false);
    }
  }, [activeChip, advancedFilters, currentPage]);

  useEffect(() => {
    void loadRequisitions();
    const timer = window.setInterval(() => {
      void loadRequisitions();
    }, 15_000);
    const refreshOnFocus = () => {
      if (document.visibilityState === "hidden") return;
      void loadRequisitions();
    };
    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [loadRequisitions]);

  const queryResult = useMemo(
    () => ({
      data: requisitions,
      meta: {
        page: currentPage,
        totalPages: stats.totalPages,
        total: stats.total,
      },
      stats,
    }),
    [requisitions, currentPage, stats],
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
    async (
      remarks: string,
      items: Array<{ itemId: string; approvedQty: number }>,
    ) => {
      if (!selectedRequisition) return;

      setIsSubmitting(true);

      try {
        let approveItems = items;
        if (approveItems.length === 0) {
          const detail = await adminRequisitionsService.getById(
            selectedRequisition.id,
          );
          approveItems = (detail.materials ?? []).map((material) => ({
            itemId: material.id,
            approvedQty: material.requestedQty,
          }));
        }

        await adminRequisitionsService.approve(selectedRequisition.id, {
          items: approveItems,
          comment: remarks || undefined,
        });

        setIsDetailDrawerOpen(false);
        setSelectedRequisition(null);
        invalidatePendingRequisitionCount();
        notify.success("Requisition Approved Successfully.");
        await loadRequisitions();
      } catch {
        notify.error(
          "Approval failed",
          "Unable to approve the requisition. Please try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedRequisition, loadRequisitions],
  );

  const handleReject = useCallback(
    async (remarks: string) => {
      if (!selectedRequisition) return;

      setIsSubmitting(true);

      try {
        await adminRequisitionsService.reject(selectedRequisition.id, {
          reason: remarks || "Rejected by warehouse",
          comment: remarks || undefined,
        });

        setIsDetailDrawerOpen(false);
        setSelectedRequisition(null);
        invalidatePendingRequisitionCount();
        notify.success("Requisition Rejected Successfully.");
        await loadRequisitions();
      } catch {
        notify.error(
          "Rejection failed",
          "Unable to reject the requisition. Please try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedRequisition, loadRequisitions],
  );

  const handleDispatch = useCallback(async () => {
    if (!selectedRequisition) return;

    setIsSubmitting(true);
    try {
      await adminRequisitionsService.dispatch(selectedRequisition.id, {});
      setIsDetailDrawerOpen(false);
      setSelectedRequisition(null);
      notify.success("Requisition Dispatched Successfully.");
      await loadRequisitions();
    } catch {
      notify.error(
        "Dispatch failed",
        "Unable to dispatch the requisition. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedRequisition, loadRequisitions]);

  const handleExport = useCallback(() => {
    if (requisitions.length === 0) {
      notify.info("Nothing to export", "No requisitions match the current view.");
      return;
    }

    const header = [
      "Request ID",
      "Hub",
      "Material",
      "Requested Qty",
      "Unit",
      "Priority",
      "Status",
      "Requested On",
      "Requested By",
    ];
    const rows = requisitions.map((item) =>
      [
        item.requestId,
        item.hubName,
        item.material,
        String(item.requestedQty),
        item.unit,
        item.priority,
        item.status,
        item.createdAt,
        item.requestedBy.name,
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );

    downloadCsv(
      `requisitions-page-${currentPage}.csv`,
      [header.join(","), ...rows].join("\n"),
    );
    notify.success("Export ready", "Visible requisitions downloaded as CSV.");
  }, [requisitions, currentPage]);

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
        onDispatch={handleDispatch}
      />

      <p className="pt-2 text-center text-xs text-gray-400">
        Bajriwala | Enterprise Resource Planning v4.2.0 | © 2023
      </p>
    </div>
  );
}
