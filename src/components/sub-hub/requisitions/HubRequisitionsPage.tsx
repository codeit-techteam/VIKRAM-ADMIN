"use client";

import { Download } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import { HubRequisitionDetailDrawer } from "@/components/sub-hub/requisitions/HubRequisitionDetailDrawer";
import { HubRequisitionFiltersBar } from "@/components/sub-hub/requisitions/HubRequisitionFilters";
import {
  buildHubRequisitionStatCards,
  HubRequisitionStatsCard,
  type HubRequisitionStatKey,
} from "@/components/sub-hub/requisitions/HubRequisitionStatsCard";
import { HubRequisitionTable } from "@/components/sub-hub/requisitions/HubRequisitionTable";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";
import {
  collectHubRequisitionMaterials,
  EMPTY_HUB_REQUISITION_FILTERS,
  fetchHubRequisitions,
  filterHubRequisitions,
  getHubRequisitionDetailView,
  HUB_REQUISITION_PAGE_SIZE,
  type HubRequisitionFilters,
} from "@/mock/hub-requisitions";
import { formatRequisitionQuantity } from "@/mock/requisitions";
import { normalizeHubInventory, resolveSubHubs } from "@/store/sub-hub-state";
import { useWarehouseErpStore } from "@/store/warehouse-erp-store";
import type {
  RequisitionListItem,
  RequisitionStatus,
} from "@/types/warehouse.types";
import { printHubRequisition } from "@/utils/hub-requisition-print";
import { setActiveAllocationForTransfer } from "@/utils/allocation-transfer-bridge";
import { notify } from "@/utils/notify";

const STAT_STATUS_MAP: Record<
  HubRequisitionStatKey,
  HubRequisitionFilters["status"]
> = {
  pending: "PENDING",
  approved: "APPROVED",
  rejected: "REJECTED",
  completed: "COMPLETED",
};

