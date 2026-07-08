"use client";

import { CheckCircle2, Clock, Info, Search, Truck } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  estimateTripTimeHours,
  getAvailableVehicles,
} from "@/mock/transfer-workflow";
import { formatAvailability, formatVehicleStatus } from "@/mock/transfer-fleet";
import type {
  FleetVehicle,
  TransferWorkflowContext,
  TransferWorkflowFormValues,
} from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

const VEHICLE_PAGE_SIZE = 5;

interface VehicleAssignmentStepProps {
  context: TransferWorkflowContext;
  form: TransferWorkflowFormValues;
  vehicles: FleetVehicle[];
  onSelectVehicle: (vehicleId: string) => void;
}

export function VehicleAssignmentStep({
  context,
  form,
  vehicles,
  onSelectVehicle,
}: VehicleAssignmentStepProps) {
  const [search, setSearch] = useState("");
  const [vehicleType, setVehicleType] = useState("all");
  const [minCapacity, setMinCapacity] = useState("all");
  const [page, setPage] = useState(1);

  const availableVehicles = useMemo(
    () => getAvailableVehicles(vehicles),
    [vehicles],
  );

  const vehicleTypes = useMemo(
    () => [...new Set(availableVehicles.map((v) => v.vehicleType))],
    [availableVehicles],
  );

  const filteredVehicles = useMemo(() => {
    return availableVehicles.filter((vehicle) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        vehicle.vehicleNumber.toLowerCase().includes(query) ||
        vehicle.location.toLowerCase().includes(query);

      const matchesType =
        vehicleType === "all" || vehicle.vehicleType === vehicleType;

      const matchesCapacity =
        minCapacity === "all" ||
        vehicle.capacityKg >= Number.parseInt(minCapacity, 10);

      return matchesSearch && matchesType && matchesCapacity;
    });
  }, [availableVehicles, search, vehicleType, minCapacity]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredVehicles.length / VEHICLE_PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const pageVehicles = filteredVehicles.slice(
    (safePage - 1) * VEHICLE_PAGE_SIZE,
    safePage * VEHICLE_PAGE_SIZE,
  );

  const selectedVehicle = vehicles.find(
    (vehicle) => vehicle.id === form.vehicleId,
  );
  const requiredWeight = context.estimatedWeightKg;
  const selectedCapacity = selectedVehicle?.capacityKg ?? 0;
  const remainingCapacity = Math.max(0, selectedCapacity - requiredWeight);
  const meetsCapacity = selectedCapacity >= requiredWeight;
  const tripHours = estimateTripTimeHours(
    context.sourceWarehouse,
    context.destinationHub,
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="font-bold text-[#1A1A1A]">Assign Vehicle</h3>
              <p className="mt-0.5 text-sm text-[#64748B]">
                Select an available vehicle for this transfer.
              </p>
            </div>
            {meetsCapacity && selectedVehicle ? (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                <CheckCircle2 className="size-3.5" />
                Vehicle capacity meets load requirements
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search vehicle no., location..."
                className="pl-9"
              />
            </div>
            <Select
              value={vehicleType}
              onValueChange={(value) => {
                if (value) setVehicleType(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full lg:w-[160px]">
                <SelectValue placeholder="Vehicle Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Vehicle Type</SelectItem>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={minCapacity}
              onValueChange={(value) => {
                if (value) setMinCapacity(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full lg:w-[160px]">
                <SelectValue placeholder="Min Capacity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Min Capacity (KG)</SelectItem>
                <SelectItem value="6000">6,000+ KG</SelectItem>
                <SelectItem value="8000">8,000+ KG</SelectItem>
                <SelectItem value="10000">10,000+ KG</SelectItem>
                <SelectItem value="12000">12,000+ KG</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead className="w-10" />
              <TableHead>Vehicle Number</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Current Location</TableHead>
              <TableHead>Availability</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageVehicles.map((vehicle) => {
              const isSelected = form.vehicleId === vehicle.id;
              return (
                <TableRow
                  key={vehicle.id}
                  className={cn("cursor-pointer", isSelected && "bg-primary/5")}
                  onClick={() => onSelectVehicle(vehicle.id)}
                >
                  <TableCell>
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => onSelectVehicle(vehicle.id)}
                      className="accent-primary size-4"
                      aria-label={`Select ${vehicle.vehicleNumber}`}
                    />
                  </TableCell>
                  <TableCell className="font-semibold">
                    {vehicle.vehicleNumber}
                  </TableCell>
                  <TableCell className="text-[#64748B]">
                    {vehicle.vehicleType}
                  </TableCell>
                  <TableCell>
                    {vehicle.capacityKg.toLocaleString("en-IN")} KG
                  </TableCell>
                  <TableCell className="text-[#64748B]">
                    {vehicle.location}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-semibold",
                        vehicle.availability === "now"
                          ? "text-green-700"
                          : "text-orange-600",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          vehicle.availability === "now"
                            ? "bg-green-500"
                            : "bg-orange-500",
                        )}
                      />
                      {formatAvailability(vehicle.availability)}
                    </span>
                    <p className="mt-0.5 text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
                      {formatVehicleStatus(vehicle.status)}
                    </p>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
          <p className="text-xs text-[#64748B]">
            Showing {(safePage - 1) * VEHICLE_PAGE_SIZE + 1}-
            {Math.min(safePage * VEHICLE_PAGE_SIZE, filteredVehicles.length)} of{" "}
            {filteredVehicles.length} vehicles
          </p>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <Button
                  key={pageNumber}
                  type="button"
                  variant={pageNumber === safePage ? "default" : "ghost"}
                  size="sm"
                  className="size-8"
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
            <Truck className="text-primary size-5" />
            <h3 className="font-bold text-[#1A1A1A]">Assignment Summary</h3>
          </div>
          <div className="space-y-4 p-5">
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Required Load
              </p>
              <div className="bg-primary/10 mt-2 rounded-lg px-3 py-2">
                <p className="text-primary text-lg font-bold">
                  {requiredWeight.toLocaleString("en-IN")} KG
                </p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Selected Capacity
              </p>
              <p className="mt-1 text-lg font-bold text-[#1A1A1A]">
                {selectedCapacity > 0
                  ? `${selectedCapacity.toLocaleString("en-IN")} KG`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                Remaining Capacity
              </p>
              <div
                className={cn(
                  "mt-2 rounded-lg px-3 py-2",
                  meetsCapacity ? "bg-green-50" : "bg-orange-50",
                )}
              >
                <p
                  className={cn(
                    "text-lg font-bold",
                    meetsCapacity ? "text-green-700" : "text-orange-600",
                  )}
                >
                  {selectedVehicle
                    ? `${remainingCapacity.toLocaleString("en-IN")} KG`
                    : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="text-primary size-4" />
              <span className="text-[#64748B]">Est. Trip Time:</span>
              <span className="font-bold text-[#1A1A1A]">
                {tripHours} Hours
              </span>
            </div>
          </div>
        </div>

        {selectedVehicle ? (
          <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/80 p-4">
            <Info className="text-primary mt-0.5 size-4 shrink-0" />
            <p className="text-xs leading-relaxed text-blue-900">
              Selecting {selectedVehicle.vehicleNumber}. This vehicle is
              currently at {selectedVehicle.location} and is the optimal choice
              for the current load.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
