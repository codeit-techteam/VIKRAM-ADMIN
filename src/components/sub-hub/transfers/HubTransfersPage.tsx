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
import { HubTransferDetailDrawer } from "@/components/sub-hub/transfers/HubTransferDetailDrawer";
import { HubTransferFiltersBar } from "@/components/sub-hub/transfers/HubTransferFilters";
import {
  buildHubTransferStatCards,
  HubTransferStatsCard,
  type HubTransferStatKey,
} from "@/components/sub-hub/transfers/HubTransferStatsCard";
import { HubTransferTable } from "@/components/sub-hub/transfers/HubTransferTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { getNavBreadcrumbsFromPath } from "@/constants/navigation.constants";
import {
  EMPTY_HUB_TRANSFER_FILTERS,
  formatHubTransferDateTime,
  HUB_TRANSFER_PAGE_SIZE,
  HUB_TRANSFER_STATUS_LABELS,
} from "@/constants/sub-hub-ops.constants";
import { hubsService } from "@/services/hubs.service";
import { warehouseService } from "@/services/warehouse";
import { useSelectedHubStore } from "@/store/selected-hub-store";
import type {
  HubTransfer,
  HubTransferFilters,
  HubTransferStatus,
} from "@/types/hub-transfer.types";
import type { TransferListItem } from "@/types/warehouse.types";

function mapTransferStatus(status: string): HubTransferStatus {
  const upper = status.toUpperCase();
  if (
    upper === "ALLOCATED" ||
    upper === "PENDING_DISPATCH" ||
    upper === "READY_TO_DISPATCH" ||
    upper === "TRANSFER_CREATED"
  ) {
    return "PENDING_DISPATCH";
  }
  if (upper === "DISPATCHED" || upper === "IN_TRANSIT") return "DISPATCHED";
  if (
    upper === "REACHED_HUB" ||
    upper === "RECEIVED" ||
    upper === "DELIVERED" ||
    upper === "COMPLETED"
  ) {
    return "DELIVERED";
  }
  if (upper === "CANCELLED") return "CANCELLED";
  return "ASSIGNED";
}

function mapWarehouseTransfer(
  item: TransferListItem,
  hubManager = "Hub Manager",
): HubTransfer {
  const status = mapTransferStatus(item.status);
  const isDelayed = Boolean(
    item.isDelayed ||
      (item.eta &&
        status === "DISPATCHED" &&
        new Date(item.eta).getTime() < Date.now()),
  );

  return {
    id: item.id,
    transferId: item.transferId,
    orderId: item.requisitionId || item.allocationId || item.id,
    customerId: item.sourceWarehouseId,
    customerName: item.material || item.materials?.[0] || "Material",
    customerMobile: item.sku || "—",
    deliveryAddress: item.sourceWarehouse || "Central Warehouse",
    pincode: "",
    orderValue: 0,
    orderDate: item.createdAt,
    hubId: item.destinationHubId,
    hubName: item.destinationHub,
    hubManager,
    dispatchCounter: item.quantity
      ? `${item.quantity} ${item.quantityUnit || "units"}`
      : "—",
    reservedInventoryLabel: item.quantity
      ? `${item.quantity} ${item.quantityUnit || "units"}`
      : "—",
    vehicleId: item.vehicleId ?? null,
    vehicleNumber: item.vehicleNumber ?? null,
    vehicleType: null,
    vehicleCapacityKg: null,
    driverId: item.driverId ?? null,
    driverName: item.assignedDriver?.name ?? null,
    driverMobile: null,
    licenseStatus: null,
    dispatchTime: item.dispatchDate ?? item.dispatchAt ?? null,
    expectedDelivery: item.eta || item.expectedArrival || item.createdAt,
    estimatedArrival: item.eta || item.expectedArrival || null,
    status,
    priority: "medium",
    isDelayed,
    products: [
      {
        productId: item.sku || item.id,
        name: item.material || "Material",
        sku: item.sku || "—",
        quantity: item.quantity ?? 0,
        reservedQuantity: item.quantity ?? 0,
        weightKg: 0,
        unitPrice: 0,
        amount: 0,
      },
    ],
    totalWeightKg: 0,
    totalAmount: 0,
    timeline: (item.timeline ?? []).map((event, index) => ({
      id: event.id || `evt-${index}`,
      key: "DISPATCHED" as const,
      title: event.label || event.type,
      updatedBy: "System",
      timestamp: event.timestamp,
      remarks: event.description,
      completed: true,
    })),
    createdAt: item.createdAt,
  };
}

