"use client";

import { useEffect, useMemo, useState } from "react";

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
import { driversService } from "@/services/drivers.service";
import { vehiclesService } from "@/services/vehicles.service";
import type { FleetDriver, FleetVehicle } from "@/types/warehouse.types";
import { cn } from "@/lib/utils";
import { notify } from "@/utils/notify";

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

function mapVehicleStatus(
  status: string,
): FleetVehicle["status"] {
  switch (status) {
    case "available":
      return "idle";
    case "assigned":
    case "loading":
      return "assigned";
    case "running":
      return "in-transit";
    case "maintenance":
      return "maintenance";
    default:
      return "idle";
  }
}

function mapDriverStatus(status: string): FleetDriver["status"] {
  switch (status) {
    case "available":
      return "ready";
    case "driving":
      return "on-duty";
    case "on_leave":
      return "leave";
    default:
      return "ready";
  }
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
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [drivers, setDrivers] = useState<FleetDriver[]>([]);

  useEffect(() => {
    if (!open) return;
    let active = true;

    const load = async () => {
      setIsLoading(true);
      try {
        if (mode === "vehicle") {
          const result = await vehiclesService.list({ page: 1, limit: 100 });
          if (!active) return;
          setVehicles(
            result.vehicles
              .filter((v) => v.status === "available" || v.status === "assigned")
              .map((v) => ({
                id: v.id,
                vehicleNumber: v.vehicleNumber,
                vehicleType: v.vehicleType || "Truck",
                capacityKg: v.capacityKg || 0,
                location: v.assignedWarehouse || v.assignedHub || "Central Warehouse",
                availability: "now" as const,
                status: mapVehicleStatus(v.status),
                hubId: undefined,
              })),
          );
        } else {
          const result = await driversService.list({ page: 1, limit: 100 });
          if (!active) return;
          setDrivers(
            result.drivers
              .filter((d) => d.status === "available" || d.status === "driving")
              .map((d) => ({
                id: d.id,
                name: d.name,
                employeeId: d.employeeId || d.id.slice(0, 8).toUpperCase(),
                licenseType: d.licenseType || "LMV",
                experienceYears: 0,
                rating: 4.5,
                status: mapDriverStatus(d.status),
                phone: d.mobile,
                avatarInitials: d.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase(),
                hubId: d.hubId,
              })),
          );
        }
      } catch {
        if (active) {
          notify.error(
            "Fleet unavailable",
            mode === "vehicle"
              ? "Unable to load vehicles from backend."
              : "Unable to load drivers from backend.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [open, mode]);

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
          {isLoading ? (
            <p className="p-6 text-sm text-[#64748B]">Loading fleet…</p>
          ) : mode === "vehicle" ? (
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
                {filteredVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-sm text-[#64748B]">
                      No available vehicles found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVehicles.map((vehicle) => {
                    const insufficient =
                      estimatedWeightKg > 0 &&
                      vehicle.capacityKg > 0 &&
                      vehicle.capacityKg < estimatedWeightKg;
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
                  })
                )}
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
                {filteredDrivers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-sm text-[#64748B]">
                      No available drivers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDrivers.map((driver) => (
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
                  ))
                )}
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
