"use client";

import { MapPin, Search, Truck, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogisticsTimeline } from "@/features/logistics/components/LogisticsTimeline";
import { LogisticsStatusBadge } from "@/features/logistics/components/LogisticsStatusBadge";
import { useShipmentTracking } from "@/features/logistics/hooks/use-logistics";
import { formatLogisticsDateTime } from "@/features/logistics/utils/logistics-formatters";

export function ShipmentTrackingPage() {
  const searchParams = useSearchParams();
  const urlId = searchParams.get("id") ?? "";

  const [searchQuery, setSearchQuery] = useState(urlId);
  const [activeShipmentId, setActiveShipmentId] = useState(urlId);

  useEffect(() => {
    const id = searchParams.get("id") ?? "";
    if (!id) return;
    setSearchQuery(id);
    setActiveShipmentId(id);
  }, [searchParams]);

  const { data: timeline, isLoading, isError, isFetching } = useShipmentTracking(
    activeShipmentId,
    Boolean(activeShipmentId),
  );

  const handleSearch = () => {
    const next = searchQuery.trim();
    if (next) {
      setActiveShipmentId(next);
    }
  };

  const showLoading =
    Boolean(activeShipmentId) && (isLoading || isFetching) && !timeline;
  const showEmpty = !showLoading && (!activeShipmentId || isError || !timeline);
  const resolvedTimeline = !showLoading && !showEmpty ? timeline : null;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-100 bg-[#F8F9FB] p-4 shadow-sm">
        <label className="mb-1.5 block text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
          Search Shipment ID
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="TRN-... or BJW-... / DSP-..."
              className="h-10 border-gray-200 bg-white pl-9"
            />
          </div>
          <Button onClick={handleSearch}>Track</Button>
        </div>
      </div>

      {showLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-xl bg-gray-100" />
          <div className="h-96 animate-pulse rounded-xl bg-gray-100" />
        </div>
      ) : !resolvedTimeline ? (
        <EmptyState
          title="Shipment not found."
          description={
            activeShipmentId
              ? `No shipment found for ID "${activeShipmentId}". Try another ID.`
              : "Enter a shipment or dispatch ID to track."
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#1A1A1A]">
                Shipment Timeline
              </h2>
              <LogisticsStatusBadge
                status={
                  resolvedTimeline.status ??
                  (resolvedTimeline.shipmentType === "warehouse_transfer"
                    ? "in_transit"
                    : "out_for_delivery")
                }
                label={
                  resolvedTimeline.shipmentType === "warehouse_transfer"
                    ? "Warehouse Transfer"
                    : "Customer Delivery"
                }
              />
            </div>
            <LogisticsTimeline timeline={resolvedTimeline} />
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-[#1A1A1A]">
                Shipment Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="text-primary mt-0.5 size-4" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Route</p>
                    <p className="text-sm font-medium">
                      {resolvedTimeline.source} → {resolvedTimeline.destination}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck className="text-primary mt-0.5 size-4" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase">
                      Current Vehicle
                    </p>
                    <p className="text-sm font-medium">
                      {resolvedTimeline.vehicleNumber ?? "Not assigned"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="text-primary mt-0.5 size-4" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Driver</p>
                    <p className="text-sm font-medium">
                      {resolvedTimeline.driverName ?? "Not assigned"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-[#1A1A1A]">
                ETA & Status
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase">
                    Estimated Arrival
                  </p>
                  <p className="text-sm font-medium">
                    {formatLogisticsDateTime(resolvedTimeline.eta)}
                  </p>
                </div>
                {resolvedTimeline.delayMinutes > 0 ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-sm font-medium text-red-700">
                      Delay: {resolvedTimeline.delayMinutes} minutes
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-sm font-medium text-emerald-700">
                      On schedule
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 uppercase">Remarks</p>
                  <p className="text-sm text-[#64748B]">
                    {resolvedTimeline.remarks}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