function downloadCsv(items: HubTransfer[]) {
  const header = [
    "Transfer ID",
    "Requisition ID",
    "Source Warehouse",
    "Destination Hub",
    "Material",
    "SKU",
    "Quantity",
    "Vehicle",
    "Driver",
    "Dispatch Date",
    "ETA",
    "Status",
  ];

  const lines = items.map((item) =>
    [
      item.transferId,
      item.orderId,
      item.deliveryAddress,
      item.hubName,
      item.customerName,
      item.customerMobile,
      item.dispatchCounter,
      item.vehicleNumber ?? "",
      item.driverName ?? "",
      item.dispatchTime ? formatHubTransferDateTime(item.dispatchTime) : "",
      formatHubTransferDateTime(item.expectedDelivery),
      item.isDelayed && item.status !== "DELIVERED"
        ? "Delayed"
        : HUB_TRANSFER_STATUS_LABELS[item.status],
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
  const searchParams = useSearchParams();
  const selectedHubId = useSelectedHubStore((s) => s.selectedHubId);
  const selectedHubName = useSelectedHubStore((s) => s.selectedHubName);
  const setSelectedHub = useSelectedHubStore((s) => s.setSelectedHub);

  const [filters, setFilters] = useState<HubTransferFilters>(
    EMPTY_HUB_TRANSFER_FILTERS,
  );
  const [activeStat, setActiveStat] = useState<HubTransferStatKey | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransfer, setSelectedTransfer] = useState<HubTransfer | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [, startTransition] = useTransition();

  const hubsQuery = useQuery({
    queryKey: ["admin-hubs", "transfers-page"],
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

  const transfersQuery = useQuery({
    queryKey: [
      "hub-transfers",
      scopedHubId ?? "all",
      filters.status,
      search,
      currentPage,
    ],
    queryFn: () =>
      warehouseService.listTransfers({
        page: currentPage,
        limit: HUB_TRANSFER_PAGE_SIZE,
        destinationHubId: scopedHubId,
        hubId: scopedHubId,
        search: search || undefined,
        status:
          filters.status === "all" || filters.status === "delayed"
            ? undefined
            : String(filters.status),
      }),
    refetchInterval: 15000,
  });

  const items = useMemo(
    () =>
      (transfersQuery.data?.data ?? []).map((row) =>
        mapWarehouseTransfer(row, selectedHubName || "Hub Manager"),
      ),
    [transfersQuery.data, selectedHubName],
  );

  const filteredItems = useMemo(() => {
    if (filters.status === "delayed" || activeStat === "delayed") {
      return items.filter((item) => item.isDelayed);
    }
    return items;
  }, [items, filters.status, activeStat]);

  const stats = transfersQuery.data?.stats ?? {};
  const statCards = buildHubTransferStatCards({
    todaysDispatches: Number(stats.dispatchedToday ?? 0),
    pendingVehicleAssignment: Number(stats.pendingDispatch ?? 0),
    inTransit: Number(stats.inTransit ?? 0),
    deliveredToday: Number(stats.deliveredToday ?? 0),
    delayedDeliveries: Number(stats.delayedTransfers ?? 0),
  });

  const hubLabel =
    scopedHubId == null
      ? "all hubs"
      : selectedHubName ||
        hubs.find((h) => h.id === scopedHubId)?.name ||
        "this hub";

  const handleFilterChange = useCallback(
    (next: Partial<HubTransferFilters>) => {
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
        title="Hub Transfers"
        subtitle={
          scopedHubId
            ? `Central Warehouse → ${hubLabel} stock transfers.`
            : "Central Warehouse → Hub stock transfers."
        }
        breadcrumbs={getNavBreadcrumbsFromPath("/sub-hub-network/transfers")}
        actions={
          <>
            <HubContextSelector className="mr-2" allowAll allLabel="All Hubs" />
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2 px-4"
              onClick={() => downloadCsv(filteredItems)}
              disabled={filteredItems.length === 0}
            >
              <Download className="size-4" />
              Export CSV
            </Button>
          </>
        }
      />

      {transfersQuery.isError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          Unable to load transfers
          {scopedHubId ? ` for ${hubLabel}` : ""}.{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => void transfersQuery.refetch()}
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((stat, index) => (
          <HubTransferStatsCard
            key={stat.id}
            stat={stat}
            index={index}
            isLoading={transfersQuery.isLoading}
            isActive={activeStat === stat.id}
            onClick={() => {
              setActiveStat((curr) => (curr === stat.id ? null : stat.id));
              if (stat.id === "delayed") {
                handleFilterChange({
                  status: activeStat === "delayed" ? "all" : "delayed",
                });
              }
            }}
          />
        ))}
      </div>

      <HubTransferFiltersBar
        filters={filters}
        hubs={hubs.map((h) => ({
          id: h.id,
          name: h.name,
        }))}
        onChange={handleFilterChange}
        onClear={() => {
          setFilters({ ...EMPTY_HUB_TRANSFER_FILTERS });
          setSelectedHub(null, null);
          setSearch("");
          setActiveStat(null);
          setCurrentPage(1);
        }}
      />

      <HubTransferTable
        items={filteredItems}
        isLoading={transfersQuery.isLoading}
        isRefreshing={transfersQuery.isFetching && !transfersQuery.isLoading}
        currentPage={currentPage}
        totalItems={transfersQuery.data?.meta.total ?? filteredItems.length}
        pageSize={HUB_TRANSFER_PAGE_SIZE}
        onPageChange={setCurrentPage}
        onRefresh={() => void transfersQuery.refetch()}
        onRowSelect={(item) => {
          setSelectedTransfer(item);
          setDrawerOpen(true);
        }}
      />

      {!transfersQuery.isLoading &&
      !transfersQuery.isError &&
      filteredItems.length === 0 ? (
        <p className="text-center text-sm text-[#64748B]">
          {scopedHubId
            ? `No transfers found for ${hubLabel}.`
            : "No transfers found."}
        </p>
      ) : null}

      <HubTransferDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        transfer={selectedTransfer}
      />
    </div>
  );
}