function downloadCsv(items: RequisitionListItem[]) {
  const header = [
    "Req ID",
    "Hub",
    "Manager",
    "Material",
    "Requested Qty",
    "Approved Qty",
    "Priority",
    "Status",
    "Created Date",
  ];

  const lines = items.map((item) => {
    const approvedQtyValue =
      item.status === "PENDING" || item.status === "REJECTED"
        ? ""
        : formatRequisitionQuantity(
            item.approvedQty ?? item.requestedQty,
            item.unit,
          );

    return [
      item.requestId,
      item.hubName,
      item.requestedBy.name,
      item.material,
      formatRequisitionQuantity(item.requestedQty, item.unit),
      approvedQtyValue,
      item.priority,
      item.status,
      new Date(item.createdAt).toISOString(),
    ]
      .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
      .join(",");
  });

  const blob = new Blob([[header.join(","), ...lines].join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `hub-requisitions-${Date.now()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function HubRequisitionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const subHubs = useWarehouseErpStore((state) => state.subHubs);
  const hubInventory = useWarehouseErpStore((state) => state.hubInventory);
  const requisitions = useWarehouseErpStore((state) => state.requisitions);
  const activityLogs = useWarehouseErpStore((state) => state.activityLogs);
  const approveRequisition = useWarehouseErpStore(
    (state) => state.approveRequisition,
  );
  const rejectRequisition = useWarehouseErpStore(
    (state) => state.rejectRequisition,
  );
  const getAllocationById = useWarehouseErpStore(
    (state) => state.getAllocationById,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState<HubRequisitionFilters>(
    EMPTY_HUB_REQUISITION_FILTERS,
  );
  const [activeStat, setActiveStat] = useState<HubRequisitionStatKey | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequisition, setSelectedRequisition] =
    useState<RequisitionListItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerInitialAction, setDrawerInitialAction] = useState<
    "approve" | "reject" | null
  >(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const hubParam = searchParams.get("hub");
    const statusParam = searchParams.get("status");
    const materialParam = searchParams.get("material");

    setFilters((current) => {
      const next = { ...current };

      if (hubParam) {
        next.hubId = hubParam;
      }

      if (statusParam) {
        next.status = statusParam.toUpperCase() as RequisitionStatus;
      }

      if (materialParam) {
        const byId = requisitions.find(
          (item) => item.materialId === materialParam,
        );
        next.material = byId?.material ?? materialParam;
      }

      return next;
    });
    setCurrentPage(1);
  }, [searchParams, requisitions]);

  const resolvedSubHubs = useMemo(() => resolveSubHubs(subHubs), [subHubs]);
  const resolvedHubInventory = useMemo(
    () => normalizeHubInventory(hubInventory),
    [hubInventory],
  );

  const queryFilters = useMemo(() => {
    if (!activeStat) return filters;
    return { ...filters, status: STAT_STATUS_MAP[activeStat] };
  }, [filters, activeStat]);

  const queryResult = useMemo(
    () =>
      fetchHubRequisitions(requisitions, {
        page: currentPage,
        limit: HUB_REQUISITION_PAGE_SIZE,
        filters: queryFilters,
      }),
    [requisitions, queryFilters, currentPage],
  );

  const allFilteredForExport = useMemo(
    () =>
      filterHubRequisitions(requisitions, {
        filters: queryFilters,
      }),
    [requisitions, queryFilters],
  );

  const materials = useMemo(
    () => collectHubRequisitionMaterials(requisitions),
    [requisitions],
  );

  const statCards = useMemo(
    () => buildHubRequisitionStatCards(queryResult.stats),
    [queryResult.stats],
  );

  const drawerDetail = useMemo(() => {
    if (!selectedRequisition) return null;

    const latest =
      requisitions.find((item) => item.id === selectedRequisition.id) ??
      selectedRequisition;

    return getHubRequisitionDetailView(
      latest,
      resolvedSubHubs,
      resolvedHubInventory,
      activityLogs,
    );
  }, [
    selectedRequisition,
    requisitions,
    resolvedSubHubs,
    resolvedHubInventory,
    activityLogs,
  ]);

  useEffect(() => {
    if (
      queryResult.meta.total > 0 &&
      currentPage > queryResult.meta.totalPages
    ) {
      setCurrentPage(queryResult.meta.totalPages);
    }
  }, [currentPage, queryResult.meta.total, queryResult.meta.totalPages]);

  const handleFilterChange = (next: Partial<HubRequisitionFilters>) => {
    startTransition(() => {
      setFilters((prev) => ({ ...prev, ...next }));
      setActiveStat(null);
      setCurrentPage(1);
    });
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_HUB_REQUISITION_FILTERS);
    setActiveStat(null);
    setCurrentPage(1);
  };

  const handleStatClick = (statId: HubRequisitionStatKey) => {
    setActiveStat((current) => (current === statId ? null : statId));
    setCurrentPage(1);
  };

  const openDrawer = useCallback(
    (item: RequisitionListItem, action: "approve" | "reject" | null = null) => {
      setSelectedRequisition(item);
      setDrawerInitialAction(action);
      setDrawerOpen(true);
    },
    [],
  );

  const handleDrawerOpenChange = useCallback((open: boolean) => {
    setDrawerOpen(open);
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
        await new Promise((resolve) => window.setTimeout(resolve, 400));

        approveRequisition(selectedRequisition.id, {
          adminName: user?.name ?? "Super Admin",
          remarks: remarks || undefined,
        });

        setDrawerOpen(false);
        setSelectedRequisition(null);
        notify.success("Requisition approved successfully.");
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
        await new Promise((resolve) => window.setTimeout(resolve, 400));

        rejectRequisition(selectedRequisition.id, {
          adminName: user?.name ?? "Super Admin",
          remarks,
        });

        setDrawerOpen(false);
        setSelectedRequisition(null);
        notify.success("Requisition rejected successfully.");
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

  const handleGenerateTransfer = useCallback(
    (item?: RequisitionListItem) => {
      const target =
        item ??
        requisitions.find((entry) => entry.id === selectedRequisition?.id) ??
        selectedRequisition;

      if (!target?.allocationId) {
        notify.error(
          "Cannot generate transfer",
          "Approve the requisition and complete allocation first.",
        );
        return;
      }

      const allocation = getAllocationById(target.allocationId);
      if (!allocation) {
        notify.error(
          "Cannot generate transfer",
          "Allocation record was not found.",
        );
        return;
      }

      setActiveAllocationForTransfer(allocation);
      router.push(
        `${ROUTES.CENTRAL_WAREHOUSE}/transfers/new?allocationId=${target.allocationId}`,
      );
      notify.success(
        "Transfer workflow started",
        `Opening transfer for ${target.requestId}.`,
      );
    },
    [requisitions, selectedRequisition, getAllocationById, router],
  );

  const handlePrint = useCallback(
    (item?: RequisitionListItem) => {
      const target =
        item ??
        requisitions.find((entry) => entry.id === selectedRequisition?.id) ??
        selectedRequisition;

      if (!target) return;

      const detail = getHubRequisitionDetailView(
        target,
        resolvedSubHubs,
        resolvedHubInventory,
        activityLogs,
      );

      printHubRequisition(detail);
      notify.success("Print preview opened", target.requestId);
    },
    [
      requisitions,
      selectedRequisition,
      resolvedSubHubs,
      resolvedHubInventory,
      activityLogs,
    ],
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => setIsRefreshing(false), 700);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Hub Requisitions"
        subtitle="Review, approve, and fulfill material requests raised by sub-hub managers."
        breadcrumbs={getNavBreadcrumbsFromPath("/sub-hub-network/requisitions")}
        actions={
          <Button
            type="button"
            variant="outline"
            className="h-10 gap-2 px-4"
            onClick={() => downloadCsv(allFilteredForExport)}
            disabled={allFilteredForExport.length === 0}
          >
            <Download className="size-4" />
            Export CSV
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat, index) => (
          <HubRequisitionStatsCard
            key={stat.id}
            stat={stat}
            isLoading={isLoading}
            index={index}
            isActive={activeStat === stat.id}
            onClick={() => handleStatClick(stat.id)}
          />
        ))}
      </div>

      <HubRequisitionFiltersBar
        filters={filters}
        hubs={resolvedSubHubs}
        materials={materials}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      <HubRequisitionTable
        items={queryResult.data}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        currentPage={queryResult.meta.page}
        totalItems={queryResult.meta.total}
        pageSize={HUB_REQUISITION_PAGE_SIZE}
        onPageChange={setCurrentPage}
        onRefresh={handleRefresh}
        onRowSelect={(item) => openDrawer(item)}
        onApprove={(item) => openDrawer(item, "approve")}
        onReject={(item) => openDrawer(item, "reject")}
        onGenerateTransfer={handleGenerateTransfer}
        onPrint={handlePrint}
      />

      <HubRequisitionDetailDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        detail={drawerDetail}
        isSubmitting={isSubmitting}
        initialAction={drawerInitialAction}
        onApprove={handleApprove}
        onReject={handleReject}
        onGenerateTransfer={() => handleGenerateTransfer()}
        onPrint={() => handlePrint()}
      />
    </div>
  );
}
