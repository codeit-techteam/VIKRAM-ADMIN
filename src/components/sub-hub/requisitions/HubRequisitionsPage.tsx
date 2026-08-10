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
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { HubContextSelector } from "@/components/sub-hub/HubContextSelector";
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
import {
  EMPTY_HUB_REQUISITION_FILTERS,
  formatRequisitionQuantity,
  HUB_REQUISITION_PAGE_SIZE,
  type HubRequisitionFilters,
} from "@/constants/sub-hub-ops.constants";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";
import {
  adminRequisitionsService,
} from "@/services/adminRequisitions";
import { hubsService } from "@/services/hubs.service";
import { useSelectedHubStore } from "@/store/selected-hub-store";
import type {
  RequisitionListItem,
  RequisitionStatus,
} from "@/types/warehouse.types";
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

function mapUiStatusToApi(status: RequisitionStatus | "all"): string | undefined {
  if (status === "all") return undefined;
  if (status === "PENDING") return "PENDING_APPROVAL";
  if (status === "TRANSFERRED") return "IN_TRANSIT";
  return status;
}

export function HubRequisitionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const selectedHubId = useSelectedHubStore((s) => s.selectedHubId);
  const selectedHubName = useSelectedHubStore((s) => s.selectedHubName);
  const setSelectedHub = useSelectedHubStore((s) => s.setSelectedHub);

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  const hubsQuery = useQuery({
    queryKey: ["admin-hubs", "requisitions-page"],
    queryFn: () => hubsService.list({ page: 1, limit: 100 }),
  });
  const hubs = hubsQuery.data?.data ?? [];

  useEffect(() => {
    const hubParam = searchParams.get("hubId") || searchParams.get("hub");
    const statusParam = searchParams.get("status");
    const materialParam = searchParams.get("material");

    startTransition(() => {
      setFilters((prev) => ({
        ...prev,
        hubId: hubParam || selectedHubId || "all",
        status: (statusParam?.toUpperCase() as RequisitionStatus) || prev.status,
        material: materialParam || prev.material,
      }));
      if (hubParam) {
        const match = hubs.find((h) => h.id === hubParam);
        setSelectedHub(hubParam, match?.name ?? null);
      }
    });
  }, [searchParams, selectedHubId, hubs, setSelectedHub]);

  const scopedHubId =
    filters.hubId !== "all" ? filters.hubId : undefined;

  const listQuery = useQuery({
    queryKey: [
      "hub-requisitions",
      scopedHubId ?? "all",
      filters.status,
      filters.priority,
      filters.date,
      search,
      currentPage,
    ],
    queryFn: () =>
      adminRequisitionsService.list({
        page: currentPage,
        limit: HUB_REQUISITION_PAGE_SIZE,
        hubId: scopedHubId,
        status: mapUiStatusToApi(filters.status),
        priority:
          filters.priority !== "all" ? filters.priority.toUpperCase() : undefined,
        dateFrom: filters.date || undefined,
        dateTo: filters.date || undefined,
        search: search || undefined,
      }),
    refetchInterval: 15000,
  });

  const statsQuery = useQuery({
    queryKey: ["hub-requisitions-stats", scopedHubId ?? "all"],
    queryFn: () => adminRequisitionsService.stats(scopedHubId),
    refetchInterval: 15000,
  });

  const items = listQuery.data?.data ?? [];
  const totalItems = listQuery.data?.meta.total ?? 0;

  const stats = useMemo(() => {
    const s = statsQuery.data;
    return {
      pending: s?.pendingApproval ?? s?.pendingRequests ?? 0,
      approved: s?.approvedRequests?.value ?? s?.awaitingAllocation ?? 0,
      rejected: s?.rejected ?? 0,
      completed: s?.completed ?? 0,
    };
  }, [statsQuery.data]);

  const statCards = buildHubRequisitionStatCards(stats);

  const hubOptions = hubs.map((h) => ({
    id: h.id,
    name: h.name,
    nodeId: h.code,
    city: h.city,
    region: h.state,
    isActive: h.isActive,
    managerName: h.manager?.fullName || "Unassigned",
    lastInventorySync: h.updatedAt,
  }));
  const materials = useMemo(
    () =>
      Array.from(new Set(items.map((item) => item.material).filter(Boolean))),
    [items],
  );

  const detailView = useMemo(() => {
    if (!selectedRequisition) return null;
    return {
      requisition: {
        ...selectedRequisition,
        materials: [
          {
            id: selectedRequisition.materialId,
            name: selectedRequisition.material,
            sku: selectedRequisition.sku,
            requestedQty: selectedRequisition.requestedQty,
            approvedQty: selectedRequisition.approvedQty,
            unit: selectedRequisition.unit,
          },
        ],
      },
      hubManager: selectedRequisition.requestedBy.name,
      hubCity: selectedHubName || selectedRequisition.hubName,
      hubRegion: "",
      inventory: null,
      timeline: [
        {
          id: "created",
          title: "Requisition created",
          actor: selectedRequisition.requestedBy.name,
          timestamp: selectedRequisition.createdAt,
          variant: "info" as const,
        },
      ],
    };
  }, [selectedRequisition, selectedHubName]);

  const hubLabel =
    scopedHubId == null
      ? "all hubs"
      : selectedHubName ||
        hubs.find((h) => h.id === scopedHubId)?.name ||
        "this hub";

  const handleFilterChange = useCallback(
    (next: Partial<HubRequisitionFilters>) => {
      startTransition(() => {
        setFilters((prev) => ({ ...prev, ...next }));
        if (next.hubId !== undefined) {
          if (next.hubId === "all") {
            setSelectedHub(null, null);
          } else {
            const match = hubs.find((h) => h.id === next.hubId);
            setSelectedHub(next.hubId, match?.name ?? null);
          }
        }
        setActiveStat(null);
        setCurrentPage(1);
      });
    },
    [hubs, setSelectedHub],
  );

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["hub-requisitions"] }),
      queryClient.invalidateQueries({ queryKey: ["hub-requisitions-stats"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-hubs"] }),
    ]);
  };

  const openDrawer = (
    item: RequisitionListItem,
    action: "approve" | "reject" | null = null,
  ) => {
    setSelectedRequisition(item);
    setDrawerInitialAction(action);
    setDrawerOpen(true);
  };

  const handleApprove = async (remarks: string) => {
    if (!selectedRequisition) return;
    setIsSubmitting(true);
    try {
      const detail = await adminRequisitionsService.getById(
        selectedRequisition.id,
      );
      await adminRequisitionsService.approve(selectedRequisition.id, {
        items: (detail.materials ?? []).map((m) => ({
          itemId: m.id,
          approvedQty: m.requestedQty,
        })),
        comment: remarks || `Approved by ${user?.name || "Admin"}`,
      });
      notify.success("Requisition approved");
      await invalidate();
      setDrawerOpen(false);
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Unable to approve requisition",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (remarks: string) => {
    if (!selectedRequisition) return;
    setIsSubmitting(true);
    try {
      await adminRequisitionsService.reject(selectedRequisition.id, {
        reason: remarks || "Rejected by admin",
      });
      notify.success("Requisition rejected");
      await invalidate();
      setDrawerOpen(false);
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Unable to reject requisition",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAllocate = async (item: RequisitionListItem) => {
    try {
      router.push(
        `${ROUTES.CENTRAL_WAREHOUSE}/allocation?requisitionId=${item.id}`,
      );
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : "Unable to open allocation",
      );
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Hub Requisitions"
        subtitle={`Requisitions raised by ${hubLabel}.`}
        breadcrumbs={getNavBreadcrumbsFromPath(
          "/sub-hub-network/requisitions",
        )}
        actions={
          <>
            <HubContextSelector className="mr-2" allowAll allLabel="All Hubs" />
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2 px-4"
              onClick={() => downloadCsv(items)}
              disabled={items.length === 0}
            >
              <Download className="size-4" />
              Export CSV
            </Button>
          </>
        }
      />

      {listQuery.isError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load requisitions
          {scopedHubId ? ` for ${hubLabel}` : ""}.{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => void listQuery.refetch()}
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat, index) => (
          <HubRequisitionStatsCard
            key={stat.id}
            stat={stat}
            index={index}
            isLoading={statsQuery.isLoading}
            isActive={activeStat === stat.id}
            onClick={() => {
              const nextStatus = STAT_STATUS_MAP[stat.id];
              setActiveStat((curr) => (curr === stat.id ? null : stat.id));
              handleFilterChange({
                status: activeStat === stat.id ? "all" : nextStatus,
              });
            }}
          />
        ))}
      </div>

      <HubRequisitionFiltersBar
        filters={filters}
        hubs={hubOptions}
        materials={materials}
        onChange={handleFilterChange}
        onClear={() => {
          setFilters({ ...EMPTY_HUB_REQUISITION_FILTERS });
          setSelectedHub(null, null);
          setSearch("");
          setActiveStat(null);
          setCurrentPage(1);
        }}
      />

      <HubRequisitionTable
        items={items}
        isLoading={listQuery.isLoading}
        isRefreshing={listQuery.isFetching && !listQuery.isLoading}
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={HUB_REQUISITION_PAGE_SIZE}
        onPageChange={setCurrentPage}
        onRefresh={() => void listQuery.refetch()}
        onRowSelect={(item) => openDrawer(item)}
        onApprove={(item) => openDrawer(item, "approve")}
        onReject={(item) => openDrawer(item, "reject")}
        onGenerateTransfer={(item) => void handleAllocate(item)}
      />

      {!listQuery.isLoading && !listQuery.isError && items.length === 0 ? (
        <p className="text-center text-sm text-[#64748B]">
          {scopedHubId
            ? `No requisitions found for ${hubLabel}.`
            : "No requisitions found."}
        </p>
      ) : null}

      <HubRequisitionDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        detail={detailView as never}
        initialAction={drawerInitialAction}
        isSubmitting={isSubmitting}
        onApprove={(remarks) => void handleApprove(remarks)}
        onReject={(remarks) => void handleReject(remarks)}
        onGenerateTransfer={() => {
          if (selectedRequisition) void handleAllocate(selectedRequisition);
        }}
      />
    </div>
  );
}
