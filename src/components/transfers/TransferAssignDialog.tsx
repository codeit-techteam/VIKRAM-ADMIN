"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FLEET_DRIVERS,
  FLEET_VEHICLES,
  getAvailableDrivers,
  getAvailableVehicles,
} from "@/mock/transfer-fleet";
import type { FleetDriver, FleetVehicle } from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

type AssignMode = "vehicle" | "driver";

interface TransferAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: AssignMode;
  transferId: string;
  estimatedWeightKg?: number;
  onAssignVehicle: (vehicle: FleetVehicle) => void;
  onAssignDriver: (driver: FleetDriver) => void;
}

export function TransferAssignDialog({
  open,
  onOpenChange,
  mode,
  transferId,
  estimatedWeightKg = 0,
  onAssignVehicle,
  onAssignDriver,
}: TransferAssignDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const vehicles = useMemo(() => getAvailableVehicles(FLEET_VEHICLES), []);
  const drivers = useMemo(() => getAvailableDrivers(FLEET_DRIVERS), []);

  const filteredVehicles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return vehicles;
    return vehicles.filter(
      (v) =>
        v.vehicleNumber.toLowerCase().includes(query) ||
        v.vehicleType.toLowerCase().includes(query),
    );
  }, [search, vehicles]);

  const filteredDrivers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return drivers;
    return drivers.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.employeeId.toLowerCase().includes(query),
    );
  }, [search, drivers]);

  const handleConfirm = () => {
    if (!selectedId) return;

    if (mode === "vehicle") {
      const vehicle = vehicles.find((v) => v.id === selectedId);
      if (vehicle) {
        onAssignVehicle(vehicle);
        onOpenChange(false);
        setSelectedId(null);
        setSearch("");
      }
    } else {
      const driver = drivers.find((d) => d.id === selectedId);
      if (driver) {
        onAssignDriver(driver);
        onOpenChange(false);
        setSelectedId(null);
        setSearch("");
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setSelectedId(null);
          setSearch("");
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "vehicle" ? "Assign Vehicle" : "Assign Driver"}
          </DialogTitle>
          <DialogDescription>
            {mode === "vehicle"
              ? `Select a fleet vehicle for ${transferId}. Minimum capacity: ${estimatedWeightKg.toLocaleString("en-IN")} kg.`
              : `Select a driver for ${transferId}.`}
          </DialogDescription>
        </DialogHeader>

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            mode === "vehicle"
              ? "Search by vehicle number or type..."
              : "Search by driver name or ID..."
          }
          className="h-10"
        />

        <div className="max-h-[320px] overflow-y-auto rounded-lg border border-gray-100">
          {mode === "vehicle" ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => {
                  const insufficient = vehicle.capacityKg < estimatedWeightKg;
                  return (
                    <TableRow
                      key={vehicle.id}
                      className={cn(
                        "cursor-pointer",
                        selectedId === vehicle.id && "bg-orange-50",
                        insufficient && "opacity-50",
                      )}
                      onClick={() => {
                        if (!insufficient) setSelectedId(vehicle.id);
                      }}
                    >
                      <TableCell className="font-semibold">
                        {vehicle.vehicleNumber}
                      </TableCell>
                      <TableCell>{vehicle.vehicleType}</TableCell>
                      <TableCell>
                        {vehicle.capacityKg.toLocaleString("en-IN")} kg
                      </TableCell>
                      <TableCell className="text-[#64748B]">
                        {vehicle.location}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Driver</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => (
                  <TableRow
                    key={driver.id}
                    className={cn(
                      "cursor-pointer",
                      selectedId === driver.id && "bg-orange-50",
                    )}
                    onClick={() => setSelectedId(driver.id)}
                  >
                    <TableCell className="font-semibold">
                      {driver.name}
                    </TableCell>
                    <TableCell>{driver.employeeId}</TableCell>
                    <TableCell>{driver.licenseType}</TableCell>
                    <TableCell>{driver.rating.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" disabled={!selectedId} onClick={handleConfirm}>
            Confirm Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
