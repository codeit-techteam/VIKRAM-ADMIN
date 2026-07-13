"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  DISPATCH_ASSIGNMENT_DRIVERS,
  DISPATCH_ASSIGNMENT_VEHICLES,
} from "@/mock/dispatch-logs";
import type {
  DispatchAssignmentPayload,
  DispatchLog,
} from "@/types/dispatch-log.types";

interface DispatchAssignmentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: DispatchLog | null;
  onAssign: (payload: DispatchAssignmentPayload) => void;
  updatedBy: string;
}

function toDateTimeLocalValue(iso?: string | null): string {
  if (!iso) {
    const nextHour = new Date();
    nextHour.setMinutes(0, 0, 0);
    nextHour.setHours(nextHour.getHours() + 1);
    return nextHour.toISOString().slice(0, 16);
  }

  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function DispatchAssignmentDrawer({
  open,
  onOpenChange,
  log,
  onAssign,
  updatedBy,
}: DispatchAssignmentDrawerProps) {
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [expectedDispatchTime, setExpectedDispatchTime] = useState("");
  const [remarks, setRemarks] = useState("");

  const selectedVehicle = useMemo(
    () =>
      DISPATCH_ASSIGNMENT_VEHICLES.find((vehicle) => vehicle.id === vehicleId),
    [vehicleId],
  );

  const selectedDriver = useMemo(
    () => DISPATCH_ASSIGNMENT_DRIVERS.find((driver) => driver.id === driverId),
    [driverId],
  );

  useEffect(() => {
    if (!open || !log) return;

    setVehicleId(log.vehicleId ?? "");
    setDriverId(log.driverId ?? "");
    setExpectedDispatchTime(toDateTimeLocalValue(log.dispatchTime));
    setRemarks("");
  }, [open, log]);

  const canSubmit =
    Boolean(vehicleId) &&
    Boolean(driverId) &&
    Boolean(expectedDispatchTime) &&
    log?.status === "READY_FOR_DISPATCH";

  const handleAssign = () => {
    if (!log || !selectedVehicle || !selectedDriver || !expectedDispatchTime)
      return;

    onAssign({
      vehicleId: selectedVehicle.id,
      vehicleNumber: selectedVehicle.number,
      vehicleType: selectedVehicle.type,
      driverId: selectedDriver.id,
      driverName: selectedDriver.name,
      driverMobile: selectedDriver.mobile,
      expectedDispatchTime: new Date(expectedDispatchTime).toISOString(),
      remarks: remarks.trim(),
      updatedBy,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Assign Dispatch</SheetTitle>
          <SheetDescription>
            {log
              ? `Assign vehicle and driver for ${log.orderId}`
              : "Select a dispatch record to assign."}
          </SheetDescription>
        </SheetHeader>

        {log ? (
          <div className="space-y-5 px-4 pb-4">
            <div className="rounded-lg border border-gray-100 bg-[#FAFBFC] p-4 text-sm">
              <p className="font-medium text-[#1A1A1A]">{log.customerName}</p>
              <p className="mt-1 text-[#64748B]">{log.hubName}</p>
              <p className="mt-2 font-mono text-xs text-[#94A3B8]">
                {log.dispatchId}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment-vehicle">Vehicle</Label>
              <Select
                value={vehicleId}
                onValueChange={(value) => setVehicleId(value ?? "")}
              >
                <SelectTrigger id="assignment-vehicle" className="h-10 w-full">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {DISPATCH_ASSIGNMENT_VEHICLES.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment-driver">Driver</Label>
              <Select
                value={driverId}
                onValueChange={(value) => setDriverId(value ?? "")}
              >
                <SelectTrigger id="assignment-driver" className="h-10 w-full">
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  {DISPATCH_ASSIGNMENT_DRIVERS.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment-time">Expected Dispatch Time</Label>
              <Input
                id="assignment-time"
                type="datetime-local"
                value={expectedDispatchTime}
                onChange={(event) =>
                  setExpectedDispatchTime(event.target.value)
                }
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment-remarks">Remarks</Label>
              <Textarea
                id="assignment-remarks"
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                placeholder="Optional dispatch notes..."
                rows={3}
              />
            </div>
          </div>
        ) : null}

        <SheetFooter className="border-t border-gray-100 px-4 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleAssign} disabled={!canSubmit}>
            Assign
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
