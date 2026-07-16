"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLogisticsStore } from "@/store/logistics-store";
import { notify } from "@/utils/notify";

interface AssignVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetId: string;
  targetType: "warehouse" | "customer" | "dispatch";
  onAssigned?: () => void;
}

export function AssignVehicleDialog({
  open,
  onOpenChange,
  targetId,
  targetType,
  onAssigned,
}: AssignVehicleDialogProps) {
  const vehicles = useLogisticsStore((s) => s.vehicles);
  const assignVehicleToShipment = useLogisticsStore(
    (s) => s.assignVehicleToShipment,
  );
  const assignVehicleToDispatch = useLogisticsStore(
    (s) => s.assignVehicleToDispatch,
  );

  const availableVehicles = vehicles.filter((v) => v.status === "available");

  const handleAssign = (vehicleId: string) => {
    if (targetType === "dispatch") {
      assignVehicleToDispatch(targetId, vehicleId);
    } else {
      assignVehicleToShipment(targetId, vehicleId, targetType);
    }
    notify.success("Vehicle Assigned", `${targetId} updated successfully.`);
    onOpenChange(false);
    onAssigned?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Vehicle</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-[#64748B]">
            Select an available vehicle for <strong>{targetId}</strong>
          </p>
          {availableVehicles.length === 0 ? (
            <p className="text-sm text-amber-600">No vehicles available.</p>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {availableVehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  type="button"
                  onClick={() => handleAssign(vehicle.id)}
                  className="hover:border-primary/30 flex w-full items-center justify-between rounded-lg border border-gray-100 p-3 text-left transition-colors hover:bg-orange-50/50"
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
