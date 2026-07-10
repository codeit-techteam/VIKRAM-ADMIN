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

import { DispatchLogDetailDrawer } from "@/components/sub-hub/dispatch-logs/DispatchLogDetailDrawer";
import { DispatchLogFiltersBar } from "@/components/sub-hub/dispatch-logs/DispatchLogFilters";
import {
  buildDispatchLogStatCards,
  DispatchLogStatsCard,
  type DispatchLogStatKey,
} from "@/components/sub-hub/dispatch-logs/DispatchLogStatsCard";
import { DispatchLogTable } from "@/components/sub-hub/dispatch-logs/DispatchLogTable";
import { DispatchLogUpdateStatusModal } from "@/components/sub-hub/dispatch-logs/DispatchLogUpdateStatusModal";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";
import {
  DISPATCH_LOG_HUB_OPTIONS,
  DISPATCH_LOG_OPERATIONAL_FILTER_LABELS,
  DISPATCH_LOG_PAGE_SIZE,
  EMPTY_DISPATCH_LOG_FILTERS,
  fetchDispatchLogs,
  filterDispatchLogs,
  formatDispatchLogDateTime,
} from "@/mock/dispatch-logs";
import { useDispatchLogStore } from "@/store/dispatch-log-store";
import type {
  DispatchLog,
  DispatchLogFilters,
  DispatchLogOperationalFilter,
  DispatchLogStatus,
} from "@/types/dispatch-log.types";
import { printDispatchLogSlip } from "@/utils/dispatch-log-print";
import { notify } from "@/utils/notify";

const OPERATIONAL_FILTER_VALUES = Object.keys(
  DISPATCH_LOG_OPERATIONAL_FILTER_LABELS,
) as DispatchLogOperationalFilter[];

function parseStatusParam(statusParam: string): DispatchLogFilters["status"] {
  const normalized = statusParam.toLowerCase();

  if (
    OPERATIONAL_FILTER_VALUES.includes(
      normalized as DispatchLogOperationalFilter,
    )
  ) {
    return normalized as DispatchLogOperationalFilter;
  }

  return statusParam.toUpperCase() as DispatchLogStatus;
}

const STAT_FILTER_MAP: Partial<
  Record<DispatchLogStatKey, Partial<DispatchLogFilters>>
