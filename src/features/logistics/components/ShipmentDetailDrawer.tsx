"use client";

import { AlertTriangle, MapPin, Truck, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LogisticsStatusBadge } from "@/features/logistics/components/LogisticsStatusBadge";
import { formatLogisticsDateTime, getIssueLabel } from "@/mock/logistics";
import type { CriticalShipment } from "@/types/logistics.types";

interface ShipmentDetailDrawerProps {
  shipment: CriticalShipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignVehicle?: (shipmentId: string) => void;
  onAssignDriver?: (shipmentId: string) => void;
  onApproveDocuments?: (shipmentId: string) => void;
}

export function ShipmentDetailDrawer({
  shipment,
  open,
  onOpenChange,
  onAssignVehicle,
  onAssignDriver,
  onApproveDocuments,
}: ShipmentDetailDrawerProps) {
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
            <LogisticsStatusBadge
              status={
                shipment.shipmentType === "warehouse_transfer"
                  ? "in_transit"
                  : "out_for_delivery"
              }
              label={
                shipment.shipmentType === "warehouse_transfer"
                  ? "Warehouse Transfer"
                  : "Customer Delivery"
              }
            />
          </div>

          <div className="space-y-3 rounded-xl border border-gray-100 bg-[#F8F9FB] p-4">
            <div className="flex items-start gap-3">
              <MapPin className="text-primary mt-0.5 size-4" />
              <div>
                <p className="text-xs text-gray-400 uppercase">Route</p>
                <p className="text-sm font-medium text-[#1A1A1A]">
                  {shipment.source} → {shipment.destination}
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
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
              ETA
            </p>
            <p className="mt-1 text-sm font-medium text-[#1A1A1A]">
              {formatLogisticsDateTime(shipment.eta)}
            </p>
          </div>

          {shipment.issue !== "none" ? (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <AlertTriangle className="size-4 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Issue Reported
                </p>
                <p className="text-xs text-amber-700">
                  {getIssueLabel(shipment.issue)}
                </p>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
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
            {shipment.issue === "document_missing" ? (
              <Button
                size="sm"
                onClick={() => onApproveDocuments?.(shipment.shipmentId)}
              >
                Approve Documents
              </Button>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
