"use client";

import {
  FileText,
  Fuel,
  MapPin,
  Shield,
  Truck,
  User,
  Wrench,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FleetTimeline } from "@/features/logistics/components/shared/FleetTimeline";
import { LogisticsStatusBadge } from "@/features/logistics/components/LogisticsStatusBadge";
import { formatLogisticsDate } from "@/mock/logistics";
import type { LogisticsVehicle } from "@/types/logistics.types";

interface VehicleDetailDrawerProps {
  vehicle: LogisticsVehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-xs text-gray-400 uppercase">{label}</span>
      <span className="text-right text-sm font-medium text-[#1A1A1A]">
        {value ?? "—"}
      </span>
    </div>
  );
}

export function VehicleDetailDrawer({
  vehicle,
  open,
  onOpenChange,
}: VehicleDetailDrawerProps) {
  if (!vehicle) return null;

  const documents = [
    { label: "RC", doc: vehicle.documents?.rc },
    { label: "Insurance", doc: vehicle.documents?.insurance },
    { label: "Fitness", doc: vehicle.documents?.fitness },
  ].filter((d) => d.doc);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-[#1A1A1A]">
            {vehicle.vehicleNumber}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 flex size-16 items-center justify-center rounded-xl">
              <Truck className="text-primary size-8" />
            </div>
            <div>
              <p className="text-lg font-semibold text-[#1A1A1A]">
                {vehicle.vehicleType}
              </p>
              <LogisticsStatusBadge status={vehicle.status} />
            </div>
          </div>

          <div className="space-y-1 rounded-xl border border-gray-100 bg-[#F8F9FB] p-4">
            <div className="flex items-start gap-3 border-b border-gray-100 pb-3">
              <User className="text-primary mt-0.5 size-4" />
              <div className="flex-1">
                <DetailRow
                  label="Driver"
                  value={vehicle.assignedDriverName ?? "Unassigned"}
                />
              </div>
            </div>
            <div className="flex items-start gap-3 border-b border-gray-100 py-3">
              <MapPin className="text-primary mt-0.5 size-4" />
              <div className="flex-1 space-y-1">
                <DetailRow
                  label="Warehouse"
                  value={vehicle.assignedWarehouse}
                />
                <DetailRow label="Hub" value={vehicle.assignedHub} />
              </div>
            </div>
            <div className="flex items-start gap-3 pt-3">
              <Fuel className="text-primary mt-0.5 size-4" />
              <div className="flex-1 space-y-1">
                <DetailRow
                  label="Capacity"
                  value={
                    vehicle.capacityLabel ??
                    `${(vehicle.capacityKg / 1000).toFixed(1)} Ton`
                  }
                />
                <DetailRow label="Fuel" value={vehicle.fuelType} />
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Compliance
            </p>
            <div className="rounded-xl border border-gray-100 p-4">
              <DetailRow
                label="Insurance"
                value={formatLogisticsDate(vehicle.insuranceExpiry)}
              />
              <DetailRow
                label="Fitness"
                value={formatLogisticsDate(vehicle.fitnessExpiry)}
              />
              {vehicle.pollutionExpiry ? (
                <DetailRow
                  label="Pollution"
                  value={formatLogisticsDate(vehicle.pollutionExpiry)}
                />
              ) : null}
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Operations
            </p>
            <div className="rounded-xl border border-gray-100 p-4">
              <DetailRow
                label="Last Maintenance"
                value={
                  vehicle.lastMaintenanceDate
                    ? formatLogisticsDate(vehicle.lastMaintenanceDate)
                    : "No record"
                }
              />
              <DetailRow
                label="Current Shipment"
                value={vehicle.currentShipmentId ?? "None"}
              />
              {vehicle.currentOdometer ? (
                <DetailRow
                  label="Odometer"
                  value={`${vehicle.currentOdometer.toLocaleString("en-IN")} KM`}
                />
              ) : null}
              {vehicle.gpsInstalled !== undefined ? (
                <DetailRow
                  label="GPS"
                  value={vehicle.gpsInstalled ? "Installed" : "Not installed"}
                />
              ) : null}
            </div>
          </div>

          {documents.length > 0 ? (
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                <FileText className="size-3.5" />
                Documents
              </p>
              <div className="space-y-2">
                {documents.map((d) => (
                  <div
                    key={d.label}
                    className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
                  >
                    <Shield className="text-primary size-4" />
                    <div>
                      <p className="text-sm font-medium">{d.label}</p>
                      <p className="text-xs text-gray-400">{d.doc?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {vehicle.timeline && vehicle.timeline.length > 0 ? (
            <div>
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                <Wrench className="size-3.5" />
                Timeline
              </p>
              <FleetTimeline events={vehicle.timeline} />
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