> = {
  "in-progress": { status: "DISPATCHED" },
  delivered: { status: "DELIVERED" },
};

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
      item.status,
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const logs = useDispatchLogStore((state) => state.logs);
  const updateStatus = useDispatchLogStore((state) => state.updateStatus);
  const updateDeliveryNotes = useDispatchLogStore(
    (state) => state.updateDeliveryNotes,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<DispatchLogFilters>(
    EMPTY_DISPATCH_LOG_FILTERS,
  );
  const [activeStat, setActiveStat] = useState<DispatchLogStatKey | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<DispatchLog | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [, startTransition] = useTransition();

  const adminName = user?.name ?? "Super Admin";

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const hubParam = searchParams.get("hub");
    const statusParam = searchParams.get("status");
    const orderParam = searchParams.get("order");

    setFilters((current) => ({
      ...current,
      ...(hubParam ? { hubId: hubParam } : {}),
      ...(statusParam ? { status: parseStatusParam(statusParam) } : {}),
      ...(orderParam ? { customer: orderParam } : {}),
    }));
    setCurrentPage(1);
  }, [searchParams]);

  const queryFilters = useMemo(() => {
    const statFilters = activeStat ? STAT_FILTER_MAP[activeStat] : undefined;
    return { ...filters, ...statFilters };
  }, [filters, activeStat]);

  const delayedOnly = activeStat === "delayed";
  const todaysOnly = activeStat === "todays-dispatch";

  const queryResult = useMemo(() => {
    let filtered = filterDispatchLogs(logs, { filters: queryFilters });

    if (delayedOnly) {
      filtered = filtered.filter((item) => item.isDelayed);
    }

    if (todaysOnly) {
      const today = new Date();
      filtered = filtered.filter(
        (item) =>
          item.dispatchTime &&
          new Date(item.dispatchTime).toDateString() === today.toDateString(),
      );
    }

    if (activeStat === "in-progress") {
      filtered = filtered.filter((item) =>
        ["PACKED", "READY", "LOADED", "DISPATCHED", "REACHED_AREA"].includes(
          item.status,
        ),
      );
    }

    if (activeStat === "delivered") {
      filtered = filtered.filter(
        (item) => item.status === "DELIVERED" || item.status === "COMPLETED",
      );
    }

    const paginated = fetchDispatchLogs(filtered, {
      page: currentPage,
      limit: DISPATCH_LOG_PAGE_SIZE,
    });

    return {
      ...paginated,
      stats: fetchDispatchLogs(logs).stats,
    };
  }, [logs, queryFilters, currentPage, delayedOnly, todaysOnly, activeStat]);

  const allFilteredForExport = useMemo(() => {
    let items = filterDispatchLogs(logs, { filters: queryFilters });
    if (delayedOnly) items = items.filter((item) => item.isDelayed);
    if (todaysOnly) {
      const today = new Date();
      items = items.filter(
        (item) =>
          item.dispatchTime &&
          new Date(item.dispatchTime).toDateString() === today.toDateString(),
      );
    }
    return items;
  }, [logs, queryFilters, delayedOnly, todaysOnly]);

  const statCards = useMemo(
    () => buildDispatchLogStatCards(queryResult.stats),
    [queryResult.stats],
  );

  const selectedLive = useMemo(() => {
    if (!selectedLog) return null;
    return logs.find((item) => item.id === selectedLog.id) ?? selectedLog;
  }, [logs, selectedLog]);

  useEffect(() => {
    if (
      queryResult.meta.total > 0 &&
      currentPage > queryResult.meta.totalPages
    ) {
      setCurrentPage(queryResult.meta.totalPages);
    }
  }, [currentPage, queryResult.meta.total, queryResult.meta.totalPages]);

  const handleFilterChange = (next: Partial<DispatchLogFilters>) => {
    startTransition(() => {
      setFilters((prev) => ({ ...prev, ...next }));
      setActiveStat(null);
      setCurrentPage(1);
    });
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_DISPATCH_LOG_FILTERS);
    setActiveStat(null);
    setCurrentPage(1);
  };

  const handleStatClick = (statId: DispatchLogStatKey) => {
    setActiveStat((current) => (current === statId ? null : statId));
    setCurrentPage(1);
  };

  const openDrawer = useCallback((item: DispatchLog) => {
    setSelectedLog(item);
    setDrawerOpen(true);
  }, []);

  const handleDrawerOpenChange = useCallback((open: boolean) => {
    setDrawerOpen(open);
    if (!open) setSelectedLog(null);
  }, []);

  const handleStatusSave = useCallback(
    (payload: Parameters<typeof updateStatus>[1]) => {
      if (!selectedLive) return;
      updateStatus(selectedLive.id, payload);
      notify.success("Status updated", `${selectedLive.dispatchId} saved.`);
    },
    [selectedLive, updateStatus],
  );

  const handleSaveNotes = useCallback(
    (notes: string) => {
      if (!selectedLive) return;
      updateDeliveryNotes(selectedLive.id, notes);
      notify.success("Notes saved", selectedLive.dispatchId);
    },
    [selectedLive, updateDeliveryNotes],
  );

  const handleViewOrder = useCallback(() => {
    if (!selectedLive) return;
    router.push(
      `${ROUTES.CUSTOMER_EXECUTIVE_ORDERS}?order=${encodeURIComponent(selectedLive.orderId)}`,
    );
  }, [selectedLive, router]);

  const handlePrint = useCallback(
    (item?: DispatchLog) => {
      const target = item ?? selectedLive;
      if (!target) return;
      printDispatchLogSlip(target);
      notify.success("Dispatch slip opened", target.dispatchId);
    },
    [selectedLive],
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => setIsRefreshing(false), 700);
  };

  const openStatusModal = (item?: DispatchLog) => {
    if (item) setSelectedLog(item);
    setStatusModalOpen(true);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dispatch Logs"
        subtitle="Manual dispatch tracking and status history for hub-to-customer deliveries."
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
          <DispatchLogStatsCard
            key={stat.id}
            stat={stat}
            isLoading={isLoading}
            index={index}
            isActive={activeStat === stat.id}
            onClick={() => handleStatClick(stat.id)}
          />
        ))}
      </div>

      <DispatchLogFiltersBar
        filters={filters}
        hubs={[...DISPATCH_LOG_HUB_OPTIONS]}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      <DispatchLogTable
        items={queryResult.data}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        currentPage={queryResult.meta.page}
        totalItems={queryResult.meta.total}
        pageSize={DISPATCH_LOG_PAGE_SIZE}
        onPageChange={setCurrentPage}
        onRefresh={handleRefresh}
        onRowSelect={openDrawer}
        onUpdateStatus={openStatusModal}
        onPrint={handlePrint}
      />

      <DispatchLogDetailDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        log={selectedLive}
        onUpdateStatus={() => setStatusModalOpen(true)}
        onViewOrder={handleViewOrder}
        onPrint={() => handlePrint()}
        onSaveNotes={handleSaveNotes}
      />

      {selectedLive ? (
        <DispatchLogUpdateStatusModal
          open={statusModalOpen}
          onOpenChange={setStatusModalOpen}
          currentStatus={selectedLive.status}
          dispatchLabel={selectedLive.dispatchId}
          updatedBy={adminName}
          onSave={handleStatusSave}
        />
      ) : null}
    </div>
  );
}
