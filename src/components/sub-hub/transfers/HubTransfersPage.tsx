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

import { HubTransferAssignDriverModal } from "@/components/sub-hub/transfers/HubTransferAssignDriverModal";
import { HubTransferAssignVehicleModal } from "@/components/sub-hub/transfers/HubTransferAssignVehicleModal";
import { HubTransferDetailDrawer } from "@/components/sub-hub/transfers/HubTransferDetailDrawer";
import { HubTransferFiltersBar } from "@/components/sub-hub/transfers/HubTransferFilters";
import {
  buildHubTransferStatCards,
  HubTransferStatsCard,
  type HubTransferStatKey,
} from "@/components/sub-hub/transfers/HubTransferStatsCard";
import { HubTransferTable } from "@/components/sub-hub/transfers/HubTransferTable";
import { HubTransferUpdateStatusModal } from "@/components/sub-hub/transfers/HubTransferUpdateStatusModal";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/use-auth";
import {
  EMPTY_HUB_TRANSFER_FILTERS,
  fetchHubTransfers,
  filterHubTransfers,
  formatHubTransferDateTime,
  getAvailableDriversForHub,
  getAvailableVehiclesForHub,
  HUB_TRANSFER_HUB_OPTIONS,
  HUB_TRANSFER_PAGE_SIZE,
  HUB_TRANSFER_STATUS_LABELS,
} from "@/mock/hub-transfers";
import { useHubTransferStore } from "@/store/hub-transfer-store";
import type {
  HubTransfer,
  HubTransferFilters,
  HubTransferStatus,
} from "@/types/hub-transfer.types";
import {
  printHubTransferDispatchSlip,
  printHubTransferInvoice,
} from "@/utils/hub-transfer-print";
import { notify } from "@/utils/notify";

const MVP_STATUSES = new Set<HubTransferStatus>([
  "PENDING_DISPATCH",
  "ASSIGNED",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
]);

function parseStatusParam(
  value: string | null,
): HubTransferFilters["status"] | undefined {
  if (!value) return undefined;
  const upper = value.toUpperCase();
  const lower = value.toLowerCase();

  if (lower === "delayed") return "delayed";

  // Legacy granular statuses → MVP
  if (
    upper === "VEHICLE_ASSIGNED" ||
    upper === "DRIVER_ASSIGNED" ||
    upper === "PACKED" ||
    upper === "LOADED"
  ) {
    return "ASSIGNED";
  }
  if (upper === "REACHED_CUSTOMER_AREA") return "DISPATCHED";
  if (upper === "COMPLETED") return "DELIVERED";

  if (MVP_STATUSES.has(upper as HubTransferStatus)) {
    return upper as HubTransferStatus;
  }

  return undefined;
}

const STAT_FILTER_MAP: Partial<
  Record<HubTransferStatKey, Partial<HubTransferFilters>>
> = {
  "pending-vehicle": { status: "PENDING_DISPATCH" },
  "in-transit": { status: "DISPATCHED" },
  "delivered-today": { status: "DELIVERED" },
  delayed: { status: "delayed" },
};

