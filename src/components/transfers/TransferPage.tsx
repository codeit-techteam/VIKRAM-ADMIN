"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  CreateTransferDialog,
  useCreateTransfer,
} from "@/components/transfers/CreateTransferDialog";
import { TransferAssignDialog } from "@/components/transfers/TransferAssignDialog";
import { TransferDetailDrawer } from "@/components/transfers/TransferDetailDrawer";
import {
  TransferStatsCard,
  type TransferStatCardData,
} from "@/components/transfers/TransferStatsCard";
import { TransferTable } from "@/components/transfers/TransferTable";
import { ROUTES } from "@/constants/routes";
import {
  EMPTY_TRANSFER_FILTERS,
  fetchTransfers,
  TRANSFER_PAGE_SIZE,
} from "@/mock/transfers";
import { useWarehouseErpStore } from "@/store/warehouse-erp-store";
import { useTransferListStore } from "@/store/transfer-list-store";
import type {
  FleetDriver,
  FleetVehicle,
  TransferFilters,
  TransferListItem,
} from "@/types/warehouse.types";
import { setActiveAllocationForTransfer } from "@/utils/allocation-transfer-bridge";
import type { TransferRowAction } from "@/utils/transfer-actions";
import { notify } from "@/utils/notify";
import { warehouseService } from "@/services/warehouse";
import { adminRequisitionsService } from "@/services/adminRequisitions";

const STAT_STATUS_MAP = {
  "pending-dispatch": "READY_FOR_DISPATCH",
  "in-transit": "IN_TRANSIT",
  "delivered-today": "REACHED_HUB",
  "delayed-transfers": "delayed",
} as const satisfies Record<
  TransferStatCardData["id"],
  TransferFilters["status"]
>;

