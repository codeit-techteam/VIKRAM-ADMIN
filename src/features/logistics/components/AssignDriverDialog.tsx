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

interface AssignDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetId: string;
  targetType: "warehouse" | "customer" | "dispatch";
  onAssigned?: () => void;
}

export function AssignDriverDialog({
  open,
  onOpenChange,
  targetId,
  targetType,
  onAssigned,
}: AssignDriverDialogProps) {
  const drivers = useLogisticsStore((s) => s.drivers);
  const assignDriverToShipment = useLogisticsStore(
    (s) => s.assignDriverToShipment,
  );
  const assignDriverToDispatch = useLogisticsStore(
    (s) => s.assignDriverToDispatch,
  );

  const availableDrivers = drivers.filter(
    (d) => d.status === "available" || d.status === "driving",
  );

  const handleAssign = (driverId: string) => {
    if (targetType === "dispatch") {
      assignDriverToDispatch(targetId, driverId);
    } else {
      assignDriverToShipment(targetId, driverId, targetType);
    }
    notify.success("Driver Assigned", `${targetId} updated successfully.`);
    onOpenChange(false);
    onAssigned?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Driver</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-[#64748B]">
            Select a driver for <strong>{targetId}</strong>
          </p>
          {availableDrivers.length === 0 ? (
            <p className="text-sm text-amber-600">No drivers available.</p>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {availableDrivers.map((driver) => (
                <button
                  key={driver.id}
                  type="button"
                  onClick={() => handleAssign(driver.id)}
                  className="hover:border-primary/30 flex w-full items-center justify-between rounded-lg border border-gray-100 p-3 text-left transition-colors hover:bg-orange-50/50"
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
