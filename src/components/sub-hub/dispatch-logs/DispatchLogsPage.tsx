"use client";

import { Download } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useQuery } from "@tanstack/react-query";

import { HubContextSelector } from "@/components/sub-hub/HubContextSelector";
import { DispatchLogDetailDrawer } from "@/components/sub-hub/dispatch-logs/DispatchLogDetailDrawer";
import { DispatchLogFiltersBar } from "@/components/sub-hub/dispatch-logs/DispatchLogFilters";
import {
  buildDispatchLogStatCards,
  DispatchLogStatsCard,
  type DispatchLogStatKey,
} from "@/components/sub-hub/dispatch-logs/DispatchLogStatsCard";
import { DispatchLogTable } from "@/components/sub-hub/dispatch-logs/DispatchLogTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import {
  DISPATCH_LOG_PAGE_SIZE,
  DISPATCH_LOG_STATUS_LABELS,
  EMPTY_DISPATCH_LOG_FILTERS,
  formatDispatchLogDateTime,
} from "@/constants/sub-hub-ops.constants";
import { hubsService } from "@/services/hubs.service";
import { useSelectedHubStore } from "@/store/selected-hub-store";
import type {
  DispatchLog,
  DispatchLogFilters,
  DispatchLogStatus,
} from "@/types/dispatch-log.types";

function mapStatus(status: string): DispatchLogStatus {
  const upper = status.toUpperCase();
  if (upper === "READY_FOR_DISPATCH" || upper === "PACKED") {
    return "READY_FOR_DISPATCH";
  }
  if (upper === "ASSIGNED" || upper === "DRIVER_ASSIGNED") return "ASSIGNED";
  if (
    upper === "DISPATCHED" ||
    upper === "OUT_FOR_DELIVERY" ||
    upper === "REACHED_AREA"
  ) {
    return upper === "REACHED_AREA" ? "REACHED_AREA" : "DISPATCHED";
  }
  if (upper === "DELIVERED") return "DELIVERED";
  return "READY_FOR_DISPATCH";
}

function mapDispatchLog(row: Record<string, unknown>): DispatchLog {
  return {
    id: String(row.id ?? ""),
    dispatchId: String(row.dispatchId ?? ""),
    orderId: String(row.orderId ?? ""),
    customerId: String(row.customerId ?? ""),
    customerName: String(row.customerName ?? "Customer"),
    customerMobile: String(row.customerMobile ?? ""),
    deliveryAddress: String(row.deliveryAddress ?? "—"),
    pincode: String(row.pincode ?? ""),
    hubId: String(row.hubId ?? ""),
    hubName: String(row.hubName ?? ""),
    vehicleId: (row.vehicleId as string | null) ?? null,
    vehicleNumber: (row.vehicleNumber as string | null) ?? null,
    vehicleType: (row.vehicleType as string | null) ?? null,
    driverId: (row.driverId as string | null) ?? null,
    driverName: (row.driverName as string | null) ?? null,
    driverMobile: (row.driverMobile as string | null) ?? null,
    dispatchTime: (row.dispatchTime as string | null) ?? null,
    expectedDelivery: String(row.expectedDelivery ?? new Date().toISOString()),
    status: mapStatus(String(row.status ?? "READY_FOR_DISPATCH")),
    isDelayed: Boolean(row.isDelayed),
    lastUpdated: String(row.lastUpdated ?? new Date().toISOString()),
    deliveryNotes: String(row.deliveryNotes ?? ""),
    orderLines: Array.isArray(row.orderLines)
      ? (row.orderLines as DispatchLog["orderLines"])
      : [],
    orderValue: Number(row.orderValue ?? 0),
    timeline: Array.isArray(row.timeline)
      ? (row.timeline as DispatchLog["timeline"])
      : [],
    createdAt: String(row.createdAt ?? new Date().toISOString()),
  };
}

