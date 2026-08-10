"use client";

import { ArrowRight, MapPin, Package, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROUTES } from "@/constants/routes";
import { warehouseService } from "@/services/warehouse";
import type {
  AllocationWorkflowResult,
  TransferListItem,
} from "@/types/warehouse.types";
import { setActiveAllocationForTransfer } from "@/utils/allocation-transfer-bridge";
import { notify } from "@/utils/notify";

interface CreateTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function transferToAllocation(
  transfer: TransferListItem,
): AllocationWorkflowResult {
  const requestNo =
    transfer.requestNo ??
    transfer.requisitionId?.replace(/^TRN-/, "REQ-") ??
    transfer.transferId.replace(/^TRN-/, "REQ-");

  return {
    allocationId:
      transfer.allocationId?.startsWith("ALC-")
        ? transfer.allocationId
        : `ALC-${requestNo.replace(/^REQ-/, "")}`,
    requestId: requestNo.startsWith("REQ-")
      ? requestNo
      : `REQ-${requestNo.replace(/^TRN-/, "")}`,
    requisitionUuid: transfer.id,
    destinationHub: transfer.destinationHub,
    destinationHubId: transfer.destinationHubId,
    quantity: transfer.quantity ?? 0,
    unit: transfer.quantityUnit ?? "units",
    material: transfer.material ?? transfer.materials?.[0] ?? "Material",
    warehouseName: transfer.sourceWarehouse,
    warehouseHubId: transfer.sourceWarehouseId,
    batchLabel: "Central Stock",
    warehouseRemaining: 0,
    baseWeight: transfer.estimatedWeightKg,
    status: "COMPLETED",
    inventoryReserved: true,
  };
}

function AllocationOption({
  allocation,
  onSelect,
}: {
  allocation: AllocationWorkflowResult;
  onSelect: (allocation: AllocationWorkflowResult) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(allocation)}
      className="hover:border-primary/40 hover:bg-primary/5 flex w-full items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors"
    >
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-primary text-sm font-bold">
            {allocation.allocationId}
          </span>
          <span className="text-xs text-[#64748B]">{allocation.requestId}</span>
        </div>
        <p className="truncate text-sm font-semibold text-[#1A1A1A]">
          {allocation.material}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" />
            {allocation.destinationHub}
          </span>
          <span className="inline-flex items-center gap-1">
            <Package className="size-3.5" />
            {allocation.quantity.toLocaleString("en-IN")} {allocation.unit}
          </span>
        </div>
        <p className="text-xs text-[#64748B]">
          Source: {allocation.warehouseName}
        </p>
      </div>
      <ArrowRight className="text-primary mt-1 size-4 shrink-0" />
    </button>
  );
}

export function CreateTransferDialog({
  open,
  onOpenChange,
}: CreateTransferDialogProps) {
  const router = useRouter();
  const [readyAllocations, setReadyAllocations] = useState<
    AllocationWorkflowResult[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadReady = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await warehouseService.listTransfers({
        page: 1,
        limit: 100,
        status: "READY_FOR_DISPATCH",
      });
      // Ready for transfer wizard = allocated, vehicle/driver not fully assigned yet
      const ready = result.data
        .filter((row) => !row.vehicleId || !row.driverId)
        .map(transferToAllocation);
      setReadyAllocations(ready);
    } catch {
      setReadyAllocations([]);
      notify.error(
        "Unable to load allocations",
        "Could not fetch transfers ready for dispatch.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void loadReady();
  }, [open, loadReady]);

  const handleSelect = (allocation: AllocationWorkflowResult) => {
    setActiveAllocationForTransfer(allocation);
    onOpenChange(false);
    router.push(`${ROUTES.CENTRAL_WAREHOUSE}/transfers/new`);
  };

  const handleOpenAllocate = () => {
    onOpenChange(false);
    router.push(`${ROUTES.CENTRAL_WAREHOUSE}/allocate`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="text-primary size-5" />
            Create Transfer
          </DialogTitle>
          <DialogDescription>
            Select a completed material allocation to begin the transfer wizard.
            Inventory must be reserved before creating a transfer.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl bg-gray-100"
              />
            ))}
          </div>
        ) : readyAllocations.length > 0 ? (
          <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
            {readyAllocations.map((allocation) => (
              <AllocationOption
                key={allocation.requisitionUuid}
                allocation={allocation}
                onSelect={handleSelect}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-5 py-8 text-center">
            <p className="text-sm font-semibold text-[#1A1A1A]">
              No allocations ready for transfer
            </p>
            <p className="mt-1 text-sm text-[#64748B]">
              Complete a material allocation first, then return here to create a
              transfer.
            </p>
            <Button type="button" className="h-auto mt-4" onClick={handleOpenAllocate}>
              Go to Allocation Center
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function useCreateTransfer() {
  const router = useRouter();

  return (options?: { onMultiple?: () => void }) => {
    // Always open picker so we load live allocated requisitions from API
    if (options?.onMultiple) {
      options.onMultiple();
      return;
    }

    // Fallback: open wizard path via dialog parent — navigate to allocate if none
    void (async () => {
      try {
        const result = await warehouseService.listTransfers({
          page: 1,
          limit: 50,
          status: "READY_FOR_DISPATCH",
        });
        const ready = result.data.filter(
          (row) => !row.vehicleId || !row.driverId,
        );
        if (ready.length === 0) {
          notify.error(
            "No allocations available",
            "Complete a material allocation before creating a transfer.",
          );
          return;
        }
        if (ready.length === 1) {
          const allocation = transferToAllocation(ready[0]);
          setActiveAllocationForTransfer(allocation);
          router.push(`${ROUTES.CENTRAL_WAREHOUSE}/transfers/new`);
          return;
        }
        // Multiple — caller should pass onMultiple; open allocate otherwise
        notify.info(
          "Select an allocation",
          "Multiple allocations are ready. Open Create Transfer to choose one.",
        );
      } catch {
        notify.error(
          "Transfers unavailable",
          "Unable to load allocations ready for transfer.",
        );
      }
    })();
  };
}