function downloadCsv(items: HubTransfer[]) {
  const header = [
    "Transfer ID",
    "Order ID",
    "Customer",
    "Mobile",
    "Address",
    "Hub",
    "Driver",
    "Vehicle",
    "Dispatch Time",
    "Expected Delivery",
    "Status",
    "Priority",
  ];

  const lines = items.map((item) =>
    [
      item.transferId,
      item.orderId,
      item.customerName,
      item.customerMobile,
      item.deliveryAddress,
      item.hubName,
      item.driverName ?? "",
      item.vehicleNumber ?? "",
      item.dispatchTime ? formatHubTransferDateTime(item.dispatchTime) : "",
      formatHubTransferDateTime(item.expectedDelivery),
      item.isDelayed &&
      item.status !== "DELIVERED" &&
      item.status !== "CANCELLED"
        ? "Delayed"
        : HUB_TRANSFER_STATUS_LABELS[item.status],
      item.priority,
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
  anchor.download = `hub-transfers-${Date.now()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function HubTransfersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const transfers = useHubTransferStore((state) => state.transfers);
  const vehicles = useHubTransferStore((state) => state.vehicles);
  const drivers = useHubTransferStore((state) => state.drivers);
  const assignVehicle = useHubTransferStore((state) => state.assignVehicle);
  const assignDriver = useHubTransferStore((state) => state.assignDriver);
  const updateStatus = useHubTransferStore((state) => state.updateStatus);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<HubTransferFilters>(
    EMPTY_HUB_TRANSFER_FILTERS,
  );
  const [activeStat, setActiveStat] = useState<HubTransferStatKey | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransfer, setSelectedTransfer] = useState<HubTransfer | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [driverModalOpen, setDriverModalOpen] = useState(false);
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
    const parsedStatus = parseStatusParam(statusParam);

    setFilters((current) => ({
      ...current,
      ...(hubParam ? { hubId: hubParam } : {}),
      ...(parsedStatus ? { status: parsedStatus } : {}),
      ...(orderParam ? { orderId: orderParam } : {}),
    }));
    if (parsedStatus === "delayed") {
      setActiveStat("delayed");
    }
    setCurrentPage(1);
  }, [searchParams]);

  const queryFilters = useMemo(() => {
    const statFilters = activeStat ? STAT_FILTER_MAP[activeStat] : undefined;
    return { ...filters, ...statFilters };
  }, [filters, activeStat]);

  const queryResult = useMemo(() => {
    const filtered = filterHubTransfers(transfers, {
      filters: queryFilters,
    });

    const paginated = fetchHubTransfers(filtered, {
      page: currentPage,
      limit: HUB_TRANSFER_PAGE_SIZE,
    });

    return {
      ...paginated,
      stats: fetchHubTransfers(transfers).stats,
    };
  }, [transfers, queryFilters, currentPage]);

  const allFilteredForExport = useMemo(() => {
    return filterHubTransfers(transfers, { filters: queryFilters });
  }, [transfers, queryFilters]);

  const statCards = useMemo(
    () => buildHubTransferStatCards(queryResult.stats),
    [queryResult.stats],
  );

  const selectedLive = useMemo(() => {
    if (!selectedTransfer) return null;
    return (
      transfers.find((item) => item.id === selectedTransfer.id) ??
      selectedTransfer
    );
  }, [transfers, selectedTransfer]);

  const availableVehicles = useMemo(() => {
    if (!selectedLive) return [];
    return getAvailableVehiclesForHub(vehicles, selectedLive.hubName);
  }, [vehicles, selectedLive]);

  const availableDrivers = useMemo(() => {
    if (!selectedLive) return [];
    return getAvailableDriversForHub(drivers, selectedLive.hubName);
  }, [drivers, selectedLive]);

  useEffect(() => {
    if (
      queryResult.meta.total > 0 &&
      currentPage > queryResult.meta.totalPages
    ) {
      setCurrentPage(queryResult.meta.totalPages);
    }
  }, [currentPage, queryResult.meta.total, queryResult.meta.totalPages]);

  const handleFilterChange = (next: Partial<HubTransferFilters>) => {
    startTransition(() => {
      setFilters((prev) => ({ ...prev, ...next }));
      setActiveStat(next.status === "delayed" ? "delayed" : null);
      setCurrentPage(1);
    });
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_HUB_TRANSFER_FILTERS);
    setActiveStat(null);
    setCurrentPage(1);
  };

  const handleStatClick = (statId: HubTransferStatKey) => {
    setActiveStat((current) => {
      const next = current === statId ? null : statId;
      const mapped = next ? STAT_FILTER_MAP[next] : undefined;
      if (mapped?.status) {
        setFilters((prev) => ({ ...prev, status: mapped.status! }));
      } else if (current === statId) {
        setFilters((prev) => ({ ...prev, status: "all" }));
      }
      return next;
    });
    setCurrentPage(1);
  };

  const openDrawer = useCallback((item: HubTransfer) => {
    setSelectedTransfer(item);
    setDrawerOpen(true);
  }, []);

  const handleDrawerOpenChange = useCallback((open: boolean) => {
    setDrawerOpen(open);
    if (!open) setSelectedTransfer(null);
  }, []);

  const handleAssignVehicle = useCallback(
    (vehicleId: string) => {
      if (!selectedLive) return;
      assignVehicle(selectedLive.id, vehicleId, adminName);
      setVehicleModalOpen(false);
      notify.success(
        "Vehicle assigned",
        `${selectedLive.transferId} updated successfully.`,
      );
    },
    [selectedLive, assignVehicle, adminName],
  );

  const handleAssignDriver = useCallback(
    (driverId: string) => {
      if (!selectedLive) return;
      assignDriver(selectedLive.id, driverId, adminName);
      setDriverModalOpen(false);
      notify.success(
        "Driver assigned",
        `${selectedLive.transferId} updated successfully.`,
      );
    },
    [selectedLive, assignDriver, adminName],
  );

  const handleStatusSave = useCallback(
    (payload: Parameters<typeof updateStatus>[1]) => {
      if (!selectedLive) return;
      updateStatus(selectedLive.id, payload);
      notify.success("Status updated", `${selectedLive.transferId} saved.`);
    },
    [selectedLive, updateStatus],
  );

  const handleCallDriver = useCallback(
    (item?: HubTransfer) => {
      const target = item ?? selectedLive;
      if (!target?.driverMobile) {
        notify.error("No driver assigned", "Assign a driver before calling.");
        return;
      }
      window.open(`tel:${target.driverMobile.replace(/\s/g, "")}`, "_self");
      notify.info("Calling driver", target.driverMobile);
    },
    [selectedLive],
  );

  const handleViewCustomer = useCallback(() => {
    if (!selectedLive) return;
    router.push(
      `${ROUTES.USER_MANAGEMENT_CUSTOMERS}?search=${encodeURIComponent(selectedLive.customerName)}`,
    );
  }, [selectedLive, router]);

  const handleViewOrder = useCallback(() => {
    if (!selectedLive) return;
    router.push(
      `${ROUTES.CUSTOMER_EXECUTIVE_ORDERS}?order=${encodeURIComponent(selectedLive.orderId)}`,
    );
  }, [selectedLive, router]);

  const handlePrint = useCallback(
    (item?: HubTransfer) => {
      const target = item ?? selectedLive;
      if (!target) return;
      printHubTransferDispatchSlip(target);
      notify.success("Dispatch slip opened", target.transferId);
    },
    [selectedLive],
  );

  const handleGenerateInvoice = useCallback(() => {
    if (!selectedLive) return;
    printHubTransferInvoice(selectedLive);
    notify.success("Invoice generated", selectedLive.orderId);
  }, [selectedLive]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => setIsRefreshing(false), 700);
  };

  const openVehicleModal = (item?: HubTransfer) => {
    if (item) setSelectedTransfer(item);
    setVehicleModalOpen(true);
  };

  const openDriverModal = (item?: HubTransfer) => {
    if (item) setSelectedTransfer(item);
    setDriverModalOpen(true);
  };

  const openStatusModal = (item?: HubTransfer) => {
    if (item) setSelectedTransfer(item);
    setStatusModalOpen(true);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Hub Transfers"
        subtitle="Operational dispatch tracking for customer deliveries fulfilled from sub-hubs."
        breadcrumbs={getNavBreadcrumbsFromPath("/sub-hub-network/transfers")}
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

      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((stat, index) => (
          <HubTransferStatsCard
            key={stat.id}
            stat={stat}
            isLoading={isLoading}
            index={index}
            isActive={activeStat === stat.id}
            onClick={() => handleStatClick(stat.id)}
          />
        ))}
      </div>

      <HubTransferFiltersBar
        filters={filters}
        hubs={HUB_TRANSFER_HUB_OPTIONS}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      <HubTransferTable
        items={queryResult.data}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        currentPage={queryResult.meta.page}
        totalItems={queryResult.meta.total}
        pageSize={HUB_TRANSFER_PAGE_SIZE}
        onPageChange={setCurrentPage}
        onRefresh={handleRefresh}
        onRowSelect={openDrawer}
        onAssignVehicle={openVehicleModal}
        onAssignDriver={openDriverModal}
        onUpdateStatus={openStatusModal}
        onPrint={handlePrint}
        onCallDriver={handleCallDriver}
      />

      <HubTransferDetailDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        transfer={selectedLive}
        onAssignVehicle={() => setVehicleModalOpen(true)}
        onAssignDriver={() => setDriverModalOpen(true)}
        onUpdateStatus={() => setStatusModalOpen(true)}
        onCallDriver={() => handleCallDriver()}
        onViewCustomer={handleViewCustomer}
        onViewOrder={handleViewOrder}
        onPrint={() => handlePrint()}
        onGenerateInvoice={handleGenerateInvoice}
      />

      <HubTransferAssignVehicleModal
        open={vehicleModalOpen}
        onOpenChange={setVehicleModalOpen}
        transferLabel={selectedLive?.transferId ?? ""}
        hubName={selectedLive?.hubName ?? ""}
        vehicles={availableVehicles}
        onAssign={handleAssignVehicle}
      />

      <HubTransferAssignDriverModal
        open={driverModalOpen}
        onOpenChange={setDriverModalOpen}
        transferLabel={selectedLive?.transferId ?? ""}
        hubName={selectedLive?.hubName ?? ""}
        drivers={availableDrivers}
        onAssign={handleAssignDriver}
      />

      {selectedLive ? (
        <HubTransferUpdateStatusModal
          open={statusModalOpen}
          onOpenChange={setStatusModalOpen}
          currentStatus={selectedLive.status}
          transferLabel={selectedLive.transferId}
          updatedBy={adminName}
          onSave={handleStatusSave}
        />
      ) : null}
    </div>
  );
}