export function TransferPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [transfers, setTransfers] = useState<TransferListItem[]>([]);
  const deleteTransfer = useTransferListStore((state) => state.deleteTransfer);
  const getAllocationById = useWarehouseErpStore(
    (state) => state.getAllocationById,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] =
    useState<TransferListItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignMode, setAssignMode] = useState<"vehicle" | "driver">("vehicle");
  const [filters, setFilters] = useState<TransferFilters>(
    EMPTY_TRANSFER_FILTERS,
  );
  const startCreateTransfer = useCreateTransfer();

  const reloadTransfers = useCallback(async () => {
    try {
      const result = await warehouseService.listTransfers({
        page: 1,
        limit: 1000,
      });
      setTransfers(result.data);
    } catch {
      notify.error("Transfers unavailable", "Unable to load transfers.");
    }
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const result = await warehouseService.listTransfers({
          page: 1,
          limit: 1000,
        });
        if (active) setTransfers(result.data);
      } catch {
        if (active) {
          notify.error("Transfers unavailable", "Unable to load transfers.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    const interval = window.setInterval(() => void load(), 30000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const statusParam = searchParams.get("status");
    const hubParam = searchParams.get("hub");

    if (statusParam || hubParam) {
      setFilters((current) => ({
        ...current,
        ...(statusParam
          ? {
              status: statusParam as TransferFilters["status"],
            }
          : {}),
        ...(hubParam ? { destinationHubId: hubParam } : {}),
      }));
      setCurrentPage(1);
    }
  }, [searchParams]);

  const queryResult = useMemo(
    () =>
      fetchTransfers(transfers, {
        page: currentPage,
        limit: TRANSFER_PAGE_SIZE,
        filters,
      }),
    [transfers, currentPage, filters],
  );

  useEffect(() => {
    if (
      queryResult.meta.total > 0 &&
      currentPage > queryResult.meta.totalPages
    ) {
      setCurrentPage(queryResult.meta.totalPages);
    }
  }, [currentPage, queryResult.meta.total, queryResult.meta.totalPages]);

  const statCards = useMemo<TransferStatCardData[]>(
    () => [
      {
        id: "pending-dispatch",
        label: "Pending Dispatch",
        value: String(queryResult.stats.pendingDispatch).padStart(2, "0"),
        variant: "warning",
      },
      {
        id: "in-transit",
        label: "In Transit",
        value: String(queryResult.stats.inTransit),
        variant: "default",
      },
      {
        id: "delivered-today",
        label: "Reached Hub",
        value: String(queryResult.stats.reachedHub).padStart(2, "0"),
        variant: "default",
      },
      {
        id: "delayed-transfers",
        label: "Delayed Transfers",
        value: String(queryResult.stats.delayedTransfers).padStart(2, "0"),
        variant: "critical",
      },
    ],
    [queryResult.stats],
  );

  const handleView = useCallback(
    (item: TransferListItem) => {
      router.push(`${ROUTES.CENTRAL_WAREHOUSE}/transfers/${item.transferId}`);
    },
    [router],
  );

  const handleCreateTransfer = useCallback(() => {
    startCreateTransfer({
      onMultiple: () => setCreateDialogOpen(true),
    });
  }, [startCreateTransfer]);

  const handleContinueTransfer = useCallback(
    (item: TransferListItem) => {
      if (!item.allocationId) {
        notify.error("Cannot continue", "Allocation reference is missing.");
        return;
      }
      const allocation = getAllocationById(item.allocationId);
      if (!allocation) {
        notify.error(
          "Cannot continue",
          "Original allocation not found in registry.",
        );
        return;
      }
      setActiveAllocationForTransfer(allocation);
      router.push(
        `${ROUTES.CENTRAL_WAREHOUSE}/transfers/new?allocationId=${item.allocationId}`,
      );
    },
    [getAllocationById, router],
  );

  const handleAction = useCallback(
    (action: TransferRowAction, item: TransferListItem) => {
      try {
        switch (action) {
          case "continue":
            handleContinueTransfer(item);
            break;
          case "delete":
            deleteTransfer(item.transferId);
            notify.success("Draft deleted", `${item.transferId} removed.`);
            break;
          case "assign-vehicle":
            setSelectedTransfer(item);
            setAssignMode("vehicle");
            setAssignDialogOpen(true);
            break;
          case "assign-driver":
            setSelectedTransfer(item);
            setAssignMode("driver");
            setAssignDialogOpen(true);
            break;
          case "start-loading":
            notify.success(
              "Loading started",
              `${item.transferId} is now loading.`,
            );
            router.push(
              `${ROUTES.CENTRAL_WAREHOUSE}/dispatch/${item.id}/loading`,
            );
            break;
          case "complete-loading":
            router.push(
              `${ROUTES.CENTRAL_WAREHOUSE}/dispatch/${item.id}/loading`,
            );
            break;
          case "dispatch-now":
            router.push(
              `${ROUTES.CENTRAL_WAREHOUSE}/dispatch/${item.id}/confirm`,
            );
            break;
          case "start-dispatch":
            void (async () => {
              try {
                await adminRequisitionsService.dispatch(
                  item.requisitionId || item.id,
                  {
                    vehicleId: item.vehicleId,
                    driverId: item.driverId,
                    vehicleNumber: item.vehicleNumber,
                    driverName: item.assignedDriver?.name,
                    eta: item.eta,
                    estimatedArrival: item.expectedArrival ?? item.eta,
                    dispatchDate: item.dispatchDate,
                  },
                );
                notify.success(
                  "Dispatch confirmed",
                  `${item.transferId} is now in transit.`,
                );
                await reloadTransfers();
                router.push(
                  `${ROUTES.CENTRAL_WAREHOUSE}/dispatch/${item.id}/success`,
                );
              } catch (error) {
                notify.error(
                  "Dispatch failed",
                  error instanceof Error
                    ? error.message
                    : "Unable to confirm dispatch.",
                );
              }
            })();
            break;
          case "track":
            handleView(item);
            break;
          case "update-eta":
          case "add-remarks":
          case "report-delay":
            handleView(item);
            break;
          case "mark-reached-hub":
          case "mark-delivered":
            notify.success(
              "Awaiting hub receipt",
              `${item.transferId} must be received in the Hub Panel.`,
            );
            break;
          case "receive-at-hub":
            notify.error(
              "Receive in Hub Panel",
              "Central Warehouse cannot confirm hub receiving. Open Hub Panel → Transfers / Material Receiving.",
            );
            break;
          case "view-details":
            handleView(item);
            break;
        }
      } catch (error) {
        notify.error(
          "Action failed",
          error instanceof Error ? error.message : "Unable to complete action.",
        );
      }
    },
    [
      deleteTransfer,
      handleContinueTransfer,
      handleView,
      reloadTransfers,
      router,
    ],
  );

  const handleAssignVehicle = useCallback(
    async (vehicle: FleetVehicle) => {
      if (!selectedTransfer) return;
      try {
        await adminRequisitionsService.assignLogistics(
          selectedTransfer.requisitionId || selectedTransfer.id,
          { vehicleId: vehicle.id },
        );
        notify.success("Vehicle assigned", vehicle.vehicleNumber);
        await reloadTransfers();
      } catch (error) {
        notify.error(
          "Assignment failed",
          error instanceof Error
            ? error.message
            : "Unable to assign vehicle.",
        );
      }
    },
    [reloadTransfers, selectedTransfer],
  );

  const handleAssignDriver = useCallback(
    async (driver: FleetDriver) => {
      if (!selectedTransfer) return;
      try {
        await adminRequisitionsService.assignLogistics(
          selectedTransfer.requisitionId || selectedTransfer.id,
          { driverId: driver.id },
        );
        notify.success("Driver assigned", driver.name);
        await reloadTransfers();
      } catch (error) {
        notify.error(
          "Assignment failed",
          error instanceof Error ? error.message : "Unable to assign driver.",
        );
      }
    },
    [reloadTransfers, selectedTransfer],
  );

  const liveTransfer = useMemo(() => {
    if (!selectedTransfer) return null;
    return (
      transfers.find((t) => t.transferId === selectedTransfer.transferId) ??
      selectedTransfer
    );
  }, [selectedTransfer, transfers]);

  const handleStatCardClick = useCallback(
    (statId: TransferStatCardData["id"]) => {
      const nextStatus = STAT_STATUS_MAP[statId];
      setFilters((current) => ({
        ...current,
        status: current.status === nextStatus ? "all" : nextStatus,
      }));
      setCurrentPage(1);
    },
    [],
  );

  const handleFiltersChange = useCallback((next: TransferFilters) => {
    setFilters(next);
    setCurrentPage(1);
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <TransferStatsCard
            key={stat.id}
            stat={stat}
            isLoading={isLoading}
            isActive={filters.status === STAT_STATUS_MAP[stat.id]}
            onClick={() => handleStatCardClick(stat.id)}
          />
        ))}
      </div>

      <TransferTable
        items={queryResult.data}
        isLoading={isLoading}
        currentPage={queryResult.meta.page}
        totalItems={queryResult.meta.total}
        pageSize={TRANSFER_PAGE_SIZE}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onPageChange={setCurrentPage}
        onView={handleView}
        onAction={handleAction}
        onCreateTransfer={handleCreateTransfer}
      />

      <CreateTransferDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <TransferDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        transfer={liveTransfer}
      />

      <TransferAssignDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        mode={assignMode}
        transferId={selectedTransfer?.transferId ?? ""}
        estimatedWeightKg={selectedTransfer?.estimatedWeightKg}
        onAssignVehicle={handleAssignVehicle}
        onAssignDriver={handleAssignDriver}
      />

      <p className="pt-2 text-center text-xs text-gray-400">
        Bajriwala | Enterprise Resource Planning v4.2.0 | © 2023
      </p>
    </div>
  );
}
