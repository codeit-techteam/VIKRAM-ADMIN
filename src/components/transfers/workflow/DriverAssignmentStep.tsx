"use client";

import { AlertCircle, MapPin, Search, User } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAvailableDrivers } from "@/mock/transfer-workflow";
import { formatDriverStatus } from "@/mock/transfer-fleet";
import type {
  FleetDriver,
  FleetVehicle,
  TransferWorkflowContext,
  TransferWorkflowFormValues,
} from "@/types/warehouse.types";
import { cn } from "@/lib/utils";

const DRIVER_PAGE_SIZE = 6;

interface DriverAssignmentStepProps {
  context: TransferWorkflowContext;
  form: TransferWorkflowFormValues;
  drivers: FleetDriver[];
  vehicles: FleetVehicle[];
  onSelectDriver: (driverId: string) => void;
}

function statusDotClass(status: FleetDriver["status"]): string {
  switch (status) {
    case "ready":
      return "bg-green-500";
    case "on-duty":
      return "bg-orange-500";
    case "leave":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
}

export function DriverAssignmentStep({
  context,
  form,
  drivers,
  vehicles,
  onSelectDriver,
}: DriverAssignmentStepProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const availableDrivers = useMemo(
    () => getAvailableDrivers(drivers),
    [drivers],
  );

  const filteredDrivers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return availableDrivers;

    return availableDrivers.filter(
      (driver) =>
        driver.name.toLowerCase().includes(query) ||
        driver.employeeId.toLowerCase().includes(query) ||
        driver.licenseType.toLowerCase().includes(query),
    );
  }, [availableDrivers, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDrivers.length / DRIVER_PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const pageDrivers = filteredDrivers.slice(
    (safePage - 1) * DRIVER_PAGE_SIZE,
    safePage * DRIVER_PAGE_SIZE,
  );

  const selectedDriver = drivers.find((driver) => driver.id === form.driverId);
  const selectedVehicle = vehicles.find(
    (vehicle) => vehicle.id === form.vehicleId,
  );

  const etaLabel = useMemo(() => {
    const eta = new Date(form.expectedArrival);
    eta.setHours(18, 30, 0, 0);
    const today = new Date();
    const isToday = eta.toDateString() === today.toDateString();
    const time = eta.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return isToday ? `Today, ${time}` : `${form.expectedArrival}, ${time}`;
  }, [form.expectedArrival]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="font-bold text-[#1A1A1A]">Assign Driver</h3>
          <p className="mt-0.5 text-sm text-[#64748B]">
            Select an available driver for the scheduled transfer to{" "}
            {context.destinationHub}.
          </p>

          <div className="relative mt-4 max-w-md">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name, EMP ID, or License type..."
              className="pl-9"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead className="w-10" />
              <TableHead>Driver</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>License Type</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageDrivers.map((driver) => {
              const isSelected = form.driverId === driver.id;
              return (
                <TableRow
                  key={driver.id}
                  className={cn("cursor-pointer", isSelected && "bg-primary/5")}
                  onClick={() => onSelectDriver(driver.id)}
                >
                  <TableCell>
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => onSelectDriver(driver.id)}
                      className="accent-primary size-4"
                      aria-label={`Select ${driver.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full text-xs font-bold">
                        {driver.avatarInitials ??
                          driver.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#1A1A1A]">
                          {driver.name}
                        </p>
                        {driver.phone ? (
                          <p className="text-xs text-[#64748B]">
                            {driver.phone}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#64748B]">
                    {driver.employeeId}
                  </TableCell>
                  <TableCell className="text-[#64748B]">
                    {driver.licenseType}
                  </TableCell>
                  <TableCell>{driver.experienceYears} Yrs</TableCell>
                  <TableCell>
                    <span className="font-semibold text-[#1A1A1A]">
                      {driver.rating.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A]">
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          statusDotClass(driver.status),
                        )}
                      />
                      {formatDriverStatus(driver.status)}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
          <p className="text-xs text-[#64748B]">
            Showing {pageDrivers.length} of {filteredDrivers.length} drivers
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

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
          <User className="text-primary size-5" />
          <h3 className="font-bold text-[#1A1A1A]">Transfer Summary</h3>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Pickup
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#1A1A1A]">
              <MapPin className="text-primary size-3.5" />
              {context.sourceWarehouse}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Drop-off
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#1A1A1A]">
              <MapPin className="size-3.5 text-gray-400" />
              {context.destinationHub}
            </p>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Selected Vehicle
            </p>
            <p className="mt-1 font-bold text-[#1A1A1A]">
              {selectedVehicle?.vehicleNumber ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Assigned Driver
            </p>
            <p className="text-primary mt-1 font-bold">
              {selectedDriver?.name ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
              Estimated ETA
            </p>
            <p className="mt-1 font-bold text-[#1A1A1A]">{etaLabel}</p>
          </div>

          {selectedDriver ? (
            <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50/80 p-3">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-blue-600" />
              <p className="text-xs leading-relaxed text-blue-800">
                The driver has indicated readiness. High-priority transfer
                scheduled for night transit.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
