"use client";

import { Clock, MapPin, Package, Truck, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LogisticsStatusBadge } from "@/features/logistics/components/LogisticsStatusBadge";
import { formatLogisticsDateTime } from "@/mock/logistics";
import type { WarehouseShipment } from "@/types/logistics.types";

interface WarehouseShipmentDetailDrawerProps {
  shipment: WarehouseShipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignVehicle?: (shipmentId: string) => void;
  onAssignDriver?: (shipmentId: string) => void;
  onTrack?: (shipmentId: string) => void;
}

export function WarehouseShipmentDetailDrawer({
  shipment,
  open,
  onOpenChange,
  onAssignVehicle,
  onAssignDriver,
  onTrack,
}: WarehouseShipmentDetailDrawerProps) {
  if (!shipment) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-[#1A1A1A]">
            {shipment.shipmentId}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap gap-2">
            <LogisticsStatusBadge status={shipment.status} />
            <LogisticsStatusBadge status={shipment.priority} />
            {shipment.isDelayed ? (
              <LogisticsStatusBadge status="delayed" label="Delayed" />
            ) : null}
          </div>

          <div className="space-y-3 rounded-xl border border-gray-100 bg-[#F8F9FB] p-4">
            <div className="flex items-start gap-3">
              <MapPin className="text-primary mt-0.5 size-4" />
              <div>
                <p className="text-xs text-gray-400 uppercase">Route</p>
                <p className="text-sm font-medium text-[#1A1A1A]">
                  {shipment.warehouse} → {shipment.destinationHub}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="text-primary mt-0.5 size-4" />
              <div>
                <p className="text-xs text-gray-400 uppercase">Vehicle</p>
                <p className="text-sm font-medium text-[#1A1A1A]">
                  {shipment.vehicleNumber ?? "Not assigned"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="text-primary mt-0.5 size-4" />
              <div>
                <p className="text-xs text-gray-400 uppercase">Driver</p>
                <p className="text-sm font-medium text-[#1A1A1A]">
                  {shipment.driverName ?? "Not assigned"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="text-primary mt-0.5 size-4" />
              <div>
                <p className="text-xs text-gray-400 uppercase">
                  Dispatch / ETA
                </p>
                <p className="text-sm font-medium text-[#1A1A1A]">
                  {shipment.dispatchTime
                    ? formatLogisticsDateTime(shipment.dispatchTime)
                    : "Not dispatched"}{" "}
                  → {formatLogisticsDateTime(shipment.eta)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package className="text-primary mt-0.5 size-4" />
              <div>
                <p className="text-xs text-gray-400 uppercase">Created</p>
                <p className="text-sm font-medium text-[#1A1A1A]">
                  {formatLogisticsDateTime(shipment.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTrack?.(shipment.shipmentId)}
            >
              Track Shipment
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAssignVehicle?.(shipment.shipmentId)}
            >
              Assign Vehicle
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAssignDriver?.(shipment.shipmentId)}
            >
              Assign Driver
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