function downloadCsv(items: DispatchLog[]) {
  const header = [
    "Dispatch ID",
    "Order ID",
    "Customer",
    "Hub",
    "Vehicle",
    "Driver",
    "Dispatch Time",
    "Status",
    "Last Updated",
  ];

  const lines = items.map((item) =>
    [
      item.dispatchId,
      item.orderId,
      item.customerName,
      item.hubName,
      item.vehicleNumber ?? "",
      item.driverName ?? "",
      item.dispatchTime ? formatDispatchLogDateTime(item.dispatchTime) : "",
      item.isDelayed && item.status !== "DELIVERED"
        ? "Delayed"
        : DISPATCH_LOG_STATUS_LABELS[item.status],
      formatDispatchLogDateTime(item.lastUpdated),
    ]
      .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
      .join(","),
  );

  const blob = new Blob([[header.join(","), ...lines].join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `dispatch-logs-${Date.now()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function DispatchLogsPage() {
  const searchParams = useSearchParams();
  const selectedHubId = useSelectedHubStore((s) => s.selectedHubId);
  const selectedHubName = useSelectedHubStore((s) => s.selectedHubName);
  const setSelectedHub = useSelectedHubStore((s) => s.setSelectedHub);

  const [filters, setFilters] = useState<DispatchLogFilters>(
    EMPTY_DISPATCH_LOG_FILTERS,
  );
  const [activeStat, setActiveStat] = useState<DispatchLogStatKey | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<DispatchLog | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [, startTransition] = useTransition();

  const hubsQuery = useQuery({
    queryKey: ["admin-hubs", "dispatch-logs-page"],
    queryFn: () => hubsService.list({ page: 1, limit: 100 }),
  });
  const hubs = hubsQuery.data?.data ?? [];

  useEffect(() => {
    const hubParam = searchParams.get("hubId") || searchParams.get("hub");
    const nextHubId = hubParam || selectedHubId || "all";
    setFilters((prev) =>
      prev.hubId === nextHubId ? prev : { ...prev, hubId: nextHubId },
    );
    if (hubParam) {
      const match = hubs.find((h) => h.id === hubParam);
      setSelectedHub(hubParam, match?.name ?? null);
    }
  }, [searchParams, selectedHubId, hubs, setSelectedHub]);

  const scopedHubId =
    filters.hubId !== "all" ? filters.hubId : undefined;

  const logsQuery = useQuery({
    queryKey: [
      "hub-dispatch-logs",
      scopedHubId ?? "all",
      filters.status,
      filters.date,
      search,
      currentPage,
    ],
    queryFn: () =>
      hubsService.listDispatchLogs({
        hubId: scopedHubId,
        page: currentPage,
        limit: DISPATCH_LOG_PAGE_SIZE,
        search: search || undefined,
        status:
          filters.status === "all" ? undefined : String(filters.status),
        date: filters.date || undefined,
      }),
    refetchInterval: 15000,
  });

  const items = useMemo(
    () => (logsQuery.data?.data ?? []).map(mapDispatchLog),
    [logsQuery.data],
  );

  const stats = logsQuery.data?.stats ?? {
    todaysDispatch: 0,
    inProgress: 0,
    delivered: 0,
    delayed: 0,
  };

  const statCards = buildDispatchLogStatCards({
    todaysDispatch: stats.todaysDispatch,
    inProgress: stats.inProgress,
    delivered: stats.delivered,
    delayed: stats.delayed,
  });

  const hubLabel =
    scopedHubId == null
      ? "all hubs"
      : selectedHubName ||
        hubs.find((h) => h.id === scopedHubId)?.name ||
        "this hub";

  const handleFilterChange = useCallback(
    (next: Partial<DispatchLogFilters>) => {
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
        setCurrentPage(1);
      });
    },
    [hubs, setSelectedHub],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dispatch Logs"
        subtitle={
          scopedHubId
            ? `Last-mile customer deliveries from ${hubLabel}.`
            : "Last-mile customer deliveries from all hubs."
        }
        breadcrumbs={getNavBreadcrumbsFromPath(
          "/sub-hub-network/dispatch-logs",
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

      {logsQuery.isError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load dispatch logs
          {scopedHubId ? ` for ${hubLabel}` : ""}.{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => void logsQuery.refetch()}
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat, index) => (
          <DispatchLogStatsCard
            key={stat.id}
            stat={stat}
            index={index}
            isLoading={logsQuery.isLoading}
            isActive={activeStat === stat.id}
            onClick={() => {
              setActiveStat((curr) => (curr === stat.id ? null : stat.id));
              if (stat.id === "delivered") {
                handleFilterChange({
                  status:
                    activeStat === "delivered" ? "all" : "DELIVERED",
                });
              }
            }}
          />
        ))}
      </div>

      <DispatchLogFiltersBar
        filters={filters}
        hubs={hubs.map((h) => ({ id: h.id, name: h.name }))}
        onChange={handleFilterChange}
        onClear={() => {
          setFilters({ ...EMPTY_DISPATCH_LOG_FILTERS });
          setSelectedHub(null, null);
          setSearch("");
          setActiveStat(null);
          setCurrentPage(1);
        }}
      />

      <DispatchLogTable
        items={items}
        isLoading={logsQuery.isLoading}
        isRefreshing={logsQuery.isFetching && !logsQuery.isLoading}
        currentPage={currentPage}
        totalItems={logsQuery.data?.meta.total ?? items.length}
        pageSize={DISPATCH_LOG_PAGE_SIZE}
        onPageChange={setCurrentPage}
        onRefresh={() => void logsQuery.refetch()}
        onRowSelect={(item) => {
          setSelectedLog(item);
          setDrawerOpen(true);
        }}
      />

      {!logsQuery.isLoading && !logsQuery.isError && items.length === 0 ? (
        <p className="text-center text-sm text-[#64748B]">
          {scopedHubId
            ? `No customer dispatches found for ${hubLabel}.`
            : "No customer dispatches found."}
        </p>
      ) : null}

      <DispatchLogDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        log={selectedLog}
      />
    </div>
  );
}
