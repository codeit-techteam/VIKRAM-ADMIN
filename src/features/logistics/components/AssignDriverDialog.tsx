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
import { useDrivers } from "@/features/logistics/hooks/use-drivers";
import { notify } from "@/utils/notify";

interface AssignDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Database UUID of requisition/order */
  targetId: string;
  targetLabel?: string;
  targetType: "warehouse" | "customer" | "dispatch";
  /** Optional paired vehicle for customer assign */
  vehicleId?: string | null;
  onAssigned?: () => void;
}

export function AssignDriverDialog({
  open,
  onOpenChange,
  targetId,
  targetLabel,
  targetType,
  vehicleId,
  onAssigned,
}: AssignDriverDialogProps) {
  const { data: driversData, isLoading } = useDrivers({
    page: 1,
    limit: 50,
    status: "AVAILABLE",
  });
  const assignWarehouse = useAssignWarehouseLogistics();
  const assignOrder = useAssignOrderDriver();

  const availableDrivers = driversData?.drivers ?? [];
  const busy = assignWarehouse.isPending || assignOrder.isPending;

  const handleAssign = async (driverId: string) => {
    try {
      if (targetType === "warehouse") {
        await assignWarehouse.mutateAsync({
          requisitionId: targetId,
          driverId,
        });
      } else {
        await assignOrder.mutateAsync({
          orderId: targetId,
          driverId,
          vehicleId: vehicleId ?? undefined,
        });
      }
      notify.success(
        "Driver Assigned",
        `${targetLabel ?? targetId} updated successfully.`,
      );
      onOpenChange(false);
      onAssigned?.();
    } catch (err) {
      notify.error(
        "Assignment failed",
        err instanceof Error ? err.message : "Could not assign driver",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Driver</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-[#64748B]">
            Select a driver for <strong>{targetLabel ?? targetId}</strong>
          </p>
          {isLoading ? (
            <p className="text-sm text-[#64748B]">Loading drivers…</p>
          ) : availableDrivers.length === 0 ? (
            <p className="text-sm text-amber-600">No drivers available.</p>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {availableDrivers.map((driver) => (
                <button
                  key={driver.id}
                  type="button"
                  disabled={busy}
                  onClick={() => void handleAssign(driver.id)}
                  className="hover:border-primary/30 flex w-full items-center justify-between rounded-lg border border-gray-100 p-3 text-left transition-colors hover:bg-orange-50/50 disabled:opacity-50"
                >
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {driver.name}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {driver.employeeId} · {driver.mobile}
                    </p>
                  </div>
                  <span className="text-xs text-emerald-600 capitalize">
                    {driver.status.replace("_", " ")}
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
