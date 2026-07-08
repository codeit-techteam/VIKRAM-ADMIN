"use client";

import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
import { useAllocationRegistryStore } from "@/store/allocation-registry-store";
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

export function TransferPage() {
  const router = useRouter();
  const transfers = useTransferListStore((state) => state.transfers);
  const deleteTransfer = useTransferListStore((state) => state.deleteTransfer);
  const assignVehicle = useTransferListStore((state) => state.assignVehicle);
  const assignDriver = useTransferListStore((state) => state.assignDriver);
  const markReadyForDispatch = useTransferListStore(
    (state) => state.markReadyForDispatch,
  );
  const startDispatch = useTransferListStore((state) => state.startDispatch);
  const markDelivered = useTransferListStore((state) => state.markDelivered);
  const receiveAtHub = useTransferListStore((state) => state.receiveAtHub);
  const getAllocationById = useAllocationRegistryStore(
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

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 600);
    return () => window.clearTimeout(timer);
  }, []);

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
        label: "Delivered Today",
        value: String(queryResult.stats.deliveredToday).padStart(2, "0"),
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

  const handleView = useCallback((item: TransferListItem) => {
    setSelectedTransfer(item);
    setDrawerOpen(true);
  }, []);

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
          case "ready-for-dispatch":
            markReadyForDispatch(item.transferId);
            notify.success(
              "Ready for dispatch",
              `${item.transferId} is now pending dispatch.`,
            );
            break;
          case "start-dispatch":
            startDispatch(item.transferId);
            notify.success(
              "Dispatch started",
              `${item.transferId} is now in transit. Gate pass issued.`,
            );
            break;
          case "track":
            handleView(item);
            notify.info(
              "Tracking",
              `Live tracking for ${item.transferId} — map view coming soon.`,
            );
            break;
          case "mark-delivered":
            markDelivered(item.transferId);
            notify.success(
              "Marked delivered",
              `${item.transferId} delivered at ${item.destinationHub}.`,
            );
            break;
          case "receive-at-hub":
            receiveAtHub(item.transferId);
            notify.success(
              "Hub receipt confirmed",
              `Inventory updated at ${item.destinationHub}. Transfer completed.`,
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
      markDelivered,
      markReadyForDispatch,
      receiveAtHub,
      startDispatch,
    ],
  );

  const handleAssignVehicle = useCallback(
    (vehicle: FleetVehicle) => {
      if (!selectedTransfer) return;
      assignVehicle(selectedTransfer.transferId, vehicle);
      notify.success("Vehicle assigned", vehicle.vehicleNumber);
    },
    [assignVehicle, selectedTransfer],
  );

  const handleAssignDriver = useCallback(
    (driver: FleetDriver) => {
      if (!selectedTransfer) return;
      assignDriver(selectedTransfer.transferId, driver);
      notify.success("Driver assigned", driver.name);
    },
    [assignDriver, selectedTransfer],
  );

  const liveTransfer = useMemo(() => {
    if (!selectedTransfer) return null;
    return (
      transfers.find((t) => t.transferId === selectedTransfer.transferId) ??
      selectedTransfer
    );
  }, [selectedTransfer, transfers]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <TransferStatsCard key={stat.id} stat={stat} isLoading={isLoading} />
        ))}
      </div>

      <TransferTable
        items={queryResult.data}
        isLoading={isLoading}
        currentPage={queryResult.meta.page}
        totalItems={queryResult.meta.total}
        pageSize={TRANSFER_PAGE_SIZE}
        filters={filters}
        onFiltersChange={setFilters}
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
        BuildQuick India | Enterprise Resource Planning v4.2.0 | © 2023
      </p>
    </div>
  );
}
