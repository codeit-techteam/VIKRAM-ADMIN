"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAssignOrderDriver,
  useAssignWarehouseLogistics,
} from "@/features/logistics/hooks/use-logistics";
import { useVehicles } from "@/features/logistics/hooks/use-vehicles";
import { notify } from "@/utils/notify";

interface AssignVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Database UUID of requisition/order */
  targetId: string;
  /** Human-readable label for UI */
  targetLabel?: string;
  targetType: "warehouse" | "customer" | "dispatch";
  /** Optional paired driver for customer assign */
  driverId?: string | null;
  onAssigned?: () => void;
}

export function AssignVehicleDialog({
  open,
  onOpenChange,
  targetId,
  targetLabel,
  targetType,
  driverId,
  onAssigned,
}: AssignVehicleDialogProps) {
  const { data: vehiclesData, isLoading } = useVehicles({
    page: 1,
    limit: 50,
    status: "AVAILABLE",
  });
  const assignWarehouse = useAssignWarehouseLogistics();
  const assignOrder = useAssignOrderDriver();

  const availableVehicles = vehiclesData?.vehicles ?? [];
  const busy =
    assignWarehouse.isPending || assignOrder.isPending;

  const handleAssign = async (vehicleId: string) => {
    try {
      if (targetType === "warehouse") {
        await assignWarehouse.mutateAsync({
          requisitionId: targetId,
          vehicleId,
        });
      } else if (targetType === "dispatch") {
        // Dispatch board may be warehouse transfer or customer order.
        // Prefer warehouse assign-logistics; if a driver is already known, treat as order.
        if (driverId) {
          await assignOrder.mutateAsync({
            orderId: targetId,
            driverId,
            vehicleId,
          });
        } else {
          await assignWarehouse.mutateAsync({
            requisitionId: targetId,
            vehicleId,
          });
        }
      } else {
        if (!driverId) {
          notify.error(
            "Driver required",
            "Assign a driver before or with the vehicle.",
          );
          return;
        }
        await assignOrder.mutateAsync({
          orderId: targetId,
          driverId,
          vehicleId,
        });
      }
      notify.success(
        "Vehicle Assigned",
        `${targetLabel ?? targetId} updated successfully.`,
      );
      onOpenChange(false);
      onAssigned?.();
    } catch (err) {
      notify.error(
        "Assignment failed",
        err instanceof Error ? err.message : "Could not assign vehicle",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Vehicle</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-[#64748B]">
            Select an available vehicle for{" "}
            <strong>{targetLabel ?? targetId}</strong>
          </p>
          {isLoading ? (
            <p className="text-sm text-[#64748B]">Loading vehicles…</p>
          ) : availableVehicles.length === 0 ? (
            <p className="text-sm text-amber-600">No vehicles available.</p>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {availableVehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  type="button"
                  disabled={busy}
                  onClick={() => void handleAssign(vehicle.id)}
                  className="hover:border-primary/30 flex w-full items-center justify-between rounded-lg border border-gray-100 p-3 text-left transition-colors hover:bg-orange-50/50 disabled:opacity-50"
                >
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {vehicle.vehicleNumber}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {vehicle.vehicleType} · {vehicle.capacityKg / 1000}T
                    </p>
                  </div>
                  <span className="text-xs text-emerald-600 capitalize">
                    {vehicle.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
